import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProgressAnnotation } from '~/types/context';
import { classNames } from '~/utils/classNames';
import { cubicEasingFn } from '~/utils/easings';

export default function ProgressCompilation({ data, isStreaming = false }: { data?: ProgressAnnotation[]; isStreaming?: boolean }) {
  const [progressList, setProgressList] = React.useState<ProgressAnnotation[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { t } = useTranslation('chat');

  React.useEffect(() => {
    if (!data || data.length === 0) {
      setProgressList([]);
      return;
    }

    const progressMap = new Map<string, ProgressAnnotation>();
    data.forEach((x) => {
      const existingProgress = progressMap.get(x.label);

      if (existingProgress && existingProgress.status === 'complete') {
        return;
      }

      progressMap.set(x.label, x);
    });

    const newData = Array.from(progressMap.values());
    newData.sort((a, b) => a.order - b.order);
    setProgressList(newData);
    setDismissed(false);
  }, [data]);

  const normalizedProgressList = normalizeProgressList(progressList, isStreaming);

  React.useEffect(() => {
    if (normalizedProgressList.length === 0) {
      return undefined;
    }

    const allComplete = normalizedProgressList.every((x) => x.status === 'complete');

    if (!allComplete) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setDismissed(true);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [normalizedProgressList]);

  if (normalizedProgressList.length === 0 || dismissed) {
    return <></>;
  }

  const doneCount = normalizedProgressList.filter((x) => x.status === 'complete').length;

  return (
    <AnimatePresence>
      <div
        className={classNames(
          'bg-bolt-elements-background-depth-2/90',
          'border border-bolt-elements-borderColor/70',
          'shadow-sm rounded-xl relative w-full max-w-chat mx-auto z-prompt',
          'px-3 py-2',
        )}
      >
        <div
          className={classNames(
            'bg-bolt-elements-background-depth-3',
            'px-2.5 py-2 rounded-lg text-bolt-elements-item-contentAccent',
            'flex items-center gap-2',
          )}
        >
          <div>
            <div
              className={classNames(
                'w-5 h-5 rounded-full flex items-center justify-center',
                isStreaming
                  ? 'bg-accent-500/15 text-accent-500'
                  : 'bg-bolt-elements-icon-success/15 text-bolt-elements-icon-success',
              )}
            >
              {isStreaming ? (
                <div className="i-svg-spinners:90-ring-with-bg text-xs" />
              ) : (
                <div className="i-ph:check-bold text-xs" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-bolt-elements-textTertiary">
              {t('process.workflow')}
            </div>
            <div className="text-xs text-bolt-elements-textTertiary mt-1">
              {t('process.stepsCompleted', { done: doneCount, total: normalizedProgressList.length })}
            </div>
          </div>
          <motion.button
            initial={{ width: 0 }}
            animate={{ width: 'auto' }}
            exit={{ width: 0 }}
            transition={{ duration: 0.15, ease: cubicEasingFn }}
            className="p-1.5 rounded-md bg-bolt-elements-item-backgroundAccent hover:bg-bolt-elements-artifacts-backgroundHover text-bolt-elements-textSecondary"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? t('process.collapseDetails') : t('process.expandDetails')}
          >
            <div className={expanded ? 'i-ph:caret-up-bold' : 'i-ph:caret-down-bold'}></div>
          </motion.button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              className="actions mt-2 pl-2"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: '0px', opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="space-y-2">
                {normalizedProgressList.map((x, i) => {
                  const isLast = i === normalizedProgressList.length - 1;

                  return (
                    <div key={`${x.label}-${i}`} className="flex gap-2">
                      <div className="flex flex-col items-center pt-1">
                        <div
                          className={classNames(
                            'w-2.5 h-2.5 rounded-full',
                            x.status === 'complete' ? 'bg-bolt-elements-icon-success' : 'bg-accent-500',
                          )}
                        />
                        {!isLast && <div className="w-px flex-1 bg-bolt-elements-borderColor/70 mt-1" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <ProgressItem progress={x} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}

const ProgressItem = ({ progress, compact = false }: { progress: ProgressAnnotation; compact?: boolean }) => {
  const { t } = useTranslation('chat');
  const message = t(`progress.${progress.message}`, { defaultValue: progress.message });

  return (
    <motion.div
      className={classNames('flex items-center text-sm gap-2', compact ? 'text-sm' : 'text-xs')}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-center gap-1.5">
        <div>
          {progress.status === 'in-progress' ? (
            <div className="i-svg-spinners:90-ring-with-bg text-[13px] text-accent-500"></div>
          ) : progress.status === 'complete' ? (
            <div className="i-ph:check text-[13px] text-bolt-elements-icon-success"></div>
          ) : null}
        </div>
      </div>
      <div
        className={classNames(
          'truncate',
          compact ? 'font-medium text-bolt-elements-textPrimary' : 'text-bolt-elements-textSecondary',
        )}
      >
        {message}
      </div>
    </motion.div>
  );
};

function normalizeProgressList(progressList: ProgressAnnotation[], isStreaming: boolean) {
  const basePipeline: ProgressAnnotation[] = [
    { type: 'progress', label: 'analysis', status: 'complete', order: 1, message: 'analysingRequest' },
    { type: 'progress', label: 'files', status: 'complete', order: 2, message: 'codeFilesSelected' },
    { type: 'progress', label: 'response', status: 'in-progress', order: 3, message: 'generatingResponse' },
    { type: 'progress', label: 'done', status: 'complete', order: 4, message: 'responseGenerated' },
  ];

  if (progressList.length > 2) {
    if (!isStreaming) {
      return progressList.map((step) => ({ ...step, status: 'complete' as const }));
    }

    return progressList;
  }

  const hasResponseGenerated = progressList.some((x) => x.message === 'responseGenerated' && x.status === 'complete');
  const hasGenerating = progressList.some((x) => x.message === 'generatingResponse' && x.status === 'in-progress');

  if (hasResponseGenerated || !isStreaming) {
    return basePipeline.map((step) => ({ ...step, status: 'complete' as const }));
  }

  if (hasGenerating) {
    return basePipeline.slice(0, 3);
  }

  return progressList;
}
