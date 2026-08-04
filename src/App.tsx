import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AccountsPage } from "./pages/AccountsPage";
import { AccountDetailPage } from "./pages/AccountDetailPage";
import { CreateAccountPage } from "./pages/CreateAccountPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { TransferPage } from "./pages/TransferPage";
import { PaymentPage } from "./pages/PaymentPage";
import { AdminsPage } from "./pages/AdminsPage";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/accounts/new" element={<CreateAccountPage />} />
                <Route path="/accounts/:accountNumber" element={<AccountDetailPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/transactions/new" element={<TransferPage />} />
                <Route path="/payments/new" element={<PaymentPage />} />
                <Route path="/admins" element={<AdminsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
