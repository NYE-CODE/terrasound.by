import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type Category } from "../lib/api";
import { reportLoadError } from "../lib/loadError";

const CategoriesContext = createContext<Category[]>([]);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(reportLoadError);
  }, []);

  return <CategoriesContext.Provider value={categories}>{children}</CategoriesContext.Provider>;
}

export function useCategories(): Category[] {
  return useContext(CategoriesContext);
}
