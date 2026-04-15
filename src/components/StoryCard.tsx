import { Link } from "react-router-dom";
import type { Story } from "../api/hackerNews";

export type StoryCardProps = {
  story: Story;
  serial?: number;
  to?: string;
  className?: string;
};

export default function StoryCard({
  story,
  serial,
  to = `/story/${story.id}`,
  className = "",
}: StoryCardProps) {
  return (
    <article
      className={`group relative rounded-xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-orange-400/50 hover:bg-slate-900 ${className}`.trim()}
    >
      <Link
        to={to}
        className="absolute inset-0 z-0 rounded-xl focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-orange-400/70"
        aria-label={`Open story: ${story.title}`}
      />

      <div className="relative z-10 flex flex-col gap-3 pointer-events-none">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-base font-semibold leading-snug text-slate-100 sm:text-lg">
            {serial != null && (
              <span className="mr-2 text-slate-500">{serial}.</span>
            )}
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
  );
}
