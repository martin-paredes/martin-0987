# Full-Stack App

Base de una aplicación Full-Stack con frontend y backend independientes en un monorepo sencillo.
La versión inicial incluye una pantalla de bienvenida y un endpoint técnico de salud.

## Tech Stack

- React y TypeScript: interfaz con tipado estricto.
- Vite: servidor de desarrollo y build del frontend.
- Material UI y Emotion: componentes visuales y estilos.
- React Router: proveedor de navegación configurado en la entrada del frontend.
- React Hook Form, Zod y `@hookform/resolvers`: dependencias preparadas para formularios y validación.
- Recharts: dependencia preparada para futuras gráficas.
- Node.js, Express y cors: API HTTP y comunicación entre orígenes en desarrollo.
- Zod: validación del puerto del backend.
- tsx: ejecución de TypeScript con recarga durante el desarrollo.
- Vitest, React Testing Library, jest-dom, jsdom y Supertest: pruebas de interfaz y API.
- ESLint y typescript-eslint: revisión estática del código.

Las dependencias de formularios y gráficas están instaladas para las siguientes fases; aún no hay formularios ni gráficas.

## Project Structure

```text
frontend/
  src/
    test/setup.ts       # Configuración de Testing Library
    App.tsx             # Pantalla inicial con Material UI
    App.test.tsx         # Prueba de renderizado
    config.ts           # URL base centralizada del API
    main.tsx            # Entrada y BrowserRouter
  .env.example
  vite.config.ts
backend/
  src/
    app.ts              # Express y endpoint de salud
    app.test.ts          # Prueba HTTP con Supertest
    server.ts           # Validación del puerto y listen
  .env.example
  vitest.config.ts
eslint.config.js        # Configuración compartida de lint
package.json            # npm workspaces y scripts raíz
package-lock.json       # Versiones resueltas para ambos workspaces
```

Los workspaces comparten una instalación y un lockfile en la raíz. Cada aplicación mantiene su propia configuración de TypeScript. Las carpetas adicionales se crearán cuando tengan código que alojar.

## Requirements

- Node.js: `^20.19.0 || ^22.13.0 || >=24.0.0` (ver `engines` en el package raíz; incluye los requisitos de ESLint).
- npm: 10 o superior.
- Entorno utilizado para la verificación inicial: Node.js 20.19.5 y npm 10.8.2.

La versión mínima contempla los [requisitos de Vite](https://vite.dev/guide/) y la carga opcional nativa de variables con [`--env-file-if-exists`](https://nodejs.org/download/release/v20.19.0/docs/api/cli.html#--env-file-if-existsconfig).

## Installation

Desde la raíz:

```sh
npm install
```

Para instalaciones reproducibles con el lockfile existente se puede usar `npm ci`.

## Development

En dos terminales, desde la raíz:

```sh
npm run dev:frontend
```

```sh
npm run dev:backend
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health check: http://localhost:3000/api/health

El health check responde HTTP 200 con:

```json
{ "status": "ok" }
```

Los scripts usan herramientas multiplataforma y no requieren sintaxis exclusiva de Bash. Se mantienen dos terminales para evitar añadir un gestor de procesos.

## Tests

```sh
npm test
```

Ejecuta ambas suites una vez. La prueba del frontend comprueba la pantalla inicial; la del backend comprueba el estado HTTP y el JSON de `/api/health`. Supertest recibe directamente `app`, sin ejecutar `server.ts` ni requerir un servidor iniciado por separado.

Para ejecutar una suite:

```sh
npm test --workspace frontend
npm test --workspace backend
```

## Lint

```sh
npm run lint
```

ESLint revisa React y TypeScript en ambos workspaces. El lint del backend también comprueba los tipos de sus pruebas y configuración; el build del frontend comprueba todos sus archivos TypeScript.

## Build

```sh
npm run build
```

Genera `frontend/dist` y `backend/dist`. Ambos builds comprueban TypeScript estricto. Las pruebas del backend no se incluyen en su salida compilada.

También pueden ejecutarse por separado:

```sh
npm run build --workspace frontend
npm run build --workspace backend
```

Después del build:

```sh
npm run preview --workspace frontend
npm start --workspace backend
```

`preview` sirve el frontend compilado en http://localhost:4173 para verificación local.

## Environment Variables

Los valores por defecto permiten iniciar ambas aplicaciones sin crear archivos `.env`.
Para personalizarlos, copiar manualmente cada `.env.example` a `.env` dentro del mismo workspace.

| Variable | Archivo local | Valor por defecto | Uso |
| --- | --- | --- | --- |
| `VITE_API_URL` | `frontend/.env` | `http://localhost:3000/api` | URL base exportada por `frontend/src/config.ts` para futuras llamadas con `fetch`. |
| `PORT` | `backend/.env` | `3000` | Puerto entero entre 1 y 65535. Un valor inválido impide iniciar el servidor. |

Vite carga las variables del frontend; los scripts de Node/tsx cargan el `.env` opcional del backend. Reiniciar el proceso tras cambiar variables. Las variables `VITE_*` son públicas y se incorporan al build: no deben contener secretos.

El CORS del backend permite cualquier origen para esta base de desarrollo. Los archivos `.env` reales, dependencias, builds y cobertura están excluidos de Git; los `.env.example` sí se versionan.

## Compatibility Notes

Se fija jsdom en `27.0.1`, también mediante `overrides` en la raíz, para que Vitest y el frontend resuelvan la misma versión compatible con Node.js 20.19.5. Su dependencia transitiva `whatwg-encoding` puede emitir un aviso de deprecación durante una instalación limpia.

Si no existe `backend/.env`, Node puede mostrar `.env not found. Continuing without it.`; el backend continúa con el puerto por defecto.
