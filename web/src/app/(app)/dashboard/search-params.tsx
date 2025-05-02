import { createLoader, parseAsString } from "nuqs/server";

export const dashboardSearchParams = {
	category: parseAsString.withDefault(""),
};

export const loadSearchParams = createLoader(dashboardSearchParams);
