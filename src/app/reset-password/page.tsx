import { Suspense } from "react";
import { ResetPasswordForm } from "./_components/reset-password-form";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image"
import LogoLotus from "../../../public/lotus-image.webp"

export default function ResetPasswordPage() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center p-4 md:h-screen">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
           <Image src={LogoLotus} width={150} height={150} alt="Logo Lotus" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-tight">Redefinir senha</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Digite sua nova senha abaixo
          </p>
        </div>
        <Suspense fallback={<Spinner />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
