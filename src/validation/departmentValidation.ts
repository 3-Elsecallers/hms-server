const createDepartmentValidation = (details: { name: string }) => {
  const { name } = details;
  const errors: Record<string, string> = {};

  if (!name || String(name).trim() === "") {
    errors.name = "Name is required";
  }

  return {
    valid: Object.keys(errors).length < 1,
    errors
  };
};

const departmentStaffValidation = (details: { staffType: StaffType; staffId: string }) => {
  const { staffType, staffId } = details;
  const errors: Record<string, string> = {};

  if (!staffType || String(staffType).trim() === "") {
    errors.staffType = "Staff type is required";
  } else {
    if (!Object.values(StaffType).includes(staffType)) {
      errors.staffType = "Invalid staff type";
    }
  }

  if (!staffId || String(staffId).trim() === "") {
    errors.staffId = "Staff id is required";
  }

  return {
    valid: Object.keys(errors).length < 1,
    errors
  };
};

enum StaffType {
  doctors = "doctors",
  nurses = "nurses",
  supportStaff = "supportStaff",
  specialists = "specialists"
}

export {
  createDepartmentValidation,
  departmentStaffValidation,
  StaffType
}