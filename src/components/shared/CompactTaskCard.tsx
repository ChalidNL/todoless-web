import React, { useState } from 'react';
import { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { Clock, Tag, User, Trash2, Menu, X, AlertCircle } from 'lucide-react';
import { LabelBadge } from './LabelBadge';
import { LabelSelector } from './LabelSelector';
import { EditableText } from './EditableText';

interface CompactTaskCardProps {
  task: Task;
  showCheckbox?: boolean;
}

export const CompactTaskCard = ({ task, showCheckbox = true }: CompactTaskCardProps) => {
  const { updateTask, deleteTask, labels, users } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showLabelSelector, setShowLabelSelector] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showAssigneeSelector, setShowAssigneeSelector] = useState(false);
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  const [labelSearchQuery, setLabelSearchQuery] = useState('');
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState('');

  const getPriorityColor = () => {
    if (task.priority === 'urgent') return 'text-orange-500';
    if (task.priority === 'low') return 'text-neutral-400';
    return 'text-blue-500';
  };

  const handleToggleComplete = () => {
    if (task.status === 'done') {
      updateTask(task.id, { status: 'todo', completedAt: undefined });
    } else {
      updateTask(task.id, { status: 'done', completedAt: Date.now() });
    }
  };

  const handleToggleLabel = (labelId: string) => {
    const hasLabel = task.labels.includes(labelId);
    const newLabels = hasLabel
      ? task.labels.filter(id => id !== labelId)
      : [...task.labels, labelId];
    updateTask(task.id, { labels: newLabels });
  };

  const closeAllPanels = () => {
    setShowLabelSelector(false);
    setShowDueDatePicker(false);
    setShowAssigneeSelector(false);
    setShowPrioritySelector(false);
  };

  const filteredLabels = labels.filter(l => 
    l.name.toLowerCase().includes(labelSearchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(assigneeSearchQuery.toLowerCase())
  );

  return (
    <div 
      className={`rounded-lg p-2.5 hover:border-neutral-300 transition-all bg-white border-2 border-neutral-200 ${
        task.status === 'done' ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        {/* Checkbox */}
        {showCheckbox && (
          <input
            type="checkbox"
            checked={task.status === 'done'}
            onChange={handleToggleComplete}
            className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer flex-shrink-0 accent-blue-600"
          />
        )}
        
        {/* Task content */}
        <div className="flex-1 min-w-0">
          {/* Task Title */}
          <div className="mb-2">
            <EditableText
              value={task.title}
              onChange={(value) => updateTask(task.id, { title: value })}
              completed={task.status === 'done'}
            />
          </div>

          {/* Owner & Assignee badges */}
          <div className="flex items-center gap-1 mb-1.5 flex-wrap">
            {task.createdBy && users.length > 1 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-500">
                <div className="w-3.5 h-3.5 rounded-full bg-neutral-300 flex items-center justify-center text-[8px] text-white font-medium">
                  {(users.find(u => u.id === task.createdBy)?.name || '?').charAt(0)}
                </div>
                {users.find(u => u.id === task.createdBy)?.name || 'Unknown'}
              </span>
            )}
            {task.assignedTo && task.assignedTo !== task.createdBy && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600">
                <User className="w-3 h-3" />
                {users.find(u => u.id === task.assignedTo)?.name || 'Unknown'}
              </span>
            )}
          </div>

          {/* Icon toolbar - only visible when menu is open */}
          {showMenu && (
            <div className="flex items-center gap-1 pt-2 border-t border-neutral-100">
              {/* Clock - Due Date/Repeat */}
              <button 
                onClick={() => {
                  closeAllPanels();
                  setShowDueDatePicker(!showDueDatePicker);
                }}
                className={`p-2 rounded transition-colors touch-target ${showDueDatePicker ? 'bg-black' : 'hover:bg-neutral-100'}`}
                title="Due date / Repeat"
              >
                <Clock className={`w-4 h-4 ${showDueDatePicker ? 'text-white' : task.dueDate ? 'text-blue-500' : 'text-neutral-400'}`} />
              </button>
              
              {/* Tag - Labels */}
              <button 
                onClick={() => {
                  closeAllPanels();
                  setShowLabelSelector(!showLabelSelector);
                }}
                className={`p-1.5 rounded transition-colors ${showLabelSelector ? 'bg-black' : 'hover:bg-neutral-100'}`}
                title="Labels"
              >
                <Tag className={`w-4 h-4 ${showLabelSelector ? 'text-white' : task.labels.length > 0 ? 'text-blue-500' : 'text-neutral-400'}`} />
              </button>
              
              {/* User - Assignee */}
              <button 
                onClick={() => {
                  closeAllPanels();
                  setShowAssigneeSelector(!showAssigneeSelector);
                }}
                className={`p-1.5 rounded transition-colors ${showAssigneeSelector ? 'bg-black' : 'hover:bg-neutral-100'}`}
                title="Assignee"
              >
                <User className={`w-4 h-4 ${showAssigneeSelector ? 'text-white' : task.assignedTo ? 'text-blue-500' : 'text-neutral-400'}`} />
              </button>
              
              {/* AlertCircle - Priority */}
              <button
                onClick={() => {
                  closeAllPanels();
                  setShowPrioritySelector(!showPrioritySelector);
                }}
                className={`p-1.5 rounded transition-colors ${showPrioritySelector ? 'bg-black' : 'hover:bg-neutral-100'}`}
                title="Priority"
              >
                <AlertCircle className={`w-4 h-4 ${showPrioritySelector ? 'text-white' : getPriorityColor()}`} />
              </button>
              
              <div className="flex-1" />
              
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 hover:bg-neutral-100 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          )}
        </div>

        {/* Hamburger Menu Button - Right aligned */}
        <button
          onClick={() => {
            setShowMenu(!showMenu);
            setIsExpanded(!isExpanded);
          }}
          className="p-2 hover:bg-neutral-100 rounded transition-colors flex-shrink-0 touch-target"
        >
          {showMenu ? (
            <X className="w-5 h-5 text-neutral-600" />
          ) : (
            <Menu className="w-5 h-5 text-neutral-400" />
          )}
        </button>
      </div>

      {/* Due Date Picker */}
      {showDueDatePicker && (
        <div className="mt-2 pt-2 border-t border-neutral-100 space-y-2">
          <div className="text-xs text-neutral-600 mb-1">Due Date</div>
          <input
            type="date"
            value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
            onChange={(e) => updateTask(task.id, { dueDate: e.target.value ? new Date(e.target.value).getTime() : undefined })}
            className="w-full px-2 py-1 text-xs border border-neutral-200 rounded"
          />
          <div className="text-xs text-neutral-600 mb-1 mt-2">Repeat</div>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => updateTask(task.id, { repeatInterval: 'week' })}
              className={`px-2 py-1 text-xs rounded ${task.repeatInterval === 'week' ? 'bg-blue-500 text-white' : 'bg-neutral-100'}`}
            >
              Week
            </button>
            <button
              onClick={() => updateTask(task.id, { repeatInterval: 'month' })}
              className={`px-2 py-1 text-xs rounded ${task.repeatInterval === 'month' ? 'bg-blue-500 text-white' : 'bg-neutral-100'}`}
            >
              Month
            </button>
            <button
              onClick={() => updateTask(task.id, { repeatInterval: 'year' })}
              className={`px-2 py-1 text-xs rounded ${task.repeatInterval === 'year' ? 'bg-blue-500 text-white' : 'bg-neutral-100'}`}
            >
              Year
            </button>
            {task.repeatInterval && (
              <button
                onClick={() => updateTask(task.id, { repeatInterval: undefined })}
                className="px-2 py-1 text-xs bg-neutral-100 rounded"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Label selector with search/create */}
      {showLabelSelector && (
        <div className="mt-2 pt-2 border-t border-neutral-100">
          <div className="text-xs text-neutral-600 mb-2">Labels</div>
          <input
            type="text"
            value={labelSearchQuery}
            onChange={(e) => setLabelSearchQuery(e.target.value)}
            placeholder="Search or create label..."
            className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded mb-2"
            autoFocus
          />
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {filteredLabels.map((label) => (
              <button
                key={label.id}
                onClick={() => handleToggleLabel(label.id)}
                className={`${task.labels.includes(label.id) ? 'ring-2 ring-neutral-900' : ''}`}
              >
                <LabelBadge label={label} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Assignee selector with search */}
      {showAssigneeSelector && (
        <div className="mt-2 pt-2 border-t border-neutral-100">
          <div className="text-xs text-neutral-600 mb-2">Assign to</div>
          <input
            type="text"
            value={assigneeSearchQuery}
            onChange={(e) => setAssigneeSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded mb-2"
            autoFocus
          />
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  updateTask(task.id, { assignedTo: task.assignedTo === user.id ? undefined : user.id });
                  setAssigneeSearchQuery('');
                }}
                className={`w-full px-2 py-1.5 text-left text-xs rounded flex items-center gap-2 ${
                  task.assignedTo === user.id ? 'bg-blue-100' : 'hover:bg-neutral-50'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-xs">
                  {user.name.charAt(0)}
                </div>
                {user.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Priority selector */}
      {showPrioritySelector && (
        <div className="mt-2 pt-2 border-t border-neutral-100">
          <div className="text-xs text-neutral-600 mb-2">Priority</div>
          <div className="flex gap-1">
            <button
              onClick={() => updateTask(task.id, { priority: 'urgent' })}
              className={`flex-1 px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${
                task.priority === 'urgent' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              High
            </button>
            <button
              onClick={() => updateTask(task.id, { priority: 'normal' })}
              className={`flex-1 px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${
                task.priority === 'normal' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              Medium
            </button>
            <button
              onClick={() => updateTask(task.id, { priority: 'low' })}
              className={`flex-1 px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${
                task.priority === 'low' ? 'bg-neutral-500 text-white' : 'bg-neutral-50 text-neutral-600'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              Low
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showActions && (
        <div className="mt-2 pt-2 border-t border-neutral-100">
          <button
            onClick={() => {
              deleteTask(task.id);
              setShowActions(false);
            }}
            className="text-xs text-red-600 hover:text-red-700"
          >
            Confirm delete
          </button>
        </div>
      )}
    </div>
  );
};
