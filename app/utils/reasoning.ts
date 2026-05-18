export interface ExtractedReasoning {
  content: string;
  reasoning: string;
}

const THINK_BLOCK_PATTERN = /<think\b[^>]*>([\s\S]*?)<\/think>/gi;
const BOLT_THOUGHT_BLOCK_PATTERN =
  /<div\s+class=(["'])__boltThought__\1\s*>([\s\S]*?)<\/div>/gi;

function extractBlocks(content: string, pattern: RegExp, groupIndex: number) {
  let reasoning = '';
  const visibleContent = content.replace(pattern, (_match, ...groups: string[]) => {
    const block = groups[groupIndex - 1] || '';
    reasoning += `${reasoning ? '\n\n' : ''}${block.trim()}`;

    return '';
  });

  return {
    content: visibleContent,
    reasoning,
  };
}

export function extractReasoningFromContent(content: string): ExtractedReasoning {
  if (!content) {
    return { content, reasoning: '' };
  }

  const withoutThink = extractBlocks(content, THINK_BLOCK_PATTERN, 1);
  const withoutBoltThought = extractBlocks(withoutThink.content, BOLT_THOUGHT_BLOCK_PATTERN, 2);
  const reasoning = [withoutThink.reasoning, withoutBoltThought.reasoning].filter(Boolean).join('\n\n');

  return {
    content: withoutBoltThought.content.trimStart(),
    reasoning,
  };
}
