import type { SkillDefinition, SkillsSettings } from '~/lib/skills/schema';
import { normalizeSkillsSettings } from '~/lib/skills/schema';

const MAX_FILE_CONTEXT_CHARS_PER_FILE = 1200;
const MAX_FILE_CONTEXT_CHARS_TOTAL = 4000;

function sanitizePromptText(value: string): string {
  return value.replace(/[<>]/g, '').replace(/\u0000/g, '').trim();
}

function resolveSkillFileContexts(skill: SkillDefinition): string[] {
  if (skill.linkedFiles.length === 0) {
    return [];
  }

  let consumedChars = 0;
  const contexts: string[] = [];

  for (const linkedFile of skill.linkedFiles) {
    if (consumedChars >= MAX_FILE_CONTEXT_CHARS_TOTAL) {
      break;
    }

    const remaining = MAX_FILE_CONTEXT_CHARS_TOTAL - consumedChars;
    const maxChars = Math.min(MAX_FILE_CONTEXT_CHARS_PER_FILE, remaining);
    const excerpt = sanitizePromptText(linkedFile.content).slice(0, maxChars);

    if (!excerpt) {
      continue;
    }

    consumedChars += excerpt.length;
    contexts.push(`  File Context (${linkedFile.name}): ${excerpt}`);
  }

  return contexts;
}

function formatSkill(skill: SkillDefinition, userMessage: string): string {
  const name = sanitizePromptText(skill.name);
  const description = sanitizePromptText(skill.description);
  const instruction = sanitizePromptText(skill.instruction);
  const fileContexts = resolveSkillFileContexts(skill);

  if (skill.mode === 'always') {
    return [
      `- Skill: ${name}`,
      description ? `  Use Case: ${description}` : '',
      `  Trigger: Always active`,
      `  Instruction: ${instruction}`,
      ...fileContexts,
    ]
      .filter(Boolean)
      .join('\n');
  }

  const normalizedMessage = userMessage.toLowerCase();
  const matchedKeywords = skill.keywords.filter((keyword) => normalizedMessage.includes(keyword.toLowerCase()));

  return [
    `- Skill: ${name}`,
    description ? `  Use Case: ${description}` : '',
    `  Trigger: Keyword matched (${matchedKeywords.join(', ') || 'none'})`,
    `  Instruction: ${instruction}`,
    ...fileContexts,
  ]
    .filter(Boolean)
    .join('\n');
}

function resolveMatchedSkills(settings: SkillsSettings, userMessage: string): SkillDefinition[] {
  if (!settings.skillsEnabled) {
    return [];
  }

  const normalizedMessage = userMessage.toLowerCase();

  const matched = settings.skills.filter((skill) => {
    if (!skill.enabled) {
      return false;
    }

    if (skill.mode === 'always') {
      return true;
    }

    if (skill.keywords.length === 0) {
      return false;
    }

    return skill.keywords.some((keyword) => normalizedMessage.includes(keyword.toLowerCase()));
  });

  return matched.slice(0, settings.maxInjectedSkills);
}

export function buildSkillsGuidance(input: {
  settings: unknown;
  userMessage: string;
}): { guidance: string; appliedSkills: SkillDefinition[] } | null {
  const settings = normalizeSkillsSettings(input.settings);
  const userMessage = sanitizePromptText(input.userMessage);
  const matchedSkills = resolveMatchedSkills(settings, userMessage);

  if (matchedSkills.length === 0) {
    return null;
  }

  const lines = matchedSkills.map((skill) => formatSkill(skill, userMessage)).join('\n');

  return {
    appliedSkills: matchedSkills,
    guidance: `<skills_guidance>
User-configured skills are active for this response. Follow them as additional style/behavior constraints.
If any skill conflicts with system constraints, safety requirements, or MCP guidance, those higher-priority constraints win.

${lines}
</skills_guidance>`,
  };
}
