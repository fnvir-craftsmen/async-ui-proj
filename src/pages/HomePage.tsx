import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchBox from "../components/SearchBox";
import StoryCard from "../components/StoryCard";
import { getTopStories, searchStories, type Story } from "../api/hackerNews";
import { useQueryMode } from "../context/QueryModeContext";

const STORY_LIMIT = 12;
const SEARCH_DEBOUNCE_MS = 300;

const HomePage = () => {
  const { mode } = useQueryMode();
  const useFetch = mode === "fetch";

  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery === null) {
      setDebouncedQuery(null);
      return;
    }
    const id = window.setTimeout(() => setDebouncedQuery(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [searchQuery]);

  const [stories, setStories] = useState<Story[]>([]);
  const [fetchLoading, setFetchLoading] = useState(useFetch && debouncedQuery === null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [hits, setHits] = useState<Story[]>([]);
  const [hitsLoading, setHitsLoading] = useState(false);
  const [hitsError, setHitsError] = useState<string | null>(null);

  const topStoriesQuery = useQuery({
    queryKey: ["hackerNews", "topStories", STORY_LIMIT],
    queryFn: () => getTopStories(STORY_LIMIT),
    enabled: !useFetch && debouncedQuery === null,
  });

  const searchResults = useQuery({
    queryKey: ["hackerNews", "search", debouncedQuery],
    queryFn: ({ signal }) => searchStories(debouncedQuery!, signal),
    enabled: !useFetch && debouncedQuery !== null,
  });

  useEffect(() => {
    if (!useFetch) return;

    const controller = new AbortController();
    const { signal } = controller;
    const loadingFeed = debouncedQuery === null;
    let cancelled = false;

    const run = async () => {
      try {
        if (loadingFeed) {
          setFetchLoading(true);
          setFetchError(null);
          const data = await getTopStories(STORY_LIMIT);
          if (cancelled) return;
          setStories(data);
        } else {
          setHitsLoading(true);
          setHitsError(null);
          const data = await searchStories(debouncedQuery, signal);
          if (cancelled) return;
          setHits(data);
        }
      } catch (err) {
        if (cancelled) return;
        if ((err as Error).name === "AbortError") return;
        const msg = (err as Error).message;
        if (loadingFeed) setFetchError(msg);
        else setHitsError(msg);
      } finally {
        if (loadingFeed) setFetchLoading(false);
        else setHitsLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [useFetch, debouncedQuery]);

  const searching = debouncedQuery !== null;

  let loading: boolean;
  let error: string | null;
  let list: Story[];

  if (useFetch) {
    if (searching) {
      loading = hitsLoading;
      error = hitsError;
      list = hits;
    } else {
      loading = fetchLoading;
      error = fetchError;
      list = stories;
    }
  } else if (searching) {
    loading = searchResults.isLoading;
    error = searchResults.error?.message ?? null;
    list = searchResults.data ?? [];
  } else {
    loading = topStoriesQuery.isLoading;
    error = topStoriesQuery.error?.message ?? null;
    list = topStoriesQuery.data ?? [];
  }

  const onSearch = (raw: string) => {
    const t = raw.trim();
    if (!t) {
      setSearchQuery(null);
      setHits([]);
      setHitsError(null);
      return;
    }
    setSearchQuery(t);
  };

  const onClear = () => {
    setSearchQuery(null);
    setHits([]);
    setHitsError(null);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-orange-400">
            HackerNews Feed
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Top Hacker News Stories
          </h1>
          <SearchBox
            onSearch={onSearch}
            onClear={onClear}
            active={searchQuery !== null}
          />
        </header>

        {loading && (
          <section className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <div className="h-4 w-3/4 rounded bg-slate-700" />
                <div className="mt-3 h-3 w-1/2 rounded bg-slate-800" />
              </div>
            ))}
          </section>
        )}

        {!loading && error && (
          <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
            <p className="font-semibold">
              {searching ? "Search failed" : "Could not load stories"}
            </p>
            <p className="mt-1 text-sm text-red-100/90">{error}</p>
          </section>
        )}

        {!loading && !error && list.length === 0 && (
          <p className="mt-8 text-slate-400">No stories found.</p>
        )}

        {!loading && !error && list.length > 0 && (
          <section className="space-y-3">
            {list.map((story, index) => (
              <StoryCard key={story.id} story={story} serial={index + 1} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
};

export default HomePage;
