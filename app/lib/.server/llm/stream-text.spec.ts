import { describe, expect, it } from 'vitest';
import { buildEffectiveSystemPrompt, filterStreamingOptions } from './stream-text';

describe('stream-text helpers', () => {
  it('composes system prompt with skills and MCP guidance', () => {
    const prompt = buildEffectiveSystemPrompt({
      baseSystemPrompt: 'BASE_PROMPT',
      hasMCPTools: true,
      skillsGuidance: '<skills_guidance>Skill block</skills_guidance>',
    });

    expect(prompt).toContain('BASE_PROMPT');
    expect(prompt).toContain('<skills_guidance>Skill block</skills_guidance>');
    expect(prompt).toContain('<mcp_tools_guidance>');
  });

  it('keeps base prompt unchanged when no extra guidance is provided', () => {
    const prompt = buildEffectiveSystemPrompt({
      baseSystemPrompt: 'BASE_ONLY',
      hasMCPTools: false,
    });

    expect(prompt).toBe('BASE_ONLY');
  });

  it('strips unsupported reasoning params and skills option', () => {
    const filtered = filterStreamingOptions(
      {
        maxSteps: 3,
        temperature: 0.2,
        topP: 0.8,
        skills: { shouldNeverReachProvider: true },
      } as any,
      true,
    ) as Record<string, unknown>;

    expect(filtered.maxSteps).toBe(3);
    expect(filtered.temperature).toBeUndefined();
    expect(filtered.topP).toBeUndefined();
    expect(filtered.skills).toBeUndefined();
  });
});
