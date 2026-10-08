import { useState, useCallback, useMemo } from 'react';
import { NCPTestRunner, NCPTestResult, NCPTestSummary } from '../tests/ncpTesting';
import { NCP_TEST_SUITE, NCPTestCase } from '../tests/ncpTests.config';

export function useNCPTests() {
  const [runner] = useState(() => new NCPTestRunner(NCP_TEST_SUITE));
  const [results, setResults] = useState<NCPTestResult[]>([]);
  const [summary, setSummary] = useState<NCPTestSummary | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: NCP_TEST_SUITE.length });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedResult, setSelectedResult] = useState<NCPTestResult | null>(null);

  const runAll = useCallback(async () => {
    setIsRunning(true);
    setProgress({ current: 0, total: NCP_TEST_SUITE.length });

    const outcome = await runner.runAllTests((_result, current, total) => {
      setProgress({ current, total });
      setResults([...runner.getResults()]);
      setSummary(runner.getSummary());
    });

    setResults(outcome.results);
    setSummary(outcome.summary);
    setIsRunning(false);
  }, [runner]);

  const runSingle = useCallback(
    async (testCase: NCPTestCase) => {
      const result = await runner.runTest(testCase);
      setResults([...runner.getResults()]);
      setSummary(runner.getSummary());
      return result;
    },
    [runner]
  );

  const categories = useMemo(() => {
    const set = new Set(NCP_TEST_SUITE.map((t) => t.category));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredTests = useMemo(() => {
    if (selectedCategory === 'All') return NCP_TEST_SUITE;
    return NCP_TEST_SUITE.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  return {
    suite: NCP_TEST_SUITE,
    filteredTests,
    results,
    summary,
    isRunning,
    progress,
    selectedCategory,
    categories,
    selectedResult,
    setSelectedCategory,
    setSelectedResult,
    runAll,
    runSingle,
    getResultForTest: (testId: string) => results.find((r) => r.testId === testId),
  };
}
