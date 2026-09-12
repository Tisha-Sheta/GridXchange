import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Zap, Sun, Home, Shield, ArrowRight, Mail, Lock, User as UserIcon, CheckCircle2, MapPin } from 'lucide-react';
import { LocationPickerModal, LocationSelectionResult } from '../components/LocationPickerModal';
import { DEFAULT_MAP_CENTER } from '../utils/geoUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole?: (role: 'consumer' | 'prosumer' | 'admin') => void;
  initialMode?: 'select' | 'login' | 'register';
  preselectedRole?: 'consumer' | 'prosumer';
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectRole,
  initialMode = 'select',
  preselectedRole = 'consumer',
}) => {
  const { login, register, demoLogin } = useAuth();
  const [step, setStep] = useState<'choose' | 'login' | 'register'>(
    initialMode === 'select' ? 'choose' : initialMode
  );
  const [chosenRole, setChosenRole] = useState<'consumer' | 'prosumer'>(preselectedRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [solarCapacity, setSolarCapacity] = useState('6.5');
  const [selectedLocation, setSelectedLocation] = useState<LocationSelectionResult>({
    city: 'Ahmedabad',
    locality: 'Vastrapur',
    latitude: DEFAULT_MAP_CENTER.lat,
    longitude: DEFAULT_MAP_CENTER.lng,
    location: 'Vastrapur, Ahmedabad',
    grid_zone: 'Zone A',
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDemoLogin = async (identifier: 'C001' | 'P001' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin(identifier);
      const role = identifier === 'C001' ? 'consumer' : identifier === 'P001' ? 'prosumer' : 'admin';
      onSelectRole?.(role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 'register' && chosenRole === 'prosumer') {
      const cap = Number(solarCapacity);
      if (isNaN(cap) || cap <= 0) {
        setError('Solar capacity must be a positive number greater than 0 kW');
        return;
      }
    }

    setLoading(true);
    try {
      if (step === 'register') {
        await register({
          name,
          email,
          password,
          role: chosenRole,
          solar_capacity: chosenRole === 'prosumer' ? Number(solarCapacity) : undefined,
          location: selectedLocation.location,
          city: selectedLocation.city,
          locality: selectedLocation.locality,
          latitude: Number(selectedLocation.latitude),
          longitude: Number(selectedLocation.longitude),
          grid_zone: selectedLocation.grid_zone,
        });
        onSelectRole?.(chosenRole);
      } else {
        await login(email, password);
        // Will route based on returned user
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F100E]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#171816] border border-[#E6E2D8] dark:border-[#2A2B27] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-[#1A1B19] dark:text-[#EDEDE8] relative transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-[#EFECE4] dark:border-[#262723]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#EFECE4] dark:bg-[#20211D] text-[#1A1B19] dark:text-[#EDEDE8] mb-2">
              <Zap className="w-3 h-3 text-[#E5A93C] fill-current" />
              <span>GridXchange Authentication</span>
            </div>
            <h3 className="font-heading font-extrabold text-2xl text-[#1A1B19] dark:text-[#EDEDE8]">
              {step === 'choose' && 'Sign in or Choose Account'}
              {step === 'login' && 'Sign in to your account'}
              {step === 'register' && 'Create your energy account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F3EFE8] dark:hover:bg-[#20211E] text-[#8D9188] hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: CHOOSE DEMO ACCOUNT OR SIGN IN WITH CREDENTIALS */}
        {step === 'choose' && (
          <div className="mt-6 space-y-4">
            <p className="text-xs sm:text-sm text-[#686B63] dark:text-[#9EA299]">
              Select an account to log in and start trading clean energy:
            </p>

            <div className="grid grid-cols-1 gap-3 pt-2">
              {/* Account 1: Consumer C001 */}
              <button
                type="button"
                onClick={() => handleDemoLogin('C001')}
                disabled={loading}
                className="p-5 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#1C1D1A] hover:border-[#1A1B19] dark:hover:border-[#EDEDE8] text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F2EC] dark:bg-[#1B2920] text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-base text-[#1A1B19] dark:text-[#EDEDE8]">
                      Log in as Consumer (C001)
                    </div>
                    <div className="text-xs text-[#686B63] dark:text-[#8D9188] mt-0.5">
                      Ananya Sharma • Buy verified clean solar energy
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#8D9188] group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Account 2: Prosumer P001 */}
              <button
                type="button"
                onClick={() => handleDemoLogin('P001')}
                disabled={loading}
                className="p-5 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#1C1D1A] hover:border-[#B45309] dark:hover:border-[#E5A93C] text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] dark:bg-[#2A2312] text-[#B45309] dark:text-[#E5A93C] flex items-center justify-center">
                    <Sun className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-base text-[#1A1B19] dark:text-[#EDEDE8]">
                      Log in as Prosumer (P001)
                    </div>
                    <div className="text-xs text-[#686B63] dark:text-[#8D9188] mt-0.5">
                      Rajesh Patel • 6.5 kW Rooftop Solar Producer
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#8D9188] group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Account 3: Admin */}
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="p-4 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-transparent hover:bg-[#FAF8F5] dark:hover:bg-[#1E1F1C] text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EFECE4] dark:bg-[#262824] text-[#686B63] dark:text-[#9EA299] flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#1A1B19] dark:text-[#EDEDE8]">
                      Distribution Grid Operator (Admin)
                    </div>
                    <div className="text-[10px] text-[#8D9188]">SCADA Control Console</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8D9188]" />
              </button>
            </div>

            <div className="pt-4 border-t border-[#EFECE4] dark:border-[#262723] flex items-center justify-between text-xs text-[#686B63] dark:text-[#8D9188]">
              <button
                type="button"
                onClick={() => setStep('login')}
                className="font-bold text-[#1A1B19] dark:text-[#EDEDE8] hover:underline cursor-pointer"
              >
                Log In with Email
              </button>
              <button
                type="button"
                onClick={() => setStep('register')}
                className="font-bold text-[#1A1B19] dark:text-[#EDEDE8] hover:underline cursor-pointer"
              >
                Create New Account
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: EMAIL / PASSWORD LOGIN */}
        {step === 'login' && (
          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#8D9188] mb-1.5 font-semibold">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. c001@gridxchange.io or p001@gridxchange.io"
                className="w-full px-4 py-3.5 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#111210] text-sm text-[#1A1B19] dark:text-[#EDEDE8] focus:outline-none focus:border-[#B45309]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#8D9188] mb-1.5 font-semibold">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#111210] text-sm text-[#1A1B19] dark:text-[#EDEDE8] focus:outline-none focus:border-[#B45309]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] font-bold text-sm transition-all shadow-sm cursor-pointer mt-4"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div className="pt-4 border-t border-[#EFECE4] dark:border-[#262723] flex items-center justify-between text-xs text-[#686B63] dark:text-[#8D9188]">
              <button
                type="button"
                onClick={() => setStep('choose')}
                className="hover:underline cursor-pointer"
              >
                ← Quick Account Picker
              </button>
              <button
                type="button"
                onClick={() => setStep('register')}
                className="font-bold text-[#1A1B19] dark:text-[#EDEDE8] hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: REGISTRATION */}
        {step === 'register' && (
          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#8D9188] mb-1.5 font-semibold">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#111210] text-sm text-[#1A1B19] dark:text-[#EDEDE8] focus:outline-none focus:border-[#B45309]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#8D9188] mb-1.5 font-semibold">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#111210] text-sm text-[#1A1B19] dark:text-[#EDEDE8] focus:outline-none focus:border-[#B45309]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#8D9188] mb-1.5 font-semibold">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#111210] text-sm text-[#1A1B19] dark:text-[#EDEDE8] focus:outline-none focus:border-[#B45309]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#8D9188] mb-1.5 font-semibold">
                Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChosenRole('consumer')}
                  className={`py-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    chosenRole === 'consumer'
                      ? 'border-[#1A1B19] dark:border-[#EDEDE8] bg-[#1A1B19] text-white dark:bg-[#EDEDE8] dark:text-[#1A1B19]'
                      : 'border-[#E6E2D8] dark:border-[#2C2D29] text-[#686B63]'
                  }`}
                >
                  Consumer (Buyer)
                </button>
                <button
                  type="button"
                  onClick={() => setChosenRole('prosumer')}
                  className={`py-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    chosenRole === 'prosumer'
                      ? 'border-[#B45309] dark:border-[#E5A93C] bg-[#B45309] text-white dark:bg-[#E5A93C] dark:text-[#1A1B19]'
                      : 'border-[#E6E2D8] dark:border-[#2C2D29] text-[#686B63]'
                  }`}
                >
                  Prosumer (Solar Seller)
                </button>
              </div>
            </div>

            {/* Location Selection with Leaflet Interactive Map */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#8D9188] mb-1.5 font-semibold">
                Location
              </label>
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#111210]">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] dark:bg-[#2A2312] text-[#B45309] dark:text-[#E5A93C] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8] truncate">
                      {selectedLocation.location}
                    </div>
                    <div className="text-[10px] text-[#686B63] dark:text-[#8D9188]">
                      Interactive Map Coordinates Verified
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FFFFFF] dark:bg-[#1C1D1A] hover:border-[#B45309] dark:hover:border-[#E5A93C] text-[11px] font-bold text-[#1A1B19] dark:text-[#EDEDE8] transition-colors shrink-0 cursor-pointer shadow-2xs"
                >
                  {selectedLocation.location ? 'Change' : 'Select Location'}
                </button>
              </div>
            </div>

            {chosenRole === 'prosumer' && (
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#8D9188] mb-1.5 font-semibold">
                  Solar Capacity (kW)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  placeholder="e.g. 5.0"
                  value={solarCapacity}
                  onChange={(e) => setSolarCapacity(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FAF8F5] dark:bg-[#111210] text-sm text-[#1A1B19] dark:text-[#EDEDE8] focus:outline-none focus:border-[#B45309]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] font-bold text-sm transition-all shadow-sm cursor-pointer mt-4"
            >
              {loading ? 'Registering...' : 'Create Account & Log In'}
            </button>

            <div className="pt-4 border-t border-[#EFECE4] dark:border-[#262723] flex items-center justify-between text-xs text-[#686B63] dark:text-[#8D9188]">
              <button
                type="button"
                onClick={() => setStep('choose')}
                className="hover:underline cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep('login')}
                className="font-bold text-[#1A1B19] dark:text-[#EDEDE8] hover:underline cursor-pointer"
              >
                Already have an account? Log In
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Location Picker Modal with Leaflet + OpenStreetMap */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onConfirm={(res) => setSelectedLocation(res)}
        initialCoords={{ latitude: selectedLocation.latitude, longitude: selectedLocation.longitude }}
        initialLocationName={selectedLocation.location}
      />
    </div>
  );
};
