import { z } from 'zod';

export const SKILLS_SETTINGS_VERSION = 2;
export const MAX_SKILLS = 20;
export const MAX_INJECTED_SKILLS = 10;
export const DEFAULT_MAX_INJECTED_SKILLS = 3;
export const MAX_SKILL_NAME_LENGTH = 80;
export const MAX_SKILL_DESCRIPTION_LENGTH = 300;
export const MAX_SKILL_INSTRUCTION_LENGTH = 1200;
export const MAX_KEYWORDS_PER_SKILL = 20;
export const MAX_KEYWORD_LENGTH = 60;
export const MAX_LINKED_FILES_PER_SKILL = 5;
export const MAX_LINKED_FILE_NAME_LENGTH = 120;
export const MAX_LINKED_FILE_BYTES = 80 * 1024;
export const MAX_LINKED_FILES_TOTAL_BYTES = 250 * 1024;

export const SUPPORTED_SKILL_FILE_EXTENSIONS = [
  'md',
  'js',
  'ts',
  'tsx',
  'py',
  'json',
  'yaml',
  'yml',
  'txt',
  'sh',
] as const;

const SUPPORTED_SKILL_FILE_EXTENSIONS_SET = new Set<string>(SUPPORTED_SKILL_FILE_EXTENSIONS);
const SUPPORTED_TEXTUAL_MIME_TYPES = new Set<string>([
  'application/json',
  'application/x-javascript',
  'application/javascript',
  'application/x-sh',
  'application/x-python-code',
  'application/x-yaml',
  'application/yaml',
]);

export const skillModeSchema = z.enum(['always', 'keyword']);
export type SkillMode = z.infer<typeof skillModeSchema>;

export const skillLinkedFileSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(MAX_LINKED_FILE_NAME_LENGTH),
  content: z.string().min(1),
  mimeType: z.string().min(1).max(120),
  sizeBytes: z.number().int().positive().max(MAX_LINKED_FILE_BYTES),
});
export type SkillLinkedFile = z.infer<typeof skillLinkedFileSchema>;

export const skillSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(MAX_SKILL_NAME_LENGTH),
  description: z.string().max(MAX_SKILL_DESCRIPTION_LENGTH),
  instruction: z.string().min(1).max(MAX_SKILL_INSTRUCTION_LENGTH),
  enabled: z.boolean(),
  mode: skillModeSchema,
  keywords: z.array(z.string().min(1).max(MAX_KEYWORD_LENGTH)).max(MAX_KEYWORDS_PER_SKILL),
  linkedFiles: z.array(skillLinkedFileSchema).max(MAX_LINKED_FILES_PER_SKILL),
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

function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function sanitizeText(value: unknown, maxLength: number): string {
  const text = asString(value).replace(/\u0000/g, '').trim();
  return text.slice(0, maxLength);
}

function sanitizeContent(value: unknown): string {
  return asString(value).replace(/\u0000/g, '');
}

function sanitizeKeyword(value: unknown): string | null {
  const keyword = sanitizeText(value, MAX_KEYWORD_LENGTH);
  return keyword.length > 0 ? keyword : null;
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

function extensionOf(fileName: string): string {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() || '' : '';
}

export function inferSkillFileMimeType(fileName: string): string {
  const extension = extensionOf(fileName);

  if (extension === 'md') {
    return 'text/markdown';
  }

  if (extension === 'json') {
    return 'application/json';
  }

  if (extension === 'yaml' || extension === 'yml') {
    return 'application/x-yaml';
  }

  if (extension === 'py') {
    return 'text/x-python';
  }

  if (extension === 'sh') {
    return 'application/x-sh';
  }

  return 'text/plain';
}

export function isSupportedSkillFile(fileName: string, mimeType?: string): boolean {
  const extension = extensionOf(fileName);

  if (SUPPORTED_SKILL_FILE_EXTENSIONS_SET.has(extension)) {
    return true;
  }

  if (!mimeType) {
    return false;
  }

  const normalizedMimeType = mimeType.toLowerCase();

  return normalizedMimeType.startsWith('text/') || SUPPORTED_TEXTUAL_MIME_TYPES.has(normalizedMimeType);
}

function parseLinkedFiles(value: unknown): SkillLinkedFile[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const linkedFiles: SkillLinkedFile[] = [];
  const seen = new Set<string>();
  let totalBytes = 0;

  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const record = item as Record<string, unknown>;
    const name = sanitizeText(record.name, MAX_LINKED_FILE_NAME_LENGTH);

    if (!name) {
      continue;
    }

    const content = sanitizeContent(record.content);

    if (!content) {
      continue;
    }

    const mimeType = sanitizeText(record.mimeType, 120) || inferSkillFileMimeType(name);

    if (!isSupportedSkillFile(name, mimeType)) {
      continue;
    }

    const computedSize = utf8ByteLength(content);

    if (computedSize <= 0 || computedSize > MAX_LINKED_FILE_BYTES) {
      continue;
    }

    if (totalBytes + computedSize > MAX_LINKED_FILES_TOTAL_BYTES) {
      break;
    }

    const key = `${name.toLowerCase()}::${computedSize}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    const linkedFile: SkillLinkedFile = {
      id: sanitizeText(record.id, 120) || `linked-file-${index + 1}`,
      name,
      content,
      mimeType,
      sizeBytes: computedSize,
    };

    const parsed = skillLinkedFileSchema.safeParse(linkedFile);

    if (!parsed.success) {
      continue;
    }

    linkedFiles.push(parsed.data);
    totalBytes += computedSize;

    if (linkedFiles.length >= MAX_LINKED_FILES_PER_SKILL) {
      break;
    }
  }

  return linkedFiles;
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
    linkedFiles: parseLinkedFiles(record.linkedFiles ?? record.linkedFilePaths),
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
