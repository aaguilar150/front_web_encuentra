/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

import { reportarFalla } from './api';
import ApiIntegrationGuide from './components/ApiIntegrationGuide';
import OnboardingModal from './components/OnboardingModal';
import ReportFoundForm from './components/ReportFoundForm';
import SearchMissingForm from './components/SearchMissingForm';
import ErrorReportModal from './components/layout/ErrorReportModal';
import FlagBar from './components/layout/FlagBar';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import StatsBar from './components/layout/StatsBar';
import TabSwitcher from './components/layout/TabSwitcher';
import { INITIAL_FOUND_PERSONS } from './data';
import { useErrorReport } from './hooks/useErrorReport';
import { FoundPerson } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'buscar' | 'reportar' | 'api'>('reportar');
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('ven_onboarded'));
  const [foundPersons, setFoundPersons] = useState<FoundPerson[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>(() => localStorage.getItem('ven_disaster_last_updated') || new Date().toISOString());
  const [now, setNow] = useState(() => Date.now());
  const [stats, setStats] = useState({
    totalFound: 142,
    totalMissingSearched: 485,
    reunitedCount: 58,
    activeShelters: 12,
  });

  const errorReport = useErrorReport(reportarFalla);

  useEffect(() => {
    const stored = localStorage.getItem('ven_disaster_found_persons');
    if (stored) {
      try {
        setFoundPersons(JSON.parse(stored));
      } catch {
        setFoundPersons(INITIAL_FOUND_PERSONS);
      }
    } else {
      setFoundPersons(INITIAL_FOUND_PERSONS);
      localStorage.setItem('ven_disaster_found_persons', JSON.stringify(INITIAL_FOUND_PERSONS));
    }

    const storedStats = localStorage.getItem('ven_disaster_stats');
    if (storedStats) {
      try {
        setStats(JSON.parse(storedStats));
      } catch {
        // use default state
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const closeOnboarding = () => {
    localStorage.setItem('ven_onboarded', '1');
    setShowOnboarding(false);
  };

  const formatAgo = (iso: string) => {
    const seconds = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
    if (seconds < 60) return `hace ${seconds} seg`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes ? `hace ${hours}h ${remainingMinutes}min` : `hace ${hours}h`;
  };

  const savePersons = (updatedList: FoundPerson[]) => {
    setFoundPersons(updatedList);
    localStorage.setItem('ven_disaster_found_persons', JSON.stringify(updatedList));

    const updatedAt = new Date().toISOString();
    setLastUpdated(updatedAt);
    localStorage.setItem('ven_disaster_last_updated', updatedAt);

    const nextStats = {
      ...stats,
      totalFound: 137 + (updatedList.length - INITIAL_FOUND_PERSONS.length),
    };
    setStats(nextStats);
    localStorage.setItem('ven_disaster_stats', JSON.stringify(nextStats));
  };

  const handleAddPerson = (newPerson: FoundPerson) => {
    savePersons([newPerson, ...foundPersons]);
  };

  const statItems = [
    { label: 'Rostros encontrados', value: foundPersons.length, color: 'bg-emerald-400' },
    { label: 'Personas reportadas', value: stats.totalFound, color: 'bg-blue-400' },
    { label: 'Matches realizados', value: stats.reunitedCount, color: 'bg-rose-400' },
    { label: 'Última actualización', value: formatAgo(lastUpdated), color: 'bg-amber-400' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden" id="app-root-container">
      {showOnboarding && <OnboardingModal onClose={closeOnboarding} />}

      <FlagBar />
      <Header onOpenErrorReport={errorReport.openModal} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <TabSwitcher activeTab={activeTab === 'buscar' ? 'buscar' : 'reportar'} onChange={setActiveTab} />

        {activeTab === 'buscar' && <SearchMissingForm />}
        {activeTab === 'reportar' && <ReportFoundForm onAddPerson={handleAddPerson} />}
        {activeTab === 'api' && <ApiIntegrationGuide />}

        <StatsBar items={statItems} />
      </main>

      <Footer />

      <ErrorReportModal
        isOpen={errorReport.isOpen}
        errorText={errorReport.errorText}
        sending={errorReport.sending}
        sent={errorReport.sent}
        sendError={errorReport.sendError}
        onChangeText={errorReport.setErrorText}
        onClose={errorReport.closeModal}
        onSubmit={errorReport.submit}
      />
    </div>
  );
}
