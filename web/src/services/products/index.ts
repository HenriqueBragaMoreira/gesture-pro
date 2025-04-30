import { api } from "@/lib/ky";
import { masks } from "@/utils/mask";
import { queryParamsBuilder } from "@/utils/query-params-builder";
import type {
  CreateProductProps,
  GetCategoriesProps,
  GetCategoriesResponse,
  GetProductsProps,
  GetProductsResponse,
  ImportProductsResponse,
  Products,
} from "./types";

export const productsService = {
  getProducts: async ({ skip, limit, signal, category }: GetProductsProps) => {
    const { params } = queryParamsBuilder([
      { param: "skip", value: skip.toString() },
      { param: "limit", value: limit.toString() },
      { param: "category", value: category },
    ]);

    const response = await api.get(`products?${params}`, {
      signal,
    });

    return response.json<GetProductsResponse>();
  },
  getCategories: async ({ signal }: GetCategoriesProps) => {
    const response = await api.get("categories", { signal });

    return response.json<GetCategoriesResponse>();
  },
  importProducts: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("products/upload-csv", { body: formData });

    return response.json<ImportProductsResponse>();
  },
  createProduct: async (product: CreateProductProps) => {
    const response = await api.post("products", {
      json: {
        name: product.name,
        description: product.description,
        price: Number.parseFloat(masks.removeMask(product.price)).toFixed(2),
        category_id: Number(product.category),
        brand: product.brand,
      },
    });

    return response.json<Products>();
  },
};
