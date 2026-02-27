"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema } from "@hubso/shared"
import { Button, Input } from "@hubso/ui"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")
  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      // TODO: Call API
      setEmail(data.email)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch {
      toast.error('Nie udało się wysłać linku. Spróbuj ponownie.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center animate-pulse">
              <Icon icon="solar:check-circle-bold" width={28} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Sprawdź swoją skrzynkę</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Wysłaliśmy link do resetowania hasła na adres
            </p>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-2 break-all">
              {email}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4 space-y-2">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <span className="font-semibold">Nie otrzymałeś?</span> Sprawdź folder spam lub{" "}
            <button
              onClick={() => {
                setIsSubmitted(false)
                setEmail("")
              }}
              className="text-blue-600 dark:text-blue-300 hover:underline"
            >
              spróbuj inny email
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <Icon icon="solar:arrow-left-linear" width={16} />
            Powrót do logowania
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
            <Icon icon="solar:lock-password-linear" width={28} className="text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Resetowanie hasła</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Podaj swój email, a wyślemy Ci link do resetowania hasła
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg p-6 space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-900 dark:text-white">
              Adres email
            </label>
            <Input
              {...register("email")}
              type="email"
              placeholder="name@company.com"
              className={errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <Icon icon="solar:danger-linear" width={14} />
                {(errors.email as any).message as string}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icon icon="solar:refresh-linear" width={18} className="animate-spin" />
                Wysyłanie...
              </>
            ) : (
              "Wyślij link resetujący"
            )}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <Icon icon="solar:arrow-left-linear" width={16} />
          Powrót do logowania
        </Link>
      </div>
    </div>
  )
}
