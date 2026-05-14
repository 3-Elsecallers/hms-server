import { Router } from "express";

import AuthController from "../controllers/auth.controller";
import { checkAuth, checkPasswordResetAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/sign-up", AuthController.signUp);

router.post("/sign-in", AuthController.signIn);

router.post("/token", AuthController.updateToken);

router.post("/email-verification-request", checkAuth, AuthController.requestEmailVerification);

router.post("/verify-email", checkAuth, AuthController.verifyEmail);

router.patch("/update-profile", checkAuth, AuthController.updateProfile);

router.post("/sign-out", AuthController.signOut);

router.get('/.well-known/jwks.json', AuthController.jwksEndpoint);

router.post("/password-reset-request", AuthController.sendPasswordResetLink);

router.post("/reset-password", checkPasswordResetAuth, AuthController.resetPassword);

export default router;
