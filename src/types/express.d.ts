import { AuthTokenPayload } from "../modules/auth/interface/auth.interface";

declare global {
    namespace Express {
        interface Request {
            user?: AuthTokenPayload
        }
    }
}