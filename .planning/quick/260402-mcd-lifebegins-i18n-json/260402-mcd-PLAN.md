---
phase: quick-260402-mcd-lifebegins-i18n-json
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/lib/i18n/locales/en.ts
  - app/lib/i18n/locales/zh.ts
  - app/components/@settings/tabs/features/lifebeginsFeatures.ts
  - app/components/@settings/tabs/features/lifebeginsFeatures.spec.ts
  - app/components/@settings/tabs/features/FeaturesTab.tsx
autonomous: true
requirements:
  - METR-02
must_haves:
  truths:
    - "Settings > Features 中 LifeBegins 区块在中英文环境下展示本地化标题、描述与五个域文案。"
    - "切换任一 LifeBegins 开关时，toast 文案使用 i18n key，而非硬编码字符串。"
    - "LifeBegins 相关 UI 文案统一来自现有 locale 资源，不再散落在组件中硬编码。"
  artifacts:
    - path: "app/lib/i18n/locales/en.ts"
      provides: "settings 下 LifeBegins 相关英文文案键（section/feature/toggle toast）"
    - path: "app/lib/i18n/locales/zh.ts"
      provides: "settings 下 LifeBegins 相关中文文案键（section/feature/toggle toast）"
    - path: "app/components/@settings/tabs/features/lifebeginsFeatures.ts"
      provides: "LifeBegins 域配置与 i18n key 的稳定映射"
    - path: "app/components/@settings/tabs/features/FeaturesTab.tsx"
      provides: "FeaturesTab 对 LifeBegins key 的翻译渲染与 toast 本地化接线"
  key_links:
    - from: "app/components/@settings/tabs/features/lifebeginsFeatures.ts"
      to: "app/components/@settings/tabs/features/FeaturesTab.tsx"
      via: "feature metadata 中的 i18n key（title/description/toast）"
      pattern: "titleKey|descriptionKey|enabledToastKey|disabledToastKey"
    - from: "app/components/@settings/tabs/features/FeaturesTab.tsx"
      to: "app/lib/i18n/locales/en.ts + app/lib/i18n/locales/zh.ts"
      via: "t('settings.*') key 查询"
      pattern: "t\\('lifeBegins"
---

<objective>
为实验性功能 LifeBegins 在 FeaturesTab 提供完整 i18n 支持，并把文案写入现有 locale 资源对象（en/zh），消除组件内硬编码。

Purpose: 让治理开关与实验性能力在不同语言环境下可读、可维护、可扩展。
Output: locale key 增量、LifeBegins 特性元数据升级、FeaturesTab 接线改造与回归验证。
</objective>

<context>
@.planning/STATE.md
@app/lib/i18n/config.ts
@app/lib/i18n/locales/en.ts
@app/lib/i18n/locales/zh.ts
@app/components/@settings/tabs/features/lifebeginsFeatures.ts
@app/components/@settings/tabs/features/lifebeginsFeatures.spec.ts
@app/components/@settings/tabs/features/FeaturesTab.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extend existing locale resources with LifeBegins keys</name>
  <files>app/lib/i18n/locales/en.ts, app/lib/i18n/locales/zh.ts</files>
  <action>在 `settings` 命名空间下新增 LifeBegins 文案键，覆盖 section 标题/描述、五个域的标题与描述、以及每个域的 enabled/disabled toast。保持现有文件结构与命名风格，不新增新的 locale 文件；仅在已有资源对象中补齐键。</action>
  <verify>
    <automated>rg -n "lifeBeginsTitle|lifeBeginsDesc|lifeBeginsAnchorTitle|lifeBeginsAnchorEnabled|lifeBeginsDnaDisabled" app/lib/i18n/locales/en.ts app/lib/i18n/locales/zh.ts</automated>
  </verify>
  <done>en/zh 两套资源都包含同构的 LifeBegins 文案键，并可被 settings 命名空间消费。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Refactor LifeBegins feature metadata to carry i18n keys</name>
  <files>app/components/@settings/tabs/features/lifebeginsFeatures.ts, app/components/@settings/tabs/features/lifebeginsFeatures.spec.ts</files>
  <behavior>
    - Test 1: buildLifeBeginsFeatures 仍返回 5 个域，且 id 顺序保持不变。
    - Test 2: 每个域包含 i18n key 字段（title/description/enable/disable toast）而非硬编码展示文案。
    - Test 3: enabled 布尔状态仍与输入一一对应，不影响可见性契约。
  </behavior>
  <action>将 LifeBegins 特性元数据从“直接文案”升级为“i18n key 描述”，并更新测试以断言 key 契约。保持函数输入、id 与 enabled 语义稳定，避免破坏既有治理开关行为。</action>
  <verify>
    <automated>pnpm test -- app/components/@settings/tabs/features/lifebeginsFeatures.spec.ts</automated>
  </verify>
  <done>LifeBegins 元数据成为可复用的 i18n key contract，测试覆盖 key 与 enabled 两类契约。</done>
</task>

<task type="auto">
  <name>Task 3: Wire FeaturesTab to render and toast via i18n keys</name>
  <files>app/components/@settings/tabs/features/FeaturesTab.tsx</files>
  <action>在 FeaturesTab 中消费 Task 2 的 key contract：渲染时使用 `t(key)` 生成标题/描述，切换开关时使用 key 生成 enabled/disabled toast；同时将 LifeBegins 区块标题与说明改为 i18n。移除 LifeBegins 相关硬编码英文字符串。</action>
  <verify>
    <automated>pnpm test -- app/components/@settings/tabs/features/lifebeginsFeatures.spec.ts app/routes/__tests__/governance-mainflow.spec.ts && ! rg -n "Intent Anchor|Fork Futures|Failure Museum|Life Timeline|Builder DNA|Growth domains controlled by governance flags\\.|lifebegins\\.(anchor|fork|failure|timeline|dna) enabled|lifebegins\\.(anchor|fork|failure|timeline|dna) disabled" app/components/@settings/tabs/features/FeaturesTab.tsx app/components/@settings/tabs/features/lifebeginsFeatures.ts</automated>
  </verify>
  <done>FeaturesTab 的 LifeBegins 文案与反馈完全 i18n 化，并通过现有治理回归测试。</done>
</task>

</tasks>

<verification>
运行 Task 3 的自动化命令，确保回归测试通过且 LifeBegins 相关硬编码文案已清理。
</verification>

<success_criteria>
切换中英文后，LifeBegins 区块与五个域文案、开关反馈均可随语言切换；代码中不再存在 LifeBegins 展示/反馈硬编码文案。
</success_criteria>

<output>
After completion, create `.planning/quick/260402-mcd-lifebegins-i18n-json/260402-mcd-SUMMARY.md`
</output>
