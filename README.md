# Full-Stack App

Base de una aplicación Full-Stack con frontend y backend independientes en un monorepo sencillo.
Incluye registro e inicio de sesión locales, un dashboard protegido con saldo y estadísticas simuladas, un endpoint técnico de salud y una API de pagos ficticios.

## Tech Stack

- React y TypeScript: interfaz con tipado estricto.
- Vite: servidor de desarrollo y build del frontend.
- Material UI y Emotion: componentes visuales y estilos.
- React Router: navegación y protección de rutas según la sesión local.
- React Hook Form, Zod y `@hookform/resolvers`: formularios y validación de registro e inicio de sesión.
- Recharts: donut de apuestas y barras de victorias de caracoles.
- Node.js, Express y cors: API HTTP y comunicación entre orígenes en desarrollo.
- Zod: validación del puerto del backend.
- tsx: ejecución de TypeScript con recarga durante el desarrollo.
- Vitest, React Testing Library, jest-dom, jsdom y Supertest: pruebas de interfaz y API.
- ESLint y typescript-eslint: revisión estática del código.

Las estadísticas son datos fijos de demostración. La carga de saldo está visible pero deshabilitada; no hay pagos ni carreras reales implementados.

## Project Structure

```text
frontend/
  src/
    auth/               # Context, proveedor, guards, esquemas y tipos
    components/dashboard/ # Header, saldo y gráficas
    data/               # Estadísticas simuladas deterministas y sus pruebas
    pages/              # Registro, login y composición del dashboard
    services/           # Autenticación local y acceso centralizado a LocalStorage
    test/               # Configuración de Testing Library y datos ficticios
    types/dashboard.ts  # Tipos de estadísticas
    utils/formatCurrency.ts # Formato monetario MXN
    App.tsx             # Rutas, layout y carga de páginas bajo demanda
    App.test.tsx         # Pruebas de formularios, sesión y rutas
    config.ts           # URL base centralizada del API
    main.tsx            # Entrada y BrowserRouter
  .env.example
  vite.config.ts
backend/
  src/
    routes/             # Endpoint de pagos y pruebas de sus escenarios
    schemas/            # Validación runtime de solicitudes
    services/           # Mock SnailPay sin persistencia
    types/              # Contrato de respuesta de pagos
    middleware/         # Errores API sin detalles internos
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

Ejecuta las suites una vez. El frontend comprueba registro, validaciones, hash SHA-256, login, restauración de sesión, logout, rutas y fallos de almacenamiento. También comprueba los datos del dashboard, saldo, recarga deshabilitada y categorías con cero apuestas. El backend comprueba `/api/health` y los cinco escenarios del mock de pagos. Supertest recibe directamente `app`, sin ejecutar `server.ts` ni requerir un servidor iniciado por separado. La prueba de latencia usa el servicio con fake timers; el retraso HTTP real se verifica funcionalmente.

jsdom no proporciona `SubtleCrypto`: las pruebas usan la implementación real de Web Crypto de Node. La restauración en React se comprueba desmontando y montando la aplicación con el mismo almacenamiento; la recarga real se verifica en navegador.

Para las gráficas, jsdom no calcula dimensiones ni proporciona `ResizeObserver`: las pruebas fijan únicamente el tamaño de `ResponsiveContainer` y mantienen Recharts real. Comprueban títulos y resúmenes textuales sin depender de paths SVG. El comportamiento responsive se verifica por separado en navegador.

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
| `/dashboard` | Redirige a `/login` | Usuario, saldo, estadísticas simuladas y logout |
| `/` o ruta desconocida | Termina en `/login` | Termina en `/dashboard` |

Las redirecciones reemplazan la entrada del historial. Las páginas se cargan bajo demanda con `React.lazy` y muestran un indicador mientras cargan. No se implementan recuperación de contraseña, múltiples usuarios, expiración ni sincronización entre dispositivos. El almacenamiento pertenece al origen y perfil del navegador; borrarlo elimina la cuenta local.

### Verificación del flujo

1. Abrir `/register`, enviar datos inválidos y comprobar los mensajes.
2. Registrar un nombre y correo ficticios con una contraseña de al menos 8 caracteres y confirmación idéntica.
3. Iniciar sesión; comprobar nombre y saldo `$0.00` en `/dashboard`.
4. Recargar: la sesión debe continuar. Abrir `/login` y `/register`: deben redirigir al dashboard.
5. Cerrar sesión; comprobar la redirección y el rechazo de una contraseña incorrecta.
6. Iniciar sesión correctamente otra vez, cerrar sesión y abrir `/dashboard` directamente: debe volver a login.
7. Inspeccionar LocalStorage: logout conserva el usuario y saldo, elimina solo la sesión y no hay campos `password` ni `confirmPassword`.

## Dashboard

El dashboard reutiliza el usuario y saldo del contexto de autenticación. `DashboardPage` compone cuatro componentes:

- `DashboardHeader`: título neutral, nombre y el mismo logout de la autenticación local, con manejo de errores.
- `BalanceCard`: saldo formateado con `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })` y dos decimales. No mantiene una copia del saldo en estado local.
- `BetsChart`: donut de **8 apuestas ganadas y 4 perdidas**, total 12. Incluye leyenda con valores, tooltip y estado vacío si ambos valores son cero.
- `SnailWinsChart`: barras horizontales para mostrar completos los nombres incluso en móvil, eje de victorias enteras de 0 a 6, tooltip y resumen textual.

Los datos se definen en `frontend/src/data/dashboardData.ts` y no cambian al recargar. Representan exactamente **6 caracoles y 6 carreras simuladas del día**:

| Caracol | Victorias |
| --- | ---: |
| Turbo | 2 |
| Flash | 1 |
| Rocket | 1 |
| Speedy | 1 |
| Shelly | 0 |
| Bolt | 1 |
| **Total** | **6** |

La distribución de apuestas es una estadística de demostración independiente; no se calculan apuestas a partir de estas carreras. No hay peticiones al backend para obtener estas constantes.

**Cargar saldo** está deshabilitado con la indicación visible `Disponible próximamente`, asociada mediante `aria-describedby`. No abre formularios, no modifica el saldo y no realiza peticiones. La tarjeta refleja el saldo recibido del contexto, incluido cualquier valor válido ya persistido.

El layout usa los breakpoints de Material UI: dos columnas desde `md` y una columna en tablet/móvil. Header y tarjeta de saldo se apilan en pantallas pequeñas. Las gráficas usan `ResponsiveContainer`, ancho flexible y altura estable. Los títulos de sección, leyendas con cantidades y lista de victorias permiten entender los datos sin depender solo del color. La navegación y tooltips de Recharts conservan su capa de accesibilidad.

La revisión visual de esta fase se realizó en Edge a 1440, 768 y 375 px, junto con registro, login, recarga de página, logout y nuevo login. No se incorporaron herramientas de navegador a las dependencias del proyecto.

## SnailPay: API simulada de pagos

**Todos los datos son ficticios. Nunca enviar datos financieros reales.** SnailPay es un mock local sin conexiones a proveedores externos, autenticación backend, almacenamiento de transacciones ni modificación de saldos. El frontend aún no consume esta API y el botón de recarga sigue deshabilitado.

### Solicitud

`POST http://localhost:3000/api/payments`, con `Content-Type: application/json`:

