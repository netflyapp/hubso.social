export function CallToAction() {
  return (
    <section id="cta">
      <div className="px-5 py-14 lg:px-0">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-y-5 rounded-2xl border border-slate-500/20 bg-neutral-50 p-10 shadow-inner dark:bg-neutral-900">
          <h3 className="mx-auto max-w-2xl text-balance text-center text-2xl font-bold text-neutral-800 dark:text-white md:text-3xl lg:text-4xl">
            Be the first to know about new features, special offers, and more.
          </h3>
          <p className="mx-auto text-balance text-center md:text-lg">
            Gain access to the best animated Library Components
          </p>
          <a
            href="#"
            className="shadow-small flex h-10 w-48 items-center justify-center gap-2.5 rounded-full border border-neutral-300/30 bg-neutral-900 font-medium text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.9)] transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:scale-95 active:shadow-none"
          >
            Buy now
          </a>
        </div>
      </div>
    </section>
  );
}
