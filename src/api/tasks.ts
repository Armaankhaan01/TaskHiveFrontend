import { Task } from "../types/user";
import api from "./axios";

export const fetchTasks = () => api.get<Task[]>("/task");

export const createTask = (data: Partial<Task>) => api.post<Task>("/task", data);

export const updateTask = (id: string, data: Partial<Task>) => api.put<Task>(`/task/${id}`, data);

export const deleteTask = (id: string) => api.delete(`/task/${id}`);

export const toggleTask = (id: string) => api.patch<Task>(`/task/${id}/toggle`);
