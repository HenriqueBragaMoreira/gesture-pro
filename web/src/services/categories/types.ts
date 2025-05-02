export type GetCategoriesProps = {
	skip?: number;
	limit?: number;
	name?: string;
	signal?: AbortSignal;
};

export type GetCategoriesResponse = {
	categories: Category[];
	total: number;
};

export type Category = {
	name: string;
	id: number;
	created_at?: string;
	updated_at?: string;
};

export type AddCategoryProps = {
	name: string;
};

export type AddCategoryResponse = Category;

export type UpdateCategoryProps = {
	id: string;
	name: string;
};
