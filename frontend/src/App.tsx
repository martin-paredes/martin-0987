import { lazy, Suspense } from 'react';
import { Container, CssBaseline, LinearProgress, Paper } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router';
import { AuthProvider } from './auth/AuthProvider';
import { GuestRoute, ProtectedRoute } from './auth/AuthRoutes';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

export default function App() {
  return (
    <AuthProvider>
      <CssBaseline />
      <Container component="main" maxWidth="sm" sx={{ py: { xs: 3, sm: 8 } }}>
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 } }}>
          <Suspense fallback={<LinearProgress aria-label="Cargando página" />}>
            <Routes>
              <Route element={<GuestRoute />}>
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Paper>
      </Container>
    </AuthProvider>
  );
}
