import React, { useState } from 'react';
import { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { User, Trash2, Menu, X } from 'lucide-react';
import { LabelBadge } from './LabelBadge';

interface CompactTaskCardProps {
  task: Task;
  showCheckbox?: boolean;
}

export const CompactTaskCard = ({ task, showCheckbox = true }: CompactTaskCardProps) => {
  const { updateTask, deleteTask, labels, users } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleToggleComplete = () => {
    if (task.status === 'done') {
      updateTask(task.id, { status: 'todo', completedAt: undefined });
    } else {
      updateTask(task.id, { status: 'done', completedAt: Date.now() });
    }
  };

  const user = task.assignedTo ? users.find(u => u.id === task.assignedTo) : null;
  const creator = task.createdBy && users.length > 1 ? users.find(u => u.id === task.createdBy) : null;
  const taskLabels = labels.filter(l => task.labels.includes(l.id));

  return (
    <div className={`rounded-lg bg-white border border-neutral-200 transition-colors ${
      task.status === 'done' ? 'opacity-50' : 'hover:border-neutral-300'
    }`}>
      <div className="flex items-start gap-2 p-2.5">
        {/* Checkbox */}
        {showCheckbox && (
          <input
            type="checkbox"
            checked={task.status === 'done'}
            onChange={handleToggleComplete}
            className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-blue-600 accent-blue-600 flex-shrink-0 cursor-pointer"
          />
        )}

        {/* Task content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2">
            <span className={`text-sm flex-1 ${
              task.status === 'done' ? 'line-through text-neutral-400' : 'text-neutral-900'
            }`}>
              {task.title}
            </span>
          </div>

          {/* Attributes row — compact */}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {creator && (
              <span className="text-[10px] text-neutral-400">
                {creator.name}
              </span>
            )}
            {user && creator?.id !== user.id && (
              <span className="inline-flex items-center gap-0.5 text-[10px] bg-blue-50 text-blue-600 px-1 py-0.5 rounded">
                <User className="w-2.5 h-2.5" />
                {user.name}
                {user.role === 'assistant' && (
                  <span className="px-0.5 bg-blue-200 text-blue-700 rounded text-[8px] font-semibold">AI</span>
                )}
              </span>
            )}
            {creator && user?.id === creator.id && user && (
              <span className="inline-flex items-center gap-0.5 text-[10px] bg-blue-50 text-blue-600 px-1 py-0.5 rounded">
                <User className="w-2.5 h-2.5" />
                {user.name}
              </span>
            )}
            {taskLabels.map(label => (
              <LabelBadge key={label.id} label={label} size="sm" />
            ))}
          </div>

          {/* Expanded menu */}
          {showMenu && (
            <div className="mt-1.5 pt-1.5 border-t border-neutral-100">
              {/* Label selector */}
              <div className="flex flex-wrap gap-1 mb-1.5">
                {labels.map(label => (
                  <button
                    key={label.id}
                    onClick={() => {
                      const has = task.labels.includes(label.id);
                      updateTask(task.id, {
                        labels: has ? task.labels.filter(id => id !== label.id) : [...task.labels, label.id]
                      });
                    }}
                    className={task.labels.includes(label.id) ? 'ring-1 ring-neutral-900 rounded' : ''}
                  >
                    <LabelBadge label={label} size="sm" />
                  </button>
                ))}
              </div>

              {/* Assignee selector */}
              <div className="flex flex-wrap gap-1 mb-1.5">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => updateTask(task.id, { assignedTo: task.assignedTo === u.id ? undefined : u.id })}
                    className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 ${
                      task.assignedTo === u.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 hover:bg-neutral-200'
                    }`}
                  >
                    {u.name}
                  </button>
                ))}
              </div>

              {/* Delete */}
              {showActions ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => { deleteTask(task.id); setShowActions(false); }}
                    className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100"
                  >
                    Confirm delete
                  </button>
                  <button onClick={() => setShowActions(false)} className="text-xs text-neutral-500 px-2 py-1" >
                    Cancel
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Menu button */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {!showMenu && (
            <button
              onClick={() => { setShowActions(true); }}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-400"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => { setShowMenu(!showMenu); setShowActions(false); }}
            className="p-1 hover:bg-neutral-100 rounded transition-colors"
          >
            {showMenu ? <X className="w-4 h-4 text-neutral-600" /> : <Menu className="w-4 h-4 text-neutral-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
