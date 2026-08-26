import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Bot, 
  ShieldCheck 
} from 'lucide-react';
import { MaterialItem, AgentConfig } from '../types';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';

interface KPISummaryProps {
  items: MaterialItem[];
  agents: AgentConfig[];
  onFilterByStatus?: (status: string) => void;
}

export const KPISummary: React.FC<KPISummaryProps> = ({ items, agents, onFilterByStatus }) => {
  // Aggregate Calculations
  const totalSpendStandard = items.reduce((acc, item) => acc + (item.standardCost * item.currentOrderQty), 0);
  const totalSpendActual = items.reduce((acc, item) => acc + (item.actualCost * item.currentOrderQty), 0);
  const netPPV = totalSpendActual - totalSpendStandard;
  const netPPVPercent = totalSpendStandard > 0 ? (netPPV / totalSpendStandard) * 100 : 0;

  // Unfavorable vs Favorable
  const unfavorableItems = items.filter(i => i.totalPPV > 0);
  const unfavorableSum = unfavorableItems.reduce((acc, item) => acc + item.totalPPV, 0);
  
  const favorableItems = items.filter(i => i.totalPPV < 0);
  const favorableSum = favorableItems.reduce((acc, item) => acc + Math.abs(item.totalPPV), 0);

  const criticalSpikes = items.filter(i => i.status === 'unfavorable_critical');
  const warningSpikes = items.filter(i => i.status === 'unfavorable_warning');
  const favorableCount = favorableItems.length;

  const activeAgents = agents.filter(a => a.status === 'active');
  const avgSLA = agents.length > 0 ? (agents.reduce((acc, a) => acc + a.successRate, 0) / agents.length).toFixed(1) : '99.5';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* 1. Net Purchase Price Variance (PPV) */}
      <div 
        id="kpi-net-ppv" 
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Net PPV Variance
          </span>
          <div className={`p-1.5 rounded-lg ${netPPV > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {netPPV > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${netPPV > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {netPPV > 0 ? `+${formatCurrency(netPPV)}` : formatCurrency(netPPV)}
            </span>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${netPPV > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {formatPercent(netPPVPercent)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Actual: {formatCurrency(totalSpendActual)} vs Std: {formatCurrency(totalSpendStandard)}
          </p>
        </div>
        <div className={`h-1 w-full mt-3 rounded-full ${netPPV > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
      </div>

      {/* 2. Unfavorable Cost Spikes */}
      <div 
        id="kpi-unfavorable-spikes" 
        onClick={() => onFilterByStatus && onFilterByStatus('unfavorable')}
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between cursor-pointer hover:border-red-300 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Price Spikes Impact
          </span>
          <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-red-600">
              +{formatCurrency(unfavorableSum)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-red-600"></span>
            <span className="font-semibold text-red-700">{criticalSpikes.length} Critical</span>
            <span className="text-slate-400">/</span>
            <span>{warningSpikes.length} Warnings</span>
          </p>
        </div>
        <div className="h-1 w-full mt-3 rounded-full bg-red-200">
          <div className="h-full bg-red-600 rounded-full" style={{ width: '85%' }} />
        </div>
      </div>

      {/* 3. Favorable Cost Savings */}
      <div 
        id="kpi-favorable-savings" 
        onClick={() => onFilterByStatus && onFilterByStatus('favorable')}
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Captured PPV Savings
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600">
              -{formatCurrency(favorableSum)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            <span className="font-semibold text-emerald-700">{favorableCount} Lines</span> below standard target
          </p>
        </div>
        <div className="h-1 w-full mt-3 rounded-full bg-emerald-200">
          <div className="h-full bg-emerald-600 rounded-full" style={{ width: '65%' }} />
        </div>
      </div>

      {/* 4. Total Tracked Spend */}
      <div 
        id="kpi-total-spend" 
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tracked PO Volume
          </span>
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-800">
              {formatCurrency(totalSpendActual, 'USD', 0)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {items.length} materials & 8 suppliers
          </p>
        </div>
        <div className="h-1 w-full mt-3 rounded-full bg-slate-200" />
      </div>

      {/* 5. Agent Fleet Health */}
      <div 
        id="kpi-agent-health" 
        className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5" />
            Agent Fleet Status
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            {avgSLA}% SLA
          </span>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">
              {activeAgents.length} / {agents.length}
            </span>
            <span className="text-xs text-slate-400">Active Bots</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Scanning every 15m - 24h</span>
          </p>
        </div>
        <div className="h-1 w-full mt-3 rounded-full bg-slate-800">
          <div className="h-full bg-indigo-500 rounded-full" style={{ width: '92%' }} />
        </div>
      </div>
    </div>
  );
};
