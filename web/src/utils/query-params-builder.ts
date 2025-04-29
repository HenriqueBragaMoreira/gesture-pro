type QueryParamsBuilderProps = {
  param: string;
  value?: string;
};

export const queryParamsBuilder = (data: QueryParamsBuilderProps[]) => {
  const params = data
    ?.filter((item) => !!item.value)
    ?.map((item) =>
      item.param.concat(
        "=",
        typeof item.value === "string"
          ? encodeURIComponent(item.value ?? "")?.trim()
          : (item.value ?? "")
      )
    )
    ?.join("&");

  return { params };
};
