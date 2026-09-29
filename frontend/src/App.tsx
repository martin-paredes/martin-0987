import { Container, CssBaseline, Paper, Typography } from '@mui/material';

export default function App() {
  return (
    <>
      <CssBaseline />
      <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Full-Stack App
          </Typography>
          <Typography color="text.secondary">
            Entorno inicial listo para desarrollar.
          </Typography>
        </Paper>
      </Container>
    </>
  );
}
