import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type QueryMode = "fetch" | "react-query";

type QueryModeContextValue = {
  mode: QueryMode;
  setMode: (mode: QueryMode) => void;
};

/* eslint-disable react-refresh/only-export-components */
const QueryModeContext = createContext<QueryModeContextValue | null>(null);

export function QueryModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<QueryMode>("fetch");

  const setMode = useCallback((next: QueryMode) => {
    setModeState(next);
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <QueryModeContext.Provider value={value}>
      {children}
    </QueryModeContext.Provider>
  );
}

export function useQueryMode(): QueryModeContextValue {
  const ctx = useContext(QueryModeContext);
  if (!ctx) {
    throw new Error("useQueryMode must be used within QueryModeProvider");
  }
  return ctx;
}
