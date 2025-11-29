import React, { useState } from 'react';
import { Customer, GarmentType } from '../types';
import { Search, UserPlus, Phone, Mail, Ruler } from 'lucide-react';

interface CustomerManagerProps {
  customers: Customer[];
  onAddCustomer: (c: Customer) => void;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({ customers, onAddCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({});

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomer.name && newCustomer.phone) {
      onAddCustomer({
        id: `c${Date.now()}`,
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email || '',
        totalOrders: 0,
        lastVisit: new Date().toISOString().split('T')[0],
        savedMeasurements: {}
      });
      setIsModalOpen(false);
      setNewCustomer({});
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Customer Directory</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
        >
          <UserPlus size={18} />
          Add Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Search by name or phone number..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customer List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(customer => (
          <div key={customer.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:border-brand-200 transition-colors group">
            <div className="flex justify-between items-start mb-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                {customer.name.charAt(0)}
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                  {customer.totalOrders} Orders
                </span>
              </div>
            </div>
            
            <h3 className="font-bold text-lg text-slate-800">{customer.name}</h3>
            
            <div className="space-y-2 mt-3">
              <div className="flex items-center text-slate-500 text-sm">
                <Phone size={14} className="mr-2" />
                {customer.phone}
              </div>
              {customer.email && (
                <div className="flex items-center text-slate-500 text-sm">
                  <Mail size={14} className="mr-2" />
                  {customer.email}
                </div>
              )}
              <div className="flex items-center text-slate-500 text-sm">
                <Ruler size={14} className="mr-2" />
                 {Object.keys(customer.savedMeasurements).length > 0 
                  ? `${Object.keys(customer.savedMeasurements).length} Types Saved` 
                  : 'No measurements'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4">Add New Customer</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  required
                  type="text"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  value={newCustomer.name || ''}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  required
                  type="tel"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  value={newCustomer.phone || ''}
                  onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
                <input 
                  type="email"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  value={newCustomer.email || ''}
                  onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};