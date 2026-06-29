/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

import { reportarFalla } from './api';
import ApiIntegrationGuide from './components/ApiIntegrationGuide';
import OnboardingView from './components/OnboardingView';
import ReportFoundForm from './components/ReportFoundForm';
import SearchMissingForm from './components/SearchMissingForm';
import ErrorReportModal from './components/layout/ErrorReportModal';
import FlagBar from './components/layout/FlagBar';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import TabSwitcher from './components/layout/TabSwitcher';
import { INITIAL_FOUND_PERSONS } from './data';
import { useErrorReport } from './hooks/useErrorReport';
import { FoundPerson } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'inicio' | 'buscar' | 'reportar' | 'api'>('inicio');
  const [foundPersons, setFoundPersons] = useState<FoundPerson[]>([]);

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
  }, []);

  const savePersons = (updatedList: FoundPerson[]) => {
    setFoundPersons(updatedList);
    localStorage.setItem('ven_disaster_found_persons', JSON.stringify(updatedList));
  };

  const handleAddPerson = (newPerson: FoundPerson) => {
    savePersons([newPerson, ...foundPersons]);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden" id="app-root-container">
      <FlagBar />
      <Header onOpenErrorReport={errorReport.openModal} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col">
        {activeTab !== 'inicio' && activeTab !== 'api' && (
          <TabSwitcher onChange={setActiveTab as any} />
        )}

        {activeTab === 'inicio' && <OnboardingView onSelect={setActiveTab} />}
        {activeTab === 'buscar' && <SearchMissingForm />}
        {activeTab === 'reportar' && <ReportFoundForm onAddPerson={handleAddPerson} />}
        {activeTab === 'api' && <ApiIntegrationGuide />}
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
