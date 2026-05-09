import { createServerFn } from "@tanstack/react-start";

export const fetchPlayerData = createServerFn({ method: "GET" })
  .inputValidator((data: { identifier: string }) => data)
  .handler(async ({ data }) => {
    const res = await fetch(
      `https://api.wynncraft.com/v3/player/${encodeURIComponent(data.identifier)}?fullResult=True`,
      { headers: { "User-Agent": "TheQuoteGang-Site/1.0" } },
    );
    if (!res.ok) throw new Error(`Wynncraft player API ${res.status}`);
    return (await res.json()) as any;
  });
