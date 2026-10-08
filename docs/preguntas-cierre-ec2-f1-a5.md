# Preguntas de cierre - EC2 F1 A5

## 1. ¿Qué problema resuelve React al construir una interfaz?

React resuelve el problema de construir y mantener interfaces que crecen y cambian. En lugar de manipular el DOM a mano con JavaScript, la interfaz se describe de forma declarativa: se indica cómo debe verse cada parte y React se encarga de actualizar la pantalla cuando cambian los datos. Además, permite dividir la interfaz en piezas pequeñas e independientes (componentes) que se pueden reutilizar, leer y modificar por separado, lo que evita tener un único archivo HTML enorme y difícil de mantener.

## 2. ¿Qué es un componente?

Un componente es una función de JavaScript/TypeScript que devuelve una parte de la interfaz escrita en TSX. Representa una pieza con una responsabilidad concreta, por ejemplo `AppHeader` muestra el encabezado, `TaskForm` el formulario de registro y `TaskItem` una tarea individual. Los componentes se pueden combinar entre sí para formar la interfaz completa y pueden recibir datos mediante props.

## 3. ¿Por qué los componentes comienzan con mayúscula?

Porque así React distingue entre etiquetas HTML nativas y componentes propios. Una etiqueta en minúscula, como `<header>` o `<section>`, se interpreta como un elemento HTML del navegador; una etiqueta en mayúscula, como `<AppHeader />` o `<TaskList />`, se interpreta como una referencia a una función componente que React debe ejecutar. Si el componente se nombrara en minúscula, React intentaría crear un elemento HTML inexistente.

## 4. ¿Qué diferencia existe entre HTML y TSX?

HTML es el lenguaje de marcado que interpreta el navegador directamente. TSX es una extensión de sintaxis de TypeScript que se parece a HTML pero se transforma en llamadas de JavaScript antes de llegar al navegador. Algunas diferencias visibles en el proyecto:

- Se usa `className` en lugar de `class` y `htmlFor` en lugar de `for`, porque `class` y `for` son palabras reservadas de JavaScript.
- Se pueden insertar expresiones entre llaves, como `{title}` o `{statusLabel}`.
- Los atributos pueden recibir valores de JavaScript, como `maxLength={120}` (número) o `className={`task-item task-item--${status}`}` (cadena dinámica).
- Todas las etiquetas deben cerrarse, incluso las vacías (`<input />`), y un componente debe devolver un único elemento raíz.
- TypeScript revisa los tipos de los valores usados en el marcado.

## 5. ¿Para qué se utiliza className?

`className` se utiliza para asignar clases CSS a los elementos, igual que el atributo `class` de HTML. Se llama así porque `class` es una palabra reservada en JavaScript. En el proyecto permite aplicar los estilos definidos en `src/styles/index.css` (por ejemplo `panel`, `app-header` o `summary-card`) y también construir clases dinámicas, como en `TaskItem`, donde `task-item--${status}` cambia el estilo según la tarea esté pendiente o completada.

## 6. ¿Qué son las propiedades o props?

Las props son los datos que un componente padre le envía a un componente hijo, de forma parecida a los parámetros de una función. Permiten que un mismo componente muestre información distinta sin cambiar su código. Por ejemplo, `App` envía a `TaskSummary` los valores `total={3}`, `pending={2}` y `completed={1}`, y `TaskList` envía a cada `TaskItem` un `title` y un `status` diferentes. Las props son de solo lectura: el componente hijo las usa, pero no las modifica.

## 7. ¿Cómo ayuda TypeScript a validar las propiedades?

TypeScript permite describir con una interfaz qué props recibe un componente y de qué tipo es cada una, como `TaskSummaryProps` o `TaskItemProps`. Con esa definición el editor y el compilador detectan errores antes de ejecutar la aplicación: si falta una prop obligatoria, si se envía un texto donde se espera un número o si se escribe mal el nombre de una prop. Además, el tipo `TaskStatus = "pending" | "completed"` restringe el estado a esos dos valores, por lo que escribir `status="done"` produce un error. También mejora el autocompletado y sirve como documentación del componente.

## 8. ¿Cuál es la responsabilidad de App.tsx?

`App.tsx` es el componente raíz de la aplicación. Su responsabilidad es organizar la estructura general de la página: define el contenedor principal (`app-shell`), coloca el encabezado, el área principal y el pie de página, y compone dentro de `main` los componentes `TaskForm`, `TaskFilters`, `TaskSummary` y `TaskList` en el orden en que deben aparecer. También es quien envía los datos iniciales a `TaskSummary` mediante props. No contiene el detalle de cada sección; ese detalle queda dentro de cada componente.

## 9. ¿Por qué la interfaz se dividió en varios componentes?

Se dividió para que cada parte tenga una sola responsabilidad y el código sea más fácil de leer, mantener y ampliar. Si hay que cambiar el formulario, se trabaja solo en `TaskForm.tsx` sin tocar la lista ni los filtros. La división también permite reutilizar piezas, como `TaskItem`, que se usa tres veces con datos distintos, y prepara el proyecto para las siguientes actividades, donde cada componente recibirá su propio estado y comportamiento.

## 10. ¿Por qué los botones todavía están deshabilitados?

Porque en esta actividad solo se construyó la estructura visual de la interfaz. Todavía no existe estado ni manejo de eventos que permitan agregar, editar, eliminar o cambiar el estado de una tarea. Los botones tienen el atributo `disabled` para que el usuario no intente usar acciones que aún no hacen nada y para dejar claro que son funciones pendientes; el propio formulario indica que "se activará en una actividad posterior".

## 11. ¿Qué componente consideras más reutilizable y por qué?

`TaskItem` es el más reutilizable, porque no tiene datos fijos: recibe el `title` y el `status` mediante props y, a partir de ellos, genera el texto, la etiqueta de estado y las clases CSS correspondientes. Gracias a eso, `TaskList` lo usa tres veces para mostrar tareas diferentes y podría usarlo para cualquier cantidad de tareas, por ejemplo al recorrer un arreglo con `map` en una actividad posterior. `TaskSummary` también es reutilizable, ya que muestra cualquier conjunto de totales que reciba por props.

## 12. ¿Qué dificultad encontraste y cómo la resolviste?

Una dificultad fue adaptar el marcado HTML a la sintaxis TSX: al principio es fácil escribir `class` o `for` como en HTML, o dejar etiquetas como `<input>` sin cerrar, lo que provoca errores o advertencias. Se resolvió usando `className` y `htmlFor`, cerrando todas las etiquetas y revisando los mensajes de TypeScript y ESLint en el editor. Otra dificultad fue decidir qué datos debían pasar como props; se resolvió definiendo interfaces (`TaskItemProps` y `TaskSummaryProps`) para que TypeScript indicara cualquier prop faltante o con un tipo incorrecto.
