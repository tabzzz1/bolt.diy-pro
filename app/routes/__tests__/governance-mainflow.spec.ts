import React from 'react';
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { loader as githubUserLoader } from '~/routes/api.github-user';
import { assertGrowthFeatureEnabled } from '~/lib/governance/featureFlags.server';
import FeaturesTab from '~/components/@settings/tabs/features/FeaturesTab';
import { installJSDOMGlobals, teardownJSDOMGlobals } from './helpers/jsdom-bootstrap';

const mocked = vi.hoisted(() => {
  return {
    useSettingsMock: vi.fn(),
    toastSuccess: vi.fn(),
    toastInfo: vi.fn(),
    toastError: vi.fn(),
  };
});

vi.mock('~/lib/hooks/useSettings', () => ({
  useSettings: mocked.useSettingsMock,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: mocked.toastSuccess,
    info: mocked.toastInfo,
    error: mocked.toastError,
  },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) =>
      React.createElement('div', props, children),
  },
}));

type LifeBeginsFlagOverrides = {
  lifebeginsAnchorEnabled?: boolean;
  lifebeginsForkEnabled?: boolean;
  lifebeginsFailureEnabled?: boolean;
  lifebeginsTimelineEnabled?: boolean;
  lifebeginsDnaEnabled?: boolean;
};

function createSettings(overrides: LifeBeginsFlagOverrides = {}) {
  return {
    autoSelectTemplate: true,
    isLatestBranch: false,
    contextOptimizationEnabled: true,
    eventLogs: true,
    setAutoSelectTemplate: vi.fn(),
    enableLatestBranch: vi.fn(),
    enableContextOptimization: vi.fn(),
    setEventLogs: vi.fn(),
    setPromptId: vi.fn(),
    promptId: 'default',
    lifebeginsAnchorEnabled: overrides.lifebeginsAnchorEnabled ?? false,
    lifebeginsForkEnabled: overrides.lifebeginsForkEnabled ?? false,
    lifebeginsFailureEnabled: overrides.lifebeginsFailureEnabled ?? false,
    lifebeginsTimelineEnabled: overrides.lifebeginsTimelineEnabled ?? false,
    lifebeginsDnaEnabled: overrides.lifebeginsDnaEnabled ?? false,
    setLifeBeginsAnchorEnabled: vi.fn(),
    setLifeBeginsForkEnabled: vi.fn(),
    setLifeBeginsFailureEnabled: vi.fn(),
    setLifeBeginsTimelineEnabled: vi.fn(),
    setLifeBeginsDnaEnabled: vi.fn(),
  };
}

describe('governance mainflow safety', () => {
  it('keeps non-growth main API path usable when all growth domains are disabled', async () => {
    const response = await githubUserLoader({
      request: new Request('http://localhost/api/github-user', { method: 'GET' }),
      context: {} as any,
      params: {},
    });

    expect(response.status).toBe(401);
    const payload = (await response.json()) as { error?: string };
    expect(payload.error).not.toBe('feature_disabled');
  });

  it('shows lightweight disabled semantics without mutating existing input state', async () => {
    const inputDraft = 'keep current chat draft';

    try {
      assertGrowthFeatureEnabled('lifebegins.timeline', {
        'lifebegins.anchor': false,
        'lifebegins.fork': false,
        'lifebegins.failure': false,
        'lifebegins.timeline': false,
        'lifebegins.dna': false,
      });
      throw new Error('Expected feature disabled response');
    } catch (error) {
      const response = error as Response;
      const payload = (await response.json()) as { error: string; message: string };

      expect(response.status).toBe(403);
      expect(payload.error).toBe('feature_disabled');
      expect(payload.message).toBe('Feature is disabled by governance policy');
      expect(inputDraft).toBe('keep current chat draft');
    }
  });
});

describe('governance features tab visibility', () => {
  beforeAll(() => {
    installJSDOMGlobals();
  });

  afterAll(() => {
    teardownJSDOMGlobals();
  });

  beforeEach(() => {
    mocked.useSettingsMock.mockReset();
    mocked.toastSuccess.mockReset();
    mocked.toastInfo.mockReset();
    mocked.toastError.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders five lifebegins switch cards even when all lifebegins flags are false', () => {
    mocked.useSettingsMock.mockReturnValue(createSettings());

    const { getByText } = render(React.createElement(FeaturesTab));

    expect(getByText('lifeBeginsAnchorTitle')).toBeTruthy();
    expect(getByText('lifeBeginsForkTitle')).toBeTruthy();
    expect(getByText('lifeBeginsFailureTitle')).toBeTruthy();
    expect(getByText('lifeBeginsTimelineTitle')).toBeTruthy();
    expect(getByText('lifeBeginsDnaTitle')).toBeTruthy();
  });

  it('keeps toggle behavior wired to existing setter and success toast', () => {
    const settings = createSettings();
    mocked.useSettingsMock.mockReturnValue(settings);

    const { getByText } = render(React.createElement(FeaturesTab));

    const anchorCard = getByText('lifeBeginsAnchorTitle').closest('.group');
    expect(anchorCard).toBeTruthy();

    const anchorSwitch = within(anchorCard as HTMLElement).getByRole('switch');
    fireEvent.click(anchorSwitch);

    expect(settings.setLifeBeginsAnchorEnabled).toHaveBeenCalledWith(true);
    expect(mocked.toastSuccess).toHaveBeenCalledWith('lifeBeginsAnchorEnabled');
  });
});
