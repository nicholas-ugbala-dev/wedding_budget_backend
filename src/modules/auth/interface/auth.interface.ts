import { User, SafeUser } from "../../../config/database/models";
import { RegisterValidator, LoginValidator, OnboardingValidator } from "../validation/auth.validations";

export interface AuthTokenPayload {
    id: string;
}

export interface AuthResponse {
    user: SafeUser;
    token: string;
}

export interface ResetTokenRow {
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
    email: string;
    first_name: string;
}

export interface IAuthRepository {
    register(data: RegisterValidator, hashedPassword: string): Promise<SafeUser>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<SafeUser | null>;
    updateOnboarding(userId: string, data: OnboardingValidator): Promise<SafeUser>;
    createResetToken(userId: string): Promise<string>;
    findResetToken(token: string): Promise<ResetTokenRow | null>;
    deleteResetToken(token: string): Promise<void>;
    updatePassword(userId: string, hashedPassword: string): Promise<void>;
}

export interface IAuthService {
    register(data: RegisterValidator): Promise<AuthResponse>;
    login(data: LoginValidator): Promise<AuthResponse>;
    me(userId: string): Promise<SafeUser>;
    updateOnboarding(userId: string, data: OnboardingValidator): Promise<SafeUser>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
}