import crypto from 'crypto';
import AuthQueries from '../query/auth.queries';
import { User, SafeUser } from '../../../config/database/models';
import { RegisterValidator, OnboardingValidator, UpdateProfileValidator } from '../validation/auth.validations';
import type { PoolClient } from 'pg';
import { IAuthRepository, ResetTokenRow } from '../interface/auth.interface';
import { dbQuery } from '../../../config/database/helper/query.helpers';

const {
    register,
    findByEmail,
    findById,
    updateOnboarding,
    updateProfile,
    insertBaseWallet,
    updateBaseWallet,
    bulkInsertEvents,
    bulkInsertCurrencies,
    createResetToken,
    findResetToken,
    deleteResetToken,
    updatePassword,
} = AuthQueries;

export class AuthRepository implements IAuthRepository {
    async register(data: RegisterValidator, hashedPassword: string): Promise<SafeUser> {
        const { first_name, last_name, email, account_type } = data;

        return dbQuery.transaction(async (txClient) => {
            const result: SafeUser = await dbQuery.one(
                register,
                [first_name, last_name, email, hashedPassword, account_type],
                txClient,
            );
            await dbQuery.manyOrNone(insertBaseWallet, [result.id, 'NGN'], txClient);
            return result;
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        const result: User | null = await dbQuery.oneOrNone(findByEmail, [email]);
        return result;
    }

    async findById(id: string): Promise<SafeUser | null> {
        const result: SafeUser | null = await dbQuery.oneOrNone(findById, [id]);
        return result;
    }

    async updateOnboarding(userId: string, data: OnboardingValidator): Promise<SafeUser> {
        return dbQuery.transaction(async (txClient) => {
            const result: SafeUser = await dbQuery.one(updateOnboarding, [data.base_currency, userId], txClient);
            await dbQuery.manyOrNone(updateBaseWallet, [userId, data.base_currency], txClient);
            return result;
        });
    }

    async saveOnboardingEvents(userId: string, events: string[]): Promise<void> {
        await dbQuery.manyOrNone(bulkInsertEvents(events.length), [userId, ...events]);
    }

    async saveOnboardingCurrencies(userId: string, currencies: string[]): Promise<void> {
        if (currencies.length === 0) return;
        await dbQuery.manyOrNone(bulkInsertCurrencies(currencies.length), [
            userId,
            ...currencies.map((c) => c.toUpperCase()),
        ]);
    }

    async createResetToken(userId: string): Promise<string> {
        const token = crypto.randomBytes(32).toString('hex');
        await dbQuery.one(createResetToken, [userId, token]);

        return token;
    }

    async findResetToken(token: string): Promise<ResetTokenRow | null> {
        return dbQuery.oneOrNone<ResetTokenRow>(findResetToken, [token]);
    }

    async deleteResetToken(token: string, client?: PoolClient): Promise<void> {
        await dbQuery.one(deleteResetToken, [token], client);
    }

    async updatePassword(userId: string, hashedPassword: string, client?: PoolClient): Promise<void> {
        await dbQuery.one(updatePassword, [hashedPassword, userId], client);
    }

    async updateProfile(userId: string, data: UpdateProfileValidator): Promise<SafeUser> {
        return dbQuery.one<SafeUser>(updateProfile, [data.first_name ?? null, data.last_name ?? null, userId]);
    }
}

const authRepository = new AuthRepository();

export default authRepository;
