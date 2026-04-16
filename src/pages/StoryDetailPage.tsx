import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getStory, type StoryDetail } from "../api/hackerNews";
import { useQueryMode } from "../context/QueryModeContext";

const StoryDetailPage = () => {
  const { id: idParam } = useParams();
  const storyId = idParam ? Number.parseInt(idParam, 10) : NaN;
  const idValid = Number.isInteger(storyId) && storyId > 0;

  const { mode } = useQueryMode();
  const useFetch = mode === "fetch";

  const [story, setStory] = useState<StoryDetail | null>(null);
  const [fetchLoading, setFetchLoading] = useState(idValid && useFetch);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const storyQuery = useQuery({
    queryKey: ["hackerNews", "story", storyId] as const,
    queryFn: () => getStory(storyId),
    enabled: idValid && !useFetch,
  });

  useEffect(() => {
    if (!idValid || !useFetch) return;

    let cancelled = false;

    async function load() {
      try {
        setFetchLoading(true);
        setFetchError(null);
        const data = await getStory(storyId);
        if (!cancelled) setStory(data);
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
  }, [idValid, storyId, useFetch]);

  const loading = !idValid
    ? false
    : useFetch
      ? fetchLoading
      : storyQuery.isLoading;
  const error = !idValid
    ? "Invalid story id."
    : useFetch
      ? fetchError
      : (storyQuery.error?.message ?? null);
  const data = !idValid ? null : useFetch ? story : (storyQuery.data ?? null);

  const hnItemUrl = idValid
    ? `https://news.ycombinator.com/item?id=${storyId}`
    : "#";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="inline-block text-sm text-orange-400 transition hover:text-orange-300"
        >
          ← Back to stories
        </Link>

        {!idValid && <p className="mt-8 text-slate-400">{error}</p>}

        {idValid && loading && (
          <div className="mt-8 animate-pulse space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="h-8 w-4/5 max-w-lg rounded bg-slate-700" />
            <div className="h-4 w-40 rounded bg-slate-800" />
            <div className="h-24 rounded bg-slate-800/80" />
          </div>
        )}

        {idValid && !loading && error && (
          <section className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
            <p className="font-semibold">Could not load story</p>
            <p className="mt-1 text-sm text-red-100/90">{error}</p>
          </section>
        )}

        {idValid && !loading && !error && !data && (
          <p className="mt-8 text-slate-400">
            This story was removed or does not exist.
          </p>
        )}

        {idValid && !loading && !error && data && (
          <article className="mt-8">
            <p className="text-sm font-medium uppercase tracking-wider text-orange-400">
              Story
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
              {data.title}
            </h1>

            <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
              <div>
                <dt className="sr-only">Author</dt>
                <dd>by {data.by}</dd>
              </div>
              <div>
                <dt className="sr-only">Score</dt>
                <dd>{data.score} points</dd>
              </div>
              <div>
                <dt className="sr-only">Comments</dt>
                <dd>{data.descendants ?? 0} comments</dd>
              </div>
              <div>
                <dt className="sr-only">Posted</dt>
                <dd>
                  {new Date(data.time * 1000).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              {data.url && (
                <a
                  href={data.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-orange-400/50 hover:text-orange-200"
                >
                  Open article
                </a>
              )}
              <a
                href={hnItemUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-orange-400/50 hover:text-orange-200"
              >
                View on Hacker News
              </a>
            </div>
          </article>
        )}
      </div>
    </main>
  );
};

export default StoryDetailPage;
