import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Scissors, Settings, AlertCircle, Loader2 } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP' | 'SETTINGS';

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login/Signup Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Settings State
  const [scriptUrl, setScriptUrl] = useState(api.getScriptUrl() || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        const user = await api.login(email, password);
        onLogin(user);
      } else if (mode === 'SIGNUP') {
        const user = await api.signup(name, email, password);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    api.setScriptUrl(scriptUrl);
    setSaveSuccess(true);
    setTimeout(() => {
        setSaveSuccess(false);
        setMode('LOGIN');
    }, 1000);
  };

  if (mode === 'SETTINGS') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
          <div className="flex items-center gap-3 mb-6 text-slate-700">
            <Settings className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Backend Configuration</h2>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 mb-6">
            To use Google Sheets as your database:
            <ol className="list-decimal ml-4 mt-2 space-y-1">
              <li>Deploy the Google Apps Script provided in <code>backend/Code.js</code> as a Web App.</li>
              <li>Set "Who has access" to "Anyone".</li>
              <li>Paste the URL below.</li>
            </ol>
            <div className="mt-3 text-xs font-semibold">
               Leave empty to use Demo Mock Mode.
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Web App URL</label>
              <input
                type="url"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/..."
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
              />
            </div>
            
            {saveSuccess && (
                <div className="text-green-600 text-sm font-medium text-center">Saved! Redirecting...</div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMode('LOGIN')}
                className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors"
              >
                Save Config
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Brand Side */}
      <div className="md:w-1/2 bg-brand-600 p-12 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl"></div>
             <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        </div>
        
        <div className="z-10 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Scissors size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">TailorFlow</h1>
        </div>

        <div className="z-10 my-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Manage your boutique with precision.
          </h2>
          <p className="text-brand-100 text-lg max-w-md">
            Order tracking, customer management, and AI-powered estimations—all connected to your own Google Sheets.
          </p>
        </div>

        <div className="z-10 text-brand-200 text-sm">
          &copy; {new Date().getFullYear()} TailorFlow SaaS
        </div>
      </div>

      {/* Form Side */}
      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-slate-900">
              {mode === 'LOGIN' ? 'Welcome back' : 'Create your account'}
            </h3>
            <p className="text-slate-500 mt-2">
              {mode === 'LOGIN' 
                ? 'Enter your details to access your dashboard.' 
                : 'Start managing your tailoring business today.'}
            </p>
            {api.getScriptUrl() ? (
                <div className="mt-2 text-xs inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Connected to Google Sheets
                </div>
            ) : (
                <div className="mt-2 text-xs inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Demo Mode (Mock Data)
                </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {mode === 'SIGNUP' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Master"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                required
                type="email"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                required
                type="password"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {mode === 'LOGIN' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="flex flex-col items-center gap-4 text-sm">
            <button 
                onClick={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                className="text-brand-600 hover:underline"
            >
                {mode === 'LOGIN' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
            
            <button 
                onClick={() => setMode('SETTINGS')}
                className="text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
                <Settings size={14} />
                Configure Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
