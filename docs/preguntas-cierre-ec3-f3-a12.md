# Preguntas de cierre - EC3 F3 A12

## 1. ¿Qué diferencia existe entre prueba automatizada, humo y aceptación?

Una prueba automatizada es código que revisa otro código sin intervención humana y se puede repetir cuantas veces se quiera. En este proyecto son las pruebas de Vitest en `src/test/`, que se ejecutan con `pnpm test` y revisan piezas aisladas: que `http.service` envíe el encabezado `Bearer`, que `session.service` guarde y borre el token, y que las guardas redirijan correctamente. Una prueba de humo es una revisión rápida sobre el sistema ya desplegado para confirmar que lo básico responde. `scripts/smoke-production.mjs` comprueba que el Frontend devuelva el HTML con `id="root"` y que el Backend responda `/health` y `/health/database`. No revisa detalles: solo que nada esté roto. Una prueba de aceptación comprueba, desde el punto de vista del usuario, que el sistema cumple lo que se pidió. Por ejemplo: registrarse, iniciar sesión, crear, editar y completar tareas, ver que un `user` no puede eliminar y un `admin` sí, y cerrar sesión, todo en la URL de producción.

## 2. ¿Por qué Fetch simulado no demuestra que Atlas funciona?

Porque en `http.service.test.ts` se reemplaza `fetch` con `vi.fn` y se decide qué respuesta devuelve con `mockResolvedValue`. La petición nunca sale de la computadora: no llega al Backend, y mucho menos a MongoDB Atlas. La prueba demuestra que el Frontend arma bien la petición y procesa bien una respuesta que se supone correcta, pero no que esa respuesta exista en la realidad. Atlas podría estar caído, la `MONGODB_URI` podría estar mal o la IP podría no estar permitida, y las pruebas seguirían pasando. Para comprobar la conexión real hace falta consultar el sistema desplegado, como hace la prueba de humo con `/health/database`.

## 3. ¿Qué comprueba una guarda y qué seguridad continúa en el Backend?

Una guarda como `ProtectedRoute` comprueba el estado de la sesión en el Frontend y decide qué mostrar. Si el estado es `checking`, muestra "Validando la sesión..."; si es `error`, ofrece reintentar; si no está `authenticated`, redirige a `/login`; y si todo está bien, muestra la ruta privada con `Outlet`. `PublicOnlyRoute` hace lo contrario y evita volver a `/login` con una sesión activa. Esto solo mejora la experiencia del usuario: no protege los datos, porque el código del navegador se puede modificar. En el Backend continúa la seguridad real: verificar la firma y la expiración del JWT en cada petición, revisar el rol antes de permitir acciones como eliminar, validar los datos que llegan, aplicar CORS y guardar en secreto `JWT_SECRET` y `MONGODB_URI`.

## 4. ¿Por qué VITE_API_URL es pública y JWT_SECRET no?

Vite toma las variables que empiezan con `VITE_` y escribe su valor directamente en los archivos JavaScript de `dist` durante el build. Esos archivos se descargan en el navegador de cualquier visitante, así que cualquiera puede ver `VITE_API_URL` en las herramientas de desarrollo. No es un problema, porque la dirección de la API no es un secreto: el navegador la necesita para hacer las peticiones. `JWT_SECRET` es la clave con la que el Backend firma y verifica los tokens. Si alguien la conociera, podría fabricar un token válido con el rol `admin`. Por eso solo existe en las variables de entorno del Backend, nunca en el Frontend, y `docs/deployment-configuration.md` indica no copiarla.

## 5. ¿Por qué cambiar VITE_API_URL exige otro build?

Porque Vite no lee `VITE_API_URL` cuando la aplicación se ejecuta, sino cuando se construye. Durante `vite build`, reemplaza `import.meta.env.VITE_API_URL` en `src/config/env.ts` por el texto de la URL, y ese texto queda fijo dentro de los archivos de `dist`. El Frontend en Render es un sitio estático (`runtime: static`): solo entrega archivos y no ejecuta código en el servidor que pueda leer variables nuevas. Si se cambia la variable en Render, los archivos ya publicados siguen teniendo la URL anterior. Hace falta un nuevo build y deploy para que el valor nuevo quede dentro del JavaScript.

## 6. ¿Qué función cumple la reescritura hacia index.html?

Permite que funcionen las rutas de React Router al entrar directamente a una dirección o al recargar. En un sitio estático solo existen archivos como `index.html` y los de `assets`. Si alguien abre `https://FRONTEND.onrender.com/tasks/abc`, el servidor busca un archivo en esa ruta, no lo encuentra y responde 404. La regla de `render.yaml` (`source: /*`, `destination: /index.html`) hace que el servidor entregue `index.html` para cualquier ruta, sin cambiar la URL. Luego React se carga, `BrowserRouter` lee la URL y muestra la página correcta o `NotFoundPage`. Por eso la prueba de humo revisa que `/api/tasks` del Frontend también devuelva el HTML con `id="root"`.

