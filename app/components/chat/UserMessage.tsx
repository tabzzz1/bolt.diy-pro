/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import { MODEL_REGEX, PROVIDER_REGEX } from '~/utils/constants';
import { Markdown } from './Markdown';
import { useStore } from '@nanostores/react';
import { profileStore } from '~/lib/stores/profile';
import { UserMessageActions } from './MessageActions';
import type {
  TextUIPart,
  ReasoningUIPart,
  ToolInvocationUIPart,
  SourceUIPart,
  FileUIPart,
  StepStartUIPart,
} from '@ai-sdk/ui-utils';

interface UserMessageProps {
  content: string | Array<{ type: string; text?: string; image?: string }>;
  parts:
    | (TextUIPart | ReasoningUIPart | ToolInvocationUIPart | SourceUIPart | FileUIPart | StepStartUIPart)[]
    | undefined;
  /** Callback to delete this message */
  onDelete?: () => void;
}

function UserAvatar({ profile }: { profile: any }) {
  if (profile?.avatar) {
    return (
      <img
        src={profile.avatar}
        alt={profile?.username || 'User'}
        className="w-7 h-7 object-cover rounded-full flex-shrink-0 ring-1 ring-bolt-elements-borderColor"
        loading="eager"
        decoding="sync"
      />
    );
  }

  return (
    <div className="w-7 h-7 rounded-full bg-accent-500/20 flex items-center justify-center flex-shrink-0">
      <div className="i-ph:user-fill text-accent-500 text-sm" />
    </div>
  );
}

export function UserMessage({ content, parts, onDelete }: UserMessageProps) {
  const profile = useStore(profileStore);

  // Extract images from parts - look for file parts with image mime types
  const images =
    parts?.filter(
      (part): part is FileUIPart => part.type === 'file' && 'mimeType' in part && part.mimeType.startsWith('image/'),
    ) || [];

  if (Array.isArray(content)) {
    const textItem = content.find((item) => item.type === 'text');
    const textContent = stripMetadata(textItem?.text || '');

    return (
      <div className="group flex items-start justify-end gap-2 ml-auto max-w-full min-w-0">
        <div className="flex flex-col max-w-[85%] min-w-0">
          <div className="bg-bolt-elements-prompt-background border border-bolt-elements-borderColor/60 px-4 py-3 rounded-2xl rounded-tr-md shadow-sm overflow-hidden text-sm lg:text-base">
            {textContent && (
              <div className="max-h-[60vh] overflow-y-auto modern-scrollbar break-words">
                <Markdown html>{textContent}</Markdown>
              </div>
            )}
            {images.map((item, index) => (
              <img
                key={index}
                src={`data:${item.mimeType};base64,${item.data}`}
                alt={`Image ${index + 1}`}
                className="max-w-full h-auto rounded-lg"
                style={{ maxHeight: '512px', objectFit: 'contain' }}
              />
            ))}
          </div>
          <div className="mt-1 pr-1">
            <UserMessageActions content={textContent} onDelete={onDelete} />
          </div>
        </div>
        <UserAvatar profile={profile} />
      </div>
    );
  }

  const textContent = stripMetadata(content);

  return (
    <div className="group flex items-start justify-end gap-2 ml-auto max-w-full min-w-0">
      <div className="flex flex-col max-w-[85%] min-w-0">
        {images.length > 0 && (
          <div className="flex gap-2.5 justify-end mb-1">
            {images.map((item, index) => (
              <div
                key={index}
                className="relative flex rounded-xl border border-bolt-elements-borderColor overflow-hidden shadow-sm flex-shrink-0"
              >
                <div className="h-20 w-20 bg-transparent outline-none">
                  <img
                    src={`data:${item.mimeType};base64,${item.data}`}
                    alt={`Image ${index + 1}`}
                    className="h-full w-full rounded-xl"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="bg-bolt-elements-prompt-background border border-bolt-elements-borderColor/60 px-4 py-3 rounded-2xl rounded-tr-md shadow-sm overflow-hidden text-sm lg:text-base min-w-0">
          <div className="max-h-[60vh] overflow-y-auto modern-scrollbar break-words">
            <Markdown html>{textContent}</Markdown>
          </div>
        </div>
        <div className="mt-1 pr-1">
          <UserMessageActions content={textContent} onDelete={onDelete} />
        </div>
      </div>
      <UserAvatar profile={profile} />
    </div>
  );
}

function stripMetadata(content: string) {
  const artifactRegex = /<boltArtifact\s+[^>]*>[\s\S]*?<\/boltArtifact>/gm;
  return content.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, '').replace(artifactRegex, '');
}
