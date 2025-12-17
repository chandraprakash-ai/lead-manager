import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import LeadsPage from './pages/LeadsPage';
import NichesPage from './pages/NichesPage';
import CitiesPage from './pages/CitiesPage';

import AuthLayout from './layouts/AuthLayout';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="niches" element={<NichesPage />} />
              <Route path="cities" element={<CitiesPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
