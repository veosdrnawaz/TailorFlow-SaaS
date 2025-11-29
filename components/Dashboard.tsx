import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Order, OrderStatus } from '../types';
import { AlertCircle, CheckCircle, Clock, DollarSign, Scissors } from 'lucide-react';

interface DashboardProps {
  orders: Order[];
}

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#ef4444', '#a855f7'];

export const Dashboard: React.FC<DashboardProps> = ({ orders }) => {
  // Compute Metrics
  const activeOrders = orders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.COMPLETED);
  const urgentOrders = orders.filter(o => o.isUrgent && o.status !== OrderStatus.DELIVERED);
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.price, 0);
  const collectedAdvance = orders.reduce((acc, curr) => acc + curr.advance, 0);
  const pendingPayment = totalRevenue - collectedAdvance;

  // Chart Data Preparation
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  const revenueData = [
    { name: 'Week 1', revenue: 12000 },
    { name: 'Week 2', revenue: 19000 },
    { name: 'Week 3', revenue: 15000 },
    { name: 'Week 4', revenue: 24000 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Active Orders</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{activeOrders.length}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Scissors size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Currently in process</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Urgent Priority</p>
              <h3 className="text-3xl font-bold text-red-600 mt-2">{urgentOrders.length}</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertCircle size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Needs immediate attention</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Monthly Revenue</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-2">${totalRevenue}</h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Pend. Collection: ${pendingPayment}</p>
        </div>

         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Completed</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">
                {orders.filter(o => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.DELIVERED).length}
              </h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <CheckCircle size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">This month</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
           <h3 className="text-lg font-semibold mb-4 text-slate-700">Revenue Trend</h3>
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Upcoming Deadlines */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold mb-4 text-slate-700">Approaching Deadlines (Next 7 Days)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-sm border-b border-slate-100">
                <th className="pb-3 font-medium">Order ID</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Garment</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Due Date</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {activeOrders
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 5)
                .map(order => (
                <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-medium text-slate-700">#{order.id}</td>
                  <td className="py-3">{order.customerName}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">
                      {order.garmentType}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium 
                      ${order.status === OrderStatus.RECEIVED ? 'bg-gray-100 text-gray-700' : 
                        order.status === OrderStatus.CUTTING ? 'bg-blue-100 text-blue-700' :
                        order.status === OrderStatus.STITCHING ? 'bg-indigo-100 text-indigo-700' :
                        order.status === OrderStatus.TRIAL_READY ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 flex items-center text-slate-500">
                    <Clock size={14} className="mr-1" />
                    {order.dueDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};