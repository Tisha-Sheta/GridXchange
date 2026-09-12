import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Zap,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  ChevronDown,
  LogOut,
  ArrowRight,
  Shield,
  Home,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: (mode?: 'select' | 'login' | 'register', role?: 'consumer' | 'prosumer') => void;
  onTriggerRebalanceDemo: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onTriggerRebalanceDemo,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setActiveTab('landing');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const handleGoToDashboard = () => {
    if (!user) {
      onOpenAuth('select');
      return;
    }
    if (user.role === 'consumer') {
      setActiveTab('consumer');
    } else if (user.role === 'prosumer') {
      setActiveTab('prosumer');
    } else if (user.role === 'admin') {
      setActiveTab('admin');
    }
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setActiveTab('landing');
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'border-b border-[#E6E2D8] dark:border-[#262723] bg-[#FAF8F5]/85 dark:bg-[#0F100E]/85 backdrop-blur-md shadow-xs'
          : 'border-b border-[#E6E2D8]/40 dark:border-[#262723]/40 bg-[#FAF8F5]/60 dark:bg-[#0F100E]/60 backdrop-blur-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-10">
          <button
            onClick={() => {
              setActiveTab('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 text-left group cursor-pointer btn-interactive"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#1A1B19] dark:bg-[#FAF8F5] flex items-center justify-center text-white dark:text-[#1A1B19] shadow-xs group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-[#E5A93C] dark:text-[#D97706] fill-current" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-xl tracking-tight text-[#1A1B19] dark:text-[#EDEDE8]">
                  GridXchange
                </span>
                <span className="w-2 h-2 rounded-full bg-[#2D6A4F] dark:bg-[#52B788]" />
              </div>
              <span className="text-[10px] tracking-widest uppercase text-[#8D9188] font-mono">
                Clean Energy Exchange
              </span>
            </div>
          </button>

          {/* Clean Public Nav Links with Animated Underline */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#686B63] dark:text-[#9EA299]">
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="nav-link-animated hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] transition-colors cursor-pointer py-1"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('for-consumers')}
              className="nav-link-animated hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] transition-colors cursor-pointer py-1"
            >
              For Consumers
            </button>
            <button
              onClick={() => handleNavClick('for-prosumers')}
              className="nav-link-animated hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] transition-colors cursor-pointer py-1"
            >
              For Prosumers
            </button>
            <button
              onClick={() => handleNavClick('rebalance-section')}
              className="nav-link-animated hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] transition-colors cursor-pointer py-1"
            >
              Resilience
            </button>
            <button
              onClick={() => {
                setActiveTab('impact');
                setMobileMenuOpen(false);
              }}
              className={`nav-link-animated hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] transition-colors cursor-pointer py-1 ${
                activeTab === 'impact' ? 'text-[#1A1B19] dark:text-[#EDEDE8] font-bold active' : ''
              }`}
            >
              Impact
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="nav-link-animated hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] transition-colors cursor-pointer py-1"
            >
              About
            </button>
          </nav>
        </div>

        {/* Right Controls: Theme Toggle & Authenticated User Details / Login */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full text-[#686B63] hover:text-[#1A1B19] dark:text-[#9EA299] dark:hover:text-[#EDEDE8] hover:bg-[#EFECE4] dark:hover:bg-[#1E1F1C] transition-colors cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-[#1A1B19]" />
            ) : (
              <Sun className="w-4 h-4 text-[#E5A93C]" />
            )}
          </button>

          {/* Authenticated User state */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* Dashboard Shortcut */}
              <button
                onClick={handleGoToDashboard}
                className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'consumer' || activeTab === 'prosumer' || activeTab === 'admin'
                    ? 'bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19]'
                    : 'bg-[#EFECE4] dark:bg-[#1E1F1C] text-[#1A1B19] dark:text-[#EDEDE8] hover:bg-[#E5E0D4]'
                }`}
              >
                <span>My Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* User Avatar & Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#E6E2D8] dark:border-[#2C2D29] bg-[#FFFFFF] dark:bg-[#171816] hover:bg-[#F3EFE8] dark:hover:bg-[#20211D] transition-colors text-left cursor-pointer shadow-xs"
                >
                  <div className="w-7 h-7 rounded-full bg-[#EFECE4] dark:bg-[#262824] text-[#1A1B19] dark:text-[#EDEDE8] flex items-center justify-center text-xs font-bold font-heading">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-[#1A1B19] dark:text-[#EDEDE8] leading-tight">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-[#8D9188] uppercase tracking-wider font-mono">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8D9188]" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#FFFFFF] dark:bg-[#1A1B18] border border-[#E6E2D8] dark:border-[#2C2D29] shadow-xl p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-[#EFECE4] dark:border-[#262723]">
                      <span className="text-[10px] uppercase font-mono text-[#8D9188] block font-semibold">
                        Logged in as:
                      </span>
                      <div className="font-bold text-[#1A1B19] dark:text-[#EDEDE8] text-sm mt-0.5">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-[#8D9188] font-mono">
                        {user.email}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F2EC] dark:bg-[#1B2920] text-[#2D6A4F] dark:text-[#52B788] text-[10px] font-mono font-bold uppercase">
                        Role: {user.role}
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      <button
                        onClick={handleGoToDashboard}
                        className="w-full text-left px-3 py-2 rounded-xl text-[#1A1B19] dark:text-[#EDEDE8] hover:bg-[#FAF8F5] dark:hover:bg-[#20211E] font-medium flex items-center justify-between"
                      >
                        <span>Open Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8D9188]" />
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onTriggerRebalanceDemo();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-[#B45309] dark:text-[#E5A93C] hover:bg-[#FEF3C7]/40 dark:hover:bg-[#2A2312] font-semibold flex items-center gap-2"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Simulate Auto-Rebalance</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-[#EFECE4] dark:border-[#262723]">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#686B63] dark:text-[#9EA299] hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] hover:bg-[#EFECE4] dark:hover:bg-[#1E1F1C] transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('select')}
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#1A1B19] dark:bg-[#EDEDE8] hover:bg-[#2C2D29] dark:hover:bg-[#FFFFFF] text-white dark:text-[#1A1B19] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full text-[#686B63] dark:text-[#9EA299] hover:bg-[#EFECE4] dark:hover:bg-[#1E1F1C] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E6E2D8] dark:border-[#262723] bg-[#FAF8F5] dark:bg-[#0F100E] px-4 py-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-[#686B63] dark:text-[#9EA299]">
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="text-left py-2 hover:text-[#1A1B19] dark:hover:text-[#EDEDE8]"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('for-consumers')}
              className="text-left py-2 hover:text-[#1A1B19] dark:hover:text-[#EDEDE8]"
            >
              For Consumers
            </button>
            <button
              onClick={() => handleNavClick('for-prosumers')}
              className="text-left py-2 hover:text-[#1A1B19] dark:hover:text-[#EDEDE8]"
            >
              For Prosumers
            </button>
            <button
              onClick={() => handleNavClick('rebalance-section')}
              className="text-left py-2 hover:text-[#1A1B19] dark:hover:text-[#EDEDE8]"
            >
              Resilience
            </button>
            <button
              onClick={() => {
                setActiveTab('impact');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-[#1A1B19] dark:hover:text-[#EDEDE8]"
            >
              Impact
            </button>
          </nav>

          <div className="pt-4 border-t border-[#E6E2D8] dark:border-[#262723] flex flex-col gap-2">
            {user ? (
              <div className="space-y-2">
                <div className="p-3 bg-[#FFFFFF] dark:bg-[#171816] rounded-xl border border-[#E6E2D8] dark:border-[#2C2D29]">
                  <div className="font-bold text-xs text-[#1A1B19] dark:text-[#EDEDE8]">{user.name}</div>
                  <div className="text-[10px] text-[#8D9188] uppercase font-mono">{user.role}</div>
                </div>
                <button
                  onClick={handleGoToDashboard}
                  className="w-full py-2.5 rounded-xl bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] text-xs font-semibold text-center"
                >
                  My Dashboard
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold text-center"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#E6E2D8] dark:border-[#2C2D29] text-xs font-semibold text-center"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('select');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] text-xs font-semibold text-center"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
