import { describe, expect, it } from 'vitest';
import { buildSkillsGuidance } from './resolver';

describe('skills resolver', () => {
  it('injects always skills and keyword-matched skills in order with cap', () => {
    const result = buildSkillsGuidance({
      userMessage: 'Please design API contract and review responsive UI',
      settings: {
        version: 2,
        skillsEnabled: true,
        maxInjectedSkills: 2,
        skills: [
          {
            id: 'always-1',
            name: 'Always reviewer',
            description: '',
            instruction: 'Always enforce review quality',
            enabled: true,
            mode: 'always',
            keywords: [],
            linkedFiles: [],
          },
          {
            id: 'keyword-1',
            name: 'API skill',
            description: '',
            instruction: 'Focus on contracts',
            enabled: true,
            mode: 'keyword',
            keywords: ['api', 'contract'],
            linkedFiles: [],
          },
          {
            id: 'keyword-2',
            name: 'UI skill',
            description: '',
            instruction: 'Focus on responsive behavior',
            enabled: true,
            mode: 'keyword',
            keywords: ['ui', 'responsive'],
            linkedFiles: [],
          },
        ],
      },
    });

    expect(result).not.toBeNull();
    expect(result!.appliedSkills).toHaveLength(2);
    expect(result!.appliedSkills[0].id).toBe('always-1');
    expect(result!.appliedSkills[1].id).toBe('keyword-1');
    expect(result!.guidance).toContain('<skills_guidance>');
  });

  it('returns null when skills are disabled', () => {
    const result = buildSkillsGuidance({
      userMessage: 'build ui',
      settings: {
        version: 2,
        skillsEnabled: false,
        maxInjectedSkills: 3,
        skills: [],
      },
    });

    expect(result).toBeNull();
  });

  it('ignores keyword skills without matches', () => {
    const result = buildSkillsGuidance({
      userMessage: 'write docs',
      settings: {
        version: 2,
        skillsEnabled: true,
        maxInjectedSkills: 3,
        skills: [
          {
            id: 'keyword-only',
            name: 'API skill',
            description: '',
            instruction: 'API-oriented answer',
            enabled: true,
            mode: 'keyword',
            keywords: ['api'],
            linkedFiles: [],
          },
        ],
      },
    });

    expect(result).toBeNull();
  });

  it('injects linked file content and no longer injects script commands', () => {
    const result = buildSkillsGuidance({
      userMessage: 'Please review architecture docs',
      settings: {
        version: 2,
        skillsEnabled: true,
        maxInjectedSkills: 3,
        skills: [
          {
            id: 'with-files',
            name: 'Architecture reviewer',
            description: '',
            instruction: 'Use linked docs to ground decisions',
            enabled: true,
            mode: 'always',
            keywords: [],
            linkedFiles: [
              {
                id: 'arch-1',
                name: 'docs/SKILL.md',
                content: 'Architecture decision summary',
                mimeType: 'text/markdown',
                sizeBytes: 28,
              },
            ],
          },
        ],
      },
    });

    expect(result).not.toBeNull();
    expect(result!.guidance).toContain('File Context (docs/SKILL.md)');
    expect(result!.guidance).toContain('Architecture decision summary');
    expect(result!.guidance).not.toContain('Script Commands');
  });

  it('enforces linked file context truncation limit', () => {
    const longContent = 'A'.repeat(3500);

    const result = buildSkillsGuidance({
      userMessage: 'please use docs',
      settings: {
        version: 2,
        skillsEnabled: true,
        maxInjectedSkills: 1,
        skills: [
          {
            id: 'with-long-files',
            name: 'Long context',
            description: '',
            instruction: 'Read files',
            enabled: true,
            mode: 'always',
            keywords: [],
            linkedFiles: [
              {
                id: 'f1',
                name: 'one.md',
                content: longContent,
                mimeType: 'text/markdown',
                sizeBytes: longContent.length,
              },
              {
                id: 'f2',
                name: 'two.md',
                content: longContent,
                mimeType: 'text/markdown',
                sizeBytes: longContent.length,
              },
            ],
          },
        ],
      },
    });

    expect(result).not.toBeNull();
    expect(result!.guidance).toContain('File Context (one.md)');
    expect(result!.guidance).toContain('File Context (two.md)');
    expect(result!.guidance.length).toBeLessThan(5000);
  });
});
