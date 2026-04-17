# 数据统计功能设计与规则说明

本文档详细说明了设置面板中“数据管理”页面的“数据使用情况”模块的设计规则及其技术实现。

## 1. 功能概述

数据统计模块的主要目的是通过可视化图表展示用户活动数据，包括聊天趋势、消息角色分布及 **Provider API 使用情况**。

## 2. 数据来源与存储 (Data Source)

- **存储介质**：浏览器的 **IndexedDB**（数据库名：`boltHistory`）。
- **核心数据结构**：`chats` 对象存储，包含 `messages` 数组（角色、内容、时间戳等）。
- **获取方式**：通过 `app/lib/persistence/db.ts` 中的 `getAllChats()` 方法。

## 3. 提供商（Provider）识别规则

由于系统中的服务商信息是以“非侵入式”方式嵌入在消息文本中的，我们采用了**上下文追溯**和**指纹识别**相结合的策略。

### 3.1 文本指纹识别 (Fingerprinting)
系统会匹配以下两种指纹：
- **主流格式**：`[Provider: Name]` (例如 `[Provider: OpenAI]`)。这是用户发送消息时前端自动附加的。
- **兼容格式**：`provider: Name` (例如 `provider: Ollama`)。

相关正则定义于 `app/utils/constants.ts`。

### 3.2 上下文追溯机制 (Contextual Fallback)
这是解决 AI 回复中通常不带有 Provider 标识的关键：
1. **状态维护**：在单场对话遍历中，维护一个 `lastKnownProvider`（初始为 `unknown`）。
2. **同步更新**：每当在消息（通常是用户消息）中发现指纹时，立即更新该状态。
3. **关联引用**：当统计 AI 回复（Assistant）时，如果该消息本身未带指纹，则**自动继承最近一次记录的服务商**。
4. **效果**：即使 AI 消息中不含 Provider 字样，只要它是由某服务商触发的交互，也会被准确归类。

### 3.3 系统行为过滤规则 (Noise Filtering)
为了剔除不消耗 API 的干扰项，以下内容不计入统计：
- **技术执行日志**：如包含了“正在克隆仓库”、“Found 'dev' script”或特定的 Shell 执行输出。
- **空白记录**：异常中断产生的空消息。

## 4. 关键技术实现与修复

### 4.1 UI 布局兼容性修复
- **问题**：`CardContent` ([Card.tsx](app/components/ui/Card.tsx)) 默认带有 `pt-0`，导致嵌套布局时顶部贴边。
- **方案**：在各调用处显式声明 `p-6 pt-6` 覆盖默认值。
- **涉及文件**：`DataTab.tsx`、`ProviderCard.tsx`、`LocalProvidersTab.tsx`。

### 4.2 核心代码位置
- **处理逻辑**：`DataVisualization.tsx` 中的 `useEffect` 遍历逻辑。
- **样式入口**：`DataTab.tsx`。

## 5. 常见问题 (FAQ)

**问：为什么还是有 `unknown`？**
答：这通常由于历史遗留数据、导入数据完全没有 Provider 标记，且无法在上下文中溯源导致。系统为了数据真实性，不会强制指派不存在的提供商。
