import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'framer-motion';
import { computed } from 'nanostores';
import { memo, useEffect, useRef, useState } from 'react';
import type { IconType } from 'react-icons';
import {
  SiCss3,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiMarkdown,
  SiSass,
  SiSqlite,
  SiTypescript,
  SiYaml,
} from 'react-icons/si';
import { FiCode, FiFile, FiImage, FiTerminal } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { createHighlighter, type BundledLanguage, type BundledTheme, type HighlighterGeneric } from 'shiki';
import type { ActionState } from '~/lib/runtime/action-runner';
import { workbenchStore } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { cubicEasingFn } from '~/utils/easings';
import { WORK_DIR } from '~/utils/constants';

const highlighterOptions = {
  langs: ['shell'],
  themes: ['light-plus', 'dark-plus'],
};

const shellHighlighter: HighlighterGeneric<BundledLanguage, BundledTheme> =
  import.meta.hot?.data.shellHighlighter ?? (await createHighlighter(highlighterOptions));

if (import.meta.hot) {
  import.meta.hot.data.shellHighlighter = shellHighlighter;
}

interface ArtifactProps {
  messageId: string;
  artifactId: string;
}

export const Artifact = memo(({ artifactId }: ArtifactProps) => {
  const { t } = useTranslation('chat');
  const userToggledActions = useRef(false);
  const [showActions, setShowActions] = useState(false);
  const [allActionFinished, setAllActionFinished] = useState(false);

  const artifacts = useStore(workbenchStore.artifacts);
  const artifact = artifacts[artifactId];

  const actions = useStore(
    computed(artifact.runner.actions, (actions) => {
      // Filter out Supabase actions except for migrations
      return Object.values(actions).filter((action) => {
        // Exclude actions with type 'supabase' or actions that contain 'supabase' in their content
        return action.type !== 'supabase' && !(action.type === 'shell' && action.content?.includes('supabase'));
      });
    }),
  );

  const toggleActions = () => {
    userToggledActions.current = true;
    setShowActions(!showActions);
  };

  useEffect(() => {
    if (actions.length && !showActions && !userToggledActions.current) {
      setShowActions(true);
    }

    if (actions.length !== 0 && artifact.type === 'bundled') {
      const finished = !actions.find(
        (action) => action.status !== 'complete' && !(action.type === 'start' && action.status === 'running'),
      );

      if (allActionFinished !== finished) {
        setAllActionFinished(finished);
      }
    }
  }, [actions, artifact.type, allActionFinished]);

  // Determine the dynamic title based on state for bundled artifacts
  const dynamicTitle =
    artifact?.type === 'bundled'
      ? allActionFinished
        ? artifact.title === 'Restored Project & Setup'
          ? t('artifact.projectRestored')
          : t('artifact.projectCreated')
        : artifact.title === 'Restored Project & Setup'
          ? t('artifact.restoringProject')
          : t('artifact.creatingProject')
      : artifact?.title === 'Project Setup'
        ? allActionFinished
          ? t('artifact.projectCreated')
          : t('artifact.creatingProject')
        : artifact?.title;

  return (
    <>
      <div className="artifact border border-bolt-elements-borderColor/80 bg-bolt-elements-background-depth-2 flex flex-col overflow-hidden rounded-xl w-full transition-border duration-150 shadow-sm">
        <div className="flex">
          <button
            className="flex items-stretch bg-bolt-elements-artifacts-background hover:bg-bolt-elements-artifacts-backgroundHover/80 w-full overflow-hidden transition-colors"
            onClick={() => {
              workbenchStore.showWorkbench.set(true);
              workbenchStore.currentView.set('code');
            }}
          >
            <div className="px-5 p-3.5 w-full text-left">
              <div className="w-full text-bolt-elements-textPrimary font-medium leading-5 text-sm">
                {/* Use the dynamic title here */}
                {dynamicTitle}
              </div>
              <div className="w-full w-full text-bolt-elements-textSecondary text-xs mt-0.5">
                {t('artifact.clickToOpen')}
              </div>
            </div>
          </button>
          {artifact.type !== 'bundled' && <div className="bg-bolt-elements-artifacts-borderColor w-[1px]" />}
          <AnimatePresence>
            {actions.length && artifact.type !== 'bundled' && (
              <motion.button
                initial={{ width: 0 }}
                animate={{ width: 'auto' }}
                exit={{ width: 0 }}
                transition={{ duration: 0.15, ease: cubicEasingFn }}
                className="bg-bolt-elements-artifacts-background hover:bg-bolt-elements-artifacts-backgroundHover"
                onClick={toggleActions}
              >
                <div className="p-4">
                  <div className={showActions ? 'i-ph:caret-up-bold' : 'i-ph:caret-down-bold'}></div>
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        {artifact.type === 'bundled' && (
          <div className="flex items-center gap-1.5 p-5 bg-bolt-elements-actions-background border-t border-bolt-elements-artifacts-borderColor">
            <div className={classNames('text-lg', getIconColor(allActionFinished ? 'complete' : 'running'))}>
              {allActionFinished ? (
                <div className="i-ph:check"></div>
              ) : (
                <div className="i-svg-spinners:90-ring-with-bg"></div>
              )}
            </div>
            <div className="text-bolt-elements-textPrimary font-medium leading-5 text-sm">
              {allActionFinished
                ? artifact.title === 'Restored Project & Setup'
                  ? t('artifact.restoreFilesFromSnapshot')
                  : t('artifact.initialFilesCreated')
                : t('artifact.creatingInitialFiles')}
            </div>
          </div>
        )}
        <AnimatePresence>
          {artifact.type !== 'bundled' && showActions && actions.length > 0 && (
            <motion.div
              className="actions"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: '0px' }}
              transition={{ duration: 0.15 }}
            >
              <div className="bg-bolt-elements-artifacts-borderColor h-[1px]" />

              <div className="p-5 text-left bg-bolt-elements-actions-background">
                <ActionList actions={actions} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
});

interface ShellCodeBlockProps {
  classsName?: string;
  code: string;
}

function ShellCodeBlock({ classsName, code }: ShellCodeBlockProps) {
  return (
    <div
      className={classNames('text-xs', classsName)}
      dangerouslySetInnerHTML={{
        __html: shellHighlighter.codeToHtml(code, {
          lang: 'shell',
          theme: 'dark-plus',
        }),
      }}
    ></div>
  );
}

interface ActionListProps {
  actions: ActionState[];
}

const actionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function openArtifactInWorkbench(filePath: any) {
  if (workbenchStore.currentView.get() !== 'code') {
    workbenchStore.currentView.set('code');
  }

  workbenchStore.setSelectedFile(`${WORK_DIR}/${filePath}`);
}

const ActionList = memo(({ actions }: ActionListProps) => {
  const { t } = useTranslation('chat');
  const previews = useStore(workbenchStore.previews);
  const hasReadyPreview = previews.some((preview) => preview.ready);
  const fileActions = actions.filter((action) => action.type === 'file');
  const runtimeActions = actions.filter((action) => action.type === 'shell' || action.type === 'start');

  /**
   * Render a single action row.
   * We intentionally reuse the existing row behavior to avoid regressions in click, status, and preview interactions.
   */
  const renderActionRow = (action: ActionState, index: number, totalInSection: number) => {
    const { status, type, content } = action;
    const isLast = index === totalInSection - 1;
    const displayStatus: ActionState['status'] =
      type === 'start' && status === 'running' && hasReadyPreview ? 'complete' : status;

    return (
      <motion.li
        key={`${type}-${index}-${(action as any).filePath || ''}`}
        variants={actionVariants}
        initial="hidden"
        animate="visible"
        transition={{
          duration: 0.2,
          ease: cubicEasingFn,
        }}
      >
        <div className="flex items-center gap-2 text-sm">
          {type !== 'file' && (
            <div className={classNames('text-lg', getIconColor(displayStatus))}>
              {displayStatus === 'running' ? (
                <>
                  {type !== 'start' ? (
                    <div className="i-svg-spinners:90-ring-with-bg"></div>
                  ) : (
                    <div className="i-ph:terminal-window-duotone"></div>
                  )}
                </>
              ) : displayStatus === 'pending' ? (
                <div className="i-ph:circle-duotone"></div>
              ) : displayStatus === 'complete' ? (
                <div className="i-ph:check"></div>
              ) : displayStatus === 'failed' || displayStatus === 'aborted' ? (
                <div className="i-ph:x"></div>
              ) : null}
            </div>
          )}
          {type === 'file' ? (
            <button
              className={classNames(
                'w-full min-w-0 rounded-md px-2 py-1.5 bg-transparent border-none text-left cursor-pointer',
                'hover:bg-bolt-elements-background-depth-3 transition-colors',
                'flex items-center gap-2',
              )}
              onClick={() => openArtifactInWorkbench(action.filePath)}
              title={action.filePath}
            >
              <div className={classNames('shrink-0 text-[14px]', getIconColor(displayStatus))}>
                {displayStatus === 'running' ? (
                  <div className="i-svg-spinners:90-ring-with-bg" />
                ) : displayStatus === 'complete' ? (
                  <div className="i-ph:check-circle" />
                ) : displayStatus === 'failed' || displayStatus === 'aborted' ? (
                  <div className="i-ph:x-circle" />
                ) : (
                  <div className="i-ph:circle-duotone" />
                )}
              </div>
              <div className="shrink-0 text-bolt-elements-textSecondary">{renderFileTypeIcon(action.filePath)}</div>
              <div className="truncate text-sm text-bolt-elements-textPrimary font-medium max-w-[40%]">
                {getFileBaseName(action.filePath)}
              </div>
              <div className="truncate text-xs text-bolt-elements-textTertiary flex-1">{action.filePath}</div>
            </button>
          ) : type === 'shell' ? (
            <div className="flex items-center w-full min-h-[28px]">
              <span className="flex-1">{t('artifact.runCommand')}</span>
            </div>
          ) : type === 'start' ? (
            <a
              onClick={(e) => {
                e.preventDefault();
                workbenchStore.currentView.set('preview');
              }}
              className="flex items-center w-full min-h-[28px]"
            >
              <span className="flex-1">{t('artifact.startApplication')}</span>
            </a>
          ) : null}
        </div>
        {(type === 'shell' || type === 'start') && (
          <ShellCodeBlock
            classsName={classNames('mt-1', {
              'mb-3.5': !isLast,
            })}
            code={content}
          />
        )}
      </motion.li>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
      <div className="space-y-3">
        {fileActions.length > 0 && (
          <div className="rounded-lg border border-bolt-elements-borderColor/60 p-2">
            <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-bolt-elements-textTertiary">
              {t('artifact.createFile')}
            </div>
            <ul className="list-none space-y-2">
              {fileActions.map((action, index) => renderActionRow(action, index, fileActions.length))}
            </ul>
          </div>
        )}

        {fileActions.length > 0 && runtimeActions.length > 0 && (
          <div className="px-2 text-xs text-bolt-elements-textTertiary">{t('artifact.prepareInstallAndStart')}</div>
        )}

        {runtimeActions.length > 0 && (
          <div className="rounded-lg border border-bolt-elements-borderColor/60 p-2">
            <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-bolt-elements-textTertiary">
              {t('artifact.runCommand')} & {t('artifact.startApplication')}
            </div>
            <ul className="list-none space-y-2">
              {runtimeActions.map((action, index) => renderActionRow(action, index, runtimeActions.length))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
});

function getIconColor(status: ActionState['status']) {
  switch (status) {
    case 'pending': {
      return 'text-bolt-elements-textTertiary';
    }
    case 'running': {
      return 'text-bolt-elements-loader-progress';
    }
    case 'complete': {
      return 'text-bolt-elements-icon-success';
    }
    case 'aborted': {
      return 'text-bolt-elements-textSecondary';
    }
    case 'failed': {
      return 'text-bolt-elements-icon-error';
    }
    default: {
      return undefined;
    }
  }
}

function getFileBaseName(filePath: string) {
  const segments = filePath.split('/');
  return segments[segments.length - 1] || filePath;
}

function getFileTypeIcon(filePath: string) {
  const fileName = getFileBaseName(filePath).toLowerCase();
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  const fileNameIcons: Record<string, { icon: IconType; className: string }> = {
    'package.json': { icon: SiJson, className: 'text-[#CB3837]' },
    'package-lock.json': { icon: SiJson, className: 'text-[#CB3837]' },
    'pnpm-lock.yaml': { icon: SiYaml, className: 'text-[#F69220]' },
    'yarn.lock': { icon: SiYaml, className: 'text-[#2C8EBB]' },
    'tsconfig.json': { icon: SiTypescript, className: 'text-[#3178C6]' },
    'jsconfig.json': { icon: SiJavascript, className: 'text-[#F7DF1E]' },
    '.eslintrc': { icon: FiCode, className: 'text-[#4B32C3]' },
    '.prettierrc': { icon: FiCode, className: 'text-[#F7B93E]' },
    '.gitignore': { icon: FiFile, className: 'text-bolt-elements-textSecondary' },
    '.env': { icon: FiCode, className: 'text-[#10B981]' },
    '.env.local': { icon: FiCode, className: 'text-[#10B981]' },
    '.env.production': { icon: FiCode, className: 'text-[#10B981]' },
    'dockerfile': { icon: FiCode, className: 'text-[#2496ED]' },
    'docker-compose.yml': { icon: SiYaml, className: 'text-[#2496ED]' },
    'docker-compose.yaml': { icon: SiYaml, className: 'text-[#2496ED]' },
  };

  if (fileNameIcons[fileName]) {
    return fileNameIcons[fileName];
  }

  if (fileName.startsWith('vite.config.')) {
    return { icon: FiCode, className: 'text-[#646CFF]' };
  }

  if (fileName.startsWith('tailwind.config.')) {
    return { icon: SiCss3, className: 'text-[#06B6D4]' };
  }

  if (fileName.startsWith('postcss.config.')) {
    return { icon: SiCss3, className: 'text-[#DD3A0A]' };
  }

  const extensionIcons: Record<string, { icon: IconType; className: string }> = {
    ts: { icon: SiTypescript, className: 'text-[#3178C6]' },
    tsx: { icon: SiTypescript, className: 'text-[#3178C6]' },
    js: { icon: SiJavascript, className: 'text-[#F7DF1E]' },
    jsx: { icon: SiJavascript, className: 'text-[#F7DF1E]' },
    mjs: { icon: SiJavascript, className: 'text-[#F7DF1E]' },
    cjs: { icon: SiJavascript, className: 'text-[#F7DF1E]' },
    json: { icon: SiJson, className: 'text-[#F59E0B]' },
    css: { icon: SiCss3, className: 'text-[#1572B6]' },
    scss: { icon: SiSass, className: 'text-[#CC6699]' },
    sass: { icon: SiSass, className: 'text-[#CC6699]' },
    html: { icon: SiHtml5, className: 'text-[#E34F26]' },
    md: { icon: SiMarkdown, className: 'text-bolt-elements-textSecondary' },
    yml: { icon: SiYaml, className: 'text-[#CB171E]' },
    yaml: { icon: SiYaml, className: 'text-[#CB171E]' },
    sh: { icon: FiTerminal, className: 'text-bolt-elements-textSecondary' },
    zsh: { icon: FiTerminal, className: 'text-bolt-elements-textSecondary' },
    bash: { icon: FiTerminal, className: 'text-bolt-elements-textSecondary' },
    env: { icon: FiCode, className: 'text-bolt-elements-textSecondary' },
    sql: { icon: SiSqlite, className: 'text-[#0E7A9F]' },
    png: { icon: FiImage, className: 'text-bolt-elements-textSecondary' },
    jpg: { icon: FiImage, className: 'text-bolt-elements-textSecondary' },
    jpeg: { icon: FiImage, className: 'text-bolt-elements-textSecondary' },
    gif: { icon: FiImage, className: 'text-bolt-elements-textSecondary' },
    webp: { icon: FiImage, className: 'text-bolt-elements-textSecondary' },
    svg: { icon: FiImage, className: 'text-bolt-elements-textSecondary' },
    toml: { icon: FiCode, className: 'text-bolt-elements-textSecondary' },
    xml: { icon: FiCode, className: 'text-bolt-elements-textSecondary' },
  };

  return extensionIcons[extension] || { icon: FiFile, className: 'text-bolt-elements-textSecondary' };
}

function renderFileTypeIcon(filePath: string) {
  const { icon: Icon, className } = getFileTypeIcon(filePath);
  return <Icon className={classNames('text-[15px]', className)} />;
}
