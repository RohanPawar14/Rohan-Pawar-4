import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Flag, 
  CheckCircle2, 
  FileText, 
  Copy, 
  Check, 
  Eye, 
  AlertTriangle, 
  Clock, 
  User, 
  Building2, 
  Download 
} from 'lucide-react';
import { MaterialItem } from '../types';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';

interface DisputeReviewWorkflowViewProps {
  items: MaterialItem[];
  onSelectItem: (item: MaterialItem) => void;
  onResolveDispute: (itemId: string, note?: string) => void;
  onAcknowledgeItem: (itemId: string) => void;
}

export const DisputeReviewWorkflowView: React.FC<DisputeReviewWorkflowViewProps> = ({
  items,
  onSelectItem,
  onResolveDispute,
  onAcknowledgeItem,
}) => {
  const flaggedItems = items.filter(i => i.reviewStatus === 'flagged');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyNotice = (item: MaterialItem) => {
    const memo = `FORMAL DISPUTE NOTICE\nTo: ${item.supplier}\nSKU: ${item.sku}\nInvoiced: ${formatCurrency(item.actualCost)} | Baseline: ${formatCurrency(item.standardCost)}\nTotal Excess Amount: ${formatCurrency(item.totalPPV)}\nDispute Reason: ${item.disputeReason || 'Price exceed contract standard'}\nAssigned Buyer: ${item.buyerAssigned || 'Procurement Officer'}`;
    navigator.clipboard.writeText(memo);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Procurement Dispute & Commercial Review Workflow
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track materials and invoices actively flagged for supplier negotiation, credit memo demands, and contract compliance reviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800">
            {flaggedItems.length} Open Active Disputes
          </div>
          <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700">
            {formatCurrency(flaggedItems.reduce((a, b) => a + b.totalPPV, 0))} Disputed PPV
          </div>
        </div>
      </div>

      {/* Flagged Items Grid / List */}
      {flaggedItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-90" />
          <h3 className="text-base font-bold text-slate-800">All Flagged Items Reconciled</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            There are currently no active supplier disputes. When you click "Flag for Procurement Review" on any variance, it will appear here for buyer action.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {flaggedItems.map(item => (
            <div 
              key={item.id}
              className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-amber-100 text-amber-800">
                    <Flag className="w-4 h-4 fill-amber-700 text-amber-700" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{item.sku}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-100 text-red-800">
                        {item.disputePriority || 'High Priority'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{item.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500">Disputed Excess Variance:</span>
                  <p className="text-lg font-extrabold text-red-600">+{formatCurrency(item.totalPPV)}</p>
                </div>
              </div>

              {/* Dispute Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Supplier & Contract</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{item.supplier}</p>
                  <p className="text-[11px] text-slate-500">{item.contractNumber || 'Standard Master Agreement'}</p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Assigned Category Buyer</span>
                  <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-600" /> {item.buyerAssigned || 'David Chen'}
                  </p>
                  <p className="text-[11px] text-slate-500">Target Credit: {formatCurrency(item.totalPPV)}</p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Contract Discrepancy</span>
                  <p className="font-bold text-red-700 mt-0.5">
                    {formatCurrency(item.actualCost)} vs {formatCurrency(item.standardCost)} / {item.uom}
                  </p>
                  <p className="text-[11px] text-slate-500">+{formatPercent(item.variancePercent)} Inflation</p>
                </div>
              </div>

              {/* Dispute Reason & Notes */}
              <div className="text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-800">Dispute Grounds:</span>
                <p className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/80 text-amber-950 font-medium">
                  {item.disputeReason || 'Exceeds contract price cap clause'}
                </p>
                {item.reviewNotes && (
                  <p className="text-[11px] text-slate-500 pt-1">
                    <strong>Buyer Notes:</strong> {item.reviewNotes}
                  </p>
                )}
              </div>

              {/* Action Controls */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyNotice(item)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedId === item.id ? 'Notice Copied!' : 'Copy Dispute Notice'}</span>
                  </button>

                  <button
                    onClick={() => onSelectItem(item)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>View 12-Mo Trend</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onResolveDispute(item.id, 'Credit memo issued and settled.')}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Dispute Resolved / Credit Applied</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
