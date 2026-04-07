import { z } from 'zod';

export const SKILLS_SETTINGS_VERSION = 1;
export const MAX_SKILLS = 20;
export const MAX_INJECTED_SKILLS = 10;
export const DEFAULT_MAX_INJECTED_SKILLS = 3;
export const MAX_SKILL_NAME_LENGTH = 80;
export const MAX_SKILL_DESCRIPTION_LENGTH = 300;
export const MAX_SKILL_INSTRUCTION_LENGTH = 1200;
export const MAX_KEYWORDS_PER_SKILL = 20;
export const MAX_KEYWORD_LENGTH = 60;
export const MAX_LINKED_FILES_PER_SKILL = 8;
export const MAX_FILE_PATH_LENGTH = 260;
export const MAX_SCRIPT_COMMANDS_PER_SKILL = 8;
export const MAX_SCRIPT_COMMAND_LENGTH = 200;

export const skillModeSchema = z.enum(['always', 'keyword']);
export type SkillMode = z.infer<typeof skillModeSchema>;

export const skillSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(MAX_SKILL_NAME_LENGTH),
  description: z.string().max(MAX_SKILL_DESCRIPTION_LENGTH),
  instruction: z.string().min(1).max(MAX_SKILL_INSTRUCTION_LENGTH),
  enabled: z.boolean(),
  mode: skillModeSchema,
  keywords: z.array(z.string().min(1).max(MAX_KEYWORD_LENGTH)).max(MAX_KEYWORDS_PER_SKILL),
  linkedFilePaths: z.array(z.string().min(1).max(MAX_FILE_PATH_LENGTH)).max(MAX_LINKED_FILES_PER_SKILL),
  scriptCommands: z.array(z.string().min(1).max(MAX_SCRIPT_COMMAND_LENGTH)).max(MAX_SCRIPT_COMMANDS_PER_SKILL),
});
export type SkillDefinition = z.infer<typeof skillSchema>;

export const skillsSettingsSchema = z.object({
  version: z.number().int().positive(),
  skillsEnabled: z.boolean(),
  maxInjectedSkills: z.number().int().min(1).max(MAX_INJECTED_SKILLS),
  skills: z.array(skillSchema).max(MAX_SKILLS),
});
export type SkillsSettings = z.infer<typeof skillsSettingsSchema>;

export const defaultSkillsSettings: SkillsSettings = {
  version: SKILLS_SETTINGS_VERSION,
  skillsEnabled: true,
  maxInjectedSkills: DEFAULT_MAX_INJECTED_SKILLS,
  skills: [],
};

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sanitizeText(value: unknown, maxLength: number): string {
  const text = asString(value).replace(/\u0000/g, '').trim();
  return text.slice(0, maxLength);
}

function sanitizeKeyword(value: unknown): string | null {
  const keyword = sanitizeText(value, MAX_KEYWORD_LENGTH);
  return keyword.length > 0 ? keyword : null;
}

function sanitizeFilePath(value: unknown): string | null {
  const path = sanitizeText(value, MAX_FILE_PATH_LENGTH).replace(/\\/g, '/');

  if (!path) {
    return null;
  }

  return path.startsWith('./') ? path.slice(2) : path;
}

function sanitizeScriptCommand(value: unknown): string | null {
  const command = sanitizeText(value, MAX_SCRIPT_COMMAND_LENGTH);
  return command.length > 0 ? command : null;
}

function parseKeywords(value: unknown): string[] {
  const source = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',').map((x) => x.trim())
      : [];

  const normalized = source
    .map((item) => sanitizeKeyword(item))
    .filter((item): item is string => Boolean(item))
    .slice(0, MAX_KEYWORDS_PER_SKILL);

  // de-duplicate case-insensitively while preserving first value
  const deduped: string[] = [];
  const seen = new Set<string>();

  for (const keyword of normalized) {
    const lower = keyword.toLowerCase();
    if (seen.has(lower)) {
      continue;
    }

    seen.add(lower);
    deduped.push(keyword);
  }

  return deduped;
}

function parseLinkedFilePaths(value: unknown): string[] {
  const source = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split('\n').map((x) => x.trim())
      : [];

  const normalized = source
    .map((item) => sanitizeFilePath(item))
    .filter((item): item is string => Boolean(item))
    .slice(0, MAX_LINKED_FILES_PER_SKILL);

  return [...new Set(normalized)];
}

function parseScriptCommands(value: unknown): string[] {
  const source = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split('\n').map((x) => x.trim())
      : [];

  const normalized = source
    .map((item) => sanitizeScriptCommand(item))
    .filter((item): item is string => Boolean(item))
    .slice(0, MAX_SCRIPT_COMMANDS_PER_SKILL);

  return [...new Set(normalized)];
}

function parseSkillMode(value: unknown): SkillMode {
  return value === 'keyword' ? 'keyword' : 'always';
}

function normalizeSkill(raw: unknown, index: number): SkillDefinition | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const name = sanitizeText(record.name, MAX_SKILL_NAME_LENGTH);
  const instruction = sanitizeText(record.instruction, MAX_SKILL_INSTRUCTION_LENGTH);

  if (!name || !instruction) {
    return null;
  }

  const parsed = skillSchema.safeParse({
    id: sanitizeText(record.id, 120) || `skill-${index + 1}`,
    name,
    description: sanitizeText(record.description, MAX_SKILL_DESCRIPTION_LENGTH),
    instruction,
    enabled: typeof record.enabled === 'boolean' ? record.enabled : true,
    mode: parseSkillMode(record.mode),
    keywords: parseKeywords(record.keywords),
    linkedFilePaths: parseLinkedFilePaths(record.linkedFilePaths),
    scriptCommands: parseScriptCommands(record.scriptCommands),
  });

  return parsed.success ? parsed.data : null;
}

export function normalizeSkillsSettings(input: unknown): SkillsSettings {
  if (!input || typeof input !== 'object') {
    return defaultSkillsSettings;
  }

  const record = input as Record<string, unknown>;
  const normalizedSkills = Array.isArray(record.skills)
    ? record.skills.map((skill, index) => normalizeSkill(skill, index)).filter((item): item is SkillDefinition => !!item)
    : [];

  const dedupedSkills: SkillDefinition[] = [];
  const seenSkillIds = new Set<string>();

  for (const skill of normalizedSkills) {
    if (seenSkillIds.has(skill.id)) {
      continue;
    }

    seenSkillIds.add(skill.id);
    dedupedSkills.push(skill);
  }

  const normalized = {
    version: SKILLS_SETTINGS_VERSION,
    skillsEnabled: typeof record.skillsEnabled === 'boolean' ? record.skillsEnabled : defaultSkillsSettings.skillsEnabled,
    maxInjectedSkills:
      typeof record.maxInjectedSkills === 'number'
        ? clamp(Math.trunc(record.maxInjectedSkills), 1, MAX_INJECTED_SKILLS)
        : DEFAULT_MAX_INJECTED_SKILLS,
    skills: dedupedSkills.slice(0, MAX_SKILLS),
  };

  const parsed = skillsSettingsSchema.safeParse(normalized);
  return parsed.success ? parsed.data : defaultSkillsSettings;
}

export function validateSkillsSettings(input: unknown) {
  return skillsSettingsSchema.safeParse(input);
}
