export type VarianceStatus = 'unfavorable_critical' | 'unfavorable_warning' | 'neutral' | 'favorable';
export type ReviewStatus = 'pending' | 'acknowledged' | 'flagged' | 'reconciled';
export type AgentFrequency = '15m' | '1h' | '6h' | '24h' | 'weekly';
export type AgentProtocol = 'web_portal' | 'edi_810' | 'erp_sap' | 'pdf_invoice' | 'rest_api';
export type AgentStatus = 'active' | 'paused' | 'running' | 'error';
export type Category = 
  | 'Electronic Components'
  | 'Raw Metals & Alloys'
  | 'Polymers & Resins'
  | 'Sustainable Packaging'
  | 'Freight & Logistics'
  | 'Specialty Chemicals';

export interface HistoricalPricePoint {
  date: string;
  standardCost: number;
  actualCost: number;
  marketBenchmark: number;
  volume: number;
}

export interface SupplierAlternative {
  supplierName: string;
  unitPrice: number;
  leadTimeDays: number;
  minOrderQty: number;
  rating: number; // 1-5
}

export interface PriceDriver {
  name: string;
  impactPercent: number; // e.g. +8.2%
  trend: 'up' | 'down' | 'flat';
  description: string;
}

export interface MaterialItem {
  id: string;
  sku: string;
  name: string;
  category: Category;
  supplier: string;
  supplierCode: string;
  uom: string; // Unit of measure (e.g. ea, kg, m, box, liter)
  annualVolume: number;
  currentOrderQty: number;
  standardCost: number; // Planned baseline standard cost per unit
  actualCost: number; // Latest invoiced or scraped price per unit
  currency: string;
  effectiveDate: string;
  lastScannedAt: string;
  invoiceNumber?: string;
  contractNumber?: string;
  agentId: string;
  
  // Computed fields
  varianceUnit: number; // actualCost - standardCost
  variancePercent: number; // ((actual - standard) / standard) * 100
  totalPPV: number; // varianceUnit * currentOrderQty
  status: VarianceStatus;
  
  // Workflow fields
  reviewStatus: ReviewStatus;
  buyerAssigned?: string;
  disputeReason?: string;
  disputePriority?: 'low' | 'medium' | 'high' | 'urgent';
  disputeDate?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  reviewNotes?: string;

  // Analytical drill-down metadata
  history: HistoricalPricePoint[];
  alternatives: SupplierAlternative[];
  priceDrivers: PriceDriver[];
  lastRawPayload?: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  supplierName: string;
  targetUrl: string;
  protocol: AgentProtocol;
  frequency: AgentFrequency;
  alertThresholdPercent: number; // e.g. 3.0 means alert if abs(variance) >= 3%
  status: AgentStatus;
  lastRun: string;
  nextRun: string;
  itemsTrackedCount: number;
  totalVarianceSum: number;
  successRate: number; // 99.2%
  authType: 'API Key' | 'OAuth2' | 'Portal Credentials' | 'EDI SFTP' | 'Session Cookie';
  targetCategory: Category | 'All Categories';
}

export interface AgentScanLog {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  status: 'success' | 'warning' | 'failure';
  itemsScanned: number;
  variancesDetected: number;
  message: string;
  durationMs: number;
  rawSnippet?: string;
}

export interface VarianceAlert {
  id: string;
  itemId: string;
  sku: string;
  itemName: string;
  supplier: string;
  variancePercent: number;
  varianceUnit: number;
  totalPPV: number;
  severity: 'critical' | 'warning' | 'positive';
  timestamp: string;
  isRead: boolean;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
}

export interface StandardCostUpdateRow {
  sku: string;
  standardCost: number;
  effectiveDate: string;
  notes?: string;
}
