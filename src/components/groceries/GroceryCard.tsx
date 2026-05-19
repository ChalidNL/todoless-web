import React, { useState } from 'react';
import { Item } from '../../types';
import { useApp } from '../../context/AppContext';
import { AttributeChip } from '../shared/AttributeChip';
import { Check, Menu, X, Trash2, ShoppingCart, Hash } from 'lucide-react';

interface GroceryCardProps {
  item: Item;
}

type GroceryEditor = 'shop' | 'quantity' | null;

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
  const { updateItem, deleteItem, shops, toggleChipFilter, isChipFilterActive } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [activeEditor, setActiveEditor] = useState<GroceryEditor>(null);
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

            <span className="text-xs font-medium text-neutral-600 border border-neutral-200 rounded px-2 py-0.5">
              {quantity}
            </span>

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

          {/* Line 2: chips — shop only */}
          {currentShop && !item.completed && (
            <div className="flex flex-wrap items-center gap-1 mt-1.5 ml-0.5">
              {currentShop && (
                <AttributeChip
                  icon={<ShoppingCart className="w-3.5 h-3.5" />}
                  label={currentShop.name}
                  color="#10b981"
                  active={isShopFiltered(currentShop.id)}
                  onClick={() => currentShop ? toggleChipFilter('shop', currentShop.id, currentShop.name, '#10b981') : undefined}
                  onRemove={() => updateItem(item.id, { shopId: null })}
                />
              )}
            </div>
          )}

          {/* Layer 3: attributes behind hamburger */}
          {showMenu && (
            <div className="mt-2 pt-2 border-t border-neutral-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveEditor(activeEditor === 'shop' ? null : 'shop')}
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
                  onClick={() => setActiveEditor(activeEditor === 'quantity' ? null : 'quantity')}
                  className={`p-1.5 rounded transition-colors ${activeEditor === 'quantity' ? 'bg-neutral-100 text-neutral-700 ring-1 ring-neutral-300' : 'hover:bg-neutral-100 text-neutral-500'}`}
                  title="*quantity"
                  aria-label="Edit quantity"
                >
                  <Hash className="w-4 h-4" strokeWidth={1.75} />
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
                <div className="mt-2">
                  <div className="flex flex-wrap items-center gap-1">
                    {shops.map((shop) => (
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
                    {shops.length === 0 && (
                      <p className="text-xs text-neutral-400 italic">No shops — add in Settings</p>
                    )}
                  </div>
                  {hasShop && currentShop && (
                    <button
                      onClick={() => updateItem(item.id, { shopId: null })}
                      className="mt-2 text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded flex items-center gap-1"
                      aria-label="Clear shop"
                    >
                      <X className="w-3 h-3" /> Clear shop
                    </button>
                  )}
                </div>
              )}

              {/* Quantity editor */}
              {activeEditor === 'quantity' && (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(quantity - 1)}
                    className="px-2 py-1 text-xs border border-neutral-200 rounded hover:bg-neutral-50"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="min-w-[24px] text-center text-sm font-semibold text-neutral-700">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-2 py-1 text-xs border border-neutral-200 rounded hover:bg-neutral-50"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
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
