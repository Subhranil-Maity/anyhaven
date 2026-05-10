import { useState, useEffect } from "react"
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

interface ToastActionElement {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
}

let memoryState: ToastActionElement[] = []
let listeners: Array<(state: ToastActionElement[]) => void> = []

export function toast(props: Omit<ToastActionElement, "id">) {
  const id = Math.random().toString(36).substr(2, 9)
  const newToast = { ...props, id }
  memoryState = [...memoryState, newToast]
  listeners.forEach((listener) => listener(memoryState))
  
  setTimeout(() => {
    memoryState = memoryState.filter((t) => t.id !== id)
    listeners.forEach((listener) => listener(memoryState))
  }, 5000)
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastActionElement[]>(memoryState)

  useEffect(() => {
    listeners.push(setToasts)
    return () => {
      listeners = listeners.filter((l) => l !== setToasts)
    }
  }, [])

  return { toasts, toast }
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, variant }) {
        return (
          <Toast key={id} variant={variant}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
