import { atom, map } from 'nanostores';
import { PROVIDER_LIST } from '~/utils/constants';
import type { IProviderConfig } from '~/types/model';
import type { TabType, TabWindowConfig, UserTabConfig } from '~/components/@settings/core/types';
import { DEFAULT_TAB_CONFIG } from '~/components/@settings/core/constants';
import { toggleTheme } from './theme';
import { isSidebarOpen } from './sidebar';
import {
  STORAGE_KEY_PROVIDER_SETTINGS,
  STORAGE_KEY_AUTO_ENABLED_PROVIDERS,
  STORAGE_KEY_TAB_CONFIGURATION,
} from '~/lib/persistence/storageKeys';
import { create } from 'zustand';

export interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  ctrlOrMetaKey?: boolean;
  action: () => void;
  description?: string; // Description of what the shortcut does
  isPreventDefault?: boolean; // Whether to prevent default browser behavior
}

export interface Shortcuts {
  toggleTheme: Shortcut;
  toggleSidebar: Shortcut;
  openSettings: Shortcut;
  toggleTerminal: Shortcut;
}

export const URL_CONFIGURABLE_PROVIDERS = ['Ollama', 'LMStudio', 'OpenAILike'];
export const LOCAL_PROVIDERS = ['OpenAILike', 'LMStudio', 'Ollama'];

export type ProviderSetting = Record<string, IProviderConfig>;

// Hardcoded global shortcuts (not user configurable)
export const shortcutsStore = map<Shortcuts>({
  toggleTheme: {
    key: 'd',
    shiftKey: true,
    ctrlOrMetaKey: true,
    action: () => toggleTheme(),
    description: 'Toggle theme',
    isPreventDefault: true,
  },
  toggleSidebar: {
    key: 'b',
    ctrlOrMetaKey: true,
    action: () => {
      isSidebarOpen.set(!isSidebarOpen.get());
    },
    description: 'Toggle sidebar',
    isPreventDefault: true,
  },
  openSettings: {
    key: ',',
    ctrlOrMetaKey: true,
    action: () => {
      // This will be handled by settings-aware UI components
    },
    description: 'Open settings',
    isPreventDefault: true,
  },
  toggleTerminal: {
    key: '`',
    ctrlOrMetaKey: true,
    action: () => {
      // This will be handled by the terminal component
    },
    description: 'Toggle terminal',
    isPreventDefault: true,
  },
});

// Add this helper function at the top of the file
const isBrowser = typeof window !== 'undefined';

// Interface for configured provider info from server
interface ConfiguredProvider {
  name: string;
  isConfigured: boolean;
  configMethod: 'environment' | 'none';
}

// Fetch configured providers from server
const fetchConfiguredProviders = async (): Promise<ConfiguredProvider[]> => {
  try {
    const response = await fetch('/api/configured-providers');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as { providers?: ConfiguredProvider[] };

    return data.providers || [];
  } catch (error) {
    console.error('Error fetching configured providers:', error);
    return [];
  }
};

// Initialize provider settings from both localStorage and server-detected configuration
const getInitialProviderSettings = (): ProviderSetting => {
  const initialSettings: ProviderSetting = {};

  // Start with default settings
  PROVIDER_LIST.forEach((provider) => {
    initialSettings[provider.name] = {
      ...provider,
      settings: {
        // Local providers should be disabled by default
        enabled: !LOCAL_PROVIDERS.includes(provider.name),
      },
    };
  });

  // Only try to load from localStorage in the browser
  if (isBrowser) {
    const savedSettings = localStorage.getItem(STORAGE_KEY_PROVIDER_SETTINGS);

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        Object.entries(parsed).forEach(([key, value]) => {
          if (initialSettings[key]) {
            initialSettings[key].settings = (value as IProviderConfig).settings;
          }
        });
      } catch (error) {
        console.error('Error parsing saved provider settings:', error);
      }
    }
  }

  return initialSettings;
};

