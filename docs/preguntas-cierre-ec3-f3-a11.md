# Preguntas de cierre - EC3 F3 A11

## 1. ¿Qué diferencia existe entre autenticación y autorización?

La autenticación responde a la pregunta "¿quién eres?". Comprueba la identidad del usuario, por ejemplo, cuando `LoginPage` envía el correo y la contraseña a `/auth/login` y la API devuelve un `accessToken`. La autorización responde a "¿qué puedes hacer?". Una vez que se sabe quién es el usuario, decide qué acciones tiene permitidas según su rol. En este proyecto, cualquier usuario autenticado puede ver y editar tareas, pero solo el rol `admin` puede eliminarlas. Primero se autentica al usuario y después se autoriza cada acción.

## 2. ¿Qué información guarda sessionStorage y qué información no debe guardar?

`session.service.ts` guarda en `sessionStorage` solamente el token de acceso, con la clave `task-manager.access-token`. Ese token es lo único que hace falta para recuperar la sesión al recargar la página. Los datos del usuario (nombre, correo y rol) no se guardan: viven en el estado de `AuthProvider` y se piden de nuevo a la API. Nunca se debe guardar la contraseña ni otros datos sensibles, como información personal o de pago. Tampoco conviene guardar el rol como dato de confianza, porque cualquiera puede editar `sessionStorage` desde las herramientas del navegador.

## 3. ¿Por qué se consulta /api/auth/me al recargar?

Porque al recargar, el estado de React se pierde y solo queda el token en `sessionStorage`. Tener un token guardado no significa que siga siendo válido: puede haber expirado, la cuenta pudo eliminarse o el rol pudo cambiar. Por eso `AuthProvider` lee el token al iniciar, empieza en el estado `checking` y llama a `getAuthenticatedUser`, que consulta `/auth/me`. Si la API responde bien, se guarda el usuario actualizado y el estado pasa a `authenticated`. Si responde 401, el manejador de `http.service.ts` cierra la sesión con el mensaje "Tu sesión expiró o ya no es válida". La API es quien confirma si el token sirve y quién es el usuario.

## 4. ¿Por qué el Frontend no debe confiar en decodificar un JWT sin verificarlo?

Porque el contenido de un JWT solo está codificado en Base64, no cifrado. Cualquiera puede leerlo y también modificarlo, por ejemplo, cambiar `"role": "user"` por `"role": "admin"`. Lo que impide la falsificación es la firma, y esa firma solo se puede verificar con la clave secreta que tiene el Backend. El Frontend no tiene esa clave ni debe tenerla, porque cualquier código del navegador es público. Además, decodificarlo no indica si el token fue revocado o si el usuario ya no existe. Por eso el Frontend trata el token como un valor opaco que solo envía en el encabezado `Authorization`, y obtiene los datos del usuario desde `/auth/me`.

## 5. ¿Qué responsabilidad tiene AuthProvider?

Administra toda la sesión en un solo lugar y la comparte con la aplicación mediante `AuthContext`. Guarda en su estado el `status`, el `user`, el `accessToken` y el `sessionMessage`. Al iniciar, valida el token guardado con `/auth/me`. También ofrece las funciones `login` (guarda el token y el usuario), `register`, `logout`, `retrySession` (vuelve a intentar la validación si la API falló) y `clearSessionMessage`. Además, registra con `setUnauthorizedHandler` la función que cierra la sesión cuando cualquier petición con token recibe un 401. Los componentes no manejan `sessionStorage` ni llaman a la API de autenticación directamente: usan lo que ofrece el provider.

## 6. ¿Qué beneficio ofrece useAuth?

Simplifica el acceso a la sesión. En lugar de escribir `useContext(AuthContext)` en cada componente y revisar si el valor existe, se llama a `useAuth()` y se obtiene directamente `status`, `user`, `accessToken`, `logout`, etc. Además, si el contexto es `undefined` porque el componente está fuera de `AuthProvider`, lanza el error "useAuth debe utilizarse dentro de AuthProvider.", así el problema se detecta de inmediato. Como lanza el error en ese caso, el valor que devuelve siempre es de tipo `AuthContextValue` y TypeScript no obliga a revisar `undefined` en cada uso.

## 7. ¿Qué representa el estado checking?

Representa el momento en que todavía no se sabe si la sesión es válida: hay un token guardado, pero la respuesta de `/auth/me` aún no llega. `AuthProvider` empieza en `checking` solo si encuentra un token, y en `anonymous` si no hay ninguno. Mientras dura este estado, `ProtectedRoute` y `PublicOnlyRoute` muestran "Validando la sesión..." en lugar de decidir. Sin este estado, al recargar `/tasks` la aplicación pensaría que no hay usuario y redirigiría a `/login` aunque la sesión fuera válida. `retrySession` también vuelve a `checking` mientras repite la validación.

## 8. ¿Qué diferencia existe entre 401 y 403?

