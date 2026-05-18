import { memo, useEffect, useState } from 'react';
import { bundledLanguages, codeToHtml, isSpecialLang, type BundledLanguage, type SpecialLanguage } from 'shiki';
import { classNames } from '~/utils/classNames';
import { createScopedLogger } from '~/utils/logger';

import styles from './CodeBlock.module.scss';

const logger = createScopedLogger('CodeBlock');

interface CodeBlockProps {
  className?: string;
  code: string;
  language?: BundledLanguage | SpecialLanguage;
  theme?: 'light-plus' | 'dark-plus';
  disableCopy?: boolean;
}

export const CodeBlock = memo(
  ({ className, code, language = 'plaintext', theme = 'dark-plus', disableCopy = false }: CodeBlockProps) => {
    const [html, setHTML] = useState<string | undefined>(undefined);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
      if (copied) {
        return;
      }

      navigator.clipboard.writeText(code);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    };

    useEffect(() => {
      let effectiveLanguage = language;

      if (language && !isSpecialLang(language) && !(language in bundledLanguages)) {
        logger.warn(`Unsupported language '${language}', falling back to plaintext`);
        effectiveLanguage = 'plaintext';
      }

      logger.trace(`Language = ${effectiveLanguage}`);

      const processCode = async () => {
        setHTML(await codeToHtml(code, { lang: effectiveLanguage, theme }));
      };

      processCode();
    }, [code, language, theme]);

    return (
      <div className={classNames('relative group text-left w-full min-w-0', className)}>
        {!disableCopy && (
          <div
            className={classNames(
              styles.CopyButtonContainer,
              'absolute top-[10px] right-[10px] z-10 flex items-center opacity-0 group-hover:opacity-100 transition-opacity',
              {
                'opacity-100': copied,
              },
            )}
          >
            {copied && (
              <span className="mr-2 h-[30px] rounded-md border border-gray-300 bg-white px-2 text-xs leading-[30px] text-gray-500 shadow-sm">
                Copied
              </span>
            )}
            <button
              type="button"
              className="relative flex h-[30px] w-[30px] items-center justify-center rounded-md bg-accent-500 text-lg text-white transition-theme hover:bg-accent-600"
              title="Copy Code"
              aria-label="Copy code"
              onClick={() => copyToClipboard()}
            >
              <div className="i-ph:clipboard-text-duotone" />
            </button>
          </div>
        )}
        <div
          className="max-w-full overflow-x-auto modern-scrollbar"
          dangerouslySetInnerHTML={{ __html: html ?? '' }}
        ></div>
      </div>
    );
  },
);