// Auto-enable providers that are configured on the server
const autoEnableConfiguredProviders = async () => {
  if (!isBrowser) {
    return;
  }

  try {
    const configuredProviders = await fetchConfiguredProviders();
    const currentSettings = providersStore.get();
    const savedSettings = localStorage.getItem(STORAGE_KEY_PROVIDER_SETTINGS);
    const autoEnabledProviders = localStorage.getItem(STORAGE_KEY_AUTO_ENABLED_PROVIDERS);

    // Track which providers were auto-enabled to avoid overriding user preferences
    const previouslyAutoEnabled = autoEnabledProviders ? JSON.parse(autoEnabledProviders) : [];
    const newlyAutoEnabled: string[] = [];

    let hasChanges = false;

    configuredProviders.forEach(({ name, isConfigured, configMethod }) => {
      if (isConfigured && configMethod === 'environment' && LOCAL_PROVIDERS.includes(name)) {
        const currentProvider = currentSettings[name];

        if (currentProvider) {
          /*
           * Only auto-enable if:
           * 1. Provider is not already enabled, AND
           * 2. Either we haven't saved settings yet (first time) OR provider was previously auto-enabled
           */
          const hasUserSettings = savedSettings !== null;
          const wasAutoEnabled = previouslyAutoEnabled.includes(name);
          const shouldAutoEnable = !currentProvider.settings.enabled && (!hasUserSettings || wasAutoEnabled);

          if (shouldAutoEnable) {
            currentSettings[name] = {
              ...currentProvider,
              settings: {
                ...currentProvider.settings,
                enabled: true,
              },
            };
            newlyAutoEnabled.push(name);
            hasChanges = true;
          }
        }
      }
    });

    if (hasChanges) {
      // Update the store
      providersStore.set(currentSettings);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY_PROVIDER_SETTINGS, JSON.stringify(currentSettings));

      // Update the auto-enabled providers list
      const allAutoEnabled = [...new Set([...previouslyAutoEnabled, ...newlyAutoEnabled])];
      localStorage.setItem(STORAGE_KEY_AUTO_ENABLED_PROVIDERS, JSON.stringify(allAutoEnabled));

      console.log(`Auto-enabled providers: ${newlyAutoEnabled.join(', ')}`);
    }
  } catch (error) {
    console.error('Error auto-enabling configured providers:', error);
  }
};

export const providersStore = map<ProviderSetting>(getInitialProviderSettings());

// Export the auto-enable function for use in components
export const initializeProviders = autoEnableConfiguredProviders;

// Initialize providers when the module loads (in browser only)
if (isBrowser) {
  // Use a small delay to ensure DOM and other resources are ready
  setTimeout(() => {
    autoEnableConfiguredProviders();
  }, 100);
}

// Create a function to update provider settings that handles both store and persistence
export const updateProviderSettings = (provider: string, settings: ProviderSetting) => {
  const currentSettings = providersStore.get();

  // Create new provider config with updated settings
  const updatedProvider = {
    ...currentSettings[provider],
    settings: {
      ...currentSettings[provider].settings,
      ...settings,
    },
  };

  // Update the store with new settings
  providersStore.setKey(provider, updatedProvider);

  // Save to localStorage
  const allSettings = providersStore.get();
  localStorage.setItem(STORAGE_KEY_PROVIDER_SETTINGS, JSON.stringify(allSettings));

  // If this is a local provider, update the auto-enabled tracking
  if (LOCAL_PROVIDERS.includes(provider) && updatedProvider.settings.enabled !== undefined) {
    updateAutoEnabledTracking(provider, updatedProvider.settings.enabled);
  }
};

// Update auto-enabled tracking when user manually changes provider settings
const updateAutoEnabledTracking = (providerName: string, isEnabled: boolean) => {
  if (!isBrowser) {
    return;
  }

  try {
    const autoEnabledProviders = localStorage.getItem(STORAGE_KEY_AUTO_ENABLED_PROVIDERS);
    const currentAutoEnabled = autoEnabledProviders ? JSON.parse(autoEnabledProviders) : [];

    if (isEnabled) {
      // If user enables provider, add to auto-enabled list (for future detection)
      if (!currentAutoEnabled.includes(providerName)) {
        currentAutoEnabled.push(providerName);
        localStorage.setItem(STORAGE_KEY_AUTO_ENABLED_PROVIDERS, JSON.stringify(currentAutoEnabled));
      }
    } else {
      // If user disables provider, remove from auto-enabled list (respect user choice)
      const updatedAutoEnabled = currentAutoEnabled.filter((name: string) => name !== providerName);
      localStorage.setItem(STORAGE_KEY_AUTO_ENABLED_PROVIDERS, JSON.stringify(updatedAutoEnabled));
    }
  } catch (error) {
    console.error('Error updating auto-enabled tracking:', error);
  }
};

export const isDebugMode = atom(false);

// Define keys for localStorage
const SETTINGS_KEYS = {
  LATEST_BRANCH: 'isLatestBranch',
  AUTO_SELECT_TEMPLATE: 'autoSelectTemplate',
  CONTEXT_OPTIMIZATION: 'contextOptimizationEnabled',
  EVENT_LOGS: 'isEventLogsEnabled',
  PROMPT_ID: 'promptId',
  DEVELOPER_MODE: 'isDeveloperMode',
  LIFEBEGINS_ANCHOR: 'lifebegins.anchor',
  LIFEBEGINS_FORK: 'lifebegins.fork',
  LIFEBEGINS_FAILURE: 'lifebegins.failure',
  LIFEBEGINS_TIMELINE: 'lifebegins.timeline',
  LIFEBEGINS_DNA: 'lifebegins.dna',
} as const;

