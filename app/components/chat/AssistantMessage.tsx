import { memo, Fragment, useEffect, useMemo, useState } from 'react';
import { Markdown } from './Markdown';
import type { JSONValue } from 'ai';
import Popover from '~/components/ui/Popover';
import { workbenchStore } from '~/lib/stores/workbench';
import { WORK_DIR } from '~/utils/constants';
import type { Message } from 'ai';
import type { ProviderInfo } from '~/types/model';
import type {
  TextUIPart,
  ReasoningUIPart,
  ToolInvocationUIPart,
  SourceUIPart,
  FileUIPart,
  StepStartUIPart,
} from '@ai-sdk/ui-utils';
import { ToolInvocations } from './ToolInvocations';
import type { ToolCallAnnotation } from '~/types/context';
import { useTranslation } from 'react-i18next';
import { AssistantMessageActions } from './MessageActions';

interface AssistantMessageProps {
  content: string;
  annotations?: JSONValue[];
  messageId?: string;
  onRewind?: (messageId: string) => void;
  onFork?: (messageId: string) => void;
  append?: (message: Message) => void;
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  model?: string;
  provider?: ProviderInfo;
  parts:
    | (TextUIPart | ReasoningUIPart | ToolInvocationUIPart | SourceUIPart | FileUIPart | StepStartUIPart)[]
    | undefined;
  addToolResult: ({ toolCallId, result }: { toolCallId: string; result: any }) => void;
  /** Whether this message is currently being streamed */
  isStreaming?: boolean;
}

function openArtifactInWorkbench(filePath: string) {
  filePath = normalizedFilePath(filePath);

  if (workbenchStore.currentView.get() !== 'code') {
    workbenchStore.currentView.set('code');
  }

  workbenchStore.setSelectedFile(`${WORK_DIR}/${filePath}`);
}

function normalizedFilePath(path: string) {
  let normalizedPath = path;

  if (normalizedPath.startsWith(WORK_DIR)) {
    normalizedPath = path.replace(WORK_DIR, '');
  }

  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.slice(1);
  }

  return normalizedPath;
}

