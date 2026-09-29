# Full-Stack App

Base de una aplicación Full-Stack con frontend y backend independientes en un monorepo sencillo.
Incluye registro e inicio de sesión locales, un dashboard protegido con saldo y estadísticas simuladas, un endpoint técnico de salud y una API de pagos ficticios.

## Tech Stack

- React y TypeScript: interfaz con tipado estricto.
- Vite: servidor de desarrollo y build del frontend.
- Material UI y Emotion: componentes visuales y estilos.
- React Router: navegación y protección de rutas según la sesión local.
- React Hook Form, Zod y `@hookform/resolvers`: formularios de registro, inicio de sesión y recarga.
- Recharts: donut de apuestas y barras de victorias de caracoles.
- Node.js, Express y cors: API HTTP y comunicación entre orígenes en desarrollo.
- Zod: validación del puerto, solicitudes de pago, respuestas del mock y datos locales.
- tsx: ejecución de TypeScript con recarga durante el desarrollo.
- Vitest, React Testing Library, jest-dom, jsdom y Supertest: pruebas de interfaz y API.
- ESLint y typescript-eslint: revisión estática del código.

Las estadísticas son datos fijos de demostración. La recarga conecta el frontend con el mock de pagos y actualiza el saldo local solo cuando recibe una aprobación. No se procesan pagos ni carreras reales.

## Project Structure

```text
frontend/
  src/
    auth/               # Context, proveedor, guards, esquemas y tipos
    components/dashboard/ # Header, saldo y gráficas
    components/payments/  # Diálogo de recarga y pruebas del flujo
    schemas/paymentSchema.ts # Validación del formulario y de respuestas del mock
    data/               # Estadísticas simuladas deterministas y sus pruebas
    pages/              # Registro, login y composición del dashboard
    services/           # Autenticación, cliente de pagos y acceso a LocalStorage
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

Clonar el repositorio con su URL y entrar en la carpeta:

```sh
git clone <URL_DEL_REPOSITORIO> martin-0987
cd martin-0987
```

Instalar desde la raíz:

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

Ejecuta las suites una vez. El frontend comprueba registro, validaciones, hash SHA-256, login, restauración de sesión, logout, rutas y fallos de almacenamiento. También comprueba el dashboard y la recarga: importe aprobado, suma de saldos, doble envío, persistencia, HTTP 400, rechazo, error de sistema, red, respuestas inválidas y timeout. El servicio prueba el temporizador con fake timers; el diálogo comprueba además el timeout completo, el saldo intacto y el reintento. Se cubren la cancelación por logout en otra pestaña y los fallos al guardar usuario o última operación. El backend comprueba `/api/health`, CORS y los cinco escenarios del mock de pagos. Supertest recibe directamente `app`, sin ejecutar `server.ts` ni requerir un servidor iniciado por separado. La prueba de latencia usa el servicio con fake timers; el retraso HTTP real se verifica funcionalmente.

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
| `VITE_API_URL` | `frontend/.env` | `http://localhost:3000/api` | Base del API, incluido `/api`. El servicio añade `/payments` al enviar la recarga. |
| `PORT` | `backend/.env` | `3000` | Puerto entero entre 1 y 65535. Un valor inválido impide iniciar el servidor. |
| `CORS_ORIGIN` | `backend/.env` | Vacío: permite cualquier origen | Origen exacto del frontend autorizado por CORS, por ejemplo `http://localhost:5173`. Sin ruta ni barra final. |

Vite carga las variables del frontend; los scripts de Node/tsx cargan el `.env` opcional del backend. Reiniciar el proceso tras cambiar variables. Las variables `VITE_*` son públicas y se incorporan al build: no deben contener secretos.

Sin `CORS_ORIGIN`, el backend permite cualquier origen para facilitar las pruebas locales, incluido `preview` en otro puerto. Al configurarla, publica ese origen en la cabecera CORS; para un frontend desplegado se usaría su origen HTTPS. No se utilizan cookies ni credenciales HTTP. CORS controla el acceso desde el navegador y no sustituye la autenticación de una API. Los archivos `.env` reales, dependencias, builds y cobertura están excluidos de Git; los `.env.example` sí se versionan.

