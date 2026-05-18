import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GroceryCard } from './GroceryCard';
import { NewGlobalHeader } from '../shared/NewGlobalHeader';
import { TopBar } from '../shared/TopBar';
import { ChevronDown, ChevronUp, RotateCcw, ShoppingCart } from 'lucide-react';

export const GroceriesView = () => {
  const { items, addItem, uncheckAllDoneItems, showCompletionMessage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
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
    <div className="min-h-screen bg-neutral-50 pb-[calc(env(safe-area-inset-bottom,0px)+96px)]">
      <TopBar />
      <NewGlobalHeader
        onSearch={setSearchQuery}
        onAdd={handleAddItem}
        searchPlaceholder="Add grocery item..."
        type="item"
      />


      {/* Active items */}
      <div className="max-w-6xl mx-auto px-4">
        {activeItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm">No grocery items</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
