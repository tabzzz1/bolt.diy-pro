export interface LifeBeginsFeatureToggle {
  id: string;
  title: string;
  description: string;
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
  ];
}
