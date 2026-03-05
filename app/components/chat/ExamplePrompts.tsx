import React from 'react';
import { useTranslation } from 'react-i18next';

// Original English prompts - these are sent to the AI
const EXAMPLE_PROMPTS_TEXT = [
  'Create a mobile app about bolt.diy',
  'Build a todo app in React using Tailwind',
  'Build a simple blog using Astro',
  'Create a cookie consent form using Material UI',
  'Make a space invaders game',
  'Make a Tic Tac Toe game in html, css and js only',
];

interface ExamplePromptsProps {
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void | undefined;
}

export function ExamplePrompts({ sendMessage }: ExamplePromptsProps) {
  const { t } = useTranslation('chat');

  return (
    <div id="examples" className="relative flex flex-col gap-9 w-full max-w-3xl mx-auto flex justify-center mt-6">
      <div
        className="flex flex-wrap justify-center gap-2"
        style={{
          animation: '.25s ease-out 0s 1 _fade-and-move-in_g2ptj_1 forwards',
        }}
      >
        {EXAMPLE_PROMPTS_TEXT.map((text, index) => {
          const label = t(`examplePrompts.prompt${index}` as any);

          return (
            <button
              key={index}
              onClick={(event) => {
                sendMessage?.(event, text);
              }}
              className="border border-bolt-elements-borderColor rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-900 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary px-3 py-1 text-xs transition-theme"
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
