import { useState, type PropsWithChildren } from 'react';

interface ThoughtBoxProps {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
}

const ThoughtBox = ({ title, subtitle, defaultExpanded = false, children }: PropsWithChildren<ThoughtBoxProps>) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`
        bg-bolt-elements-background-depth-2/85
        shadow-sm
        rounded-xl
        cursor-pointer 
        transition-all 
        duration-200
        border border-bolt-elements-borderColor/70
        ${isExpanded ? 'max-h-[420px]' : 'max-h-12'}
        overflow-auto
      `}
    >
      <div className="px-3 py-2 flex items-center gap-2 rounded-xl text-bolt-elements-textSecondary leading-5 text-sm">
        <div className="w-6 h-6 rounded-lg bg-accent-500/12 text-accent-500 flex items-center justify-center">
          <div className="i-ph:brain text-base" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">{title}</div>
          {!isExpanded && subtitle ? (
            <div className="text-xs text-bolt-elements-textTertiary truncate">{subtitle}</div>
          ) : !isExpanded ? (
            <div className="text-xs text-bolt-elements-textTertiary">Click to expand</div>
          ) : null}
        </div>
        <div className={`${isExpanded ? 'i-ph:caret-up-bold' : 'i-ph:caret-down-bold'} text-xs opacity-80`} />
      </div>
      <div
        className={`
        transition-opacity 
        duration-200
        px-3 pb-3
        text-sm
        rounded-xl
        ${isExpanded ? 'opacity-100' : 'opacity-0'}
      `}
      >
        {children}
      </div>
    </div>
  );
};

export default ThoughtBox;
