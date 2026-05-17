const assignRoleValidation = (details: { userId: string; role: UserRole }) => {
  const { userId, role } = details;
  const errors: Record<string, string> = {};

  if (!userId || String(userId).trim() === "") {
    errors.userId = "User id is required";
  }

  if (!role || String(role).trim() === "") {
    errors.role = "Role is required";
  } else {
    if (!Object.values(UserRole).includes(role)) {
      errors.role = "Invlaid role";
    }
  }

  return {
    valid: Object.keys(errors).length < 1,
    errors
  };
};

enum UserRole {
  SUPER_ADMIN="SUPER_ADMIN",
  ADMIN="ADMIN",
  DOCTOR="DOCTOR",
  NURSE="NURSE",
  PATIENT="PATIENT",
  RECEPTIONIST="RECEPTIONIST",
  LAB_TECHNICIAN="LAB_TECHNICIAN",
  PHARMACIST="PHARMACIST",
  ACCOUNTANT="ACCOUNTANT",
  GUEST="GUEST",
}

export {
  assignRoleValidation,
}