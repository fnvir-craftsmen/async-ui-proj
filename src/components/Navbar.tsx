import { useQueryMode, type QueryMode } from "../context/QueryModeContext";

const modes: { id: QueryMode; label: string }[] = [
  { id: "fetch", label: "Fetch" },
  { id: "react-query", label: "React Query" },
];

export default function Navbar() {
  const { mode, setMode } = useQueryMode();

  return (
    <header className="border-b border-slate-800/80 bg-slate-950">
      <div className="mx-auto flex max-w-4xl justify-center px-4 py-3 sm:px-6 lg:px-8">
        <div
          className="inline-flex min-w-50 rounded-lg border border-slate-800 bg-slate-900/90 p-0.5"
          role="radiogroup"
          aria-label="Query loading mode"
        >
          {modes.map(({ id, label }) => {
            const active = mode === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setMode(id)}
                className={`min-w-0 flex-1 rounded-md px-2.5 py-1.5 text-center text-xs font-medium transition focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-orange-400/70 sm:px-3 ${
                  active
                    ? "bg-orange-500 text-white"
                    : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
