
export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
