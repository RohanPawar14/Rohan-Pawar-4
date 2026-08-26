import React, { useState } from 'react';
import { 
  X, 
  Flag, 
  ShieldAlert, 
  Building2, 
  Calendar, 
  User, 
  FileText, 
  Copy, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { MaterialItem } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface ProcurementReviewModalProps {
  item: MaterialItem | null;
  onClose: () => void;
  onSubmitDispute: (
    itemId: string,
    reason: string,
    priority: 'low' | 'medium' | 'high' | 'urgent',
    assignedBuyer: string,
    notes: string
  ) => void;
}

export const ProcurementReviewModal: React.FC<ProcurementReviewModalProps> = ({
  item,
  onClose,
  onSubmitDispute,
}) => {
  if (!item) return null;

  const [reason, setReason] = useState(item.disputeReason || 'Exceeds contractual price cap clause');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>(item.disputePriority || 'high');
  const [assignedBuyer, setAssignedBuyer] = useState(item.buyerAssigned || 'David Chen (Metals Category Director)');
  const [notes, setNotes] = useState(item.reviewNotes || '');
  const [copiedMemo, setCopiedMemo] = useState(false);

  const generatedMemo = `FORMAL PROCUREMENT PRICE DISPUTE NOTICE
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
To: Accounts Receivable & Commercial Sales, ${item.supplier}
From: Global Strategic Sourcing & Procurement Office
Reference Contract: ${item.contractNumber || 'Master Supply Agreement FY26'}
Invoice Ref: ${item.invoiceNumber || 'Pending Invoice Reconciliation'}

MATERIAL DETAILS:
- SKU / Part Number: ${item.sku}
- Description: ${item.name}
- Invoiced Unit Cost: ${formatCurrency(item.actualCost)}
- Contract Baseline Standard: ${formatCurrency(item.standardCost)}
- Discrepancy / Variance: +${formatCurrency(item.varianceUnit)} (${formatPercent(item.variancePercent)})
- Batch Order Volume: ${item.currentOrderQty} ${item.uom}
- Total Disputed Excess Amount: ${formatCurrency(item.totalPPV)}

DISPUTE REASON:
${reason}

ACTION REQUIRED:
Please issue an amended credit memo for the total variance of ${formatCurrency(item.totalPPV)} within five (5) business days or contact assigned buyer ${assignedBuyer}.`;

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(generatedMemo);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitDispute(item.id, reason, priority, assignedBuyer, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Flag className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Flag for Procurement Dispute & Review</h3>
              <p className="text-[11px] text-slate-400">
                Assign a category buyer to challenge supplier cost spike and generate commercial dispute notice
              </p>
            </div>
          </div>

          <button
            id="btn-close-review-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Summary Banner */}
        <div className="p-4 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between text-xs">
          <div>
            <span className="font-mono font-bold text-slate-900">{item.sku}</span>
            <p className="text-slate-600 font-medium">{item.name}</p>
            <span className="text-[11px] text-slate-500">Supplier: <strong>{item.supplier}</strong></span>
          </div>

          <div className="text-right">
            <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-red-100 text-red-800">
              +{formatPercent(item.variancePercent)} Spike
            </span>
            <p className="text-xs font-bold text-red-700 mt-1">
              Excess PPV: +{formatCurrency(item.totalPPV)}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Dispute Reason / Justification *
              </label>
              <select
                id="select-dispute-reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Exceeds contractual price cap clause">Exceeds contractual price cap clause</option>
                <option value="Unapproved energy or raw material surcharge">Unapproved energy or raw material surcharge</option>
                <option value="Volume tier discount not applied by vendor">Volume tier discount not applied by vendor</option>
                <option value="Currency index discrepancy (FX mismatch)">Currency index discrepancy (FX mismatch)</option>
                <option value="Unauthorized distributor spot markup">Unauthorized distributor spot markup</option>
                <option value="Freight fuel surcharge calculation error">Freight fuel surcharge calculation error</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Dispute Priority Level *
              </label>
              <select
                id="select-dispute-priority"
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="urgent">🔴 Urgent (Immediate PO Hold)</option>
                <option value="high">🟠 High (Resolve before Invoice Pay)</option>
                <option value="medium">🟡 Medium (Quarterly Supplier Review)</option>
                <option value="low">🟢 Low (Informational Log)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Assigned Category Buyer / Procurement Officer *
            </label>
            <select
              id="select-assigned-buyer"
              value={assignedBuyer}
              onChange={e => setAssignedBuyer(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="Sarah Jenkins (Lead Electronics Buyer)">Sarah Jenkins (Lead Electronics Buyer)</option>
              <option value="David Chen (Metals Category Director)">David Chen (Metals Category Director)</option>
              <option value="Elena Rostova (Chemicals Specialist)">Elena Rostova (Chemicals Specialist)</option>
              <option value="Mark Sterling (Packaging Specialist)">Mark Sterling (Packaging Specialist)</option>
              <option value="Jason Vance (Head of Global Logistics)">Jason Vance (Head of Global Logistics)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Internal Review Notes & Instructions
            </label>
            <textarea
              id="textarea-review-notes"
              rows={2}
              placeholder="Add specific notes on contract clause, phone log with supplier rep, or target credit amount..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs"
            />
          </div>

          {/* Supplier Dispute Memo Preview */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Auto-Generated Supplier Dispute Notice Memo
              </span>
              <button
                id="btn-copy-dispute-memo"
                type="button"
                onClick={handleCopyMemo}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMemo ? 'Copied to Clipboard!' : 'Copy Notice Text'}</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-[11px] font-mono whitespace-pre-wrap max-h-36 overflow-y-auto border border-slate-800">
              {generatedMemo}
            </pre>
          </div>

          {/* Actions Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              id="btn-submit-dispute-flag"
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Flag className="w-4 h-4 fill-white" />
              <span>Flag Item & Assign Dispute</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
