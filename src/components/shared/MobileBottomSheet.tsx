import React, { ReactNode } from 'react';
import { Drawer } from 'vaul';

interface MobileBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
  /** Height of the sheet as a percentage of screen height (default: 70%) */
  height?: string;
  /** Snap points for multi-height sheets (e.g., ['30%', '70%', '90%']) */
  snapPoints?: string[];
}

/**
 * Mobile-optimized bottom sheet using vaul drawer.
 * Provides a native app-like slide-up panel for actions, filters, and forms.
 */
export const MobileBottomSheet = ({
  open,
  onOpenChange,
  title,
  children,
  height = '70vh',
  snapPoints,
}: MobileBottomSheetProps) => {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} snapPoints={snapPoints}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl flex flex-col"
          style={{ maxHeight: height }}
        >
          {/* Drag handle */}
          <div className="mx-auto w-12 h-1.5 bg-neutral-300 rounded-full my-3" />

          {/* Header */}
          {title && (
            <div className="px-4 pb-3 border-b border-neutral-100">
              <Drawer.Title className="text-lg font-semibold">{title}</Drawer.Title>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-safe-area scroll-momentum">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default MobileBottomSheet;
