"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"

type AlertType = "error" | "success" | "info" | "warning"

interface AlertModalProps {
  open: boolean
  onClose: () => void
  title?: string
  message: string
  type?: AlertType
  confirmText?: string
}

const iconMap = {
  error: <XCircle className="h-6 w-6 text-destructive" />,
  success: <CheckCircle2 className="h-6 w-6 text-green-500" />,
  info: <Info className="h-6 w-6 text-blue-500" />,
  warning: <AlertCircle className="h-6 w-6 text-yellow-500" />,
}

const titleMap = {
  error: "Erro",
  success: "Sucesso",
  info: "Informação",
  warning: "Atenção",
}

export function AlertModal({
  open,
  onClose,
  title,
  message,
  type = "info",
  confirmText = "Ok",
}: AlertModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {iconMap[type]}
            <DialogTitle>{title || titleMap[type]}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
