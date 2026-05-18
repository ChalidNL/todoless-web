import React, { useState } from 'react';
import { Task, Item } from '../../types';
import { useApp } from '../../context/AppContext';
import { Check, Menu, X, Trash2, Tag, User, CalendarDays, Flag, ShoppingCart, Hash } from 'lucide-react';
import { LabelBadge } from './LabelBadge';
import { entityColor, entityBg } from '../../lib/entity-colors';

interface UnifiedCardProps {
  entity: Task | Item;
  type: 'task' | 'item';
}

type UnifiedEditor = 'labels' | 'assignee' | 'schedule' | 'shop' | null;

export const UnifiedCard = ({ entity, type }: UnifiedCardProps) => {
  const { updateTask, updateItem, deleteTask, deleteItem, labels, users, shops, addLabel } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [activeEditor, setActiveEditor] = useState<UnifiedEditor>(null);

  const isTask = type === 'task';
  const task = isTask ? (entity as Task) : null;
  const item = !isTask ? (entity as Item) : null;

  const isDone = isTask ? task!.status === 'done' : item!.completed;
  const quantity = item?.quantity ?? 1;
  const currentShop = item?.shopId ? shops.find(s => s.id === item.shopId) : null;
  const assignedUser = entity.assignedTo ? users.find(u => u.id === entity.assignedTo) : null;
  const dateStr = entity.dueDate ? new Date(entity.dueDate).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' }) : null;

  const handleToggle = () => {
    if (isTask) {
      updateTask(entity.id, task!.status === 'done' ? { status: 'todo', completedAt: undefined } : { status: 'done', completedAt: Date.now() });
    } else {
      updateItem(entity.id, { completed: !item!.completed });
    }
  };

  const handleDelete = () => {
    if (isTask) deleteTask(entity.id);
    else deleteItem(entity.id);
  };

  const setValue = (val: Record<string, unknown>) => {
    if (isTask) updateTask(entity.id, val);
    else updateItem(entity.id, val);
  };

  const handleToggleFlag = () => {
    if (isTask) updateTask(entity.id, { flag: !task!.flag, blocked: !task!.flag });
  };

  return (
    <div className={`rounded-lg border bg-white transition-colors ${
      isDone ? 'border-neutral-200 opacity-75' : 'border-neutral-200 hover:border-neutral-300'
    }`}>
      <div className="p-2.5">
        {/* Line 1: checkbox + title + badge(s) + hamburger */}
        <div className="flex items-center gap-2">
          {/* Checkbox (button) */}
          <button
            onClick={handleToggle}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              isDone
                ? 'bg-neutral-900 border-neutral-900 text-white'
                : 'border-neutral-300 hover:border-neutral-500'
            }`}
            aria-label={isDone ? 'Mark as not done' : 'Mark as done'}
          >
            {isDone && <Check className="w-3 h-3" />}
          </button>

          {/* Title */}
          <span className={`text-sm font-medium flex-1 truncate ${
            isDone ? 'line-through text-neutral-400' : 'text-neutral-900'
          }`}>
            {entity.title}
          </span>

          {/* Flag badge (tasks) */}
          {isTask && task!.flag && (
            <Flag className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
          )}

          {/* Due date badge */}
          {dateStr && !isDone && (
            <span className="text-[11px] text-neutral-500 border border-neutral-200 rounded px-1.5 py-0.5 flex-shrink-0">
              {dateStr}
            </span>
          )}

          {/* Quantity badge (items) */}
          {!isTask && !isDone && (
            <span className="text-xs font-medium text-neutral-600 border border-neutral-200 rounded px-2 py-0.5 flex-shrink-0">
              {quantity}
            </span>
          )}

          {/* Hamburger */}
          <button
            onClick={() => {
              setShowMenu(!showMenu);
              setActiveEditor(!showMenu ? activeEditor : null);
            }}
            className="p-1 hover:bg-neutral-100 rounded transition-colors flex-shrink-0"
            aria-label="Open attributes"
          >
            {showMenu ? <X className="w-4 h-4 text-neutral-600" /> : <Menu className="w-4 h-4 text-neutral-400" />}
          </button>
        </div>

        {/* Chip row — labels + assignee inline */}
        {(entity.labels.length > 0 || assignedUser) && !showMenu && (
          <div className="flex flex-wrap items-center gap-1 mt-1.5 ml-7">
            {entity.labels.map(labelId => {
              const label = labels.find(l => l.id === labelId);
              return label ? <LabelBadge key={label.id} label={label} size="sm" /> : null;
            })}
            {assignedUser && (
              <span className="chip" style={{ backgroundColor: entityBg(assignedUser.id), color: entityColor(assignedUser.id) }}>
                <User className="w-3 h-3" strokeWidth={2} />
                {assignedUser.name}
              </span>
            )}
          </div>
        )}

        {/* Line 2: attributes behind hamburger */}
        {showMenu && (
          <div className="mt-2 pt-2 border-t border-neutral-100">
            {/* Attribute buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveEditor(activeEditor === 'labels' ? null : 'labels')}
                className={`p-1.5 rounded transition-colors ${activeEditor === 'labels' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-500'}`}
                title="#label"
                aria-label="Edit labels"
              >
                <Tag className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => setActiveEditor(activeEditor === 'assignee' ? null : 'assignee')}
                className={`p-1.5 rounded transition-colors ${activeEditor === 'assignee' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-500'}`}
                title="@assignee"
                aria-label="Edit assignee"
              >
                <User className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => setActiveEditor(activeEditor === 'schedule' ? null : 'schedule')}
                className={`p-1.5 rounded transition-colors ${activeEditor === 'schedule' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-500'}`}
                title="//schedule"
                aria-label="Edit schedule"
              >
                <CalendarDays className="w-4 h-4" strokeWidth={1.75} />
              </button>
              {isTask && (
                <button
                  onClick={handleToggleFlag}
                  className={`p-1.5 rounded transition-colors ${task!.flag ? 'bg-red-200 text-red-700' : 'hover:bg-neutral-100 text-neutral-500'}`}
                  title="flag"
                  aria-label="Toggle flag"
                >
                  <Flag className="w-4 h-4" strokeWidth={1.75} />
                </button>
              )}
              {!isTask && (
                <button
                  onClick={() => setActiveEditor(activeEditor === 'shop' ? null : 'shop')}
                  className={`p-1.5 rounded transition-colors ${activeEditor === 'shop' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-500'}`}
                  title="$shop"
                  aria-label="Edit shop"
                >
                  <ShoppingCart className="w-4 h-4" strokeWidth={1.75} />
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={handleDelete}
                className="p-1.5 rounded text-red-600 hover:bg-red-50"
                title="delete"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* Label editor */}
            {activeEditor === 'labels' && (
              <div className="mt-2 p-2 bg-neutral-50 rounded space-y-1.5">
                <input
                  type="text"
                  onChange={(e) => {
                    const name = e.target.value.trim();
                    if (!name) return;
                    const existing = labels.find(l => l.name.toLowerCase() === name.toLowerCase());
                    const label = existing || addLabel({ name, color: '#3b82f6' });
                    if (!entity.labels.includes(label.id)) {
                      setValue({ labels: [...entity.labels, label.id] });
                    }
                    e.target.value = '';
                  }}
                  placeholder="Type label + Enter..."
                  className="w-full text-sm px-2 py-1.5 border border-neutral-200 rounded"
                  aria-label="Label input"
                />
                <div className="flex flex-wrap gap-1">
                  {labels.filter(l => l.name.toLowerCase().includes(
                    /* quick filter via displayed list — no search state needed */
                    ''
                  )).map(label => (
                    <button
                      key={label.id}
                      onClick={() => {
                        const has = entity.labels.includes(label.id);
                        setValue({ labels: has ? entity.labels.filter(id => id !== label.id) : [...entity.labels, label.id] });
                      }}
                      className={entity.labels.includes(label.id) ? 'ring-2 ring-neutral-900 rounded' : ''}
                    >
                      <LabelBadge label={label} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule editor */}
            {activeEditor === 'schedule' && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="date"
                  value={entity.dueDate ? new Date(entity.dueDate).toISOString().slice(0, 10) : ''}
                  onChange={(e) => setValue({ dueDate: e.target.value ? new Date(e.target.value).getTime() : undefined })}
                  className="text-sm px-2 py-1.5 border border-neutral-200 rounded flex-1"
                  aria-label="Due date"
                />
                {entity.assignedTo && (
                  <button
                    onClick={() => setValue({ assignedTo: undefined })}
                    className="text-xs text-neutral-400 hover:text-red-500"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            {/* Assignee editor */}
            {activeEditor === 'assignee' && (
              <div className="mt-2 relative">
                <input
                  type="text"
                  onChange={(e) => {
                    const q = e.target.value.toLowerCase();
                    const match = users.find(u => u.name.toLowerCase().includes(q));
                    if (match && e.target.value.length > 0) {
                      setValue({ assignedTo: match.id });
                      setActiveEditor(null);
                    }
                    if (!e.target.value) {
                      setValue({ assignedTo: undefined });
                    }
                  }}
                  placeholder="Search team..."
                  className="w-full text-sm px-2 py-1.5 border border-neutral-200 rounded"
                  aria-label="Search assignee"
                />
              </div>
            )}

            {/* Shop editor (items only) */}
            {activeEditor === 'shop' && !isTask && (
              <div className="mt-2 flex flex-wrap gap-1">
                {shops.map(shop => (
                  <button
                    key={shop.id}
                    onClick={() => setValue({ shopId: item!.shopId === shop.id ? undefined : shop.id })}
                    className={item!.shopId === shop.id ? 'ring-2 ring-neutral-900 rounded' : ''}
                  >
                    <LabelBadge label={shop} size="sm" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
