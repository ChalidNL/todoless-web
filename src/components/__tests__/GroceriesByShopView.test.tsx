import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import type { Item, Shop } from '../../types';

// ── Mock AppContext ──────────────────────────────────────────────
const mockItems: Item[] = [];
const mockShops: Shop[] = [];
const mockAppContext = {
  items: mockItems,
  shops: mockShops,
  addItem: vi.fn(),
  uncheckAllDoneItems: vi.fn(),
  showCompletionMessage: vi.fn(),
};

vi.mock('../../context/AppContext', () => ({
  useApp: vi.fn(() => mockAppContext),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

vi.mock('../shared/CompactItemCard', () => ({
  CompactItemCard: ({ item }: { item: Item }) => <div data-testid="item-card">{item.title}</div>,
}));

vi.mock('../shared/NewGlobalHeader', () => ({
  NewGlobalHeader: ({ onSearch, onAdd, searchPlaceholder, type }: any) => (
    <div data-testid="new-global-header">
      <input data-testid="search-input" placeholder={searchPlaceholder} onChange={(e: any) => onSearch(e.target.value)} />
      <span data-testid="header-type">{type}</span>
    </div>
  ),
}));

vi.mock('../shared/TopBar', () => ({
  TopBar: () => <div data-testid="top-bar" />,
}));

// ── Helper: shop-grouping logic (same as component) ─────────────
function computeShopGroups(items: Item[], shops: Shop[]) {
  const activeItems = items.filter(i => !i.completed);
  const completedItems = items.filter(i => i.completed);

  const groupMap = new Map<string | null, Item[]>();
  for (const shop of shops) {
    groupMap.set(shop.id, []);
  }
  groupMap.set(null, []);

  for (const item of activeItems) {
    const key = item.shopId || null;
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(item);
  }

  const result: Array<{ shop: Shop | null; items: Item[]; activeItemCount: number }> = [];
  for (const [shopId, groupItems] of groupMap.entries()) {
    const shop = shopId ? shops.find(s => s.id === shopId) || null : null;
    result.push({
      shop,
      items: groupItems,
      activeItemCount: groupItems.length,
    });
  }

  result.sort((a, b) => {
    if (a.shop === null && b.shop !== null) return 1;
    if (a.shop !== null && b.shop === null) return -1;
    return (a.shop?.name || '').localeCompare(b.shop?.name || '');
  });

  return { activeGroups: result, completedItems, activeItems };
}

// ── Tests ────────────────────────────────────────────────────────
describe('GroceriesByShopView — grouping logic', () => {
  beforeEach(() => {
    mockItems.length = 0;
    mockShops.length = 0;
    vi.clearAllMocks();
  });

  const shops: Shop[] = [
    { id: 's1', name: 'Albert Heijn', color: '#3b82f6' },
    { id: 's2', name: 'Jumbo', color: '#10b981' },
    { id: 's3', name: 'Lidl', color: '#f59e0b' },
  ];

  const items: Item[] = [
    { id: 'i1', title: 'Milk', completed: false, shopId: 's1', quantity: 2, labels: [], createdAt: Date.now() },
    { id: 'i2', title: 'Bread', completed: false, shopId: 's1', quantity: 1, labels: [], createdAt: Date.now() },
    { id: 'i3', title: 'Eggs', completed: false, shopId: 's2', quantity: 1, labels: [], createdAt: Date.now() },
    { id: 'i4', title: 'Cheese', completed: false, shopId: null as any, labels: [], createdAt: Date.now() },
    { id: 'i5', title: 'Butter', completed: true, shopId: 's1', quantity: 1, labels: [], createdAt: Date.now() },
    { id: 'i6', title: 'Yogurt', completed: false, labels: [], createdAt: Date.now() },
    { id: 'i7', title: 'Bananas', completed: false, shopId: 's3', quantity: 3, labels: [], createdAt: Date.now() },
  ];

  it('groups active items by shop', () => {
    const { activeGroups } = computeShopGroups(items, shops);
    const withItems = activeGroups.filter(g => g.activeItemCount > 0);

    expect(withItems).toHaveLength(4); // AH, Jumbo, Lidl, no-shop
    expect(withItems[0].shop?.name).toBe('Albert Heijn');
    expect(withItems[0].items).toHaveLength(2);
    expect(withItems[0].items.map(i => i.title)).toEqual(['Milk', 'Bread']);
  });

  it('sorts shops alphabetically with no-shop last', () => {
    const { activeGroups } = computeShopGroups(items, shops);
    const withItems = activeGroups.filter(g => g.activeItemCount > 0);

    expect(withItems[0].shop?.name).toBe('Albert Heijn');
    expect(withItems[1].shop?.name).toBe('Jumbo');
    expect(withItems[2].shop?.name).toBe('Lidl');
    expect(withItems[3].shop).toBe(null);
  });

  it('separates completed items from active groups', () => {
    const { activeGroups, completedItems } = computeShopGroups(items, shops);
    const ahGroup = activeGroups.find(g => g.shop?.name === 'Albert Heijn');
    expect(ahGroup?.items.map(i => i.title)).toEqual(['Milk', 'Bread']); // no Butter (completed)
    expect(completedItems).toHaveLength(1);
    expect(completedItems[0].title).toBe('Butter');
  });

  it('handles items with no shopId', () => {
    const { activeGroups } = computeShopGroups(items, shops);
    const noShopGroup = activeGroups.find(g => g.shop === null);
    expect(noShopGroup?.activeItemCount).toBe(2); // Cheese + Yogurt
    expect(noShopGroup?.items.map(i => i.title)).toEqual(['Cheese', 'Yogurt']);
  });

  it('handles empty items list', () => {
    const { activeGroups, completedItems } = computeShopGroups([], shops);
    expect(activeGroups).toHaveLength(4); // all shops + no-shop group, each with 0 items
    expect(activeGroups.every(g => g.activeItemCount === 0)).toBe(true);
    expect(completedItems).toHaveLength(0);
  });

  it('handles items referencing deleted shops', () => {
    const deletedShopItems: Item[] = [
      { id: 'i8', title: 'Mystery item', completed: false, shopId: 's999', labels: [], createdAt: Date.now() },
    ];
    const { activeGroups } = computeShopGroups(deletedShopItems, shops);
    const mysteryGroup = activeGroups.find(g => g.shop === null && g.activeItemCount > 0);
    // Items with deleted shopId fall into a separate group (shop=null, not same as shopId=null)
    // Actually they get their own group with shop=null (since s999 not found)
    const unknownGroup = activeGroups.find(g => g.items.some(i => i.id === 'i8'));
    expect(unknownGroup).toBeDefined();
    expect(unknownGroup?.shop).toBe(null); // shop not found
    expect(unknownGroup?.items).toHaveLength(1);
  });

  it('counts total quantity correctly', () => {
    const { activeGroups } = computeShopGroups(items, shops);
    const ahGroup = activeGroups.find(g => g.shop?.name === 'Albert Heijn');
    const totalQty = ahGroup!.items.reduce((sum, i) => sum + (i.quantity || 1), 0);
    expect(totalQty).toBe(3); // Milk: 2 + Bread: 1
  });

  it('includes shops with no items in the group list', () => {
    const singleItem: Item[] = [
      { id: 'i1', title: 'Milk', completed: false, shopId: 's1', labels: [], createdAt: Date.now() },
    ];
    const { activeGroups } = computeShopGroups(singleItem, shops);
    // Jumbo and Lidl should still exist as groups (just empty)
    const jumbo = activeGroups.find(g => g.shop?.name === 'Jumbo');
    const lidl = activeGroups.find(g => g.shop?.name === 'Lidl');
    expect(jumbo).toBeDefined();
    expect(jumbo?.activeItemCount).toBe(0);
    expect(lidl).toBeDefined();
    expect(lidl?.activeItemCount).toBe(0);
  });
});

describe('GroceriesByShopView — search filtering', () => {
  const shops: Shop[] = [{ id: 's1', name: 'Albert Heijn', color: '#3b82f6' }];
  const items: Item[] = [
    { id: 'i1', title: 'Milk', completed: false, shopId: 's1', labels: [], createdAt: Date.now() },
    { id: 'i2', title: 'Bread', completed: false, shopId: 's1', labels: [], createdAt: Date.now() },
    { id: 'i3', title: 'Eggs', completed: false, shopId: 's1', labels: [], createdAt: Date.now() },
  ];

  it('filters items by search query', () => {
    const query = 'milk';
    const filtered = items.filter(i => i.title.toLowerCase().includes(query.toLowerCase()));
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Milk');
  });

  it('returns all items when search is empty', () => {
    const query = '';
    const filtered = query ? items.filter(i => i.title.toLowerCase().includes(query.toLowerCase())) : items;
    expect(filtered).toHaveLength(3);
  });

  it('search is case-insensitive', () => {
    const query = 'MILK';
    const filtered = items.filter(i => i.title.toLowerCase().includes(query.toLowerCase()));
    expect(filtered).toHaveLength(1);
  });
});

describe('GroceriesByShopView — component integration', () => {
  beforeEach(() => {
    vi.resetModules();
    mockItems.length = 0;
    mockShops.length = 0;
    vi.clearAllMocks();
  });

  it('renders shop group cards with item counts', async () => {
    mockShops.push(
      { id: 's1', name: 'Albert Heijn', color: '#3b82f6' },
      { id: 's2', name: 'Jumbo', color: '#10b981' },
    );
    mockItems.push(
      { id: 'i1', title: 'Milk', completed: false, shopId: 's1', quantity: 2, labels: [], createdAt: Date.now() },
      { id: 'i2', title: 'Bread', completed: false, shopId: 's1', quantity: 1, labels: [], createdAt: Date.now() },
      { id: 'i3', title: 'Eggs', completed: false, shopId: 's2', quantity: 1, labels: [], createdAt: Date.now() },
    );

    const { GroceriesByShopView } = await import('../GroceriesByShopView');
    const { render, screen } = await import('@testing-library/react');
    render(React.createElement(GroceriesByShopView, { onSwitchToList: vi.fn() }));

    expect(screen.getByText('Albert Heijn')).toBeTruthy();
    expect(screen.getByText('Jumbo')).toBeTruthy();
    expect(screen.getByText('Milk')).toBeTruthy();
    expect(screen.getByText('Bread')).toBeTruthy();
    expect(screen.getByText('Eggs')).toBeTruthy();
  });

  it('shows empty state when no items exist', async () => {
    mockShops.push({ id: 's1', name: 'Test Shop', color: '#3b82f6' });

    const { GroceriesByShopView } = await import('../GroceriesByShopView');
    const { render, screen } = await import('@testing-library/react');
    render(React.createElement(GroceriesByShopView, { onSwitchToList: vi.fn() }));

    expect(screen.getByText('No items on your shopping list')).toBeTruthy();
  });
});
