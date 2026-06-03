import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'light' | 'dark';
}

interface AppMarkProps {
  className?: string;
}

export const AppMark = ({ className = '' }: AppMarkProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M14.6 4.1H8.35C6.63817 4.1 5.25 5.48817 5.25 7.2V15.65C5.25 17.3618 6.63817 18.75 8.35 18.75H16.8C18.5118 18.75 19.9 17.3618 19.9 15.65V10.65"
      stroke="currentColor"
      strokeWidth="2.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.65 12.3L12.7 15.35L21.35 6.7"
      stroke="currentColor"
      strokeWidth="2.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AppLogo = ({ size = 'md', showText = true, variant = 'dark' }: AppLogoProps) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const colorClass = variant === 'light' ? 'text-white' : 'text-neutral-900';

  return (
    <div className="flex items-center gap-2">
      <AppMark className={`${sizes[size]} ${colorClass} shrink-0`} />
      {showText && (
        <span className={`font-semibold ${colorClass} ${textSizes[size]}`}>
          todoless-ngx
        </span>
      )}
    </div>
  );
};