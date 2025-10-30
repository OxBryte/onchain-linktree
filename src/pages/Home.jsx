function Home() {
  const schedule = [
    {
      dayLabel: "TUE",
      date: "19 MAY",
      items: [
        { name: "Sarah", duration: "1hr", time: "9:30 AM – 10:30 AM" },
        { name: "Leah", duration: "30m", time: "12:45 PM – 1:15 PM" },
      ],
    },
    {
      dayLabel: "THU",
      date: "21 MAY",
      items: [{ name: "Joshua", duration: "1hr", time: "2:00 PM – 3:00 PM" }],
    },
    {
      dayLabel: "MON",
      date: "25 MAY",
      items: [{ name: "Edward", duration: "30m", time: "10:30 AM – 11:00 AM" }],
    },
  ];

  return (
    <div className="min-h-[100vh] w-full bg-neutral-100">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Left column: hero copy */}
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-500 shadow-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
              Available for May 2025
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-6xl">
              Fuelling <span className="text-orange-500">↗</span> growth
              <br />
              with every click
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">
              From landing pages to automation, we craft lead funnels that grow
              your business on autopilot.
            </p>
            <button className="mt-5 rounded-xl bg-neutral-900 px-5 py-3 font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5 w-fit">
              Get Started
            </button>

            <div className="mt-10">
              <div className="mb-2 flex items-center gap-1 text-amber-400">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span className="text-neutral-300">★</span>
              </div>
              <div className="flex -space-x-3">
                {[
                  "/avatars/1.png",
                  "/avatars/2.png",
                  "/avatars/3.png",
                  "/avatars/4.png",
                ].map((src, idx) => (
                  <div
                    key={idx}
                    className="h-8 w-8 rounded-full bg-neutral-300 ring-2 ring-neutral-100"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right column: schedule cards */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-white shadow-[0_30px_60px_rgba(0,0,0,0.09)]" />
            <div className="relative space-y-6 p-6">
              {/* Top ghost card */}
              <div className="mx-auto w-full max-w-md -rotate-2 rounded-2xl bg-white/70 p-4 shadow-lg backdrop-blur">
                <div className="text-sm text-neutral-500">
                  New client call: David
                </div>
                <div className="text-xs text-neutral-400">
                  9:30 AM – 10:30 AM
                </div>
              </div>

              {schedule.map((day, i) => (
                <div
                  key={day.dayLabel}
                  className="mx-auto w-full max-w-md rounded-2xl bg-white p-4 shadow-xl"
                >
                  <div className="mb-3 flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-semibold">{day.dayLabel}</span>
                    <span>{day.date}</span>
                  </div>
                  <div className="space-y-3">
                    {day.items.map((it, j) => (
                      <div
                        key={j}
                        className={`rounded-xl bg-neutral-50 p-3 shadow-sm ${
                          (i + j) % 2 === 0 ? "rotate-1" : "-rotate-1"
                        }`}
                      >
                        <div className="flex items-center justify-between text-sm text-neutral-800">
                          <span>New client call: {it.name}</span>
                          <span className="text-neutral-400">
                            {it.duration}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-neutral-400">
                          {it.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Bottom ghost */}
              <div className="mx-auto w-full max-w-md rotate-2 rounded-2xl bg-white/60 p-4 text-neutral-400 shadow-md backdrop-blur">
                <div className="text-xs">THU • 28 MAY</div>
                <div className="mt-1 text-sm">More calls…</div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-16 text-center text-sm text-neutral-500">
          Built on Web3 • Powered by the Blockchain
        </footer>
      </div>
    </div>
  );
}

export default Home;
