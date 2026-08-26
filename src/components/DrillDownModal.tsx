import React, { useState } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Building2, 
  DollarSign, 
  Package, 
  Layers, 
  Flag, 
  CheckCircle2, 
  Download, 
  FileText, 
  Code, 
  ArrowRight,
  ShieldCheck,
  Star,
  Info,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { MaterialItem } from '../types';
import { formatCurrency, formatPercent, formatNumber, getVarianceBadgeColor } from '../utils/formatters';

interface DrillDownModalProps {
  item: MaterialItem | null;
  onClose: () => void;
  onAcknowledge: (itemId: string) => void;
  onFlag: (item: MaterialItem) => void;
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({
  item,
  onClose,
  onAcknowledge,
  onFlag,
}) => {
  if (!item) return null;

  const [activeTab, setActiveTab] = useState<'trends' | 'volume' | 'drivers' | 'alternatives' | 'raw'>('trends');
  const badge = getVarianceBadgeColor(item.status);

  const customTooltipFormatter = (value: any, name: any) => {
    if (name === 'volume') return [`${formatNumber(value)} ${item.uom}`, 'Order Volume'];
    return [formatCurrency(Number(value)), name === 'actualCost' ? 'Actual Invoiced' : name === 'standardCost' ? 'Standard Target' : 'Market Benchmark'];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {item.sku}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300">
                  {item.category}
                </span>
                {item.reviewStatus === 'flagged' && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Flag className="w-3 h-3 fill-amber-400" />
                    Flagged for Dispute
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {item.name}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Supplier: <strong className="text-slate-200">{item.supplier}</strong>
                </span>
                <span>•</span>
                <span>UOM: <strong className="text-slate-200">{item.uom.toUpperCase()}</strong></span>
                <span>•</span>
                <span>Order Batch: <strong className="text-slate-200">{formatNumber(item.currentOrderQty)}</strong></span>
                <span>•</span>
                <span>Last Scan: <strong className="text-slate-200">{item.lastScannedAt}</strong></span>
              </div>
            </div>

            {/* Close Button */}
            <button
              id="btn-close-drilldown"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400">Baseline Standard</span>
              <p className="text-base font-extrabold text-slate-200 mt-0.5">{formatCurrency(item.standardCost)}</p>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Actual Cost</span>
              <p className={`text-base font-extrabold mt-0.5 ${item.actualCost > item.standardCost ? 'text-red-400' : 'text-emerald-400'}`}>
                {formatCurrency(item.actualCost)}
              </p>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400">Price Variance</span>
              <p className={`text-base font-extrabold mt-0.5 flex items-center gap-1 ${item.variancePercent > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {item.variancePercent > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatPercent(item.variancePercent)} ({formatCurrency(item.varianceUnit)}/unit)
              </p>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Net PPV Impact</span>
              <p className={`text-base font-extrabold mt-0.5 ${item.totalPPV > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {item.totalPPV > 0 ? `+${formatCurrency(item.totalPPV)}` : formatCurrency(item.totalPPV)}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-100 px-6 border-b border-slate-200 flex space-x-4">
          <button
            id="tab-drilldown-trends"
            onClick={() => setActiveTab('trends')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'trends'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            12-Month Price Trend vs Benchmark
          </button>
          <button
            id="tab-drilldown-volume"
            onClick={() => setActiveTab('volume')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'volume'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Order Volume & Batch History
          </button>
          <button
            id="tab-drilldown-drivers"
            onClick={() => setActiveTab('drivers')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'drivers'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Cost Driver Breakdown ({item.priceDrivers.length})
          </button>
          <button
            id="tab-drilldown-alternatives"
            onClick={() => setActiveTab('alternatives')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'alternatives'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Alternative Suppliers ({item.alternatives.length})
          </button>
          <button
            id="tab-drilldown-raw"
            onClick={() => setActiveTab('raw')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'raw'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Agent Raw Payload
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6">
          {/* Tab 1: Historical Trend Line Chart */}
          {activeTab === 'trends' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Standard Baseline vs Actual Invoiced Cost vs Market Benchmark
                  </h3>
                  <p className="text-xs text-slate-500">
                    Monthly historical cost trajectory indexed over the last 12 procurement cycles.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="w-3 h-0.5 bg-indigo-600 inline-block"></span> Actual Invoiced
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-slate-500">
                    <span className="w-3 h-0.5 bg-slate-400 inline-block border-t border-dashed"></span> Standard Target
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-amber-600">
                    <span className="w-3 h-0.5 bg-amber-500 inline-block"></span> Market Benchmark
                  </span>
                </div>
              </div>

              <div className="h-72 w-full bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={item.history} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickFormatter={(val) => `$${val}`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      formatter={customTooltipFormatter}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <ReferenceLine y={item.standardCost} stroke="#94a3b8" strokeDasharray="3 3" />
                    <Line 
                      type="monotone" 
                      dataKey="standardCost" 
                      stroke="#94a3b8" 
                      strokeWidth={2} 
                      strokeDasharray="4 4"
                      dot={false}
                      name="standardCost" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="marketBenchmark" 
                      stroke="#f59e0b" 
                      strokeWidth={2} 
                      dot={{ r: 3 }}
                      name="marketBenchmark" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actualCost" 
                      stroke={item.variancePercent > 0 ? '#ef4444' : '#10b981'} 
                      strokeWidth={3} 
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="actualCost" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Context Note */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Procurement Intelligence:</strong> This SKU has experienced continuous pricing divergence since Q1 2026. The latest unit invoice is {formatCurrency(item.actualCost)}, which is {formatPercent(item.variancePercent)} above standard contractual baseline.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Volume & Batch History */}
          {activeTab === 'volume' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Monthly Purchase Order Volume History
                </h3>
                <p className="text-xs text-slate-500">
                  Track procurement batch sizes to verify if volume discount thresholds were met.
                </p>
              </div>

              <div className="h-72 w-full bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={item.history} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => formatNumber(val)} />
                    <Tooltip 
                      formatter={customTooltipFormatter}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="volume" fill="#6366f1" radius={[4, 4, 0, 0]} name="volume" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tab 3: Cost Driver Breakdown */}
          {activeTab === 'drivers' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Identified Price Variance Cost Drivers
                </h3>
                <p className="text-xs text-slate-500">
                  Automated agent attribution analyzing commodity indices, energy, labor, and supplier margin factors.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {item.priceDrivers.map((driver, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{driver.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-extrabold ${driver.impactPercent > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {driver.impactPercent > 0 ? `+${driver.impactPercent}%` : `${driver.impactPercent}%`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{driver.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Alternative Suppliers */}
          {activeTab === 'alternatives' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Benchmarked Qualified Alternative Suppliers
                </h3>
                <p className="text-xs text-slate-500">
                  Comparing current price ({formatCurrency(item.actualCost)}) against verified secondary vendors in the master catalog.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Supplier Name</th>
                      <th className="py-2.5 px-3 text-right">Quoted Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Delta vs Current</th>
                      <th className="py-2.5 px-3 text-right">Lead Time</th>
                      <th className="py-2.5 px-3 text-right">MOQ</th>
                      <th className="py-2.5 px-3 text-center">Quality Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {item.alternatives.map((alt, idx) => {
                      const delta = alt.unitPrice - item.actualCost;
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{alt.supplierName}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(alt.unitPrice)}</td>
                          <td className="py-2.5 px-3 text-right font-semibold">
                            <span className={delta < 0 ? 'text-emerald-600' : 'text-slate-600'}>
                              {delta < 0 ? `${formatCurrency(delta)} (Save ${formatPercent(Math.abs(delta / item.actualCost) * 100, false)})` : `+${formatCurrency(delta)}`}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600">{alt.leadTimeDays} days</td>
                          <td className="py-2.5 px-3 text-right text-slate-600">{formatNumber(alt.minOrderQty)} {item.uom}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              {alt.rating.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Raw Agent Payload */}
          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Background Agent Crawl Payload Snapshot
                </h3>
                <p className="text-xs text-slate-500">
                  Raw JSON document retrieved during the last automated scrape cycle.
                </p>
              </div>

              <pre className="p-4 bg-slate-900 text-indigo-300 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800 max-h-60">
                {item.lastRawPayload || JSON.stringify(item, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Action Controls Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {item.reviewStatus === 'acknowledged' && (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Acknowledged by {item.acknowledgedBy || 'Buyer'} ({item.acknowledgedAt || 'Recently'})
              </span>
            )}
            {item.reviewStatus === 'flagged' && (
              <span className="text-amber-800 font-medium flex items-center gap-1">
                <Flag className="w-4 h-4 fill-amber-500 text-amber-600" /> Assigned to: {item.buyerAssigned || 'Procurement Team'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Acknowledge Alert Button */}
            <button
              id="btn-modal-acknowledge"
              onClick={() => {
                onAcknowledge(item.id);
                onClose();
              }}
              disabled={item.reviewStatus === 'acknowledged'}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                item.reviewStatus === 'acknowledged'
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Acknowledge Alert</span>
            </button>

            {/* Flag for Procurement Review Button */}
            <button
              id="btn-modal-flag-review"
              onClick={() => {
                onFlag(item);
                onClose();
              }}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Flag for Procurement Review</span>
            </button>

            {/* Close */}
            <button
              id="btn-modal-close-bottom"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
