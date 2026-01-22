"use client"

import { useState } from "react"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { authClient } from "@/lib/auth-client"
import { useAlertModal } from "@/hooks/use-alert-modal"

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [emailSent, setEmailSent] = useState(false)
  const { showAlert, AlertComponent } = useAlertModal()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(formData: ForgotPasswordFormValues) {
    try {
      console.log("Solicitando reset de senha para:", formData.email);
      
      const { data, error } = await authClient.requestPasswordReset({
        email: formData.email,
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        console.error("Erro ao solicitar reset de senha:", error);
        showAlert("Erro ao solicitar reset de senha. Verifique o console para mais detalhes.");
      } else {
        console.log("Email de reset enviado com sucesso!");
        setEmailSent(true)
      }
    } catch (error) {
      console.error("Erro ao solicitar reset de senha:", error);
      showAlert("Erro ao solicitar reset de senha. Verifique o console para mais detalhes.");
    }
  }

  if (emailSent) {
    return (
      <>
        <AlertComponent />
        <div className="rounded-lg border bg-card p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Email enviado!</h2>
        <p className="text-muted-foreground mb-4">
          Se o email informado estiver cadastrado, você receberá um link para redefinir sua senha.
        </p>
        <Link href="/">
          <Button variant="outline" className="w-full">
            Voltar para o login
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="seu@email.com" 
                  type="email" 
                  {...field} 
                  disabled={form.formState.isSubmitting} 
                />
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
              Enviando...
            </>
          ) : (
            "Enviar link de recuperação"
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
