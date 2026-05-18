import { describe, expect, it } from 'vitest';
import { shouldExposeMCPToolsForPrompt } from './mcpService';

describe('shouldExposeMCPToolsForPrompt', () => {
  it('does not expose MCP tools for ordinary code generation prompts', () => {
    expect(shouldExposeMCPToolsForPrompt('生成一个简单的登录页。', true)).toBe(false);
    expect(shouldExposeMCPToolsForPrompt('Create a modern landing page with React.', true)).toBe(false);
  });

  it('does not expose MCP tools when no tools are available', () => {
    expect(shouldExposeMCPToolsForPrompt('搜索最新的 React 文档', false)).toBe(false);
  });

  it('exposes MCP tools for explicit MCP or external information requests', () => {
    expect(shouldExposeMCPToolsForPrompt('使用 MCP 工具查询这个库的最新文档', true)).toBe(true);
    expect(shouldExposeMCPToolsForPrompt('Look up the latest GitHub issue for this project.', true)).toBe(true);
    expect(shouldExposeMCPToolsForPrompt('读取 https://example.com/docs 然后总结', true)).toBe(true);
  });
});
