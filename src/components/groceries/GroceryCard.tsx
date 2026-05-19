import React, { useState } from 'react';
import { Item } from '../../types';
import { useApp } from '../../context/AppContext';
import { AttributeChip } from '../shared/AttributeChip';
import { Check, Menu, X, Trash2, ShoppingCart } from 'lucide-react';

interface GroceryCardProps {
  item: Item;
}

type GroceryEditor = 'shop' | null;

const DeleteConfirm = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
    <div className="bg-white rounded-lg shadow-xl p-5 mx-4 max-w-xs w-full">
      <p className="text-sm font-medium text-neutral-900 mb-4">Weet je het zeker?</p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
        >
          Nee
        </button>
        <button
          onClick={onConfirm}
          className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
        >
          Ja, verwijderen
        </button>
      </div>
    </div>
  </div>
);

export const GroceryCard = ({ item }: GroceryCardProps) => {
  const { updateItem, deleteItem, shops, addShop, isChipFilterActive } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [activeEditor, setActiveEditor] = useState<GroceryEditor>(null);
  const [shopInput, setShopInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const quantity = item.quantity ?? 1;
  const currentShop = item.shopId ? shops.find((s) => s.id === item.shopId) : null;

  const handleToggle = () => {
    updateItem(item.id, { completed: !item.completed });
  };

  const setQuantity = (next: number) => {
    updateItem(item.id, { quantity: Math.max(0, next) });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    deleteItem(item.id);
    setShowMenu(false);
    setActiveEditor(null);
  };

  const hasShop = !!item.shopId;
  const visibleShops = shops.filter((shop) => shop.name.toLowerCase().includes(shopInput.toLowerCase()));
  const isShopFiltered = (id?: string) => id ? isChipFilterActive('shop', id) : false;

  return (
    <>
      <div
        className={`rounded-lg border transition-colors ${
          item.completed ? 'border-neutral-200 opacity-75' : 'border-neutral-200 hover:border-neutral-300'
        } bg-white`}
      >
        <div className="p-2.5">
          {/* Layer 1: checkbox + description + hamburger */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggle}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                item.completed
                  ? 'bg-neutral-900 border-neutral-900 text-white'
                  : 'border-neutral-300 hover:border-neutral-500'
              }`}
              aria-label={item.completed ? 'Mark as not bought' : 'Mark as bought'}
            >
              {item.completed && <Check className="w-3 h-3" />}
            </button>

            <span
              className={`text-sm font-medium flex-1 truncate ${
                item.completed ? 'line-through text-neutral-400' : 'text-neutral-900'
              }`}
            >
              {item.title}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setQuantity(quantity - 1)}
                className="w-6 h-6 text-xs border border-neutral-200 rounded hover:bg-neutral-50 text-neutral-700"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="text-xs font-medium text-neutral-600 border border-neutral-200 rounded px-2 py-0.5 min-w-[28px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-6 h-6 text-xs border border-neutral-200 rounded hover:bg-neutral-50 text-neutral-700"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              onClick={() => {
                const next = !showMenu;
                setShowMenu(next);
                setActiveEditor(next ? activeEditor : null);
              }}
              className="p-1 hover:bg-neutral-100 rounded transition-colors flex-shrink-0"
              aria-label="Open item attributes"
            >
              {showMenu ? <X className="w-4 h-4 text-neutral-600" /> : <Menu className="w-4 h-4 text-neutral-400" />}
            </button>
          </div>

          {/* Line 2: chip — shop only */}
          {currentShop && !item.completed && (
            <div className="flex flex-wrap items-center gap-1 mt-1.5 ml-0.5">
              <AttributeChip
                icon={<ShoppingCart className="w-3.5 h-3.5" />}
                label={currentShop.name}
                color="#10b981"
                active={isShopFiltered(currentShop.id)}
                onClick={showMenu ? () => updateItem(item.id, { shopId: null }) : () => setActiveEditor('shop')}
              />
            </div>
          )}

          {/* Layer 3: attributes behind hamburger */}
          {showMenu && (
            <div className="mt-2 pt-2 border-t border-neutral-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = activeEditor === 'shop' ? null : 'shop';
                    setActiveEditor(next);
                    if (next) setShopInput('');
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    hasShop || activeEditor === 'shop'
                      ? 'bg-green-100 text-green-700'
                      : 'hover:bg-neutral-100 text-neutral-500'
                  }`}
                  title="$shop"
                  aria-label="Edit shop"
                >
                  <ShoppingCart className="w-4 h-4" strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 rounded transition-colors text-red-600 hover:bg-red-50"
                  title="delete"
                  aria-label="Delete item"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>

              {/* Shop editor */}
              {activeEditor === 'shop' && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={shopInput}
                      onChange={(e) => setShopInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const name = shopInput.trim();
                          if (!name) return;
                          const existing = shops.find((s) => s.name.toLowerCase() === name.toLowerCase());
                          if (existing) {
                            updateItem(item.id, { shopId: existing.id });
                          } else {
                            addShop({ name, color: '#10b981' });
                          }
                          setShopInput('');
                        }
                      }}
                      placeholder="Type shop + Enter..."
                      className="flex-1 text-sm px-2 py-1.5 border border-neutral-200 rounded"
                      aria-label="Shop input"
                    />
                    {hasShop && (
                      <button
                        onClick={() => updateItem(item.id, { shopId: null })}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded text-sm"
                        aria-label="Clear shop"
                        title="Clear shop"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {visibleShops.map((shop) => (
                      <button
                        key={shop.id}
                        onClick={() => updateItem(item.id, { shopId: item.shopId === shop.id ? null : shop.id })}
                      >
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 h-7 rounded-full text-xs font-normal leading-none border ${
                            item.shopId === shop.id ? 'ring-2 ring-neutral-900' : 'hover:border-neutral-400'
                          }`}
                          style={{
                            backgroundColor: item.shopId === shop.id ? `${shop.color || '#10b981'}20` : undefined,
                            color: item.shopId === shop.id ? shop.color || '#10b981' : undefined,
                            borderColor: item.shopId === shop.id ? `${shop.color || '#10b981'}40` : '#e5e7eb',
                          }}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {shop.name}
                        </span>
                      </button>
                    ))}
                    {visibleShops.length === 0 && (
                      <p className="text-xs text-neutral-400 italic">No shops found</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirm
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
};
