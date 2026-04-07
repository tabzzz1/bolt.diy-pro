import { describe, expect, it } from 'vitest';
import {
  defaultSkillsSettings,
  MAX_INJECTED_SKILLS,
  MAX_LINKED_FILE_BYTES,
  MAX_LINKED_FILES_PER_SKILL,
  MAX_LINKED_FILES_TOTAL_BYTES,
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
          linkedFiles: [
            {
              id: 'spec-1',
              name: 'README.md',
              content: '# Skill context',
              mimeType: 'text/markdown',
              sizeBytes: 999999,
            },
          ],
        },
      ],
    });

    expect(normalized.maxInjectedSkills).toBe(MAX_INJECTED_SKILLS);
    expect(normalized.skills).toHaveLength(1);
    expect(normalized.skills[0].keywords).toEqual(['UI', 'responsive']);
    expect(normalized.skills[0].linkedFiles).toHaveLength(1);
    expect(normalized.skills[0].linkedFiles[0].name).toBe('README.md');
    expect(normalized.skills[0].linkedFiles[0].sizeBytes).toBe(new TextEncoder().encode('# Skill context').byteLength);
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

  it('accepts legacy payload shape and strips legacy-only fields', () => {
    const normalized = normalizeSkillsSettings({
      version: 1,
      skillsEnabled: true,
      maxInjectedSkills: 2,
      skills: [
        {
          id: 'legacy',
          name: 'Legacy skill',
          description: 'legacy',
          instruction: 'legacy instruction',
          enabled: true,
          mode: 'always',
          keywords: [],
          linkedFilePaths: ['docs/legacy.md'],
          scriptCommands: ['pnpm lint'],
        },
      ],
    });

    expect(normalized.skills).toHaveLength(1);
    expect(normalized.version).toBe(2);
    expect(normalized.skills[0].linkedFiles).toEqual([]);
    expect('linkedFilePaths' in normalized.skills[0]).toBe(false);
    expect('scriptCommands' in normalized.skills[0]).toBe(false);
  });

  it('enforces linked file count/size/total limits and skips non-text files', () => {
    const oversized = 'x'.repeat(MAX_LINKED_FILE_BYTES + 1);
    const seventyKb = 'a'.repeat(70 * 1024);

    const normalized = normalizeSkillsSettings({
      skillsEnabled: true,
      maxInjectedSkills: 3,
      skills: [
        {
          id: 'files',
          name: 'Files',
          description: '',
          instruction: 'Use linked files',
          enabled: true,
          mode: 'always',
          keywords: [],
          linkedFiles: [
            { id: '1', name: 'one.md', content: 'one', mimeType: 'text/markdown', sizeBytes: 1 },
            { id: '2', name: 'two.md', content: 'two', mimeType: 'text/markdown', sizeBytes: 1 },
            { id: '3', name: 'three.md', content: 'three', mimeType: 'text/markdown', sizeBytes: 1 },
            { id: '4', name: 'four.md', content: 'four', mimeType: 'text/markdown', sizeBytes: 1 },
            { id: '5', name: 'five.md', content: 'five', mimeType: 'text/markdown', sizeBytes: 1 },
            { id: '6', name: 'six.md', content: 'six', mimeType: 'text/markdown', sizeBytes: 1 },
            { id: '7', name: 'bad.png', content: 'binary-ish', mimeType: 'image/png', sizeBytes: 1 },
            { id: '8', name: 'huge.md', content: oversized, mimeType: 'text/markdown', sizeBytes: 1 },
          ],
        },
      ],
    });

    expect(normalized.skills[0].linkedFiles).toHaveLength(MAX_LINKED_FILES_PER_SKILL);
    expect(normalized.skills[0].linkedFiles.every((file) => file.sizeBytes <= MAX_LINKED_FILE_BYTES)).toBe(true);
    expect(normalized.skills[0].linkedFiles.some((file) => file.name === 'bad.png')).toBe(false);
    expect(normalized.skills[0].linkedFiles.some((file) => file.name === 'huge.md')).toBe(false);

    const normalizedByTotal = normalizeSkillsSettings({
      skillsEnabled: true,
      maxInjectedSkills: 3,
      skills: [
        {
          id: 'total',
          name: 'Total',
          description: '',
          instruction: 'Test total size',
          enabled: true,
          mode: 'always',
          keywords: [],
          linkedFiles: [
            { id: 'a', name: 'a.md', content: seventyKb, mimeType: 'text/markdown', sizeBytes: 1 },
            { id: 'b', name: 'b.md', content: seventyKb, mimeType: 'text/markdown', sizeBytes: 1 },
            { id: 'c', name: 'c.md', content: seventyKb, mimeType: 'text/markdown', sizeBytes: 1 },
            { id: 'd', name: 'd.md', content: seventyKb, mimeType: 'text/markdown', sizeBytes: 1 },
          ],
        },
      ],
    });

    const totalBytes = normalizedByTotal.skills[0].linkedFiles.reduce((sum, file) => sum + file.sizeBytes, 0);
    expect(totalBytes).toBeLessThanOrEqual(MAX_LINKED_FILES_TOTAL_BYTES);
    expect(normalizedByTotal.skills[0].linkedFiles).toHaveLength(3);
  });
});