export const AssistantMessage = memo(
  ({
    content,
    annotations,
    messageId,
    onRewind,
    onFork,
    append,
    chatMode,
    setChatMode,
    model,
    provider,
    parts,
    addToolResult,
    isStreaming,
  }: AssistantMessageProps) => {
    const { t } = useTranslation('chat');
    const [totalDurationSeconds, setTotalDurationSeconds] = useState<number | null>(null);

    const filteredAnnotations = (annotations?.filter(
      (annotation: JSONValue) =>
        annotation && typeof annotation === 'object' && Object.keys(annotation).includes('type'),
    ) || []) as { type: string; value: any } & { [key: string]: any }[];

    let chatSummary: string | undefined = undefined;

    if (filteredAnnotations.find((annotation) => annotation.type === 'chatSummary')) {
      chatSummary = filteredAnnotations.find((annotation) => annotation.type === 'chatSummary')?.summary;
    }

    let codeContext: string[] | undefined = undefined;

    if (filteredAnnotations.find((annotation) => annotation.type === 'codeContext')) {
      codeContext = filteredAnnotations.find((annotation) => annotation.type === 'codeContext')?.files;
    }

    const usage: {
      completionTokens: number;
      promptTokens: number;
      totalTokens: number;
    } = filteredAnnotations.find((annotation) => annotation.type === 'usage')?.value;

    const toolCallAnnotations = filteredAnnotations.filter(
      (annotation) => annotation.type === 'toolCall',
    ) as ToolCallAnnotation[];

    /**
     * Group parts into ordered segments so that tool invocation cards appear
     * inline at their natural position instead of being pushed to the bottom.
     *
     * Each segment is either:
     *   - { type: 'text', text: string }           – consecutive text parts merged
     *   - { type: 'tool-invocations', parts: [] }  – consecutive tool invocations grouped
     *
     * IMPORTANT: The `content` prop is the *parsed* version (with <boltArtifact>
     * replaced by <div class="__boltArtifact__">), while `parts[].text` contains
     * the *raw* content. We must use `content` for text rendering so that
     * artifact cards display correctly.
     */
    const groupedSegments = useMemo(() => {
      if (!parts || parts.length === 0) {
        // Fallback: no parts, just render content
        return [{ type: 'text' as const, text: content }];
      }

      const hasToolInvocations = parts.some((p) => p.type === 'tool-invocation');

      if (!hasToolInvocations) {
        // No tool invocations – use the pre-parsed `content` so that
        // <boltArtifact> tags (now transformed to __boltArtifact__ divs)
        // render as artifact cards instead of raw code.
        return [{ type: 'text' as const, text: content }];
      }

      // There are tool invocations – interleave text and tool-invocation segments.
      // We use the parsed `content` for the text portions while preserving
      // tool-invocation parts at their natural positions.
      const segments: ({ type: 'text'; text: string } | { type: 'tool-invocations'; parts: ToolInvocationUIPart[] })[] =
        [];

      // Collect tool invocation groups in order from parts
      // and place the parsed content as a single leading text block.
      let hasLeadingText = false;

      for (const part of parts) {
        if (part.type === 'text') {
          // Only push the parsed content once as the leading text block
          if (!hasLeadingText) {
            hasLeadingText = true;
            segments.push({ type: 'text', text: content });
          }
        } else if (part.type === 'tool-invocation') {
          // Group consecutive tool invocation parts
          const last = segments[segments.length - 1];

          if (last && last.type === 'tool-invocations') {
            last.parts.push(part);
          } else {
            segments.push({ type: 'tool-invocations', parts: [part] });
          }
        }

        // Other part types (reasoning, source, file, step-start) are ignored for now
      }

      // If no text part was encountered, still include the parsed content
      if (!hasLeadingText && content) {
        segments.unshift({ type: 'text', text: content });
      }

      return segments;
    }, [parts, content]);

    useEffect(() => {
      if (!isStreaming) {
        return undefined;
      }

      setTotalDurationSeconds(null);

      const startAt = Date.now();

      const timer = window.setInterval(() => {
        // Keep the event loop active for smoother end timing.
      }, 500);

      return () => {
        window.clearInterval(timer);
        const seconds = Math.max(1, Math.round((Date.now() - startAt) / 1000));
        setTotalDurationSeconds(seconds);
      };
    }, [isStreaming]);

  return (
      <div className="group overflow-hidden w-full">
        {/* Assistant header row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            {/* AI icon */}
            <div className="w-5.5 h-5.5 rounded-full bg-accent-500/15 flex items-center justify-center flex-shrink-0">
              <div className="i-ph:robot text-accent-500 text-[11px]" />
            </div>
            <span className="text-xs font-medium text-bolt-elements-textSecondary">{t('assistantLabel')}</span>

            {/* Context info popover */}
            {(codeContext || chatSummary) && (
              <Popover
                side="right"
                align="start"
                trigger={
                  <div className="i-ph:info text-bolt-elements-textTertiary hover:text-bolt-elements-textSecondary transition-colors cursor-pointer text-sm" />
                }
              >
                {chatSummary && (
                  <div className="max-w-chat">
                    <div className="summary max-h-96 flex flex-col">
                      <h2 className="border border-bolt-elements-borderColor rounded-md p4">
                        {t('artifact.chatSummaryHeading')}
                      </h2>
                      <div style={{ zoom: 0.7 }} className="overflow-y-auto m4">
                        <Markdown>{chatSummary}</Markdown>
                      </div>
                    </div>
                    {codeContext && (
                      <div className="code-context flex flex-col p4 border border-bolt-elements-borderColor rounded-md">
                        <h2>{t('artifact.codeContextHeading')}</h2>
                        <div className="flex gap-4 mt-4 bolt" style={{ zoom: 0.6 }}>
                          {codeContext.map((x) => {
                            const normalized = normalizedFilePath(x);
                            return (
                              <Fragment key={normalized}>
                                <code
                                  className="bg-bolt-elements-artifacts-inlineCode-background text-bolt-elements-artifacts-inlineCode-text px-1.5 py-1 rounded-md text-bolt-elements-item-contentAccent hover:underline cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openArtifactInWorkbench(normalized);
                                  }}
                                >
                                  {normalized}
                                </code>
                              </Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="context"></div>
              </Popover>
            )}
          </div>

          {/* Right side: token usage */}
          {usage && (
            <div className="flex items-center gap-1 text-xs text-bolt-elements-textTertiary bg-bolt-elements-background-depth-2 px-2 py-0.5 rounded-full border border-bolt-elements-borderColor/40">
              <div className="i-ph:coins text-xs" />
              <span>{t('tokenCount', { count: usage.totalTokens })}</span>
            </div>
          )}
        </div>

        {/* Message content — rendered in part order so tool cards stay in place */}
        <div className="pl-[30px]">
          {groupedSegments.map((segment, index) => {
            if (segment.type === 'text') {
              return (
                <Markdown
                  key={`text-${index}`}
                  append={append}
                  chatMode={chatMode}
                  setChatMode={setChatMode}
                  model={model}
                  provider={provider}
                  html
                >
                  {segment.text}
                </Markdown>
              );
            }

            if (segment.type === 'tool-invocations') {
              return (
                <ToolInvocations
                  key={`tools-${index}`}
                  toolInvocations={segment.parts}
                  toolCallAnnotations={toolCallAnnotations}
                  addToolResult={addToolResult}
                />
              );
            }

            return null;
          })}

          {!isStreaming && totalDurationSeconds !== null && (
            <div className="mt-2 text-[11px] text-bolt-elements-textTertiary">
              {t('process.totalDuration', { seconds: totalDurationSeconds })}
            </div>
          )}

          {/* Bottom-left action bar — visible after streaming ends */}
          <AssistantMessageActions
            content={content}
            messageId={messageId}
            onRewind={onRewind}
            onFork={onFork}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    );
  },
);
