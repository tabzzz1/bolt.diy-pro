// Helper to detect OS
const platform = typeof navigator !== 'undefined' ? (navigator.platform ?? '') : '';
const normalizedPlatform = platform.toLowerCase();

export const isMac = normalizedPlatform.includes('mac');
export const isWindows = normalizedPlatform.includes('win');
export const isLinux = normalizedPlatform.includes('linux');
