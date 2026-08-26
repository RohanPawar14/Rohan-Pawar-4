import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  TrendingDown, 
  CheckCircle2, 
  CheckCheck, 
  Flag, 
  LineChart, 
  Filter, 
  Clock, 
  ExternalLink,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { VarianceAlert, MaterialItem } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface AlertNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: VarianceAlert[];
  items: MaterialItem[];
  onAcknowledgeAlert: (alertId: string, itemId: string) => void;
  onAcknowledgeAll: () => void;
  onSelectMaterial: (item: MaterialItem) => void;
  onFlagItem: (item: MaterialItem) => void;
}

export const AlertNotificationCenter: React.FC<AlertNotificationCenterProps> = ({
  isOpen,
  onClose,
  alerts,
  items,
  onAcknowledgeAlert,
  onAcknowledgeAll,
  onSelectMaterial,
  onFlagItem,
}) => {
  if (!isOpen) return null;

  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'positive' | 'unacknowledged'>('all');

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity === 'critical') return alert.severity === 'critical';
    if (filterSeverity === 'positive') return alert.severity === 'positive';
    if (filterSeverity === 'unacknowledged') return !alert.isAcknowledged;
    return true;
  });

  const unacknowledgedCount = alerts.filter(a => !a.isAcknowledged).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Price Variance Alert Center</h3>
                {unacknowledgedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white">
                    {unacknowledgedCount} Pending
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Real-time trigger alerts for negative price spikes and positive discounts
              </p>
            </div>
          </div>

          <button
            id="btn-close-alert-center"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills & Actions Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1 overflow-x-auto">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                filterSeverity === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                filterSeverity === 'critical'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-red-700 hover:bg-red-50 border border-red-200'
              }`}
            >
              Price Spikes
            </button>
            <button
              onClick={() => setFilterSeverity('positive')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                filterSeverity === 'positive'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              Savings
            </button>
            <button
              onClick={() => setFilterSeverity('unacknowledged')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                filterSeverity === 'unacknowledged'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
              }`}
            >
              Unread ({unacknowledgedCount})
            </button>
          </div>

          {unacknowledgedCount > 0 && (
            <button
              id="btn-ack-all-alerts"
              onClick={onAcknowledgeAll}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 shrink-0"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Acknowledge All</span>
            </button>
          )}
        </div>

        {/* Alert List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-slate-700 text-xs">No alerts in this category</p>
              <p className="text-[11px] text-slate-400">All price variances are reconciled or acknowledged.</p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const matchedItem = items.find(i => i.id === alert.itemId);
              const isPositive = alert.severity === 'positive';
              const isCritical = alert.severity === 'critical';

              return (
                <div 
                  key={alert.id}
                  id={`alert-card-${alert.id}`}
                  className={`pt-3 first:pt-0 rounded-xl p-3 border transition-all ${
                    alert.isAcknowledged 
                      ? 'bg-slate-50/70 border-slate-200 opacity-75' 
                      : isPositive 
                        ? 'bg-emerald-50/40 border-emerald-200' 
                        : isCritical 
                          ? 'bg-red-50/50 border-red-200' 
                          : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  {/* Alert Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        isPositive 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : isCritical 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isPositive ? <TrendingDown className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>

                      <div>
                        <span className="font-mono text-xs font-bold text-slate-900">{alert.sku}</span>
                        <p className="text-[11px] text-slate-500">{alert.supplier}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-extrabold ${
                        isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isPositive ? `${formatPercent(alert.variancePercent)} PPV` : `+${formatPercent(alert.variancePercent)} Spike`}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{alert.timestamp}</p>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="mt-2 text-xs text-slate-700">
                    <p className="font-medium text-slate-800">{alert.itemName}</p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600 bg-white/80 p-2 rounded-lg border border-slate-100">
                      <span>Total PPV Impact: <strong className={isPositive ? 'text-emerald-700' : 'text-red-700'}>{formatCurrency(alert.totalPPV)}</strong></span>
                      <span>Variance: <strong>{formatCurrency(alert.varianceUnit)}/unit</strong></span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      {alert.isAcknowledged ? (
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Acknowledged
                        </span>
                      ) : (
                        <span className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span> Action Required
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Acknowledge Button */}
                      {!alert.isAcknowledged && (
                        <button
                          id={`btn-ack-alert-${alert.id}`}
                          onClick={() => onAcknowledgeAlert(alert.id, alert.itemId)}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Acknowledge</span>
                        </button>
                      )}

                      {/* Flag for Procurement Review */}
                      {matchedItem && (
                        <button
                          id={`btn-alert-flag-${alert.id}`}
                          onClick={() => {
                            onFlagItem(matchedItem);
                            onClose();
                          }}
                          className="px-2 py-1 bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Flag for Procurement Dispute"
                        >
                          <Flag className="w-3 h-3" />
                          <span>Flag</span>
                        </button>
                      )}

                      {/* View Item Drilldown */}
                      {matchedItem && (
                        <button
                          id={`btn-alert-drilldown-${alert.id}`}
                          onClick={() => {
                            onSelectMaterial(matchedItem);
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <LineChart className="w-3 h-3" />
                          <span>Drill-Down</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Alert notifications refreshed on every crawl cycle</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
