import React, { useState, useRef } from 'react';
import { 
  Bot, 
  Plus, 
  Play, 
  Pause, 
  Upload, 
  FileSpreadsheet, 
  Clock, 
  ShieldCheck, 
  Settings, 
  Terminal, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  Key, 
  Trash2,
  FileText
} from 'lucide-react';
import { AgentConfig, AgentScanLog, AgentFrequency, AgentProtocol, Category, StandardCostUpdateRow, MaterialItem } from '../types';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';

interface AgentConfigPanelProps {
  agents: AgentConfig[];
  logs: AgentScanLog[];
  items: MaterialItem[];
  onAddAgent: (agent: AgentConfig) => void;
  onToggleAgentStatus: (agentId: string) => void;
  onRunSingleAgent: (agentId: string) => void;
  onUpdateStandardCosts: (updates: StandardCostUpdateRow[]) => void;
  onClearLogs: () => void;
  isScanning: boolean;
}

export const AgentConfigPanel: React.FC<AgentConfigPanelProps> = ({
  agents,
  logs,
  items,
  onAddAgent,
  onToggleAgentStatus,
  onRunSingleAgent,
  onUpdateStandardCosts,
  onClearLogs,
  isScanning,
}) => {
  // Modal state for adding new agent
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newTargetUrl, setNewTargetUrl] = useState('');
  const [newProtocol, setNewProtocol] = useState<AgentProtocol>('rest_api');
  const [newFrequency, setNewFrequency] = useState<AgentFrequency>('1h');
  const [newThreshold, setNewThreshold] = useState<number>(3.0);
  const [newAuthType, setNewAuthType] = useState<AgentConfig['authType']>('API Key');
  const [newCategory, setNewCategory] = useState<Category | 'All Categories'>('Electronic Components');

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<StandardCostUpdateRow[]>([]);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newSupplierName.trim()) return;

    const newAgent: AgentConfig = {
      id: `agent-${Date.now()}`,
      name: newAgentName.trim(),
      supplierName: newSupplierName.trim(),
      targetUrl: newTargetUrl.trim() || 'https://api.supplier-portal.com/v2/pricing',
      protocol: newProtocol,
      frequency: newFrequency,
      alertThresholdPercent: Number(newThreshold) || 3.0,
      status: 'active',
      lastRun: 'Scheduled to start',
      nextRun: `in ${newFrequency}`,
      itemsTrackedCount: Math.floor(Math.random() * 40) + 10,
      totalVarianceSum: 0,
      successRate: 100.0,
      authType: newAuthType,
      targetCategory: newCategory
    };

    onAddAgent(newAgent);
    setShowAddModal(false);
    // Reset form
    setNewAgentName('');
    setNewSupplierName('');
    setNewTargetUrl('');
  };

  // Handle Standard Cost Baseline CSV upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length <= 1) return;

      // Skip header line
      const parsed: StandardCostUpdateRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2) {
          const sku = parts[0];
          const standardCost = parseFloat(parts[1]);
          const effectiveDate = parts[2] || new Date().toISOString().split('T')[0];
          const notes = parts[3] || 'Uploaded via Standard Cost Sheet';

          if (sku && !isNaN(standardCost)) {
            parsed.push({ sku, standardCost, effectiveDate, notes });
          }
        }
      }

      setParsedRows(parsed);
      setUploadSuccessMessage(`Successfully parsed ${parsed.length} SKU baseline cost rows.`);
    };

    reader.readAsText(file);
  };

  const handleApplyUploadedBaseline = () => {
    if (parsedRows.length === 0) return;
    onUpdateStandardCosts(parsedRows);
    setUploadSuccessMessage(`Applied baseline updates to ${parsedRows.length} items! PPVs recalculated.`);
    setParsedRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadSampleTemplate = () => {
    const sampleHeaders = 'SKU,StandardCost,EffectiveDate,Notes\n';
    const sampleRows = items.slice(0, 5).map(item => 
      `"${item.sku}",${item.standardCost},"${new Date().toISOString().split('T')[0]}","Q3 Annual Standard Budget Baseline"`
    ).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(sampleHeaders + sampleRows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'Standard_Cost_Baseline_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Fleet Health */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Background Agent Fleet & Ingestion Pipelines
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Configure autonomous background bots that scrape supplier portals, parse EDI 810 invoices, query ERP price books, and verify invoices against contractual standard baseline costs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-add-new-agent"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Configure New Agent</span>
            </button>
          </div>
        </div>

        {/* Fleet Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Configured Agents</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{agents.length} Bots</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Active Scrapers</span>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">
              {agents.filter(a => a.status === 'active').length} Active
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Tracked SKUs</span>
            <p className="text-xl font-bold text-indigo-600 mt-0.5">
              {agents.reduce((acc, a) => acc + a.itemsTrackedCount, 0)} Materials
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Average Bot SLA</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">99.6% Success</p>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(agent => {
          const isActive = agent.status === 'active';
          return (
            <div 
              key={agent.id} 
              id={`card-agent-${agent.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 line-clamp-1" title={agent.name}>
                        {agent.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">{agent.supplierName}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Protocol:</span>
                    <span className="font-mono font-bold text-slate-700 uppercase">{agent.protocol}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Crawl Frequency:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Every {agent.frequency}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Variance Threshold:</span>
                    <span className="font-semibold text-red-600">
                      &gt; ±{agent.alertThresholdPercent}% PPV
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Auth Method:</span>
                    <span className="text-slate-700 flex items-center gap-1">
                      <Key className="w-3 h-3 text-slate-400" /> {agent.authType}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Last Run: {agent.lastRun}</span>
                    <span className="text-indigo-600 font-medium">{agent.itemsTrackedCount} SKUs</span>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  id={`btn-toggle-agent-${agent.id}`}
                  onClick={() => onToggleAgentStatus(agent.id)}
                  className={`text-xs font-semibold flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                    isActive 
                      ? 'text-slate-600 hover:bg-slate-100' 
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{isActive ? 'Pause Agent' : 'Resume Agent'}</span>
                </button>

                <button
                  id={`btn-run-agent-${agent.id}`}
                  onClick={() => onRunSingleAgent(agent.id)}
                  disabled={isScanning}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>Crawl Now</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Standard Cost Baseline Sheet Upload Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Standard Cost Baseline Sheet Upload
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Upload your annual procurement target budget sheets (CSV) to update contractual standard baseline costs across all items and recalculate PPV.
            </p>
          </div>

          <button
            id="btn-download-template"
            onClick={handleDownloadSampleTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors text-center">
          <input
            id="input-baseline-file"
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.txt"
            className="hidden"
          />
          <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-800">
            {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Drag & drop Standard Baseline CSV, or browse files'}
          </h4>
          <p className="text-[11px] text-slate-400 mt-1">
            Expected columns: SKU, StandardCost, EffectiveDate, Notes
          </p>
          <div className="mt-3">
            <button
              id="btn-browse-file"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 shadow-sm"
            >
              Browse CSV File
            </button>
          </div>
        </div>

        {/* Preview of Parsed Rows */}
        {parsedRows.length > 0 && (
          <div className="mt-4 p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-950">
                  Ready to apply {parsedRows.length} Standard Cost updates
                </span>
              </div>
              <button
                id="btn-apply-baseline-updates"
                onClick={handleApplyUploadedBaseline}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                Apply Updates & Recalculate PPV
              </button>
            </div>

            <div className="overflow-x-auto max-h-48 border border-indigo-100 rounded-lg bg-white">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-[10px]">
                  <tr>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3 text-right">New Standard Cost ($)</th>
                    <th className="py-2 px-3">Effective Date</th>
                    <th className="py-2 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-mono font-bold text-slate-800">{row.sku}</td>
                      <td className="py-1.5 px-3 text-right font-bold text-indigo-700">{formatCurrency(row.standardCost)}</td>
                      <td className="py-1.5 px-3 text-slate-600">{row.effectiveDate}</td>
                      <td className="py-1.5 px-3 text-slate-500 text-[11px]">{row.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {uploadSuccessMessage && !parsedRows.length && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{uploadSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Live Agent Scan Execution Logs Terminal */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Live Background Agent Execution Terminal
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Ingestion Stream Active
            </span>
            <button
              id="btn-clear-logs"
              onClick={onClearLogs}
              className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded hover:bg-slate-800"
            >
              Clear Logs
            </button>
          </div>
        </div>

        <div className="space-y-2 font-mono text-xs max-h-64 overflow-y-auto pr-2">
          {logs.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No recent crawler activity logs recorded.</p>
          ) : (
            logs.map(log => (
              <div 
                key={log.id} 
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      log.status === 'warning' ? 'bg-amber-400' : log.status === 'failure' ? 'bg-red-500' : 'bg-emerald-400'
                    }`} />
                    <strong className="text-indigo-300">{log.agentName}</strong>
                  </div>
                  <span className="text-slate-500 text-[10px]">{log.timestamp} ({log.durationMs}ms)</span>
                </div>
                <p className="text-slate-300 text-[11px] pl-4">{log.message}</p>
                {log.rawSnippet && (
                  <div className="mt-1 pl-4 text-[10px] text-slate-500">
                    <code>{log.rawSnippet}</code>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Create New Agent */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Configure New Background Agent</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAgent} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Agent Name *</label>
                <input
                  id="input-new-agent-name"
                  type="text"
                  required
                  placeholder="e.g., Texas Instruments Price Book Scraper"
                  value={newAgentName}
                  onChange={e => setNewAgentName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Supplier / Vendor *</label>
                <input
                  id="input-new-agent-supplier"
                  type="text"
                  required
                  placeholder="e.g., Texas Instruments / Avnet"
                  value={newSupplierName}
                  onChange={e => setNewSupplierName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Protocol / Source</label>
                  <select
                    id="select-new-agent-protocol"
                    value={newProtocol}
                    onChange={e => setNewProtocol(e.target.value as AgentProtocol)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="rest_api">REST API Endpoint</option>
                    <option value="web_portal">Web Portal Web-Scraper</option>
                    <option value="edi_810">EDI 810 Invoicing SFTP</option>
                    <option value="erp_sap">SAP ERP PO Line Listener</option>
                    <option value="pdf_invoice">PDF Invoice Ingestion (OCR)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Crawl Frequency</label>
                  <select
                    id="select-new-agent-frequency"
                    value={newFrequency}
                    onChange={e => setNewFrequency(e.target.value as AgentFrequency)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="15m">Every 15 Minutes</option>
                    <option value="1h">Hourly</option>
                    <option value="6h">Every 6 Hours</option>
                    <option value="24h">Daily (24 Hours)</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Endpoint URL / Host</label>
                <input
                  id="input-new-agent-url"
                  type="text"
                  placeholder="https://api.supplier.com/pricing/feed"
                  value={newTargetUrl}
                  onChange={e => setNewTargetUrl(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alert Threshold (%)</label>
                  <input
                    id="input-new-agent-threshold"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="50"
                    value={newThreshold}
                    onChange={e => setNewThreshold(parseFloat(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Trigger alert if variance exceeds this %</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Authentication Method</label>
                  <select
                    id="select-new-agent-auth"
                    value={newAuthType}
                    onChange={e => setNewAuthType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="API Key">API Key</option>
                    <option value="OAuth2">OAuth 2.0</option>
                    <option value="Portal Credentials">Portal Credentials</option>
                    <option value="EDI SFTP">EDI SFTP Key</option>
                    <option value="Session Cookie">Session Cookie</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-new-agent"
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Deploy Background Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
