import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useId } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

export function BalanceCard({ balance }: { balance: number }) {
  const titleId = useId();
  const availabilityId = useId();

  return (
    <Card component="section" variant="outlined" aria-labelledby={titleId} sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} useFlexGap
          sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Typography id={titleId} component="h2" variant="subtitle1" color="text.secondary">Saldo disponible</Typography>
            <Typography component="p" variant="h3" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
              {formatCurrency(balance)}
            </Typography>
            <Typography variant="body2" color="text.secondary">Pesos mexicanos · MXN</Typography>
          </Stack>
          <Stack spacing={1} sx={{ width: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}>
            <Button variant="contained" size="large" disabled aria-describedby={availabilityId}>Cargar saldo</Button>
            <Typography id={availabilityId} variant="body2" color="text.secondary">Disponible próximamente</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
