export type Story = {
  id: number;
  title: string;
  by: string;
  score: number;
  url?: string;
  descendants?: number;
  time: number;
};

export type StoryDetail = Story & {
  kids?: number[];
  text?: string;
};

const BASE_URL = "https://hacker-news.firebaseio.com/v0";
const ALGOLIA_SEARCH = "https://hn.algolia.com/api/v1";

type AlgoliaHit = {
  objectID: string;
  title: string | null;
  author?: string;
  points?: number;
  url?: string | null;
  num_comments?: number;
  created_at_i?: number;
};

export async function searchStories(query: string, signal?: AbortSignal): Promise<Story[]> {
  const q = query.trim();
  if (!q) return [];

  const params = new URLSearchParams({ query: q, tags: "story", hitsPerPage: "20" });

  const res = await fetch(`${ALGOLIA_SEARCH}/search?${params}`, { signal });
  if (!res.ok)
    throw new Error("Search failed.");

  const { hits } = (await res.json()) as { hits: AlgoliaHit[] };

  return hits
    .map((h) => ({
      id: Number.parseInt(h.objectID, 10),
      title: h.title as string,
      by: h.author ?? "unknown",
      score: h.points ?? 0,
      url: h.url ?? undefined,
      descendants: h.num_comments ?? 0,
      time: h.created_at_i ?? 0,
    }))
    .filter((s) => !Number.isNaN(s.id));
}

export async function getTopStories(limit = 12): Promise<Story[]> {
  const idsRes = await fetch(`${BASE_URL}/topstories.json`);
  if (!idsRes.ok) {
    throw new Error("Failed to fetch top stories.");
  }

  const ids: number[] = await idsRes.json();
  const topIds = ids.slice(0, limit);

  const fetchedStories = await Promise.all(
    topIds.map(async (id) => {
      const res = await fetch(`${BASE_URL}/item/${id}.json`);
      if (!res.ok) return null;
      return (await res.json()) as Story;
    })
  );

  return fetchedStories.filter(
    (story): story is Story => Boolean(story?.id && story?.title && story?.by)
  );
}

export async function getStory(id: number): Promise<StoryDetail | null> {
  const res = await fetch(`${BASE_URL}/item/${id}.json`);
  if (!res.ok) {
    throw new Error("Failed to load story.");
  }

  const data = (await res.json()) as StoryDetail & { deleted?: boolean };
  if (!data || data.deleted || !data.title || !data.by) {
    return null;
  }

  return data;
}
