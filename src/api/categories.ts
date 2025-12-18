import { Category, CreateCategoryInput, CreateCategoryResponse, UUID } from "../types/user";
import api from "./axios";

export const fetchCategories = () => api.get<Category[]>("/category");

export const fetchCategory = (id: string) => api.get<Category>(`/category/${id}`);

export const createCategory = (data: CreateCategoryInput) =>
  api.post<CreateCategoryResponse>("/category", data);

export const updateCategoryOnServer = (id: UUID, data: Partial<Category>) =>
  api.put<{ message: string }>(`/category/${id}`, data);

export const deleteCategory = (id: string) => api.delete(`/category/${id}`);
