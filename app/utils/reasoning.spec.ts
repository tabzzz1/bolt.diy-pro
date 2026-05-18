import { describe, expect, it } from 'vitest';
import { extractReasoningFromContent } from './reasoning';

describe('extractReasoningFromContent', () => {
  it('extracts closed think blocks from assistant text', () => {
    const result = extractReasoningFromContent('<think>Plan first</think>\nFinal answer');

    expect(result).toEqual({
      content: 'Final answer',
      reasoning: 'Plan first',
    });
  });

  it('does not treat an unclosed think block as complete reasoning', () => {
    const result = extractReasoningFromContent('Intro\n<think>Still thinking');

    expect(result).toEqual({
      content: 'Intro\n<think>Still thinking',
      reasoning: '',
    });
  });

  it('extracts legacy bolt thought containers', () => {
    const result = extractReasoningFromContent(
      '<div class="__boltThought__">Legacy thought</div>\nVisible response',
    );

    expect(result).toEqual({
      content: 'Visible response',
      reasoning: 'Legacy thought',
    });
  });

  it('combines multiple reasoning blocks without hiding normal content', () => {
    const result = extractReasoningFromContent('A\n<think>One</think>\nB\n<think>Two</think>\nC');

    expect(result).toEqual({
      content: 'A\n\nB\n\nC',
      reasoning: 'One\n\nTwo',
    });
  });
});
