# Administrador de tareas - Frontend

Aplicación desarrollada durante el elemento de competencia 2
de Diseño Frontend con Frameworks.

## Tecnologías

- React
- TypeScript
- Vite
- PNPM
- CSS

## Alcance actual

La versión actual contiene la estructura visual del Administrador
de tareas y tres tareas de demostración. Los formularios, filtros
y acciones todavía no tienen comportamiento.

## Instalación

```bash
pnpm install
```

## Ejecución

```bash
pnpm dev
```

## Compilación

```bash
pnpm build
```

## Componentes principales

- AppHeader
- TaskForm
- TaskFilters
- TaskSummary
- TaskList
- TaskItem

# Administrador de tareas - Frontend

Aplicación desarrollada con React, TypeScript, Vite y PNPM
para administrar tareas.

## Alcance actual

La aplicación permite visualizar una colección local de tareas
mediante componentes React.
Actualmente incluye:

- Modelo de tarea con TypeScript.
- Cinco tareas locales.
- Renderizado mediante map.
- Uso de claves estables.
- Estados pendiente y completada.
- Resumen calculado.
- Mensaje para una colección vacía.
- Diseño adaptable.
  Los formularios, eventos y operaciones CRUD se implementarán
  en actividades posteriores.

## Tecnologías

- React
- TypeScript
- Vite
- PNPM
- CSS
- Git y GitHub

## Instalación

pnpm install

## Ejecución

pnpm dev

## Validación

pnpm lint
pnpm build

## Estructura principal

- components: componentes visuales.
- data: colección local de tareas.
- models: tipos e interfaces.
- styles: estilos globales.
- docs: preguntas y documentación.

## Modelo Task

Cada tarea contiene id, title, status, createdAt y updatedAt.

# Administrador de tareas - Frontend

Aplicación desarrollada con React, TypeScript, Vite y PNPM.

## Alcance actual

La aplicación administra una colección local de tareas mediante
estado de React. Actualmente permite:

- Registrar tareas.
- Consultar la colección.
- Completar y reabrir tareas.
- Editar títulos.
- Cancelar una edición.
- Eliminar con confirmación.
- Calcular el resumen automáticamente.
- Mostrar una colección vacía.
  Los cambios permanecen en memoria y se reinician al recargar.

## Operaciones CRUD

- Create: registro mediante el formulario.
- Read: renderizado de la colección.
- Update: cambio de estado y edición.
- Delete: eliminación confirmada.

## Validación

pnpm lint
pnpm build
