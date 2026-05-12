import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CompactTaskCard } from './shared/CompactTaskCard';
import { CompactItemCard } from './shared/CompactItemCard';
import {
  LayoutDashboard, CheckSquare, ShoppingCart, FileText,
  CalendarDays, ChevronDown, ChevronUp, Plus, Search,
  Settings, Inbox, CheckCircle, AlertTriangle,
} from 'lucide-react';
import type { Task, Item, Note, CalendarEvent } from '../types';

type PanelKey = 'tasks' | 'items' | 'notes' | 'calendar';

interface PanelConfig {
  key: PanelKey;
  label: string;
  icon: React.ReactNode;
  count: number;
}

// ---- Sub-panels ----

function TasksPanel({ tasks }: { tasks: Task[] }) {
  const [search, setSearch] = useState('');
  const [showDone, setShowDone] = useState(false);

  const filtered = useMemo(() => {
    let result = tasks.filter(t => !t.archived);
    if (!showDone) result = result.filter(t => t.status !== 'done');
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q));
    }
    return result.sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      return (a.dueDate || Infinity) - (b.dueDate || Infinity);
    });
  }, [tasks, search, showDone]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <CheckSquare className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <span className="font-semibold text-sm">Tasks</span>
        <span className="ml-auto text-xs text-neutral-400">{filtered.length}</span>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={() => setShowDone(!showDone)}
          className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
            showDone
              ? 'bg-blue-50 border-blue-300 text-blue-600'
              : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
          }`}
        >
          {showDone ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 && (
          <p className="text-xs text-neutral-400 text-center py-8">
            {showDone ? 'No done tasks' : 'No open tasks — nice!'}
          </p>
        )}
        {filtered.map(task => (
          <CompactTaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function ItemsPanel({ items }: { items: Item[] }) {
  const [search, setSearch] = useState('');
  const [hideCompleted, setHideCompleted] = useState(true);

  const filtered = useMemo(() => {
    let result = items;
    if (hideCompleted) result = result.filter(i => !i.completed);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => i.title.toLowerCase().includes(q));
    }
    return result.sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [items, search, hideCompleted]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart className="w-4 h-4 text-green-500 flex-shrink-0" />
        <span className="font-semibold text-sm">Items</span>
        <span className="ml-auto text-xs text-neutral-400">{filtered.length}</span>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-green-400"
          />
        </div>
        <button
          onClick={() => setHideCompleted(!hideCompleted)}
          className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
            hideCompleted
              ? 'bg-green-50 border-green-300 text-green-600'
              : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
          }`}
          title={hideCompleted ? 'Show completed' : 'Hide completed'}
        >
          {hideCompleted ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 && (
          <p className="text-xs text-neutral-400 text-center py-8">
            {hideCompleted ? 'All items checked off!' : 'No items yet'}
          </p>
        )}
        {filtered.map(item => (
          <CompactItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function NotesPanel({ notes }: { notes: Note[] }) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { updateNote, deleteNote } = useApp();

  const filtered = useMemo(() => {
    if (!search) return notes;
    const q = search.toLowerCase();
    return notes.filter(n =>
      (n.title || '').toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, search]);

  const selected = notes.find(n => n.id === selectedId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <span className="font-semibold text-sm">Notes</span>
        <span className="ml-auto text-xs text-neutral-400">{filtered.length}</span>
      </div>
      <div className="mb-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 && (
          <p className="text-xs text-neutral-400 text-center py-8">No notes found</p>
        )}
        {filtered.map(note => (
          <button
            key={note.id}
            onClick={() => setSelectedId(selectedId === note.id ? null : note.id)}
            className={`w-full text-left rounded-lg p-2.5 border-2 transition-all ${
              selectedId === note.id
                ? 'border-amber-300 bg-amber-50'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            }`}
          >
            <div className="text-xs font-medium truncate">
              {note.title || note.content.slice(0, 50)}
            </div>
            {note.title && (
              <div className="text-xs text-neutral-400 truncate mt-0.5">
                {note.content.slice(0, 80)}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Note detail (inline edit) */}
      {selected && (
        <div className="mt-3 pt-3 border-t border-neutral-200">
          <input
            type="text"
            value={selected.title || ''}
            onChange={e => updateNote(selected.id, { title: e.target.value })}
            placeholder="Note title"
            className="w-full px-2 py-1.5 text-sm font-medium border border-neutral-200 rounded-lg mb-2 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          <textarea
            value={selected.content}
            onChange={e => updateNote(selected.id, { content: e.target.value })}
            rows={6}
            className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => deleteNote(selected.id)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedId(null)}
              className="ml-auto text-xs text-neutral-400 hover:text-neutral-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarPanel({ events }: { events: CalendarEvent[] }) {
  const now = Date.now();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const tomorrowMs = todayMs + 86400000;

  const upcoming = useMemo(() => {
    return events
      .filter(e => e.startTime >= todayMs)
      .sort((a, b) => a.startTime - b.startTime)
      .slice(0, 20);
  }, [events]);

  const todayEvents = upcoming.filter(e => e.startTime < tomorrowMs);
  const futureEvents = upcoming.filter(e => e.startTime >= tomorrowMs);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-4 h-4 text-purple-500 flex-shrink-0" />
        <span className="font-semibold text-sm">Calendar</span>
        <span className="ml-auto text-xs text-neutral-400">{upcoming.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {upcoming.length === 0 && (
          <p className="text-xs text-neutral-400 text-center py-8">No upcoming events</p>
        )}
        {todayEvents.length > 0 && (
          <div>
            <div className="text-xs font-medium text-neutral-500 mb-1.5">Today</div>
            <div className="space-y-1.5">
              {todayEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
        {futureEvents.length > 0 && (
          <div>
            <div className="text-xs font-medium text-neutral-500 mb-1.5 mt-3">Upcoming</div>
            <div className="space-y-1.5">
              {futureEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: CalendarEvent }) {
  const timeStr = new Date(event.startTime).toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = new Date(event.startTime).toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-2.5">
      <div className="text-xs font-medium">{event.title}</div>
      <div className="text-xs text-neutral-400 mt-0.5">
        {event.allDay ? 'All day' : timeStr}
        {!event.allDay && <span className="ml-2">{dateStr}</span>}
      </div>
      {event.description && (
        <div className="text-xs text-neutral-500 mt-1 truncate">{event.description}</div>
      )}
    </div>
  );
}

// ---- Quick Stats Bar ----

function QuickStats() {
  const { tasks, items } = useApp();
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const openTasks = tasks.filter(t => t.status !== 'done' && !t.archived).length;
  const openItems = items.filter(i => !i.completed).length;
  const overdue = tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== 'done').length;
  const doneThisWeek = tasks.filter(t => t.completedAt && t.completedAt > weekAgo).length;

  const stats = [
    { label: 'Open Tasks', value: openTasks, icon: <CheckCircle className="w-3.5 h-3.5 text-blue-500" />, color: 'text-blue-500' },
    { label: 'Grocery Items', value: openItems, icon: <ShoppingCart className="w-3.5 h-3.5 text-green-500" />, color: 'text-green-500' },
    { label: 'Overdue', value: overdue, icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />, color: 'text-red-500' },
    { label: 'Done This Week', value: doneThisWeek, icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />, color: 'text-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-4">
      {stats.map(s => (
        <div key={s.label} className="bg-white rounded-lg border border-neutral-200 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            {s.icon}
            <span className="text-xs text-neutral-500">{s.label}</span>
          </div>
          <p className="text-xl font-bold">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

// ---- Main Dashboard ----

const PANEL_COMPONENTS: Record<PanelKey, React.FC<any>> = {
  tasks: TasksPanel,
  items: ItemsPanel,
  notes: NotesPanel,
  calendar: CalendarPanel,
};

export const TabletDashboard = () => {
  const { tasks, items, notes, calendarEvents } = useApp();
  const [activePanels, setActivePanels] = useState<PanelKey[]>(['tasks', 'items', 'notes']);

  const availablePanels: PanelConfig[] = [
    { key: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" />, count: tasks.filter(t => t.status !== 'done' && !t.archived).length },
    { key: 'items', label: 'Items', icon: <ShoppingCart className="w-4 h-4" />, count: items.filter(i => !i.completed).length },
    { key: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" />, count: notes.length },
    { key: 'calendar', label: 'Calendar', icon: <CalendarDays className="w-4 h-4" />, count: calendarEvents.filter(e => e.startTime > Date.now()).length },
  ];

  const togglePanel = (key: PanelKey) => {
    setActivePanels(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const columnWidth = activePanels.length === 1 ? 'w-full'
    : activePanels.length === 2 ? 'w-1/2'
    : activePanels.length === 3 ? 'w-1/3'
    : 'w-1/4';

  return (
    <div className="h-screen bg-neutral-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-neutral-700" />
          <h1 className="text-lg font-bold">Dashboard</h1>
        </div>

        {/* Panel toggles */}
        <div className="flex items-center gap-1">
          {availablePanels.map(p => (
            <button
              key={p.key}
              onClick={() => togglePanel(p.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activePanels.includes(p.key)
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              {p.icon}
              <span className="hidden sm:inline">{p.label}</span>
              <span className="ml-0.5 opacity-70">{p.count}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Quick Stats */}
      <div className="px-4 py-3 flex-shrink-0">
        <QuickStats />
      </div>

      {/* Panels */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        {activePanels.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-neutral-400">
              <LayoutDashboard className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select panels above to get started</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex gap-3">
            {activePanels.map(key => {
              const Panel = PANEL_COMPONENTS[key];
              const dataMap: Record<PanelKey, any> = {
                tasks: { tasks: tasks },
                items: { items: items },
                notes: { notes: notes },
                calendar: { events: calendarEvents },
              };
              return (
                <div
                  key={key}
                  className={`${columnWidth} bg-white rounded-xl border border-neutral-200 p-3 overflow-hidden flex flex-col`}
                >
                  <Panel {...dataMap[key]} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
