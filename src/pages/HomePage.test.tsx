import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "./HomePage";

vi.mock("../context/QueryModeContext", () => ({
  useQueryMode: () => ({ mode: "react-query" }),
}));

const useQueryMock = vi.fn();
vi.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

function renderHomePage() {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

function mockQueries({
  loading = false,
  error = null as Error | null,
  data = [] as Array<{ id: number; title: string; by: string; score: number; time: number }>,
}: {
  loading?: boolean;
  error?: Error | null;
  data?: Array<{ id: number; title: string; by: string; score: number; time: number }>;
}) {
  useQueryMock
    .mockImplementationOnce(() => ({
      isLoading: loading,
      error,
      data,
    }))
    .mockImplementationOnce(() => ({
      isLoading: false,
      error: null,
      data: [],
    }));
}

describe("HomePage async states", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
  });

  it("shows loading state", () => {
    mockQueries({ loading: true });

    renderHomePage();

    expect(screen.getByText("Top Hacker News Stories")).toBeInTheDocument();
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows error state", () => {
    mockQueries({ error: new Error("Failed to fetch top stories.") });

    renderHomePage();

    expect(screen.getByText("Could not load stories")).toBeInTheDocument();
    expect(screen.getByText("Failed to fetch top stories.")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    mockQueries({ data: [] });

    renderHomePage();

    expect(screen.getByText("No stories found.")).toBeInTheDocument();
  });

  it("shows loaded state", () => {
    mockQueries({
      data: [
        {
          id: 1,
          title: "Async UI done right",
          by: "alice",
          score: 42,
          time: 1_700_000_000,
        },
      ],
    });

    renderHomePage();

    expect(screen.getByText("Async UI done right")).toBeInTheDocument();
    expect(screen.queryByText("No stories found.")).not.toBeInTheDocument();
  });
});
