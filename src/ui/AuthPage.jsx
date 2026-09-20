import React, { useState, useContext } from 'react';
import useAuth from '../hooks/useAuth';
import { context } from '../context/context.jsx';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  MapPin, 
  CheckCircle2, 
  Building2,
} from 'lucide-react';
import LoadingState from '../ui/LoadingState.jsx';

function AuthPage() {
  const { isLoading } = useContext(context);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [loading, setLoading] = useState(false);

  const { register, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'signup') {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* Enhanced Cyber-Dark Glassmorphic Loading State */
  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0b0f19] text-slate-100 flex items-center justify-center p-3 sm:p-6 md:p-8 sm:h-screen sm:overflow-hidden">
      <div className="w-full max-w-4xl bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 max-h-none sm:max-h-[92vh] my-auto">
        
        {/* Left Section: Branding */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-950 p-5 sm:p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
              <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Field<span className="text-blue-500">Proof</span>
              </span>
            </div>

            <h2 className="text-base sm:text-xl font-bold text-white mb-2 leading-snug">
              Work Verification & Automated Invoicing
            </h2>
            <p className="text-slate-400 text-xs mb-4 sm:mb-5 leading-relaxed">
              Ensure real-time attendance, GPS geo-fenced logs, and automated invoicing for field teams.
            </p>

            <div className="hidden sm:flex flex-col space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>GPS Geo-Fencing Check</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Live Photo Verification</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Automated Work Billing</span>
              </div>
            </div>
          </div>

          <div className="hidden md:block pt-4 border-t border-slate-800/60 text-[11px] text-slate-500">
            FieldProof Platform Engine &copy; {new Date().getFullYear()}
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="md:col-span-7 p-5 sm:p-6 md:p-8 flex flex-col justify-center bg-[#111827]">
          
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 mb-5 sm:mb-6 max-w-[200px] sm:max-w-[220px]">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                authMode === 'login'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                authMode === 'signup'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          <div className="mb-4 sm:mb-5">
            <h3 className="text-base sm:text-lg font-bold text-white">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {authMode === 'login'
                ? 'Enter your credentials to access dashboard'
                : 'Sign up to manage and track field tasks'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Hussain Memon"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-xs shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default AuthPage;