Un 401 (Unauthorized) significa que la API no sabe quién hace la petición: falta el token, expiró o no es válido. La solución es volver a iniciar sesión, y por eso `http.service.ts` llama al `unauthorizedHandler` cuando recibe un 401 en una petición con token. Un 403 (Forbidden) significa que la API sí sabe quién es el usuario, pero ese usuario no tiene permiso para la acción, por ejemplo, un `user` que intenta eliminar una tarea. Iniciar sesión de nuevo no lo resuelve, porque el usuario seguiría teniendo el mismo rol. El 401 es un problema de autenticación y el 403 es un problema de autorización.

## 9. ¿Por qué ProtectedRoute no sustituye la seguridad del Backend?

Porque `ProtectedRoute` solo decide qué páginas muestra la interfaz. Todo el código del Frontend se ejecuta en el navegador del usuario, así que se puede leer, modificar o saltar. Una persona puede cambiar el estado de React con las herramientas del navegador o, más fácil, hacer peticiones directamente a la API con `curl` o Postman sin pasar por la interfaz. Si la API no revisara el token, esas peticiones funcionarían. `ProtectedRoute` mejora la experiencia, porque evita mostrar una página vacía y redirige a `/login` guardando la ruta de origen. La protección real está en el Backend, que valida el token en cada petición a `/tasks`.

## 10. ¿Por qué ocultar Eliminar a user no constituye autorización?

Porque esconder el botón con `canDelete` solo cambia lo que se ve en pantalla. No impide que alguien con rol `user` envíe `DELETE /tasks/:id` con su token, desde la consola del navegador o con otra herramienta. La autorización es una decisión que debe tomar el Backend: al recibir la petición, revisa el rol del usuario y responde 403 si no es `admin`. Ocultar el botón y la validación de `handleDeleteTask` en `TasksPage` sirven para no ofrecer una acción que va a fallar y para mostrar un mensaje claro, pero la regla se cumple porque la API la revisa.

## 11. ¿Por qué un cambio de rol exige iniciar sesión de nuevo?

Porque el rol se obtiene cuando se inicia la sesión y se queda guardado. El JWT se firma al hacer login con los datos del usuario en ese momento, incluido su rol, y no cambia aunque la base de datos se actualice. El token anterior sigue teniendo el rol viejo hasta que expira. En el Frontend pasa lo mismo: `user.role` se guarda en el estado de `AuthProvider` al iniciar sesión o al validar con `/auth/me`, y no se vuelve a consultar mientras se navega. Al cerrar sesión e iniciarla de nuevo, el Backend genera un token nuevo con el rol actualizado y el Frontend recibe el usuario con sus permisos nuevos.

## 12. ¿Qué ocurre realmente al seleccionar Cerrar sesión?

`AppNavigation` llama a `logout()` y luego navega a `/login` con `replace: true`. `logout` ejecuta `endSession`, que borra el token de `sessionStorage` con `removeAccessToken`, deja `accessToken` y `user` en `null`, cambia el estado a `anonymous` y muestra el mensaje "Cerraste sesión correctamente.". Todo esto pasa solo en el navegador: el Frontend no avisa al Backend. El JWT no se invalida en el servidor y seguiría funcionando hasta su expiración si alguien lo hubiera copiado antes. El navegador simplemente lo olvida y deja de enviarlo, así que las páginas protegidas ya no se pueden ver.

## 13. ¿Qué riesgo conserva sessionStorage ante XSS?

`sessionStorage` se puede leer con JavaScript desde la misma página. Si un atacante logra ejecutar código en la aplicación mediante XSS (por ejemplo, con un script inyectado o una dependencia comprometida), ese código puede leer el token con `sessionStorage.getItem("task-manager.access-token")`, enviarlo a otro servidor y usarlo para hacer peticiones a la API como si fuera el usuario, hasta que el token expire. `sessionStorage` reduce el tiempo de exposición respecto a `localStorage`, porque el token se borra al cerrar la pestaña y no se comparte entre pestañas, pero no protege contra XSS. Para reducir este riesgo hay que evitar el XSS en sí: React escapa el texto por defecto, y no se debe usar `dangerouslySetInnerHTML` con datos externos. Una alternativa más segura son las cookies `HttpOnly`, que JavaScript no puede leer.

## 14. ¿Por qué las tareas todavía no pertenecen a un usuario específico?

Porque el modelo de tarea no tiene ningún campo que la relacione con un usuario. La interfaz `Task` solo tiene `id`, `title`, `status`, `createdAt` y `updatedAt`, sin un `userId` o `ownerId`. En esta actividad, el token solo se usa para comprobar que hay una sesión válida y qué rol tiene el usuario, no para filtrar los datos. Por eso todos los usuarios autenticados ven y modifican la misma colección de tareas. Para que cada tarea tenga dueño, el Backend tendría que guardar el `id` del usuario al crearla, tomándolo del token y no de lo que envíe el Frontend, y devolver o modificar solo las tareas de ese usuario.

## 15. ¿Qué dificultad encontraste al integrar la sesión y cómo la resolviste?

No hubo algo alguito bien