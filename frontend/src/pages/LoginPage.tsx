import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useLocation } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { loginSchema } from '../auth/schemas';
import type { LoginInput } from '../auth/schemas';

export default function LoginPage() {
  const auth = useAuth();
  const location = useLocation();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit(async (data) => {
    try {
      await auth.login(data);
      // GuestRoute redirige cuando el proveedor confirma la sesión persistida.
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'No se pudo iniciar sesión.' });
    }
  });

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h4" gutterBottom>Iniciar sesión</Typography>
        <Typography color="text.secondary">Ingresa con tu correo y contraseña.</Typography>
      </Box>
      {location.state?.registered === true && <Alert severity="success">Cuenta creada. Ya puedes iniciar sesión.</Alert>}
      <Box component="form" noValidate onSubmit={submit} aria-busy={isSubmitting}>
        <Stack spacing={2}>
          {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
          <TextField label="Correo electrónico" type="email" autoComplete="email" fullWidth disabled={isSubmitting}
            {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
          <TextField label="Contraseña" type="password" autoComplete="current-password" fullWidth disabled={isSubmitting}
            {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting} loading={isSubmitting} loadingPosition="start">
            {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
          </Button>
        </Stack>
      </Box>
      <Typography variant="body2">¿No tienes cuenta? <Link component={RouterLink} to="/register">Crear cuenta</Link></Typography>
    </Stack>
  );
}
