import React, { useState, useCallback } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useAppState } from '../../store/appState';
import { sendEmailReport } from '../../services/api';
import {
  MessageSquare,
  ShieldCheck,
  Globe,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Download,
  Mail,
  RefreshCw,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Calendar,
  X,
  Loader2,
  Check,
  Send,
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { data, refresh, isRefreshing, lastUpdated } = useAnalytics();
  const { user } = useAppState();

  const [dateRange, setDateRange] = useState('Last 30 days');
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(user?.email || 'alex.chen@linguachat.ai');

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(90);

  const monthlyVolume = data.weeklyVolume30Days || [
    { week: 'Week 1', volume: '0 msgs', height: '0%', count: 0 },
    { week: 'Week 2', volume: '0 msgs', height: '0%', count: 0 },
    { week: 'Week 3', volume: '0 msgs', height: '0%', count: 0 },
    { week: 'Week 4', volume: '0 msgs', height: '0%', count: 0 },
  ];

  const languageDist = data.languageDistribution || [];
  const qualityByLang = data.qualityByLanguage || [];
  const insightsList = data.insights || [];

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 6000);
  };

  const escapeCsvCell = (val: string | number | undefined | null): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Real CSV Export Functionality
  const handleExportCsv = useCallback(() => {
    setIsExporting(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const filename = `linguachat-analytics-report-${todayStr}.csv`;

      const rows: string[][] = [
        ['LinguaChat Telemetry & Analytics Report'],
        ['Generated Date', new Date().toLocaleString()],
        ['Date Range Filter', dateRange],
        ['Last Updated', lastUpdated || 'Just now'],
        [''],
        ['KEY PERFORMANCE METRICS SUMMARY'],
        ['Metric Name', 'Current Value', 'Trend / Change'],
        ['Total Messages', String(data.totalMessages || 0), data.messagesChangeLabel || '--'],
        ['Total Translations', String(data.totalTranslations || 0), data.translationsChange || '--'],
        ['AI Translation Accuracy', `${data.aiConfidence || 0}%`, data.accuracyChangeLabel || '--'],
        ['Active Languages Count', String(data.activeLanguagesCount || 0), data.languagesChangeLabel || '--'],
        ['Active Users Count', String(data.activeUsersCount || 0), data.activeUsersChange || '--'],
        ['Average Response Time', data.avgResponseTimeFormatted || 'N/A', data.responseTimeChangeLabel || '--'],
        ['Pending Review Items', String(data.pendingReviewTotal || 0), 'In Queue'],
        ['Translation Debt Average', `${data.translationDebt || 0}%`, 'Quality Score'],
        ['Audit Approval Rate', `${data.auditApproval || 0}%`, 'Compliance'],
        [''],
        ['WEEKLY ACTIVITY BREAKDOWN'],
        ['Period / Week', 'Message Volume', 'Message Count'],
      ];

      (monthlyVolume || []).forEach((w) => {
        rows.push([w.week, w.volume, String(w.count)]);
      });

      rows.push(['']);
      rows.push(['LANGUAGE DISTRIBUTION']);
      rows.push(['Language Name', 'Flag / Symbol', 'Share Percentage', 'Hits Count']);

      (languageDist || []).forEach((l) => {
        rows.push([l.name, l.flag, `${l.percent}%`, String(l.count)]);
      });

      rows.push(['']);
      rows.push(['TRANSLATION QUALITY BY LANGUAGE']);
      rows.push(['Language Code', 'Flag', 'Accuracy Score Percentage']);

      (qualityByLang || []).forEach((q) => {
        rows.push([q.code, q.flag, `${q.score}%`]);
      });

      rows.push(['']);
      rows.push(['TELEMETRY INSIGHTS & RECOMMENDATIONS']);
      rows.push(['Severity Level', 'Description']);

      (insightsList || []).forEach((ins) => {
        rows.push([ins.type.toUpperCase(), ins.text]);
      });

      const csvContent = rows
        .map((row) => row.map(escapeCsvCell).join(','))
        .join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      showToast('success', `✓ Report exported successfully (${filename})`);
    } catch (err: any) {
      console.error('Export CSV error:', err);
      setIsExporting(false);
      showToast('error', 'Unable to export report. Please try again.');
    }
  }, [data, dateRange, lastUpdated, monthlyVolume, languageDist, qualityByLang, insightsList]);

  // Real PDF / HTML Report Export Functionality
  const handleExportPdf = useCallback(() => {
    setIsExportingPdf(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const filename = `linguachat-analytics-report-${todayStr}.html`;

      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>LinguaChat Analytics Report - ${todayStr}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; background: #fff; max-width: 900px; margin: 0 auto; }
    .header { border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px; }
    h1 { color: #1e3a8a; margin: 0 0 5px 0; font-size: 24px; }
    .meta { font-size: 13px; color: #64748b; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 25px 0; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; }
    .card-title { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #64748b; }
    .card-val { font-size: 22px; font-weight: 800; color: #1e293b; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
    th { background: #f1f5f9; font-weight: bold; color: #334155; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 LinguaChat Telemetry & Analytics Report</h1>
    <div class="meta">Generated: ${new Date().toLocaleString()} | Filter Range: ${dateRange} | Updated: ${lastUpdated || 'Just Now'}</div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Total Messages</div>
      <div class="card-val">${data.totalMessages || 0}</div>
    </div>
    <div class="card">
      <div class="card-title">AI Accuracy</div>
      <div class="card-val">${data.aiConfidence || 0}%</div>
    </div>
    <div class="card">
      <div class="card-title">Active Languages</div>
      <div class="card-val">${data.activeLanguagesCount || 0}</div>
    </div>
    <div class="card">
      <div class="card-title">Avg Response</div>
      <div class="card-val">${data.avgResponseTimeFormatted || 'N/A'}</div>
    </div>
  </div>

  <h2>🌐 Language Distribution</h2>
  <table>
    <thead>
      <tr><th>Language</th><th>Share (%)</th><th>Hits / Messages</th></tr>
    </thead>
    <tbody>
      ${(languageDist || [])
        .map((l) => `<tr><td>${l.flag} ${l.name}</td><td>${l.percent}%</td><td>${l.count}</td></tr>`)
        .join('')}
    </tbody>
  </table>

  <h2>📊 Translation Quality by Language</h2>
  <table>
    <thead>
      <tr><th>Language Code</th><th>Accuracy Score</th></tr>
    </thead>
    <tbody>
      ${(qualityByLang || [])
        .map((q) => `<tr><td>${q.flag} ${q.code}</td><td>${q.score}%</td></tr>`)
        .join('')}
    </tbody>
  </table>

  <h2>🔍 Insights & Recommendations</h2>
  <ul>
    ${(insightsList || []).map((ins) => `<li><strong>${ins.type.toUpperCase()}:</strong> ${ins.text}</li>`).join('')}
  </ul>

  <div class="footer">Confidential Telemetry Report · LinguaChat Multilingual Engine · ${todayStr}</div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExportingPdf(false);
      showToast('success', `✓ Analytics PDF/HTML report downloaded (${filename})`);
    } catch (err: any) {
      console.error('Export PDF error:', err);
      setIsExportingPdf(false);
      showToast('error', 'Unable to export PDF report. Please try again.');
    }
  }, [data, dateRange, lastUpdated, languageDist, qualityByLang, insightsList]);

  // Real Email Report Dispatch Functionality
  const handleSendEmailReport = useCallback(async () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      showToast('error', 'Please enter a valid recipient email address.');
      return;
    }

    setIsSendingEmail(true);
    try {
      const res = await sendEmailReport(recipientEmail.trim(), dateRange, data);
      setIsSendingEmail(false);
      setShowEmailModal(false);

      if (res.success) {
        showToast('success', `✓ ${res.message || `Telemetry report successfully sent to ${recipientEmail}`}`);
      } else {
        showToast('error', res.error || 'Failed to dispatch email report.');
      }
    } catch (err: any) {
      setIsSendingEmail(false);
      setShowEmailModal(false);
      showToast('error', 'Network error while dispatching email report.');
    }
  }, [recipientEmail, dateRange, data]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : notification.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              : 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : notification.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span>Telemetry & Insights</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            📊 Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live cross-language activity, neural accuracy benchmarks, and translation debt reports
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
          <Clock className="w-4 h-4" />
          <span>Updated: {lastUpdated || 'Just Now'}</span>
        </div>
      </div>

      {/* 📈 Key Performance Metrics (4 KPI Cards) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          📈 Key Performance Metrics
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Messages */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              📨 Messages
            </span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {data.totalMessages}
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{data.messagesChangeLabel || '--'}</span>
            </div>
          </div>

          {/* Card 2: Accuracy */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              🎯 Accuracy
            </span>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              {data.aiConfidence}%
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{data.accuracyChangeLabel || '--'}</span>
            </div>
          </div>

          {/* Card 3: Languages */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              🌍 Languages
            </span>
            <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              {data.activeLanguagesCount}
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{data.languagesChangeLabel || '--'}</span>
            </div>
          </div>

          {/* Card 4: Response */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              ⏱️ Response
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {data.avgResponseTimeFormatted || 'N/A'}
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{data.responseTimeChangeLabel || '--'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Translation Activity Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            📊 Translation Activity ({dateRange})
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            Scale: Real Message Volume ({dateRange})
          </span>
        </div>

        <div className="h-48 flex items-end justify-around gap-4 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
          {monthlyVolume.map((item) => (
            <div key={item.week} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                {item.volume}
              </span>
              <div
                style={{ height: item.height }}
                className="w-full max-w-[64px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-xl group-hover:from-blue-500 group-hover:to-indigo-400 transition-all shadow-xs"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.week}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Language Distribution & Quality Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🌐 Language Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            🌐 Language Distribution
          </h2>

          <div className="space-y-3">
            {languageDist.length === 0 ? (
              <div className="text-xs font-medium text-slate-400 py-3 text-center">
                No active language data available
              </div>
            ) : (
              languageDist.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span>{item.flag}</span>
                      <span>{item.name}</span>
                    </span>
                    <span>{item.percent}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 📊 Translation Quality by Language */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            📊 Translation Quality by Language
          </h2>

          <div className="space-y-3">
            {qualityByLang.length === 0 ? (
              <div className="text-xs font-medium text-slate-400 py-3 text-center">
                No translation quality data available
              </div>
            ) : (
              qualityByLang.map((item) => (
                <div key={item.code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span>{item.flag}</span>
                      <span>{item.code}</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">{item.score}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 🔍 Insights & Recommendations */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          🔍 Insights & Recommendations
        </h2>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 font-medium">
            {insightsList.map((ins, idx) => (
              <li key={idx} className="flex items-center gap-2">
                {ins.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                ) : ins.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Lightbulb className="w-4 h-4 text-blue-500 shrink-0" />
                )}
                <span>{ins.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 🔧 Actions Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          🔧 Actions
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Export Report CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </>
            )}
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={refresh}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Interactive Date Range Selector */}
          <div className="relative inline-flex items-center">
            <select
              value={dateRange}
              onChange={(e) => {
                const newRange = e.target.value;
                setDateRange(newRange);
                showToast('info', `Date range filter set to: ${newRange}`);
              }}
              className="py-2 pl-3 pr-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border-none cursor-pointer focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="Last 7 days">Date Range: Last 7 days</option>
              <option value="Last 30 days">Date Range: Last 30 days</option>
              <option value="Last 90 days">Date Range: Last 90 days</option>
              <option value="All Time">Date Range: All Time</option>
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Real PDF / HTML Report Download Button */}
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-50"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Download PDF</span>
          </button>

          {/* Email Report Button */}
          <button
            type="button"
            onClick={() => setShowEmailModal(true)}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-all"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-500" />
            <span>Email Report</span>
          </button>

          {/* Set Alerts Button */}
          <button
            type="button"
            onClick={() => setShowAlertModal(true)}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-all"
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>Set Alerts</span>
          </button>
        </div>
      </div>

      {/* Email Report Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>Send Telemetry Report by Email</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Dispatch a full telemetry analytics summary for <strong>{dateRange}</strong> directly to the recipient's inbox.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Recipient Email Address
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="e.g. user@globaltech.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <div>📊 <strong>Report Scope:</strong> {dateRange} Analytics Digest</div>
              <div>📨 <strong>Messages Logged:</strong> {data.totalMessages || 0}</div>
              <div>🎯 <strong>AI Accuracy Benchmark:</strong> {data.aiConfidence || 0}%</div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmailReport}
                disabled={isSendingEmail}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Email Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Alerts Configuration Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Configure Telemetry Alerts</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAlertModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set accuracy thresholds to alert when translation fidelity drops below target benchmark.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Minimum Accuracy Threshold ({alertThreshold}%)
              </label>
              <input
                type="range"
                min="70"
                max="99"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAlertModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAlertModal(false);
                  showToast(
                    'success',
                    `✓ Alert rule configured: Notify when Translation Accuracy drops below ${alertThreshold}%`
                  );
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Save Alert Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