## 7. ¿Qué diferencia existe entre build, deploy y release?

El build transforma el código fuente en archivos listos para producción: `tsc -b` revisa los tipos y `vite build` genera la carpeta `dist` con el HTML, el JavaScript y el CSS optimizados. En Render, el build ejecuta `pnpm verify`, que además corre el lint y las pruebas. El deploy es publicar ese resultado en un servidor: Render copia `dist` a su servicio y empieza a entregarlo en la URL. Ocurre automáticamente con cada commit por `autoDeployTrigger: commit`. El release es la entrega oficial de una versión a los usuarios, con un nombre y un registro de lo que incluye, por ejemplo, `v1.0.0` marcado con un tag de Git y unas notas de versión. Se pueden hacer muchos builds y deploys, pero solo algunos se declaran como release.

## 8. ¿Por qué CORS_ORIGIN debe ser exacto?

Porque el navegador compara el origen de la página (protocolo, dominio y puerto) con el valor que devuelve el Backend en `Access-Control-Allow-Origin`, y tienen que coincidir exactamente. `https://FRONTEND.onrender.com` no es igual a `http://FRONTEND.onrender.com`, ni a `https://frontend.onrender.com/`, ni a otro subdominio. Si no coinciden, el navegador bloquea la respuesta y el Frontend muestra "No fue posible conectar con la API.", aunque el Backend esté funcionando. Tampoco se debe usar `*` para resolverlo, porque permitiría que cualquier sitio hiciera peticiones a la API desde el navegador de un usuario. Un valor exacto solo autoriza al Frontend propio.

## 9. ¿Qué diferencia existe entre 401 y 403?

Un 401 significa que la API no reconoce quién hace la petición: no se envió el token, expiró o no es válido. Se resuelve iniciando sesión otra vez, y por eso `http.service.ts` llama al `unauthorizedHandler`, que cierra la sesión. La prueba "notifica 401 autenticado" comprueba ese comportamiento. Un 403 significa que la API sí sabe quién es el usuario, pero no le permite esa acción, por ejemplo, un `user` que intenta eliminar una tarea. Volver a iniciar sesión no cambia nada, porque el rol sigue siendo el mismo. El 401 es un fallo de autenticación y el 403 es un fallo de autorización.

## 10. ¿Por qué ocultar Eliminar no sustituye la autorización?

Porque esconder el botón con `canDelete` solo cambia lo que se ve en la pantalla. Un usuario con rol `user` puede copiar su token de `sessionStorage` y enviar `DELETE /api/tasks/:id` desde la consola del navegador, con `curl` o con Postman, sin usar la interfaz. Si el Backend no revisara el rol, la tarea se eliminaría. La autorización es la decisión que toma el Backend al recibir la petición: revisa el rol que viene en el token verificado y responde 403 si no es `admin`. Ocultar el botón solo evita ofrecer una acción que va a fallar y deja la interfaz más clara.

## 11. ¿Cómo demuestras que v1.0.0 corresponde al deploy?

Relacionando la versión con un commit exacto y comprobando que Render desplegó ese mismo commit. Primero se crea un tag anotado en el commit que se va a entregar, con `git tag -a v1.0.0 -m "..."`, y se sube con `git push origin v1.0.0`. Luego se obtiene su identificador con `git rev-parse v1.0.0^{commit}` y se compara con el commit que muestra Render en el detalle del deploy activo: deben ser el mismo SHA. También conviene que el build de ese deploy haya pasado `pnpm verify` y que la prueba de humo (`pnpm smoke:production`) haya pasado contra las URLs de producción después de publicarlo. Como evidencia se guardan el SHA, la captura del deploy en Render y la salida de la prueba de humo. Si se hace un cambio después del tag, ya no es `v1.0.0` y debe crearse una versión nueva.

## 12. ¿Qué mejorarías para un sistema sensible?

- **Token:** cambiar `sessionStorage` por una cookie `HttpOnly`, `Secure` y `SameSite`, para que JavaScript no pueda leer el token ante un XSS. También usaría tokens de acceso de corta duración con un token de renovación, y una forma de revocarlos al cerrar sesión, porque ahora `logout` solo borra el token del navegador.
- **Encabezados:** agregar una `Content-Security-Policy` y `Strict-Transport-Security` a los que ya están en `render.yaml` (`nosniff`, `DENY` y `Referrer-Policy`).
- **Backend:** limitar los intentos de inicio de sesión (rate limiting), exigir contraseñas más fuertes o un segundo factor, guardar un registro de auditoría de acciones como eliminar, y hacer que cada tarea pertenezca a un usuario.
- **Pruebas:** agregar pruebas de extremo a extremo contra un entorno real de pruebas, revisar las dependencias con `pnpm audit` y proteger la rama `main` para que solo se despliegue código revisado.
- **Secretos y datos:** rotar `JWT_SECRET` y las credenciales de Atlas, usar un usuario de base de datos con permisos mínimos, limitar las IP permitidas y configurar respaldos.
