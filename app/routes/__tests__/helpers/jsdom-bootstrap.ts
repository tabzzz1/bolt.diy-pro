import { JSDOM, type DOMWindow } from 'jsdom';

type ManagedGlobalKey =
  | 'window'
  | 'document'
  | 'navigator'
  | 'HTMLElement'
  | 'Node'
  | 'MutationObserver'
  | 'getComputedStyle';

type GlobalSnapshot = {
  hadOwnProperty: boolean;
  value: unknown;
};

const MANAGED_GLOBALS: ManagedGlobalKey[] = [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'Node',
  'MutationObserver',
  'getComputedStyle',
];

let installedWindow: DOMWindow | null = null;
let snapshot: Record<ManagedGlobalKey, GlobalSnapshot> | null = null;

function setGlobal(name: ManagedGlobalKey, value: unknown) {
  Object.assign(globalThis as Record<string, unknown>, { [name]: value });
}

export function installJSDOMGlobals() {
  if (installedWindow) {
    return;
  }

  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
  const { window } = dom;

  snapshot = MANAGED_GLOBALS.reduce(
    (acc, key) => {
      const globalRecord = globalThis as Record<string, unknown>;
      acc[key] = {
        hadOwnProperty: Object.prototype.hasOwnProperty.call(globalThis, key),
        value: globalRecord[key],
      };
      return acc;
    },
    {} as Record<ManagedGlobalKey, GlobalSnapshot>,
  );

  setGlobal('window', window);
  setGlobal('document', window.document);
  setGlobal('navigator', window.navigator);
  setGlobal('HTMLElement', window.HTMLElement);
  setGlobal('Node', window.Node);
  setGlobal('MutationObserver', window.MutationObserver);
  setGlobal('getComputedStyle', window.getComputedStyle.bind(window));

  installedWindow = window;
}

export function teardownJSDOMGlobals() {
  if (!snapshot) {
    return;
  }

  MANAGED_GLOBALS.forEach((key) => {
    const globalRecord = globalThis as Record<string, unknown>;
    const value = snapshot![key];

    if (value.hadOwnProperty) {
      globalRecord[key] = value.value;
      return;
    }

    delete globalRecord[key];
  });

  snapshot = null;

  if (installedWindow) {
    installedWindow.close();
    installedWindow = null;
  }
}
