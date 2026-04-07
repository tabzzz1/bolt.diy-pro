import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { classNames } from '~/utils/classNames';
import { Switch } from '~/components/ui/Switch';
import { useSkillsStore } from '~/lib/stores/skills';
import type { SkillDefinition, SkillMode } from '~/lib/skills/schema';
import {
  MAX_FILE_PATH_LENGTH,
  MAX_KEYWORD_LENGTH,
  MAX_KEYWORDS_PER_SKILL,
  MAX_LINKED_FILES_PER_SKILL,
  MAX_SKILL_DESCRIPTION_LENGTH,
  MAX_SKILL_INSTRUCTION_LENGTH,
  MAX_SKILL_NAME_LENGTH,
  MAX_INJECTED_SKILLS,
  MAX_SCRIPT_COMMAND_LENGTH,
  MAX_SCRIPT_COMMANDS_PER_SKILL,
  normalizeSkillsSettings,
} from '~/lib/skills/schema';

type SkillDraft = {
  id?: string;
  name: string;
  description: string;
  instruction: string;
  mode: SkillMode;
  keywords: string[];
  linkedFilePaths: string[];
  scriptCommands: string[];
  enabled: boolean;
};

const EMPTY_DRAFT: SkillDraft = {
  name: '',
  description: '',
  instruction: '',
  mode: 'always',
  keywords: [],
  linkedFilePaths: [],
  scriptCommands: [],
  enabled: true,
};

const SKILL_TEMPLATES: Omit<SkillDraft, 'id' | 'enabled'>[] = [
  {
    name: 'Code reviewer',
    description: 'Focus on bug risks and edge cases before style suggestions',
    instruction:
      'Review proposed code changes with a bug-first mindset. Prioritize correctness, regression risk, and missing tests. Keep suggestions concise and actionable.',
    mode: 'always',
    keywords: [],
    linkedFilePaths: ['README.md'],
    scriptCommands: ['pnpm test'],
  },
  {
    name: 'API architect',
    description: 'Favor stable contracts, backward compatibility, and explicit tradeoffs',
    instruction:
      'When discussing APIs, explicitly call out compatibility impact, migration cost, and interface clarity. Prefer simple, versionable contracts.',
    mode: 'keyword',
    keywords: ['api', 'endpoint', 'contract', 'schema'],
    linkedFilePaths: [],
    scriptCommands: [],
  },
  {
    name: 'Frontend quality gate',
    description: 'Elevate accessibility and responsive behavior in UI work',
    instruction:
      'For UI tasks, check accessibility, mobile behavior, spacing consistency, and interaction feedback. Surface issues clearly before proposing polish.',
    mode: 'keyword',
    keywords: ['ui', 'frontend', 'responsive', 'accessibility'],
    linkedFilePaths: [],
    scriptCommands: ['pnpm typecheck'],
  },
];

