'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Helper to format date as YYYY-MM-DD
export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Get days in month with padding for calendar grid
function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Add padding days from previous month
  const startPadding = firstDay.getDay();
  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push(d);
  }
  
  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  // Add padding days from next month to complete the grid (use 35 or 42 depending on need)
  const totalCells = days.length <= 35 ? 35 : 42;
  const endPadding = totalCells - days.length;
  for (let i = 1; i <= endPadding; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface AvailabilityCalendarProps {
  currentMonth: { year: number; month: number };
  selectedDate: Date | null;
  availableDates: Set<string>;
  onMonthChange: (direction: 'prev' | 'next') => void;
  onDateSelect: (date: Date) => void;
  title?: string;
  description?: string;
}

export function AvailabilityCalendar({
  currentMonth,
  selectedDate,
  availableDates,
  onMonthChange,
  onDateSelect,
  title = 'Availability Calendar',
  description = 'Click dates to set hours',
}: AvailabilityCalendarProps) {
  const calendarDays = getDaysInMonth(currentMonth.year, currentMonth.month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onMonthChange('prev')}
              className="text-gray-600 hover:text-gray-900 h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold text-gray-900 min-w-[120px] text-center">
              {MONTH_NAMES[currentMonth.month]} {currentMonth.year}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onMonthChange('next')}
              className="text-gray-600 hover:text-gray-900 h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAY_NAMES.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((date, i) => {
            const dateKey = formatDateKey(date);
            const isCurrentMonth = date.getMonth() === currentMonth.month;
            const isToday = date.getTime() === today.getTime();
            const isPast = date < today;
            const hasSlots = availableDates.has(dateKey);
            const isSelected = selectedDate && formatDateKey(selectedDate) === dateKey;

            return (
              <button
                key={i}
                onClick={() => !isPast && onDateSelect(date)}
                disabled={isPast}
                className={`
                  relative h-9 rounded-md flex flex-col items-center justify-center
                  transition-all duration-150
                  ${!isCurrentMonth ? 'opacity-25' : ''}
                  ${isPast ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer'}
                  ${isSelected 
                    ? 'bg-primary text-white ring-2 ring-primary ring-offset-1' 
                    : isToday 
                      ? 'bg-blue-100 text-gray-900 font-semibold' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <span className="text-xs font-medium">
                  {date.getDate()}
                </span>
                {hasSlots && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-green-500" />
                )}
                {hasSlots && isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white/70" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 pt-2 border-t">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-2 h-2 rounded bg-blue-100" />
            <span>Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
