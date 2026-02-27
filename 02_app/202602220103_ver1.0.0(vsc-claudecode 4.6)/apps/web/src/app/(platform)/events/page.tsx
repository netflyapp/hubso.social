'use client';

export const dynamic = 'force-dynamic'

import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, communitiesApi, type EventItem } from '@/lib/api';

const MONTHS_PL = ['STY', 'LUT', 'MAR', 'KWI', 'MAJ', 'CZE', 'LIP', 'SIE', 'WRZ', 'PAŹ', 'LIS', 'GRU'];
function getDateParts(dateStr: string) {
  const d = new Date(dateStr);
  return {
    month: MONTHS_PL[d.getMonth()] ?? '---',
    day: d.getDate(),
    time: d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
  };
}
function getEventType(locationType: string) {
  if (locationType === 'VIRTUAL') return 'Online';
  if (locationType === 'IN_PERSON') return 'Stacjonarne';
  return 'Hybrydowe';
}

const eventGradients = [
  'from-red-500 to-rose-600',
  'from-rose-500 to-pink-600',
  'from-teal-500 to-emerald-600',
  'from-indigo-500 to-violet-600',
  'from-purple-500 to-fuchsia-600',
  'from-sky-500 to-blue-600',
] as const;

const eventStatusColors = [
  { bg: 'bg-red-100', text: 'text-red-700', dark: 'dark:text-red-300', darkBg: 'dark:bg-red-500/20' },
  { bg: 'bg-rose-100', text: 'text-rose-700', dark: 'dark:text-rose-300', darkBg: 'dark:bg-rose-500/20' },
  { bg: 'bg-teal-100', text: 'text-teal-700', dark: 'dark:text-teal-300', darkBg: 'dark:bg-teal-500/20' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', dark: 'dark:text-indigo-300', darkBg: 'dark:bg-indigo-500/20' },
  { bg: 'bg-purple-100', text: 'text-purple-700', dark: 'dark:text-purple-300', darkBg: 'dark:bg-purple-500/20' },
  { bg: 'bg-sky-100', text: 'text-sky-700', dark: 'dark:text-sky-300', darkBg: 'dark:bg-sky-500/20' },
] as const;

const eventButtonColors = [
  'bg-red-600 hover:bg-red-700',
  'bg-rose-600 hover:bg-rose-700',
  'bg-teal-600 hover:bg-teal-700',
  'bg-indigo-600 hover:bg-indigo-700',
  'bg-purple-600 hover:bg-purple-700',
  'bg-sky-600 hover:bg-sky-700',
] as const;

// ─── Calendar View ────────────────────────────────────────────────────────────

const MONTHS_PL_FULL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
];
const DAYS_PL = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];

