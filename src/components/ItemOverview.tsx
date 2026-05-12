import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CompactItemCard } from './shared/CompactItemCard';
import { NewGlobalHeader } from './shared/NewGlobalHeader';
import { TopBar } from './shared/TopBar';
import { GroceriesByShopView } from './GroceriesByShopView';
import { ChevronDown, ChevronUp, RotateCcw, LayoutGrid } from 'lucide-react';

type ItemViewMode = 'list' | 'cards';

export const ItemOverview = () => {
  const { items, addItem, activeLabelFilters, uncheckAllDoneItems, showCompletionMessage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckedOut, setShowCheckedOut] = useState(false);
  const [viewMode, setViewMode] = useState<ItemViewMode>('list');

  const handleAddItem = (value: string, metadata?: { assignee?: string; labels?: string[]; dueDate?: number }) => {
    addItem({
      title: value,
      completed: false,
      assignedTo: metadata?.assignee,
      labels: metadata?.labels || [],
      dueDate: metadata?.dueDate,
    });
  };

  const activeItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLabels = activeLabelFilters.length === 0 || 
      activeLabelFilters.some(labelId => (item.labels || []).includes(labelId));
    return matchesSearch && matchesLabels && !item.completed;
  });

  const checkedOutItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLabels = activeLabelFilters.length === 0 || 
      activeLabelFilters.some(labelId => (item.labels || []).includes(labelId));
    return matchesSearch && matchesLabels && item.completed;
  });

  // Card view
  if (viewMode === 'cards') {
    return <GroceriesByShopView onSwitchToList={() => setViewMode('list')} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <TopBar />
      <NewGlobalHeader 
        onSearch={setSearchQuery}
        onAdd={handleAddItem}
        searchPlaceholder="Search items or add with @user #label //date..."
        type="item"
      />

      <div className="max-w-2xl mx-auto px-4 pt-2 flex justify-end">
        <button
          onClick={() => setViewMode('cards')}
          className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
          title="Switch to card view grouped by shop"
        >
          <LayoutGrid className="w-3 h-3" />
          Cards
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Active Items */}
        <div>
          <div className="space-y-2">
            {activeItems.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <p className="text-sm">No items to buy</p>
              </div>
            ) : (
              activeItems.map(item => (
                <CompactItemCard key={item.id} item={item} />
              ))
            )}
          </div>
        </div>

        {/* Checked Out Items */}
        {checkedOutItems.length > 0 && (
          <div className="border-t border-neutral-200 pt-4">
            <div className="flex items-center justify-between w-full px-1 mb-2">
              <button
                onClick={() => setShowCheckedOut(!showCheckedOut)}
                className="flex items-center gap-2"
              >
                <h2 className="text-sm font-semibold text-neutral-700">
                  Checked Out ({checkedOutItems.length})
                </h2>
                {showCheckedOut ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                )}
              </button>
              
              <button
                onClick={() => {
                  uncheckAllDoneItems();
                  showCompletionMessage('All items checked back in');
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                title="Check in all items"
              >
                <RotateCcw className="w-3 h-3" />
                Check In All
              </button>
            </div>

            {showCheckedOut && (
              <div className="space-y-2">
                {checkedOutItems.map(item => (
                  <CompactItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};