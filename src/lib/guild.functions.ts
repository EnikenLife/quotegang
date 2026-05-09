import { createServerFn } from "@tanstack/react-start";

export const fetchGuildData = createServerFn({ method: "GET" }).handler(async () => {
  const res = await fetch("https://api.wynncraft.com/v3/guild/prefix/Next", {
    headers: { "User-Agent": "TheQuoteGang-Site/1.0" },
  });
  if (!res.ok) throw new Error(`Wynncraft API ${res.status}`);
  return (await res.json()) as any;
});
