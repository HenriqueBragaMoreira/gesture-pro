import { useState } from "react";

export function usePagination() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) =>
    setPage(newPage);

  const handleChangeRowsPerPage = (
    event: number | React.ChangeEvent<HTMLInputElement>
  ) => {
    if (typeof event === "number") {
      setRowsPerPage(+event);
      setPage(0);
    } else {
      setRowsPerPage(+event.target.value);
      setPage(0);
    }
  };

  const resetPage = () => {
    setPage(0);
  };

  const firstItem = page * rowsPerPage;

  return {
    page,
    rowsPerPage,
    firstItem,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPage,
  };
}
