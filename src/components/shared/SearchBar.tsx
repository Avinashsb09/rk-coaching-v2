/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder = 'Search by Class, Subject, Chapter, or Course keyword...',
  className = ''
}: SearchBarProps) {
  const { globalSearch, setGlobalSearch, addToast } = useApp();
  const [placeholderText, setPlaceholderText] = React.useState('Search...');

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setPlaceholderText('Search courses, notes...');
      } else {
        setPlaceholderText(placeholder);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [placeholder]);

  const handleClear = () => {
    setGlobalSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      addToast(`Searching for "${globalSearch}" across index records...`, 'info');
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-5 h-5 text-slate-400 dark:text-slate-500" />
      </div>
      <input
        type="text"
        value={globalSearch}
        onChange={(e) => setGlobalSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholderText}
        className="
          block w-full pl-11 pr-10 py-2.5 h-11 text-sm rounded-2xl border
          border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80
          text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
          transition-all duration-200
        "
      />
      {globalSearch && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
