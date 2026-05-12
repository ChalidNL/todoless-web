import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CompactItemCard } from './shared/CompactItemCard';
import { NewGlobalHeader } from './shared/NewGlobalHeader';
import { TopBar } from './shared/TopBar';
import { Store, Package, RotateCcw, ChevronDown, ChevronUp, Plus, LayoutList } from 'lucide-react';
import type { Item, Shop } from '../types';

interface GroceriesByShopViewProps {
  onSwitchToList?: () => void;
}

interface ShopGroup {
  shop: Shop | null; // null = "No shop assigned"
  items: Item[];
  activeItemCount: number;
}

export const GroceriesByShopView = ({ onSwitchToList }: GroceriesByShopViewProps) => {
  const { items, addItem, shops, uncheckAllDoneItems, showCompletionMessage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedShops, setCollapsedShops] = useState<Set<string>>(new Set());
  const [showCheckedOut, setShowCheckedOut] = useState(false);

  const handleAddItem = (value: string, metadata?: { assignee?: string; labels?: string[]; dueDate?: number }) => {
    addItem({
      title: value,
      completed: false,
      assignedTo: metadata?.assignee,
      labels: metadata?.labels || [],
      dueDate: metadata?.dueDate,
    });
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => item.title.toLowerCase().includes(q));
  }, [items, searchQuery]);

  const shopGroups = useMemo((): ShopGroup[] => {
    const activeItems = filteredItems.filter(i => !i.completed);
    const completedItems = filteredItems.filter(i => i.completed);

    // Build groups for active items
    const groupMap = new Map<string | null, Item[]>();

    // Initialize groups for all shops (even if no items yet)
    for (const shop of shops) {
      groupMap.set(shop.id, []);
    }
    // "No shop" group
    groupMap.set(null, []);

    // Assign items to groups
    for (const item of activeItems) {
      const key = item.shopId || null;
      if (!groupMap.has(key)) {
        // Shop was deleted but items still reference it
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(item);
    }

    // Convert to array, sort by shop name, put "no shop" last
    const result: ShopGroup[] = [];
    for (const [shopId, groupItems] of groupMap.entries()) {
      const shop = shopId ? shops.find(s => s.id === shopId) || null : null;
      result.push({
        shop,
        items: groupItems,
        activeItemCount: groupItems.length,
      });
    }

    result.sort((a, b) => {
      // "No shop" group always last
      if (a.shop === null && b.shop !== null) return 1;
      if (a.shop !== null && b.shop === null) return -1;
      return (a.shop?.name || '').localeCompare(b.shop?.name || '');
    });

    return result;
  }, [filteredItems, shops]);

  const completedItems = filteredItems.filter(i => i.completed);

  const toggleShop = (shopId: string) => {
    setCollapsedShops(prev => {
      const next = new Set(prev);
      if (next.has(shopId)) {
        next.delete(shopId);
      } else {
        next.add(shopId);
      }
      return next;
    });
  };

  const getShopKey = (shop: Shop | null): string => shop?.id || '__no_shop__';

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <TopBar />
      <NewGlobalHeader
        onSearch={setSearchQuery}
        onAdd={handleAddItem}
        searchPlaceholder="Search items or add with @user #label //date..."
        type="item"
      />

      {/* View controls */}
      <div className="max-w-4xl mx-auto px-4 pt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-neutral-500" />
            <span className="text-xs text-neutral-500">Shop View</span>
          </div>
          <button
            onClick={onSwitchToList}
            className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
            title="Switch to list view"
          >
            <LayoutList className="w-3 h-3" />
            List
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-2 space-y-3">
        {/* Shop groups */}
        {shopGroups
          .filter(group => group.activeItemCount > 0 || group.shop !== null)
          .map(group => {
            const key = getShopKey(group.shop);
            const isCollapsed = collapsedShops.has(key);
            const shopName = group.shop?.name || 'No Shop';
            const shopColor = group.shop?.color || '#6b7280';
            const itemCount = group.items.length;
            const totalQty = group.items.reduce((sum, i) => sum + (i.quantity || 1), 0);

            // Skip empty shop cards (except "no shop" which we show if it has items)
            if (itemCount === 0 && group.shop !== null) return null;

            return (
              <div
                key={key}
                className="bg-white rounded-lg border-2 border-neutral-200 overflow-hidden"
              >
                {/* Shop header */}
                <button
                  onClick={() => toggleShop(key)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${shopColor}15` }}
                  >
                    {group.shop ? (
                      <Store className="w-4 h-4" style={{ color: shopColor }} />
                    ) : (
                      <Package className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-semibold text-neutral-900">{shopName}</h3>
                    <p className="text-xs text-neutral-500">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      {totalQty > itemCount ? ` • ${totalQty} total` : ''}
                    </p>
                  </div>
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  )}
                </button>

                {/* Items */}
                {!isCollapsed && (
                  <div className="px-4 pb-3 space-y-2 border-t border-neutral-100 pt-2">
                    {group.items.length === 0 ? (
                      <p className="text-xs text-neutral-400 py-2">No items for this shop yet</p>
                    ) : (
                      group.items.map(item => (
                        <CompactItemCard key={item.id} item={item} />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}

        {/* Empty state */}
        {shopGroups.every(g => g.activeItemCount === 0) && (
          <div className="text-center py-12">
            <Store className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">No items on your shopping list</p>
            <p className="text-xs text-neutral-400 mt-1">Add items above to get started</p>
          </div>
        )}

        {/* Checked out items */}
        {completedItems.length > 0 && (
          <div className="border-t border-neutral-200 pt-4">
            <div className="flex items-center justify-between w-full px-1 mb-2">
              <button
                onClick={() => setShowCheckedOut(!showCheckedOut)}
                className="flex items-center gap-2"
              >
                <h2 className="text-sm font-semibold text-neutral-700">
                  Checked Out ({completedItems.length})
                </h2>
                {showCheckedOut ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                )}
              </button>

              <button
                onClick={() => {
                  uncheckAllDoneItems();
                  showCompletionMessage('All items checked back in');
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                title="Check in all items"
              >
                <RotateCcw className="w-3 h-3" />
                Check In All
              </button>
            </div>

            {showCheckedOut && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {completedItems.map(item => (
                  <CompactItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
