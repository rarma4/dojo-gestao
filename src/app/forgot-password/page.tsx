import { ForgotPasswordForm } from "./_components/forgot-password-form";
import Image from "next/image"
import LogoLotus from "../../../public/lotus-image.webp"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Image src={LogoLotus} width={150} height={150} alt="Logo Lotus" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-tight">Esqueci minha senha</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Informe seu email e enviaremos um link para redefinir sua senha
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
