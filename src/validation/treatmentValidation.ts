const createTreatmentValidation = (details: { name: string; description: string; departmentId: string }) => {
  const { name, description, departmentId } = details;
  const errors: Record<string, string> = {};

  if (!name || String(name).trim() === "") {
    errors.name = "Name is required";
  }

  if (!description || String(description).trim() === "") {
    errors.description = "Description is required";
  }

  if (!departmentId || String(departmentId).trim() === "") {
    errors.departmentId = "Department id is required";
  }

  return {
    valid: Object.keys(errors).length < 1,
    errors
  };
};

export {
  createTreatmentValidation,
}