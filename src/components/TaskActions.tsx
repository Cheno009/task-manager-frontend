interface TaskActionsProps {
  completedCount: number;
  onClearCompleted: () => void;
}

export function TaskActions({
  completedCount,
  onClearCompleted,
}: TaskActionsProps) {
  const hasCompleted = completedCount > 0;

  function handleClick() {
    const shouldClear = window.confirm(
      `¿Eliminar ${completedCount} tarea(s) completada(s)?`,
    );

    if (!shouldClear) {
      return;
    }

    onClearCompleted();
  }

  return (
    <section className="task-actions" aria-label="Acciones de tareas">
      <button
        type="button"
        className="button-danger"
        onClick={handleClick}
        disabled={!hasCompleted}
      >
        Eliminar completadas ({completedCount})
      </button>
    </section>
  );
}
