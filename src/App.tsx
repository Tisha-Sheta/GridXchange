/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { ConsumerDashboard } from './pages/ConsumerDashboard';
import { ProsumerDashboard } from './pages/ProsumerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CommunityImpactPage } from './pages/CommunityImpactPage';
import { AuthModal } from './pages/AuthModal';
import { RebalanceVisualModal } from './components/RebalanceVisualModal';
import { api } from './services/apiClient';
import { Zap } from 'lucide-react';

function MainLayout() {
  const { user } = useAuth();
  const [activeTab, setActiveTabState] = useState<string>(() => {
    const saved = localStorage.getItem('gridxchange_active_tab');
    return saved || 'landing';
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'select' | 'login' | 'register'>('select');
  const [preselectedRole, setPreselectedRole] = useState<'consumer' | 'prosumer'>('consumer');
  const [rebalanceModalOpen, setRebalanceModalOpen] = useState(false);

  const setActiveTab = (tab: string) => {
    localStorage.setItem('gridxchange_active_tab', tab);
    setActiveTabState(tab);
  };

  const handleOpenAuth = (mode: 'select' | 'login' | 'register' = 'select', role: 'consumer' | 'prosumer' = 'consumer') => {
    setAuthModalMode(mode);
    setPreselectedRole(role);
    setAuthModalOpen(true);
  };

  const handleEnterAsRole = (requestedRole: 'consumer' | 'prosumer' | 'admin') => {
    if (!user) {
      // Not logged in: open auth modal with that role selected
      handleOpenAuth('select', requestedRole === 'prosumer' ? 'prosumer' : 'consumer');
      return;
    }

    // Already logged in: check role
    if (user.role === requestedRole) {
      setActiveTab(requestedRole);
    } else {
      // Role mismatch: do NOT silently switch the account!
      const roleName = user.role.charAt(0).toUpperCase() + user.role.slice(1);
      const targetName = requestedRole.charAt(0).toUpperCase() + requestedRole.slice(1);
      const wantSwitch = window.confirm(
        `You are currently logged in as ${user.name} (${roleName}).\n\nTo access the ${targetName} portal, you need to sign in with a ${targetName} account.\n\nWould you like to sign out and log into another account?`
      );
      if (wantSwitch) {
        api.logout();
        window.location.reload();
      }
    }
  };

  const handleTriggerRebalanceDemo = async () => {
    try {
      await api.simulateMeterShortfall({
        prosumerId: 'p_001',
        actualDelivered: 3.5,
      });
    } catch {
      // ignore
    }
    setRebalanceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F100E] text-[#1A1B19] dark:text-[#EDEDE8] flex flex-col font-sans selection:bg-[#EFE8D8] dark:selection:bg-[#2C2D29] selection:text-[#1A1B19] dark:selection:text-[#EDEDE8] transition-colors">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={handleOpenAuth}
        onTriggerRebalanceDemo={handleTriggerRebalanceDemo}
      />

      {/* Main Tab Routing */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onEnterAs={handleEnterAsRole}
            onTriggerRebalanceDemo={handleTriggerRebalanceDemo}
          />
        )}
        {activeTab === 'consumer' && (
          <ConsumerDashboard
            onTriggerRebalanceDemo={handleTriggerRebalanceDemo}
            onNavigateTab={setActiveTab}
          />
        )}
        {activeTab === 'prosumer' && (
          <ProsumerDashboard
            onTriggerRebalanceDemo={handleTriggerRebalanceDemo}
            onNavigateTab={setActiveTab}
          />
        )}
        {activeTab === 'admin' && (
          <AdminDashboard onTriggerRebalanceDemo={handleTriggerRebalanceDemo} />
        )}
        {activeTab === 'impact' && <CommunityImpactPage />}
      </main>

      {/* Refined Editorial Footer */}
      <footer className="border-t border-[#E6E2D8] dark:border-[#262723] bg-[#FAF8F5] dark:bg-[#0F100E] py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#686B63] dark:text-[#8D9188]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1A1B19] dark:bg-[#EDEDE8] text-white dark:text-[#1A1B19] flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 text-[#E5A93C] dark:text-[#D97706] fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-sm text-[#1A1B19] dark:text-[#EDEDE8]">
                GridXchange
              </span>
              <span className="font-mono text-[10px] text-[#8D9188]">
                Decentralized Clean Energy Trading
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
            <button
              onClick={() => {
                setActiveTab('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] transition-colors cursor-pointer"
            >
              Overview
            </button>
            <button
              onClick={() => handleEnterAsRole('consumer')}
              className="hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] transition-colors cursor-pointer"
            >
              Consumer Portal
            </button>
            <button
              onClick={() => handleEnterAsRole('prosumer')}
              className="hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] transition-colors cursor-pointer"
            >
              Prosumer Portal
            </button>
            <button
              onClick={() => handleEnterAsRole('admin')}
              className="hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] transition-colors cursor-pointer"
            >
              Control Room
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              className="hover:text-[#1A1B19] dark:hover:text-[#EDEDE8] transition-colors cursor-pointer"
            >
              Impact Index
            </button>
          </div>

          <div className="text-[11px] font-mono text-[#8D9188]">
            Peer-to-Peer Microgrid Architecture
          </div>
        </div>
      </footer>

      {/* Rebalancing Visual Demonstration Modal */}
      <RebalanceVisualModal
        isOpen={rebalanceModalOpen}
        onClose={() => setRebalanceModalOpen(false)}
        onViewConsumerDashboard={() => {
          setRebalanceModalOpen(false);
          if (user?.role === 'consumer') {
            setActiveTab('consumer');
          } else {
            setActiveTab('landing');
          }
        }}
      />

      {/* Authentication & Persona Picker Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        preselectedRole={preselectedRole}
        onSelectRole={(role) => {
          if (role === 'consumer') setActiveTab('consumer');
          else if (role === 'prosumer') setActiveTab('prosumer');
          else setActiveTab('admin');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
