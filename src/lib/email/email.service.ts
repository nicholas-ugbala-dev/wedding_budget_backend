import { Resend } from 'resend';
import { passwordResetTemplate } from './templates';

const resend = new Resend(process.env.RESEND_API_KEY);
console.log('Resend API Key:', process.env.RESEND_API_KEY ? 'loaded' : 'missing');

export const sendPasswordResetEmail = async (
    email: string,
    firstName: string,
    resetToken: string
): Promise<void> => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const toEmail = process.env.NODE_ENV === 'development' ? 'kosinick01@gmail.com' : email;

    const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL as string,
        to: toEmail,
        subject: 'Reset your password - Kosi & Muna',
        html: passwordResetTemplate(firstName, resetUrl)
    });

    if (error) {
        console.error('Resend error:', error);
        throw new Error(error.message);
    }

    console.log('Email sent:', data);
}