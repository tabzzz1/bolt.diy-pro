type LifeBeginsTitleKey =
  | 'lifeBeginsAnchorTitle'
  | 'lifeBeginsForkTitle'
  | 'lifeBeginsFailureTitle'
  | 'lifeBeginsTimelineTitle'
  | 'lifeBeginsDnaTitle';

type LifeBeginsDescriptionKey =
  | 'lifeBeginsAnchorDesc'
  | 'lifeBeginsForkDesc'
  | 'lifeBeginsFailureDesc'
  | 'lifeBeginsTimelineDesc'
  | 'lifeBeginsDnaDesc';

type LifeBeginsEnabledToastKey =
  | 'lifeBeginsAnchorEnabled'
  | 'lifeBeginsForkEnabled'
  | 'lifeBeginsFailureEnabled'
  | 'lifeBeginsTimelineEnabled'
  | 'lifeBeginsDnaEnabled';

type LifeBeginsDisabledToastKey =
  | 'lifeBeginsAnchorDisabled'
  | 'lifeBeginsForkDisabled'
  | 'lifeBeginsFailureDisabled'
  | 'lifeBeginsTimelineDisabled'
  | 'lifeBeginsDnaDisabled';

export interface LifeBeginsFeatureToggle {
  id: string;
  titleKey: LifeBeginsTitleKey;
  descriptionKey: LifeBeginsDescriptionKey;
  enabledToastKey: LifeBeginsEnabledToastKey;
  disabledToastKey: LifeBeginsDisabledToastKey;
  icon: string;
  enabled: boolean;
}

export interface BuildLifeBeginsFeaturesInput {
  lifebeginsAnchorEnabled: boolean;
  lifebeginsForkEnabled: boolean;
  lifebeginsFailureEnabled: boolean;
  lifebeginsTimelineEnabled: boolean;
  lifebeginsDnaEnabled: boolean;
}

export function buildLifeBeginsFeatures({
  lifebeginsAnchorEnabled,
  lifebeginsForkEnabled,
  lifebeginsFailureEnabled,
  lifebeginsTimelineEnabled,
  lifebeginsDnaEnabled,
}: BuildLifeBeginsFeaturesInput): LifeBeginsFeatureToggle[] {
  return [
    {
      id: 'lifebegins.anchor',
      titleKey: 'lifeBeginsAnchorTitle',
      descriptionKey: 'lifeBeginsAnchorDesc',
      enabledToastKey: 'lifeBeginsAnchorEnabled',
      disabledToastKey: 'lifeBeginsAnchorDisabled',
      icon: 'i-ph:target',
      enabled: lifebeginsAnchorEnabled,
    },
    {
      id: 'lifebegins.fork',
      titleKey: 'lifeBeginsForkTitle',
      descriptionKey: 'lifeBeginsForkDesc',
      enabledToastKey: 'lifeBeginsForkEnabled',
      disabledToastKey: 'lifeBeginsForkDisabled',
      icon: 'i-ph:git-fork',
      enabled: lifebeginsForkEnabled,
    },
    {
      id: 'lifebegins.failure',
      titleKey: 'lifeBeginsFailureTitle',
      descriptionKey: 'lifeBeginsFailureDesc',
      enabledToastKey: 'lifeBeginsFailureEnabled',
      disabledToastKey: 'lifeBeginsFailureDisabled',
      icon: 'i-ph:warning-circle',
      enabled: lifebeginsFailureEnabled,
    },
    {
      id: 'lifebegins.timeline',
      titleKey: 'lifeBeginsTimelineTitle',
      descriptionKey: 'lifeBeginsTimelineDesc',
      enabledToastKey: 'lifeBeginsTimelineEnabled',
      disabledToastKey: 'lifeBeginsTimelineDisabled',
      icon: 'i-ph:timeline',
      enabled: lifebeginsTimelineEnabled,
    },
    {
      id: 'lifebegins.dna',
      titleKey: 'lifeBeginsDnaTitle',
      descriptionKey: 'lifeBeginsDnaDesc',
      enabledToastKey: 'lifeBeginsDnaEnabled',
      disabledToastKey: 'lifeBeginsDnaDisabled',
      icon: 'i-ph:dna',
      enabled: lifebeginsDnaEnabled,
    },
  ];
}
