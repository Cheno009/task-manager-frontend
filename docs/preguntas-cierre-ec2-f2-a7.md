# Preguntas de cierre - EC2 F2 A7

## 1. ¿Qué diferencia existe entre una variable local y el estado de React?

Una variable local se crea de nuevo cada vez que el componente se renderiza, así que pierde su valor entre un renderizado y otro. Además, cambiarla no avisa a React, por lo que la pantalla no se actualiza. El estado, creado con `useState`, React lo guarda entre renderizados, y cuando se cambia con su función actualizadora React vuelve a renderizar el componente con el valor nuevo. Por ejemplo, en `TaskForm` el texto del campo se guarda en el estado `title`. Si fuera una variable normal, lo que escribe el usuario se perdería en el siguiente renderizado y el contador `{title.length}/120` nunca cambiaría.

## 2. ¿Qué valores devuelve useState?

Devuelve un arreglo con dos elementos, que se separan con desestructuración: el valor actual del estado y una función para cambiarlo. En `App`, `const [tasks, setTasks] = useState<Task[]>(...)` deja en `tasks` la colección actual y en `setTasks` la función que la reemplaza y provoca un nuevo renderizado. En `TaskForm`, `const [title, setTitle] = useState("")` hace lo mismo con el texto del formulario, empezando con una cadena vacía.

## 3. ¿Por qué useState se declara en el nivel superior del componente?

Porque React no identifica cada estado por su nombre, sino por el orden en que se llaman los hooks en cada renderizado. Si `useState` estuviera dentro de un `if`, un ciclo o una función interna, ese orden podría cambiar de un renderizado a otro y React le asignaría a una variable el valor de otra. Por eso existe la regla de los hooks: se llaman siempre al inicio del componente y en el mismo orden. En `TaskItem`, `isEditing` y `draftTitle` se declaran arriba, antes de cualquier condición o función.

## 4. ¿Qué significa que un campo sea controlado?

Significa que el valor que muestra el campo viene del estado de React y no del propio elemento del DOM. En `TaskForm`, el `input` recibe `value={title}`, y cada vez que el usuario escribe, `onChange` llama a `setTitle(event.target.value)`. React actualiza el estado y el campo muestra el valor nuevo. Como el valor siempre está en el estado, el componente puede usarlo para otras cosas: validar con `normalizedTitle`, deshabilitar el botón si está vacío, mostrar el contador de caracteres y limpiar el campo con `setTitle("")` después de agregar la tarea.

## 5. ¿Por qué handleSubmit utiliza preventDefault?

Porque al enviar un formulario el navegador hace por defecto una petición y recarga la página. Si eso pasara, la aplicación se reiniciaría y se perdería el estado, incluida la tarea que se acaba de crear. `event.preventDefault()` cancela ese comportamiento, y así React maneja el envío: revisa que el título no esté vacío, llama a `onAddTask` y limpia el campo, sin recargar. `TaskItem` hace lo mismo en `handleEditSubmit` al guardar una edición.

## 6. ¿Cómo comunica TaskForm una nueva tarea a App?

Mediante una función que `App` le envía como prop. `App` define `handleAddTask` y la pasa con `<TaskForm onAddTask={handleAddTask} />`. Cuando el usuario envía el formulario, `TaskForm` llama a `onAddTask(normalizedTitle)` con el título ya limpio. `TaskForm` solo envía el texto. Es `App` quien arma la tarea completa (con `id`, `status: "pending"` y las fechas) y la agrega al estado. Los datos siguen bajando por props, y los eventos suben desde el hijo hacia el padre por medio de estas funciones.

## 7. ¿Por qué App funciona como fuente de verdad?