```json
{
  "cardNumber": "1234123412341234",
  "expirationDate": "12/26",
  "cvv": "543",
  "fullName": "Persona Demo",
  "amount": 125.5,
  "payerId": "demo-user",
  "payerEmail": "demo@example.test"
}
```

Todos los campos son obligatorios. `cardNumber` y `cvv` son strings de exactamente 16 y 3 dígitos, respectivamente. `expirationDate` debe cumplir `MM/YY` con mes entre `01` y `12`; no se compara con la fecha actual para mantener reproducible el fixture `12/26`. Nombre e ID no pueden quedar vacíos después de `trim`. El correo se valida y normaliza con `trim` y minúsculas. `amount` debe ser un número finito mayor que cero, sin coerción de strings ni redondeo o límite de decimales. No se aplica validación Luhn a estas tarjetas ficticias.

Para reproducir desde PowerShell, iniciar el backend y ejecutar:

```powershell
$payment = @{
  cardNumber = '1234123412341234'
  expirationDate = '12/26'
  cvv = '543'
  fullName = 'Persona Demo'
  amount = 125.5
  payerId = 'demo-user'
  payerEmail = 'demo@example.test'
}
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/payments' -ContentType 'application/json' -Body ($payment | ConvertTo-Json)
```

Cambiar `cardNumber` según la tabla. PowerShell tratará las respuestas HTTP 400/402/500 como errores del comando; el cuerpo JSON contiene el resultado descrito abajo y también puede inspeccionarse con un cliente HTTP.

