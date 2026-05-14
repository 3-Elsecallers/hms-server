const createWardValidation = (details: { name: string; floor: number }) => {
  const { name, floor } = details;
  const errors: Record<string, string> = {};

  if (!name || String(name).trim() === "") {
    errors.name = "Name is required";
  }

  if (!floor) {
    errors.floor = "Floor is required";
  }

  return {
    valid: Object.keys(errors).length < 1,
    errors
  };
};

export {
  createWardValidation,
}