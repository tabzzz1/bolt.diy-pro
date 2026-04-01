import { useState, useCallback } from 'react';
import type { ConnectionTestResult } from '~/components/@settings/shared/service-integration';

interface UseConnectionTestOptions {
  testEndpoint: string;
  serviceName: string;
  getUserIdentifier?: (data: any) => string;
  getMessages?: {
    testing?: () => string;
    success?: (params: { serviceName: string; userIdentifier: string }) => string;
    failed?: (params: { error: string }) => string;
  };
}

export function useConnectionTest({
  testEndpoint,
  serviceName,
  getUserIdentifier,
  getMessages,
}: UseConnectionTestOptions) {
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);

  const testConnection = useCallback(async () => {
    setTestResult({
      status: 'testing',
      message: getMessages?.testing?.() ?? 'Testing connection...',
    });

    try {
      const response = await fetch(testEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userIdentifier = getUserIdentifier ? getUserIdentifier(data) : 'User';

        setTestResult({
          status: 'success',
          message:
            getMessages?.success?.({ serviceName, userIdentifier }) ??
            `Connected successfully to ${serviceName} as ${userIdentifier}`,
          timestamp: Date.now(),
        });
      } else {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        const error = errorData.error || `${response.status} ${response.statusText}`;
        setTestResult({
          status: 'error',
          message: getMessages?.failed?.({ error }) ?? `Connection failed: ${error}`,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult({
        status: 'error',
        message: getMessages?.failed?.({ error: errorMessage }) ?? `Connection failed: ${errorMessage}`,
        timestamp: Date.now(),
      });
    }
  }, [testEndpoint, serviceName, getUserIdentifier, getMessages]);

  const clearTestResult = useCallback(() => {
    setTestResult(null);
  }, []);

  return {
    testResult,
    testConnection,
    clearTestResult,
    isTestingConnection: testResult?.status === 'testing',
  };
}
