import { betterAuth } from "better-auth";
import { prisma } from "./prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        sendResetPassword: async ({ user, url }) => {
            // Em desenvolvimento, mostra no console
            console.log("===================================");
            console.log("📧 Email de reset de senha");
            console.log("Para:", user.email);
            console.log("Link:", url);
            console.log("===================================");
            
            // Se RESEND_API_KEY está configurada, envia o email
            if (process.env.RESEND_API_KEY) {
                try {
                    await resend.emails.send({
                        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
                        to: user.email,
                        subject: "Redefinir sua senha",
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #333;">Redefinir senha</h2>
                                <p>Você solicitou a redefinição de senha.</p>
                                <p>Clique no botão abaixo para definir uma nova senha:</p>
                                <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #9146FF; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                                    Redefinir minha senha
                                </a>
                                <p style="color: #666; font-size: 14px;">Este link expira em 1 hora.</p>
                                <p style="color: #666; font-size: 14px;">Se você não solicitou esta alteração, ignore este email.</p>
                            </div>
                        `,
                    });
                    console.log("✅ Email enviado com sucesso via Resend");
                } catch (error) {
                    console.error("❌ Erro ao enviar email via Resend:", error);
                }
            } else {
                console.log("⚠️  RESEND_API_KEY não configurada - usando apenas console.log");
            }
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.AUTH_GOOGLE_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
        },
    },
    secret: process.env.BETTER_AUTH_SECRET as string,
    baseURL: process.env.BETTER_AUTH_URL as string,
    trustedOrigins: [
        process.env.BETTER_AUTH_URL as string,
        process.env.NEXT_PUBLIC_URL as string,
    ].filter(Boolean),
}); 