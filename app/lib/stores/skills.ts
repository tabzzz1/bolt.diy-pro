import { create } from 'zustand';
import { STORAGE_KEY_SKILLS_SETTINGS } from '~/lib/persistence/storageKeys';
import type { FileMap } from '~/lib/stores/files';
import {
  defaultSkillsSettings,
  inferSkillFileMimeType,
  isSupportedSkillFile,
  MAX_LINKED_FILE_BYTES,
  MAX_LINKED_FILES_PER_SKILL,
  MAX_LINKED_FILES_TOTAL_BYTES,
  normalizeSkillsSettings,
  type SkillDefinition,
  type SkillLinkedFile,
  type SkillsSettings,
} from '~/lib/skills/schema';

const isBrowser = typeof window !== 'undefined';

export type WorkspaceFileMap = FileMap;

type MigrationReport = {
  migrated: number;
  skipped: number;
};

type Store = {
  isInitialized: boolean;
  settings: SkillsSettings;
  error: string | null;
  migrationReport: MigrationReport | null;
  legacyMigrationPending: boolean;
  legacyMigrationSource: unknown | null;
};

type Actions = {
  initialize: (workspaceFiles?: WorkspaceFileMap) => void;
  updateSettings: (settings: SkillsSettings) => void;
  upsertSkill: (skill: SkillDefinition) => void;
  deleteSkill: (skillId: string) => void;
};

function persistSettings(settings: SkillsSettings) {
  if (!isBrowser) {
    return;
  }

  localStorage.setItem(STORAGE_KEY_SKILLS_SETTINGS, JSON.stringify(settings));
}

