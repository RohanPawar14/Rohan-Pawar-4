import { MaterialItem, VarianceStatus } from '../types';

export function formatCurrency(value: number, currency: string = 'USD', decimals: number = 2): string {
  if (Math.abs(value) < 0.01 && value !== 0) {
    return `${value < 0 ? '-' : ''}$${Math.abs(value).toFixed(4)}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, includeSign: boolean = true): string {
  const formatted = Math.abs(value).toFixed(2);
  if (includeSign) {
    return `${value > 0 ? '+' : value < 0 ? '-' : ''}${formatted}%`;
  }
  return `${formatted}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function calculatePPV(standardCost: number, actualCost: number, volume: number): {
  varianceUnit: number;
  variancePercent: number;
  totalPPV: number;
  status: VarianceStatus;
} {
  const varianceUnit = actualCost - standardCost;
  const variancePercent = standardCost > 0 ? (varianceUnit / standardCost) * 100 : 0;
  const totalPPV = varianceUnit * volume;

  let status: VarianceStatus = 'neutral';
  if (variancePercent >= 15) {
    status = 'unfavorable_critical';
  } else if (variancePercent > 2.5) {
    status = 'unfavorable_warning';
  } else if (variancePercent <= -2.5) {
    status = 'favorable';
  } else {
    status = 'neutral';
  }

  return {
    varianceUnit: Number(varianceUnit.toFixed(4)),
    variancePercent: Number(variancePercent.toFixed(2)),
    totalPPV: Number(totalPPV.toFixed(2)),
    status,
  };
}

export function getVarianceBadgeColor(status: VarianceStatus): {
  bg: string;
  text: string;
  border: string;
  iconBg: string;
} {
  switch (status) {
    case 'unfavorable_critical':
      return {
        bg: 'bg-red-50 text-red-700',
        text: 'text-red-700 font-semibold',
        border: 'border-red-200',
        iconBg: 'bg-red-100 text-red-700',
      };
    case 'unfavorable_warning':
      return {
        bg: 'bg-amber-50 text-amber-700',
        text: 'text-amber-700 font-semibold',
        border: 'border-amber-200',
        iconBg: 'bg-amber-100 text-amber-700',
      };
    case 'favorable':
      return {
        bg: 'bg-emerald-50 text-emerald-700',
        text: 'text-emerald-700 font-semibold',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100 text-emerald-700',
      };
    case 'neutral':
    default:
      return {
        bg: 'bg-slate-100 text-slate-700',
        text: 'text-slate-700 font-medium',
        border: 'border-slate-200',
        iconBg: 'bg-slate-100 text-slate-600',
      };
  }
}

export function exportToCSV(items: MaterialItem[], filename = 'supplier-price-variance-report.csv') {
  const headers = [
    'SKU',
    'Material Name',
    'Category',
    'Supplier',
    'Supplier Code',
    'UOM',
    'Order Qty',
    'Standard Cost ($)',
    'Actual Cost ($)',
    'Unit Variance ($)',
    'Variance (%)',
    'Total Purchase Price Variance PPV ($)',
    'Status',
    'Review Status',
    'Assigned Buyer',
    'Dispute Reason',
    'Effective Date',
    'Last Scanned'
  ];

  const rows = items.map(item => [
    `"${item.sku}"`,
    `"${item.name.replace(/"/g, '""')}"`,
    `"${item.category}"`,
    `"${item.supplier.replace(/"/g, '""')}"`,
    `"${item.supplierCode}"`,
    `"${item.uom}"`,
    item.currentOrderQty,
    item.standardCost,
    item.actualCost,
    item.varianceUnit,
    item.variancePercent,
    item.totalPPV,
    `"${item.status}"`,
    `"${item.reviewStatus}"`,
    `"${item.buyerAssigned || 'Unassigned'}"`,
    `"${(item.disputeReason || '').replace(/"/g, '""')}"`,
    `"${item.effectiveDate}"`,
    `"${item.lastScannedAt}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