function createSkillId() {
  return `skill-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function validateDraft(draft: SkillDraft) {
  const errors: string[] = [];

  if (!draft.name.trim()) {
    errors.push('nameRequired');
  } else if (draft.name.trim().length > MAX_SKILL_NAME_LENGTH) {
    errors.push('nameTooLong');
  }

  if (!draft.instruction.trim()) {
    errors.push('instructionRequired');
  } else if (draft.instruction.trim().length > MAX_SKILL_INSTRUCTION_LENGTH) {
    errors.push('instructionTooLong');
  }

  if (draft.description.trim().length > MAX_SKILL_DESCRIPTION_LENGTH) {
    errors.push('descriptionTooLong');
  }

  if (draft.mode === 'keyword' && draft.keywords.length === 0) {
    errors.push('keywordRequired');
  }

  if (draft.keywords.length > MAX_KEYWORDS_PER_SKILL) {
    errors.push('keywordLimitExceeded');
  }

  if (draft.keywords.some((keyword) => keyword.length > MAX_KEYWORD_LENGTH)) {
    errors.push('keywordTooLong');
  }

  if (draft.linkedFilePaths.length > MAX_LINKED_FILES_PER_SKILL) {
    errors.push('linkedFileLimitExceeded');
  }

  if (draft.linkedFilePaths.some((path) => path.length > MAX_FILE_PATH_LENGTH)) {
    errors.push('linkedFilePathTooLong');
  }

  if (draft.scriptCommands.length > MAX_SCRIPT_COMMANDS_PER_SKILL) {
    errors.push('scriptCommandLimitExceeded');
  }

  if (draft.scriptCommands.some((command) => command.length > MAX_SCRIPT_COMMAND_LENGTH)) {
    errors.push('scriptCommandTooLong');
  }

  return errors;
}

function toSkillDefinition(draft: SkillDraft): SkillDefinition {
  return {
    id: draft.id || createSkillId(),
    name: draft.name.trim(),
    description: draft.description.trim(),
    instruction: draft.instruction.trim(),
    mode: draft.mode,
    keywords: draft.keywords,
    linkedFilePaths: draft.linkedFilePaths,
    scriptCommands: draft.scriptCommands,
    enabled: draft.enabled,
  };
}

function normalizeKeyword(value: string): string {
  return value.trim().slice(0, MAX_KEYWORD_LENGTH);
}

export default function SkillsTab() {
  const { t } = useTranslation('settings');
  const isInitialized = useSkillsStore((state) => state.isInitialized);
  const settings = useSkillsStore((state) => state.settings);
  const initialize = useSkillsStore((state) => state.initialize);
  const updateSettings = useSkillsStore((state) => state.updateSettings);
  const upsertSkill = useSkillsStore((state) => state.upsertSkill);
  const deleteSkill = useSkillsStore((state) => state.deleteSkill);

  const [draft, setDraft] = useState<SkillDraft>(EMPTY_DRAFT);
  const [keywordInput, setKeywordInput] = useState('');
  const [linkedFileInput, setLinkedFileInput] = useState('');
  const [scriptCommandInput, setScriptCommandInput] = useState('');
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const draftErrors = useMemo(() => validateDraft(draft), [draft]);
  const canSaveDraft = draftErrors.length === 0;

  const handleSettingsUpdate = (nextSettings: typeof settings) => {
    updateSettings(normalizeSkillsSettings(nextSettings));
  };

  const toggleSkillEnabled = (skill: SkillDefinition, enabled: boolean) => {
    upsertSkill({ ...skill, enabled });
  };

  const handleDeleteSkill = (skillId: string) => {
    deleteSkill(skillId);

    if (editingSkillId === skillId) {
      setEditingSkillId(null);
      setDraft(EMPTY_DRAFT);
      setKeywordInput('');
      setLinkedFileInput('');
      setScriptCommandInput('');
    }

    toast.success(t('skillsTab.skillDeleted'));
  };

  const handleEditSkill = (skill: SkillDefinition) => {
    setEditingSkillId(skill.id);
    setDraft({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      instruction: skill.instruction,
      mode: skill.mode,
      keywords: skill.keywords,
      linkedFilePaths: skill.linkedFilePaths,
      scriptCommands: skill.scriptCommands,
      enabled: skill.enabled,
    });
    setKeywordInput('');
    setLinkedFileInput('');
    setScriptCommandInput('');
  };

  const handleCancelEdit = () => {
    setEditingSkillId(null);
    setDraft(EMPTY_DRAFT);
    setKeywordInput('');
    setLinkedFileInput('');
    setScriptCommandInput('');
  };

  const handleSaveSkill = () => {
    if (!canSaveDraft) {
      return;
    }

    const skill = toSkillDefinition(draft);
    upsertSkill(skill);
    toast.success(editingSkillId ? t('skillsTab.skillUpdated') : t('skillsTab.skillAdded'));
    handleCancelEdit();
  };

  const handleAddKeyword = (value: string) => {
    const keyword = normalizeKeyword(value);

    if (!keyword) {
      return;
    }

    if (draft.keywords.length >= MAX_KEYWORDS_PER_SKILL) {
      toast.error(t('skillsTab.keywordLimitExceeded'));
      return;
    }

    if (draft.keywords.some((item) => item.toLowerCase() === keyword.toLowerCase())) {
      setKeywordInput('');
      return;
    }

    setDraft((prev) => ({
      ...prev,
      keywords: [...prev.keywords, keyword],
    }));
    setKeywordInput('');
  };

  const handleTemplateApply = (template: Omit<SkillDraft, 'id' | 'enabled'>) => {
    upsertSkill({
      id: createSkillId(),
      name: template.name,
      description: template.description,
      instruction: template.instruction,
      enabled: true,
      mode: template.mode,
      keywords: template.keywords,
      linkedFilePaths: template.linkedFilePaths,
      scriptCommands: template.scriptCommands,
    });
    toast.success(t('skillsTab.templateAdded'));
  };

  const handleAddLinkedFilePath = (value: string) => {
    const nextPath = value.trim().replace(/\\/g, '/').replace(/^\.\//, '').slice(0, MAX_FILE_PATH_LENGTH);

    if (!nextPath) {
      return;
    }

    if (draft.linkedFilePaths.length >= MAX_LINKED_FILES_PER_SKILL) {
      toast.error(t('skillsTab.linkedFileLimitExceeded'));
      return;
    }

    if (draft.linkedFilePaths.includes(nextPath)) {
      setLinkedFileInput('');
      return;
    }

    setDraft((prev) => ({
      ...prev,
      linkedFilePaths: [...prev.linkedFilePaths, nextPath],
    }));
    setLinkedFileInput('');
  };

  const handleAddScriptCommand = (value: string) => {
    const nextCommand = value.trim().slice(0, MAX_SCRIPT_COMMAND_LENGTH);

    if (!nextCommand) {
      return;
    }

    if (draft.scriptCommands.length >= MAX_SCRIPT_COMMANDS_PER_SKILL) {
      toast.error(t('skillsTab.scriptCommandLimitExceeded'));
      return;
    }

    if (draft.scriptCommands.includes(nextCommand)) {
      setScriptCommandInput('');
      return;
    }

    setDraft((prev) => ({
      ...prev,
      scriptCommands: [...prev.scriptCommands, nextCommand],
    }));
    setScriptCommandInput('');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-bolt-elements-textPrimary">{t('skillsTab.globalSettings')}</h3>
            <p className="mt-1 text-sm text-bolt-elements-textSecondary">{t('skillsTab.globalSettingsDesc')}</p>
          </div>
          <Switch
            checked={settings.skillsEnabled}
            onCheckedChange={(checked) => handleSettingsUpdate({ ...settings, skillsEnabled: checked })}
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-bolt-elements-textPrimary">{t('skillsTab.maxInjectedSkills')}</label>
          <p className="mt-1 text-xs text-bolt-elements-textSecondary">{t('skillsTab.maxInjectedSkillsDesc')}</p>
          <input
            type="number"
            min={1}
            max={MAX_INJECTED_SKILLS}
            value={settings.maxInjectedSkills}
            onChange={(event) => {
              const nextValue = Number(event.target.value || 1);
              handleSettingsUpdate({
                ...settings,
                maxInjectedSkills: Math.max(1, Math.min(MAX_INJECTED_SKILLS, Math.trunc(nextValue || 1))),
              });
            }}
            className={classNames(
              'mt-2 w-full rounded-lg border border-bolt-elements-borderColor bg-white px-3 py-2 text-sm text-bolt-elements-textPrimary dark:bg-bolt-elements-background-depth-3',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
            )}
          />
        </div>
      </section>

      <section className="rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 p-4">
        <h3 className="text-base font-semibold text-bolt-elements-textPrimary">{t('skillsTab.templatesTitle')}</h3>
        <p className="mt-1 text-sm text-bolt-elements-textSecondary">{t('skillsTab.templatesDesc')}</p>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {SKILL_TEMPLATES.map((template) => (
            <button
              key={template.name}
              type="button"
              onClick={() => handleTemplateApply(template)}
              className={classNames(
                'rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-3 text-left transition-all',
                'hover:border-bolt-elements-borderColor-hover hover:bg-bolt-elements-background-depth-3',
              )}
            >
              <div className="text-sm font-semibold text-bolt-elements-textPrimary">{template.name}</div>
              <div className="mt-1 text-xs text-bolt-elements-textSecondary">{template.description}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 p-4">
        <h3 className="text-base font-semibold text-bolt-elements-textPrimary">
          {editingSkillId ? t('skillsTab.editSkillTitle') : t('skillsTab.newSkillTitle')}
        </h3>
        <p className="mt-1 text-sm text-bolt-elements-textSecondary">{t('skillsTab.editorDesc')}</p>

        <div className="mt-4 grid gap-4">
          <div>
            <label className="text-sm font-medium text-bolt-elements-textPrimary">{t('skillsTab.name')}</label>
            <input
              value={draft.name}
              maxLength={MAX_SKILL_NAME_LENGTH}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              className={classNames(
                'mt-1 w-full rounded-lg border border-bolt-elements-borderColor bg-white px-3 py-2 text-sm text-bolt-elements-textPrimary dark:bg-bolt-elements-background-depth-3',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
              )}
              placeholder={t('skillsTab.namePlaceholder')}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-bolt-elements-textPrimary">{t('skillsTab.description')}</label>
            <input
              value={draft.description}
              maxLength={MAX_SKILL_DESCRIPTION_LENGTH}
              onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
              className={classNames(
                'mt-1 w-full rounded-lg border border-bolt-elements-borderColor bg-white px-3 py-2 text-sm text-bolt-elements-textPrimary dark:bg-bolt-elements-background-depth-3',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
              )}
              placeholder={t('skillsTab.descriptionPlaceholder')}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-bolt-elements-textPrimary">{t('skillsTab.instruction')}</label>
            <textarea
              value={draft.instruction}
              maxLength={MAX_SKILL_INSTRUCTION_LENGTH}
              onChange={(event) => setDraft((prev) => ({ ...prev, instruction: event.target.value }))}
              className={classNames(
                'mt-1 h-28 w-full rounded-lg border border-bolt-elements-borderColor bg-white px-3 py-2 text-sm text-bolt-elements-textPrimary dark:bg-bolt-elements-background-depth-3',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
              )}
              placeholder={t('skillsTab.instructionPlaceholder')}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-bolt-elements-textPrimary">{t('skillsTab.mode')}</label>
            <select
              value={draft.mode}
              onChange={(event) => setDraft((prev) => ({ ...prev, mode: event.target.value as SkillMode }))}
              className={classNames(
                'mt-1 w-full rounded-lg border border-bolt-elements-borderColor bg-white px-3 py-2 text-sm text-bolt-elements-textPrimary dark:bg-bolt-elements-background-depth-3',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
              )}
            >
              <option value="always">{t('skillsTab.modeAlways')}</option>
              <option value="keyword">{t('skillsTab.modeKeyword')}</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-bolt-elements-textPrimary">{t('skillsTab.keywords')}</label>
            <div className="mt-1 flex gap-2">
              <input
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ',') {
                    event.preventDefault();
                    handleAddKeyword(keywordInput);
                  }
                }}
                className={classNames(
                  'w-full rounded-lg border border-bolt-elements-borderColor bg-white px-3 py-2 text-sm text-bolt-elements-textPrimary dark:bg-bolt-elements-background-depth-3',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                )}
                placeholder={t('skillsTab.keywordsPlaceholder')}
              />
              <button
                type="button"
                onClick={() => handleAddKeyword(keywordInput)}
                className={classNames(
                  'rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-3 py-2 text-sm text-bolt-elements-textPrimary',
                  'hover:bg-bolt-elements-background-depth-3',
                )}
              >
                {t('skillsTab.addKeyword')}
              </button>
            </div>

            {draft.keywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {draft.keywords.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        keywords: prev.keywords.filter((item) => item !== keyword),
                      }))
                    }
                    className="rounded-full border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-2.5 py-1 text-xs text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3"
                  >
                    {keyword} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-bolt-elements-textPrimary">{t('skillsTab.linkedFiles')}</label>
            <div className="mt-1 flex gap-2">
              <input
                value={linkedFileInput}
                onChange={(event) => setLinkedFileInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAddLinkedFilePath(linkedFileInput);
                  }
                }}
                className={classNames(
                  'w-full rounded-lg border border-bolt-elements-borderColor bg-white px-3 py-2 text-sm text-bolt-elements-textPrimary dark:bg-bolt-elements-background-depth-3',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                )}
                placeholder={t('skillsTab.linkedFilesPlaceholder')}
              />
              <button
                type="button"
                onClick={() => handleAddLinkedFilePath(linkedFileInput)}
                className={classNames(
                  'rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-3 py-2 text-sm text-bolt-elements-textPrimary',
                  'hover:bg-bolt-elements-background-depth-3',
                )}
              >
                {t('skillsTab.addLinkedFile')}
              </button>
            </div>
            {draft.linkedFilePaths.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {draft.linkedFilePaths.map((filePath) => (
                  <button
                    key={filePath}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        linkedFilePaths: prev.linkedFilePaths.filter((item) => item !== filePath),
                      }))
                    }
                    className="rounded-full border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-2.5 py-1 text-xs text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3"
                  >
                    {filePath} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-bolt-elements-textPrimary">{t('skillsTab.scriptCommands')}</label>
            <div className="mt-1 flex gap-2">
              <input
                value={scriptCommandInput}
                onChange={(event) => setScriptCommandInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAddScriptCommand(scriptCommandInput);
                  }
                }}
                className={classNames(
                  'w-full rounded-lg border border-bolt-elements-borderColor bg-white px-3 py-2 text-sm text-bolt-elements-textPrimary dark:bg-bolt-elements-background-depth-3',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                )}
                placeholder={t('skillsTab.scriptCommandsPlaceholder')}
              />
              <button
                type="button"
                onClick={() => handleAddScriptCommand(scriptCommandInput)}
                className={classNames(
                  'rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-3 py-2 text-sm text-bolt-elements-textPrimary',
                  'hover:bg-bolt-elements-background-depth-3',
                )}
              >
                {t('skillsTab.addScriptCommand')}
              </button>
            </div>
            {draft.scriptCommands.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {draft.scriptCommands.map((command) => (
                  <button
                    key={command}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        scriptCommands: prev.scriptCommands.filter((item) => item !== command),
                      }))
                    }
                    className="rounded-full border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-2.5 py-1 text-xs text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3"
                  >
                    {command} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          {draftErrors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
              {draftErrors.map((errorKey) => (
                <p key={errorKey}>{t(`skillsTab.validation.${errorKey}` as any)}</p>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveSkill}
              disabled={!canSaveDraft}
              className={classNames(
                'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors',
                'hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {editingSkillId ? t('skillsTab.updateSkill') : t('skillsTab.addSkill')}
            </button>
            {editingSkillId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-4 py-2 text-sm text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3"
              >
                {t('skillsTab.cancelEdit')}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 p-4">
        <h3 className="text-base font-semibold text-bolt-elements-textPrimary">{t('skillsTab.skillListTitle')}</h3>
        <p className="mt-1 text-sm text-bolt-elements-textSecondary">{t('skillsTab.skillListDesc')}</p>

        {settings.skills.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-bolt-elements-borderColor p-4 text-sm text-bolt-elements-textSecondary">
            {t('skillsTab.emptyState')}
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {settings.skills.map((skill) => (
              <div key={skill.id} className="rounded-lg border border-bolt-elements-borderColor p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-bolt-elements-textPrimary">{skill.name}</p>
                      <span className="rounded-full bg-bolt-elements-background-depth-2 px-2 py-0.5 text-[11px] text-bolt-elements-textSecondary">
                        {skill.mode === 'always' ? t('skillsTab.modeAlways') : t('skillsTab.modeKeyword')}
                      </span>
                    </div>
                    {skill.description && <p className="mt-1 text-xs text-bolt-elements-textSecondary">{skill.description}</p>}
                    {skill.keywords.length > 0 && (
                      <p className="mt-1 text-xs text-bolt-elements-textSecondary">
                        {t('skillsTab.keywordsLabel')}: {skill.keywords.join(', ')}
                      </p>
                    )}
                    {skill.linkedFilePaths.length > 0 && (
                      <p className="mt-1 text-xs text-bolt-elements-textSecondary">
                        {t('skillsTab.linkedFilesLabel')}: {skill.linkedFilePaths.join(', ')}
                      </p>
                    )}
                    {skill.scriptCommands.length > 0 && (
                      <p className="mt-1 text-xs text-bolt-elements-textSecondary">
                        {t('skillsTab.scriptCommandsLabel')}: {skill.scriptCommands.join(' | ')}
                      </p>
                    )}
                  </div>
                  <Switch checked={skill.enabled} onCheckedChange={(checked) => toggleSkillEnabled(skill, checked)} />
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditSkill(skill)}
                    className="rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-3 py-1.5 text-xs text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3"
                  >
                    {t('skillsTab.editSkill')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400"
                  >
                    {t('skillsTab.deleteSkill')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
