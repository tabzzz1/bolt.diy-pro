import type { Message } from 'ai';
import { Fragment, useState, useCallback } from 'react';
import { classNames } from '~/utils/classNames';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';
import { useLocation } from '@remix-run/react';
import { db, chatId } from '~/lib/persistence/useChatHistory';
import { forkChat, deleteById } from '~/lib/persistence/db';
import { toast } from 'react-toastify';
import { forwardRef } from 'react';
import type { ForwardedRef } from 'react';
import type { ProviderInfo } from '~/types/model';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogRoot, DialogTitle, DialogDescription, DialogButton } from '~/components/ui/Dialog';
import { useStore } from '@nanostores/react';
import { editStore, startEditing } from '~/lib/stores/chat';

interface MessagesProps {
  id?: string;
  className?: string;
  isStreaming?: boolean;
  messages?: Message[];
  append?: (message: Message) => void;
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  model?: string;
  provider?: ProviderInfo;
  addToolResult: ({ toolCallId, result }: { toolCallId: string; result: any }) => void;
}

export const Messages = forwardRef<HTMLDivElement, MessagesProps>(
  (props: MessagesProps, ref: ForwardedRef<HTMLDivElement> | undefined) => {
    const { id, isStreaming = false, messages = [] } = props;
    const location = useLocation();
    const { t } = useTranslation('chat');
    const editState = useStore(editStore);

    // State for delete confirmation dialog
    const [deleteConfirm, setDeleteConfirm] = useState<{
      open: boolean;
      messageIndex: number;
      isFirstMessage: boolean;
    }>({ open: false, messageIndex: -1, isFirstMessage: false });

    const handleRewind = (messageId: string) => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('rewindTo', messageId);
      window.location.search = searchParams.toString();
    };

    const handleFork = async (messageId: string) => {
      try {
        if (!db || !chatId.get()) {
          toast.error('Chat persistence is not available');
          return;
        }

        const urlId = await forkChat(db, chatId.get()!, messageId);
        window.location.href = `/chat/${urlId}`;
      } catch (error) {
        toast.error('Failed to fork chat: ' + (error as Error).message);
      }
    };

    /**
     * Request deletion of a user message at the given index.
     * Opens a confirmation dialog before performing the action.
     */
    const handleDeleteMessage = useCallback(
      (messageIndex: number) => {
        // Find the first non-hidden user message index
        const firstVisibleUserIdx = messages.findIndex((m) => m.role === 'user' && !m.annotations?.includes('hidden'));
        const isFirstMessage = messageIndex === firstVisibleUserIdx;

        setDeleteConfirm({ open: true, messageIndex, isFirstMessage });
      },
      [messages],
    );

    /**
     * Executes the actual delete after confirmation.
     */
    const confirmDelete = useCallback(async () => {
      const { messageIndex, isFirstMessage } = deleteConfirm;

      setDeleteConfirm({ open: false, messageIndex: -1, isFirstMessage: false });

      if (isFirstMessage) {
        // Delete the entire conversation and navigate home
        const currentChatId = chatId.get();

        if (!db || !currentChatId) {
          toast.error(t('actions.deleteFailed'));
          return;
        }

        try {
          await deleteById(db, currentChatId);
          window.location.pathname = '/';
        } catch (error) {
          console.error('Failed to delete chat:', error);
          toast.error(t('actions.deleteFailed'));
        }
      } else {
        // Rewind to the message just before the deleted user message.
        // The rewindTo mechanism truncates messages and restores file state.
        // We need to find the previous assistant message's ID (the response to the prior user message).
        // If the deleted message is a user message at index N, the previous assistant message is at N-1.
        const prevMessageId = messages[messageIndex - 1]?.id;

        if (prevMessageId) {
          handleRewind(prevMessageId);
        } else {
          toast.error(t('actions.deleteFailed'));
        }
      }
    }, [deleteConfirm, messages, t]);

    /**
     * Enters edit mode for a user message.
     * Sets the global editStore so Chat.client can fill input + handle send.
     */
    const handleEditMessage = useCallback((messageIndex: number, textContent: string) => {
      startEditing(messageIndex, textContent);
    }, []);

    return (
      <>
        <div id={id} className={props.className} ref={ref}>
          {messages.length > 0
            ? messages.map((message, index) => {
                const { role, content, id: messageId, annotations, parts } = message;
                const isUserMessage = role === 'user';
                const isFirst = index === 0;
                const isHidden = annotations?.includes('hidden');

                if (isHidden) {
                  return <Fragment key={index} />;
                }

                return (
                  <div
                    key={index}
                    className={classNames('flex w-full min-w-0', {
                      'mt-1.5': !isFirst && isUserMessage,
                      'mt-0.5': !isFirst && !isUserMessage,
                      'justify-end': isUserMessage,
                      'justify-start': !isUserMessage,
                    })}
                  >
                    <div
                      className={classNames('w-full min-w-0', {
                        'py-1.5': isUserMessage,
                        'py-2 px-1': !isUserMessage,
                      })}
                    >
                      {isUserMessage ? (
                        <UserMessage
                          content={content}
                          parts={parts}
                          onDelete={() => handleDeleteMessage(index)}
                          onEdit={(textContent) => handleEditMessage(index, textContent)}
                          isEditing={editState.isEditing && editState.messageIndex === index}
                        />
                      ) : (
                        <AssistantMessage
                          content={content}
                          annotations={message.annotations}
                          messageId={messageId}
                          onRewind={handleRewind}
                          onFork={handleFork}
                          append={props.append}
                          chatMode={props.chatMode}
                          setChatMode={props.setChatMode}
                          model={props.model}
                          provider={props.provider}
                          parts={parts}
                          addToolResult={props.addToolResult}
                          isStreaming={isStreaming && index === messages.length - 1}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            : null}
          {isStreaming && (
            <div className="text-center w-full  text-bolt-elements-item-contentAccent i-svg-spinners:3-dots-fade text-4xl mt-4"></div>
          )}
        </div>

        {/* Delete confirmation dialog */}
        <DialogRoot
          open={deleteConfirm.open}
          onOpenChange={(open) => !open && setDeleteConfirm((s) => ({ ...s, open: false }))}
        >
          <Dialog
            onClose={() => setDeleteConfirm((s) => ({ ...s, open: false }))}
            onBackdrop={() => setDeleteConfirm((s) => ({ ...s, open: false }))}
          >
            <div className="p-6">
              <DialogTitle>
                <div className="i-ph:warning-circle text-red-500 text-xl" />
                {deleteConfirm.isFirstMessage ? t('actions.deleteConversationTitle') : t('actions.deleteMessageTitle')}
              </DialogTitle>
              <DialogDescription className="mt-3">
                {deleteConfirm.isFirstMessage ? t('actions.deleteConversationDesc') : t('actions.deleteMessageDesc')}
              </DialogDescription>
              <div className="flex justify-end gap-2 mt-5">
                <DialogButton type="secondary" onClick={() => setDeleteConfirm((s) => ({ ...s, open: false }))}>
                  {t('actions.cancel')}
                </DialogButton>
                <DialogButton type="danger" onClick={confirmDelete}>
                  {t('actions.confirmDelete')}
                </DialogButton>
              </div>
            </div>
          </Dialog>
        </DialogRoot>
      </>
    );
  },
);