## Autenticación local

Esta autenticación es una simulación íntegramente en el navegador. Conserva un único usuario y una sesión en LocalStorage, sin backend de autenticación. El registro crea la cuenta con saldo `0` y redirige a login; no inicia sesión automáticamente. Un segundo registro se rechaza sin sobrescribir la cuenta existente.

### Datos persistidos

| Key | Contenido | Cuándo se escribe | Cuándo se elimina |
| --- | --- | --- | --- |
| `fullstack.auth.user` | `{ id, fullName, email, passwordHash, balance }` | Registro y acreditación de una recarga aprobada. | La aplicación no la elimina; al borrar datos del navegador se pierde la cuenta y el saldo. |
| `fullstack.auth.session` | `{ userId }` | Login válido. | Logout o borrado de datos del navegador. |
| `fullstack.payment.lastTransaction` | `{ id, status, statusDetail, transactionAmount, dateCreated, payerId, cardNumber, cvv }` | Respuesta válida del mock para el usuario activo; reemplaza la anterior. | La aplicación no la elimina; permanece tras logout. |

El ID se genera una sola vez con `crypto.randomUUID()`. La sesión se restaura solo si su `userId` coincide con un usuario válido. No expira automáticamente. Logout elimina exclusivamente la key de sesión y conserva el usuario, el ID y el saldo. El contexto React se actualiza después de persistir cada cambio y escucha cambios de almacenamiento desde otras pestañas.

Las operaciones de LocalStorage se concentran en `services/authStorage.ts` y `services/paymentStorage.ts`. Usuario y sesión se validan con Zod al leerlos: JSON corrupto, estructuras inválidas o registros inexistentes se consideran ausentes y nunca habilitan una sesión. Un registro de usuario corrupto puede reemplazarse con un registro nuevo. La última operación no se lee para restaurar ni acreditar saldo: un registro corrupto en esa key no afecta la sesión y se reemplaza con la siguiente respuesta válida. Si el navegador bloquea el almacenamiento, la aplicación inicia sin sesión y muestra un error al intentar registrar o iniciar sesión; no confirma una operación que no pudo guardar. Si falla eliminar la sesión, logout muestra el error y mantiene el estado actual para permitir reintentar.

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

**Cargar saldo** abre un diálogo con los datos ficticios de la operación. La tarjeta muestra siempre el saldo de AuthContext; no mantiene un saldo propio ni requiere recargar la página para mostrar los cambios.

El layout usa los breakpoints de Material UI: dos columnas desde `md` y una columna en tablet/móvil. Header y tarjeta de saldo se apilan en pantallas pequeñas. Las gráficas usan `ResponsiveContainer`, ancho flexible y altura estable. Los títulos de sección, leyendas con cantidades y lista de victorias permiten entender los datos sin depender solo del color. La navegación y tooltips de Recharts conservan su capa de accesibilidad.

La revisión visual de esta fase se realizó en Edge a 1440, 768 y 375 px, junto con registro, login, recarga de página, logout y nuevo login. No se incorporaron herramientas de navegador a las dependencias del proyecto.

## SnailPay: API simulada de pagos

**Todos los datos son ficticios. Nunca enviar datos financieros reales.** SnailPay es un mock local sin conexiones a proveedores externos ni autenticación backend. El backend no almacena transacciones ni modifica saldos. El frontend consume esta API y acredita localmente las respuestas aprobadas.

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

La ruta contiene el controlador de esta única operación: valida con Zod, llama al servicio y traduce el estado a HTTP. Los rechazos son resultados esperados, no excepciones. Una aprobación describe una operación ficticia: el backend no acredita saldo; esa actualización corresponde al frontend.

## Recarga desde el dashboard

Iniciar frontend y backend con los comandos de Development. Registrar una cuenta local o iniciar sesión con la ya guardada y pulsar **Cargar saldo**.

