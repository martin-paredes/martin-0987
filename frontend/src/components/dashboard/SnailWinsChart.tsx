import { useId } from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SnailWinStatistic } from '../../types/dashboard';

export function SnailWinsChart({ statistics, raceCount }: { statistics: SnailWinStatistic[]; raceCount: number }) {
  const titleId = useId();

  return (
    <Card component="section" variant="outlined" aria-labelledby={titleId} sx={{ height: '100%', borderRadius: 2, minWidth: 0 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography id={titleId} component="h2" variant="h6">Victorias de caracoles</Typography>
        <Typography variant="body2" color="text.secondary">{raceCount} carreras simuladas del día · {statistics.length} caracoles</Typography>
        <Box sx={{ height: 280, minWidth: 0, my: 1 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={statistics} layout="vertical" accessibilityLayer aria-label="Victorias por caracol"
              margin={{ top: 8, right: 24, bottom: 16, left: 0 }}>
              <CartesianGrid horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} domain={[0, raceCount]}
                tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false}
                label={{ value: 'Victorias', position: 'insideBottom', offset: -12, fill: '#475569' }} />
              <YAxis type="category" dataKey="name" width={62} interval={0}
                tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="wins" name="Victorias" fill="#2563a6" barSize={20} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                <LabelList dataKey="wins" position="right" fill="#334155" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <Stack component="ul" direction="row" spacing={1} useFlexGap aria-label="Resumen de victorias"
          sx={{ p: 0, m: 0, listStyle: 'none', flexWrap: 'wrap' }}>
          {statistics.map((snail) => (
            <Typography component="li" variant="body2" key={snail.name}
              sx={{ px: 1, py: 0.5, bgcolor: '#f1f5f9', borderRadius: 1 }}>
              {snail.name}: {snail.wins}
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
