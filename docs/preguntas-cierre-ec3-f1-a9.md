# Preguntas de cierre - EC3 F1 A9

## 1. ¿Qué es una aplicación de página única?

Es una aplicación web que el navegador carga una sola vez desde un único documento HTML, `index.html`. Después, en lugar de pedir una página nueva al servidor cada vez que el usuario navega, JavaScript cambia el contenido de la pantalla y actualiza la dirección de la barra del navegador. En este proyecto, pasar de Inicio a Tareas o al detalle de una tarea no recarga la página: React Router decide qué componente mostrar según la URL. Por eso la navegación es rápida y el estado de React, como las tareas o la búsqueda, se conserva al cambiar de sección.

## 2. ¿Qué responsabilidad tiene BrowserRouter?

`BrowserRouter` conecta React Router con la barra de direcciones del navegador. Lee la URL actual, escucha cuando cambia (por un enlace o por los botones de atrás y adelante) y usa la History API para cambiarla sin recargar la página. En `src/main.tsx` envuelve a `<App />`, así que todos los componentes que están dentro pueden usar `Routes`, `Link`, `NavLink`, `useParams` y `useNavigate`. Si un componente usa esas herramientas fuera de un router, React Router muestra un error.

## 3. ¿Cuál es la diferencia entre Routes y Route?

`Route` define una sola regla: relaciona una ruta (`path`) con el elemento que se muestra (`element`). Por ejemplo, `<Route path="tasks" element={<TasksPage ... />} />`. `Routes` es el contenedor que agrupa todas esas reglas, compara la URL actual con ellas y muestra solo la que mejor coincide. En `App`, `Routes` envuelve el `Route` del layout y, dentro de él, las rutas de inicio, tareas, detalle y la ruta `*`. Un `Route` solo funciona dentro de `Routes`, y `Routes` necesita los `Route` para saber qué mostrar.

## 4. ¿Qué es una ruta índice?

Es la ruta hija que se muestra cuando la URL coincide exactamente con la ruta del padre, sin nada más. Se declara con la propiedad `index` en lugar de un `path`. En `App`, `<Route index element={<HomePage tasks={tasks} />} />` está dentro de la ruta del layout, así que al entrar a `/` se muestra `HomePage` dentro de `AppLayout`. Es la página por defecto de esa sección y no tiene rutas hijas.

## 5. ¿Qué beneficio ofrece un layout?

Permite escribir una sola vez la estructura que comparten todas las páginas. `AppLayout` contiene el encabezado (`AppHeader`), la navegación (`AppNavigation`), el `main` y el pie de página. Todas las rutas son hijas de `<Route element={<AppLayout />}>`, por lo que cada página solo define su propio contenido y no repite esa estructura. Además, al navegar entre páginas, el encabezado y la navegación no se vuelven a montar: solo cambia el contenido central. Si hay que modificar el pie de página, se cambia en un solo archivo.

## 6. ¿Qué función cumple Outlet?

`Outlet` marca el lugar dentro del layout donde se muestra la ruta hija que coincide con la URL. En `AppLayout`, está dentro de `<main className="app-main">`. Si la URL es `/`, ahí aparece `HomePage`; si es `/tasks`, aparece `TasksPage`; y si es `/tasks/task-003`, aparece `TaskDetailPage`. Sin `Outlet`, el layout mostraría el encabezado y la navegación, pero no el contenido de ninguna página.

## 7. ¿Qué diferencia existe entre Link y NavLink?

Los dos navegan a otra ruta sin recargar la página. `Link` es un enlace simple: en `HomePage` se usa para el botón "Administrar tareas" y en `TaskItem` para "Ver detalle". `NavLink` además sabe si su ruta es la que está activa y se lo pasa a `className` como `isActive`. En `AppNavigation`, eso sirve para agregar la clase `app-navigation__link--active` al enlace de la sección actual. El enlace de Inicio usa `end` para que solo quede activo en `/` exactamente y no también en `/tasks`. React Router también agrega `aria-current="page"` al enlace activo, lo que ayuda a los lectores de pantalla.

## 8. ¿Por qué no se utilizan enlaces a para navegar internamente?

