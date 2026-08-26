import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { KPISummary } from './components/KPISummary';
import { VarianceDashboard } from './components/VarianceDashboard';
import { DrillDownModal } from './components/DrillDownModal';
import { AgentConfigPanel } from './components/AgentConfigPanel';
import { AlertNotificationCenter } from './components/AlertNotificationCenter';
import { ProcurementReviewModal } from './components/ProcurementReviewModal';
import { ExportModal } from './components/ExportModal';
import { HistoricalAnalyticsView } from './components/HistoricalAnalyticsView';
import { DisputeReviewWorkflowView } from './components/DisputeReviewWorkflowView';

import { 
  INITIAL_ITEMS, 
  INITIAL_AGENTS, 
  INITIAL_ALERTS, 
  INITIAL_LOGS 
} from './mockData';
import { 
  MaterialItem, 
  AgentConfig, 
  AgentScanLog, 
  VarianceAlert, 
  StandardCostUpdateRow 
} from './types';
import { calculatePPV, exportToCSV } from './utils/formatters';
import { CheckCircle2, AlertTriangle, Sparkles, RefreshCw, X } from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agents' | 'analytics' | 'disputes'>('dashboard');
  const [filterPreset, setFilterPreset] = useState<string>('All');

  // Core Data State
  const [items, setItems] = useState<MaterialItem[]>(() => {
    const saved = localStorage.getItem('spv_items_data_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ITEMS;
      }
    }
    return INITIAL_ITEMS;
  });

  const [agents, setAgents] = useState<AgentConfig[]>(() => {
    const saved = localStorage.getItem('spv_agents_data_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_AGENTS;
      }
    }
    return INITIAL_AGENTS;
  });

  const [alerts, setAlerts] = useState<VarianceAlert[]>(() => {
    const saved = localStorage.getItem('spv_alerts_data_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ALERTS;
      }
    }
    return INITIAL_ALERTS;
  });

  const [logs, setLogs] = useState<AgentScanLog[]>(() => {
    const saved = localStorage.getItem('spv_logs_data_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_LOGS;
      }
    }
    return INITIAL_LOGS;
  });

  // Modal & Slide-over States
  const [selectedItem, setSelectedItem] = useState<MaterialItem | null>(null);
  const [flaggingItem, setFlaggingItem] = useState<MaterialItem | null>(null);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Toast Notification Feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Sync to LocalStorage for persistence
  useEffect(() => {
    localStorage.setItem('spv_items_data_v1', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('spv_agents_data_v1', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem('spv_alerts_data_v1', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('spv_logs_data_v1', JSON.stringify(logs));
  }, [logs]);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // 1. Acknowledge Alert & Item
  const handleAcknowledgeItem = (itemId: string) => {
    const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          reviewStatus: 'acknowledged',
          acknowledgedBy: 'Current Procurement Lead',
          acknowledgedAt: now
        };
      }
      return item;
    }));

    setAlerts(prev => prev.map(alert => {
      if (alert.itemId === itemId) {
        return { ...alert, isAcknowledged: true, acknowledgedAt: now };
      }
      return alert;
    }));

    showToast('Variance alert acknowledged successfully.', 'success');
  };

  const handleAcknowledgeAlert = (alertId: string, itemId: string) => {
    handleAcknowledgeItem(itemId);
  };

  const handleAcknowledgeAll = () => {
    const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    setItems(prev => prev.map(i => ({ ...i, reviewStatus: 'acknowledged', acknowledgedAt: now })));
    setAlerts(prev => prev.map(a => ({ ...a, isAcknowledged: true, acknowledgedAt: now })));
    showToast('All active alerts acknowledged.', 'success');
  };

  // 2. Flag for Procurement Review
  const handleFlagItem = (item: MaterialItem) => {
    setFlaggingItem(item);
  };

  const handleSubmitDispute = (
    itemId: string,
    reason: string,
    priority: 'low' | 'medium' | 'high' | 'urgent',
    assignedBuyer: string,
    notes: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          reviewStatus: 'flagged',
          disputeReason: reason,
          disputePriority: priority,
          buyerAssigned: assignedBuyer,
          disputeDate: today,
          reviewNotes: notes
        };
      }
      return item;
    }));

    // Update alert if exists
    setAlerts(prev => prev.map(a => {
      if (a.itemId === itemId) {
        return { ...a, isRead: true };
      }
      return a;
    }));

    showToast(`Flagged ${itemId} for dispute review assigned to ${assignedBuyer.split(' ')[0]}.`, 'warning');
  };

  // 3. Mark Dispute Resolved / Reconciled
  const handleResolveDispute = (itemId: string, note?: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          reviewStatus: 'reconciled',
          reviewNotes: note || 'Dispute resolved with supplier credit memo.'
        };
      }
      return item;
    }));
    showToast('Dispute marked as reconciled and resolved.', 'success');
  };

  // 4. Background Agent Actions
  const handleAddAgent = (newAgent: AgentConfig) => {
    setAgents(prev => [newAgent, ...prev]);
    const newLog: AgentScanLog = {
      id: `log-${Date.now()}`,
      agentId: newAgent.id,
      agentName: newAgent.name,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'success',
      itemsScanned: 0,
      variancesDetected: 0,
      message: `Deployed new background agent for ${newAgent.supplierName} with frequency ${newAgent.frequency}.`,
      durationMs: 340,
    };
    setLogs(prev => [newLog, ...prev]);
    showToast(`Agent "${newAgent.name}" deployed to fleet.`, 'success');
  };

  const handleToggleAgentStatus = (agentId: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        const nextStatus = a.status === 'active' ? 'paused' : 'active';
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  // 5. Trigger Real-time Simulated Agent Crawl
  const handleRunAgentScan = () => {
    setIsScanning(true);
    showToast('Background crawler agents dispatched to all supplier feeds...', 'info');

    setTimeout(() => {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      // Randomly adjust 2 items with slight market spot fluctuations
      setItems(prev => {
        return prev.map((item, idx) => {
          if (idx === 0) {
            // MCU slight fluctuation
            const newActual = 19.10;
            const ppvCalc = calculatePPV(item.standardCost, newActual, item.currentOrderQty);
            return {
              ...item,
              actualCost: newActual,
              varianceUnit: ppvCalc.varianceUnit,
              variancePercent: ppvCalc.variancePercent,
              totalPPV: ppvCalc.totalPPV,
              status: ppvCalc.status,
              lastScannedAt: now
            };
          }
          if (idx === 3) {
            // Packaging favorable update
            const newActual = 1.15;
            const ppvCalc = calculatePPV(item.standardCost, newActual, item.currentOrderQty);
            return {
              ...item,
              actualCost: newActual,
              varianceUnit: ppvCalc.varianceUnit,
              variancePercent: ppvCalc.variancePercent,
              totalPPV: ppvCalc.totalPPV,
              status: ppvCalc.status,
              lastScannedAt: now
            };
          }
          return { ...item, lastScannedAt: now };
        });
      });

      // Add fresh execution log
      const newScanLog: AgentScanLog = {
        id: `log-${Date.now()}`,
        agentId: 'agent-1',
        agentName: 'DigiKey & Mouser Real-time Price Harvester',
        timestamp: now,
        status: 'warning',
        itemsScanned: 365,
        variancesDetected: 4,
        message: 'Completed full ingestion cycle across 5 supplier portals and ERP pipelines. Evaluated 365 item quotes against baseline cost sheets.',
        durationMs: 1240,
        rawSnippet: 'SYNC_STATUS: 200 OK | Net Variance Recalculated'
      };

      setLogs(prev => [newScanLog, ...prev]);
      setIsScanning(false);
      showToast('Agent crawl completed! Ingested latest quotes & verified PPVs.', 'success');
    }, 1200);
  };

  const handleRunSingleAgent = (agentId: string) => {
    const targetAgent = agents.find(a => a.id === agentId);
    if (!targetAgent) return;

    setIsScanning(true);
    setTimeout(() => {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newScanLog: AgentScanLog = {
        id: `log-${Date.now()}`,
        agentId: targetAgent.id,
        agentName: targetAgent.name,
        timestamp: now,
        status: 'success',
        itemsScanned: targetAgent.itemsTrackedCount,
        variancesDetected: 1,
        message: `Direct crawl executed for ${targetAgent.supplierName} (${targetAgent.protocol}). Verified ${targetAgent.itemsTrackedCount} items.`,
        durationMs: 820,
        rawSnippet: 'HTTP 200 OK | Source: Live Feed'
      };

      setLogs(prev => [newScanLog, ...prev]);
      setIsScanning(false);
      showToast(`Agent "${targetAgent.name}" crawl succeeded.`, 'success');
    }, 800);
  };

  // 6. Update Standard Cost Baselines from Uploaded Sheet
  const handleUpdateStandardCosts = (updates: StandardCostUpdateRow[]) => {
    setItems(prev => {
      return prev.map(item => {
        const update = updates.find(u => u.sku.toLowerCase() === item.sku.toLowerCase());
        if (update) {
          const ppvCalc = calculatePPV(update.standardCost, item.actualCost, item.currentOrderQty);
          return {
            ...item,
            standardCost: update.standardCost,
            effectiveDate: update.effectiveDate || item.effectiveDate,
            varianceUnit: ppvCalc.varianceUnit,
            variancePercent: ppvCalc.variancePercent,
            totalPPV: ppvCalc.totalPPV,
            status: ppvCalc.status,
            reviewNotes: update.notes ? `${item.reviewNotes || ''} [Baseline update: ${update.notes}]` : item.reviewNotes
          };
        }
        return item;
      });
    });

    const newLog: AgentScanLog = {
      id: `log-${Date.now()}`,
      agentId: 'system',
      agentName: 'Standard Cost Baseline Ingestion Engine',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'success',
      itemsScanned: updates.length,
      variancesDetected: updates.length,
      message: `Applied ${updates.length} contractual standard baseline cost modifications. All PPVs recalculated.`,
      durationMs: 420,
    };
    setLogs(prev => [newLog, ...prev]);
    showToast(`Updated Standard Baseline Costs for ${updates.length} items!`, 'success');
  };

  const handleExportFiltered = (filteredItems: MaterialItem[]) => {
    exportToCSV(filteredItems, `supplier-variance-filtered-${new Date().toISOString().split('T')[0]}.csv`);
    showToast(`Exported ${filteredItems.length} items to CSV report.`, 'success');
  };

  const flaggedCount = items.filter(i => i.reviewStatus === 'flagged').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top duration-200">
          <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 text-xs font-semibold ${
            toastMessage.type === 'warning'
              ? 'bg-amber-900 text-amber-100 border-amber-700'
              : toastMessage.type === 'info'
                ? 'bg-indigo-900 text-indigo-100 border-indigo-700'
                : 'bg-slate-900 text-emerald-300 border-slate-700'
          }`}>
            {toastMessage.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : toastMessage.type === 'info' ? (
              <RefreshCw className="w-4 h-4 text-indigo-300 animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alerts={alerts}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onRunAgentScan={handleRunAgentScan}
        isScanning={isScanning}
        agents={agents}
        flaggedCount={flaggedCount}
      />

      {/* Page Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Header Bar */}
        <KPISummary 
          items={items} 
          agents={agents} 
          onFilterByStatus={(status) => {
            setActiveTab('dashboard');
            setFilterPreset(status);
          }}
        />

        {/* Dynamic View by Selected Tab */}
        {activeTab === 'dashboard' && (
          <VarianceDashboard
            items={items}
            onSelectItem={(item) => setSelectedItem(item)}
            onAcknowledgeItem={handleAcknowledgeItem}
            onFlagItem={handleFlagItem}
            onExportFiltered={handleExportFiltered}
            filterStatusPreset={filterPreset}
          />
        )}

        {activeTab === 'agents' && (
          <AgentConfigPanel
            agents={agents}
            logs={logs}
            items={items}
            onAddAgent={handleAddAgent}
            onToggleAgentStatus={handleToggleAgentStatus}
            onRunSingleAgent={handleRunSingleAgent}
            onUpdateStandardCosts={handleUpdateStandardCosts}
            onClearLogs={() => setLogs([])}
            isScanning={isScanning}
          />
        )}

        {activeTab === 'analytics' && (
          <HistoricalAnalyticsView
            items={items}
            onSelectItem={(item) => setSelectedItem(item)}
          />
        )}

        {activeTab === 'disputes' && (
          <DisputeReviewWorkflowView
            items={items}
            onSelectItem={(item) => setSelectedItem(item)}
            onResolveDispute={handleResolveDispute}
            onAcknowledgeItem={handleAcknowledgeItem}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Supplier Price Variance Monitor (PPV Sentinel) &bull; Automated Enterprise Ingestion Fleet</span>
          </div>
          <div>
            <span>Calculations: Purchase Price Variance = (Actual Invoiced Unit Price - Standard Cost Baseline) &times; PO Volume</span>
          </div>
        </div>
      </footer>

      {/* Interactive Drill Down Modal */}
      <DrillDownModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAcknowledge={handleAcknowledgeItem}
        onFlag={handleFlagItem}
      />

      {/* Alert Notification Center Slide-over */}
      <AlertNotificationCenter
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        items={items}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onAcknowledgeAll={handleAcknowledgeAll}
        onSelectMaterial={(item) => setSelectedItem(item)}
        onFlagItem={handleFlagItem}
      />

      {/* Procurement Review / Dispute Modal */}
      <ProcurementReviewModal
        item={flaggingItem}
        onClose={() => setFlaggingItem(null)}
        onSubmitDispute={handleSubmitDispute}
      />

      {/* Export Report Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        items={items}
      />
    </div>
  );
}
