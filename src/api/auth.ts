import { User } from "../types/user";
import api from "./axios";

export const login = (data: { email: string; password: string }) => api.post("/auth/login", data);

export const register = (data: { name: string; email: string; password: string }) =>
  api.post("/auth/register", data);

export const getProfile = () => api.get<User>("/auth/me");

export const updateProfile = (data: Partial<User>) => api.put<User>("/auth/me", data);
