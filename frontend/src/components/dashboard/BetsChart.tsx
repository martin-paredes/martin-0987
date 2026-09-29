import { useId } from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { BetStatistics } from '../../types/dashboard';

export function BetsChart({ statistics }: { statistics: BetStatistics }) {
  const titleId = useId();
  const total = statistics.won + statistics.lost;
  const data = [
    { name: 'Ganadas', value: statistics.won, fill: '#00796b' },
    { name: 'Perdidas', value: statistics.lost, fill: '#c45527' },
  ];

  return (
    <Card component="section" variant="outlined" aria-labelledby={titleId} sx={{ height: '100%', borderRadius: 2, minWidth: 0 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography id={titleId} component="h2" variant="h6">Resultados de apuestas</Typography>
        <Typography variant="body2" color="text.secondary">{total} apuestas simuladas en total</Typography>
        {total === 0 ? (
          <Box sx={{ height: 280, display: 'grid', placeItems: 'center' }}>
            <Typography color="text.secondary">Sin apuestas para mostrar.</Typography>
          </Box>
        ) : (
          <Box sx={{ height: 280, minWidth: 0, my: 1 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart accessibilityLayer aria-label="Distribución de apuestas ganadas y perdidas">
                <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="85%"
                  startAngle={90} endAngle={-270} isAnimationActive={false} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}
        <Stack component="ul" direction="row" spacing={3} useFlexGap
          sx={{ m: 0, p: 0, listStyle: 'none', flexWrap: 'wrap', justifyContent: 'center' }}>
          {data.map((entry) => (
            <Box component="li" key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" aria-hidden="true" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entry.fill }} />
              <Typography variant="body2">{entry.name}: <strong>{entry.value}</strong></Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
