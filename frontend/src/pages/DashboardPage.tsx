import { useState } from 'react';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { useAuth } from '../auth/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  if (!user) return null;

  function handleLogout() {
    try {
      logout();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo cerrar sesión.');
    }
  }

  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h4">Hola, {user.fullName}</Typography>
      <Typography variant="h5">Saldo actual: ${user.balance.toLocaleString('en-US')}</Typography>
      <Typography color="text.secondary">Este es tu espacio inicial. El dashboard se completará posteriormente.</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="outlined" onClick={handleLogout}>Cerrar sesión</Button>
    </Stack>
  );
}
