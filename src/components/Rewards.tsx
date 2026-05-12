import React, { useState } from 'react';
import { Star, Trophy, Target, Gift, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Progress } from './ui/progress';
import { useApp } from '../context/AppContext';
import { pb } from '../lib/pocketbase';

interface GoalFormState {
  title: string;
  description: string;
  pointsRequired: string;
  targetUser: string;
}

export const Rewards = () => {
  const {
    rewards,
    goals,
    users,
    totalPoints,
    addReward,
    deleteReward,
    addGoal,
    updateGoal: updateGoalFn,
    deleteGoal,
  } = useApp();

  const isChild = (pb.authStore.record as any)?.role === 'child';
  const currentUserId = pb.authStore.record?.id;

  // Award dialog state
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [awardPoints, setAwardPoints] = useState('');
  const [awardReason, setAwardReason] = useState('');
  const [awardEarnedBy, setAwardEarnedBy] = useState(currentUserId || '');

  // Goal creation dialog state
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [goalForm, setGoalForm] = useState<GoalFormState>({
    title: '',
    description: '',
    pointsRequired: '',
    targetUser: currentUserId || '',
  });

  // Inline editing state for goals
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoalPoints, setEditGoalPoints] = useState('');

  // Goal filtering: show goals for current user (or all if admin)
  const visibleGoals = isChild
    ? goals.filter(g => g.targetUser === currentUserId)
    : goals;

  // Reward filtering: show rewards for current user (or all if admin)
  const visibleRewards = isChild
    ? rewards.filter(r => r.earnedBy === currentUserId || !r.earnedBy)
    : rewards;

  const handleAwardPoints = () => {
    const pts = parseInt(awardPoints, 10);
    if (!pts || pts <= 0) return;
    addReward({
      title: 'Bonus points',
      points: pts,
      earnedBy: awardEarnedBy || currentUserId,
      earnedAt: Date.now(),
      reason: awardReason || undefined,
      awardedBy: currentUserId,
    });
    setAwardPoints('');
    setAwardReason('');
    setShowAwardDialog(false);
  };

  const handleCreateGoal = () => {
    const pts = parseInt(goalForm.pointsRequired, 10);
    if (!goalForm.title.trim() || !pts || pts <= 0) return;
    addGoal({
      title: goalForm.title.trim(),
      description: goalForm.description.trim() || undefined,
      pointsRequired: pts,
      pointsCurrent: 0,
      targetUser: goalForm.targetUser || currentUserId,
      completed: false,
      createdBy: currentUserId,
    });
    setGoalForm({ title: '', description: '', pointsRequired: '', targetUser: currentUserId || '' });
    setShowGoalDialog(false);
  };

  const handleCompleteGoal = (goalId: string) => {
    updateGoalFn(goalId, { completed: true, completedAt: Date.now() });
  };

  const handleGoalEditStart = (goalId: string, currentPoints: number) => {
    setEditingGoalId(goalId);
    setEditGoalPoints(currentPoints.toString());
  };

  const handleGoalEditSave = (goalId: string) => {
    const pts = parseInt(editGoalPoints, 10);
    if (isNaN(pts)) return;
    updateGoalFn(goalId, { pointsCurrent: pts });
    setEditingGoalId(null);
    setEditGoalPoints('');
  };

  const handleGoalEditCancel = () => {
    setEditingGoalId(null);
    setEditGoalPoints('');
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 px-4">
      {/* Header */}
      <div className="pt-6 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" />
          Rewards
        </h1>
      </div>

      {/* Points Balance Card */}
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8" />
          <div>
            <p className="text-sm opacity-90">Total Points</p>
            <p className="text-4xl font-bold">{totalPoints}</p>
          </div>
        </div>
      </div>

      {/* Admin controls */}
      {!isChild && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowAwardDialog(!showAwardDialog)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Award Points
          </button>
          <button
            onClick={() => setShowGoalDialog(!showGoalDialog)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Goal
          </button>
        </div>
      )}

      {/* Award Points Dialog */}
      {showAwardDialog && (
        <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-6 shadow-sm">
          <h3 className="font-medium text-sm mb-3">Award Points</h3>
          <div className="space-y-3">
            {users.length > 1 && (
              <select
                value={awardEarnedBy}
                onChange={e => setAwardEarnedBy(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            )}
            <input
              type="number"
              min="1"
              placeholder="Points"
              value={awardPoints}
              onChange={e => setAwardPoints(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Reason (optional)"
              value={awardReason}
              onChange={e => setAwardReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAwardPoints}
                className="flex-1 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium"
              >
                Award
              </button>
              <button
                onClick={() => setShowAwardDialog(false)}
                className="px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Goal Dialog */}
      {showGoalDialog && (
        <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-6 shadow-sm">
          <h3 className="font-medium text-sm mb-3">Create Goal</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Goal title"
              value={goalForm.title}
              onChange={e => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={goalForm.description}
              onChange={e => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="number"
              min="1"
              placeholder="Points required"
              value={goalForm.pointsRequired}
              onChange={e => setGoalForm(prev => ({ ...prev, pointsRequired: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
            {users.length > 1 && (
              <select
                value={goalForm.targetUser}
                onChange={e => setGoalForm(prev => ({ ...prev, targetUser: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleCreateGoal}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Create
              </button>
              <button
                onClick={() => setShowGoalDialog(false)}
                className="px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Goals */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-blue-500" />
          Goals
        </h2>
        {visibleGoals.length === 0 ? (
          <p className="text-neutral-400 text-sm">No goals yet</p>
        ) : (
          <div className="space-y-3">
            {visibleGoals.map(goal => {
              const progress = Math.min(100, Math.round((goal.pointsCurrent / goal.pointsRequired) * 100));
              return (
                <div key={goal.id} className={`bg-white rounded-lg border p-4 ${goal.completed ? 'border-green-300 bg-green-50' : 'border-neutral-200'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className={`w-4 h-4 ${goal.completed ? 'text-green-500' : 'text-blue-500'}`} />
                      <h3 className="font-medium text-sm">{goal.title}</h3>
                    </div>
                    {!isChild && !goal.completed && (
                      <div className="flex gap-1">
                        {editingGoalId === goal.id ? (
                          <>
                            <button onClick={() => handleGoalEditSave(goal.id)} className="p-1 hover:bg-green-50 rounded">
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            </button>
                            <button onClick={handleGoalEditCancel} className="p-1 hover:bg-red-50 rounded">
                              <X className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleGoalEditStart(goal.id, goal.pointsCurrent)} className="p-1 hover:bg-neutral-100 rounded">
                              <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
                            </button>
                            <button onClick={() => deleteGoal(goal.id)} className="p-1 hover:bg-red-50 rounded">
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {goal.description && (
                    <p className="text-xs text-neutral-500 mb-2">{goal.description}</p>
                  )}

                  {editingGoalId === goal.id ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="number"
                        value={editGoalPoints}
                        onChange={e => setEditGoalPoints(e.target.value)}
                        className="w-20 px-2 py-1 border rounded text-sm"
                        min="0"
                      />
                      <span className="text-xs text-neutral-500">/ {goal.pointsRequired} pts</span>
                    </div>
                  ) : (
                    <Progress value={progress} className="h-2 mb-1" />
                  )}

                  <div className="flex justify-between items-center text-xs text-neutral-500">
                    <span>
                      {editingGoalId === goal.id ? 'Edit points' : `${goal.pointsCurrent} / ${goal.pointsRequired} pts`}
                    </span>
                    <span>{progress}%</span>
                  </div>

                  {goal.completed && (
                    <div className="mt-2 text-center">
                      <span className="text-green-600 font-medium text-sm animate-pulse">Goal Complete!</span>
                    </div>
                  )}

                  {!goal.completed && !isChild && progress >= 100 && (
                    <button
                      onClick={() => handleCompleteGoal(goal.id)}
                      className="mt-2 w-full py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reward History */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Gift className="w-5 h-5 text-purple-500" />
          History
        </h2>
        {visibleRewards.length === 0 ? (
          <p className="text-neutral-400 text-sm">No rewards earned yet</p>
        ) : (
          <div className="space-y-2">
            {visibleRewards.map(reward => {
              const earnedByUser = users.find(u => u.id === reward.earnedBy);
              return (
                <div key={reward.id} className="bg-white rounded-lg border border-neutral-200 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{reward.reason || reward.title}</p>
                    <p className="text-xs text-neutral-400">
                      {reward.earnedAt ? new Date(reward.earnedAt).toLocaleDateString() : '—'}
                      {earnedByUser && !isChild && ` · ${earnedByUser.name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600 font-bold">+{reward.points}</span>
                    {!isChild && (
                      <button
                        onClick={() => deleteReward(reward.id)}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
