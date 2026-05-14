import { ISignUpDetails, ISignInDetails, IUpdateProfileDetails } from "../types/custom";

const signUpValidation = (details: ISignUpDetails) => {
  const { firstName, lastName, email, phoneNumber, password } = details;
  const errors: Record<string, string> = {};

  if (!firstName || firstName.trim() === "") {
    errors.firstName = "First name is required";
  }

  if (!lastName || lastName.trim() === "") {
    errors.lastName = "Last name is required";
  }

  if (!email || email.trim() === "") {
    errors.email = "Email is required";
  } else {
    const emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email.match(emailRegex)) {
      errors.email = "Email must be a valid email address";
    }
  }

  if (!phoneNumber || phoneNumber.trim() === "") {
    errors.phoneNumber = "Phone number is required";
  } else {
    if (phoneNumber.length < 10) {
      errors.phoneNumber = "Phone number should be a minimum of 10 digits";
    }
  }

  if (!password || password.trim() === "") {
    errors.password = "Password is required";
  } else {
    if (password.length < 8) {
      errors.password = "Password should be a minimum of 8 digits";
    }
  }

  return {
    valid: Object.keys(errors).length < 1,
    errors,
  };
};

const signInValidation = (details: ISignInDetails) => {
  const { email, password } = details;
  const errors: Record<string, string> = {};

  if (!email || email.trim() === "") {
    errors.email = "Email is required";
  }

  if (!password || password.trim() === "") {
    errors.password = "Password is required";
  }

  return {
    valid: Object.keys(errors).length < 1,
    errors,
  };
};

const updateProfileValidation = (details: IUpdateProfileDetails) => {
  const { firstName, lastName } = details;
  const errors: Record<string, string> = {};

  if (firstName && firstName.trim() === "") {
    errors.firstName = "First name cannot be empty";
  }

  if (lastName && lastName.trim() === "") {
    errors.lastName = "Last name cannot be empty";
  }

  return {
    valid: Object.keys(errors).length < 1,
    errors,
  };
};

export { signUpValidation, signInValidation, updateProfileValidation };
