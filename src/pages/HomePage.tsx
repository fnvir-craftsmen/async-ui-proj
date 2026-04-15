import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StoryCard from "../components/StoryCard";
import { getTopStories, type Story } from "../api/hackerNews";
import { useQueryMode } from "../context/QueryModeContext";

const STORY_LIMIT = 12;

const HomePage = () => {
  const { mode } = useQueryMode();
  const useFetch = mode === "fetch";
  
  const [stories, setStories] = useState<Story[]>([]);
  const [fetchLoading, setFetchLoading] = useState(useFetch);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const topStoriesQuery = useQuery({
    queryKey: ["hackerNews", "topStories", STORY_LIMIT],
    queryFn: () => getTopStories(STORY_LIMIT),
    enabled: !useFetch,
  });

  useEffect(() => {
    if (!useFetch) return;

    let cancelled = false;

    async function load() {
      try {
        setFetchLoading(true);
        setFetchError(null);
        const data = await getTopStories(STORY_LIMIT);
        if (!cancelled) setStories(data);
      } catch (err) {
        if (!cancelled) setFetchError((err as Error).message);
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [useFetch]);

  const loading = useFetch ? fetchLoading : topStoriesQuery.isLoading;
  const error = useFetch
    ? fetchError
    : (topStoriesQuery.error?.message ?? null);

  const list = useFetch ? stories : (topStoriesQuery.data ?? []);

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
            <p className="font-semibold">Could not load stories</p>
            <p className="mt-1 text-sm text-red-100/90">{error}</p>
          </section>
        )}

        {!loading && !error && (
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