El diálogo usa Material UI, React Hook Form y Zod. Pide tarjeta ficticia de 16 dígitos, vencimiento `MM/YY` con mes válido, CVV de 3 dígitos, nombre no vacío y monto numérico finito mayor que cero. El nombre comienza con el del usuario y puede editarse; `payerId` y `payerEmail` se toman del contexto y no son campos del formulario. Las reglas mantienen el formato del backend, sin comprobar vencimiento contra la fecha actual. Los importes se presentan en MXN.

`paymentService.ts` usa `fetch` con la base de `config.ts`, valida la respuesta con Zod y comprueba que el estado HTTP coincida con el resultado del mock y que los datos correspondan al pagador y tarjeta enviados. Los tipos de solicitud y respuesta se importan con `import type` desde los archivos existentes del backend; no se ejecuta código del servidor en el navegador ni se crea otro workspace.

Si la conexión se interrumpe mientras se lee el cuerpo, se muestra el mensaje de red. Un HTTP 5xx con contenido que no es JSON se presenta como error del sistema; una respuesta de éxito con contenido inválido se rechaza sin acreditar saldo. Nunca se muestra el cuerpo técnico recibido.

### Resultados y cancelación

| Resultado | Comportamiento |
| --- | --- |
| 200, `approved / accredited` | Suma `transaction_amount` de la respuesta al saldo persistido, actualiza AuthContext, cierra el diálogo y muestra confirmación en Snackbar. |
| 402, `rejected / card_declined` | Mantiene el saldo y muestra un mensaje de rechazo dentro del diálogo. |
| 500 con respuesta del mock | Mantiene el saldo y muestra el error correspondiente. |
| Validación local o HTTP 400 | No acredita ni guarda una transacción. Muestra validaciones o un mensaje para revisar los datos. |
| Respuesta inesperada o de otro pagador | No acredita ni guarda una transacción. |
| Timeout o error de red | No acredita ni reemplaza la última transacción. Muestra un mensaje específico y permite reintentar. |

`PAYMENT_TIMEOUT_MS = 2000` es menor que los 3000 ms del escenario lento. Al vencer, `AbortController` aborta la petición y el formulario vuelve a habilitarse. El servicio limpia el temporizador al terminar y también acepta una señal de cancelación. Si el diálogo se desmonta, por ejemplo por logout desde otra pestaña, se aborta la petición pendiente.

Antes de enviar se puede cancelar, pulsar Escape o cerrar desde el fondo del diálogo. Durante el envío se deshabilitan los campos, el submit y Cancelar, y se bloquean los intentos de cierre. Un guard adicional evita solicitudes simultáneas antes de que React actualice el botón. Al cancelar o aprobar se limpian los campos; un error conserva los datos para corregirlos. Los errores quedan visibles en el diálogo para mantenerlos accesibles dentro del foco del modal.

### Saldo y última transacción ficticia

`AuthContext.applyPayment` usa `authService.applyPayment`: vuelve a leer usuario y sesión, verifica el pagador y guarda la última respuesta procesada. Solo si está aprobada suma el importe confirmado al saldo actual, normaliza el resultado a dos decimales, persiste el usuario y después actualiza el contexto. Dos recargas de `100` y `50.50` sobre saldo cero dejan `150.50`, no `50.50`. El saldo permanece después de refresh y logout/login.

La key separada **`fullstack.payment.lastTransaction`** guarda únicamente la última operación procesada:

```text
{ id, status, statusDetail, transactionAmount, dateCreated, payerId, cardNumber, cvv }
```

Se guardan los datos de respuestas válidas aprobadas, rechazadas y de error del mock. No se guarda el formulario antes de enviarlo ni se inventa una transacción cuando no hay respuesta válida. Cada registro reemplaza al anterior; no hay historial. Logout elimina solo la sesión y conserva este registro junto con el saldo existente. Tarjeta y CVV permanecen separados del objeto User.

