import { useState } from 'react';
import { Alert, AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';
import { useAuth } from '../../auth/AuthContext';

export function DashboardHeader({ fullName }: { fullName: string }) {
  const { logout } = useAuth();
  const [error, setError] = useState<string | null>(null);

  function handleLogout() {
    try {
      logout();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo cerrar sesión.');
    }
  }

  return (
    <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap
            sx={{ width: '100%', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="overline" color="text.secondary">Full-Stack App</Typography>
              <Typography component="h1" variant="h5" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
                Hola, {fullName}
              </Typography>
            </Box>
            <Button variant="outlined" onClick={handleLogout} sx={{ flexShrink: 0 }}>Cerrar sesión</Button>
          </Stack>
        </Toolbar>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      </Container>
    </AppBar>
  );
}
