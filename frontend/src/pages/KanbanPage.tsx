import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { TaskStatus } from '../types';
import { Task } from '../services/taskApi';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { getApiErrorMessage } from '../utils/errors';

const KANBAN_COLUMNS: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.COMPLETED,
];

const columnStyles: Record<TaskStatus, string> = {
  TODO: 'bg-slate-100',
  IN_PROGRESS: 'bg-blue-100',
  IN_REVIEW: 'bg-yellow-100',
  COMPLETED: 'bg-green-100',
  BLOCKED: 'bg-red-100',
  CANCELLED: 'bg-slate-200',
};

interface CardProps {
  task: Task;
}

function TaskCard({ task }: CardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { status: task.status },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded border border-slate-200 bg-white p-3 shadow-sm ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      <Link
        to={`/tasks/${task.id}`}
        className="line-clamp-2 text-sm font-medium hover:text-brand-600"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {task.title}
      </Link>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>{task.project.name}</span>
        <span className={task.priority === 'URGENT' ? 'font-semibold text-red-600' : ''}>
          {task.priority}
        </span>
      </div>
    </div>
  );
}

interface ColumnProps {
  status: TaskStatus;
  tasks: Task[];
}

function KanbanColumn({ status, tasks }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className={`mb-2 rounded-t px-3 py-2 text-sm font-semibold ${columnStyles[status]}`}>
        {status.replace('_', ' ')} ({tasks.length})
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 rounded-b border-2 border-dashed p-2 transition ${
          isOver ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-slate-50'
        }`}
      >
        {tasks.length === 0 ? (
          <p className="p-3 text-center text-xs text-slate-400">Drop tasks here</p>
        ) : (
          tasks.map((t) => <TaskCard key={t.id} task={t} />)
        )}
      </div>
    </div>
  );
}

export function KanbanPage() {
  const { tasks, fetchAll, updateStatus } = useTaskStore();
  const { projects, fetchAll: fetchProjects } = useProjectStore();
  const [projectFilter, setProjectFilter] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    void fetchAll();
    void fetchProjects();
  }, [fetchAll, fetchProjects]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const visible = useMemo(() => {
    return projectFilter
      ? tasks.filter((t) => t.projectId === projectFilter)
      : tasks;
  }, [tasks, projectFilter]);

  const grouped: Record<TaskStatus, Task[]> = useMemo(() => {
    const result = KANBAN_COLUMNS.reduce(
      (acc, col) => {
        acc[col] = [];
        return acc;
      },
      {} as Record<TaskStatus, Task[]>,
    );
    for (const t of visible) {
      if (KANBAN_COLUMNS.includes(t.status)) {
        result[t.status].push(t);
      }
    }
    return result;
  }, [visible]);

  const onDragStart = (e: DragStartEvent) => {
    const task = visible.find((t) => t.id === e.active.id);
    if (task) setActiveTask(task);
  };

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;
    const taskId = active.id as string;
    const targetStatus = over.data.current?.status as TaskStatus | undefined;
    if (!targetStatus) return;
    const task = visible.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) return;

    try {
      await updateStatus(taskId, targetStatus);
      toast.success(`Moved to ${targetStatus.replace('_', ' ')}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to move task'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <select
          className="input max-w-xs"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn key={col} status={col} tasks={grouped[col]} />
          ))}
        </div>
        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 rounded border border-slate-200 bg-white p-3 shadow-lg">
              <div className="text-sm font-medium">{activeTask.title}</div>
              <div className="mt-2 text-xs text-slate-500">
                {activeTask.project.name} · {activeTask.priority}
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
