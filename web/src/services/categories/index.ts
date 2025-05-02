import { api } from "@/lib/ky";
import { queryParamsBuilder } from "@/utils/query-params-builder";
import type {
  AddCategoryProps,
  AddCategoryResponse,
  GetCategoriesProps,
  GetCategoriesResponse,
  UpdateCategoryProps,
} from "./types";

export const categoriesService = {
  getCategories: async ({ skip, limit, name, signal }: GetCategoriesProps) => {
    const { params } = queryParamsBuilder([
      { param: "skip", value: skip?.toString() },
      { param: "limit", value: limit?.toString() },
      { param: "name", value: name },
    ]);

    const response = await api.get(`categories?${params}`, {
      signal,
    });

    return response.json<GetCategoriesResponse>();
  },
  addCategory: async ({ name }: AddCategoryProps) => {
    const response = await api.post("categories", {
      json: { name },
    });

    return response.json<AddCategoryResponse>();
  },
  updateCategory: async ({ id, name }: UpdateCategoryProps) => {
    const response = await api.patch(`categories/${id}`, {
      json: { name },
    });
    return response.json();
  },
};
