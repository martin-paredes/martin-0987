import { lazy, Suspense } from 'react';
import { Container, createTheme, CssBaseline, LinearProgress, Paper, ThemeProvider } from '@mui/material';
import { Navigate, Outlet, Route, Routes } from 'react-router';
import { AuthProvider } from './auth/AuthProvider';
import { GuestRoute, ProtectedRoute } from './auth/AuthRoutes';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', minHeight: 44 } },
    },
  },
});

function AuthLayout() {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: { xs: 3, sm: 8 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 } }}><Outlet /></Paper>
    </Container>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <CssBaseline />
        <Suspense fallback={<LinearProgress aria-label="Cargando página" />}>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}
