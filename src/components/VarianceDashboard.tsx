import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  AlertCircle, 
  CheckCircle2, 
  Flag, 
  LineChart, 
  Download, 
  Eye, 
  MoreHorizontal,
  Layers,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles
} from 'lucide-react';
import { MaterialItem, Category, VarianceStatus, ReviewStatus } from '../types';
import { formatCurrency, formatPercent, formatNumber, getVarianceBadgeColor } from '../utils/formatters';

interface VarianceDashboardProps {
  items: MaterialItem[];
  onSelectItem: (item: MaterialItem) => void;
  onAcknowledgeItem: (itemId: string) => void;
  onFlagItem: (item: MaterialItem) => void;
  onExportFiltered: (filteredItems: MaterialItem[]) => void;
  filterStatusPreset?: string;
}

type SortField = 'sku' | 'name' | 'supplier' | 'currentOrderQty' | 'standardCost' | 'actualCost' | 'variancePercent' | 'totalPPV' | 'status';
type SortOrder = 'asc' | 'desc';

export const VarianceDashboard: React.FC<VarianceDashboardProps> = ({
  items,
  onSelectItem,
  onAcknowledgeItem,
  onFlagItem,
  onExportFiltered,
  filterStatusPreset,
}) => {
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>(filterStatusPreset || 'All');
  const [selectedReviewStatus, setSelectedReviewStatus] = useState<string>('All');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('All');

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('totalPPV');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Bulk Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Unique lists for filter dropdowns
  const categories = useMemo(() => {
    const set = new Set(items.map(i => i.category));
    return ['All', ...Array.from(set)];
  }, [items]);

  const suppliers = useMemo(() => {
    const set = new Set(items.map(i => i.supplier));
    return ['All', ...Array.from(set)];
  }, [items]);

  // Filter and Sort Logic
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search
      const matchesSearch = 
        searchTerm === '' ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

      // Status
      let matchesStatus = true;
      if (selectedStatus === 'unfavorable_critical') {
        matchesStatus = item.status === 'unfavorable_critical';
      } else if (selectedStatus === 'unfavorable_all') {
        matchesStatus = item.status === 'unfavorable_critical' || item.status === 'unfavorable_warning';
      } else if (selectedStatus === 'favorable') {
        matchesStatus = item.status === 'favorable';
      } else if (selectedStatus === 'neutral') {
        matchesStatus = item.status === 'neutral';
      }

      // Review Status
      const matchesReview = selectedReviewStatus === 'All' || item.reviewStatus === selectedReviewStatus;

      // Supplier
      const matchesSupplier = selectedSupplier === 'All' || item.supplier === selectedSupplier;

      return matchesSearch && matchesCategory && matchesStatus && matchesReview && matchesSupplier;
    }).sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [items, searchTerm, selectedCategory, selectedStatus, selectedReviewStatus, selectedSupplier, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAcknowledge = () => {
    selectedIds.forEach(id => onAcknowledgeItem(id));
    setSelectedIds([]);
  };

  // Subtotal for filtered view
  const filteredNetPPV = filteredItems.reduce((acc, i) => acc + i.totalPPV, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Control Bar: Filters & Search */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-variance-search"
              type="text"
              placeholder="Search by SKU, Material name, Supplier, Invoice #..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 shadow-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">Category:</span>
              <select
                id="select-category-filter"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Variance Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">Variance:</span>
              <select
                id="select-variance-filter"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              >
                <option value="All">All Variances</option>
                <option value="unfavorable_critical">Critical Spikes (&gt;15%)</option>
                <option value="unfavorable_all">All Unfavorable Spikes</option>
                <option value="favorable">Favorable Savings</option>
                <option value="neutral">On Target / Neutral</option>
              </select>
            </div>

            {/* Review Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">Workflow:</span>
              <select
                id="select-review-filter"
                value={selectedReviewStatus}
                onChange={e => setSelectedReviewStatus(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              >
                <option value="All">All Reviews</option>
                <option value="pending">Pending Review</option>
                <option value="flagged">Flagged for Dispute</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="reconciled">Reconciled</option>
              </select>
            </div>

            {/* Export Filtered Button */}
            <button
              id="btn-export-filtered-csv"
              onClick={() => onExportFiltered(filteredItems)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-sm transition-colors"
              title="Download CSV for currently filtered records"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export ({filteredItems.length})</span>
            </button>
          </div>
        </div>

        {/* Active Filters & Bulk Selection Ribbon */}
        {selectedIds.length > 0 && (
          <div className="mt-3 py-2 px-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-900">
                {selectedIds.length} items selected
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-xs text-indigo-700">
                Quickly batch acknowledge or flag multiple variances
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-bulk-acknowledge"
                onClick={handleBulkAcknowledge}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium transition-colors"
              >
                Acknowledge All Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-2 py-1 text-slate-600 hover:text-slate-800 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Information & Meta Header */}
      <div className="px-4 py-2 bg-slate-100/60 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Showing <strong className="text-slate-900">{filteredItems.length}</strong> of {items.length} materials</span>
          <span className="text-slate-300">•</span>
          <span>
            Filtered Net PPV: {' '}
            <strong className={filteredNetPPV > 0 ? 'text-red-600' : 'text-emerald-600'}>
              {filteredNetPPV > 0 ? `+${formatCurrency(filteredNetPPV)}` : formatCurrency(filteredNetPPV)}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Unfavorable Spikes
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> PPV Savings
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span> Neutral
          </span>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs divide-y divide-slate-200">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-3 w-8">
                <input
                  id="checkbox-select-all"
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === filteredItems.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              
              <th 
                className="py-3 px-3 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => handleSort('sku')}
              >
                <div className="flex items-center gap-1">
                  <span>Material / SKU</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th 
                className="py-3 px-3 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => handleSort('supplier')}
              >
                <div className="flex items-center gap-1">
                  <span>Supplier & Invoice</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th 
                className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => handleSort('currentOrderQty')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Order Qty</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th 
                className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => handleSort('standardCost')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Standard Cost</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th 
                className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => handleSort('actualCost')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Actual Cost</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th 
                className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => handleSort('variancePercent')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Variance (%)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th 
                className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => handleSort('totalPPV')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Total PPV ($)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3 px-3 text-center">Status & Review</th>

              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">No price variances match current filters</p>
                    <p className="text-xs text-slate-400 mt-1">Try broadening your search term or resetting category filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map(item => {
                const badge = getVarianceBadgeColor(item.status);
                const isSelected = selectedIds.includes(item.id);

                return (
                  <tr 
                    key={item.id} 
                    id={`row-${item.sku}`}
                    className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-indigo-50/40' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3">
                      <input
                        id={`checkbox-item-${item.id}`}
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>

                    {/* Material / SKU */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <button
                          id={`btn-drilldown-sku-${item.sku}`}
                          onClick={() => onSelectItem(item)}
                          className="text-left font-bold text-slate-900 hover:text-indigo-600 hover:underline flex items-center gap-1.5 group"
                        >
                          <span>{item.sku}</span>
                          <LineChart className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </button>
                        <span className="text-[11px] text-slate-500 line-clamp-1 max-w-[220px]" title={item.name}>
                          {item.name}
                        </span>
                        <span className="mt-0.5 inline-block text-[10px] font-medium text-slate-400">
                          {item.category}
                        </span>
                      </div>
                    </td>

                    {/* Supplier & Invoice */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{item.supplier}</span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <span>{item.invoiceNumber || 'Spot Scraped'}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] text-slate-400">{item.lastScannedAt.split(' ')[1]}</span>
                        </div>
                      </div>
                    </td>

                    {/* Order Qty */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-semibold text-slate-800">{formatNumber(item.currentOrderQty)}</span>
                      <span className="text-[10px] text-slate-400 ml-1 uppercase">{item.uom}</span>
                    </td>

                    {/* Standard Cost */}
                    <td className="py-3 px-3 text-right font-medium text-slate-600">
                      {formatCurrency(item.standardCost)}
                    </td>

                    {/* Actual Cost */}
                    <td className="py-3 px-3 text-right">
                      <span className={`font-bold ${item.actualCost > item.standardCost ? 'text-red-700' : item.actualCost < item.standardCost ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {formatCurrency(item.actualCost)}
                      </span>
                    </td>

                    {/* Unit Variance & % */}
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex flex-col items-end">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          item.variancePercent > 0 
                            ? item.variancePercent >= 15 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800' 
                            : item.variancePercent < 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.variancePercent > 0 ? (
                            <ArrowUp className="w-2.5 h-2.5 mr-0.5" />
                          ) : item.variancePercent < 0 ? (
                            <ArrowDown className="w-2.5 h-2.5 mr-0.5" />
                          ) : null}
                          {formatPercent(item.variancePercent)}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {item.varianceUnit >= 0 ? `+${formatCurrency(item.varianceUnit)}` : formatCurrency(item.varianceUnit)} / {item.uom}
                        </span>
                      </div>
                    </td>

                    {/* Total PPV */}
                    <td className="py-3 px-3 text-right">
                      <span className={`text-xs font-extrabold ${
                        item.totalPPV > 0 
                          ? 'text-red-600' 
                          : item.totalPPV < 0 ? 'text-emerald-600' : 'text-slate-700'
                      }`}>
                        {item.totalPPV > 0 ? `+${formatCurrency(item.totalPPV)}` : formatCurrency(item.totalPPV)}
                      </span>
                    </td>

                    {/* Review & Workflow Status */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {item.reviewStatus === 'flagged' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Flag className="w-2.5 h-2.5 fill-amber-700 text-amber-700" />
                            Dispute Flagged
                          </span>
                        ) : item.reviewStatus === 'acknowledged' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            Acknowledged
                          </span>
                        ) : item.reviewStatus === 'reconciled' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            Reconciled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-200 animate-pulse">
                            <AlertCircle className="w-2.5 h-2.5 text-red-600" />
                            Pending Review
                          </span>
                        )}
                        {item.buyerAssigned && (
                          <span className="text-[9px] text-slate-400 truncate max-w-[110px]" title={item.buyerAssigned}>
                            {item.buyerAssigned.split(' ')[0]} {item.buyerAssigned.split(' ')[1]?.[0]}.
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Controls */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Acknowledge Button */}
                        <button
                          id={`btn-ack-${item.id}`}
                          onClick={() => onAcknowledgeItem(item.id)}
                          disabled={item.reviewStatus === 'acknowledged'}
                          className={`p-1.5 rounded text-xs transition-colors ${
                            item.reviewStatus === 'acknowledged'
                              ? 'text-slate-300 cursor-default'
                              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title="Acknowledge Alert"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>

                        {/* Flag for Procurement Review */}
                        <button
                          id={`btn-flag-${item.id}`}
                          onClick={() => onFlagItem(item)}
                          className={`p-1.5 rounded text-xs transition-colors ${
                            item.reviewStatus === 'flagged'
                              ? 'text-amber-600 bg-amber-50'
                              : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50'
                          }`}
                          title="Flag for Procurement Review & Dispute Memo"
                        >
                          <Flag className="w-4 h-4" />
                        </button>

                        {/* Interactive Drill Down */}
                        <button
                          id={`btn-drill-${item.id}`}
                          onClick={() => onSelectItem(item)}
                          className="p-1.5 rounded text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors font-medium flex items-center gap-1"
                          title="Open Historical Trend & Volume Drill-Down"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
