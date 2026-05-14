const createBedValidation = (details: { wardId: string; bedNumber: number, status?: "EMPTY" | "IN_USE" }) => {
  const { wardId, bedNumber, status } = details;
  const errors: Record<string, string> = {};

  if (!wardId || String(wardId).trim() === "") {
    errors.wardId = "Ward id is required";
  }

  if (!bedNumber) {
    errors.bedNumber = "Bed number is required";
  }

  if (status && !["EMPTY", "IN_USE"].includes(String(status).trim())) {
    errors.status = "Invalid status";
  }

  return {
    valid: Object.keys(errors).length < 1,
    errors
  };
};

export {
  createBedValidation,
}