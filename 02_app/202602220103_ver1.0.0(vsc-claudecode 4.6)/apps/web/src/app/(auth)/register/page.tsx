"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema } from "@hubso/shared"
import { Button, Input } from "@hubso/ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { authApi, ApiError } from "@/lib/api"
import { tokenStore } from "@/lib/auth"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  })
  const password = watch("password")

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setApiError(null)
    try {
      await authApi.register({
        email: data.email,
        password: data.password,
        displayName: data.name,
      })
      // After register, auto-login
      const loginResult = await authApi.login({ email: data.email, password: data.password })
      tokenStore.setTokens(loginResult.accessToken, loginResult.refreshToken)
      router.push('/')
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.status === 409 ? 'This email is already registered.' : err.message)
      } else {
        setApiError('Unable to connect to server. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
            <Icon icon="solar:hub-bold" width={28} className="text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Create account</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Join Hubso and connect with your community
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg p-6 space-y-4">
        {apiError && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">
            <Icon icon="solar:danger-linear" width={16} className="shrink-0" />
            {apiError}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-900 dark:text-white">
              Full name
            </label>
            <Input
              {...register("name")}
              type="text"
              placeholder="John Doe"
              className={errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <Icon icon="solar:danger-linear" width={14} />
                {(errors.name as any).message as string}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-900 dark:text-white">
              Email address
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

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-900 dark:text-white">
              Password
            </label>
            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                className={errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 pr-10" : "pr-10"}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <Icon icon={showPassword ? "solar:eye-linear" : "solar:eye-closed-linear"} width={18} />
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <Icon icon="solar:danger-linear" width={14} />
                {(errors.password as any).message as string}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-900 dark:text-white">
              Confirm password
            </label>
            <div className="relative">
              <Input
                {...register("confirmPassword")}
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 pr-10" : "pr-10"}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <Icon icon={showConfirm ? "solar:eye-linear" : "solar:eye-closed-linear"} width={18} />
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <Icon icon="solar:danger-linear" width={14} />
                {(errors.confirmPassword as any).message as string}
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-start gap-3 text-sm cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface mt-1"
              {...register("terms")}
              disabled={isLoading}
            />
            <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
              I agree to Hubso's{" "}
              <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Terms of Service
              </Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p className="text-xs text-red-500 flex items-center gap-1 -mt-2">
              <Icon icon="solar:danger-linear" width={14} />
              {(errors.terms as any).message as string}
            </p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icon icon="solar:refresh-linear" width={18} className="animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
