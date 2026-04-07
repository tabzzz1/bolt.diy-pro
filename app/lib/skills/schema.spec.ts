import { describe, expect, it } from 'vitest';
import {
  defaultSkillsSettings,
  MAX_INJECTED_SKILLS,
  normalizeSkillsSettings,
  validateSkillsSettings,
} from './schema';

describe('skills schema normalization', () => {
  it('returns defaults for invalid input', () => {
    expect(normalizeSkillsSettings(null)).toEqual(defaultSkillsSettings);
    expect(normalizeSkillsSettings('invalid')).toEqual(defaultSkillsSettings);
  });

  it('normalizes and clamps values safely', () => {
    const normalized = normalizeSkillsSettings({
      skillsEnabled: true,
      maxInjectedSkills: 999,
      skills: [
        {
          id: 'frontend',
          name: 'Frontend',
          description: 'Improve UI',
          instruction: 'Always check responsive behavior',
          enabled: true,
          mode: 'always',
          keywords: ['UI', 'ui', 'responsive'],
        },
      ],
    });

    expect(normalized.maxInjectedSkills).toBe(MAX_INJECTED_SKILLS);
    expect(normalized.skills).toHaveLength(1);
    expect(normalized.skills[0].keywords).toEqual(['UI', 'responsive']);
  });

  it('drops malformed skills and deduplicates by id', () => {
    const normalized = normalizeSkillsSettings({
      skillsEnabled: true,
      maxInjectedSkills: 2,
      skills: [
        {
          id: 'dup',
          name: 'First',
          description: '',
          instruction: 'Use strict checks',
          enabled: true,
          mode: 'always',
          keywords: [],
        },
        {
          id: 'dup',
          name: 'Second',
          description: '',
          instruction: 'Should be ignored because duplicate id',
          enabled: true,
          mode: 'always',
          keywords: [],
        },
        {
          id: 'bad',
          name: '',
          description: '',
          instruction: '',
          enabled: true,
          mode: 'always',
          keywords: [],
        },
      ],
    });

    expect(normalized.skills).toHaveLength(1);
    expect(normalized.skills[0].name).toBe('First');
  });

  it('exposes schema validation helper', () => {
    const result = validateSkillsSettings(defaultSkillsSettings);
    expect(result.success).toBe(true);
  });
});
