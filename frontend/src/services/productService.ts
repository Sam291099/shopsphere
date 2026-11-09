
import api from "./api";
import type { Product } from "../types/product";

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>("/products");
    return response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },
};
