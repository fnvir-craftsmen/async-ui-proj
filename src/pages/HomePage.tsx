import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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
              <article
                key={story.id}
                className="group relative rounded-xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-orange-400/50 hover:bg-slate-900"
              >
                <Link
                  to={`/story/${story.id}`}
                  className="absolute inset-0 z-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400/70"
                  aria-label={`Open story: ${story.title}`}
                />

                <div className="relative z-10 flex flex-col gap-3 pointer-events-none">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-base font-semibold leading-snug text-slate-100 sm:text-lg">
                      <span className="mr-2 text-slate-500">{index + 1}.</span>
                      <span className="group-hover:text-orange-300">{story.title}</span>
                    </h2>
                    <span className="shrink-0 rounded-md bg-orange-500/15 px-2 py-1 text-xs font-medium text-orange-300">
                      {story.score} pts
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 sm:text-sm">
                    <span>by {story.by}</span>
                    <span>{story.descendants ?? 0} comments</span>
                    <span>
                      {new Date(story.time * 1000).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
};

export default HomePage;