### Escenarios deterministas

| Escenario | Tarjeta ficticia | Vencimiento | CVV | HTTP | `status / status_detail` |
| --- | --- | --- | --- | --- | --- |
| Aprobado | `1234123412341234` | `12/26` exacto | `543` exacto | 200 | `approved / accredited` |
| Rechazado | `4000000000000002` | Formato válido | 3 dígitos | 402 | `rejected / card_declined` |
| Error de sistema | `5000000000000000` | Formato válido | 3 dígitos | 500 | `error / internal_error` |
| Respuesta lenta | `5555555555554444` | Formato válido | 3 dígitos | 500 tras unos 3 s | `error / gateway_timeout` |
| Otra tarjeta o credenciales de éxito distintas | Formato válido | Formato válido | 3 dígitos | 402 | `rejected / card_declined` |

La validación se ejecuta antes de seleccionar cualquier escenario. Para provocar HTTP 400, enviar por ejemplo `amount: 0`. No existe una operación SnailPay en ese caso:

```json
{
  "error": {
    "code": "invalid_payment_data",
    "message": "Revisa los campos de la solicitud de pago.",
    "fields": ["amount"]
  }
}
```

Un JSON mal formado produce HTTP 400 con `error.code: invalid_request`; los errores del parser conservan su estado HTTP 4xx sin exponer el cuerpo recibido. Una excepción inesperada devuelve HTTP 500 con un error API genérico `internal_error`, sin stack traces ni rutas locales. El error de sistema simulado de la tabla es un resultado controlado del servicio y sí utiliza el contrato de pago.

### Contrato de respuesta del mock

Los resultados aprobados, rechazados y errores simulados contienen siempre:

- `id`: UUID nuevo por operación; `reference`: `PAY-<UUID>`.
- `status`: `approved`, `rejected` o `error`; `status_detail`: detalle de la tabla.
- `transaction_amount`: importe validado, sin modificarlo.
- `date_created`: fecha ISO 8601 al generar la respuesta.
- `authorization_code`: `AUTH-<8 caracteres del UUID>` en aprobados, `null` en los demás casos.
- `payer_id`, `payer_email`: valores normalizados de la solicitud.
- `card_number`, `cvv`: valores ficticios recibidos, sin enmascarar, por requisito explícito de este mock.

Los escenarios son deterministas; IDs, referencias, códigos de autorización y fechas cambian por operación. El mock no registra cuerpos de solicitudes, tarjetas ni CVV, y no persiste respuestas. **Devolver o almacenar CVV no sería aceptable en una integración financiera real.**

### Latencia y alcance

`TEST_CARDS`, las credenciales de éxito y `SLOW_RESPONSE_MS = 3000` están centralizados en `backend/src/services/snailPayService.ts`. El escenario lento siempre termina en error y nunca aprueba. Un cliente puede usar un timeout menor (por ejemplo 1 segundo) y abortar la espera; eso no constituye una aprobación. El servidor finaliza su espera de unos 3 segundos aunque el cliente cierre la conexión. El tiempo real puede aumentar con la carga del proceso.

La ruta contiene el controlador de esta única operación: valida con Zod, llama al servicio y traduce el estado a HTTP. Los rechazos son resultados esperados, no excepciones. No se han añadido capas adicionales ni dependencias. Una aprobación únicamente describe una operación ficticia; no acredita saldo ni genera efectos secundarios.

## Compatibility Notes

Se fija jsdom en `27.0.1`, también mediante `overrides` en la raíz, para que Vitest y el frontend resuelvan la misma versión compatible con Node.js 20.19.5. Su dependencia transitiva `whatwg-encoding` puede emitir un aviso de deprecación durante una instalación limpia.

Si no existe `backend/.env`, Node puede mostrar `.env not found. Continuing without it.`; el backend continúa con el puerto por defecto.
