import { NCPTestCase, NCP_TEST_SUITE } from './ncpTests.config';

export interface NCPTestResult {
  testId: string;
  testName: string;
  category: string;
  endpoint: string;
  method: string;
  status: 'passed' | 'failed' | 'running' | 'skipped';
  durationMs: number;
  statusCode?: number;
  expectedStatus: number;
  responsePayload?: any;
  error?: string;
  timestamp: string;
}

export interface NCPTestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationTotalMs: number;
  passRatePercentage: number;
  lastRunAt: string;
  categories: Record<string, { total: number; passed: number; failed: number }>;
}

export class NCPTestRunner {
  private suite: NCPTestCase[];
  private results: Map<string, NCPTestResult> = new Map();
  private isRunning: boolean = false;

  constructor(customSuite?: NCPTestCase[]) {
    this.suite = customSuite || NCP_TEST_SUITE;
  }

  public getSuite(): NCPTestCase[] {
    return this.suite;
  }

  public getResults(): NCPTestResult[] {
    return Array.from(this.results.values());
  }

  public getResult(testId: string): NCPTestResult | undefined {
    return this.results.get(testId);
  }

  public getSummary(): NCPTestSummary {
    const list = this.getResults();
    const passed = list.filter((r) => r.status === 'passed').length;
    const failed = list.filter((r) => r.status === 'failed').length;
    const skipped = list.filter((r) => r.status === 'skipped').length;
    const durationTotalMs = list.reduce((acc, r) => acc + (r.durationMs || 0), 0);

    const categories: Record<string, { total: number; passed: number; failed: number }> = {};

    list.forEach((r) => {
      if (!categories[r.category]) {
        categories[r.category] = { total: 0, passed: 0, failed: 0 };
      }
      categories[r.category].total += 1;
      if (r.status === 'passed') categories[r.category].passed += 1;
      if (r.status === 'failed') categories[r.category].failed += 1;
    });

    const passRatePercentage = list.length ? Math.round((passed / list.length) * 100) : 0;

    return {
      total: list.length,
      passed,
      failed,
      skipped,
      durationTotalMs,
      passRatePercentage,
      lastRunAt: new Date().toLocaleTimeString(),
      categories,
    };
  }

  public async runTest(test: NCPTestCase): Promise<NCPTestResult> {
    const startTime = performance.now();
    const runningResult: NCPTestResult = {
      testId: test.id,
      testName: test.name,
      category: test.category,
      endpoint: test.endpoint,
      method: test.method,
      status: 'running',
      durationMs: 0,
      expectedStatus: test.expectedStatus,
      timestamp: new Date().toLocaleTimeString(),
    };
    this.results.set(test.id, runningResult);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(test.headers || {}),
      };

      const fetchOptions: RequestInit = {
        method: test.method,
        headers,
      };

      if (test.payload && (test.method === 'POST' || test.method === 'PUT')) {
        fetchOptions.body = JSON.stringify(test.payload);
      }

      const response = await fetch(test.endpoint, fetchOptions);
      const durationMs = Math.round(performance.now() - startTime);

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = { text: await response.text() };
      }

      const statusMatch = response.status === test.expectedStatus;
      let validatorPass = true;
      let validatorError: string | undefined;

      if (test.validator) {
        const valRes = test.validator(data, response.status);
        validatorPass = valRes.pass;
        validatorError = valRes.error;
      }

      const passed = statusMatch && validatorPass;

      const finalResult: NCPTestResult = {
        testId: test.id,
        testName: test.name,
        category: test.category,
        endpoint: test.endpoint,
        method: test.method,
        status: passed ? 'passed' : 'failed',
        durationMs,
        statusCode: response.status,
        expectedStatus: test.expectedStatus,
        responsePayload: data,
        error: !statusMatch
          ? `Status mismatch: expected ${test.expectedStatus}, got ${response.status}`
          : validatorError,
        timestamp: new Date().toLocaleTimeString(),
      };

      this.results.set(test.id, finalResult);
      return finalResult;
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      const failedResult: NCPTestResult = {
        testId: test.id,
        testName: test.name,
        category: test.category,
        endpoint: test.endpoint,
        method: test.method,
        status: 'failed',
        durationMs,
        expectedStatus: test.expectedStatus,
        error: err?.message || 'Network request failed',
        timestamp: new Date().toLocaleTimeString(),
      };
      this.results.set(test.id, failedResult);
      return failedResult;
    }
  }

  public async runAllTests(
    onProgress?: (result: NCPTestResult, index: number, total: number) => void
  ): Promise<{ results: NCPTestResult[]; summary: NCPTestSummary }> {
    if (this.isRunning) {
      return { results: this.getResults(), summary: this.getSummary() };
    }

    this.isRunning = true;
    const total = this.suite.length;

    for (let i = 0; i < total; i++) {
      const test = this.suite[i];
      const result = await this.runTest(test);
      if (onProgress) {
        onProgress(result, i + 1, total);
      }
    }

    this.isRunning = false;
    return {
      results: this.getResults(),
      summary: this.getSummary(),
    };
  }
}

export const defaultNCPRunner = new NCPTestRunner();
