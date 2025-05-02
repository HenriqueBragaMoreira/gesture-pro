export type GetProductsProps = {
  skip: number;
  limit: number;
  signal?: AbortSignal;
  category?: string;
  name?: string;
};

export type GetProductsResponse = {
  products: Products[];
  totalProducts: number;
};

export type Products = {
  name: string;
  description: string;
  price: number;
  category: {
    name: string;
    id: number;
  };
  brand: string;
  id: number;
};

export type ImportProductsResponse = {
  message: string;
  db_errors: { index: number; error: string }[];
  parse_errors: string[];
};

export type CreateProductProps = {
  name: string;
  description: string;
  price: string;
  category: string;
  brand: string;
};
