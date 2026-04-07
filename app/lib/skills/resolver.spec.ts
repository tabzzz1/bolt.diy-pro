import { describe, expect, it } from 'vitest';
import { buildSkillsGuidance } from './resolver';

describe('skills resolver', () => {
  it('injects always skills and keyword-matched skills in order with cap', () => {
    const result = buildSkillsGuidance({
      userMessage: 'Please design API contract and review responsive UI',
      settings: {
        version: 1,
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
          },
          {
            id: 'keyword-1',
            name: 'API skill',
            description: '',
            instruction: 'Focus on contracts',
            enabled: true,
            mode: 'keyword',
            keywords: ['api', 'contract'],
          },
          {
            id: 'keyword-2',
            name: 'UI skill',
            description: '',
            instruction: 'Focus on responsive behavior',
            enabled: true,
            mode: 'keyword',
            keywords: ['ui', 'responsive'],
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
        version: 1,
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
        version: 1,
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
          },
        ],
      },
    });

    expect(result).toBeNull();
  });

  it('injects linked file context and script commands when provided', () => {
    const result = buildSkillsGuidance({
      userMessage: 'Please review architecture docs',
      files: {
        '/home/project/docs/SKILL.md': {
          type: 'file',
          content: 'Architecture decision summary',
          isBinary: false,
        },
      },
      settings: {
        version: 1,
        skillsEnabled: true,
        maxInjectedSkills: 3,
        skills: [
          {
            id: 'with-resources',
            name: 'Architecture reviewer',
            description: '',
            instruction: 'Use linked docs to ground decisions',
            enabled: true,
            mode: 'always',
            keywords: [],
            linkedFilePaths: ['docs/SKILL.md'],
            scriptCommands: ['pnpm typecheck'],
          },
        ],
      },
    });

    expect(result).not.toBeNull();
    expect(result!.guidance).toContain('File Context (docs/SKILL.md)');
    expect(result!.guidance).toContain('Script Commands: pnpm typecheck');
  });
});
