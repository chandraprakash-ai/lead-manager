import { ActionHistoryProvider } from './context/ActionHistoryContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import { ToastProvider } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import LeadsPage from './pages/LeadsPage';
import NichesPage from './pages/NichesPage';
import CitiesPage from './pages/CitiesPage';
import CountriesPage from './pages/CountriesPage';
import ActivityPage from './pages/ActivityPage';
import SettingsPage from './pages/SettingsPage';
import BillingPage from './pages/BillingPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import LandingPage from './pages/LandingPage';
import AuthLayout from './layouts/AuthLayout';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <ActionHistoryProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />

                  {/* Protected Routes */}
                  <Route element={<AuthLayout />}>
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="leads" element={<LeadsPage />} />
                      <Route path="niches" element={<NichesPage />} />
                      <Route path="cities" element={<CitiesPage />} />
                      <Route path="countries" element={<CountriesPage />} />
                      <Route path="activity" element={<ActivityPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="settings/billing" element={<BillingPage />} />
                    </Route>
                  </Route>
                </Routes>
              </BrowserRouter>
            </ActionHistoryProvider>
          </ToastProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

