import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Check, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api-client';

interface ApiIntegration {
  id: string;
  type: 'home_assistant' | 'paperless' | 'actual_budget' | 'custom';
  name: string;
  apiUrl: string;
  enabled: boolean;
  lastSync?: string;
}

interface IntegrationFormData {
  name: string;
  type: ApiIntegration['type'];
  apiUrl: string;
  apiKey: string;
  config: Record<string, unknown>;
}

const typeLabels: Record<ApiIntegration['type'], string> = {
  home_assistant: 'Home Assistant',
  paperless: 'Paperless-ngx',
  actual_budget: 'Actual Budget',
  custom: 'Custom API',
};

const typePlaceholders: Record<ApiIntegration['type'], string> = {
  home_assistant: 'http://homeassistant.local:8123',
  paperless: 'http://paperless.local:8000',
  actual_budget: 'http://actual.local:5006',
  custom: 'https://api.example.com',
};

export const ApiIntegrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<IntegrationFormData>({
    name: '',
    type: 'custom',
    apiUrl: '',
    apiKey: '',
    config: {},
  });
  const [saving, setSaving] = useState(false);

  const loadIntegrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await api.integrations.list();
      setIntegrations(
        list.map((item: any) => ({
          id: item.id,
          type: item.type as ApiIntegration['type'],
          name: typeLabels[item.type] || item.type,
          apiUrl: item.api_url,
          enabled: item.enabled,
          lastSync: item.last_sync,
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  const handleAdd = async () => {
    if (!formData.name || !formData.apiUrl) return;

    try {
      setSaving(true);
      await api.integrations.create({
        type: formData.type,
        api_url: formData.apiUrl,
        api_key: formData.apiKey,
        config: formData.config,
      });
      setShowAddModal(false);
      setFormData({ name: '', type: 'custom', apiUrl: '', apiKey: '', config: {} });
      await loadIntegrations();
    } catch (err: any) {
      setError(err.message || 'Failed to add integration');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    try {
      await api.integrations.update(id, { enabled: !currentEnabled });
      await loadIntegrations();
    } catch (err: any) {
      setError(err.message || 'Failed to update integration');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.integrations.delete(id);
      await loadIntegrations();
    } catch (err: any) {
      setError(err.message || 'Failed to delete integration');
    }
  };

  const selectedType = formData.type;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            ✕
          </button>
        </div>
      )}

      <button
        onClick={() => setShowAddModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 mb-4"
      >
        <Plus className="w-4 h-4" />
        Add Integration
      </button>

      {integrations.length > 0 ? (
        <div className="space-y-3">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-center gap-3 p-3 border border-neutral-200 rounded bg-white"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{integration.name}</p>
                <p className="text-xs text-neutral-600">{integration.apiUrl}</p>
                <p className="text-xs text-neutral-400 capitalize mt-1">
                  {integration.type.replace('_', ' ')}
                  {integration.lastSync && ` · Last sync: ${new Date(integration.lastSync).toLocaleString()}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(integration.id, integration.enabled)}
                  className={`p-2 rounded transition-colors ${
                    integration.enabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                  title={integration.enabled ? 'Enabled' : 'Disabled'}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(integration.id)}
                  className="p-2 hover:bg-neutral-100 rounded text-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500 text-center py-8">
          No integrations configured yet.
        </p>
      )}

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add API Integration</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Integration Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as IntegrationFormData['type'],
                    })
                  }
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-neutral-600 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={`My ${typeLabels[selectedType]}`}
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-600 mb-1">API URL</label>
                <input
                  type="url"
                  value={formData.apiUrl}
                  onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                  placeholder={typePlaceholders[selectedType]}
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-600 mb-1">
                  API Key / Token (optional)
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="Your API key or bearer token"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              {/* Paperless-specific config */}
              {selectedType === 'paperless' && (
                <div>
                  <label className="block text-sm text-neutral-600 mb-1">
                    Todo Tag (documents with this tag become tasks)
                  </label>
                  <input
                    type="text"
                    value={(formData.config.todo_tag as string) || 'todo'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, todo_tag: e.target.value },
                      })
                    }
                    placeholder="todo"
                    className="w-full px-3 py-2 border border-neutral-200 rounded"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!formData.name || !formData.apiUrl || saving}
                  className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Integration'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
