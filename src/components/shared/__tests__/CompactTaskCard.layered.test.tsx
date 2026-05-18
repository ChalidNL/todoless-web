import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../../context/AppContext', () => ({
  useApp: vi.fn(),
}));

const { CompactTaskCard } = await import('../CompactTaskCard');
const { useApp } = await import('../../../context/AppContext');

const mockUpdateTask = vi.fn();
const mockDeleteTask = vi.fn();

const baseTask = {
  id: 'task-1',
  title: 'Pay bills',
  status: 'todo',
  blocked: false,
  labels: [],
  flag: false,
  createdAt: Date.now(),
};

describe('CompactTaskCard layered attributes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useApp as any).mockReturnValue({
      updateTask: mockUpdateTask,
      deleteTask: mockDeleteTask,
      addLabel: vi.fn(() => ({ id: 'new-label', name: 'new', color: '#3b82f6' })),
      labels: [{ id: 'l1', name: 'home', color: '#3b82f6' }],
      users: [{ id: 'u1', name: 'Chalid', role: 'admin' }],
    });
  });

  it('hides task attributes until hamburger is tapped', () => {
    render(<CompactTaskCard task={baseTask as any} />);

    expect(screen.queryByLabelText('Edit labels')).toBeNull();
    expect(screen.queryByLabelText('Edit assignee')).toBeNull();
    expect(screen.queryByLabelText('Edit due date and recurring')).toBeNull();
    expect(screen.queryByLabelText('Toggle flag')).toBeNull();

    fireEvent.click(screen.getByLabelText('Open task attributes'));

    expect(screen.getByLabelText('Edit labels')).toBeTruthy();
    expect(screen.getByLabelText('Edit assignee')).toBeTruthy();
    expect(screen.getByLabelText('Edit due date and recurring')).toBeTruthy();
    expect(screen.getByLabelText('Edit task title')).toBeTruthy();
    expect(screen.getByLabelText('Toggle flag')).toBeTruthy();
    expect(screen.getByLabelText('Delete task')).toBeTruthy();
  });

  it('opens task text editor from menu and updates title on Enter', () => {
    render(<CompactTaskCard task={baseTask as any} />);
    fireEvent.click(screen.getByLabelText('Open task attributes'));

    const input = screen.getByLabelText('Edit task title');
    fireEvent.change(input, { target: { value: 'Pay rent' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockUpdateTask).toHaveBeenCalledWith('task-1', { title: 'Pay rent' });
  });

  it('shows label text input in layer 3 when label icon is tapped', () => {
    render(<CompactTaskCard task={baseTask as any} />);
    fireEvent.click(screen.getByLabelText('Open task attributes'));
    fireEvent.click(screen.getByLabelText('Edit labels'));

    expect(screen.getByLabelText('Label input')).toBeTruthy();
  });

  it('flag toggles blocked visual state and does not open detail row', () => {
    const { container } = render(<CompactTaskCard task={baseTask as any} />);
    fireEvent.click(screen.getByLabelText('Open task attributes'));
    fireEvent.click(screen.getByLabelText('Toggle flag'));

    expect(mockUpdateTask).toHaveBeenCalledWith('task-1', { flag: true, blocked: true });
    expect(screen.queryByText('Flagged')).toBeNull();

    const root = container.firstChild as HTMLElement;
    expect(root.className.includes('bg-white')).toBeTruthy();
  });

  it('renders light red tinted card when task is flagged/blocked', () => {
    const { container } = render(
      <CompactTaskCard task={{ ...baseTask, flag: true, blocked: true } as any} />
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className.includes('bg-red-50')).toBeTruthy();
    expect(root.className.includes('border-red-200')).toBeTruthy();
  });
});
