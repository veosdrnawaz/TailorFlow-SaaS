import React, { useState } from 'react';
import { Order, OrderStatus, GarmentType, Customer, Measurement } from '../types';
import { generateCostEstimate } from '../services/geminiService';
import { Plus, Filter, Sparkles, Loader2, Calendar } from 'lucide-react';

interface OrderManagerProps {
  orders: Order[];
  customers: Customer[];
  onAddOrder: (order: Order) => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}

export const OrderManager: React.FC<OrderManagerProps> = ({ orders, customers, onAddOrder, onUpdateStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [garmentType, setGarmentType] = useState<GarmentType>(GarmentType.SHIRT);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [price, setPrice] = useState<number>(0);
  const [advance, setAdvance] = useState<number>(0);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  // AI State
  const [isEstimating, setIsEstimating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  const filteredOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const handleGarmentChange = (type: GarmentType) => {
    setGarmentType(type);
    // Reset measurements based on type
    const defaults: Record<string, string[]> = {
      [GarmentType.SHIRT]: ['Neck', 'Chest', 'Shoulder', 'Sleeve', 'Length'],
      [GarmentType.PANT]: ['Waist', 'Hips', 'Inseam', 'Length', 'Thigh'],
      [GarmentType.SUIT_2PC]: ['Neck', 'Chest', 'Shoulder', 'Sleeve', 'Waist', 'Inseam', 'Pant Length'],
    };
    
    const fields = defaults[type] || ['Length', 'Chest', 'Waist'];
    setMeasurements(fields.map(label => ({ label, value: '', unit: 'in' })));
  };

  const handleAIHelp = async () => {
    if (!description) return;
    setIsEstimating(true);
    try {
      const result = await generateCostEstimate(garmentType, description, isUrgent);
      setAiSuggestion(result);
      if (result.estimatedCost) setPrice(result.estimatedCost);
    } catch (e) {
      alert("AI Service unavailable. Check API Key.");
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    const newOrder: Order = {
      id: `o${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      garmentType,
      description,
      measurements,
      status: OrderStatus.RECEIVED,
      orderDate: new Date().toISOString().split('T')[0],
      dueDate,
      price,
      advance,
      isUrgent
    };
    onAddOrder(newOrder);
    setIsModalOpen(false);
    // Reset form
    setDescription('');
    setAiSuggestion(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Order Management</h2>
        <div className="flex gap-2">
           <select 
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button 
            onClick={() => { setIsModalOpen(true); handleGarmentChange(GarmentType.SHIRT); }}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} />
            New Order
          </button>
        </div>
      </div>

      {/* Kanban / List View - Simplified to Table for MVP */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Item</th>
                <th className="p-4 font-medium">Due Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-700">#{order.id}</td>
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{order.customerName}</div>
                    <div className="text-xs text-slate-400 truncate w-32">{order.description}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 border border-slate-200">
                      {order.garmentType}
                    </span>
                    {order.isUrgent && (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold animate-pulse">
                        URGENT
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-500">{order.dueDate}</td>
                  <td className="p-4">
                    <select 
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                      className={`text-xs font-semibold py-1 px-2 rounded-full border-none focus:ring-0 cursor-pointer
                         ${order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-700' : 
                           order.status === OrderStatus.DELIVERED ? 'bg-slate-200 text-slate-700' :
                           'bg-blue-50 text-blue-700'}`}
                    >
                      {Object.values(OrderStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="text-slate-800 font-medium">${order.price}</div>
                    <div className={`text-xs ${order.advance >= order.price ? 'text-green-600' : 'text-orange-500'}`}>
                      Paid: ${order.advance}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-brand-600 hover:text-brand-800 text-sm font-medium">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="p-8 text-center text-slate-400">No orders found matching this filter.</div>
          )}
        </div>
      </div>

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-xl my-8">
            <h3 className="text-xl font-bold mb-6 pb-2 border-b border-slate-100">Create New Order</h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Customer & Order Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Customer</label>
                  <select 
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Garment Type</label>
                    <select 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                      value={garmentType}
                      onChange={(e) => handleGarmentChange(e.target.value as GarmentType)}
                    >
                      {Object.values(GarmentType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                    <input 
                      required
                      type="date"
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description / Style Notes</label>
                  <textarea 
                    rows={3}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    placeholder="e.g. Round neck, 3/4 sleeves, golden piping..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <div className="mt-2 flex justify-end">
                    <button 
                      type="button"
                      onClick={handleAIHelp}
                      disabled={isEstimating || !description}
                      className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-purple-200 transition-colors disabled:opacity-50"
                    >
                      {isEstimating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      AI Estimate Cost & Time
                    </button>
                  </div>
                  {aiSuggestion && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100 text-sm">
                      <p className="font-semibold text-purple-900">AI Suggestion:</p>
                      <ul className="list-disc ml-4 text-purple-800 space-y-1 mt-1">
                        <li>Est. Time: {aiSuggestion.timeEstimateDays} days</li>
                        <li>Fabric: {aiSuggestion.fabricRequirements}</li>
                        <li>Tips: {aiSuggestion.patternSuggestions[0]}</li>
                      </ul>
                    </div>
                  )}
                </div>

                 <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="urgent"
                    checked={isUrgent}
                    onChange={e => setIsUrgent(e.target.checked)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="urgent" className="text-sm font-medium text-slate-700">Mark as Urgent Order</label>
                </div>
              </div>

              {/* Right Column: Measurements & Billing */}
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-brand-500 rounded-full"></span>
                    Measurements
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {measurements.map((m, idx) => (
                      <div key={idx}>
                        <label className="text-xs font-medium text-slate-500">{m.label} ({m.unit})</label>
                        <input 
                          type="number" 
                          step="0.1"
                          className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 text-sm"
                          value={m.value}
                          onChange={(e) => {
                             const newM = [...measurements];
                             newM[idx].value = e.target.value;
                             setMeasurements(newM);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                    Billing Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500">Total Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input 
                          type="number"
                          required
                          className="w-full pl-6 p-2 border border-slate-300 rounded-md"
                          value={price}
                          onChange={(e) => setPrice(parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">Advance Paid</label>
                       <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input 
                          type="number"
                          className="w-full pl-6 p-2 border border-slate-300 rounded-md"
                          value={advance}
                          onChange={(e) => setAdvance(parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-right text-sm font-medium text-slate-600">
                    Balance Due: <span className="text-red-600">${price - advance}</span>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="md:col-span-2 flex gap-4 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium shadow-sm"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};