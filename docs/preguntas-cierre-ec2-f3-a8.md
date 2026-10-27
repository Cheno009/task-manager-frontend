# Preguntas de cierre - EC2 F3 A8

## 1. ¿Por qué las reglas de validación se colocaron en una utilidad?

Porque el título de una tarea se valida en dos lugares: al crearla en `TaskForm` y al editarla en `TaskItem`. Si cada componente tuviera sus propias reglas, sería fácil que se desincronizaran, por ejemplo que crear exija 3 caracteres y editar no. Al ponerlas en `src/utils/task-validation.ts`, los dos componentes llaman a la misma función `validateTaskTitle` y usan la misma constante `TASK_TITLE_MAX_LENGTH`. Si una regla cambia, se modifica en un solo archivo. Además, la función no depende de React, así que es más fácil de leer y de probar por separado.

## 2. ¿Qué significa el retorno string | null de validateTaskTitle?

Indica que la función tiene dos resultados posibles. Si el título tiene algún problema, devuelve un `string` con el mensaje de error que se le muestra al usuario, como "El título debe tener al menos 3 caracteres.". Si el título es válido, devuelve `null`, que significa "no hay error". Así, quien llama a la función puede hacer `if (validationMessage)` para saber si debe detenerse y mostrar el mensaje. En `handleTitleChange` se usa `validateTaskTitle(value) ?? ""` para convertir el `null` en una cadena vacía, porque el estado `error` es de tipo `string`.

## 3. ¿Qué función cumplen aria-invalid, aria-describedby y role alert?

Son atributos de accesibilidad para que los lectores de pantalla entiendan el estado del formulario. `aria-invalid={Boolean(error)}` marca el campo como inválido cuando hay un error. `aria-describedby` conecta el campo con los textos que lo explican: en `TaskForm` apunta a `task-title-help` (el contador de caracteres) y, si hay error, también a `task-title-error`, así el lector de pantalla los lee al enfocar el campo. `role="alert"` en el párrafo del error hace que el mensaje se anuncie en cuanto aparece, sin que el usuario tenga que buscarlo. Una persona que no ve la pantalla se entera del error igual que una que sí la ve.

## 4. ¿Por qué query, filter y sortBy son estados controlados?

Porque sus valores se guardan en el estado de `App` y los controles de `TaskFilters` solo los muestran y avisan cuando cambian. El campo de búsqueda recibe `value={query}` y llama a `onQueryChange`, y los dos `select` funcionan igual con `filter` y `sortBy`. Al estar en `App`, esos valores se pueden usar para calcular `visibleTasks`, para decidir qué mensaje mostrar en la lista vacía y para reiniciarlos todos juntos con `handleClearCriteria`. Si cada control guardara su propio valor, `App` no sabría qué buscó el usuario y el botón "Limpiar criterios" no podría vaciar los campos.

## 5. ¿Por qué visibleTasks no debe almacenarse como estado independiente?

Porque se puede calcular a partir de otros datos que ya están en el estado: `tasks`, `query`, `filter` y `sortBy`. Si se guardara en su propio `useState`, habría que acordarse de actualizarlo cada vez que cambie cualquiera de esos cuatro valores. Si se olvida en algún caso (por ejemplo, al completar una tarea), la lista visible quedaría desactualizada respecto a las tareas reales. Al calcularlo en cada renderizado con `getVisibleTasks(tasks, { query, filter, sortBy })`, siempre está sincronizado con la fuente de verdad sin código extra.

## 6. ¿Cómo se normaliza una búsqueda?

En `getVisibleTasks`, el texto de búsqueda pasa por `options.query.trim().toLocaleLowerCase("es-MX")`. `trim` quita los espacios del inicio y del final, y `toLocaleLowerCase` convierte todo a minúsculas usando las reglas del español. El título de cada tarea también se pasa a minúsculas antes de compararlo con `includes`. Así, buscar "  DOCUMENTACIÓN " encuentra la tarea "Revisar documentación", porque se ignoran las mayúsculas y los espacios sobrantes. Si la búsqueda queda vacía, `includes("")` es verdadero para todas las tareas y no se oculta ninguna.

## 7. ¿Por qué se crea una copia antes de utilizar sort?

Porque `sort` ordena el arreglo en su lugar, es decir, modifica el arreglo original en vez de devolver uno nuevo. Si se ordenara directamente un arreglo que viene del estado, se estaría mutando el estado de React, algo que no se debe hacer porque React no detecta el cambio y el orden guardado de las tareas se alteraría. Con `[...filteredTasks].sort(...)` se ordena una copia y el arreglo original queda igual. En este caso `filter` ya devuelve un arreglo nuevo, pero copiar antes de `sort` deja claro que la función no modifica nada de lo que recibe.

