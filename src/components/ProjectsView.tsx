import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n/translations';
import { FolderOpen, Plus, Trash2, ChevronRight, CheckCircle2, Circle, Calendar, ArrowUpCircle } from 'lucide-react';
import type { Project, ProjectStatus, Task } from '../types';

export function ProjectsView() {
  const { projects, tasks, addProject, updateProject, deleteProject } = useApp();
  const { language } = useLanguage();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');

  const projectTasks = useMemo(() => {
    const map = new Map<string, Task[]>();
    projects.forEach((p) => {
      const projectTaskIds = new Set(p.taskIds);
      const related = tasks.filter((task) => task.projectId && (task.projectId === p.id || projectTaskIds.has(task.id)));
      map.set(p.id, related);
    });
    return map;
  }, [projects, tasks]);

  const getProjectProgress = (project: Project): { done: number; total: number; percent: number } => {
    const pts = projectTasks.get(project.id) || [];
    const done = pts.filter((t) => t.status === 'done').length;
    const total = pts.length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { done, total, percent };
  };

  const statusLabels: Record<ProjectStatus, string> = {
    active: t('projects.statusActive', language),
    completed: t('projects.statusCompleted', language),
    archived: t('projects.statusArchived', language),
  };

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    addProject({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      color: newColor,
      status: 'active',
      taskIds: [],
    });
    setNewTitle('');
    setNewDescription('');
    setNewColor('#6366f1');
    setShowCreateForm(false);
  };

  const handleStatusChange = (projectId: string, status: ProjectStatus) => {
    updateProject(projectId, { status });
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  if (selectedProject) {
    const pts = projectTasks.get(selectedProject.id) || [];
    const progress = getProjectProgress(selectedProject);

    return (
      <div className="max-w-2xl mx-auto p-4 pb-24">
        <button
          onClick={() => setSelectedProjectId(null)}
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700 mb-4"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          {t('projects.backToOverview', language)}
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: selectedProject.color || '#6366f1' }} />
              <div>
                <h1 className="text-xl font-semibold">{selectedProject.title}</h1>
                {selectedProject.description && (
                  <p className="text-sm text-neutral-500 mt-1">{selectedProject.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => deleteProject(selectedProject.id)}
              className="p-2 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-red-50"
              title={t('common.delete', language)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-neutral-600">{t('projects.progress', language)}</span>
              <span className="font-medium">{progress.percent}%</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${progress.percent}%`, backgroundColor: selectedProject.color || '#6366f1' }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {progress.done} / {progress.total} {t('projects.tasksCompleted', language)}
            </p>
          </div>

          <div className="flex gap-2">
            {(['active', 'completed', 'archived'] as ProjectStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(selectedProject.id, s)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedProject.status === s
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                }`}
              >
                {statusLabels[s]}
              </button>
            ))}
          </div>
        </div>

        <h2 className="text-lg font-medium mb-3">{t('projects.subtasks', language)}</h2>
        {pts.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('projects.noTasks', language)}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pts.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg border border-neutral-200 p-3 flex items-center gap-3"
              >
                {task.status === 'done' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-neutral-300 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${task.status === 'done' ? 'line-through text-neutral-400' : ''}`}>
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {new Date(task.dueDate).toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US')}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    task.status === 'done'
                      ? 'bg-green-100 text-green-700'
                      : task.status === 'todo'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {task.status === 'done' ? t('tasks.done', language) : task.status === 'todo' ? t('tasks.todo', language) : t('tasks.backlog', language)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">{t('projects.title', language)}</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-3 py-2 bg-neutral-900 text-white rounded-lg text-sm hover:bg-neutral-800"
        >
          <Plus className="w-4 h-4" />
          {t('projects.newProject', language)}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
          <h2 className="font-medium mb-3">{t('projects.createProject', language)}</h2>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={t('projects.projectName', language)}
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder={t('projects.description', language)}
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
            rows={2}
          />
          <div className="flex items-center gap-2 mb-3">
            <label className="text-xs text-neutral-500">{t('projects.color', language)}</label>
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim()}
              className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.create', language)}
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewTitle('');
                setNewDescription('');
              }}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50"
            >
              {t('common.cancel', language)}
            </button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <FolderOpen className="w-16 h-16 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">{t('projects.noProjects', language)}</p>
          <p className="text-sm mt-1">{t('projects.noProjectsSub', language)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const progress = getProjectProgress(project);
            return (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="w-full bg-white rounded-xl shadow-sm border border-neutral-200 p-4 text-left hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg shrink-0" style={{ backgroundColor: project.color || '#6366f1' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{project.title}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                          project.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : project.status === 'completed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {statusLabels[project.status]}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-sm text-neutral-500 truncate mt-0.5">{project.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 bg-neutral-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${progress.percent}%`, backgroundColor: project.color || '#6366f1' }}
                        />
                      </div>
                      <span className="text-xs text-neutral-500 shrink-0">{progress.percent}%</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                      <span>{progress.total} {t('projects.tasks', language)}</span>
                      {project.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.dueDate).toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US')}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-300 shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
