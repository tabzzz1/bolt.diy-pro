// Remove unused imports
import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '~/components/ui/Switch';
import { useSettings } from '~/lib/hooks/useSettings';
import { classNames } from '~/utils/classNames';
import { toast } from 'react-toastify';
import { PromptLibrary } from '~/lib/common/prompt-library';
import { useTranslation } from 'react-i18next';

interface FeatureToggle {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  beta?: boolean;
  experimental?: boolean;
  tooltip?: string;
}

const FeatureCard = memo(
  ({
    feature,
    index,
    onToggle,
    t,
  }: {
    feature: FeatureToggle;
    index: number;
    onToggle: (id: string, enabled: boolean) => void;
    t: (key: string) => string;
  }) => (
    <motion.div
      key={feature.id}
      layoutId={feature.id}
      className={classNames(
        'relative group cursor-pointer',
        'bg-bolt-elements-background-depth-2',
        'hover:bg-bolt-elements-background-depth-3',
        'transition-colors duration-200',
        'rounded-lg overflow-hidden',
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={classNames(feature.icon, 'w-5 h-5 text-bolt-elements-textSecondary')} />
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-bolt-elements-textPrimary">{feature.title}</h4>
              {feature.beta && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-500 font-medium">
                  {t('beta')}
                </span>
              )}
              {feature.experimental && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-orange-500/10 text-orange-500 font-medium">
                  {t('experimental')}
                </span>
              )}
            </div>
          </div>
          <Switch checked={feature.enabled} onCheckedChange={(checked) => onToggle(feature.id, checked)} />
        </div>
        <p className="mt-2 text-sm text-bolt-elements-textSecondary">{feature.description}</p>
        {feature.tooltip && <p className="mt-1 text-xs text-bolt-elements-textTertiary">{feature.tooltip}</p>}
      </div>
    </motion.div>
  ),
);

const FeatureSection = memo(
  ({
    title,
    features,
    icon,
    description,
    onToggleFeature,
    t,
  }: {
    title: string;
    features: FeatureToggle[];
    icon: string;
    description: string;
    onToggleFeature: (id: string, enabled: boolean) => void;
    t: (key: string) => string;
  }) => (
    <motion.div
      layout
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <div className={classNames(icon, 'text-xl text-purple-500')} />
        <div>
          <h3 className="text-lg font-medium text-bolt-elements-textPrimary">{title}</h3>
          <p className="text-sm text-bolt-elements-textSecondary">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <FeatureCard key={feature.id} feature={feature} index={index} onToggle={onToggleFeature} t={t} />
        ))}
      </div>
    </motion.div>
  ),
);

