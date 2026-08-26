import React from 'react';
import { 
  Activity, 
  Bell, 
  Bot, 
  Download, 
  Layers, 
  Play, 
  RefreshCw, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import { VarianceAlert, AgentConfig } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'agents' | 'analytics' | 'disputes';
  setActiveTab: (tab: 'dashboard' | 'agents' | 'analytics' | 'disputes') => void;
  alerts: VarianceAlert[];
  onOpenAlerts: () => void;
  onOpenExport: () => void;
  onRunAgentScan: () => void;
  isScanning: boolean;
  agents: AgentConfig[];
  flaggedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  alerts,
  onOpenAlerts,
  onOpenExport,
  onRunAgentScan,
  isScanning,
  agents,
  flaggedCount,
}) => {
  const unacknowledgedCount = alerts.filter(a => !a.isAcknowledged).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.isAcknowledged).length;
  const activeAgentsCount = agents.filter(a => a.status === 'active').length;

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top Banner / System Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-inner text-white font-bold tracking-wider text-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Supplier Price Variance Monitor
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                  PPV Sentinel
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {activeAgentsCount} Background Agents Live
                </span>
                <span className="text-slate-600">•</span>
                <span>Automated Price Scraper & Invoice Parser</span>
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Live Scan Trigger */}
            <button
              id="btn-run-agent-crawl"
              onClick={onRunAgentScan}
              disabled={isScanning}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                isScanning 
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 border border-indigo-500'
              }`}
              title="Trigger all background agents to crawl supplier feeds & invoices now"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-300" />
                  <span>Crawling Feeds...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Agent Crawl</span>
                </>
              )}
            </button>

            {/* Export Variance Report */}
            <button
              id="btn-export-report-top"
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Report</span>
            </button>

            {/* Alert Center Trigger */}
            <button
              id="btn-alert-center-toggle"
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Open Price Variance Alert Center"
            >
              <Bell className="w-4 h-4" />
              {unacknowledgedCount > 0 && (
                <span className={`absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ${
                  criticalCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                }`}>
                  {unacknowledgedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 backdrop-blur px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-4 overflow-x-auto py-1">
          <button
            id="tab-variance-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Variance Dashboard (PPV)</span>
          </button>

          <button
            id="tab-agent-configuration"
            onClick={() => setActiveTab('agents')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              activeTab === 'agents'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span>Agent Fleet & Baseline Config</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              {agents.length}
            </span>
          </button>

          <button
            id="tab-historical-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Historical Cost Trends</span>
          </button>

          <button
            id="tab-disputes-reviews"
            onClick={() => setActiveTab('disputes')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              activeTab === 'disputes'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Procurement Disputes & Reviews</span>
            {flaggedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {flaggedCount} Flagged
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
