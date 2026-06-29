/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={`flex items-center justify-between px-2 py-3 sm:px-4 ${className}`}>
      {/* Small Screen Layout */}
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>

      {/* Larger Screen Layout */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Showing page <span className="font-semibold">{currentPage}</span> of{' '}
            <span className="font-semibold">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-xl shadow-xs" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-xl border border-slate-300 bg-white px-2.5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 focus:z-20 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {pages.map((page) => {
              const isCurrent = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`
                    relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 cursor-pointer
                    ${isCurrent
                      ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-xl border border-slate-300 bg-white px-2.5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 focus:z-20 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
