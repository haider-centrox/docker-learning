import { UserDocument } from "../../models/User"; // update your path

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument; // or any type you want
    }
  }
}
