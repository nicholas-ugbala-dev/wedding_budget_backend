import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '../../modules/auth/interface/auth.interface';

export const generateToken = (id: string): string => {
    const payload: AuthTokenPayload = { id };
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: '30d',
    });
};

export const verifyToken = (token: string): AuthTokenPayload => {
    return jwt.verify(token, process.env.JWT_SECRET as string) as AuthTokenPayload;
}