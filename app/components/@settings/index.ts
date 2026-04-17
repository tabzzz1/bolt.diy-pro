// Core exports
export { ControlPanel } from './core/ControlPanel';
export type { TabType, TabVisibilityConfig } from './core/types';

// Constants
export { TAB_LABELS, TAB_DESCRIPTIONS } from './core/constants';
export { DEFAULT_TAB_CONFIG } from './core/default-tab-config';

// Shared components
export { TabTile } from './shared/components/TabTile';

// Utils
export { getVisibleTabs, reorderTabs, resetToDefaultConfig } from './utils/tab-helpers';
