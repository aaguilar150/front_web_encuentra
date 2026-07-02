/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shell de la aplicación: layout (header/footer), navegación entre las dos
 * vistas (Buscar / Reportar), onboarding y modal de reporte de error.
 * La lógica de cada flujo vive en su vista (`views/`); aquí solo se rutea.
 */
import React, { useState } from 'react';
import { Search, PlusCircle, Info } from 'lucide-react';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FlagBar from './components/layout/FlagBar';
import OnboardingModal from './components/modals/OnboardingModal';
import ErrorReportModal from './components/modals/ErrorReportModal';
import SearchView from './views/search/SearchView';
import ReportView from './views/report/ReportView';

// Elementos de luisdev
import MenuView from './components/MenuView';
import ApiIntegrationGuide from './components/ApiIntegrationGuide';
import OnboardingView from './components/OnboardingView';

type Tab = 'inicio' | 'buscar' | 'reportar' | 'api' | 'testimonios';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [infoTip, setInfoTip] = useState<Tab | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // El onboarding se muestra solo la primera visita (marca en localStorage).
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('ven_onboarded'));

  const closeOnboarding = () => {
    localStorage.setItem('ven_onboarded', '1');
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden" id="app-root-container">
      {showOnboarding && (
        <OnboardingModal
          onClose={closeOnboarding}
          onSelect={(tab) => { setActiveTab(tab as Tab); closeOnboarding(); }}
        />
      )}

      <FlagBar />
      <Header 
        activeTab={activeTab}
        onChangeTab={(tab) => { setActiveTab(tab); setIsMenuOpen(false); }}
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        onReportError={() => setIsErrorModalOpen(true)} 
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {isMenuOpen ? (
          <MenuView 
            activeTab={activeTab as any} 
            onSelect={(tab) => { setActiveTab(tab as Tab); setIsMenuOpen(false); }} 
            onOpenErrorReport={() => { setIsErrorModalOpen(true); setIsMenuOpen(false); }} 
          />
        ) : (
          <>


            {/* Vista activa */}
            {activeTab === 'inicio' && <OnboardingView onSelect={setActiveTab} />}
            {activeTab === 'buscar' && <SearchView onBack={() => setActiveTab('inicio')} />}
            {activeTab === 'reportar' && <ReportView onBack={() => setActiveTab('inicio')} />}
            {activeTab === 'api' && <ApiIntegrationGuide />}
            {activeTab === 'testimonios' && (
              <div className="w-full max-w-4xl mx-auto py-12 text-center animate-[fadeIn_0.2s_ease-out]">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Testimonios</h2>
                <p className="text-slate-500">Próximamente...</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      <ErrorReportModal open={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)} />
    </div>
  );
}
