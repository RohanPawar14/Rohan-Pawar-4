import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';
import { MaterialItem } from '../types';
import { exportToCSV, formatCurrency, formatPercent, formatNumber } from '../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MaterialItem[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  items,
}) => {
  if (!isOpen) return null;

  const [exportType, setExportType] = useState<'csv_full' | 'csv_unfavorable' | 'csv_favorable' | 'summary_view'>('csv_full');
  const [downloaded, setDownloaded] = useState(false);

  // Aggregates
  const totalStandard = items.reduce((acc, i) => acc + i.standardCost * i.currentOrderQty, 0);
  const totalActual = items.reduce((acc, i) => acc + i.actualCost * i.currentOrderQty, 0);
  const netPPV = totalActual - totalStandard;
  const unfavorableItems = items.filter(i => i.totalPPV > 0);
  const favorableItems = items.filter(i => i.totalPPV < 0);

  const handleExecuteExport = () => {
    let dataset = items;
    let filename = `supplier-price-variance-full-${new Date().toISOString().split('T')[0]}.csv`;

    if (exportType === 'csv_unfavorable') {
      dataset = unfavorableItems;
      filename = `supplier-price-spikes-unfavorable-${new Date().toISOString().split('T')[0]}.csv`;
    } else if (exportType === 'csv_favorable') {
      dataset = favorableItems;
      filename = `supplier-ppv-cost-savings-${new Date().toISOString().split('T')[0]}.csv`;
    }

    exportToCSV(dataset, filename);
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      onClose();
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Export Variance & PPV Report</h3>
              <p className="text-[11px] text-slate-400">
                Generate audit-ready procurement data extracts and executive summary memos
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4 text-xs">
          <div className="space-y-2.5">
            <label className="block font-bold text-slate-800">Select Export Format</label>

            {/* Option 1: Full CSV */}
            <div 
              onClick={() => setExportType('csv_full')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                exportType === 'csv_full'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <div>
                  <span className="font-bold text-slate-900">Complete Master Variance Sheet (CSV)</span>
                  <p className="text-[11px] text-slate-500">
                    All {items.length} materials with standard cost, actual cost, unit variance, and PPV
                  </p>
                </div>
              </div>
              <input
                type="radio"
                name="exportType"
                checked={exportType === 'csv_full'}
                onChange={() => setExportType('csv_full')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            {/* Option 2: Unfavorable Spikes only */}
            <div 
              onClick={() => setExportType('csv_unfavorable')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                exportType === 'csv_unfavorable'
                  ? 'border-red-600 bg-red-50/50 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <div>
                  <span className="font-bold text-slate-900">Unfavorable Price Spikes Report (CSV)</span>
                  <p className="text-[11px] text-slate-500">
                    {unfavorableItems.length} materials with cost increases (+{formatCurrency(unfavorableItems.reduce((a, b) => a + b.totalPPV, 0))})
                  </p>
                </div>
              </div>
              <input
                type="radio"
                name="exportType"
                checked={exportType === 'csv_unfavorable'}
                onChange={() => setExportType('csv_unfavorable')}
                className="text-red-600 focus:ring-red-500"
              />
            </div>

            {/* Option 3: Favorable Savings only */}
            <div 
              onClick={() => setExportType('csv_favorable')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                exportType === 'csv_favorable'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-900">Realized PPV Cost Savings Report (CSV)</span>
                  <p className="text-[11px] text-slate-500">
                    {favorableItems.length} materials below contractual baseline (-{formatCurrency(favorableItems.reduce((a, b) => a + Math.abs(b.totalPPV), 0))})
                  </p>
                </div>
              </div>
              <input
                type="radio"
                name="exportType"
                checked={exportType === 'csv_favorable'}
                onChange={() => setExportType('csv_favorable')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quick Summary Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Total Tracked Spend:</span>
              <strong className="text-slate-900">{formatCurrency(totalActual)}</strong>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Net Purchase Price Variance:</span>
              <strong className={netPPV > 0 ? 'text-red-600' : 'text-emerald-600'}>
                {netPPV > 0 ? `+${formatCurrency(netPPV)}` : formatCurrency(netPPV)}
              </strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
          >
            Cancel
          </button>

          <button
            id="btn-confirm-export"
            onClick={handleExecuteExport}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            {downloaded ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Report File</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
