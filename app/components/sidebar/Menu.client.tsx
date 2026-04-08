import { motion, type Variants } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { zhCN } from 'date-fns/locale';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';
import { ControlPanel } from '~/components/@settings/core/ControlPanel';
import { SettingsButton, HelpButton } from '~/components/ui/SettingsButton';
import { Button } from '~/components/ui/Button';
import { db, deleteById, getAll, chatId, type ChatHistoryItem, useChatHistory } from '~/lib/persistence';
import { cubicEasingFn } from '~/utils/easings';
import { Tooltip } from '~/components/ui/Tooltip';
import { HistoryItem } from './HistoryItem';
import { binDates } from './date-binning';
import { useSearchFilter } from '~/lib/hooks/useSearchFilter';
import { classNames } from '~/utils/classNames';
import { useStore } from '@nanostores/react';
import { profileStore } from '~/lib/stores/profile';
import { isSidebarOpen } from '~/lib/stores/sidebar';
import { languageStore } from '~/lib/stores/i18n';
import { Image } from '~/components/ui/Image';

const menuVariants = {
  closed: {
    opacity: 0,
    visibility: 'hidden',
    left: '-340px',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    opacity: 1,
    visibility: 'initial',
    left: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

type DialogContent =
  | { type: 'delete'; item: ChatHistoryItem }
  | { type: 'bulkDelete'; items: ChatHistoryItem[] }
  | null;

function CurrentDateTimeInline() {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <span className="text-xs text-gray-400 dark:text-gray-500 leading-tight">
      {dateTime.toLocaleDateString()} · {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

export const Menu = () => {
  const { t } = useTranslation('sidebar');
  const { t: tSettings } = useTranslation('settings');
  const language = useStore(languageStore);
  const dateFnsLocale = language === 'zh' ? zhCN : undefined;

  const { duplicateCurrentChat, exportChat } = useChatHistory();
  const [list, setList] = useState<ChatHistoryItem[]>([]);
  const open = useStore(isSidebarOpen);
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const profile = useStore(profileStore);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { filteredItems: filteredList, handleSearchChange } = useSearchFilter({
    items: list,
    searchFields: ['description'],
  });

  /**
   * 将固定的英文 key（Today / Yesterday / Past 30 Days）翻译为当前语言。
   * 星期名和月份名已由 date-fns locale 直接格式化，无需在此处理。
   */
  const translateCategory = (category: string): string => {
    const fixedMap: Record<string, string> = {
      Today: t('dateBinning.today'),
      Yesterday: t('dateBinning.yesterday'),
      'Past 30 Days': t('dateBinning.past30Days'),
    };

    return fixedMap[category] ?? category;
  };

  const loadEntries = useCallback(() => {
    if (db) {
      getAll(db)
        .then((list) => list.filter((item) => item.urlId && item.description))
        .then(setList)
        .catch((error) => toast.error(error.message));
    }
  }, []);

  const deleteChat = useCallback(
    async (id: string): Promise<void> => {
      if (!db) {
        throw new Error('Database not available');
      }

      // Delete chat snapshot from localStorage
      try {
        const snapshotKey = `snapshot:${id}`;
        localStorage.removeItem(snapshotKey);
        console.log('Removed snapshot for chat:', id);
      } catch (snapshotError) {
        console.error(`Error deleting snapshot for chat ${id}:`, snapshotError);
      }

      // Delete the chat from the database
      await deleteById(db, id);
      console.log('Successfully deleted chat:', id);
    },
    [db],
  );

  const deleteItem = useCallback(
    (event: React.UIEvent, item: ChatHistoryItem) => {
      event.preventDefault();
      event.stopPropagation();

      // Log the delete operation to help debugging
      console.log('Attempting to delete chat:', { id: item.id, description: item.description });

      deleteChat(item.id)
        .then(() => {
          toast.success(t('menu.deleteSuccess'), {
            position: 'bottom-right',
            autoClose: 3000,
          });

          // Always refresh the list
          loadEntries();

          if (chatId.get() === item.id) {
            // hard page navigation to clear the stores
            console.log('Navigating away from deleted chat');
            window.location.pathname = '/';
          }
        })
        .catch((error) => {
          console.error('Failed to delete chat:', error);
          toast.error(t('menu.deleteFail'), {
            position: 'bottom-right',
            autoClose: 3000,
          });

          // Still try to reload entries in case data has changed
          loadEntries();
        });
    },
    [loadEntries, deleteChat, t],
  );

  const deleteSelectedItems = useCallback(
    async (itemsToDeleteIds: string[]) => {
      if (!db || itemsToDeleteIds.length === 0) {
        console.log('Bulk delete skipped: No DB or no items to delete.');
        return;
      }

      console.log(`Starting bulk delete for ${itemsToDeleteIds.length} chats`, itemsToDeleteIds);

      let deletedCount = 0;
      const errors: string[] = [];
      const currentChatId = chatId.get();
      let shouldNavigate = false;

      // Process deletions sequentially using the shared deleteChat logic
      for (const id of itemsToDeleteIds) {
        try {
          await deleteChat(id);
          deletedCount++;

          if (id === currentChatId) {
            shouldNavigate = true;
          }
        } catch (error) {
          console.error(`Error deleting chat ${id}:`, error);
          errors.push(id);
        }
      }

      // Show appropriate toast message
      if (errors.length === 0) {
        toast.success(t('menu.bulkDeleteSuccess', { count: deletedCount }));
      } else {
        toast.warning(
          t('menu.bulkDeletePartial', {
            deletedCount,
            total: itemsToDeleteIds.length,
            errorCount: errors.length,
          }),
          { autoClose: 5000 },
        );
      }

      // Reload the list after all deletions
      await loadEntries();

      // Clear selection state
      setSelectedItems([]);
      setSelectionMode(false);

      // Navigate if needed
      if (shouldNavigate) {
        console.log('Navigating away from deleted chat');
        window.location.pathname = '/';
      }
    },
    [deleteChat, loadEntries, db, t],
  );

  const closeDialog = () => {
    setDialogContent(null);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);

    if (selectionMode) {
      // If turning selection mode OFF, clear selection
      setSelectedItems([]);
    }
  };

  const toggleItemSelection = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const newSelectedItems = prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id];
      console.log('Selected items updated:', newSelectedItems);

      return newSelectedItems; // Return the new array
    });
  }, []); // No dependencies needed

  const handleBulkDeleteClick = useCallback(() => {
    if (selectedItems.length === 0) {
      toast.info(t('menu.selectAtLeastOne'));
      return;
    }

    const selectedChats = list.filter((item) => selectedItems.includes(item.id));

    if (selectedChats.length === 0) {
      toast.error(t('menu.chatNotFound'));
      return;
    }

    setDialogContent({ type: 'bulkDelete', items: selectedChats });
  }, [selectedItems, list, t]); // Keep list dependency

  const selectAll = useCallback(() => {
    const allFilteredIds = filteredList.map((item) => item.id);
    setSelectedItems((prev) => {
      const allFilteredAreSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => prev.includes(id));

      if (allFilteredAreSelected) {
        // Deselect only the filtered items
        const newSelectedItems = prev.filter((id) => !allFilteredIds.includes(id));
        console.log('Deselecting all filtered items. New selection:', newSelectedItems);

        return newSelectedItems;
      } else {
        // Select all filtered items, adding them to any existing selections
        const newSelectedItems = [...new Set([...prev, ...allFilteredIds])];
        console.log('Selecting all filtered items. New selection:', newSelectedItems);

        return newSelectedItems;
      }
    });
  }, [filteredList]); // Depends only on filteredList

  useEffect(() => {
    if (open) {
      loadEntries();
    }
  }, [open, loadEntries]);

  // Exit selection mode when sidebar is closed
  useEffect(() => {
    if (!open && selectionMode) {
      /*
       * Don't clear selection state anymore when sidebar closes
       * This allows the selection to persist when reopening the sidebar
       */
      console.log('Sidebar closed, preserving selection state');
    }
  }, [open, selectionMode]);

  const handleDuplicate = async (id: string) => {
    await duplicateCurrentChat(id);
    loadEntries(); // Reload the list after duplication
  };

  const handleControlPanelClick = () => {
    setIsControlPanelOpen(true);
    isSidebarOpen.set(false);
  };

  const handleControlPanelClose = () => {
    setIsControlPanelOpen(false);
  };

  const setDialogContentWithLogging = useCallback((content: DialogContent) => {
    console.log('Setting dialog content:', content);
    setDialogContent(content);
  }, []);

  return (
    <>
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 top-[var(--header-height)] z-sidebar-backdrop"
          onClick={() => isSidebarOpen.set(false)}
        />
      )}
      <motion.div
        initial="closed"
        animate={open ? 'open' : 'closed'}
        variants={menuVariants}
        style={{ width: '340px' }}
        className={classNames(
          'flex selection-accent flex-col side-menu fixed top-[var(--header-height)] h-[calc(100vh-var(--header-height))] rounded-br-2xl',
          'bg-white dark:bg-gray-950 border-r border-b border-bolt-elements-borderColor',
          'shadow-xl text-sm',
          isControlPanelOpen ? 'z-40' : 'z-sidebar',
        )}
      >
        {/* 顶部用户信息区 */}
        <div className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 overflow-hidden bg-purple-50 dark:bg-purple-500/10 text-purple-500 dark:text-purple-400 rounded-xl shrink-0">
              <Image
                src={profile?.avatar}
                alt={profile?.username || t('menu.user')}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="sync"
                fallback={<div className="i-ph:user-fill text-base" />}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                {profile?.username || t('menu.guestUser')}
              </div>
              <CurrentDateTimeInline />
            </div>
            <HelpButton onClick={() => window.open('https://stackblitz-labs.github.io/bolt.diy/', '_blank')} />
          </div>
        </div>

        <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
          {/* 操作区：新建 + 选择 + 搜索 */}
          <div className="p-3 space-y-2 border-b border-gray-100 dark:border-gray-800/50">
            <div className="flex gap-2">
              <a
                href="/"
                className="flex-1 flex gap-2 items-center justify-center bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg px-4 py-2.5 transition-colors font-medium shadow-sm"
              >
                <span className="inline-block i-ph:plus-bold h-4 w-4" />
                <span className="text-sm">{t('menu.newChat')}</span>
              </a>
              <button
                onClick={toggleSelectionMode}
                className={classNames(
                  'flex items-center justify-center w-10 rounded-lg transition-colors shrink-0',
                  selectionMode
                    ? 'bg-purple-600 dark:bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
                )}
                aria-label={selectionMode ? t('menu.exitSelectionMode') : t('menu.enterSelectionMode')}
              >
                <span className={selectionMode ? 'i-ph:x h-4 w-4' : 'i-ph:check-square h-4 w-4'} />
              </button>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className="i-ph:magnifying-glass h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                className="w-full bg-gray-50 dark:bg-gray-900 pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500/50 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 border border-gray-200 dark:border-gray-800 transition-colors"
                type="search"
                placeholder={t('menu.searchPlaceholder')}
                onChange={handleSearchChange}
                aria-label={t('menu.searchAriaLabel')}
              />
            </div>
          </div>

          {/* 列表标题行 */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest leading-none">
                {t('menu.myChats')}
              </span>
              <Tooltip content={t('menu.historyHelp')} side="right">
                <div className="i-ph:question text-xs text-gray-400 dark:text-gray-600 cursor-help opacity-50 hover:opacity-100 transition-opacity" />
              </Tooltip>
            </div>
            {selectionMode && (
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  {selectedItems.length === filteredList.length ? t('menu.deselectAll') : t('menu.selectAll')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDeleteClick}
                  disabled={selectedItems.length === 0}
                >
                  {t('menu.deleteSelected')}
                </Button>
              </div>
            )}
          </div>

          {/* 对话列表 */}
          <div className="flex-1 overflow-auto px-2 pb-2">
            {filteredList.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="i-ph:chat-circle-dots text-4xl text-gray-200 dark:text-gray-800 mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-600">
                  {list.length === 0 ? t('menu.noHistory') : t('menu.noResults')}
                </p>
              </div>
            )}
            <DialogRoot open={dialogContent !== null}>
              {binDates(filteredList, dateFnsLocale).map(({ category, items }) => (
                <div key={category} className="mt-3 first:mt-1 space-y-0.5">
                  <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest sticky top-0 z-1 bg-white dark:bg-gray-950 px-3 py-1">
                    {translateCategory(category)}
                  </div>
                  <div>
                    {items.map((item) => (
                      <HistoryItem
                        key={item.id}
                        item={item}
                        exportChat={exportChat}
                        onDelete={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          console.log('Delete triggered for item:', item);
                          setDialogContentWithLogging({ type: 'delete', item });
                        }}
                        onDuplicate={() => handleDuplicate(item.id)}
                        selectionMode={selectionMode}
                        isSelected={selectedItems.includes(item.id)}
                        onToggleSelection={toggleItemSelection}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <Dialog onBackdrop={closeDialog} onClose={closeDialog}>
                {dialogContent?.type === 'delete' && (
                  <>
                    <div className="p-6 bg-white dark:bg-gray-950">
                      <DialogTitle className="text-gray-900 dark:text-white">
                        {t('menu.confirmDeleteTitle')}
                      </DialogTitle>
                      <DialogDescription className="mt-2 text-gray-600 dark:text-gray-400">
                        <p>
                          {t('menu.confirmDeleteDesc')}{' '}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {dialogContent.item.description}
                          </span>
                        </p>
                        <p className="mt-2">{t('menu.confirmDeleteQuestion')}</p>
                      </DialogDescription>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                      <DialogButton type="secondary" onClick={closeDialog}>
                        {t('menu.cancel')}
                      </DialogButton>
                      <DialogButton
                        type="danger"
                        onClick={(event) => {
                          console.log('Dialog delete button clicked for item:', dialogContent.item);
                          deleteItem(event, dialogContent.item);
                          closeDialog();
                        }}
                      >
                        {t('menu.delete')}
                      </DialogButton>
                    </div>
                  </>
                )}
                {dialogContent?.type === 'bulkDelete' && (
                  <>
                    <div className="p-6 bg-white dark:bg-gray-950">
                      <DialogTitle className="text-gray-900 dark:text-white">
                        {t('menu.confirmBulkDeleteTitle')}
                      </DialogTitle>
                      <DialogDescription className="mt-2 text-gray-600 dark:text-gray-400">
                        <p>{t('menu.confirmBulkDeleteDesc', { count: dialogContent.items.length })}</p>
                        <div className="mt-2 max-h-32 overflow-auto border border-gray-100 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-gray-900 p-2">
                          <ul className="list-disc pl-5 space-y-1">
                            {dialogContent.items.map((item) => (
                              <li key={item.id} className="text-sm">
                                <span className="font-medium text-gray-900 dark:text-white">{item.description}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <p className="mt-3">{t('menu.confirmBulkDeleteQuestion')}</p>
                      </DialogDescription>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                      <DialogButton type="secondary" onClick={closeDialog}>
                        {t('menu.cancel')}
                      </DialogButton>
                      <DialogButton
                        type="danger"
                        onClick={() => {
                          /*
                           * Pass the current selectedItems to the delete function.
                           * This captures the state at the moment the user confirms.
                           */
                          const itemsToDeleteNow = [...selectedItems];
                          console.log('Bulk delete confirmed for', itemsToDeleteNow.length, 'items', itemsToDeleteNow);
                          deleteSelectedItems(itemsToDeleteNow);
                          closeDialog();
                        }}
                      >
                        {t('menu.delete')}
                      </DialogButton>
                    </div>
                  </>
                )}
              </Dialog>
            </DialogRoot>
          </div>

          {/* 底部工具栏 */}
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-gray-100 dark:border-gray-800/50 bg-gray-50/80 dark:bg-gray-900/50">
            <SettingsButton onClick={handleControlPanelClick} title={tSettings('controlPanel')} />
            <ThemeSwitch />
          </div>
        </div>
      </motion.div>

      <ControlPanel open={isControlPanelOpen} onClose={handleControlPanelClose} />
    </>
  );
};
