import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { OrderManager } from './components/OrderManager';
import { CustomerManager } from './components/CustomerManager';
import { AIAssistant } from './components/AIAssistant';
import { Auth } from './components/Auth';
import { api } from './services/api';
import { Order, Customer, ViewState, OrderStatus, User } from './types';
import { Loader2 } from 'lucide-react';

function App() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  
  // App View State
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  
  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  // Check for existing session or mock persistent login
  useEffect(() => {
    // In a real app, validate token. Here we rely on React state, 
    // but we could reload user from localStorage if we implemented persistence there.
  }, []);

  // Fetch data when user logs in
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [fetchedOrders, fetchedCustomers] = await Promise.all([
            api.getOrders(),
            api.getCustomers()
          ]);
          setOrders(fetchedOrders);
          setCustomers(fetchedCustomers);
        } catch (e) {
          console.error("Failed to fetch data", e);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleAddOrder = async (newOrder: Order) => {
    // Optimistic UI update
    setOrders(prev => [newOrder, ...prev]);
    
    // API Call
    try {
        await api.createOrder(newOrder);
        
        // Update local customer stats
        setCustomers(prev => prev.map(c => 
          c.id === newOrder.customerId 
            ? { 
                ...c, 
                totalOrders: c.totalOrders + 1, 
                lastVisit: new Date().toISOString().split('T')[0],
                savedMeasurements: { ...c.savedMeasurements, [newOrder.garmentType]: newOrder.measurements } 
              } 
            : c
        ));
    } catch (e) {
        alert("Failed to save order to backend.");
    }
  };

  const handleAddCustomer = async (newCustomer: Customer) => {
    setCustomers(prev => [...prev, newCustomer]);
    try {
        await api.createCustomer(newCustomer);
    } catch (e) {
        alert("Failed to save customer to backend.");
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    const updatedOrder = { ...orderToUpdate, status };
    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));

    try {
        await api.updateOrder(updatedOrder);
    } catch (e) {
        console.error("Failed to update status on backend");
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  if (loading && orders.length === 0) {
    return (
        <div className="h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
            <Loader2 className="animate-spin text-brand-600" size={48} />
            <p className="text-slate-500 font-medium">Loading your boutique data...</p>
        </div>
    )
  }

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {currentView === 'DASHBOARD' && <Dashboard orders={orders} />}
      
      {currentView === 'ORDERS' && (
        <OrderManager 
          orders={orders} 
          customers={customers} 
          onAddOrder={handleAddOrder}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
      
      {currentView === 'CUSTOMERS' && (
        <CustomerManager 
          customers={customers} 
          onAddCustomer={handleAddCustomer}
        />
      )}
      
      {currentView === 'AI_ASSISTANT' && <AIAssistant />}
    </Layout>
  );
}

export default App;
