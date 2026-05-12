import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GroceryCard } from './GroceryCard';
import { NewGlobalHeader } from '../shared/NewGlobalHeader';
import { TopBar } from '../shared/TopBar';
import { LayoutGrid, List, Filter, ChevronDown, ChevronUp } from 'lucide-react';

type ViewMode = 'grid' | 'list';
type StockFilter = 'all' | 'missing' | 'few' | 'instock' | 'bought';

export const GroceriesView = () => {
  const { items, addItem } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [showBought, setShowBought] = useState(false);

  // Derive stock status for filtering
  const getStockStatus = (item: typeof items[number]): StockFilter => {
    if (item.completed) return 'bought';
    const qty = item.quantity ?? 0;
    if (qty === 0) return 'missing';
    if (qty === 1) return 'few';
    return 'instock';
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const status = getStockStatus(item);

      // Bought items are shown in a separate section
      if (status === 'bought') return false;

      // Apply stock filter
      if (stockFilter !== 'all' && status !== stockFilter) return false;

      return matchesSearch;
    });
  }, [items, searchQuery, stockFilter]);

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

  // Filter bar buttons
  const filters: { key: StockFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'missing', label: 'Missing' },
    { key: 'few', label: 'Few' },
    { key: 'instock', label: 'In Stock' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <TopBar />
      <NewGlobalHeader
        onSearch={setSearchQuery}
        onAdd={handleAddItem}
        searchPlaceholder="Add grocery item..."
        type="item"
      />

      {/* Filter & view controls */}
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stock filter pills */}
          <div className="flex items-center gap-1 bg-white rounded-lg border border-neutral-200 p-1">
            <Filter className="w-3.5 h-3.5 text-neutral-400 ml-1" />
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setStockFilter(f.key)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  stockFilter === f.key
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

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

      {/* Items grid/list */}
      <div className="max-w-6xl mx-auto px-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <p className="text-sm">No grocery items</p>
            <p className="text-xs mt-1">Add items using the search bar above</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map((item) => (
              <GroceryCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {filteredItems.map((item) => (
              <GroceryCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Bought items (collapsed by default) */}
        {boughtItems.length > 0 && (
          <div className="mt-6 border-t border-neutral-200 pt-4">
            <button
              onClick={() => setShowBought(!showBought)}
              className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
            >
              {showBought ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Bought ({boughtItems.length})
            </button>

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
