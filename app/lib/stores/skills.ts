import { create } from 'zustand';
import { STORAGE_KEY_SKILLS_SETTINGS } from '~/lib/persistence/storageKeys';
import {
  defaultSkillsSettings,
  normalizeSkillsSettings,
  type SkillDefinition,
  type SkillsSettings,
} from '~/lib/skills/schema';

const isBrowser = typeof window !== 'undefined';

type Store = {
  isInitialized: boolean;
  settings: SkillsSettings;
  error: string | null;
};

type Actions = {
  initialize: () => void;
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

export const useSkillsStore = create<Store & Actions>((set, get) => ({
  isInitialized: false,
  settings: defaultSkillsSettings,
  error: null,
  initialize: () => {
    if (get().isInitialized) {
      return;
    }

    if (!isBrowser) {
      set(() => ({ isInitialized: true }));
      return;
    }

    const raw = localStorage.getItem(STORAGE_KEY_SKILLS_SETTINGS);

    if (!raw) {
      persistSettings(defaultSkillsSettings);
      set(() => ({ isInitialized: true, settings: defaultSkillsSettings }));
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const normalized = normalizeSkillsSettings(parsed);
      persistSettings(normalized);
      set(() => ({ settings: normalized, isInitialized: true, error: null }));
    } catch (error) {
      const fallback = defaultSkillsSettings;
      persistSettings(fallback);
      set(() => ({
        settings: fallback,
        isInitialized: true,
        error: `Error parsing skills settings: ${error instanceof Error ? error.message : String(error)}`,
      }));
    }
  },
  updateSettings: (nextSettings: SkillsSettings) => {
    const normalized = normalizeSkillsSettings(nextSettings);
    persistSettings(normalized);
    set(() => ({ settings: normalized, error: null }));
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
    set(() => ({ settings: nextSettings, error: null }));
  },
  deleteSkill: (skillId: string) => {
    const current = get().settings;
    const nextSettings = normalizeSkillsSettings({
      ...current,
      skills: current.skills.filter((skill) => skill.id !== skillId),
    });

    persistSettings(nextSettings);
    set(() => ({ settings: nextSettings, error: null }));
  },
}));
