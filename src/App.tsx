import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AssetOverview } from './pages/AssetOverview';
import { Portfolio } from './pages/Portfolio';
import { AccountPage } from './pages/AccountPage';
import { DataProvider } from './context/DataContext';
import { BankGroupPage } from './pages/BankGroupPage';
import { StubPage } from './pages/StubPage';
import { BudgetPlanner } from './pages/BudgetPlanner';
import { ThemeProvider } from './context/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<AssetOverview />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="budget" element={<BudgetPlanner />} />
              <Route path="account-details" element={<Navigate to="/dashboard" replace />} />
              <Route path="reports" element={<Navigate to="/dashboard" replace />} />
              <Route path="account/:id" element={<AccountPage />} />
              <Route path="bank-group/:groupId" element={<BankGroupPage />} />
              <Route path="stub/:id" element={<StubPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
