import { createContext, useEffect, useState } from "react";
import type { User } from "../types/user";
import { defaultUser } from "../constants/defaultUser";
import { getProfile } from "../api/auth";
import { fetchTasks } from "../api/tasks";
import { fetchCategories } from "../api/categories";

interface UserContextProps {
  user: User;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
}

export const UserContext = createContext<UserContextProps>({
  user: defaultUser,
  isAuthenticated: false,
  loading: true,
  setUser: () => {},
  setIsAuthenticated: () => {},
  logout: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(defaultUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    const loadUserAndTasks = async () => {
      try {
        const profileRes = await getProfile();
        const tasksRes = await fetchTasks();
        const categoriesRes = await fetchCategories();
        setUser({
          ...profileRes.data,
          tasks: tasksRes.data ?? [],
          categories: categoriesRes.data ?? [],
        });

        setIsAuthenticated(true);
      } catch (err) {
        console.log(err);

        localStorage.removeItem("token");
        setUser(defaultUser);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndTasks();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(defaultUser);
    setIsAuthenticated(false);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        loading,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
