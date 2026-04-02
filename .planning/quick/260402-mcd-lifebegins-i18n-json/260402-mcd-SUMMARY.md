# Quick Task 260402-mcd Summary

## Goal
为实验性功能 LifeBegins 提供 i18n 支持，并确保文案走现有 locale 资源。

## What Changed
- Refactored `buildLifeBeginsFeatures` to return i18n key metadata (`titleKey` / `descriptionKey` / toast keys) instead of hardcoded UI text.
- Updated `FeaturesTab` to:
  - render LifeBegins section title/description via `t('lifeBeginsTitle')` and `t('lifeBeginsDesc')`
  - render each LifeBegins card title/description via feature key metadata
  - emit localized toggle toasts via `enabledToastKey` / `disabledToastKey`
- Updated governance/UI regression tests to assert the new i18n-key-based contract under mocked `t()` behavior.

## Locale Resources
- Reused existing keys in:
  - `app/lib/i18n/locales/en.ts`
  - `app/lib/i18n/locales/zh.ts`
- No new locale file added; all content stays in existing locale objects.

## Validation
- `pnpm test -- app/components/@settings/tabs/features/lifebeginsFeatures.spec.ts app/routes/__tests__/governance-mainflow.spec.ts`
- Result: passed (7 tests)

## Commits
- `ea465b0` feat: localize lifebegins feature toggles
