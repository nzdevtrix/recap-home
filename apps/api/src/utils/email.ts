import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const otpStore = new Map<string, { otp: string; expires: Date }>();

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOtp(email: string, otp: string): void {
  otpStore.set(email, { otp, expires: new Date(Date.now() + 10 * 60 * 1000) });
}

export function verifyOtp(email: string, otp: string): boolean {
  const entry = otpStore.get(email);
  if (!entry) return false;
  if (new Date() > entry.expires) {
    otpStore.delete(email);
    return false;
  }
  return entry.otp === otp;
}

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER;
  if (hasSmtpConfig) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@recaphome.com',
      to: email,
      subject: 'Recap Home - Codice di Verifica',
      html: `<p>Il tuo codice di verifica è: <strong>${otp}</strong></p><p>Valido per 10 minuti.</p>`,
    });
  } else {
    console.log(`[OTP] Email: ${email}, Code: ${otp}`);
  }
}
