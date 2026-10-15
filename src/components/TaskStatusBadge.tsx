import type { TaskStatus } from "../models/task.interface";
interface TaskStatusBadgeProps {
  status: TaskStatus;
}
const statusLabels: Record<TaskStatus, string> = {
  pending: "Pendiente",
  completed: "Completada",
};
export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {statusLabels[status]}
    </span>
  );
}
