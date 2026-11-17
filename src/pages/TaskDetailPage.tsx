import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import type { Task } from "../models/task.interface";
import {
  getHttpErrorMessage,
  isAbortError,
  isHttpError,
} from "../services/http.service";
import { deleteTask, getTaskById } from "../services/task.api.service";
import { formatTaskDate } from "../utils/date";
import { NotFoundPage } from "./NotFoundPage";
type DetailStatus = "loading" | "success" | "not-found" | "error";
interface DetailResult {
  requestKey: string;
  status: Exclude<DetailStatus, "loading">;
  task: Task | null;
  errorMessage: string;
}
export function TaskDetailPage() {
  const { taskId } = useParams<{
    taskId: string;
  }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<DetailResult | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const requestKey = `${taskId ?? ""}:${reloadKey}`;
  // El estado se deriva en el render: si el resultado guardado no pertenece
  // a la petición actual, la tarea se está consultando.
  const isCurrent = result?.requestKey === requestKey;
  const status: DetailStatus = !taskId
    ? "not-found"
    : isCurrent
      ? result.status
      : "loading";
  const task = isCurrent ? result.task : null;
  const errorMessage = isCurrent ? result.errorMessage : "";
  useEffect(() => {
    if (!taskId) {
      return;
    }
    const controller = new AbortController();
    const key = `${taskId}:${reloadKey}`;
    getTaskById(taskId, controller.signal)
      .then((response) => {
        setResult({
          requestKey: key,
          status: "success",
          task: response.data,
          errorMessage: "",
        });
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) {
          return;
        }
        if (isHttpError(error) && error.status === 404) {
          setResult({
            requestKey: key,
            status: "not-found",
            task: null,
            errorMessage: "",
          });
          return;
        }
        setResult({
          requestKey: key,
          status: "error",
          task: null,
          errorMessage: getHttpErrorMessage(error),
        });
      });
    return () => controller.abort();
  }, [taskId, reloadKey]);
  async function handleDelete(): Promise<void> {
    if (!task) {
      return;
    }
    const shouldDelete = window.confirm(`¿Eliminar la tarea "${task.title}"?`);
    if (!shouldDelete) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      navigate("/tasks", { replace: true });
    } catch (error) {
      setResult({
        requestKey,
        status: "error",
        task,
        errorMessage: getHttpErrorMessage(error),
      });
      setIsDeleting(false);
    }
  }
  if (status === "loading") {
    return <p role="status">Consultando tarea...</p>;
  }
  if (status === "not-found") {
    return (
      <NotFoundPage
        title="Tarea no encontrada"
        message="La tarea no existe o fue eliminada."
      />
    );
  }
  if (status === "error" || !task) {
    return (
      <section className="panel" role="alert">
        <h2>No fue posible consultar la tarea</h2>
        <p>{errorMessage}</p>
        <button
          type="button"
          onClick={() => setReloadKey((current) => current + 1)}
        >
          Reintentar
        </button>
      </section>
    );
  }
  return (
    <article className="panel task-detail" aria-labelledby="task-detail-title">
      <p className="section-heading__eyebrow">Detalle remoto</p>
      <h2 id="task-detail-title">{task.title}</h2>
      <dl className="task-detail__grid">
        <div>
          <dt>Identificador</dt>
          <dd>{task.id}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{task.status === "completed" ? "Completada" : "Pendiente"}</dd>
        </div>
        <div>
          <dt>Fecha de creación</dt>
          <dd>
            <time dateTime={task.createdAt}>
              {formatTaskDate(task.createdAt)}
            </time>
          </dd>
        </div>
        <div>
          <dt>Última actualización</dt>
          <dd>
            <time dateTime={task.updatedAt}>
              {formatTaskDate(task.updatedAt)}
            </time>
          </dd>
        </div>
      </dl>
      <div className="task-detail__actions">
        <Link className="button-link button-link--secondary" to="/tasks">
          Volver a tareas
        </Link>
        <button
          type="button"
          className="button-danger"
          disabled={isDeleting}
          onClick={() => void handleDelete()}
        >
          {isDeleting ? "Eliminando..." : "Eliminar tarea"}
        </button>
      </div>
    </article>
  );
}
