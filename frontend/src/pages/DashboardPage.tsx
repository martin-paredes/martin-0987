import { Box, Chip, Container, Stack, Typography } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { BetsChart } from '../components/dashboard/BetsChart';
import { SnailWinsChart } from '../components/dashboard/SnailWinsChart';
import { betStatistics, DAILY_RACE_COUNT, snailWins } from '../data/dashboardData';

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb' }}>
      <DashboardHeader fullName={user.fullName} />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <BalanceCard balance={user.balance} />
          <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
            <Chip label="Estadísticas simuladas" size="small" variant="outlined" />
            <Typography variant="body2" color="text.secondary">Un resumen de apuestas y carreras de demostración.</Typography>
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' }, gap: 3 }}>
            <BetsChart statistics={betStatistics} />
            <SnailWinsChart statistics={snailWins} raceCount={DAILY_RACE_COUNT} />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