## 8. ¿Qué responsabilidad tiene task-query.service.ts?

Se encarga de decidir qué tareas se muestran y en qué orden. Su función `getVisibleTasks` recibe la colección completa y las opciones de consulta (`query`, `filter` y `sortBy`), filtra las tareas por título y por estado, y las ordena con `compareTasks` según el criterio elegido: por fecha de actualización, por fecha de creación o por título con `Intl.Collator`. No guarda estado ni dibuja nada en pantalla, solo transforma datos. Así, `App` queda más limpio y la lógica de consulta se puede revisar o cambiar en un solo archivo.

## 9. ¿Por qué el resultado de JSON.parse se trata como unknown?

Porque los datos de `localStorage` vienen de afuera de la aplicación y no hay garantía de su forma. El usuario pudo editarlos desde las herramientas del navegador, pudieron guardarse con una versión anterior de la app o pudieron dañarse. `JSON.parse` devuelve `any` por defecto, y con `any` TypeScript deja de revisar los tipos. Al declarar `const parsedValue: unknown`, TypeScript obliga a comprobar el valor antes de usarlo. Por eso `loadTasks` revisa primero que sea un arreglo con `Array.isArray` y que cada elemento sea una tarea con `isTask`, y solo después lo devuelve como `Task[]`.

## 10. ¿Qué comprueba la función isTask?

Comprueba que un valor desconocido tenga la forma de una `Task`. Primero revisa que sea un objeto y que no sea `null`. Después confirma que `id` y `title` sean cadenas, que `status` sea `"pending"` o `"completed"` (con `isTaskStatus`) y que `createdAt` y `updatedAt` sean cadenas que se puedan convertir en una fecha válida con `Date.parse`. Su tipo de retorno `value is Task` es un type guard: cuando devuelve `true`, TypeScript ya trata el valor como `Task`. Si alguna tarea guardada no pasa la revisión, `loadTasks` descarta todo y usa las tareas iniciales.

## 11. ¿Qué ventaja ofrece la inicialización diferida de useState?

En `useState<Task[]>(() => loadTasks(initialTasks))` se pasa una función en lugar de un valor. React ejecuta esa función solo en el primer renderizado para obtener el valor inicial y en los siguientes la ignora. Si se escribiera `useState(loadTasks(initialTasks))`, `loadTasks` se ejecutaría en cada renderizado, leyendo `localStorage` y haciendo `JSON.parse` cada vez, aunque el resultado ya no se use. Como `App` se vuelve a renderizar con cada letra que se escribe en la búsqueda, la inicialización diferida evita ese trabajo repetido.

## 12. ¿Por qué localStorage se sincroniza mediante useEffect?

Porque guardar en `localStorage` es un efecto secundario: es una acción fuera de React, no parte de lo que se dibuja en pantalla. El renderizado solo debería calcular la interfaz, y `useEffect` sirve para ejecutar estas acciones después de que React actualiza la pantalla. Con el arreglo de dependencias `[tasks]`, el efecto solo se ejecuta cuando cambia la colección de tareas, no cuando cambia la búsqueda o el filtro. Además, así el guardado está en un solo lugar: crear, editar, completar o eliminar solo modifican el estado, y el efecto se encarga de guardar el resultado.

## 13. ¿Por qué TaskSummary recibe tasks y TaskList recibe visibleTasks?

Porque cada componente muestra algo distinto. `TaskSummary` presenta el total, las pendientes y las completadas de todo el trabajo, así que necesita la colección completa. Si recibiera `visibleTasks`, los números cambiarían cada vez que el usuario busca o filtra, y el resumen dejaría de reflejar el avance real. `TaskList`, en cambio, debe mostrar solo las tareas que coinciden con la búsqueda, el filtro y el orden elegidos, por eso recibe `visibleTasks`. El usuario puede filtrar la lista sin que cambie el resumen general.

## 14. ¿Qué información se pierde y cuál permanece al recargar?

Permanecen las tareas, porque `saveTasks` las guarda en `localStorage` bajo la clave `task-manager.tasks` cada vez que cambian, y `loadTasks` las recupera al iniciar la app. Las tareas creadas, editadas, completadas o eliminadas se conservan al recargar. Se pierde todo lo demás, que solo vive en el estado de React: el texto de búsqueda, el filtro, el orden elegido (vuelven a `""`, `"all"` y `"updated-desc"`), lo que se estaba escribiendo en el formulario, los mensajes de error y cualquier edición que no se haya guardado. Además, los datos solo quedan en ese navegador: en otro navegador o en otro equipo no aparecen.

## 15. ¿Qué dificultad encontraste y cómo la resolviste?

ninguna c: