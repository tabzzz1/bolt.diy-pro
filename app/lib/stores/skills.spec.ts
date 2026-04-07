// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEY_SKILLS_SETTINGS } from '~/lib/persistence/storageKeys';
import { defaultSkillsSettings } from '~/lib/skills/schema';
import { useSkillsStore, type WorkspaceFileMap } from './skills';

function resetSkillsStore() {
  useSkillsStore.setState({
    isInitialized: false,
    settings: defaultSkillsSettings,
    error: null,
    migrationReport: null,
    legacyMigrationPending: false,
    legacyMigrationSource: null,
  });
}

describe('skills store legacy migration', () => {
  beforeEach(() => {
    localStorage.clear();
    resetSkillsStore();
  });

  it('migrates legacy linkedFilePaths to linkedFiles and persists normalized settings', () => {
    const legacySettings = {
      version: 1,
      skillsEnabled: true,
      maxInjectedSkills: 3,
      skills: [
        {
          id: 'legacy-skill',
          name: 'Legacy skill',
          description: 'old',
          instruction: 'Use legacy files',
          enabled: true,
          mode: 'always',
          keywords: [],
          linkedFilePaths: ['docs/guide.md', 'docs/missing.md'],
          scriptCommands: ['pnpm lint'],
        },
      ],
    };

    localStorage.setItem(STORAGE_KEY_SKILLS_SETTINGS, JSON.stringify(legacySettings));

    const workspaceFiles: WorkspaceFileMap = {
      '/home/project/docs/guide.md': {
        type: 'file',
        content: '# Guide\nUse this for answers.',
        isBinary: false,
      },
    };

    useSkillsStore.getState().initialize(workspaceFiles);

    const state = useSkillsStore.getState();
    expect(state.isInitialized).toBe(true);
    expect(state.settings.skills[0].linkedFiles).toHaveLength(1);
    expect(state.settings.skills[0].linkedFiles[0].name).toBe('guide.md');
    expect(state.migrationReport).toEqual({ migrated: 1, skipped: 1 });

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY_SKILLS_SETTINGS) || '{}');
    expect(persisted.version).toBe(2);
    expect(persisted.skills[0].linkedFiles).toHaveLength(1);
    expect(persisted.skills[0].linkedFilePaths).toBeUndefined();
    expect(persisted.skills[0].scriptCommands).toBeUndefined();
  });

  it('defers migration until workspace files are available, then completes migration', () => {
    const legacySettings = {
      version: 1,
      skillsEnabled: true,
      maxInjectedSkills: 3,
      skills: [
        {
          id: 'legacy-skill',
          name: 'Legacy skill',
          description: 'old',
          instruction: 'Use legacy files',
          enabled: true,
          mode: 'always',
          keywords: [],
          linkedFilePaths: ['docs/guide.md'],
        },
      ],
    };

    const rawLegacy = JSON.stringify(legacySettings);
    localStorage.setItem(STORAGE_KEY_SKILLS_SETTINGS, rawLegacy);

    useSkillsStore.getState().initialize({});

    let state = useSkillsStore.getState();
    expect(state.isInitialized).toBe(true);
    expect(state.legacyMigrationPending).toBe(true);
    expect(state.settings.skills[0].linkedFiles).toHaveLength(0);
    expect(localStorage.getItem(STORAGE_KEY_SKILLS_SETTINGS)).toBe(rawLegacy);

    const workspaceFiles: WorkspaceFileMap = {
      '/home/project/docs/guide.md': {
        type: 'file',
        content: 'Guide content',
        isBinary: false,
      },
    };

    useSkillsStore.getState().initialize(workspaceFiles);

    state = useSkillsStore.getState();
    expect(state.legacyMigrationPending).toBe(false);
    expect(state.settings.skills[0].linkedFiles).toHaveLength(1);
    expect(state.migrationReport).toEqual({ migrated: 1, skipped: 0 });

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY_SKILLS_SETTINGS) || '{}');
    expect(persisted.skills[0].linkedFiles).toHaveLength(1);
  });
});