function CalendarView({
  events,
  month,
  onMonthChange,
  onRsvp,
  isLoading,
}: {
  events: EventItem[];
  month: Date;
  onMonthChange: (d: Date) => void;
  onRsvp: (e: EventItem) => void;
  isLoading: boolean;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = month.getFullYear();
  const monthIdx = month.getMonth();
  const firstDay = new Date(year, monthIdx, 1);
  const lastDay = new Date(year, monthIdx + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = lastDay.getDate();

  // Map events to days
  const eventsByDay: Record<string, EventItem[]> = {};
  events.forEach((ev) => {
    const d = new Date(ev.startsAt);
    if (d.getMonth() === monthIdx && d.getFullYear() === year) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!eventsByDay[key]) eventsByDay[key] = [];
      eventsByDay[key].push(ev);
    }
  });

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const cells: { day: number; key: string }[] = [];
  for (let i = 0; i < startDay; i++) cells.push({ day: 0, key: `empty-${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, key });
  }

  const prevMonth = () => onMonthChange(new Date(year, monthIdx - 1, 1));
  const nextMonth = () => onMonthChange(new Date(year, monthIdx + 1, 1));

  const selectedEvents = selectedDate ? (eventsByDay[selectedDate] ?? []) : [];

  if (isLoading) {
    return <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />;
  }

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Icon icon="solar:arrow-left-linear" width={18} />
        </button>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {MONTHS_PL_FULL[monthIdx]} {year}
        </h2>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Icon icon="solar:arrow-right-linear" width={18} />
        </button>
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
          {DAYS_PL.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {cells.map((cell) => {
            if (cell.day === 0) {
              return <div key={cell.key} className="min-h-[72px] bg-slate-50 dark:bg-slate-800/30" />;
            }
            const dayEvents = eventsByDay[cell.key] ?? [];
            const isToday = cell.key === todayKey;
            const isSelected = cell.key === selectedDate;

            return (
              <button
                key={cell.key}
                onClick={() => setSelectedDate(isSelected ? null : cell.key)}
                className={`min-h-[72px] p-1.5 border-b border-r border-slate-100 dark:border-slate-800 text-left transition-colors relative ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-900/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span
                  className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                    isToday
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cell.day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="mt-0.5 space-y-0.5">
                    {dayEvents.slice(0, 2).map((ev, i) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] leading-tight font-medium px-1 py-0.5 rounded truncate text-white bg-gradient-to-r ${eventGradients[i % 6]}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-400 px-1">+{dayEvents.length - 2} więcej</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-slate-400">Brak wydarzeń w tym dniu</p>
          ) : (
            selectedEvents.map((ev) => {
              const { time } = getDateParts(ev.startsAt);
              const isGoing = ev.myRsvp === 'GOING';
              return (
                <div
                  key={ev.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ev.title}</h4>
                    <span className="text-xs text-slate-500">{time}</span>
                  </div>
                  {ev.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{ev.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Icon icon="solar:users-group-rounded-linear" width={12} />
                      {ev.attendeeCount} uczestników
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={eventsApi.icalUrl(ev.id)}
                        download
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        title="iCal"
                      >
                        <Icon icon="solar:calendar-add-linear" width={12} />
                      </a>
                      <button
                        onClick={() => onRsvp(ev)}
                        className={`h-7 px-3 text-white text-xs font-semibold rounded-lg transition-colors ${
                          isGoing ? 'bg-slate-500 hover:bg-slate-600' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {isGoing ? 'Wypisz się' : 'Dołącz'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Create Event Dialog ──────────────────────────────────────────────────────

function CreateEventDialog({ spaceId, onClose }: { spaceId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [locationType, setLocationType] = useState<'VIRTUAL' | 'IN_PERSON' | 'HYBRID'>('VIRTUAL');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: () =>
      eventsApi.create({
        spaceId,
        title: title.trim(),
        description: description.trim() || undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : new Date(new Date(startsAt).getTime() + 60 * 60 * 1000).toISOString(),
        locationType,
        location: location.trim() || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events', 'upcoming'] });
      onClose();
    },
    onError: () => setError('Błąd tworzenia wydarzenia'),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startsAt) { setError('Podaj tytuł i datę'); return; }
    setError('');
    createMutation.mutate();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-dark-border">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Nowe wydarzenie</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
            <Icon icon="solar:close-circle-linear" width={20} height={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 dark:bg-red-500/10 rounded-lg p-2">{error}</p>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tytuł *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="np. Webinar o AI"
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Opis</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Data i godzina *</label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Koniec (opcjonalnie)</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Typ</label>
            <select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value as 'VIRTUAL' | 'IN_PERSON' | 'HYBRID')}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="VIRTUAL">Online</option>
              <option value="IN_PERSON">Stacjonarne</option>
              <option value="HYBRID">Hybrydowe</option>
            </select>
          </div>
          {(locationType === 'IN_PERSON' || locationType === 'HYBRID') && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Adres / Link</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="np. ul. Przykładowa 1, Warszawa"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg border border-gray-200 dark:border-dark-border text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 h-10 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {createMutation.isPending ? 'Tworzenie...' : 'Utwórz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const communitiesQuery = useQuery({
    queryKey: ['communities'],
    queryFn: () => communitiesApi.list(),
    staleTime: 60_000,
  });
  const spaceId = communitiesQuery.data?.[0]?.id ?? '';

  const { data: events = [], isLoading } = useQuery<EventItem[]>({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventsApi.upcoming(),
    staleTime: 30_000,
    retry: false,
  });

  const rsvpMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'GOING' | 'MAYBE' | 'NOT_GOING' }) =>
      eventsApi.rsvp(id, status),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['events', 'upcoming'] }),
  });

  const cancelRsvpMutation = useMutation({
    mutationFn: (id: string) => eventsApi.cancelRsvp(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['events', 'upcoming'] }),
  });

  function handleRsvp(event: EventItem) {
    if (event.myRsvp === 'GOING') {
      cancelRsvpMutation.mutate(event.id);
    } else {
      rsvpMutation.mutate({ id: event.id, status: 'GOING' });
    }
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-8">
      {showCreate && spaceId && (
        <CreateEventDialog spaceId={spaceId} onClose={() => setShowCreate(false)} />
      )}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Events List */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">wydarzenia</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Spotkania, webinary i wyzwania społeczności</p>
              </div>
              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    title="Widok listy"
                  >
                    <Icon icon="solar:list-linear" width={18} height={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    title="Widok kalendarza"
                  >
                    <Icon icon="solar:calendar-linear" width={18} height={18} />
                  </button>
                </div>
                <button
                  onClick={() => setShowCreate(true)}
                  disabled={!spaceId}
                  className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <Icon icon="solar:add-circle-linear" width={18} height={18} />
                  Utwórz wydarzenie
                </button>
              </div>
            </div>

            {/* Loading skeleton */}
            {isLoading && viewMode === 'list' && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border h-28 animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && events.length === 0 && viewMode === 'list' && (
              <div className="text-center py-16">
                <Icon icon="solar:calendar-linear" width={48} height={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Brak nadchodzących wydarzeń</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Bądź pierwszy — utwórz wydarzenie dla swojej społeczności!
                </p>
              </div>
            )}

            {/* Event cards */}
            {viewMode === 'list' && events.map((event, idx) => {
              const sc = eventStatusColors[idx % 6]!;
              const bg = eventGradients[idx % 6]!;
              const btnColor = eventButtonColors[idx % 6]!;
              const { month, day, time } = getDateParts(event.startsAt);
              const isGoing = event.myRsvp === 'GOING';
              return (
                <div
                  key={event.id}
                  className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border overflow-hidden transition-colors hover:shadow-lg"
                >
                  <div className="flex">
                    <div className={`w-20 sm:w-24 bg-gradient-to-b ${bg} flex flex-col items-center justify-center text-white shrink-0 py-4`}>
                      <span className="text-xs font-semibold uppercase">{month}</span>
                      <span className="text-3xl font-extrabold leading-none mt-1">{day}</span>
                      <span className="text-[10px] mt-1 opacity-80">{time}</span>
                    </div>
                    <div className="p-4 flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 ${sc.bg} ${sc.darkBg} ${sc.text} ${sc.dark} text-[10px] font-bold rounded-full`}>
                          {getEventType(event.locationType)}
                        </span>
                        {event.ticketPrice != null && event.ticketPrice > 0 && (
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-full">
                            {event.ticketPrice} PLN
                          </span>
                        )}
                        {isGoing && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 text-[10px] font-bold rounded-full flex items-center gap-1">
                            <Icon icon="solar:check-circle-bold" width={10} height={10} />
                            Zapisany
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{event.title}</h3>
                      {event.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{event.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Icon icon="solar:users-group-rounded-linear" width={12} height={12} />
                          {event.attendeeCount} uczestników
                          {event.maxAttendees != null && ` / ${event.maxAttendees}`}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 truncate max-w-[140px]">
                            <Icon icon="solar:map-point-linear" width={12} height={12} />
                            {event.location}
                          </span>
                        )}
                        <div className="ml-auto flex items-center gap-2">
                          <a
                            href={eventsApi.icalUrl(event.id)}
                            download
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                            title="Dodaj do kalendarza (.ics)"
                          >
                            <Icon icon="solar:calendar-add-linear" width={14} height={14} />
                          </a>
                          <button
                            onClick={() => handleRsvp(event)}
                            disabled={rsvpMutation.isPending || cancelRsvpMutation.isPending}
                            className={`h-7 px-3 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 disabled:opacity-60 ${
                              isGoing ? 'bg-slate-500 hover:bg-slate-600' : btnColor
                            }`}
                          >
                            <Icon
                              icon={isGoing ? 'solar:close-circle-linear' : 'solar:play-bold'}
                              width={12}
                              height={12}
                            />
                            {isGoing ? 'Wypisz się' : 'Dołącz'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Calendar View */}
            {viewMode === 'calendar' && (
              <CalendarView
                events={events}
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                onRsvp={handleRsvp}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
            {/* Organizer card */}
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-5 transition-colors">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Organizatorzy</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                  <Icon icon="solar:users-group-rounded-bold" width={24} height={24} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Społeczność</div>
                  <div className="text-xs text-slate-400">Zespół organizacyjny</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                Organizujemy regularne spotkania, webinary i wyzwania, żeby nasza społeczność stale rosła i się rozwijała.
              </p>
            </div>

            {/* Mini calendar sidebar */}
            {events.length > 0 && (
              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border p-5 transition-colors">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Nadchodzące</h3>
                <div className="space-y-3">
                  {events.slice(0, 5).map((event, idx) => {
                    const { month, day } = getDateParts(event.startsAt);
                    return (
                      <div key={event.id} className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            ['bg-red-500', 'bg-rose-500', 'bg-teal-500', 'bg-indigo-500', 'bg-purple-500', 'bg-sky-500'][idx % 6]
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{event.title}</div>
                          <div className="text-[10px] text-slate-400">
                            {month} {day} · {getDateParts(event.startsAt).time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Info banner */}
            <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-5 border border-indigo-100 dark:border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="solar:info-circle-bold" width={16} height={16} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Strefy czasowe</span>
              </div>
              <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80 leading-relaxed">
                Wszystkie godziny podane w czasie polskim (CET/CEST). Nagrania dostępne po wydarzeniu w sekcji Dokumenty.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
