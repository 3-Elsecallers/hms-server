import { IUserPayload } from "../custom";

declare global {
  namespace Express {
    export interface Request {
      user?: IUserPayload;
    }
  }
}