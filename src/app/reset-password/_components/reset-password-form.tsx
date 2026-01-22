"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { authClient } from "@/lib/auth-client"
import { useAlertModal } from "@/hooks/use-alert-modal";

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
  confirmPassword: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { showAlert, AlertComponent } = useAlertModal()

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    if (!token) {
      showAlert("Token inválido ou expirado");
      setTimeout(() => {
        router.push("/forgot-password")
      }, 2000)
    }
  }, [token, router])

  async function onSubmit(formData: ResetPasswordFormValues) {
    if (!token) {
      showAlert("Token inválido");
      return
    }

    try {
      console.log("Redefinindo senha com token:", token);
      
      const { data, error } = await authClient.resetPassword({
        newPassword: formData.password,
        token: token,
      })

      if (error) {
        console.error("Erro ao redefinir senha:", error);
        showAlert("Erro ao redefinir senha. O link pode ter expirado. Verifique o console.");
      } else {
        console.log("Senha redefinida com sucesso!");
        setResetSuccess(true)
        setTimeout(() => {
          router.push("/")
        }, 3000)
      }
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      showAlert("Erro ao redefinir senha. O link pode ter expirado. Verifique o console.");
    }
  }

  if (resetSuccess) {
    return (
      <>
        <AlertComponent />
        <div className="rounded-lg border bg-card p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Senha redefinida com sucesso!</h2>
        <p className="text-muted-foreground mb-4">
          Você será redirecionado para a página de login em instantes...
        </p>
        <Link href="/">
          <Button className="w-full">
            Ir para o login
          </Button>
        </Link>
      </div>
      </>
    )
  }

  return (
    <>
      <AlertComponent />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={form.formState.isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">{showPassword ? "Esconder senha" : "Mostrar senha"}</span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar nova senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="••••••••"
                      type={showConfirmPassword ? "text" : "password"}
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={form.formState.isSubmitting}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">{showConfirmPassword ? "Esconder senha" : "Mostrar senha"}</span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redefinindo...
              </>
            ) : (
              "Redefinir senha"
            )}
          </Button>

          <div className="text-center">
            <Link 
              href="/" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Voltar para o login
            </Link>
          </div>
        </form>
      </Form>
      </>
  )
}
