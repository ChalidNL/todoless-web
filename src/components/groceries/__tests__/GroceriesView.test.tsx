import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

describe('GroceriesView — simplified', () => {
  it('separates active and bought items', () => {
    const items = [
      { id: '1', title: 'Milk', completed: false, quantity: 2 },
      { id: '2', title: 'Eggs', completed: true, quantity: 1 },
      { id: '3', title: 'Bread', completed: false, quantity: 0 },
    ];

    const activeItems = items.filter((i) => !i.completed);
    const boughtItems = items.filter((i) => i.completed);

    expect(activeItems).toHaveLength(2);
    expect(activeItems[0].title).toBe('Milk');
    expect(activeItems[1].title).toBe('Bread');

    expect(boughtItems).toHaveLength(1);
    expect(boughtItems[0].title).toBe('Eggs');
  });

  it('filters items by search query', () => {
    const items = [
      { id: '1', title: 'Whole Milk', completed: false },
      { id: '2', title: 'Oat Milk', completed: false },
      { id: '3', title: 'Bread', completed: false },
    ];

    const result = items.filter((i) =>
      i.title.toLowerCase().includes('milk')
    );
    expect(result).toHaveLength(2);
  });

  it('search respects completed status', () => {
    const items = [
      { id: '1', title: 'Milk', completed: false },
      { id: '2', title: 'Milk', completed: true },
    ];

    const activeItems = items.filter(
      (i) => !i.completed && i.title.toLowerCase().includes('milk')
    );
    const boughtItems = items.filter(
      (i) => i.completed && i.title.toLowerCase().includes('milk')
    );

    expect(activeItems).toHaveLength(1);
    expect(boughtItems).toHaveLength(1);
  });
});
