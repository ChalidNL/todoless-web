import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronDown, ChevronUp, RotateCcw, CheckSquare } from 'lucide-react';
import { CompactTaskCard } from './shared/CompactTaskCard';
import { NewGlobalHeader } from './shared/NewGlobalHeader';
import { TopBar } from './shared/TopBar';
import { DueDateNotifications } from './shared/DueDateNotifications';

export const TasksView = () => {
  const { tasks, activeLabelFilters, addTask, uncheckAllDoneTasks, showCompletionMessage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckedOut, setShowCheckedOut] = useState(false);

  const handleAddTaskWithValue = (value: string, metadata?: { assignee?: string; labels?: string[]; dueDate?: number }) => {
    addTask({
      title: value,
      status: 'todo',
      blocked: false,
      labels: metadata?.labels || [],
      assignedTo: metadata?.assignee,
      dueDate: metadata?.dueDate,
      flag: false,
    });
  };


  const getFilteredTasks = () => {
    let filtered = tasks;

    // Label filters
    if (activeLabelFilters.length > 0) {
      filtered = filtered.filter(task =>
        activeLabelFilters.every(filterId => task.labels.includes(filterId))
      );
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  
  // Separate active and checked out tasks
  const activeTasks = filteredTasks.filter(task => task.status !== 'done');
  const checkedOutTasks = filteredTasks.filter(task => task.status === 'done');

  // Sort active tasks: urgent priority first, then normal, then low, then no priority
  const sortedActiveTasks = [...activeTasks].sort((a, b) => {
    const priorityOrder = { urgent: 0, normal: 1, low: 2, undefined: 3 };
    const aPriority = a.priority || 'undefined';
    const bPriority = b.priority || 'undefined';
    return priorityOrder[aPriority] - priorityOrder[bPriority];
  });

  return (
    <div className="min-h-screen bg-neutral-50 pb-[calc(env(safe-area-inset-bottom,0px)+96px)]">
      <TopBar />
      {/* Global Header */}
      <NewGlobalHeader
        onAdd={handleAddTaskWithValue}
        onSearch={setSearchQuery}
        searchPlaceholder="Search tasks..."
      />


      {/* Tasks list */}
      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Active Tasks */}
        <div>
          {activeTasks.length === 0 && checkedOutTasks.length === 0 ? (
            <div className="text-center py-16">
              <CheckSquare className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
              <p className="text-neutral-400 text-sm">No tasks found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedActiveTasks.map((task) => (
                <CompactTaskCard 
                  key={task.id} 
                  task={task} 
                  showCheckbox={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Checked Out Tasks */}
        {checkedOutTasks.length > 0 && (
          <div className="border-t border-neutral-200 pt-4">
            <div className="flex items-center justify-between w-full px-1 mb-2">
              <button
                onClick={() => setShowCheckedOut(!showCheckedOut)}
                className="flex items-center gap-2"
              >
                <h2 className="text-sm font-semibold text-neutral-700">
                  Checked Out ({checkedOutTasks.length})
                </h2>
                {showCheckedOut ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                )}
              </button>
              
              <button
                onClick={() => {
                  uncheckAllDoneTasks();
                  showCompletionMessage('All tasks checked back in');
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                title="Check in all tasks"
              >
                <RotateCcw className="w-3 h-3" />
                Check In All
              </button>
            </div>

            {showCheckedOut && (
              <div className="space-y-2">
                {checkedOutTasks.map((task) => (
                  <CompactTaskCard 
                    key={task.id} 
                    task={task} 
                    showCheckbox={task.status === 'done'}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <DueDateNotifications />
    </div>
  );
};