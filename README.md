# Full-Stack App

Base de una aplicación Full-Stack con frontend y backend independientes en un monorepo sencillo.
Incluye registro e inicio de sesión locales, un dashboard temporal protegido y un endpoint técnico de salud.

## Tech Stack

- React y TypeScript: interfaz con tipado estricto.
- Vite: servidor de desarrollo y build del frontend.
- Material UI y Emotion: componentes visuales y estilos.
- React Router: navegación y protección de rutas según la sesión local.
- React Hook Form, Zod y `@hookform/resolvers`: formularios y validación de registro e inicio de sesión.
- Recharts: dependencia preparada para futuras gráficas.
- Node.js, Express y cors: API HTTP y comunicación entre orígenes en desarrollo.
- Zod: validación del puerto del backend.
- tsx: ejecución de TypeScript con recarga durante el desarrollo.
- Vitest, React Testing Library, jest-dom, jsdom y Supertest: pruebas de interfaz y API.
- ESLint y typescript-eslint: revisión estática del código.

Recharts permanece instalado para una fase posterior; no hay gráficas ni pagos implementados.

## Project Structure

```text
frontend/
  src/
    auth/               # Context, proveedor, guards, esquemas y tipos
    pages/              # Registro, login y dashboard temporal
    services/           # Autenticación local y acceso centralizado a LocalStorage
    test/               # Configuración de Testing Library y datos ficticios
    App.tsx             # Rutas, layout y carga de páginas bajo demanda
    App.test.tsx         # Pruebas de formularios, sesión y rutas
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

Ejecuta las suites una vez. El frontend comprueba registro, validaciones, hash SHA-256, login, restauración de sesión, logout, rutas y fallos de almacenamiento. La prueba del backend comprueba el estado HTTP y el JSON de `/api/health`. Supertest recibe directamente `app`, sin ejecutar `server.ts` ni requerir un servidor iniciado por separado.

jsdom no proporciona `SubtleCrypto`: las pruebas usan la implementación real de Web Crypto de Node. La restauración en React se comprueba desmontando y montando la aplicación con el mismo almacenamiento; la recarga real se verifica en navegador.

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

## Autenticación local

Esta autenticación es una simulación íntegramente en el navegador. Conserva un único usuario y una sesión en LocalStorage, sin backend de autenticación. El registro crea la cuenta con saldo `0` y redirige a login; no inicia sesión automáticamente. Un segundo registro se rechaza sin sobrescribir la cuenta existente.

### Datos persistidos

| Key | Estructura |
| --- | --- |
| `fullstack.auth.user` | `{ id, fullName, email, passwordHash, balance }` |
| `fullstack.auth.session` | `{ userId }` |

El ID se genera una sola vez con `crypto.randomUUID()`. La sesión se restaura solo si su `userId` coincide con un usuario válido. No expira automáticamente. Logout elimina exclusivamente la key de sesión y conserva el usuario, el ID y el saldo. El contexto React se actualiza después de persistir cada cambio y escucha cambios de almacenamiento desde otras pestañas.

Las operaciones de LocalStorage se concentran en `services/authStorage.ts`. Los datos se validan con Zod al leerlos: JSON corrupto, estructuras inválidas o registros inexistentes se consideran ausentes y nunca habilitan una sesión. Un registro de usuario corrupto puede reemplazarse con un registro nuevo. Si el navegador bloquea el almacenamiento, la aplicación inicia sin sesión y muestra un error al intentar registrar o iniciar sesión; no confirma una operación que no pudo guardar. Si falla eliminar la sesión, logout muestra el error y mantiene el estado actual para permitir reintentar.

### Validaciones y contraseña

- Nombre: obligatorio, mínimo 2 caracteres después de eliminar espacios al inicio y al final.
- Correo: obligatorio, formato válido, sin espacios exteriores y normalizado a minúsculas antes de guardar o comparar.
- Contraseña de registro: mínimo 8 caracteres, sin reglas adicionales de composición. Se conserva exactamente lo escrito, incluidos espacios.
- Confirmación: obligatoria e idéntica a la contraseña; nunca se persiste.
- Login: correo válido y contraseña no vacía. Credenciales incorrectas muestran siempre `Correo o contraseña incorrectos.`

Se utiliza SHA-256 mediante [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest) exclusivamente para esta simulación local. Se persiste el hash hexadecimal, nunca la contraseña en texto plano ni su confirmación; el hash tampoco se copia en la sesión o el usuario expuesto al contexto React. Web Crypto requiere un contexto seguro, como HTTPS o localhost, y un navegador compatible.

**SHA-256 por sí solo no es un mecanismo adecuado de almacenamiento de contraseñas en producción.** En producción la contraseña debe procesarse en backend con un algoritmo apropiado para contraseñas, salt y factor de trabajo, y nunca almacenarse como credencial en LocalStorage. Los datos locales son manipulables: estas rutas protegidas controlan la navegación de la simulación y no proporcionan autorización real ni protegen datos de un servidor. No usar credenciales reales.

### Rutas

| Ruta | Sin sesión | Con sesión válida |
| --- | --- | --- |
| `/register` | Formulario de registro | Redirige a `/dashboard` |
| `/login` | Formulario de login | Redirige a `/dashboard` |
| `/dashboard` | Redirige a `/login` | Saludo, saldo y logout |
| `/` o ruta desconocida | Termina en `/login` | Termina en `/dashboard` |

Las redirecciones reemplazan la entrada del historial. Las páginas se cargan bajo demanda con `React.lazy` y muestran un indicador mientras cargan. No se implementan recuperación de contraseña, múltiples usuarios, expiración ni sincronización entre dispositivos. El almacenamiento pertenece al origen y perfil del navegador; borrarlo elimina la cuenta local.

### Verificación del flujo

1. Abrir `/register`, enviar datos inválidos y comprobar los mensajes.
2. Registrar un nombre y correo ficticios con una contraseña de al menos 8 caracteres y confirmación idéntica.
3. Iniciar sesión; comprobar nombre y saldo `$0` en `/dashboard`.
4. Recargar: la sesión debe continuar. Abrir `/login` y `/register`: deben redirigir al dashboard.
5. Cerrar sesión; comprobar la redirección y el rechazo de una contraseña incorrecta.
6. Iniciar sesión correctamente otra vez, cerrar sesión y abrir `/dashboard` directamente: debe volver a login.
7. Inspeccionar LocalStorage: logout conserva el usuario y saldo, elimina solo la sesión y no hay campos `password` ni `confirmPassword`.

## Compatibility Notes

Se fija jsdom en `27.0.1`, también mediante `overrides` en la raíz, para que Vitest y el frontend resuelvan la misma versión compatible con Node.js 20.19.5. Su dependencia transitiva `whatwg-encoding` puede emitir un aviso de deprecación durante una instalación limpia.

Si no existe `backend/.env`, Node puede mostrar `.env not found. Continuing without it.`; el backend continúa con el puerto por defecto.
