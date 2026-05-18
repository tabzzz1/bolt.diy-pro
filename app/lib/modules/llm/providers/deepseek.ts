import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';

export default class DeepseekProvider extends BaseProvider {
  name = 'Deepseek';
  getApiKeyLink = 'https://platform.deepseek.com/apiKeys';

  config = {
    baseUrlKey: 'DEEPSEEK_API_BASE_URL',
    baseUrl: 'https://api.deepseek.com',
    apiTokenKey: 'DEEPSEEK_API_KEY',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'deepseek-v4-pro',
      label: 'DeepSeek V4 Pro (Reasoning + Agentic Coding)',
      provider: 'Deepseek',
      maxTokenAllowed: 1_000_000,
      maxCompletionTokens: 384_000,
    },
    {
      name: 'deepseek-v4-flash',
      label: 'DeepSeek V4 Flash (Fast + Cost-Efficient)',
      provider: 'Deepseek',
      maxTokenAllowed: 1_000_000,
      maxCompletionTokens: 384_000,
    },
  ];

  private getModelMetadata(modelId: string): Omit<ModelInfo, 'name' | 'provider'> {
    const metadataByModel: Record<string, Omit<ModelInfo, 'name' | 'provider'>> = {
      'deepseek-v4-pro': {
        label: 'DeepSeek V4 Pro (Reasoning + Agentic Coding)',
        maxTokenAllowed: 1_000_000,
        maxCompletionTokens: 384_000,
      },
      'deepseek-v4-flash': {
        label: 'DeepSeek V4 Flash (Fast + Cost-Efficient)',
        maxTokenAllowed: 1_000_000,
        maxCompletionTokens: 384_000,
      },
    };

    return (
      metadataByModel[modelId] || {
        label: `${modelId} (Dynamic)`,
        maxTokenAllowed: 1_000_000,
        maxCompletionTokens: 384_000,
      }
    );
  }

  async getDynamicModels(
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    const { baseUrl, apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: 'DEEPSEEK_API_BASE_URL',
      defaultApiTokenKey: 'DEEPSEEK_API_KEY',
    });

    if (!apiKey) {
      return [];
    }

    try {
      const response = await fetch(`${baseUrl || this.config.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        signal: this.createTimeoutSignal(5000),
      });

      if (!response.ok) {
        console.error(`DeepSeek API error: ${response.statusText}`);
        return [];
      }

      const data = (await response.json()) as any;
      const staticModelIds = this.staticModels.map((m) => m.name);
      const unsupportedLegacyModelIds = new Set(['deepseek-chat', 'deepseek-reasoner']);

      const dynamicModels =
        data.data
          ?.filter((model: any) => !staticModelIds.includes(model.id) && !unsupportedLegacyModelIds.has(model.id))
          .map((m: any) => {
            const metadata = this.getModelMetadata(m.id);

            return {
              name: m.id,
              provider: this.name,
              ...metadata,
            };
          }) || [];

      return dynamicModels;
    } catch (error) {
      console.error(`Failed to fetch DeepSeek models:`, error);
      return [];
    }
  }

  getModelInstance(options: {
    model: string;
    serverEnv: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, providerSettings } = options;

    const { baseUrl, apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: providerSettings?.[this.name],
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: 'DEEPSEEK_API_BASE_URL',
      defaultApiTokenKey: 'DEEPSEEK_API_KEY',
    });

    if (!apiKey) {
      throw new Error(`Missing API key for ${this.name} provider`);
    }

    const deepseek = createDeepSeek({
      baseURL: baseUrl || this.config.baseUrl,
      apiKey,
    });

    return deepseek(model, {
      // simulateStreaming: true,
    });
  }
}
