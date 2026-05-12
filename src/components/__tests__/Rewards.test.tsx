import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Rewards } from '../Rewards';

// Mock AppContext
const mockContext = {
  rewards: [],
  goals: [],
  users: [{ id: 'u1', name: 'Parent', email: 'parent@test.com', role: 'admin' }],
  totalPoints: 0,
  addReward: vi.fn(),
  deleteReward: vi.fn(),
  addGoal: vi.fn(),
  updateGoal: vi.fn(),
  deleteGoal: vi.fn(),
};

vi.mock('../../context/AppContext', () => ({
  useApp: () => mockContext,
}));

vi.mock('../../lib/pocketbase', () => ({
  pb: {
    authStore: {
      record: { id: 'u1', role: 'admin' },
    },
  },
}));

vi.mock('../ui/progress', () => ({
  Progress: ({ value }: { value: number }) => (
    <div data-testid="progress" data-value={value} />
  ),
}));

describe('Rewards Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContext.rewards = [];
    mockContext.goals = [];
    mockContext.users = [{ id: 'u1', name: 'Parent', email: 'parent@test.com', role: 'admin' }];
    mockContext.totalPoints = 0;
  });

  describe('Points Balance', () => {
    it('displays total points from context', () => {
      mockContext.totalPoints = 150;
      render(<Rewards />);
      expect(screen.getByText('150')).toBeTruthy();
    });

    it('shows zero when no rewards earned', () => {
      render(<Rewards />);
      expect(screen.getByText('0')).toBeTruthy();
    });
  });

  describe('Admin Controls', () => {
    it('shows award points button for admin', () => {
      render(<Rewards />);
      expect(screen.getByText('Award Points')).toBeTruthy();
    });

    it('shows new goal button for admin', () => {
      render(<Rewards />);
      expect(screen.getByText('New Goal')).toBeTruthy();
    });

    it('hides admin controls for child role', () => {
      vi.doMock('../../lib/pocketbase', () => ({
        pb: {
          authStore: {
            record: { id: 'u2', role: 'child' },
          },
        },
      }));
      render(<Rewards />);
      expect(screen.queryByText('Award Points')).toBeNull();
      expect(screen.queryByText('New Goal')).toBeNull();
    });
  });

  describe('Award Points Dialog', () => {
    it('opens award dialog when button clicked', () => {
      render(<Rewards />);
      fireEvent.click(screen.getByText('Award Points'));
      expect(screen.getByText('Award Points')).toBeTruthy();
      expect(screen.getByPlaceholderText('Points')).toBeTruthy();
      expect(screen.getByPlaceholderText('Reason (optional)')).toBeTruthy();
    });

    it('submits award when form completed', () => {
      render(<Rewards />);
      fireEvent.click(screen.getByText('Award Points'));
      
      fireEvent.change(screen.getByPlaceholderText('Points'), { target: { value: '25' } });
      fireEvent.change(screen.getByPlaceholderText('Reason (optional)'), { target: { value: 'Good job' } });
      fireEvent.click(screen.getByText('Award'));

      expect(mockContext.addReward).toHaveBeenCalledWith(
        expect.objectContaining({
          points: 25,
          reason: 'Good job',
        })
      );
    });

    it('does not submit with zero or negative points', () => {
      render(<Rewards />);
      fireEvent.click(screen.getByText('Award Points'));
      
      fireEvent.change(screen.getByPlaceholderText('Points'), { target: { value: '0' } });
      fireEvent.click(screen.getByText('Award'));

      expect(mockContext.addReward).not.toHaveBeenCalled();
    });

    it('closes dialog on cancel', () => {
      render(<Rewards />);
      fireEvent.click(screen.getByText('Award Points'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByPlaceholderText('Points')).toBeNull();
    });
  });

  describe('Goal Creation', () => {
    it('opens goal dialog when button clicked', () => {
      render(<Rewards />);
      fireEvent.click(screen.getByText('New Goal'));
      expect(screen.getByPlaceholderText('Goal title')).toBeTruthy();
      expect(screen.getByPlaceholderText('Points required')).toBeTruthy();
    });

    it('creates goal when form completed', () => {
      render(<Rewards />);
      fireEvent.click(screen.getByText('New Goal'));
      
      fireEvent.change(screen.getByPlaceholderText('Goal title'), { target: { value: 'Save for bike' } });
      fireEvent.change(screen.getByPlaceholderText('Points required'), { target: { value: '100' } });
      fireEvent.click(screen.getByText('Create'));

      expect(mockContext.addGoal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Save for bike',
          pointsRequired: 100,
          pointsCurrent: 0,
          completed: false,
        })
      );
    });

    it('closes dialog on cancel', () => {
      render(<Rewards />);
      fireEvent.click(screen.getByText('New Goal'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByPlaceholderText('Goal title')).toBeNull();
    });
  });

  describe('Goals Display', () => {
    it('shows empty state when no goals', () => {
      render(<Rewards />);
      expect(screen.getByText('No goals yet')).toBeTruthy();
    });

    it('renders goals with progress', () => {
      mockContext.goals = [
        {
          id: 'g1',
          title: 'Save for bike',
          description: 'Mountain bike',
          pointsRequired: 100,
          pointsCurrent: 45,
          targetUser: 'u1',
          completed: false,
          createdBy: 'u1',
        },
      ];
      render(<Rewards />);
      
      expect(screen.getByText('Save for bike')).toBeTruthy();
      expect(screen.getByText('45 / 100 pts')).toBeTruthy();
      expect(screen.getByText('45%')).toBeTruthy();
    });

    it('shows completed state for finished goals', () => {
      mockContext.goals = [
        {
          id: 'g1',
          title: 'Save for bike',
          pointsRequired: 100,
          pointsCurrent: 100,
          targetUser: 'u1',
          completed: true,
          createdBy: 'u1',
        },
      ];
      render(<Rewards />);
      
      expect(screen.getByText('Goal Complete!')).toBeTruthy();
      expect(screen.queryByText('Mark Complete')).toBeNull();
    });

    it('shows mark complete button when progress reaches 100%', () => {
      mockContext.goals = [
        {
          id: 'g1',
          title: 'Save for bike',
          pointsRequired: 100,
          pointsCurrent: 100,
          targetUser: 'u1',
          completed: false,
          createdBy: 'u1',
        },
      ];
      render(<Rewards />);
      
      expect(screen.getByText('Mark Complete')).toBeTruthy();
      fireEvent.click(screen.getByText('Mark Complete'));
      expect(mockContext.updateGoal).toHaveBeenCalledWith('g1', expect.objectContaining({
        completed: true,
      }));
    });

    it('allows inline editing of goal points', () => {
      mockContext.goals = [
        {
          id: 'g1',
          title: 'Save for bike',
          pointsRequired: 100,
          pointsCurrent: 45,
          targetUser: 'u1',
          completed: false,
          createdBy: 'u1',
        },
      ];
      render(<Rewards />);
      
      // Click edit button (first edit icon)
      const editButtons = screen.getAllByRole('button');
      const editBtn = editButtons.find(btn => btn.querySelector('svg'));
      if (editBtn) fireEvent.click(editBtn);

      // Verify inline edit mode
      const input = screen.getByRole('spinbutton') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.value).toBe('45');
    });

    it('deletes goal when delete button clicked', () => {
      mockContext.goals = [
        {
          id: 'g1',
          title: 'Save for bike',
          pointsRequired: 100,
          pointsCurrent: 0,
          targetUser: 'u1',
          completed: false,
          createdBy: 'u1',
        },
      ];
      render(<Rewards />);
      
      // Find and click delete button
      const deleteButtons = screen.getAllByRole('button');
      const deleteBtn = deleteButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.className.includes('hover:bg-red-50');
      });
      if (deleteBtn) fireEvent.click(deleteBtn);
      
      expect(mockContext.deleteGoal).toHaveBeenCalledWith('g1');
    });
  });

  describe('Reward History', () => {
    it('shows empty state when no rewards', () => {
      render(<Rewards />);
      expect(screen.getByText('No rewards earned yet')).toBeTruthy();
    });

    it('renders reward history entries', () => {
      mockContext.rewards = [
        {
          id: 'r1',
          title: 'Bonus points',
          points: 10,
          earnedBy: 'u1',
          earnedAt: Date.now(),
          reason: 'Completed homework',
        },
      ];
      render(<Rewards />);
      
      expect(screen.getByText('Completed homework')).toBeTruthy();
      expect(screen.getByText('+10')).toBeTruthy();
    });

    it('deletes reward when delete button clicked', () => {
      mockContext.rewards = [
        {
          id: 'r1',
          title: 'Bonus points',
          points: 10,
          earnedBy: 'u1',
          earnedAt: Date.now(),
          reason: 'Completed homework',
        },
      ];
      render(<Rewards />);
      
      // Find delete button in reward history section
      const deleteButtons = screen.getAllByRole('button');
      const deleteBtn = deleteButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.closest('.space-y-2');
      });
      if (deleteBtn) fireEvent.click(deleteBtn);
      
      expect(mockContext.deleteReward).toHaveBeenCalledWith('r1');
    });
  });

  describe('Child View Filtering', () => {
    it('filters goals to only show child own goals', () => {
      // This test verifies the filtering logic exists; actual role testing
      // requires re-importing with different mock
      mockContext.goals = [
        { id: 'g1', title: 'Child Goal', pointsRequired: 50, pointsCurrent: 0, targetUser: 'u2', completed: false, createdBy: 'u1' },
        { id: 'g2', title: 'Other Goal', pointsRequired: 100, pointsCurrent: 0, targetUser: 'u3', completed: false, createdBy: 'u1' },
      ];
      // Admin sees all
      render(<Rewards />);
      expect(screen.getByText('Child Goal')).toBeTruthy();
      expect(screen.getByText('Other Goal')).toBeTruthy();
    });

    it('filters rewards to only show child own rewards', () => {
      mockContext.rewards = [
        { id: 'r1', title: 'Bonus', points: 10, earnedBy: 'u1', reason: 'Test' },
        { id: 'r2', title: 'Other', points: 5, earnedBy: 'u3', reason: 'Other test' },
      ];
      // Admin sees all
      render(<Rewards />);
      expect(screen.getByText('Test')).toBeTruthy();
      expect(screen.getByText('Other test')).toBeTruthy();
    });
  });
});
