import { describe, it, expect } from 'vitest';
import { generateBurndownData, computeSprintStats } from '../Dashboard';

const DAY = 86400000;
const sprintStart = Date.now() - 7 * DAY; // 7 days ago
const sprintEnd = sprintStart + 14 * DAY;  // 14-day sprint
const now = Date.now();

// Helper: create a task completed at a given offset from sprint start
const task = (completedAt?: number) => ({ completedAt });

describe('generateBurndownData', () => {
  it('returns empty array for zero tasks', () => {
    const result = generateBurndownData([], sprintStart, sprintEnd, now);
    expect(result).toEqual([]);
  });

  it('generates one point per day from sprint start to now', () => {
    const tasks = [task()]; // uncompleted task
    const result = generateBurndownData(tasks, sprintStart, sprintEnd, now);
    // 7 full days have passed (sprint started 7 days ago)
    expect(result.length).toBeGreaterThanOrEqual(7);
    expect(result.length).toBeLessThanOrEqual(8); // timezone edge

    // First point should show all tasks remaining
    expect(result[0].remaining).toBe(1);
    expect(result[0].ideal).toBe(1); // day 0, ideal = total
  });

  it('shows decreasing remaining count as tasks are completed', () => {
    const completedEarly = sprintStart + 1 * DAY; // day 1
    const completedMid = sprintStart + 3 * DAY;   // day 3
    const tasks = [
      task(completedEarly),
      task(completedMid),
      task(), // not completed
    ];
    const result = generateBurndownData(tasks, sprintStart, sprintEnd, now);

    // Day 0: 0 done, 3 remaining
    expect(result[0].remaining).toBe(3);
    expect(result[0].completed).toBe(0);

    // Find day 2 (after first completion at day 1)
    const day2 = result.find(d => d.dateLabel.includes('2')) || result[2];
    // By day 2, task completed at day 1 should be counted
    expect(day2.completed).toBeGreaterThanOrEqual(1);
  });

  it('computes ideal line as linear from total to 0', () => {
    const tasks = [task(), task(), task(), task()]; // 4 tasks
    const shortStart = now - 3 * DAY;
    const shortEnd = now + 3 * DAY; // 6-day sprint, now at day 3
    const result = generateBurndownData(tasks, shortStart, shortEnd, now);

    // First point: ideal = total (4)
    expect(result[0].ideal).toBe(4);
    // Last point (now = midpoint): ideal should be roughly half
    const last = result[result.length - 1];
    expect(last.ideal).toBeLessThanOrEqual(2);
    expect(last.ideal).toBeGreaterThanOrEqual(1);
  });

  it('clamps ideal to minimum 0', () => {
    const tasks = [task()]; // 1 task
    const shortStart = now - 1 * DAY;
    const shortEnd = now; // sprint ended exactly now
    const result = generateBurndownData(tasks, shortStart, shortEnd, now);

    const last = result[result.length - 1];
    expect(last.ideal).toBeGreaterThanOrEqual(0);
  });

  it('stops at sprint end even if now is past it', () => {
    const tasks = [task()];
    const pastStart = now - 20 * DAY;
    const pastEnd = now - 10 * DAY; // sprint ended 10 days ago
    const result = generateBurndownData(tasks, pastStart, pastEnd, now);

    // Should generate points only from start to end (10 days), not to now
    expect(result.length).toBe(11); // start + 10 days inclusive
  });

  it('uses readable date labels (short month + day)', () => {
    const tasks = [task()];
    const fixedStart = 1715000000000; // May 6, 2024
    const fixedEnd = fixedStart + 7 * DAY;
    const fixedNow = fixedStart + 3 * DAY;
    const result = generateBurndownData(tasks, fixedStart, fixedEnd, fixedNow);

    // Labels should be like "May 6", not "Monday"
    expect(result[0].dateLabel).toMatch(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d+$/);
  });

  it('includes ISO date field for data key', () => {
    const tasks = [task()];
    const fixedStart = 1715000000000;
    const fixedEnd = fixedStart + 7 * DAY;
    const fixedNow = fixedStart + 1 * DAY;
    const result = generateBurndownData(tasks, fixedStart, fixedEnd, fixedNow);

    expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('tracks cumulative completed correctly', () => {
    const day1 = sprintStart + 1 * DAY;
    const day2 = sprintStart + 2 * DAY;
    const day4 = sprintStart + 4 * DAY;
    const tasks = [
      task(day1),
      task(day2),
      task(day4),
      task(), // never completed
      task(), // never completed
    ];

    const shortNow = sprintStart + 5 * DAY;
    const result = generateBurndownData(tasks, sprintStart, sprintEnd, shortNow);

    // By day 5, 3 tasks should be completed
    const last = result[result.length - 1];
    expect(last.completed).toBe(3);
    expect(last.remaining).toBe(2);
  });

  it('handles tasks completed before sprint start', () => {
    // Task completed before sprint started
    const beforeSprint = sprintStart - 1 * DAY;
    const tasks = [task(beforeSprint), task(sprintStart + 2 * DAY)];
    const shortNow = sprintStart + 3 * DAY;
    const result = generateBurndownData(tasks, sprintStart, sprintEnd, shortNow);

    // Task completed before sprint start: its completedAt falls in a day bucket
    // that is before sprintStart, so it won't be counted in any sprint day
    // (the loop starts at sprintStart)
    // Only the task completed at day 2 should be counted
    const last = result[result.length - 1];
    expect(last.completed).toBe(1);
    expect(last.remaining).toBe(1);
  });
});

describe('computeSprintStats', () => {
  const makeTask = (sprintId: string, status: string, completedAt?: number, archived?: boolean) => ({
    sprintId,
    status,
    completedAt,
    archived,
  });

  it('computes correct totals for a sprint', () => {
    const sprintId = 'sprint-1';
    const tasks = [
      makeTask(sprintId, 'done', now - 2 * DAY),
      makeTask(sprintId, 'done', now - 1 * DAY),
      makeTask(sprintId, 'todo'),
      makeTask(sprintId, 'backlog'),
      makeTask('other-sprint', 'done'), // different sprint
    ];

    const shortStart = now - 7 * DAY;
    const shortEnd = now + 7 * DAY;
    const stats = computeSprintStats(tasks, sprintId, shortStart, shortEnd, now);

    expect(stats.totalTasks).toBe(4);
    expect(stats.completedTasks).toBe(2);
    expect(stats.completionPct).toBe(50);
  });

  it('excludes archived tasks', () => {
    const sprintId = 'sprint-1';
    const tasks = [
      makeTask(sprintId, 'done', now, false),
      makeTask(sprintId, 'todo', undefined, true), // archived
    ];

    const shortStart = now - 7 * DAY;
    const shortEnd = now + 7 * DAY;
    const stats = computeSprintStats(tasks, sprintId, shortStart, shortEnd, now);

    expect(stats.totalTasks).toBe(1);
  });

  it('calculates velocity as tasks per day', () => {
    const sprintId = 'sprint-1';
    const tasks = [
      makeTask(sprintId, 'done', now - 1 * DAY),
      makeTask(sprintId, 'done', now),
      makeTask(sprintId, 'todo'),
    ];

    const shortStart = now - 2 * DAY;
    const shortEnd = now + 5 * DAY;
    const stats = computeSprintStats(tasks, sprintId, shortStart, shortEnd, now);

    // 2 tasks completed over 2 days
    expect(stats.velocity).toBe(1);
  });

  it('reports zero velocity when no days elapsed', () => {
    const sprintId = 'sprint-1';
    const tasks: Array<{ sprintId: string; status: string; completedAt?: number; archived?: boolean }> = [];

    const futureStart = now + 1 * DAY;
    const futureEnd = futureStart + 7 * DAY;
    const stats = computeSprintStats(tasks, sprintId, futureStart, futureEnd, now);

    expect(stats.velocity).toBe(0);
  });

  it('identifies active vs over sprints', () => {
    const sprintId = 'sprint-1';
    const tasks: Array<{ sprintId: string; status: string; completedAt?: number; archived?: boolean }> = [];

    // Past sprint
    const pastStart = now - 14 * DAY;
    const pastEnd = now - 7 * DAY;
    const pastStats = computeSprintStats(tasks, sprintId, pastStart, pastEnd, now);
    expect(pastStats.isSprintActive).toBe(false);
    expect(pastStats.isSprintOver).toBe(true);

    // Future sprint
    const futureStart = now + 7 * DAY;
    const futureEnd = futureStart + 7 * DAY;
    const futureStats = computeSprintStats(tasks, sprintId, futureStart, futureEnd, now);
    expect(futureStats.isSprintActive).toBe(false);
    expect(futureStats.isSprintOver).toBe(false);

    // Current sprint
    const currentStart = now - 3 * DAY;
    const currentEnd = now + 4 * DAY;
    const currentStats = computeSprintStats(tasks, sprintId, currentStart, currentEnd, now);
    expect(currentStats.isSprintActive).toBe(true);
    expect(currentStats.isSprintOver).toBe(false);
  });

  it('calculates days remaining correctly', () => {
    const sprintId = 'sprint-1';
    const tasks: Array<{ sprintId: string; status: string; completedAt?: number; archived?: boolean }> = [];

    const start = now - 4 * DAY;
    const end = now + 3 * DAY; // 7-day total, 3 remaining
    const stats = computeSprintStats(tasks, sprintId, start, end, now);

    expect(stats.totalDays).toBe(7);
    expect(stats.daysRemaining).toBe(3);
  });

  it('handles empty sprint gracefully', () => {
    const sprintId = 'sprint-1';
    const tasks: Array<{ sprintId: string; status: string; completedAt?: number; archived?: boolean }> = [];

    const start = now - 7 * DAY;
    const end = now + 7 * DAY;
    const stats = computeSprintStats(tasks, sprintId, start, end, now);

    expect(stats.totalTasks).toBe(0);
    expect(stats.completedTasks).toBe(0);
    expect(stats.completionPct).toBe(0);
    expect(stats.velocity).toBe(0);
  });
});
