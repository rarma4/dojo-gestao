"use client"

import { useState } from "react"
import { AlertModal } from "@/components/ui/alert-modal"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { ReactNode } from "react"

type AlertType = "error" | "success" | "info" | "warning"

interface AlertOptions {
  title?: string
  message: string
  type?: AlertType
  confirmText?: string
}

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

export function useAlertModal() {
  const [alertState, setAlertState] = useState<{
    open: boolean
    options: AlertOptions
  }>({
    open: false,
    options: { message: "" },
  })

  const [confirmState, setConfirmState] = useState<{
    open: boolean
    options: ConfirmOptions
    resolve?: (value: boolean) => void
  }>({
    open: false,
    options: { message: "" },
  })

  const showAlert = (options: AlertOptions | string) => {
    const alertOptions = typeof options === "string" 
      ? { message: options, type: "error" as AlertType }
      : options
    
    setAlertState({
      open: true,
      options: alertOptions,
    })
  }

  const showConfirm = (options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      const confirmOptions = typeof options === "string"
        ? { message: options }
        : options

      setConfirmState({
        open: true,
        options: confirmOptions,
        resolve,
      })
    })
  }

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, open: false }))
  }

  const handleConfirm = () => {
    confirmState.resolve?.(true)
    setConfirmState((prev) => ({ ...prev, open: false, resolve: undefined }))
  }

  const handleCancel = () => {
    confirmState.resolve?.(false)
    setConfirmState((prev) => ({ ...prev, open: false, resolve: undefined }))
  }

  const AlertComponent = (): ReactNode => (
    <>
      <AlertModal
        open={alertState.open}
        onClose={closeAlert}
        title={alertState.options.title}
        message={alertState.options.message}
        type={alertState.options.type}
        confirmText={alertState.options.confirmText}
      />
      <ConfirmModal
        open={confirmState.open}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title={confirmState.options.title}
        message={confirmState.options.message}
        confirmText={confirmState.options.confirmText}
        cancelText={confirmState.options.cancelText}
        variant={confirmState.options.variant}
      />
    </>
  )

  return {
    showAlert,
    showConfirm,
    AlertComponent,
  }
}
