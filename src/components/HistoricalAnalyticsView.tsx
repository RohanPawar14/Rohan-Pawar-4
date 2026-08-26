import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Building2, 
  ArrowUp, 
  ArrowDown, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { MaterialItem } from '../types';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';

interface HistoricalAnalyticsViewProps {
  items: MaterialItem[];
  onSelectItem: (item: MaterialItem) => void;
}

export const HistoricalAnalyticsView: React.FC<HistoricalAnalyticsViewProps> = ({
  items,
  onSelectItem,
}) => {
  // Aggregate PPV by Category
  const categoryMap = new Map<string, { category: string; ppv: number; spend: number; count: number }>();

  items.forEach(item => {
    const existing = categoryMap.get(item.category) || { category: item.category, ppv: 0, spend: 0, count: 0 };
    existing.ppv += item.totalPPV;
    existing.spend += item.actualCost * item.currentOrderQty;
    existing.count += 1;
    categoryMap.set(item.category, existing);
  });

  const categoryData = Array.from(categoryMap.values());

  // Aggregate PPV by Supplier
  const supplierMap = new Map<string, { supplier: string; ppv: number; count: number; spend: number }>();
  items.forEach(item => {
    const existing = supplierMap.get(item.supplier) || { supplier: item.supplier, ppv: 0, count: 0, spend: 0 };
    existing.ppv += item.totalPPV;
    existing.count += 1;
    existing.spend += item.actualCost * item.currentOrderQty;
    supplierMap.set(item.supplier, existing);
  });

  const supplierData = Array.from(supplierMap.values()).sort((a, b) => b.ppv - a.ppv);

  // Top Unfavorable and Favorable
  const topSpikes = [...items].filter(i => i.totalPPV > 0).sort((a, b) => b.totalPPV - a.totalPPV).slice(0, 4);
  const topSavings = [...items].filter(i => i.totalPPV < 0).sort((a, b) => a.totalPPV - b.totalPPV).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Overview Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: PPV Impact by Category */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Purchase Price Variance by Category</h3>
              <p className="text-xs text-slate-500">Net dollar variance impact across procurement categories</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
              {categoryData.length} Categories
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="category" 
                  stroke="#64748b" 
                  fontSize={10} 
                  angle={-15} 
                  textAnchor="end" 
                  interval={0}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Net PPV Impact']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="ppv" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.ppv > 0 ? '#ef4444' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Supplier Price Variance Ranking */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Supplier Price Variance Ranking</h3>
              <p className="text-xs text-slate-500">Cumulative PPV deviations by vendor</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
              {supplierData.length} Vendors
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <YAxis 
                  type="category" 
                  dataKey="supplier" 
                  stroke="#64748b" 
                  fontSize={10} 
                  width={110} 
                  tickFormatter={(val) => val.split(' ')[0] + ' ' + (val.split(' ')[1] || '')}
                />
                <Tooltip 
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Net PPV']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="ppv" radius={[0, 4, 4, 0]}>
                  {supplierData.map((entry, index) => (
                    <Cell key={`cell-supp-${index}`} fill={entry.ppv > 0 ? '#ef4444' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Cost Inflation Culprits vs Top Cost Savings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Price Spikes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Top Cost Inflation Spikes (Unfavorable)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-red-600">Immediate Sourcing Risk</span>
          </div>

          <div className="space-y-2.5">
            {topSpikes.map(item => (
              <div 
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="p-3 bg-red-50/40 hover:bg-red-50/80 border border-red-200/80 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900">{item.sku}</span>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{item.name}</p>
                  <span className="text-[10px] text-slate-400">{item.supplier}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-red-700">+{formatCurrency(item.totalPPV)}</span>
                  <p className="text-[10px] text-red-600 font-semibold">+{formatPercent(item.variancePercent)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cost Savings */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingDown className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Top Captured Cost Savings (Favorable)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-600">Efficiency Surplus</span>
          </div>

          <div className="space-y-2.5">
            {topSavings.map(item => (
              <div 
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="p-3 bg-emerald-50/40 hover:bg-emerald-50/80 border border-emerald-200/80 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900">{item.sku}</span>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{item.name}</p>
                  <span className="text-[10px] text-slate-400">{item.supplier}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-700">{formatCurrency(item.totalPPV)}</span>
                  <p className="text-[10px] text-emerald-600 font-semibold">{formatPercent(item.variancePercent)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