export default function FeaturesTab() {
  const { t } = useTranslation('settings');
  const {
    autoSelectTemplate,
    isLatestBranch,
    contextOptimizationEnabled,
    eventLogs,
    setAutoSelectTemplate,
    enableLatestBranch,
    enableContextOptimization,
    setEventLogs,
    setPromptId,
    promptId,
    lifebeginsAnchorEnabled,
    lifebeginsForkEnabled,
    lifebeginsFailureEnabled,
    lifebeginsTimelineEnabled,
    lifebeginsDnaEnabled,
    setLifeBeginsAnchorEnabled,
    setLifeBeginsForkEnabled,
    setLifeBeginsFailureEnabled,
    setLifeBeginsTimelineEnabled,
    setLifeBeginsDnaEnabled,
  } = useSettings();

  const handleFeatureDisabledError = useCallback((error: unknown) => {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    if ((error as { error?: string }).error === 'feature_disabled') {
      toast.info('This feature is temporarily disabled.');
      return true;
    }

    return false;
  }, []);

  // Enable features by default on first load
  React.useEffect(() => {
    // Only set defaults if values are undefined
    if (isLatestBranch === undefined) {
      enableLatestBranch(false); // Default: OFF - Don't auto-update from main branch
    }

    if (contextOptimizationEnabled === undefined) {
      enableContextOptimization(true); // Default: ON - Enable context optimization
    }

    if (autoSelectTemplate === undefined) {
      setAutoSelectTemplate(true); // Default: ON - Enable auto-select templates
    }

    if (promptId === undefined) {
      setPromptId('default'); // Default: 'default'
    }

    if (eventLogs === undefined) {
      setEventLogs(true); // Default: ON - Enable event logging
    }
  }, []); // Only run once on component mount

  const handleToggleFeature = useCallback(
    (id: string, enabled: boolean) => {
      try {
        switch (id) {
          case 'latestBranch': {
            enableLatestBranch(enabled);
            toast.success(enabled ? t('mainBranchEnabled') : t('mainBranchDisabled'));
            break;
          }

          case 'autoSelectTemplate': {
            setAutoSelectTemplate(enabled);
            toast.success(enabled ? t('autoSelectEnabled') : t('autoSelectDisabled'));
            break;
          }

          case 'contextOptimization': {
            enableContextOptimization(enabled);
            toast.success(enabled ? t('contextOptimizationEnabled') : t('contextOptimizationDisabled'));
            break;
          }

          case 'eventLogs': {
            setEventLogs(enabled);
            toast.success(enabled ? t('eventLoggingEnabled') : t('eventLoggingDisabled'));
            break;
          }

          case 'lifebegins.anchor': {
            setLifeBeginsAnchorEnabled(enabled);
            toast.success(enabled ? 'lifebegins.anchor enabled' : 'lifebegins.anchor disabled');
            break;
          }

          case 'lifebegins.fork': {
            setLifeBeginsForkEnabled(enabled);
            toast.success(enabled ? 'lifebegins.fork enabled' : 'lifebegins.fork disabled');
            break;
          }

          case 'lifebegins.failure': {
            setLifeBeginsFailureEnabled(enabled);
            toast.success(enabled ? 'lifebegins.failure enabled' : 'lifebegins.failure disabled');
            break;
          }

          case 'lifebegins.timeline': {
            setLifeBeginsTimelineEnabled(enabled);
            toast.success(enabled ? 'lifebegins.timeline enabled' : 'lifebegins.timeline disabled');
            break;
          }

          case 'lifebegins.dna': {
            setLifeBeginsDnaEnabled(enabled);
            toast.success(enabled ? 'lifebegins.dna enabled' : 'lifebegins.dna disabled');
            break;
          }

          default:
            break;
        }
      } catch (error) {
        if (!handleFeatureDisabledError(error)) {
          toast.error(t('errorSavingSettings'));
        }
      }
    },
    [
      enableLatestBranch,
      setAutoSelectTemplate,
      enableContextOptimization,
      setEventLogs,
      setLifeBeginsAnchorEnabled,
      setLifeBeginsForkEnabled,
      setLifeBeginsFailureEnabled,
      setLifeBeginsTimelineEnabled,
      setLifeBeginsDnaEnabled,
      handleFeatureDisabledError,
      t,
    ],
  );

  const features = {
    stable: [
      {
        id: 'latestBranch',
        title: t('mainBranchUpdates'),
        description: t('mainBranchUpdatesDesc'),
        icon: 'i-ph:git-branch',
        enabled: isLatestBranch,
        tooltip: t('mainBranchUpdatesTooltip'),
      },
      {
        id: 'autoSelectTemplate',
        title: t('autoSelectTemplate'),
        description: t('autoSelectTemplateDesc'),
        icon: 'i-ph:selection',
        enabled: autoSelectTemplate,
        tooltip: t('autoSelectTemplateTooltip'),
      },
      {
        id: 'contextOptimization',
        title: t('contextOptimization'),
        description: t('contextOptimizationDesc'),
        icon: 'i-ph:brain',
        enabled: contextOptimizationEnabled,
        tooltip: t('contextOptimizationTooltip'),
      },
      {
        id: 'eventLogs',
        title: t('eventLogging'),
        description: t('eventLoggingDesc'),
        icon: 'i-ph:list-bullets',
        enabled: eventLogs,
        tooltip: t('eventLoggingTooltip'),
      },
    ],
    lifebegins: [
      {
        id: 'lifebegins.anchor',
        title: 'Intent Anchor',
        description: 'lifebegins.anchor',
        icon: 'i-ph:target',
        enabled: lifebeginsAnchorEnabled,
      },
      {
        id: 'lifebegins.fork',
        title: 'Fork Futures',
        description: 'lifebegins.fork',
        icon: 'i-ph:git-fork',
        enabled: lifebeginsForkEnabled,
      },
      {
        id: 'lifebegins.failure',
        title: 'Failure Museum',
        description: 'lifebegins.failure',
        icon: 'i-ph:warning-circle',
        enabled: lifebeginsFailureEnabled,
      },
      {
        id: 'lifebegins.timeline',
        title: 'Life Timeline',
        description: 'lifebegins.timeline',
        icon: 'i-ph:timeline',
        enabled: lifebeginsTimelineEnabled,
      },
      {
        id: 'lifebegins.dna',
        title: 'Builder DNA',
        description: 'lifebegins.dna',
        icon: 'i-ph:dna',
        enabled: lifebeginsDnaEnabled,
      },
    ].filter((feature) => feature.enabled),
    beta: [],
  };

  return (
    <div className="flex flex-col gap-8">
      <FeatureSection
        title={t('coreFeatures')}
        features={features.stable}
        icon="i-ph:check-circle"
        description={t('coreFeaturesDesc')}
        onToggleFeature={handleToggleFeature}
        t={t as any}
      />

      {features.beta.length > 0 && (
        <FeatureSection
          title={t('betaFeatures')}
          features={features.beta}
          icon="i-ph:test-tube"
          description={t('betaFeaturesDesc')}
          onToggleFeature={handleToggleFeature}
          t={t as any}
        />
      )}

      <FeatureSection
        title="LifeBegins"
        features={features.lifebegins}
        icon="i-ph:rocket-launch"
        description="Growth domains controlled by governance flags."
        onToggleFeature={handleToggleFeature}
        t={t as any}
      />

      <motion.div
        layout
        className={classNames(
          'bg-bolt-elements-background-depth-2',
          'hover:bg-bolt-elements-background-depth-3',
          'transition-all duration-200',
          'rounded-lg p-4',
          'group',
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <div
            className={classNames(
              'p-2 rounded-lg text-xl',
              'bg-bolt-elements-background-depth-3 group-hover:bg-bolt-elements-background-depth-4',
              'transition-colors duration-200',
              'text-purple-500',
            )}
          >
            <div className="i-ph:book" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-bolt-elements-textPrimary group-hover:text-purple-500 transition-colors">
              {t('promptLibrary')}
            </h4>
            <p className="text-xs text-bolt-elements-textSecondary mt-0.5">{t('promptLibraryDesc')}</p>
          </div>
          <select
            value={promptId}
            onChange={(e) => {
              setPromptId(e.target.value);
              toast.success(t('promptTemplateUpdated'));
            }}
            className={classNames(
              'p-2 rounded-lg text-sm min-w-[200px]',
              'bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor',
              'text-bolt-elements-textPrimary',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/30',
              'group-hover:border-purple-500/30',
              'transition-all duration-200',
            )}
          >
            {PromptLibrary.getLocalizedList(t as any).map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>
    </div>
  );
}
