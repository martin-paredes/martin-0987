import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { registerSchema } from '../auth/schemas';
import type { RegisterInput } from '../auth/schemas';

export default function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const submit = handleSubmit(async (data) => {
    try {
      await auth.register(data);
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'No se pudo completar el registro.' });
    }
  });

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h4" gutterBottom>Crear cuenta</Typography>
        <Typography color="text.secondary">Registra tu cuenta para comenzar.</Typography>
      </Box>
      <Box component="form" noValidate onSubmit={submit} aria-busy={isSubmitting}>
        <Stack spacing={2}>
          {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
          <TextField label="Nombre completo" autoComplete="name" fullWidth disabled={isSubmitting}
            {...register('fullName')} error={!!errors.fullName} helperText={errors.fullName?.message} />
          <TextField label="Correo electrónico" type="email" autoComplete="email" fullWidth disabled={isSubmitting}
            {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
          <TextField label="Contraseña" type="password" autoComplete="new-password" fullWidth disabled={isSubmitting}
            {...register('password')} error={!!errors.password} helperText={errors.password?.message ?? 'Al menos 8 caracteres.'} />
          <TextField label="Confirmar contraseña" type="password" autoComplete="new-password" fullWidth disabled={isSubmitting}
            {...register('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </Button>
        </Stack>
      </Box>
      <Typography variant="body2">¿Ya tienes cuenta? <Link component={RouterLink} to="/login">Inicia sesión</Link></Typography>
    </Stack>
  );
}
