import type { NextFunction, Request, Response } from 'express';

// Express 5 envía aquí los errores al leer el JSON y los de las funciones async.
export function errorHandler(error: unknown, _request: Request, response: Response, next: NextFunction) {
  if (response.headersSent) {
    next(error);
    return;
  }
  const status = typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    response.status(status).json({ error: { code: 'invalid_request', message: 'La solicitud no se pudo interpretar o excede los límites permitidos.' } });
    return;
  }
  response.status(500).json({ error: { code: 'internal_error', message: 'No se pudo procesar la solicitud.' } });
}
