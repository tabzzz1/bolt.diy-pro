/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import type { JSONValue, Message } from 'ai';
import React, { type RefCallback, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { Menu } from '~/components/sidebar/Menu.client';
import { Workbench } from '~/components/workbench/Workbench.client';
import { classNames } from '~/utils/classNames';
import { PROVIDER_LIST } from '~/utils/constants';
import { Messages } from './Messages.client';
import { getApiKeysFromCookies } from './APIKeyManager';
import Cookies from 'js-cookie';
import * as Tooltip from '@radix-ui/react-tooltip';
import styles from './BaseChat.module.scss';
import { ImportButtons } from '~/components/chat/chatExportAndImport/ImportButtons';
import { ExamplePrompts } from '~/components/chat/ExamplePrompts';
import GitCloneButton from './GitCloneButton';
import type { ProviderInfo } from '~/types/model';
import StarterTemplates from './StarterTemplates';
import type { ActionAlert, SupabaseAlert, DeployAlert, LlmErrorAlertType } from '~/types/actions';
import DeployChatAlert from '~/components/deploy/DeployAlert';
import ChatAlert from './ChatAlert';
import type { ModelInfo } from '~/lib/modules/llm/types';
import ProgressCompilation from './ProgressCompilation';
import type { ProgressAnnotation } from '~/types/context';
import { SupabaseChatAlert } from '~/components/chat/SupabaseAlert';
import { expoUrlAtom } from '~/lib/stores/qrCodeStore';
import { useStore } from '@nanostores/react';
import { StickToBottom } from '~/lib/hooks';
import { ChatBox } from './ChatBox';
import type { DesignScheme } from '~/types/design-scheme';
import type { ElementInfo } from '~/components/workbench/Inspector';
import LlmErrorAlert from './LLMApiAlert';
import { STORAGE_KEY_CHAT_PANEL_WIDTH, STORAGE_KEY_CHAT_PANEL_COLLAPSED } from '~/lib/persistence/storageKeys';

// ── 拖拽分割面板常量 ─────────────────────────────────────────────────────────
const MIN_CHAT_WIDTH = 460; // 左侧面板最小宽度 (px)，含左右 padding 各 24px
const MIN_WORKBENCH_WIDTH = 400; // 右侧面板最小宽度 (px)
const DIVIDER_WIDTH = 6; // 分割线自身宽度 (px)
const COLLAPSE_OVERSCROLL = 120; // 向左超过最小值多少 px 后触发收起
// 展开/收起触发点：mouseX = MIN_CHAT_WIDTH + DIVIDER_WIDTH/2
// 右穿越时弹出（chatWidth = MIN_CHAT_WIDTH），左穿越时收起，鼠标始终与分割线对齐
const EXPAND_TRIGGER_X = MIN_CHAT_WIDTH + DIVIDER_WIDTH / 2; // = 463px
const DEFAULT_CHAT_WIDTH = 533; // 默认左侧宽度 (px)

const TEXTAREA_MIN_HEIGHT = 76;

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  onStreamingChange?: (streaming: boolean) => void;
  messages?: Message[];
  description?: string;
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  model?: string;
  setModel?: (model: string) => void;
  provider?: ProviderInfo;
  setProvider?: (provider: ProviderInfo) => void;
  providerList?: ProviderInfo[];
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
  importChat?: (description: string, messages: Message[]) => Promise<void>;
  exportChat?: () => void;
  uploadedFiles?: File[];
  setUploadedFiles?: (files: File[]) => void;
  imageDataList?: string[];
  setImageDataList?: (dataList: string[]) => void;
  actionAlert?: ActionAlert;
  clearAlert?: () => void;
  supabaseAlert?: SupabaseAlert;
  clearSupabaseAlert?: () => void;
  deployAlert?: DeployAlert;
  clearDeployAlert?: () => void;
  llmErrorAlert?: LlmErrorAlertType;
  clearLlmErrorAlert?: () => void;
  data?: JSONValue[] | undefined;
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  append?: (message: Message) => void;
  designScheme?: DesignScheme;
  setDesignScheme?: (scheme: DesignScheme) => void;
  selectedElement?: ElementInfo | null;
  setSelectedElement?: (element: ElementInfo | null) => void;
  addToolResult?: ({ toolCallId, result }: { toolCallId: string; result: any }) => void;
  onWebSearchResult?: (result: string) => void;
  /** Whether the chat is in edit-message mode */
  isEditing?: boolean;
  /** Callback to cancel the current edit */
  onCancelEdit?: () => void;
}

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      onStreamingChange,
      model,
      setModel,
      provider,
      setProvider,
      providerList,
      input = '',
      enhancingPrompt,
      handleInputChange,

      // promptEnhanced,
      enhancePrompt,
      sendMessage,
      handleStop,
      importChat,
      exportChat,
      uploadedFiles = [],
      setUploadedFiles,
      imageDataList = [],
      setImageDataList,
      messages,
      actionAlert,
      clearAlert,
      deployAlert,
      clearDeployAlert,
      supabaseAlert,
      clearSupabaseAlert,
      llmErrorAlert,
      clearLlmErrorAlert,
      data,
      chatMode,
      setChatMode,
      append,
      designScheme,
      setDesignScheme,
      selectedElement,
      setSelectedElement,
      addToolResult = () => {
        throw new Error('addToolResult not implemented');
      },
      onWebSearchResult,
      isEditing,
      onCancelEdit,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const { t } = useTranslation('chat');
    const [apiKeys, setApiKeys] = useState<Record<string, string>>(getApiKeysFromCookies());
    const [modelList, setModelList] = useState<ModelInfo[]>([]);
    const [isModelSettingsCollapsed, setIsModelSettingsCollapsed] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
    const [transcript, setTranscript] = useState('');
    const [isModelLoading, setIsModelLoading] = useState<string | undefined>('all');
    const [progressAnnotations, setProgressAnnotations] = useState<ProgressAnnotation[]>([]);
    const expoUrl = useStore(expoUrlAtom);
    const [qrModalOpen, setQrModalOpen] = useState(false);

    // ── 拖拽分割面板 refs / state ─────────────────────────────────────────────
    // 从 localStorage 读取持久化状态
    const _savedWidth =
      typeof window !== 'undefined'
        ? Number(localStorage.getItem(STORAGE_KEY_CHAT_PANEL_WIDTH)) || DEFAULT_CHAT_WIDTH
        : DEFAULT_CHAT_WIDTH;
    const _savedCollapsed =
      typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_CHAT_PANEL_COLLAPSED) === 'true' : false;

    const isResizingRef = useRef(false);
    const startXRef = useRef(0);
    const startWidthRef = useRef(_savedWidth);
    const [isChatCollapsed, setIsChatCollapsed] = useState(_savedCollapsed);
    const [isDividerActive, setIsDividerActive] = useState(false);
    const [isDividerResisting, setIsDividerResisting] = useState(false); // 分割线处于抵抗状态（即将收起）
    const collapsedRef = useRef(_savedCollapsed);
    const lastChatWidthRef = useRef(_savedWidth);
    const expandingFromCollapsedRef = useRef(false); // 是否正在从收起状态展开
    const collapsedWhileDraggingRef = useRef(false); // 已收起但鼠标仍按住
    const collapseXRef = useRef(0); // 触发收起时的鼠标 X 坐标
    const minWidthHitXRef = useRef<number | null>(null); // 鼠标第一次将面板压到最小宽度时的 X 坐标
    const chatPanelRef = useRef<HTMLDivElement>(null);

    // 挂载时将 CSS 变量同步到已保存的宽度
    useEffect(() => {
      if (_savedCollapsed) {
        document.documentElement.style.setProperty('--chat-min-width', '0px');
      } else {
        document.documentElement.style.setProperty('--chat-min-width', `${_savedWidth}px`);
      }
    }, []);

    const setCollapsed = useCallback((value: boolean) => {
      collapsedRef.current = value;
      setIsChatCollapsed(value);
      // 持久化收起状态
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_CHAT_PANEL_COLLAPSED, String(value));
        // 收起时把 CSS var 归零，保证下次拖拽 startWidth 不受旧值干扰
        if (value) {
          document.documentElement.style.setProperty('--chat-min-width', '0px');
        }
      }
    }, []);

    // 最大化/还原按钮的切换回调
    const handleToggleChatCollapsed = useCallback(() => {
      if (collapsedRef.current) {
        // 当前已收起 → 还原：恢复 CSS var，展开面板
        const restoreWidth = lastChatWidthRef.current || DEFAULT_CHAT_WIDTH;
        document.documentElement.style.setProperty('--chat-min-width', `${restoreWidth}px`);
        setCollapsed(false);
      } else {
        // 当前展开 → 最大化：保存当前宽度，收起面板
        const rawVal = getComputedStyle(document.documentElement).getPropertyValue('--chat-min-width').trim();
        const currentWidth = parseInt(rawVal) || DEFAULT_CHAT_WIDTH;
        if (currentWidth >= MIN_CHAT_WIDTH) {
          lastChatWidthRef.current = currentWidth;
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_CHAT_PANEL_WIDTH, String(currentWidth));
          }
        }
        setCollapsed(true);
      }
    }, [setCollapsed]);

    const handleDividerMouseDown = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();

        // 读取此时的收起状态（从 ref，避免 React stale closure 问题）
        const startingFromCollapsed = collapsedRef.current;
        expandingFromCollapsedRef.current = startingFromCollapsed;

        isResizingRef.current = true;
        startXRef.current = e.clientX;
        setIsDividerActive(true);

        if (startingFromCollapsed) {
          // 从收起状态展开：起始宽度设为 0，CSS var 已在 setCollapsed 中被归零
          // 实际展开锚点在 onMouseMove 中第一次向右拖拽时计算，以保证分割线跟随鼠标
          startWidthRef.current = 0;
        } else {
          // 正常拖拽：从当前 CSS var 读取起始宽度
          const rawVal = getComputedStyle(document.documentElement).getPropertyValue('--chat-min-width').trim();
          const parsed = parseInt(rawVal);
          startWidthRef.current = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CHAT_WIDTH;
        }

        // 关闭所有 CSS 过渡，让两侧面板实时跟随鼠标
        // （.divider-pill 通过 CSS 选择器排除，保留自身扩大动画）
        document.documentElement.setAttribute('data-resizing', '');

        const cleanup = () => {
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          expandingFromCollapsedRef.current = false;
          collapsedWhileDraggingRef.current = false;
          minWidthHitXRef.current = null;
          setIsDividerActive(false);
          setIsDividerResisting(false);
        };

        const onMouseMove = (ev: MouseEvent) => {
          const delta = ev.clientX - startXRef.current;
          const maxChatWidth = window.innerWidth - MIN_WORKBENCH_WIDTH - DIVIDER_WIDTH;

          if (collapsedWhileDraggingRef.current) {
            if (ev.clientX < EXPAND_TRIGGER_X) {
              // 仍在触发点左侧：保持收起，无视觉反馈
              return;
            }

            // 鼠标越过触发点：切换到 expanding 模式，接续下方分支处理（fall-through）
            collapsedWhileDraggingRef.current = false;
            expandingFromCollapsedRef.current = true;
            isResizingRef.current = true;
            document.documentElement.setAttribute('data-resizing', '');
            // 不 return，继续执行下方 expandingFromCollapsedRef 分支
          }

          if (!isResizingRef.current) return;

          // ── 从收起状态展开/收起的拖拽（绝对位置阈值 + 鼠标对齐 + 支持反向收起） ──
          // 规则：
          //   mouseX < EXPAND_TRIGGER_X → 面板收起（瞬间归零），无中间态
          //   mouseX ≥ EXPAND_TRIGGER_X → 面板展开，chatWidth = mouseX - DIVIDER_WIDTH/2
          //                               弹出瞬间 chatWidth = MIN_CHAT_WIDTH，鼠标精确对齐分割线
          // 不松手左右来回均可触发，始终保持在本分支（不切换正常模式以避免 clamp 错位）
          if (expandingFromCollapsedRef.current) {
            if (ev.clientX < EXPAND_TRIGGER_X) {
              // 鼠标回到触发点左侧：即时收起，无中间态
              document.documentElement.style.setProperty('--chat-min-width', '0px');

              if (!collapsedRef.current) {
                collapsedRef.current = true;
                setIsChatCollapsed(true);
                localStorage.setItem(STORAGE_KEY_CHAT_PANEL_COLLAPSED, 'true');
              }

              return;
            }

            // 鼠标在触发点右侧：chatWidth = mouseX - DIVIDER_WIDTH/2，精确对齐分割线
            const chatWidth = Math.min(maxChatWidth, Math.max(0, ev.clientX - DIVIDER_WIDTH / 2));

            if (collapsedRef.current) {
              collapsedRef.current = false;
              setIsChatCollapsed(false);
              localStorage.setItem(STORAGE_KEY_CHAT_PANEL_COLLAPSED, 'false');
            }

            document.documentElement.style.setProperty('--chat-min-width', `${chatWidth}px`);

            return;
          }

          // ── 正常拖拽 ────────────────────────────────────────────────────
          const rawWidth = startWidthRef.current + delta;

          if (rawWidth < MIN_CHAT_WIDTH) {
            // 记录鼠标第一次触碰最小宽度时的 X 坐标（作为超出量的基准点）
            // 这样无论拖多快，超出量都从 0 开始积累，保证完整的「卡住感」
            if (minWidthHitXRef.current === null) {
              minWidthHitXRef.current = ev.clientX;
              setIsDividerResisting(true);
            }

            const overscroll = minWidthHitXRef.current - ev.clientX;

            if (overscroll >= COLLAPSE_OVERSCROLL) {
              // 触发收起：保持监听以支持反向拉回
              lastChatWidthRef.current = startWidthRef.current;
              isResizingRef.current = false;
              document.documentElement.removeAttribute('data-resizing');
              setCollapsed(true);
              setIsDividerResisting(false);
              collapsedWhileDraggingRef.current = true;
              collapseXRef.current = ev.clientX;
              return;
            }

            // 未到阈值：夹在最小宽度，等待继续向左拖
            document.documentElement.style.setProperty('--chat-min-width', `${MIN_CHAT_WIDTH}px`);
          } else {
            // 宽度回到正常范围：重置最小宽度基准点及抵抗视觉
            minWidthHitXRef.current = null;
            setIsDividerResisting(false);

            const newChatWidth = Math.min(maxChatWidth, rawWidth);
            document.documentElement.style.setProperty('--chat-min-width', `${newChatWidth}px`);
          }
        };

        const onMouseUp = () => {
          isResizingRef.current = false;
          document.documentElement.removeAttribute('data-resizing');

          const rawVal = getComputedStyle(document.documentElement).getPropertyValue('--chat-min-width').trim();
          const currentWidth = parseInt(rawVal) || 0;

          if (collapsedWhileDraggingRef.current) {
            // 松手时仍处于收起状态：保持收起
          } else if (expandingFromCollapsedRef.current) {
            // 分支仍在 expanding 模式：根据面板是否已展开决定处理方式
            if (!collapsedRef.current && currentWidth > 0) {
              // 面板已展开：持久化当前宽度
              lastChatWidthRef.current = currentWidth;
              localStorage.setItem(STORAGE_KEY_CHAT_PANEL_WIDTH, String(currentWidth));
            } else {
              // 阈值未达到（含向左拖、单击）：保持收起，确保状态一致
              setCollapsed(true);
            }
          } else if (!collapsedRef.current) {
            // 正常拖拽结束：持久化宽度
            if (currentWidth >= MIN_CHAT_WIDTH) {
              lastChatWidthRef.current = currentWidth;
              localStorage.setItem(STORAGE_KEY_CHAT_PANEL_WIDTH, String(currentWidth));
            }
          }

          cleanup();
        };

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      },
      [setCollapsed],
    );

    useEffect(() => {
      if (expoUrl) {
        setQrModalOpen(true);
      }
    }, [expoUrl]);

    useEffect(() => {
      if (data) {
        const progressList = data.filter(
          (x) => typeof x === 'object' && (x as any).type === 'progress',
        ) as ProgressAnnotation[];
        setProgressAnnotations(progressList);
      }
    }, [data]);
    useEffect(() => {
      console.log(transcript);
    }, [transcript]);

    useEffect(() => {
      onStreamingChange?.(isStreaming);
    }, [isStreaming, onStreamingChange]);

    useEffect(() => {
      if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');

          setTranscript(transcript);

          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: transcript },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        setRecognition(recognition);
      }
    }, []);

    useEffect(() => {
      if (typeof window !== 'undefined') {
        let parsedApiKeys: Record<string, string> | undefined = {};

        try {
          parsedApiKeys = getApiKeysFromCookies();
          setApiKeys(parsedApiKeys);
        } catch (error) {
          console.error('Error loading API keys from cookies:', error);
          Cookies.remove('apiKeys');
        }

        setIsModelLoading('all');
        fetch('/api/models')
          .then((response) => response.json())
          .then((data) => {
            const typedData = data as { modelList: ModelInfo[] };
            setModelList(typedData.modelList);
          })
          .catch((error) => {
            console.error('Error fetching model list:', error);
          })
          .finally(() => {
            setIsModelLoading(undefined);
          });
      }
    }, [providerList, provider]);

    const onApiKeysChange = async (providerName: string, apiKey: string) => {
      const newApiKeys = { ...apiKeys, [providerName]: apiKey };
      setApiKeys(newApiKeys);
      Cookies.set('apiKeys', JSON.stringify(newApiKeys));

      setIsModelLoading(providerName);

      let providerModels: ModelInfo[] = [];

      try {
        const response = await fetch(`/api/models/${encodeURIComponent(providerName)}`);
        const data = await response.json();
        providerModels = (data as { modelList: ModelInfo[] }).modelList;
      } catch (error) {
        console.error('Error loading dynamic models for:', providerName, error);
      }

      // Only update models for the specific provider
      setModelList((prevModels) => {
        const otherModels = prevModels.filter((model) => model.provider !== providerName);
        return [...otherModels, ...providerModels];
      });
      setIsModelLoading(undefined);
    };

    const startListening = () => {
      if (recognition) {
        recognition.start();
        setIsListening(true);
      }
    };

    const stopListening = () => {
      if (recognition) {
        recognition.stop();
        setIsListening(false);
      }
    };

    const handleSendMessage = (event: React.UIEvent, messageInput?: string) => {
      if (sendMessage) {
        sendMessage(event, messageInput);
        setSelectedElement?.(null);

        if (recognition) {
          recognition.abort(); // Stop current recognition
          setTranscript(''); // Clear transcript
          setIsListening(false);

          // Clear the input by triggering handleInputChange with empty value
          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: '' },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        }
      }
    };

    const handleFileUpload = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (file) {
          const reader = new FileReader();

          reader.onload = (e) => {
            const base64Image = e.target?.result as string;
            setUploadedFiles?.([...uploadedFiles, file]);
            setImageDataList?.([...imageDataList, base64Image]);
          };
          reader.readAsDataURL(file);
        }
      };

      input.click();
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;

      if (!items) {
        return;
      }

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();

          const file = item.getAsFile();

          if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
              const base64Image = e.target?.result as string;
              setUploadedFiles?.([...uploadedFiles, file]);
              setImageDataList?.([...imageDataList, base64Image]);
            };
            reader.readAsDataURL(file);
          }

          break;
        }
      }
    };

    const baseChat = (
      <div
        ref={ref}
        className={classNames(styles.BaseChat, 'relative flex h-full w-full overflow-hidden')}
        data-chat-visible={showChat}
      >
        <ClientOnly>{() => <Menu />}</ClientOnly>
        <div
          className={classNames('flex w-full h-full', {
            'overflow-y-auto modern-scrollbar': !chatStarted,
            'overflow-hidden': chatStarted,
          })}
        >
          <div
            ref={chatPanelRef}
            className={classNames(styles.Chat, 'flex flex-col h-full transition-[width] duration-300 ease-in-out', {
              'flex-grow': !chatStarted,
              'flex-shrink-0': chatStarted,
              'overflow-hidden': chatStarted,
            })}
            style={chatStarted ? { width: isChatCollapsed ? '0px' : 'var(--chat-min-width)' } : undefined}
          >
            {!chatStarted && (
              <div id="intro" className="mt-[16vh] max-w-2xl mx-auto text-center px-4 lg:px-0">
                <h1 className="text-3xl lg:text-6xl font-bold text-bolt-elements-textPrimary mb-4 animate-fade-in">
                  {t('intro.title')}
                </h1>
                <p className="text-md lg:text-xl mb-8 text-bolt-elements-textSecondary animate-fade-in animation-delay-200">
                  {t('intro.subtitle')}
                </p>
              </div>
            )}
            <StickToBottom
              className={classNames('pt-6 px-2 sm:px-6 relative', {
                'h-full flex flex-col modern-scrollbar mr-1.5': chatStarted,
              })}
              resize="smooth"
              initial="smooth"
            >
              <StickToBottom.Content className="flex flex-col gap-4 relative ">
                <ClientOnly>
                  {() => {
                    return chatStarted ? (
                      <Messages
                        className="flex flex-col w-full flex-1 max-w-chat pb-4 mx-auto z-1"
                        messages={messages}
                        isStreaming={isStreaming}
                        append={append}
                        chatMode={chatMode}
                        setChatMode={setChatMode}
                        provider={provider}
                        model={model}
                        addToolResult={addToolResult}
                      />
                    ) : null;
                  }}
                </ClientOnly>
                {/* Cancel edit button with gradient overlay — sticks to bottom of message scroll area */}
                {isEditing && (
                  <div className="sticky bottom-0 left-0 right-0 z-50 flex flex-col items-center">
                    {/* Top gradient: transparent → semi-white */}
                    <div className="w-full h-8 bg-gradient-to-b from-transparent to-bolt-elements-background-depth-1/80 pointer-events-none" />
                    {/* Button area with solid-ish background */}
                    <div className="w-full flex justify-center bg-bolt-elements-background-depth-1/80 pb-2 pt-1">
                      <button
                        onClick={onCancelEdit}
                        className="
                          flex items-center gap-1.5 px-4 py-1.5 rounded-full
                          text-sm font-medium
                          bg-bolt-elements-background-depth-2
                          border border-bolt-elements-borderColor
                          text-bolt-elements-textSecondary
                          hover:text-bolt-elements-textPrimary
                          hover:bg-bolt-elements-background-depth-3
                          hover:border-accent-500/50
                          shadow-sm
                          transition-all duration-200
                          cursor-pointer
                          focus-visible:outline-none focus-visible:ring-1.5 focus-visible:ring-accent-500/50
                        "
                        aria-label={t('actions.cancelEdit')}
                      >
                        <div className="i-ph:x text-xs" />
                        {t('actions.cancelEdit')}
                      </button>
                    </div>
                  </div>
                )}
              </StickToBottom.Content>
              <div
                className={classNames('my-auto flex flex-col gap-2 w-full max-w-chat mx-auto z-prompt mb-6', {
                  'sticky bottom-2': chatStarted,
                })}
              >
                <div className="flex flex-col gap-2">
                  {deployAlert && (
                    <DeployChatAlert
                      alert={deployAlert}
                      clearAlert={() => clearDeployAlert?.()}
                      postMessage={(message: string | undefined) => {
                        sendMessage?.({} as any, message);
                        clearSupabaseAlert?.();
                      }}
                    />
                  )}
                  {supabaseAlert && (
                    <SupabaseChatAlert
                      alert={supabaseAlert}
                      clearAlert={() => clearSupabaseAlert?.()}
                      postMessage={(message) => {
                        sendMessage?.({} as any, message);
                        clearSupabaseAlert?.();
                      }}
                    />
                  )}
                  {actionAlert && (
                    <ChatAlert
                      alert={actionAlert}
                      clearAlert={() => clearAlert?.()}
                      postMessage={(message) => {
                        sendMessage?.({} as any, message);
                        clearAlert?.();
                      }}
                    />
                  )}
                  {llmErrorAlert && <LlmErrorAlert alert={llmErrorAlert} clearAlert={() => clearLlmErrorAlert?.()} />}
                </div>
                {progressAnnotations && <ProgressCompilation data={progressAnnotations} />}
                <ChatBox
                  isModelSettingsCollapsed={isModelSettingsCollapsed}
                  setIsModelSettingsCollapsed={setIsModelSettingsCollapsed}
                  provider={provider}
                  setProvider={setProvider}
                  providerList={providerList || (PROVIDER_LIST as ProviderInfo[])}
                  model={model}
                  setModel={setModel}
                  modelList={modelList}
                  apiKeys={apiKeys}
                  isModelLoading={isModelLoading}
                  onApiKeysChange={onApiKeysChange}
                  uploadedFiles={uploadedFiles}
                  setUploadedFiles={setUploadedFiles}
                  imageDataList={imageDataList}
                  setImageDataList={setImageDataList}
                  textareaRef={textareaRef}
                  input={input}
                  handleInputChange={handleInputChange}
                  handlePaste={handlePaste}
                  TEXTAREA_MIN_HEIGHT={TEXTAREA_MIN_HEIGHT}
                  TEXTAREA_MAX_HEIGHT={TEXTAREA_MAX_HEIGHT}
                  isStreaming={isStreaming}
                  handleStop={handleStop}
                  handleSendMessage={handleSendMessage}
                  enhancingPrompt={enhancingPrompt}
                  enhancePrompt={enhancePrompt}
                  isListening={isListening}
                  startListening={startListening}
                  stopListening={stopListening}
                  chatStarted={chatStarted}
                  exportChat={exportChat}
                  qrModalOpen={qrModalOpen}
                  setQrModalOpen={setQrModalOpen}
                  handleFileUpload={handleFileUpload}
                  chatMode={chatMode}
                  setChatMode={setChatMode}
                  designScheme={designScheme}
                  setDesignScheme={setDesignScheme}
                  selectedElement={selectedElement}
                  setSelectedElement={setSelectedElement}
                  onWebSearchResult={onWebSearchResult}
                />
              </div>
            </StickToBottom>
            <div className="flex flex-col justify-center">
              {!chatStarted && (
                <div className="flex justify-center gap-2">
                  <ImportButtons importChat={importChat} />
                  <GitCloneButton importChat={importChat} />
                </div>
              )}
              <div className="flex flex-col gap-5">
                {!chatStarted && (
                  <ExamplePrompts
                    sendMessage={(event, messageInput) => {
                      if (isStreaming) {
                        handleStop?.();
                        return;
                      }

                      handleSendMessage?.(event, messageInput);
                    }}
                  />
                )}
                {!chatStarted && <StarterTemplates />}
              </div>
            </div>
          </div>
          {/* Workbench panel — divider lives inside here so it always hugs the content left edge */}
          <div
            className={classNames('relative h-full overflow-hidden transition-[padding] duration-300 ease-in-out', {
              // 左侧 paddding: 收起时留 12px(pl-3) 间距 + 6px 分割线位 = 18px；
              // 未收起时只留 6px 给分割线，视觉上与原来一致
              'flex-1 py-3 pr-3': chatStarted,
              'pl-[18px]': chatStarted && isChatCollapsed, // 12px gap + 6px divider
              'pl-[6px]': chatStarted && !isChatCollapsed, //  0px gap + 6px divider
            })}
            style={chatStarted ? { minWidth: `${MIN_WORKBENCH_WIDTH}px` } : undefined}
          >
            {/* Resize divider — absolutely positioned at the left content boundary */}
            {chatStarted && (
              <div
                className="absolute top-0 bottom-0 w-[6px] flex items-center justify-center group cursor-col-resize z-20 transition-[left] duration-300 ease-in-out"
                style={{ left: isChatCollapsed ? '12px' : '0px' }}
                onMouseDown={handleDividerMouseDown}
              >
                {/* 药丸形把手：默认隐藏，hover 显示，拖拽时变高，抵抗时变橙色 */}
                <div
                  className={classNames(
                    'divider-pill w-[4px] rounded-full pointer-events-none',
                    'transition-[height,opacity,background-color]',
                    isDividerActive && isDividerResisting
                      ? 'h-20 opacity-100 bg-rose-400 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]'
                      : isDividerActive
                        ? 'h-14 opacity-100 bg-accent-500 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]'
                        : 'h-8 opacity-0 group-hover:opacity-100 group-hover:bg-accent-500/60 duration-200 ease-out',
                  )}
                />
              </div>
            )}
            <ClientOnly>
              {() => (
                <Workbench
                  chatStarted={chatStarted}
                  isStreaming={isStreaming}
                  isChatCollapsed={isChatCollapsed}
                  onToggleChatCollapsed={handleToggleChatCollapsed}
                  setSelectedElement={setSelectedElement}
                />
              )}
            </ClientOnly>
          </div>
        </div>
      </div>
    );

    return <Tooltip.Provider delayDuration={200}>{baseChat}</Tooltip.Provider>;
  },
);


