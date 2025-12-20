import { CreateTaskInput, Task } from "../types/user";
import api from "./axios";

export const fetchTasks = () => api.get<Task[]>("/task");

export const createTask = (data: CreateTaskInput) => api.post<Task>("/task", data);

export const updateTask = async (id: string, payload: Partial<Task>): Promise<Task> => {
  const res = await api.patch(`/task/${id}`, payload);
  return res.data;
};

export const deleteTask = (id: string) => api.delete(`/task/${id}`);

export const toggleTask = async (id: string, payload: Partial<Task>): Promise<Task> => {
  const res = await api.patch(`/task/${id}/toggle`, payload);
  return res.data;
};

export const deleteTasksBulk = async (ids: string[]) => {
  const res = await api.post("/task/bulk", { ids });
  return res.data as { deletedIds: string[] };
};
