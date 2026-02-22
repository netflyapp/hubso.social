'use client';

import { Icon } from '@iconify/react';
import { mockCourses } from '@/lib/mock-data';

export default function CoursesPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Kursy i materiały</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ucz się z najlepszymi materiałami przygotowanymi specjalnie dla członków</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Icon 
              icon="solar:magnifer-linear" 
              width={16} 
              height={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input 
              type="text" 
              placeholder="Szukaj kursów..." 
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-shadow"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-surface rounded-lg p-1 w-fit">
          <button className="px-4 py-2 bg-white dark:bg-slate-800 shadow-sm rounded-md text-xs font-semibold text-slate-900 dark:text-white">
            Wszystko
          </button>
          <button className="px-4 py-2 rounded-md text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            Kursy
          </button>
          <button className="px-4 py-2 rounded-md text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            Ebook
          </button>
          <button className="px-4 py-2 rounded-md text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            Video
          </button>
        </div>

        {/* Featured Course */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-2xl shadow-lg border border-indigo-500/20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          </div>
          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></span>
                  Cohort · 8 tygodni
                </span>
                <span className="px-2.5 py-1 bg-yellow-400/20 text-yellow-200 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Nowy!
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-2">
                Program Masterclass: Buduj swoją społeczność
              </h2>
              <p className="text-indigo-100/80 text-sm leading-relaxed mb-4">
                8-tygodniowy program z mentorem. Sesje Q&A na żywo, praktyczne zadania i certyfikat ukończenia.
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <div className="flex items-center gap-1.5 text-indigo-200 text-xs">
                  <Icon icon="solar:calendar-bold" width={14} height={14} />
                  Start: 3 mar 2026
                </div>
                <div className="flex items-center gap-1.5 text-indigo-200 text-xs">
                  <Icon icon="solar:users-group-rounded-bold" width={14} height={14} />
                  47/60 miejsc
                </div>
                <div className="flex items-center gap-1.5 text-indigo-200 text-xs">
                  <Icon icon="solar:video-frame-play-horizontal-bold" width={14} height={14} />
                  20 lekcji live
                </div>
              </div>
              <a 
                href="#" 
                className="h-10 px-6 bg-white hover:bg-indigo-50 text-indigo-700 text-sm font-bold rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <Icon icon="solar:arrow-right-bold" width={16} height={16} />
                Dołącz do programu
              </a>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockCourses.map((course, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border overflow-hidden transition-colors hover:shadow-lg group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                <img 
                  src={course.thumbnail || `https://images.unsplash.com/photo-${1611632985024 + idx}?w=400&h=250&fit=crop`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt=""
                />
                {course.isPremium && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded">
                    Premium
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{course.instructor}</p>
                
                <div className="flex items-center gap-1 mt-3 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Icon 
                      key={i}
                      icon="solar:star-bold" 
                      width={12} 
                      height={12}
                      className={i < course.rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}
                    />
                  ))}
                  <span className="text-[10px] text-slate-400 ml-1">{course.reviews} referencji</span>
                </div>

                {course.progress !== null && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {course.progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {course.price ? `${course.price} zł` : 'Darmowy'}
                  </div>
                  <button className="h-8 px-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                    {course.isMember ? 'Kontynuuj' : 'Przeglądaj'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