Porque un `<a href="/tasks">` normal hace que el navegador pida la página otra vez y recargue toda la aplicación. Al recargar, React se monta de nuevo y se pierde todo el estado que no está guardado: la búsqueda, el filtro, el orden y cualquier edición sin guardar. También se descargan otra vez los archivos y la navegación es más lenta. `Link` y `NavLink` muestran un `<a>` en el HTML, pero interceptan el clic, cambian la URL con la History API y dejan que React Router muestre la nueva página sin recargar. Las etiquetas `<a>` normales siguen sirviendo para enlaces a otros sitios.

## 9. ¿Qué representa :taskId?

En la ruta `tasks/:taskId`, los dos puntos indican que `taskId` es un parámetro dinámico, es decir, un valor que cambia y no un texto fijo. Esa ruta coincide con `/tasks/task-003` o con `/tasks/` seguido de cualquier `id` generado con `crypto.randomUUID()`. React Router guarda ese valor con el nombre `taskId`. Así, una sola ruta y un solo componente, `TaskDetailPage`, sirven para mostrar el detalle de cualquier tarea, sin crear una ruta por cada una.

## 10. ¿Cómo se recupera un parámetro dinámico?

Con el hook `useParams`. En `TaskDetailPage`, `const { taskId } = useParams<{ taskId: string }>()` obtiene el valor de la URL. Después se busca la tarea con `tasks.find((currentTask) => currentTask.id === taskId)`. `taskId` puede ser `undefined` y cualquier persona puede escribir un `id` inventado en la barra de direcciones, así que la página revisa si encontró la tarea. Si no existe, muestra `NotFoundPage` con el mensaje "La tarea solicitada no existe o fue eliminada.".

## 11. ¿Cuándo debe utilizarse useNavigate?

Cuando la navegación debe ocurrir desde código como resultado de una acción, y no porque el usuario hizo clic en un enlace. En `TaskDetailPage`, después de eliminar la tarea, la página actual ya no tiene nada que mostrar, así que `handleDeleteTask` llama a `navigate("/tasks", { replace: true })`. Solo navega si `onDeleteTask` devuelve `true`; si el usuario cancela la confirmación, se queda en la página. `replace: true` reemplaza la entrada del historial, para que el botón "atrás" no regrese al detalle de una tarea eliminada. Si la navegación es un clic normal, conviene usar `Link`, porque es accesible y permite abrir el enlace en otra pestaña.

## 12. ¿Qué función cumple la ruta *?

Es una ruta comodín que coincide con cualquier URL que no coincida con las otras rutas. Se usa para mostrar una página 404 en lugar de una pantalla vacía. En `App`, `<Route path="*" element={<NotFoundPage />} />` muestra "Página no encontrada" y un enlace para regresar al inicio. Como está dentro del layout, la página de error conserva el encabezado y la navegación. React Router elige la ruta más específica, así que `*` solo se usa cuando ninguna otra coincide.

## 13. ¿Por qué el estado continúa administrado por App?

Porque varias páginas necesitan los mismos datos. `HomePage` muestra el resumen, `TasksPage` muestra la lista y permite modificarla, y `TaskDetailPage` busca una tarea y puede eliminarla. Si cada página guardara su propia copia, al eliminar una tarea en el detalle la lista no se enteraría. `App` está por encima de todas las rutas, así que sigue siendo la fuente de verdad y envía `tasks` y las funciones como `handleDeleteTask` por props a cada página. Además, `App` no se desmonta al navegar, mientras que las páginas sí. Por eso `query`, `filter` y `sortBy` también están ahí: si el usuario busca algo, entra al detalle y vuelve a `/tasks`, la búsqueda sigue igual.

## 14. ¿Por qué localStorage permanece en esta actividad?

Porque el router no guarda datos: solo decide qué página mostrar según la URL. El estado de `App` sigue viviendo en memoria y se pierde al recargar, igual que antes. Con rutas esto es más importante, porque ahora el usuario puede recargar o abrir directamente una dirección como `/tasks/task-003`. Gracias a `loadTasks`, al iniciar la aplicación se recuperan las tareas guardadas y `TaskDetailPage` puede encontrar la tarea. Sin `localStorage`, una tarea creada por el usuario desaparecería al recargar su página de detalle y se mostraría "Tarea no encontrada". `saveTasks` en el `useEffect` sigue guardando cada cambio.

## 15. ¿Qué dificultad encontraste y cómo la resolviste?

nada nadita