**La tarjeta y el CVV son ficticios y se almacenan exclusivamente para cumplir este escenario. Una aplicación real nunca debe guardar CVV en LocalStorage ni manejar números completos de tarjeta de esta manera. LocalStorage no es un almacenamiento seguro.**

Si falla guardar la última operación, no se acredita. Si se guarda una aprobación pero falla la escritura del usuario, se conserva esa respuesta y el saldo anterior, y se informa del fallo sin mostrar éxito. Las dos keys no forman una transacción atómica; esta simulación no incluye recuperación automática, idempotencia distribuida ni bloqueo entre pestañas. No se guarda una segunda copia del saldo.

### Verificación del flujo de recarga

1. Con saldo cero, usar la tarjeta aprobada de la tabla y recargar `100`; el dashboard debe mostrar `$100.00` sin refresh.
2. Repetir con `50.50`; debe mostrar `$150.50`.
3. Recargar la página y hacer logout/login; el saldo debe permanecer.
4. Probar rechazo y error del sistema; comprobar el mensaje, el saldo intacto y la última respuesta guardada.
5. Probar la tarjeta lenta; comprobar timeout a los 2 segundos y que no cambien saldo ni última operación.
6. Con el backend inaccesible, comprobar el mensaje de conexión y la posibilidad de reintentar.

El flujo se verificó con React y Express reales en Edge, con vistas de 1440, 768 y 375 px. Los datos de prueba automatizados se mantienen en `authFixtures.ts`; no crean una cuenta en el navegador del usuario.

### Auditoría técnica de fase 6

- `npm run lint`, `npm test` y `npm run build` finalizaron correctamente. TypeScript estricto pasó en ambos workspaces. La suite tiene 54 pruebas de frontend y 8 de backend, sin pruebas omitidas.
- La versión compilada se comprobó con Playwright temporal y Edge, usando procesos de prueba separados y un navegador aislado. Se configuraron `VITE_API_URL`, `PORT` y `CORS_ORIGIN` para esos procesos. Las herramientas y capturas quedaron fuera del repositorio.
- Se ejecutaron registro, login, dashboard, recargas de `100` y `50.50`, refresh y logout/login. Se comprobó saldo intacto ante validación, HTTP 400, rechazo, error del sistema y timeout. Para verificar HTTP 400 desde la interfaz, la automatización cambió el importe de la solicitud antes de enviarla al backend real.
- Se detuvo el backend de prueba, se comprobó el error de conexión y se volvió a iniciar. El reintento de `25` dejó el saldo en `175.50`, conservado después de otro logout/login.
- Se revisaron capturas de registro, login, dashboard, diálogo y mensajes a 375, 768 y 1440 px, además del foco con Tab/Shift+Tab, Escape y su devolución al botón de recarga. No se encontró desbordamiento horizontal ni acciones inaccesibles. Fue una verificación automatizada con revisión visual de capturas.
- No hubo errores React, excepciones sin manejar ni warnings de aplicación. Los fallos HTTP y de conexión registrados correspondieron a los escenarios provocados. El backend solo imprimió sus mensajes de inicio, sin datos de formularios.

El alcance sigue siendo una simulación local: no hay autorización de servidor, almacenamiento financiero seguro, transacciones atómicas entre keys ni coordinación de recargas entre pestañas. El saldo usa números de JavaScript y redondeo a dos decimales; no es un libro contable para importes arbitrarios. El escenario lento continúa en el servidor aunque el navegador aborte la espera. No se ha realizado despliegue ni una certificación de accesibilidad o compatibilidad con todos los navegadores.

## Compatibility Notes

Se fija jsdom en `27.0.1`, también mediante `overrides` en la raíz, para que Vitest y el frontend resuelvan la misma versión compatible con Node.js 20.19.5. Su dependencia transitiva `whatwg-encoding` puede emitir un aviso de deprecación durante una instalación limpia.

Si no existe `backend/.env`, Node puede mostrar `.env not found. Continuing without it.`; el backend continúa con el puerto por defecto.
