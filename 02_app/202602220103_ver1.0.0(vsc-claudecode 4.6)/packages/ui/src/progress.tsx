import * as React from "react"
import { clsx } from "clsx"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    max?: number
  }
>(({ className, value = 0, max = 100, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800", className)}
    {...props}
  >
    <div
      className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all"
      style={{ width: `${(value / max) * 100}%` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
