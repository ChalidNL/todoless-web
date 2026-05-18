import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CompactTaskCard } from './shared/CompactTaskCard';
import { NewGlobalHeader } from './shared/NewGlobalHeader';
import { TopBar } from './shared/TopBar';
import { Inbox, Clock } from 'lucide-react';

export const InboxBacklog = () => {
  const { tasks, addTask } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const backlogTasks = tasks
    .filter((t) => t.status === 'backlog')
    .filter((t) => !t.archived)
    .filter((t) => searchQuery === '' || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt);

  const backlogCount = backlogTasks.length;
  const todoCount = tasks.filter((t) => t.status === 'todo' && !t.archived).length;
  const doneToday = tasks.filter((t) => {
    if (!t.completedAt) return false;
    const today = new Date();
    const completed = new Date(t.completedAt);
    return completed.toDateString() === today.toDateString();
  }).length;

  const handleAddTaskWithValue = (value: string, metadata?: { assignee?: string; labels?: string[]; dueDate?: number }) => {
    if (!value.trim()) return;
    addTask({
      title: value.trim(),
      status: 'backlog',
      priority: 'normal',
      labels: metadata?.labels || [],
      assignedTo: metadata?.assignee,
      dueDate: metadata?.dueDate,
    } as any);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-[calc(env(safe-area-inset-bottom,0px)+96px)]">
      <TopBar />
      <NewGlobalHeader
        onAdd={handleAddTaskWithValue}
        onSearch={setSearchQuery}
        searchPlaceholder="Search inbox..."
      />

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-6">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Inbox', value: backlogCount, icon: <Inbox className="w-4 h-4 text-blue-500" /> },
            { label: 'Todo', value: todoCount, icon: <Clock className="w-4 h-4 text-green-500" /> },
            { label: 'Done Today', value: doneToday, icon: <Clock className="w-4 h-4 text-emerald-500" /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg border border-neutral-200 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                {stat.icon}
                <span className="text-xs text-neutral-500">{stat.label}</span>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-neutral-600 flex items-center gap-1.5">
              Inbox ({backlogCount})
            </h2>
          </div>

          {backlogTasks.length === 0 ? (
            <div className="text-center py-16">
              <Inbox className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
              <p className="text-neutral-400 text-sm">Inbox is empty</p>
            </div>
          ) : (
            <div className="space-y-2">
              {backlogTasks.map((task) => (
                <CompactTaskCard key={task.id} task={task} showCheckbox={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
