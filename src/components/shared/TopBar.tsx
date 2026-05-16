import React from 'react';
import { CheckSquare } from 'lucide-react';

export const TopBar = () => {
  return (
    <div className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-40">
      <div className="max-w-lg mx-auto px-4 py-1.5">
        <div className="flex items-center justify-center gap-1.5">
          <CheckSquare className="w-4 h-4 text-white" strokeWidth={2.5} />
          <span className="text-sm font-semibold text-white">todoless</span>
        </div>
      </div>
    </div>
  );
};
