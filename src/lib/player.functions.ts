import { createServerFn } from "@tanstack/react-start";

export const fetchPlayerData = createServerFn({ method: "GET" })
  .inputValidator((data: { username: string }) => data)
  .handler(async ({ data }) => {
    const res = await fetch(
      `https://api.wynncraft.com/v3/player/${encodeURIComponent(data.username)}?fullResult=True`,
      { headers: { "User-Agent": "TheQuoteGang-Site/1.0" } },
    );
    if (!res.ok) throw new Error(`Wynncraft player API ${res.status}`);
    return (await res.json()) as any;
  });
