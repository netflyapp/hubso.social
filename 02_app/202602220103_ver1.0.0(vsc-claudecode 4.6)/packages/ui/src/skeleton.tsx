import * as React from "react"
import { clsx } from "clsx"

const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx("animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800", className)}
    {...props}
  />
)

export { Skeleton }
