"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema } from "@hubso/shared"
import { Button, Input } from "@hubso/ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { authApi, ApiError } from "@/lib/api"
import { tokenStore } from "@/lib/auth"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setApiError(null)
    try {
      const result = await authApi.login({ email: data.email, password: data.password })
      tokenStore.setTokens(result.accessToken, result.refreshToken)
      router.push('/')
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.status === 401 ? 'Invalid email or password.' : err.message)
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
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Sign in to continue to Hubso
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
          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-900 dark:text-white">
              Email address
            </label>
            <div className="relative">
              <Input
                {...register("email")}
                type="email"
                placeholder="name@company.com"
                className={`pr-10 ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : ""
                }`}
                disabled={isLoading}
              />
              {!errors.email && (
                <Icon icon="solar:check-circle-linear" width={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 hidden" />
              )}
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <Icon icon="solar:danger-linear" width={14} />
                {(errors.email as any).message as string}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-900 dark:text-white">
                Password
              </label>
              <Link
                href="/reset-password"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
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

          {/* Remember Me */}
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface"
              disabled={isLoading}
            />
            <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
              Keep me signed in
            </span>
          </label>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icon icon="solar:refresh-linear" width={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in with email"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-dark-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white dark:bg-dark-surface text-slate-500 dark:text-slate-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Auth Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-surface"
            disabled={isLoading}
          >
            <Icon icon="mdi:google" width={18} />
          </Button>
          <Button
            variant="outline"
            className="border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-surface"
            disabled={isLoading}
          >
            <Icon icon="mdi:github" width={18} />
          </Button>
          <Button
            variant="outline"
            className="border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-surface"
            disabled={isLoading}
          >
            <Icon icon="mdi:apple" width={18} />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Don't have an account?{" "}
        <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          Create account
        </Link>
      </p>
    </div>
  )
}
