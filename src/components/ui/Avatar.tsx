/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg font-semibold',
    xl: 'w-20 h-20 text-2xl font-bold'
  };

  const bgColors = [
    'bg-blue-500 text-white',
    'bg-emerald-500 text-white',
    'bg-indigo-500 text-white',
    'bg-purple-500 text-white',
    'bg-pink-500 text-white',
    'bg-amber-500 text-white'
  ];

  // Select a pseudorandom background color based on length of name
  const colorIndex = name.length % bgColors.length;
  const pickedColor = bgColors[colorIndex];

  return (
    <div
      className={`
        relative flex items-center justify-center shrink-0 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800
        ${sizes[size]}
        ${className}
      `}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails, clear src to trigger initial fallback
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center font-bold tracking-wider ${pickedColor}`}>
          {initials}
        </div>
      )}
    </div>
  );
}