Porque es el único componente que guarda la colección de tareas en su estado (`tasks`) y el único que puede cambiarla con `setTasks`. `TaskSummary` y `TaskList` reciben esa misma colección por props, así que siempre muestran datos coherentes: si se completa o elimina una tarea, el resumen y la lista cambian al mismo tiempo. Los hijos no modifican las tareas directamente. Avisan a `App` con `onAddTask`, `onToggleStatus`, `onEditTask` y `onDeleteTask`, y `App` decide cómo actualizar el estado. Si cada componente tuviera su propia copia de las tareas, las copias podrían dejar de coincidir.

## 8. ¿Cómo se implementa Create sin utilizar push?

Se crea un arreglo nuevo con el operador spread: `setTasks((currentTasks) => [newTask, ...currentTasks])`. Ese arreglo tiene la nueva tarea al inicio y, después, todas las tareas que ya existían. No se usa `push` porque modifica el arreglo original. React compara el estado anterior con el nuevo por referencia, y si el arreglo es el mismo objeto, React no detecta el cambio y puede no volver a renderizar. Al crear un arreglo nuevo, la referencia cambia y React actualiza la interfaz.

## 9. ¿Cómo permite map actualizar una sola tarea?

`map` recorre todas las tareas y devuelve un arreglo nuevo del mismo tamaño. En cada vuelta se compara el `id`: si no coincide, se devuelve la misma tarea sin cambios. Si coincide, se devuelve un objeto nuevo con `{ ...task, status: ..., updatedAt: now }` en `handleToggleStatus` o con `{ ...task, title, updatedAt: now }` en `handleEditTask`. El spread copia todas las propiedades de la tarea original y luego se reemplazan solo las que cambian. Así se modifica una sola tarea sin alterar el arreglo ni el objeto original.

## 10. ¿Cómo utiliza filter la operación Delete?

En `handleDeleteTask`, `currentTasks.filter((task) => task.id !== id)` devuelve un arreglo nuevo con todas las tareas cuyo `id` es distinto del que se quiere eliminar. La tarea seleccionada no pasa la condición y queda fuera, y el arreglo original no se modifica. Antes de filtrar, `App` busca la tarea con `find` y pide confirmación con `window.confirm`, mostrando su título. Si el usuario cancela, la función termina con `return` y el estado no cambia.

## 11. ¿Por qué se emplea una función actualizadora en setTasks?

Porque así React entrega a la función el valor más reciente del estado (`currentTasks`) en el momento de aplicar el cambio. React puede agrupar varias actualizaciones, y la variable `tasks` del renderizado actual podría estar desactualizada. Si se escribiera `setTasks([newTask, ...tasks])` dos veces seguidas, la segunda llamada usaría la misma lista vieja y se perdería la primera tarea. Con `setTasks((currentTasks) => ...)`, cada actualización parte del resultado de la anterior. Por eso Create, Update y Delete usan esta forma.

## 12. ¿Qué información conserva TaskItem como estado local?

`TaskItem` guarda dos estados que solo le importan a esa tarea mientras se edita. `isEditing` indica si la tarea está en modo edición: decide si se muestra el formulario o el título con su estado, y deshabilita los botones de acción mientras se edita. `draftTitle` guarda el texto que el usuario escribe en el campo de edición antes de guardarlo. Ese borrador no se envía a `App` hasta que se presiona "Guardar". Si se presiona "Cancelar", `draftTitle` vuelve al título original y la tarea en `App` no cambia. Estos datos no se guardan en `App` porque ningún otro componente los necesita.

## 13. ¿Por qué los cambios desaparecen al recargar la página?

Porque el estado de React solo vive en la memoria del navegador mientras la página está abierta. Al recargar, la aplicación se vuelve a cargar desde cero, `App` se monta otra vez y `useState` se inicializa con `[...initialTasks]`, es decir, con las tareas fijas de `src/data/tasks.ts`. Las tareas creadas, editadas o eliminadas nunca se guardaron en ningún lugar permanente. Para conservarlas haría falta guardarlas en `localStorage` o en un backend con una API.

## 14. ¿Qué dificultad encontraste y cómo la resolviste?

Ninguna asi nomas quedo