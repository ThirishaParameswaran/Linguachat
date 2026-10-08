import React, { useState } from 'react';
import { useNCPTests } from '../hooks/useNCPTests';
import { ButtonValidator } from './ButtonValidator';
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Layers,
  Search,
  Code2,
  RefreshCw,
  Zap,
  Check,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

export const TestDashboard: React.FC = () => {
  const {
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
    getResultForTest,
  } = useNCPTests();

  const [searchQuery, setSearchQuery] = useState('');
  const [runningSingleId, setRunningSingleId] = useState<string | null>(null);

  const displayedTests = filteredTests.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRunSingle = async (testCase: any) => {
    setRunningSingleId(testCase.id);
    await runSingle(testCase);
    setRunningSingleId(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>NCP Automated Test Suite</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Network & Communication Protocol Diagnostics
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
            Live validation of all REST endpoints, AI translation models, Socket.io channels, sentiment radars, and debt scoring engines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ButtonValidator
            variant="primary"
            size="lg"
            isLoading={isRunning}
            onClick={runAll}
            icon={<Play className="w-4 h-4 fill-current" />}
            className="shadow-lg shadow-blue-600/30 font-bold"
          >
            {isRunning
              ? `Running (${progress.current}/${progress.total})...`
              : 'Run All Diagnostics'}
          </ButtonValidator>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Tests</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {summary.total}
            </div>
            <span className="text-[11px] text-slate-400">Configured test specs</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Passed
            </span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {summary.passed}
            </div>
            <span className="text-[11px] text-emerald-600/70">
              {summary.passRatePercentage}% Pass Rate
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 shadow-sm">
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Failed
            </span>
            <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
              {summary.failed}
            </div>
            <span className="text-[11px] text-rose-600/70">Requires attention</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 shadow-sm">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Total Latency
            </span>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
              {summary.durationTotalMs} ms
            </div>
            <span className="text-[11px] text-blue-600/70">Roundtrip runtime</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 shadow-sm col-span-2 sm:col-span-1">
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Last Execution
            </span>
            <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mt-1">
              {summary.lastRunAt}
            </div>
            <span className="text-[11px] text-indigo-600/70">System sync OK</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tests or endpoints..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedTests.map((test) => {
          const result = getResultForTest(test.id);
          const isCurrentRunning = isRunning || runningSingleId === test.id;

          return (
            <div
              key={test.id}
              className={`flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-slate-800 border transition-all ${
                result?.status === 'passed'
                  ? 'border-emerald-300 dark:border-emerald-800/80 hover:shadow-emerald-500/10'
                  : result?.status === 'failed'
                  ? 'border-rose-300 dark:border-rose-800/80 hover:shadow-rose-500/10'
                  : 'border-slate-200 dark:border-slate-700'
              } shadow-sm hover:shadow-md`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {test.category}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                      {test.method} {test.endpoint}
                    </span>
                  </div>

                  {/* Status Badge */}
                  {result?.status === 'passed' && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pass ({result.durationMs}ms)
                    </span>
                  )}
                  {result?.status === 'failed' && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full">
                      <XCircle className="w-3.5 h-3.5" /> Fail ({result.durationMs}ms)
                    </span>
                  )}
                  {result?.status === 'running' && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testing...
                    </span>
                  )}
                  {!result && (
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                      Pending Run
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {test.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {test.description}
                </p>

                {result?.error && (
                  <div className="mt-2.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] flex items-start gap-1.5 font-mono">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                    <span className="break-all">{result.error}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <ButtonValidator
                  variant="outline"
                  size="sm"
                  isLoading={runningSingleId === test.id}
                  onClick={() => handleRunSingle(test)}
                  icon={<Play className="w-3 h-3 fill-current" />}
                >
                  Execute Single
                </ButtonValidator>

                {result && (
                  <button
                    type="button"
                    onClick={() => setSelectedResult(result)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Inspect Payload</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspector Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {selectedResult.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedResult.testName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto space-y-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 font-bold block mb-1">Request Endpoint:</span>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {selectedResult.method} {selectedResult.endpoint}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-bold block mb-1">Status Code:</span>
                  <div
                    className={`p-2.5 rounded-xl font-bold ${
                      selectedResult.statusCode === selectedResult.expectedStatus
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600'
                    }`}
                  >
                    {selectedResult.statusCode || 'N/A'} (Expected {selectedResult.expectedStatus})
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-1">Latency:</span>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold">
                    {selectedResult.durationMs} ms
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Response JSON Body:</span>
                <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-200 overflow-x-auto text-[11px] leading-relaxed max-h-64">
                  {JSON.stringify(selectedResult.responsePayload || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <ButtonValidator
                variant="secondary"
                size="sm"
                onClick={() => setSelectedResult(null)}
              >
                Close Inspector
              </ButtonValidator>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
