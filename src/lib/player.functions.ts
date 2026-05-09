import { createServerFn } from "@tanstack/react-start";

export const fetchPlayerData = createServerFn({ method: "GET" })
  .inputValidator((data: { identifier: string }) => data)
  .handler(async ({ data }) => {
    // Wynncraft v3 expects UUIDs without dashes (or a username)
    const stripped = data.identifier.replace(/-/g, "");
    const looksLikeUuid = /^[0-9a-fA-F]{32}$/.test(stripped);
    const id = looksLikeUuid ? stripped : data.identifier;

    const url = `https://api.wynncraft.com/v3/player/${encodeURIComponent(id)}?fullResult=True`;
    let res = await fetch(url, { headers: { "User-Agent": "TheQuoteGang-Site/1.0" } });

    // If UUID lookup failed, try the original (in case the input was a username)
    if (!res.ok && looksLikeUuid && data.identifier !== id) {
      res = await fetch(
        `https://api.wynncraft.com/v3/player/${encodeURIComponent(data.identifier)}?fullResult=True`,
        { headers: { "User-Agent": "TheQuoteGang-Site/1.0" } },
      );
    }
    if (!res.ok) throw new Error(`Wynncraft player API ${res.status}`);
    return (await res.json()) as any;
  });
