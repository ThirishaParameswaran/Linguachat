import React, { useState, useEffect } from 'react';
import {
  datasetTrainingService,
  DEFAULT_HYPERPARAMETERS,
} from '../../services/datasetTrainingService';
import {
  MTDatasetInfo,
  TrainingHyperparameters,
  TrainingJob,
  TrainedModelCheckpoint,
} from '../../types';
import { ButtonValidator } from '../ButtonValidator';
import {
  Cpu,
  Database,
  Play,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Sliders,
  Upload,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Layers,
  Sparkles,
  Rocket,
  Check,
} from 'lucide-react';
import { useAppState } from '../../store/appState';

export const DatasetTrainingStudio: React.FC = () => {
  const datasets = datasetTrainingService.getDatasets();
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(datasets[0]?.id || 'flores-200');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('ta');
  const [hyperparams, setHyperparams] = useState<TrainingHyperparameters>(DEFAULT_HYPERPARAMETERS);
  const [activeJob, setActiveJob] = useState<TrainingJob | null>(null);
  const [checkpoints, setCheckpoints] = useState<TrainedModelCheckpoint[]>(
    datasetTrainingService.getCheckpoints()
  );
  const [activeTab, setActiveTab] = useState<'datasets' | 'console' | 'checkpoints' | 'custom'>('datasets');
  const [deployedModelId, setDeployedModelId] = useState<string | null>(
    datasetTrainingService.getDeployedModel()?.modelId || null
  );

  const { addNotification } = useAppState();

  const selectedDataset = datasetTrainingService.getDatasetById(selectedDatasetId) || datasets[0];

  // Subscribe to live training job updates
  useEffect(() => {
    if (!activeJob?.jobId) return;

    const unsub = datasetTrainingService.subscribeJob(activeJob.jobId, (updated) => {
      setActiveJob(updated);
      if (updated.status === 'completed') {
        setCheckpoints(datasetTrainingService.getCheckpoints());
        addNotification({
          title: 'Training Completed',
          message: `Model fine-tuning on ${updated.datasetName} completed! Final BLEU: ${updated.finalBleuScore}`,
          type: 'success',
        });
      }
    });

    return () => unsub();
  }, [activeJob?.jobId]);

  const handleStartTraining = async () => {
    setActiveTab('console');
    const job = await datasetTrainingService.startTraining(
      selectedDatasetId,
      sourceLang,
      targetLang,
      hyperparams
    );
    setActiveJob(job);
    addNotification({
      title: 'Training Initiated',
      message: `Started training on ${job.datasetName} (${(sourceLang || 'en').toUpperCase()} → ${(targetLang || 'es').toUpperCase()})`,
      type: 'info',
    });
  };

  const handleDeployCheckpoint = (modelId: string) => {
    datasetTrainingService.deployModel(modelId);
    setDeployedModelId(modelId);
    setCheckpoints([...datasetTrainingService.getCheckpoints()]);
    addNotification({
      title: 'Model Deployed',
      message: `Trained checkpoint ${modelId} is now active in LinguaChat translation engine!`,
      type: 'success',
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Awesome-MT Dataset & Model Training Lab</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Neural Machine Translation Training Studio
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Fine-tune, adapt, and benchmark neural translation weights on curated datasets from the Awesome-MT-Dataset library (FLORES-200, OPUS-100, WikiMatrix, IndiSentiment).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ButtonValidator
            variant="success"
            size="lg"
            onClick={handleStartTraining}
            disabled={activeJob?.status === 'training' || activeJob?.status === 'preparing'}
            icon={<Play className="w-4 h-4 fill-current" />}
            className="shadow-lg shadow-emerald-600/20 font-bold"
          >
            {activeJob?.status === 'training' ? 'Training in Progress...' : 'Train Dataset'}
          </ButtonValidator>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('datasets')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'datasets'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>1. Datasets & Config</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('console')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 relative ${
            activeTab === 'console'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>2. Training Console</span>
          {activeJob?.status === 'training' && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute right-3" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('checkpoints')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'checkpoints'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Rocket className="w-4 h-4" />
          <span>3. Checkpoint Hub ({checkpoints.length})</span>
        </button>
      </div>

      {/* TAB 1: DATASETS & HYPERPARAMETERS */}
      {activeTab === 'datasets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Dataset Cards Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>Select Curated Awesome-MT Dataset</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {datasets.map((ds) => {
                const isSelected = selectedDatasetId === ds.id;
                return (
                  <div
                    key={ds.id}
                    onClick={() => setSelectedDatasetId(ds.id)}
                    className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {ds.category}
                        </span>
                        <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                          {ds.totalSamples.toLocaleString()} pairs
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{ds.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {ds.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Source: {ds.source.split('(')[0]}</span>
                      {ds.repoUrl && (
                        <a
                          href={ds.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-500 hover:underline flex items-center gap-1 font-semibold"
                        >
                          Repo <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Dataset Preview & Samples */}
            {selectedDataset && (
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>Sample Parallel Sentences: {selectedDataset.name}</span>
                </h3>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedDataset.sampleData.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs space-y-1"
                    >
                      <div className="text-slate-600 dark:text-slate-400">
                        <span className="font-bold uppercase text-[10px] text-slate-400 mr-1">
                          [{(s.srcLang || 'en').toUpperCase()}]:
                        </span>
                        {s.source}
                      </div>
                      <div className="text-emerald-700 dark:text-emerald-300 font-semibold">
                        <span className="font-bold uppercase text-[10px] text-emerald-500 mr-1">
                          [{(s.tgtLang || 'es').toUpperCase()}]:
                        </span>
                        {s.target}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right 1 Col: Hyperparameters & Training Settings */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-500" />
              <span>Training Hyperparameters</span>
            </h2>

            {/* Language Pair Select */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Source Lang</label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="en">English (EN)</option>
                  <option value="ta">Tamil (TA)</option>
                  <option value="es">Spanish (ES)</option>
                  <option value="hi">Hindi (HI)</option>
                  <option value="fr">French (FR)</option>
                  <option value="zh">Chinese (ZH)</option>
                  <option value="de">German (DE)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Target Lang</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="ta">Tamil (TA)</option>
                  <option value="es">Spanish (ES)</option>
                  <option value="hi">Hindi (HI)</option>
                  <option value="fr">French (FR)</option>
                  <option value="en">English (EN)</option>
                  <option value="zh">Chinese (ZH)</option>
                  <option value="de">German (DE)</option>
                </select>
              </div>
            </div>

            {/* Base Model Architecture */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Base Architecture</label>
              <select
                value={hyperparams.baseModel}
                onChange={(e) => setHyperparams({ ...hyperparams, baseModel: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="Gemini-3.6-Flash / NLLB-200-Distilled">Gemini 3.6 Flash / NLLB-200 Distilled</option>
                <option value="LLaMA-3-Translation-8B-LoRA">LLaMA-3 Translation (LoRA Fine-Tune)</option>
                <option value="MarianMT-Multilingual-v2">MarianMT Multilingual v2</option>
              </select>
            </div>

            {/* Epochs Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Epochs</span>
                <span className="font-bold text-emerald-600">{hyperparams.epochs} epochs</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={hyperparams.epochs}
                onChange={(e) => setHyperparams({ ...hyperparams, epochs: Number(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Batch Size Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Batch Size</span>
                <span className="font-bold">{hyperparams.batchSize}</span>
              </div>
              <input
                type="range"
                min="8"
                max="128"
                step="8"
                value={hyperparams.batchSize}
                onChange={(e) => setHyperparams({ ...hyperparams, batchSize: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Learning Rate */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Learning Rate</span>
                <span className="font-mono font-bold">{hyperparams.learningRate}</span>
              </div>
              <input
                type="range"
                min="0.00005"
                max="0.001"
                step="0.00005"
                value={hyperparams.learningRate}
                onChange={(e) => setHyperparams({ ...hyperparams, learningRate: Number(e.target.value) })}
                className="w-full accent-purple-500"
              />
            </div>

            {/* LoRA Rank */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>LoRA Rank (r)</span>
                <span className="font-bold">r = {hyperparams.loraRank}</span>
              </div>
              <input
                type="range"
                min="4"
                max="64"
                step="4"
                value={hyperparams.loraRank}
                onChange={(e) => setHyperparams({ ...hyperparams, loraRank: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="pt-2">
              <ButtonValidator
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleStartTraining}
                icon={<Play className="w-4 h-4 fill-current" />}
              >
                Launch Training Job
              </ButtonValidator>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE TRAINING CONSOLE & METRICS */}
      {activeTab === 'console' && (
        <div className="space-y-6">
          {!activeJob ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                No Active Training Job
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select a dataset and click "Train Dataset" to watch live epoch loss curves, BLEU score progression, and token throughput.
              </p>
              <ButtonValidator
                variant="primary"
                size="md"
                onClick={() => setActiveTab('datasets')}
                icon={<Database className="w-4 h-4" />}
              >
                Choose Dataset
              </ButtonValidator>
            </div>
          ) : (
            <>
              {/* Job Status Banner */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                        {activeJob.status}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Job ID: {activeJob.jobId}</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                      {activeJob.datasetName} ({(activeJob.sourceLang || 'en').toUpperCase()} → {(activeJob.targetLang || 'es').toUpperCase()})
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeJob.status === 'completed' && (
                      <ButtonValidator
                        variant="success"
                        size="md"
                        onClick={() => handleDeployCheckpoint('model_' + activeJob.jobId)}
                        icon={<Rocket className="w-4 h-4" />}
                      >
                        Deploy to LinguaChat
                      </ButtonValidator>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">
                      Epoch {activeJob.currentEpoch} / {activeJob.totalEpochs}
                    </span>
                    <span className="text-emerald-600 font-bold">{activeJob.progressPercent}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${activeJob.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Epoch Loss & BLEU Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-bold uppercase">Training Loss</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {activeJob.metrics.length > 0
                      ? activeJob.metrics[activeJob.metrics.length - 1].trainLoss
                      : '2.450'}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">Decaying steadily</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-bold uppercase">Validation Loss</span>
                  <div className="text-2xl font-black text-blue-600 mt-1">
                    {activeJob.metrics.length > 0
                      ? activeJob.metrics[activeJob.metrics.length - 1].valLoss
                      : '2.620'}
                  </div>
                  <span className="text-[11px] text-slate-400">Target: {activeJob.hyperparameters.targetLoss}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-bold uppercase">BLEU Score</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {activeJob.metrics.length > 0
                      ? activeJob.metrics[activeJob.metrics.length - 1].bleuScore
                      : '22.4'}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">+18.4 pts vs baseline</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-bold uppercase">Throughput</span>
                  <div className="text-2xl font-black text-purple-600 mt-1">
                    {activeJob.metrics.length > 0
                      ? activeJob.metrics[activeJob.metrics.length - 1].tokensPerSec
                      : '3,850'}{' '}
                    <span className="text-xs font-normal text-slate-400">tok/s</span>
                  </div>
                  <span className="text-[11px] text-slate-400">GPU Accelerated</span>
                </div>
              </div>

              {/* Epoch-by-Epoch History Table */}
              {activeJob.metrics.length > 0 && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>Epoch Progression & Convergence Log</span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="py-2">Epoch</th>
                          <th className="py-2">Train Loss</th>
                          <th className="py-2">Val Loss</th>
                          <th className="py-2">BLEU</th>
                          <th className="py-2">CHRF</th>
                          <th className="py-2">Learning Rate</th>
                          <th className="py-2">Tokens/s</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                        {activeJob.metrics.map((m) => (
                          <tr key={m.epoch} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 font-bold text-slate-900 dark:text-white">Epoch {m.epoch}</td>
                            <td className="py-2.5 text-emerald-600">{m.trainLoss}</td>
                            <td className="py-2.5 text-blue-600">{m.valLoss}</td>
                            <td className="py-2.5 font-bold text-emerald-600">{m.bleuScore}</td>
                            <td className="py-2.5 text-purple-600">{m.chrfScore}</td>
                            <td className="py-2.5 text-slate-400">{m.learningRate}</td>
                            <td className="py-2.5 text-slate-400">{m.tokensPerSec}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sample Model Inference Predictions */}
              {activeJob.samplePredictions && activeJob.samplePredictions.length > 0 && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>Inference Validation on Test Split</span>
                  </h3>

                  <div className="space-y-2.5">
                    {activeJob.samplePredictions.map((sp, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1.5">
                        <p className="text-slate-600 dark:text-slate-400">
                          <span className="font-bold text-slate-400 mr-1.5 uppercase text-[10px]">Source Input:</span>
                          {sp.source}
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-300 font-bold">
                          <span className="font-bold text-emerald-500 mr-1.5 uppercase text-[10px]">Model Output:</span>
                          {sp.predicted}
                        </p>
                        <div className="flex justify-end text-[10px] text-slate-400">
                          <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
                            BLEU: {sp.bleu}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 3: CHECKPOINT HUB & DEPLOYMENT */}
      {activeTab === 'checkpoints' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-blue-500" />
              <span>Trained Model Checkpoint Registry</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checkpoints.map((cp) => {
              const isDeployed = cp.modelId === deployedModelId || cp.isDeployed;

              return (
                <div
                  key={cp.modelId}
                  className={`p-5 rounded-3xl border transition-all ${
                    isDeployed
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {cp.languagePair}
                    </span>

                    {isDeployed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                        <Check className="w-3.5 h-3.5" /> Deployed to Production
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-semibold">{cp.trainedAt}</span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {cp.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Trained on {cp.datasetName} ({cp.epochsTrained} epochs)
                  </p>

                  <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Benchmark BLEU</span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {cp.bleuScore}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Model Size</span>
                      <span className="text-base font-black text-slate-800 dark:text-slate-200">
                        {cp.sizeMb} MB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    {!isDeployed && (
                      <ButtonValidator
                        variant="primary"
                        size="sm"
                        onClick={() => handleDeployCheckpoint(cp.modelId)}
                        icon={<Rocket className="w-3.5 h-3.5" />}
                      >
                        Deploy Weights
                      </ButtonValidator>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
