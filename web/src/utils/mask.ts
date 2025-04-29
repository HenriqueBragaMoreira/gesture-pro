export const masks = {
	price(value: string) {
		if (!value || typeof value !== "string") return "";

		let cleanValue = value?.replace(/[^\d]/g, "");
		cleanValue = cleanValue?.replace(/^0+/, "");
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

	removeMask: (value: string) => {
		// Remove currency symbols, spaces, and anything not a digit or a dot.
		const cleanValue = value.replace(/[^\d.]/g, "");
		// No need to replace comma with dot anymore if the input is already using dot.
		return cleanValue;
	},
};
