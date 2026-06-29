/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface TabOption {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'pills' | 'underline';
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className = ''
}: TabsProps) {
  if (variant === 'pills') {
    return (
      <div className={`flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-250 cursor-pointer
                ${isActive
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }
              `}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`
                    text-[10px] px-1.5 py-0.5 rounded-full font-bold
                    ${isActive
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`border-b border-slate-200 dark:border-slate-800 ${className}`}>
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                flex items-center gap-2 py-3 px-1 border-b-2 font-semibold text-sm whitespace-nowrap transition-all duration-200 cursor-pointer
                ${isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-450'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300'
                }
              `}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`
                    text-[10px] px-1.5 py-0.5 rounded-full font-bold
                    ${isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
