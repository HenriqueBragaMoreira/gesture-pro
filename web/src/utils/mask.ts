export const masks = {
  price(value: string) {
    if (!value || typeof value !== "string") return "";

    const cleanValue = value?.replace(/[^\d]/g, "");
    if (cleanValue === "") {
      return "";
    }
    const number = Number.parseFloat(cleanValue) / 100;

    const formattedValue = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(number);

    return formattedValue;
  },

  dateToString: (date: Date | null) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  },

  removeMask: (value: string) => {
    // Remove currency symbols, spaces, and anything not a digit or a dot.
    const cleanValue = value.replace(/[^\d.]/g, "");
    // No need to replace comma with dot anymore if the input is already using dot.
    return cleanValue;
  },
};
