const createDoctorValidation = (details: {
  staffId: string;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience?: number;
  consultationFee?: string;
}) => {
  const { staffId, specialization, licenseNumber, yearsOfExperience, consultationFee } = details;
  const errors: Record<string, string> = {};

  if (!staffId || String(staffId).trim() === "") {
    errors.staffId = "Staff id is required";
  }

  if (!specialization || String(specialization).trim() === "") {
    errors.specialization = "Specialization is required";
  }

  if (!licenseNumber || String(licenseNumber).trim() === "") {
    errors.licenseNumber = "License number is required";
  }

  if (yearsOfExperience && !(typeof yearsOfExperience == "number")) {
    errors.yearsOfExperience = "Years of experience should be a valid number";
  }

  if (consultationFee && !(typeof consultationFee == "number")) {
    errors.consultationFee = "Consultation fee should be a valid number";
  }

  return {
    valid: Object.keys(errors).length < 1,
    errors
  };
};

export {
  createDoctorValidation
}