// Initialize settings from localStorage or defaults
const getInitialSettings = () => {
  const getStoredBoolean = (key: string, defaultValue: boolean): boolean => {
    if (!isBrowser) {
      return defaultValue;
    }

    const stored = localStorage.getItem(key);

    if (stored === null) {
      return defaultValue;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  };

  return {
    latestBranch: getStoredBoolean(SETTINGS_KEYS.LATEST_BRANCH, false),
    autoSelectTemplate: getStoredBoolean(SETTINGS_KEYS.AUTO_SELECT_TEMPLATE, true),
    contextOptimization: getStoredBoolean(SETTINGS_KEYS.CONTEXT_OPTIMIZATION, true),
    eventLogs: getStoredBoolean(SETTINGS_KEYS.EVENT_LOGS, true),
    promptId: isBrowser ? localStorage.getItem(SETTINGS_KEYS.PROMPT_ID) || 'default' : 'default',
    developerMode: getStoredBoolean(SETTINGS_KEYS.DEVELOPER_MODE, false),
    lifebeginsAnchor: getStoredBoolean(SETTINGS_KEYS.LIFEBEGINS_ANCHOR, false),
    lifebeginsFork: getStoredBoolean(SETTINGS_KEYS.LIFEBEGINS_FORK, false),
    lifebeginsFailure: getStoredBoolean(SETTINGS_KEYS.LIFEBEGINS_FAILURE, false),
    lifebeginsTimeline: getStoredBoolean(SETTINGS_KEYS.LIFEBEGINS_TIMELINE, false),
    lifebeginsDna: getStoredBoolean(SETTINGS_KEYS.LIFEBEGINS_DNA, false),
  };
};

// Initialize stores with persisted values
const initialSettings = getInitialSettings();

export const latestBranchStore = atom<boolean>(initialSettings.latestBranch);
export const autoSelectStarterTemplate = atom<boolean>(initialSettings.autoSelectTemplate);
export const enableContextOptimizationStore = atom<boolean>(initialSettings.contextOptimization);
export const isEventLogsEnabled = atom<boolean>(initialSettings.eventLogs);
export const promptStore = atom<string>(initialSettings.promptId);
export const lifebeginsAnchorStore = atom<boolean>(initialSettings.lifebeginsAnchor);
export const lifebeginsForkStore = atom<boolean>(initialSettings.lifebeginsFork);
export const lifebeginsFailureStore = atom<boolean>(initialSettings.lifebeginsFailure);
export const lifebeginsTimelineStore = atom<boolean>(initialSettings.lifebeginsTimeline);
export const lifebeginsDnaStore = atom<boolean>(initialSettings.lifebeginsDna);

// Helper functions to update settings with persistence
export const updateLatestBranch = (enabled: boolean) => {
  latestBranchStore.set(enabled);
  localStorage.setItem(SETTINGS_KEYS.LATEST_BRANCH, JSON.stringify(enabled));
};

export const updateAutoSelectTemplate = (enabled: boolean) => {
  autoSelectStarterTemplate.set(enabled);
  localStorage.setItem(SETTINGS_KEYS.AUTO_SELECT_TEMPLATE, JSON.stringify(enabled));
};

export const updateContextOptimization = (enabled: boolean) => {
  enableContextOptimizationStore.set(enabled);
  localStorage.setItem(SETTINGS_KEYS.CONTEXT_OPTIMIZATION, JSON.stringify(enabled));
};

export const updateEventLogs = (enabled: boolean) => {
  isEventLogsEnabled.set(enabled);
  localStorage.setItem(SETTINGS_KEYS.EVENT_LOGS, JSON.stringify(enabled));
};

export const updatePromptId = (id: string) => {
  promptStore.set(id);
  localStorage.setItem(SETTINGS_KEYS.PROMPT_ID, id);
};

export const updateLifeBeginsAnchor = (enabled: boolean) => {
  lifebeginsAnchorStore.set(enabled);
  localStorage.setItem(SETTINGS_KEYS.LIFEBEGINS_ANCHOR, JSON.stringify(enabled));
};

export const updateLifeBeginsFork = (enabled: boolean) => {
  lifebeginsForkStore.set(enabled);
  localStorage.setItem(SETTINGS_KEYS.LIFEBEGINS_FORK, JSON.stringify(enabled));
};

export const updateLifeBeginsFailure = (enabled: boolean) => {
  lifebeginsFailureStore.set(enabled);
  localStorage.setItem(SETTINGS_KEYS.LIFEBEGINS_FAILURE, JSON.stringify(enabled));
};

export const updateLifeBeginsTimeline = (enabled: boolean) => {
  lifebeginsTimelineStore.set(enabled);
  localStorage.setItem(SETTINGS_KEYS.LIFEBEGINS_TIMELINE, JSON.stringify(enabled));
};

export const updateLifeBeginsDna = (enabled: boolean) => {
  lifebeginsDnaStore.set(enabled);
  localStorage.setItem(SETTINGS_KEYS.LIFEBEGINS_DNA, JSON.stringify(enabled));
};

function getDefaultUserTabConfig(): UserTabConfig[] {
  return DEFAULT_TAB_CONFIG.filter((tab): tab is UserTabConfig => tab.window === 'user');
}

type UserTabRecord = Partial<UserTabConfig> & { id?: TabType };

export function reconcileUserTabsWithDefaults(input: unknown): UserTabConfig[] {
  const defaults = getDefaultUserTabConfig();
  const defaultMap = new Map(defaults.map((tab) => [tab.id, tab]));
  const validSavedTabs = Array.isArray(input)
    ? input.filter((item): item is UserTabRecord => {
        return Boolean(item && typeof item === 'object' && typeof (item as UserTabRecord).id === 'string');
      })
    : [];

  const dedupedSaved = new Map<TabType, UserTabRecord>();

  for (const tab of validSavedTabs) {
    const tabId = tab.id as TabType;

    if (!defaultMap.has(tabId) || dedupedSaved.has(tabId)) {
      continue;
    }

    dedupedSaved.set(tabId, tab);
  }

  const orderedSavedIds = [...dedupedSaved.entries()]
    .sort(([, a], [, b]) => {
      const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
      const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    })
    .map(([id]) => id);

  const orderedIds = [
    ...orderedSavedIds,
    ...defaults.map((tab) => tab.id).filter((id) => !orderedSavedIds.includes(id)),
  ];

  return orderedIds.map((id, index) => {
    const defaultTab = defaultMap.get(id)!;
    const savedTab = dedupedSaved.get(id);

    return {
      ...defaultTab,
      visible: typeof savedTab?.visible === 'boolean' ? savedTab.visible : defaultTab.visible,
      order: index,
      window: 'user',
    };
  });
}

// Initialize tab configuration from localStorage or defaults
const getInitialTabConfiguration = (): TabWindowConfig => {
  const defaultConfig: TabWindowConfig = {
    userTabs: getDefaultUserTabConfig(),
  };

  if (!isBrowser) {
    return defaultConfig;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY_TAB_CONFIGURATION);

    if (!saved) {
      return defaultConfig;
    }

    const parsed = JSON.parse(saved);

    if (!parsed?.userTabs) {
      return defaultConfig;
    }

    const reconciledUserTabs = reconcileUserTabsWithDefaults(parsed.userTabs);

    const shouldPersist =
      reconciledUserTabs.length !== parsed.userTabs.length ||
      reconciledUserTabs.some((tab, index) => parsed.userTabs[index]?.id !== tab.id);

    if (shouldPersist) {
      localStorage.setItem(
        STORAGE_KEY_TAB_CONFIGURATION,
        JSON.stringify({
          userTabs: reconciledUserTabs,
        }),
      );
    }

    return {
      userTabs: reconciledUserTabs,
    };
  } catch (error) {
    console.warn('Failed to parse tab configuration:', error);
    return defaultConfig;
  }
};

// console.log('Initial tab configuration:', getInitialTabConfiguration());

export const tabConfigurationStore = map<TabWindowConfig>(getInitialTabConfiguration());

// Helper function to reset tab configuration
export const resetTabConfiguration = () => {
  const defaultConfig: TabWindowConfig = {
    userTabs: getDefaultUserTabConfig(),
  };

  tabConfigurationStore.set(defaultConfig);
  localStorage.setItem(STORAGE_KEY_TAB_CONFIGURATION, JSON.stringify(defaultConfig));
};

// First, let's define the SettingsStore interface
interface SettingsStore {
  isOpen: boolean;
  selectedTab: string;
  openSettings: () => void;
  closeSettings: () => void;
  setSelectedTab: (tab: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  isOpen: false,
  selectedTab: 'user', // Default tab

  openSettings: () => {
    set({
      isOpen: true,
      selectedTab: 'user', // Always open to user tab
    });
  },

  closeSettings: () => {
    set({
      isOpen: false,
      selectedTab: 'user', // Reset to user tab when closing
    });
  },

  setSelectedTab: (tab: string) => {
    set({ selectedTab: tab });
  },
}));
