import bcrypt from "bcryptjs";
import { ApiError } from "../../utils/error";
import {
    RegisterValidator,
    LoginValidator,
    OnboardingValidator,
    OnboardingCeremoniesValidator,
    OnboardingCurrenciesValidator,
} from "./validation/auth.validations";
import { IAuthService, IAuthRepository, AuthResponse } from "./interface/auth.interface";
import authRepository from "./repository/auth.repository";
import { generateToken } from "../../utils/helpers/token.helper";
import { SafeUser } from "../../config/database/models";
import { sendPasswordResetEmail } from "../../lib/email/email.service";


export class AuthService implements IAuthService {
    constructor(private readonly authRepository: IAuthRepository) {}

    async register(data: RegisterValidator): Promise<AuthResponse> {
        const exisiting = await this.authRepository.findByEmail(data.email);
        if (exisiting) {
            throw new ApiError(409, "An Account with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);

        const user = await this.authRepository.register(data, hashedPassword);

        const token = generateToken(user.id);

        return { user, token };
    }

    async login(data: LoginValidator): Promise<AuthResponse> {
        const user = await this.authRepository.findByEmail(data.email);
        if (!user) {
            throw new ApiError(401, "Invalid email or password");
        }

        const validPassword = await bcrypt.compare(data.password, user.password);
        if (!validPassword) {
            throw new ApiError(401, "Invalid email or password");
        }

        const { password: _, ...safeUser } = user;
        const token = generateToken(user.id);

        return {user: safeUser, token};

    }

    async me(userId: string): Promise<SafeUser> {
        const user = await this.authRepository.findById(userId);
        if (!user) {
            throw new ApiError(401, "User not found");
        }

        return user;
    }

    async updateOnboarding(userId: string, data: OnboardingValidator): Promise<SafeUser> {
        const user = await this.authRepository.findById(userId);
        if (!user) {
            throw new ApiError(401, "User not found");
        }
        return this.authRepository.updateOnboarding(userId, data);
    }

    async saveOnboardingCeremonies(userId: string, data: OnboardingCeremoniesValidator): Promise<void> {
        await this.authRepository.saveOnboardingCeremonies(userId, data.ceremonies);
    }

    async saveOnboardingCurrencies(userId: string, data: OnboardingCurrenciesValidator): Promise<void> {
        await this.authRepository.saveOnboardingCurrencies(userId, data.currencies);
    }

    async forgotPassword(email: string): Promise<void> {
        const user = await this.authRepository.findByEmail(email);

        if (!user) return;

        const token = await this.authRepository.createResetToken(user.id);

        await sendPasswordResetEmail(user.email, user.first_name, token);
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const resetToken = await this.authRepository.findResetToken(token);

        if(!resetToken) {
            throw new ApiError(400, "Invalid or expired reset token");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await this.authRepository.updatePassword(resetToken.user_id, hashedPassword);
        await this.authRepository.deleteResetToken(token);
    }
}

const authService = new AuthService(authRepository);
export default authService;