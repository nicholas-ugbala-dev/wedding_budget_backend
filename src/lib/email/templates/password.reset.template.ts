export const passwordResetTemplate = (firstName: string, resetUrl: string): string => `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Hi ${firstName},</h2>
        <p>You requested a password reset for your wedding budget account.</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a 
            href="${resetUrl}"
            style="
                display: inline-block;
                background: #1a1a18;
                color: #f8f6f1;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 500;
                margin: 16px 0;
            "
        >
            Reset password
        </a>
        <p style="color: #888780; font-size: 13px;">
            If you did not request this, ignore this email. Your password will not change.
        </p>
        <p style="color: #888780; font-size: 13px;">
            Or copy this link: ${resetUrl}
        </p>
    </div>
`