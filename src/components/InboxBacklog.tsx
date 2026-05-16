import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CompactTaskCard } from './shared/CompactTaskCard';
import { NewGlobalHeader } from './shared/NewGlobalHeader';
import { TopBar } from './shared/TopBar';
import {
  Inbox, Lightbulb, Send, Clock,
} from 'lucide-react';
import { parseQuickAdd } from '../lib/quick-add-parser';

export const InboxBacklog = () => {
  const { tasks, addTask } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Braindump state
  const [braindumpText, setBraindumpText] = useState('');
  const [isBraindumpFocused, setIsBraindumpFocused] = useState(false);
  const braindumpRef = useRef<HTMLTextAreaElement>(null);

  const backlogTasks = tasks
    .filter(t => t.status === 'backlog')
    .filter(t => !t.archived)
    .filter(t => searchQuery === '' || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt);

  // Dashboard summary stats
  const backlogCount = backlogTasks.length;
  const todoCount = tasks.filter(t => t.status === 'todo' && !t.archived).length;
  const doneToday = tasks.filter(t => {
    if (!t.completedAt) return false;
    const today = new Date();
    const completed = new Date(t.completedAt);
    return completed.toDateString() === today.toDateString();
  }).length;

  const handleBraindumpSubmit = () => {
    if (!braindumpText.trim()) return;

    const lines = braindumpText.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const parsed = parseQuickAdd(line);
      addTask({
        title: parsed.title.trim(),
        status: 'backlog',
        priority: 'normal',
        labels: parsed.labels || [],
        assignedTo: parsed.assignee,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate).getTime() : undefined,
        isPrivate: parsed.isPrivate,
      } as any);
    }
    setBraindumpText('');
  };

  const handleBraindumpKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBraindumpSubmit();
    }
  };

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
    <div className="min-h-screen bg-neutral-50 pb-24">
      <TopBar />
      <NewGlobalHeader
        onAdd={handleAddTaskWithValue}
        onSearch={setSearchQuery}
        searchPlaceholder="Search inbox..."
      />

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-6">
        {/* Dashboard Summary */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Inbox', value: backlogCount, icon: <Inbox className="w-4 h-4 text-blue-500" /> },
            { label: 'Todo', value: todoCount, icon: <Clock className="w-4 h-4 text-green-500" /> },
            { label: 'Done Today', value: doneToday, icon: <Clock className="w-4 h-4 text-emerald-500" /> },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-lg border border-neutral-200 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                {stat.icon}
                <span className="text-xs text-neutral-500">{stat.label}</span>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Braindump */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-sm">Braindump</h2>
            <span className="text-xs text-neutral-400 ml-auto">Enter to add · Shift+Enter for new line</span>
          </div>
          <div className="p-3">
            <textarea
              ref={braindumpRef}
              value={braindumpText}
              onChange={e => setBraindumpText(e.target.value)}
              onKeyDown={handleBraindumpKeyDown}
              onFocus={() => setIsBraindumpFocused(true)}
              onBlur={() => setIsBraindumpFocused(false)}
              placeholder="Dump your thoughts here...&#10;#label @person //tomorrow&#10;One task per line"
              className={`w-full min-h-[80px] p-3 text-sm rounded-lg border transition-colors resize-none bg-neutral-50 focus:bg-white focus:outline-none ${
                isBraindumpFocused
                  ? 'border-neutral-400'
                  : 'border-neutral-200'
              }`}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleBraindumpSubmit}
                disabled={!braindumpText.trim()}
                className="px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Add to Inbox
              </button>
            </div>
          </div>
        </div>

        {/* Backlog list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-neutral-600 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Inbox ({backlogCount})
            </h2>
          </div>

          {backlogTasks.length === 0 ? (
            <div className="text-center py-16">
              <Inbox className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
              <p className="text-neutral-400 text-sm">Inbox is empty</p>
              <p className="text-neutral-300 text-xs mt-1">Use braindump above to capture ideas</p>
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
