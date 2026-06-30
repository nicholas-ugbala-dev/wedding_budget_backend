import crypto from 'crypto';
import AuthQueries from "../query/auth.queries";
import { User, SafeUser } from "../../../config/database/models";
import { RegisterValidator, OnboardingValidator } from "../validation/auth.validations";
import { IAuthRepository, ResetTokenRow } from "../interface/auth.interface";
import { dbQuery } from "../../../config/database/helper/query.helpers";

const {
    register,
    findByEmail,
    findById,
    updateOnboarding,
    bulkInsertCeremonies,
    bulkInsertCurrencies,
    createResetToken,
    findResetToken,
    deleteResetToken,
    updatePassword,
} = AuthQueries;

export class AuthRepository implements IAuthRepository {
    async register(data: RegisterValidator, hashedPassword: string): Promise<SafeUser> {
        const { first_name, last_name, email, account_type } = data;

        const result: SafeUser = await dbQuery.one(register, [
            first_name,
            last_name,
            email,
            hashedPassword,
            account_type,
        ]);

        return result;
    };

    async findByEmail(email: string): Promise<User | null> {
        const result: User | null = await dbQuery.oneOrNone(findByEmail, [email]);
        return result;
    }

    async findById(id: string): Promise<SafeUser | null> {
        const result: SafeUser | null = await dbQuery.oneOrNone(findById, [id]);
        return result;
    }

    async updateOnboarding(userId: string, data: OnboardingValidator): Promise<SafeUser> {
        const { base_currency, event_name, event_date, wedding_location } = data;
        const result: SafeUser = await dbQuery.one(updateOnboarding, [
            base_currency,
            event_name,
            event_date,
            wedding_location,
            userId,
        ]);

        return result;
    }

    async saveOnboardingCeremonies(userId: string, ceremonies: string[]): Promise<void> {
        await dbQuery.manyOrNone(bulkInsertCeremonies(ceremonies.length), [
            userId,
            ...ceremonies,
        ]);
    }

    async saveOnboardingCurrencies(userId: string, currencies: string[]): Promise<void> {
        if (currencies.length === 0) return;
        await dbQuery.manyOrNone(bulkInsertCurrencies(currencies.length), [
            userId,
            ...currencies.map(c => c.toUpperCase()),
        ]);
    }

    async createResetToken(userId: string, ): Promise<string> {
        const token = crypto.randomBytes(32).toString('hex');
        await dbQuery.one(createResetToken, [userId, token]);

        return token;
    }

    async findResetToken(token: string): Promise<ResetTokenRow | null> {
        return dbQuery.oneOrNone<ResetTokenRow>(findResetToken, [token]);
    }

    async deleteResetToken(token: string): Promise<void> {
        await dbQuery.one(deleteResetToken, [token]);
    }

    async updatePassword(userId: string, hashedPassword: string): Promise<void> {
        await dbQuery.one(updatePassword, [hashedPassword, userId]);
    }
}

const authRepository = new AuthRepository();

export default authRepository;