"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";

interface MonthViewProps {
  year: number;
  month: number; // 0-indexed
  events: CalendarEvent[];
  selectedDate: string | null; // "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ACCENT_COLORS = [
  { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-400", dot: "bg-sky-500" },
  { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-400", dot: "bg-violet-500" },
  { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-400", dot: "bg-emerald-500" },
  { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-400", dot: "bg-amber-500" },
  { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-400", dot: "bg-rose-500" },
  { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-400", dot: "bg-teal-500" },
];

function groupEventsByDate(events: CalendarEvent[]) {
  const map = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const dateStr = ev.start.slice(0, 10);
    if (!map.has(dateStr)) map.set(dateStr, []);
    map.get(dateStr)!.push(ev);
  }
  return map;
}

function formatEventTime(isoStr: string): string {
  const d = new Date(isoStr);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "p" : "a";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${ampm}` : `${hour}:${String(m).padStart(2, "0")}${ampm}`;
}

function cleanSummary(summary: string): string {
  return summary.replace(/^[\u{1F3CB}\u{FE0F}\u{200D}\u{2640}\u{2642}\u{1F3CB}️‍♀️🏋️‍♂️🏋️\s]+/u, "").trim();
}

export default function MonthView({
  year,
  month,
  events,
  selectedDate,
  onSelectDate,
}: MonthViewProps) {
  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);

  // Build a consistent color mapping per unique exercise name
  const colorMap = useMemo(() => {
    const map = new Map<string, number>();
    let idx = 0;
    for (const ev of events) {
      const name = cleanSummary(ev.summary);
      if (!map.has(name)) {
        map.set(name, idx % ACCENT_COLORS.length);
        idx++;
      }
    }
    return map;
  }, [events]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const day = i - firstDay + 1;
    cells.push(day >= 1 && day <= daysInMonth ? day : null);
  }

  const today = new Date();
  const todayStr =
    today.getFullYear() === year && today.getMonth() === month
      ? `${year}-${String(month + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
      : null;

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-[rgba(32,32,32,0.06)]">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={cn(
              "py-3 text-center text-[11px] font-semibold uppercase tracking-[0.1em]",
              i === 0 || i === 6
                ? "text-[rgba(32,32,32,0.3)]"
                : "text-[rgba(32,32,32,0.45)]"
            )}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div
          key={wi}
          className={cn(
            "grid grid-cols-7",
            wi < weeks.length - 1 && "border-b border-[rgba(32,32,32,0.04)]"
          )}
        >
          {week.map((day, di) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${wi}-${di}`}
                  className="min-h-[88px] bg-[rgba(32,32,32,0.015)] sm:min-h-[108px]"
                />
              );
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = eventsByDate.get(dateStr) || [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const isPast = new Date(dateStr + "T23:59:59") < new Date(todayStr ? todayStr + "T00:00:00" : "9999-12-31");
            const isWeekend = di === 0 || di === 6;

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={cn(
                  "group relative flex min-h-[88px] flex-col justify-start p-1.5 text-left transition-all duration-150 sm:min-h-[108px] sm:p-2",
                  di < 6 && "border-r border-[rgba(32,32,32,0.04)]",
                  isSelected
                    ? "bg-[#f0f8ff] ring-1 ring-inset ring-[#1DB3FB]/20"
                    : isToday
                      ? "bg-[#fafeff]"
                      : isWeekend && !isPast
                        ? "bg-[rgba(32,32,32,0.01)]"
                        : "hover:bg-[rgba(29,179,251,0.02)]",
                  isPast && !isToday && !isSelected && "opacity-50"
                )}
              >
                {/* Day number */}
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-md text-[12px] font-semibold",
                      isToday
                        ? "bg-[#202020] text-white"
                        : isSelected
                          ? "text-[#1DB3FB]"
                          : "text-[rgba(32,32,32,0.6)] group-hover:text-[rgba(32,32,32,0.8)]"
                    )}
                  >
                    {day}
                  </span>
                  {/* Event count badge on mobile */}
                  {dayEvents.length > 0 && (
                    <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[rgba(32,32,32,0.06)] px-1 text-[9px] font-bold text-[rgba(32,32,32,0.4)] sm:hidden">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Events */}
                {dayEvents.length > 0 && (
                  <>
                    {/* Desktop: clean event items */}
                    <div className="hidden flex-col gap-[3px] sm:flex">
                      {dayEvents.slice(0, 3).map((ev) => {
                        const name = cleanSummary(ev.summary);
                        const colorIdx = colorMap.get(name) ?? 0;
                        const color = ACCENT_COLORS[colorIdx];
                        return (
                          <div
                            key={ev.id}
                            className={cn(
                              "flex items-center gap-1 truncate rounded-[5px] border-l-2 py-[2px] pl-1.5 pr-1 text-[10px] font-medium leading-tight",
                              color.bg,
                              color.text,
                              color.border
                            )}
                            title={`${name} — ${formatEventTime(ev.start)}`}
                          >
                            <span className="truncate">{name}</span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className="pl-1 text-[9px] font-semibold text-[rgba(32,32,32,0.35)]">
                          +{dayEvents.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Mobile: colored dots */}
                    <div className="flex items-center gap-[3px] sm:hidden">
                      {dayEvents.slice(0, 4).map((ev) => {
                        const name = cleanSummary(ev.summary);
                        const colorIdx = colorMap.get(name) ?? 0;
                        const color = ACCENT_COLORS[colorIdx];
                        return (
                          <div
                            key={ev.id}
                            className={cn("h-[5px] w-[5px] rounded-full", color.dot)}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
