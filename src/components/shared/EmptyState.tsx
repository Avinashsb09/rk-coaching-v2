/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inbox, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onActionClick?: () => void;
  actionText?: string;
}

export function EmptyState({
  title = 'No materials found',
  description = 'There are no active syllabus records matching your search queries. Please modify your filters or reset tags.',
  onActionClick,
  actionText = 'Reset Search'
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/10 max-w-lg mx-auto">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-5">
        <Inbox className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mb-6">
        {description}
      </p>
      {onActionClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onActionClick}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
