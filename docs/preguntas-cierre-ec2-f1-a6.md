# Preguntas de cierre - EC2 F1 A6

## 1. ¿Qué función cumple la interfaz Task?

La interfaz `Task`, definida en `src/models/task.interface.ts`, describe la forma que debe tener cualquier tarea de la aplicación: un `id`, un `title`, un `status` y las fechas `createdAt` y `updatedAt`. Funciona como un contrato. Cada tarea del arreglo en `src/data/tasks.ts` y cada componente que recibe tareas debe respetar esa estructura, y si a una tarea le falta un campo o tiene un valor de otro tipo, TypeScript lo marca como error antes de ejecutar la aplicación. Además, al estar en un archivo aparte, todo el proyecto usa una sola definición en lugar de repetirla en cada componente.

## 2. ¿Qué diferencia existe entre Task y TaskStatus?

`Task` es una interfaz que describe un objeto completo con varias propiedades. `TaskStatus` es un tipo de unión, `"pending" | "completed"`, que describe un solo valor y limita los textos que se aceptan como estado. Se relacionan porque la propiedad `status` de `Task` usa el tipo `TaskStatus`. En pocas palabras, `Task` define la tarea entera y `TaskStatus` define únicamente los estados válidos que puede tener.

## 3. ¿Qué significa declarar un arreglo como Task[]?

Significa que el arreglo solo puede contener objetos que cumplan con la interfaz `Task`. En `export const tasks: Task[] = [...]`, TypeScript revisa cada elemento de la lista: si alguno no tiene `id` o tiene un `status` como `"done"`, aparece un error. También sirve para que, al recorrer el arreglo, el editor sepa que cada elemento es una `Task` y ofrezca autocompletado de sus propiedades. Las props de `TaskList` y `TaskSummary` también se declaran como `tasks: Task[]`, así que ambos componentes esperan exactamente ese tipo de colección.

## 4. ¿Qué hace el método map?

`map` es un método de los arreglos que recorre cada elemento, le aplica una función y devuelve un arreglo nuevo con los resultados, del mismo tamaño que el original. El arreglo original no se modifica. Por ejemplo, `[1, 2, 3].map((n) => n * 2)` produce `[2, 4, 6]`.

## 5. ¿Qué resultado produce map dentro de TaskList?

En `TaskList`, `tasks.map((task) => <TaskItem key={task.id} task={task} />)` convierte el arreglo de objetos `Task` en un arreglo de elementos `<TaskItem />`, uno por cada tarea. React recibe ese arreglo de elementos dentro de las llaves del TSX y los muestra en pantalla en orden. Con las cinco tareas de `src/data/tasks.ts` se generan cinco `TaskItem`. Si se agregan o quitan tareas del arreglo, la lista cambia sola, sin escribir cada `TaskItem` a mano como se hacía antes.

## 6. ¿Para qué utiliza React la propiedad key?

React usa `key` para identificar cada elemento de una lista. Cuando la lista cambia (se agrega, elimina o reordena una tarea), React compara las claves del renderizado anterior con las nuevas para saber qué elemento es cuál. Así actualiza solo lo que cambió y no vuelve a crear toda la lista. La `key` no llega como prop al componente hijo: React la usa internamente. Si falta, React muestra una advertencia en la consola.

## 7. ¿Por qué se utiliza task.id y no el índice?

Porque `task.id` es un identificador único y estable que siempre pertenece a la misma tarea, sin importar su posición. El índice solo indica en qué lugar del arreglo está un elemento, y ese lugar puede cambiar. Si se elimina la primera tarea o se reordena la lista, todas las demás tareas cambiarían de índice y React podría confundirlas: actualizaría el elemento equivocado o mezclaría el estado entre tareas. Con el `id` (por ejemplo `"task-003"`), React reconoce cada tarea aunque cambie de lugar, lo cual será importante cuando se puedan agregar, eliminar y filtrar tareas.

## 8. ¿Cómo se envía una tarea de TaskList a TaskItem?

Se envía mediante una prop. Dentro de `map`, `TaskList` pasa el objeto completo con `task={task}`. `TaskItem` declara en `TaskItemProps` que recibe `task: Task` y, después, extrae los datos que necesita con desestructuración: `const { title, status, updatedAt } = task;`. Antes se enviaban `title` y `status` por separado. Ahora se envía la tarea entera, así que si `TaskItem` necesita otro campo, como la fecha, no hay que cambiar `TaskList`.

## 9. ¿Cómo se comunican App, TaskSummary y TaskList?

La comunicación va de padre a hijo mediante props. `App` importa la colección `tasks` desde `src/data/tasks.ts` y se la envía a sus dos hijos: `<TaskSummary tasks={tasks} />` y `<TaskList tasks={tasks} />`. `TaskSummary` y `TaskList` no se comunican entre sí directamente. Los dos reciben la misma colección desde `App`, y por eso siempre muestran información coherente. Luego, `TaskList` pasa cada tarea individual a `TaskItem`. Los datos fluyen en una sola dirección: de `App` hacia abajo.

## 10. ¿Qué es el renderizado condicional?

Es mostrar una parte u otra de la interfaz según una condición. En `TaskList` se usa un operador ternario: si `tasks.length === 0`, se muestra el bloque `empty-state` con el mensaje "No hay tareas registradas". Si no, se muestra la lista con los `TaskItem`. También hay condiciones más pequeñas: `resultLabel` escribe "1 tarea" o "N tareas" según la cantidad, y `TaskItem` muestra "Completada" o "Pendiente" según el valor de `status`.

## 11. ¿Por qué el resumen se calcula a partir de la colección?

Porque así los números siempre coinciden con las tareas reales. Antes, `App` enviaba valores fijos (`total={3}`, `pending={2}`, `completed={1}`), y si se agregaba o cambiaba una tarea había que acordarse de actualizar esos números a mano, lo que podía dejar el resumen desactualizado. Ahora `TaskSummary` recibe el arreglo y calcula todo: el total con `tasks.length`, las completadas con `filter` y las pendientes como la diferencia. La colección es la única fuente de verdad y el resumen se deriva de ella. Cuando más adelante las tareas cambien por las acciones del usuario, el resumen se actualizará sin trabajo adicional.

## 12. ¿Qué dificultad encontraste durante la refactorización y cómo la resolviste?

ninguna :).
