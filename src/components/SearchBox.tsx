import { useRef, type SubmitEvent } from "react";

type Props = {
  onSearch: (query: string) => void | Promise<void>;
  onClear?: () => void;
  active: boolean;
};

export default function SearchBox({ onSearch, onClear, active }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    void onSearch(inputRef.current?.value ?? "");
  };

  return (
    <form onSubmit={submit} className="mt-4 flex flex-wrap gap-2">
      <input
        ref={inputRef}
        type="search"
        placeholder="Search stories…"
        onChange={(e) => {
          void onSearch(e.target.value);
        }}
        className="min-w-48 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-orange-400/50 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:border-orange-400/40"
      >
        Search
      </button>
      {active && onClear && (
        <button
          type="button"
          onClick={() => {
            if (inputRef.current) inputRef.current.value = "";
            onClear();
          }}
          className="rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-orange-300"
        >
          Clear
        </button>
      )}
    </form>
  );
}
