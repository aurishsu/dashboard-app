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
import { Reports } from './pages/Reports';
import { PublicHome } from './pages/PublicHome';
import { SetupFlow } from './pages/SetupFlow';
import { PricingPage } from './pages/PricingPage';
import { CheckoutPage } from './pages/CheckoutPage';

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicHome />} />
            <Route path="/setup" element={<SetupFlow />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<AssetOverview />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/budget" element={<BudgetPlanner />} />
              <Route path="/account-details" element={<Navigate to="/dashboard" replace />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/account/:id" element={<AccountPage />} />
              <Route path="/bank-group/:groupId" element={<BankGroupPage />} />
              <Route path="/stub/:id" element={<StubPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
