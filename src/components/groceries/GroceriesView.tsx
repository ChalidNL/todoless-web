import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GroceryCard } from './GroceryCard';
import { NewGlobalHeader } from '../shared/NewGlobalHeader';
import { TopBar } from '../shared/TopBar';
import { LayoutGrid, List, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

type ViewMode = 'grid' | 'list';

export const GroceriesView = () => {
  const { items, addItem, uncheckAllDoneItems, showCompletionMessage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showBought, setShowBought] = useState(false);

  const activeItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      return !item.completed && matchesSearch;
    });
  }, [items, searchQuery]);

  const boughtItems = useMemo(() => {
    return items.filter(
      (item) => item.completed && item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleAddItem = (value: string) => {
    addItem({
      title: value,
      completed: false,
      quantity: 1,
      labels: [],
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      <TopBar />
      <NewGlobalHeader
        onSearch={setSearchQuery}
        onAdd={handleAddItem}
        searchPlaceholder="Add grocery item..."
        type="item"
      />

      {/* View controls */}
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-white rounded-lg border border-neutral-200 p-1 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-neutral-100' : ''}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4 text-neutral-600" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-neutral-100' : ''}`}
              title="List view"
            >
              <List className="w-4 h-4 text-neutral-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Active items */}
      <div className="max-w-6xl mx-auto px-4">
        {activeItems.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <p className="text-sm">No grocery items</p>
            <p className="text-xs mt-1">Add items using the search bar above</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeItems.map((item) => (
              <GroceryCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {activeItems.map((item) => (
              <GroceryCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Bought items (collapsed by default) */}
        {boughtItems.length > 0 && (
          <div className="mt-6 border-t border-neutral-200 pt-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowBought(!showBought)}
                className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                {showBought ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Bought ({boughtItems.length})
              </button>
              {boughtItems.length > 0 && (
                <button
                  onClick={() => {
                    uncheckAllDoneItems();
                    showCompletionMessage('All groceries unchecked');
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                  title="Uncheck all"
                >
                  <RotateCcw className="w-3 h-3" />
                  Uncheck All
                </button>
              )}
            </div>

            {showBought && (
              <div className={`mt-3 ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2 max-w-2xl'}`}>
                {boughtItems.map((item) => (
                  <GroceryCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
