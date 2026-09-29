import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../auth/AuthContext';
import { paymentFormSchema } from '../../schemas/paymentSchema';
import type { PaymentFormInput } from '../../schemas/paymentSchema';
import { processPayment } from '../../services/paymentService';

export function BalanceTopUpDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const { user, applyPayment } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<AbortController | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PaymentFormInput>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: { cardNumber: '', expirationDate: '', cvv: '', fullName: user?.fullName ?? '' },
  });

  useEffect(() => () => { pending.current?.abort(); }, []);

  function close() {
    if (pending.current || isSubmitting) return;
    reset();
    setError(null);
    onClose();
  }

  async function submit(data: PaymentFormInput) {
    if (!user || pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setError(null);
    try {
      const payment = await processPayment({ ...data, payerId: user.id, payerEmail: user.email }, controller.signal);
      if (controller.signal.aborted) return;
      applyPayment(payment);
      if (payment.status === 'approved') {
        reset();
        onSuccess();
      } else if (payment.status === 'rejected') {
        setError('La transacción fue rechazada. Verifica los datos e intenta nuevamente.');
      } else {
        setError(payment.status_detail === 'gateway_timeout'
          ? 'La operación tardó demasiado. Intenta nuevamente.'
          : 'No fue posible procesar la recarga. Intenta nuevamente.');
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(error instanceof Error ? error.message : 'No fue posible completar la recarga.');
      }
    } finally {
      pending.current = null;
    }
  }

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="xs" aria-labelledby="top-up-title">
      <DialogTitle id="top-up-title">Cargar saldo</DialogTitle>
      <Box component="form" noValidate autoComplete="off" onSubmit={(event) => { void handleSubmit(submit)(event); }} aria-busy={isSubmitting}>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2}>
            <Alert severity="info">Utiliza únicamente datos ficticios.</Alert>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Número de tarjeta" autoFocus fullWidth disabled={isSubmitting}
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
              {...register('cardNumber')} error={!!errors.cardNumber} helperText={errors.cardNumber?.message} />
            <TextField label="Fecha de vencimiento" placeholder="MM/YY" fullWidth disabled={isSubmitting}
              {...register('expirationDate')} error={!!errors.expirationDate} helperText={errors.expirationDate?.message ?? 'Formato MM/YY'} />
            <TextField label="CVV" type="password" fullWidth disabled={isSubmitting}
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
              {...register('cvv')} error={!!errors.cvv} helperText={errors.cvv?.message} />
            <TextField label="Nombre completo" fullWidth disabled={isSubmitting}
              {...register('fullName')} error={!!errors.fullName} helperText={errors.fullName?.message} />
            <TextField label="Monto de recarga" type="number" fullWidth disabled={isSubmitting}
              slotProps={{ htmlInput: { step: '0.01', inputMode: 'decimal' } }}
              {...register('amount', { valueAsNumber: true })} error={!!errors.amount} helperText={errors.amount?.message ?? 'Importe en MXN'} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={close} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Procesando…' : 'Realizar recarga'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
