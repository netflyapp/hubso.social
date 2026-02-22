import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { clsx } from "clsx"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={clsx("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button_previous: "h-7 w-7 bg-transparent p-0 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
        nav_button_next: "h-7 w-7 bg-transparent p-0 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-slate-600 rounded-md w-8 font-normal text-[0.8rem] dark:text-slate-400",
        row: "flex w-full mt-2",
        cell: clsx(
          "h-8 w-8 text-center text-sm p-0 relative",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-slate-100/50",
          "[&:has([aria-selected])]:bg-slate-100",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md",
          "dark:[&:has([aria-selected])]:bg-slate-800"
        ),
        day: clsx(
          "h-8 w-8 p-0 font-normal",
          "aria-selected:opacity-100",
          "aria-selected:bg-indigo-600 aria-selected:text-white",
          "aria-selected:hover:bg-indigo-700",
          "aria-selected:focus:bg-indigo-600",
          "rounded-md",
          "hover:bg-slate-100 hover:text-slate-900",
          "focus:bg-slate-100",
          "dark:hover:bg-slate-800",
          "dark:focus:bg-slate-800"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white",
        day_today: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50",
        day_outside: "day-outside text-slate-500 opacity-50 dark:text-slate-400",
        day_disabled: "text-slate-500 opacity-50 dark:text-slate-400",
        day_range_middle: "aria-selected:bg-slate-100 aria-selected:text-slate-900 dark:aria-selected:bg-slate-800 dark:aria-selected:text-slate-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