function sanitizeLegacyPath(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const path = value.replace(/\\/g, '/').replace(/^\.\//, '').trim();
  return path.length > 0 ? path : null;
}

function parseLegacyLinkedFilePaths(value: unknown): string[] {
  const source = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const parsed = source
    .map((item) => sanitizeLegacyPath(item))
    .filter((item): item is string => Boolean(item));

  return [...new Set(parsed)];
}

function toByteLength(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}

function createLinkedFileId(path: string, index: number): string {
  const normalizedPath = path
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return `linked-${normalizedPath || 'file'}-${index + 1}`;
}

function resolveWorkspaceTextContent(rawPath: string, files?: WorkspaceFileMap): string | null {
  if (!files) {
    return null;
  }

  const fullPath = rawPath.startsWith('/home/project/') ? rawPath : `/home/project/${rawPath}`;
  const fileEntry = files[fullPath] || files[rawPath];

  if (!fileEntry || fileEntry.type !== 'file' || !fileEntry.content || fileEntry.isBinary) {
    return null;
  }

  return fileEntry.content.replace(/\u0000/g, '');
}

function migrateLegacySkillsSettings(
  parsed: unknown,
  normalized: SkillsSettings,
  workspaceFiles?: WorkspaceFileMap,
): { settings: SkillsSettings; report: MigrationReport | null; shouldPersist: boolean } {
  if (!parsed || typeof parsed !== 'object') {
    return { settings: normalized, report: null, shouldPersist: true };
  }

  const record = parsed as Record<string, unknown>;

  if (!Array.isArray(record.skills)) {
    return { settings: normalized, report: null, shouldPersist: true };
  }

  const legacySkills = record.skills.filter((skill): skill is Record<string, unknown> => !!skill && typeof skill === 'object');

  if (legacySkills.length === 0) {
    return { settings: normalized, report: null, shouldPersist: true };
  }

  const hasLegacyLinkedPaths = legacySkills.some((skill) => parseLegacyLinkedFilePaths(skill.linkedFilePaths).length > 0);
  const hasWorkspaceFiles = Boolean(workspaceFiles && Object.keys(workspaceFiles).length > 0);

  if (hasLegacyLinkedPaths && !hasWorkspaceFiles) {
    return { settings: normalized, report: null, shouldPersist: false };
  }

  let migrated = 0;
  let skipped = 0;

  const nextSkills = normalized.skills.map((skill, skillIndex) => {
    const legacySkill = legacySkills.find((legacy) => {
      const legacyId = typeof legacy.id === 'string' ? legacy.id : '';
      return legacyId.length > 0 && legacyId === skill.id;
    }) || legacySkills[skillIndex];

    if (!legacySkill) {
      return skill;
    }

    const legacyPaths = parseLegacyLinkedFilePaths(legacySkill.linkedFilePaths);

    if (legacyPaths.length === 0) {
      return skill;
    }

    const linkedFiles = [...skill.linkedFiles];
    const seen = new Set(linkedFiles.map((file) => `${file.name.toLowerCase()}::${file.sizeBytes}`));
    let totalBytes = linkedFiles.reduce((sum, file) => sum + file.sizeBytes, 0);

    for (const [pathIndex, rawPath] of legacyPaths.entries()) {
      if (linkedFiles.length >= MAX_LINKED_FILES_PER_SKILL) {
        skipped += legacyPaths.length - pathIndex;
        break;
      }

      const content = resolveWorkspaceTextContent(rawPath, workspaceFiles);

      if (!content) {
        skipped += 1;
        continue;
      }

      const name = rawPath.split('/').pop() || rawPath;
      const mimeType = inferSkillFileMimeType(name);

      if (!isSupportedSkillFile(name, mimeType)) {
        skipped += 1;
        continue;
      }

      const sizeBytes = toByteLength(content);

      if (sizeBytes <= 0 || sizeBytes > MAX_LINKED_FILE_BYTES || totalBytes + sizeBytes > MAX_LINKED_FILES_TOTAL_BYTES) {
        skipped += 1;
        continue;
      }

      const dedupeKey = `${name.toLowerCase()}::${sizeBytes}`;

      if (seen.has(dedupeKey)) {
        skipped += 1;
        continue;
      }

      const linkedFile: SkillLinkedFile = {
        id: createLinkedFileId(rawPath, pathIndex),
        name,
        content,
        mimeType,
        sizeBytes,
      };

      linkedFiles.push(linkedFile);
      totalBytes += sizeBytes;
      seen.add(dedupeKey);
      migrated += 1;
    }

    return {
      ...skill,
      linkedFiles,
    };
  });

  const nextSettings = normalizeSkillsSettings({
    ...normalized,
    skills: nextSkills,
  });

  const report = migrated > 0 || skipped > 0 ? { migrated, skipped } : null;
  return { settings: nextSettings, report, shouldPersist: true };
}

export const useSkillsStore = create<Store & Actions>((set, get) => ({
  isInitialized: false,
  settings: defaultSkillsSettings,
  error: null,
  migrationReport: null,
  legacyMigrationPending: false,
  legacyMigrationSource: null,
  initialize: (workspaceFiles?: WorkspaceFileMap) => {
    const current = get();

    if (current.isInitialized && !current.legacyMigrationPending) {
      return;
    }

    if (!isBrowser) {
      set(() => ({ isInitialized: true, legacyMigrationPending: false, legacyMigrationSource: null }));
      return;
    }

    if (current.legacyMigrationPending && current.legacyMigrationSource) {
      const migration = migrateLegacySkillsSettings(current.legacyMigrationSource, current.settings, workspaceFiles);

      if (!migration.shouldPersist) {
        return;
      }

      persistSettings(migration.settings);
      set(() => ({
        settings: migration.settings,
        isInitialized: true,
        error: null,
        migrationReport: migration.report,
        legacyMigrationPending: false,
        legacyMigrationSource: null,
      }));
      return;
    }

    const raw = localStorage.getItem(STORAGE_KEY_SKILLS_SETTINGS);

    if (!raw) {
      persistSettings(defaultSkillsSettings);
      set(() => ({
        isInitialized: true,
        settings: defaultSkillsSettings,
        migrationReport: null,
        legacyMigrationPending: false,
        legacyMigrationSource: null,
      }));
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const normalized = normalizeSkillsSettings(parsed);
      const migration = migrateLegacySkillsSettings(parsed, normalized, workspaceFiles);

      if (migration.shouldPersist) {
        persistSettings(migration.settings);
      }

      set(() => ({
        settings: migration.settings,
        isInitialized: true,
        error: null,
        migrationReport: migration.report,
        legacyMigrationPending: !migration.shouldPersist,
        legacyMigrationSource: migration.shouldPersist ? null : parsed,
      }));
    } catch (error) {
      const fallback = defaultSkillsSettings;
      persistSettings(fallback);
      set(() => ({
        settings: fallback,
        isInitialized: true,
        error: `Error parsing skills settings: ${error instanceof Error ? error.message : String(error)}`,
        migrationReport: null,
        legacyMigrationPending: false,
        legacyMigrationSource: null,
      }));
    }
  },
  updateSettings: (nextSettings: SkillsSettings) => {
    const normalized = normalizeSkillsSettings(nextSettings);
    persistSettings(normalized);
    set(() => ({
      settings: normalized,
      error: null,
      migrationReport: null,
      legacyMigrationPending: false,
      legacyMigrationSource: null,
    }));
  },
  upsertSkill: (skill: SkillDefinition) => {
    const current = get().settings;
    const existingIndex = current.skills.findIndex((item) => item.id === skill.id);
    const nextSkills = [...current.skills];

    if (existingIndex >= 0) {
      nextSkills[existingIndex] = skill;
    } else {
      nextSkills.push(skill);
    }

    const nextSettings = normalizeSkillsSettings({
      ...current,
      skills: nextSkills,
    });

    persistSettings(nextSettings);
    set(() => ({
      settings: nextSettings,
      error: null,
      migrationReport: null,
      legacyMigrationPending: false,
      legacyMigrationSource: null,
    }));
  },
  deleteSkill: (skillId: string) => {
    const current = get().settings;
    const nextSettings = normalizeSkillsSettings({
      ...current,
      skills: current.skills.filter((skill) => skill.id !== skillId),
    });

    persistSettings(nextSettings);
    set(() => ({
      settings: nextSettings,
      error: null,
      migrationReport: null,
      legacyMigrationPending: false,
      legacyMigrationSource: null,
    }));
  },
}));
