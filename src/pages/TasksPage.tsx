import { useState } from "react";
import { AsyncStatus } from "../components/AsyncStatus";
import { TaskFilters } from "../components/TaskFilters";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";
import { TaskPagination } from "../components/TaskPagination";
import { TaskSummary } from "../components/TaskSummary";
import { useAuth } from "../hooks/useAuth";
import { useTaskList } from "../hooks/useTaskList";
import type {
  SortOrder,
  TaskListQuery,
  TaskSortField,
} from "../models/api.types";
import type { Task } from "../models/task.interface";
import type { TaskFilter, TaskSort } from "../models/task-view.types";
import { getHttpErrorMessage } from "../services/http.service";
import {
  createTask as createTaskRequest,
  deleteTask as deleteTaskRequest,
  updateTask as updateTaskRequest,
} from "../services/task.api.service";

const PAGE_SIZE = 5;

function mapSort(sort: TaskSort): {
  sortBy: TaskSortField;
  order: SortOrder;
} {
  switch (sort) {
    case "updated-asc":
      return { sortBy: "updatedAt", order: "asc" };
    case "title-asc":
      return { sortBy: "title", order: "asc" };
    case "title-desc":
      return { sortBy: "title", order: "desc" };
    default:
      return { sortBy: "updatedAt", order: "desc" };
  }
}

export function TasksPage() {
  const { accessToken, user } = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [sort, setSort] = useState<TaskSort>("updated-desc");
  const [page, setPage] = useState(1);
  const [isMutating, setIsMutating] = useState(false);
  const [operationMessage, setOperationMessage] = useState("");
  const [operationFailed, setOperationFailed] = useState(false);

  const mappedSort = mapSort(sort);
  const canDelete = user?.role === "admin";
  const taskListQuery: TaskListQuery = {
    page,
    limit: PAGE_SIZE,
    search: query.trim() || undefined,
    status: filter === "all" ? undefined : filter,
    sortBy: mappedSort.sortBy,
    order: mappedSort.order,
  };

  const { tasks, meta, status, errorMessage, reload } = useTaskList(
    taskListQuery,
    accessToken,
  );

  function requireToken(): string | null {
    if (accessToken) {
      return accessToken;
    }

    setOperationFailed(true);
    setOperationMessage("La sesión no está disponible.");
    return null;
  }

  async function runMutation(
    operation: () => Promise<unknown>,
    successMessage: string,
  ): Promise<boolean> {
    setIsMutating(true);
    setOperationMessage("");
    setOperationFailed(false);

    try {
      await operation();
      setOperationMessage(successMessage);
      return true;
    } catch (error) {
      setOperationFailed(true);
      setOperationMessage(getHttpErrorMessage(error));
      return false;
    } finally {
      setIsMutating(false);
    }
  }

  function refreshAfterMutation(): void {
    if (page !== 1) {
      setPage(1);
      return;
    }

    reload();
  }

  async function handleAddTask(title: string): Promise<boolean> {
    const token = requireToken();
    if (!token) return false;

    const succeeded = await runMutation(
      () => createTaskRequest({ title }, token),
      "La tarea fue creada.",
    );

    if (succeeded) refreshAfterMutation();
    return succeeded;
  }

  async function handleToggleStatus(task: Task): Promise<boolean> {
    const token = requireToken();
    if (!token) return false;
    const nextStatus = task.status === "pending" ? "completed" : "pending";

    const succeeded = await runMutation(
      () => updateTaskRequest(task.id, { status: nextStatus }, token),
      "El estado fue actualizado.",
    );

    if (succeeded) reload();
    return succeeded;
  }

  async function handleEditTask(task: Task, title: string): Promise<boolean> {
    const token = requireToken();
    if (!token) return false;
    
    const succeeded = await runMutation(
      () => updateTaskRequest(task.id, { title }, token),
      "El título fue actualizado.",
    );
    
    if (succeeded) reload();
    return succeeded;
  }

  async function handleDeleteTask(task: Task): Promise<boolean> {
    const token = requireToken();
    if (!token) return false;
  
    if (!canDelete) {
      setOperationFailed(true);
      setOperationMessage("Solo el rol admin puede eliminar tareas.");
      return false;
    }
  
    const shouldDelete = window.confirm(`¿Eliminar la tarea "${task.title}"?`);
    
    if (!shouldDelete) return false;
    const succeeded = await runMutation(
      () => deleteTaskRequest(task.id, token),
      "La tarea fue eliminada.",
    );
    
    if (succeeded) {
      if (tasks.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        reload();
      }
    }
    
    return succeeded;
  }
  
  function handleQueryChange(value: string): void {
    setQuery(value);
    setPage(1);
  }
  
  function handleFilterChange(value: TaskFilter): void {
    setFilter(value);
    setPage(1);
  }
  
  function handleSortChange(value: TaskSort): void {
    setSort(value);
    setPage(1);
  }
  
  function handleClear(): void {
    setQuery("");
    setFilter("all");
    setSort("updated-desc");
    setPage(1);
    setOperationMessage("");
  }
  
  return (
    <div className="page-stack">
      <section className="page-introduction" aria-labelledby="tasks-page-title">
        <p className="section-heading__eyebrow">Gestión autenticada</p>
        <h2 id="tasks-page-title">Tareas</h2>
        <p>
          Sesión de {user?.name}. Los cambios se guardan mediante la API REST.
        </p>
        {!canDelete && (
          <p className="permission-note">
            Tu rol puede consultar, crear y actualizar. La eliminación requiere
            admin.
          </p>
        )}
      </section>
      <TaskForm isSubmitting={isMutating} onAddTask={handleAddTask} />
      {operationMessage && (
        <p
          className={
            operationFailed
              ? "operation-message operation-message--error"
              : "operation-message"
          }
          role={operationFailed ? "alert" : "status"}
        >
          {operationMessage}
        </p>
      )}
      <TaskFilters
        query={query}
        filter={filter}
        sortBy={sort}
        resultCount={meta.total}
        isLoading={status === "loading"}
        onQueryChange={handleQueryChange}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onClear={handleClear}
      />
      <AsyncStatus
        status={status}
        errorMessage={errorMessage}
        onRetry={reload}
      />
      {status !== "error" && (
        <>
          <TaskSummary tasks={tasks} total={meta.total} />
          <TaskList
            tasks={tasks}
            canDelete={canDelete}
            onToggleStatus={handleToggleStatus}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
          <TaskPagination
            meta={meta}
            disabled={status === "loading" || isMutating}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
