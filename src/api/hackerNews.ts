export type Story = {
  id: number;
  title: string;
  by: string;
  score: number;
  url?: string;
  descendants?: number;
  time: number;
};

const BASE_URL = "https://hacker-news.firebaseio.com/v0";

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
