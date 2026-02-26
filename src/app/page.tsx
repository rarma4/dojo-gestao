import Link from "next/link"
import { LoginForm } from "./_components/login-form"
import Image from "next/image"
import LogoLotus from "../../public/lotus-image.webp"

export default function Home() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center p-4 md:h-screen">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
        <Image src={LogoLotus} width={150} height={150} alt="Logo Lotus" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">Entre com suas credenciais para acessar sua conta</p>
        </div>
        <LoginForm />

        <div className="text-center text-sm">
          <p>
            Não tem uma conta?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
