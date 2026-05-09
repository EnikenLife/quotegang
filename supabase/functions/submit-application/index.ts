// Submit a guild application: validates input, inserts as the signed-in user
// (RLS still applies via the user's JWT), and sends a Discord webhook from
// the server so the URL is never exposed to the browser.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Sign in required." }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Sign in required." }, 401);
    const user = userData.user;

    const body = await req.json();
    const discord = String(body?.discord_username ?? "").trim();
    const activity = String(body?.activity ?? "").trim();
    const willing = body?.willing_events;

    if (!discord || discord.length > 64) return json({ error: "Discord username required." }, 400);
    if (!activity || activity.length < 3 || activity.length > 1000)
      return json({ error: "Tell us a little about your activity (3–1000 chars)." }, 400);
    if (willing !== null && willing !== undefined && typeof willing !== "boolean")
      return json({ error: "Invalid value for events question." }, 400);

    // Profile gives us the IGN
    const { data: profile } = await supabase
      .from("profiles").select("ign, mc_uuid").eq("id", user.id).maybeSingle();
    if (!profile?.ign) return json({ error: "Profile missing IGN." }, 400);

    // Rate-limit: max 1 submission per 24h per user
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recent } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since);
    if ((recent ?? 0) > 0) {
      return json({ error: "You can only apply once every 24 hours." }, 429);
    }

    const { data: inserted, error: insErr } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        ign: profile.ign,
        mc_uuid: profile.mc_uuid,
        discord_username: discord,
        activity,
        willing_events: willing ?? null,
      })
      .select("id, created_at")
      .single();

    if (insErr) {
      // unique partial index — already has a pending application
      if ((insErr as any).code === "23505") {
        return json({ error: "You already have a pending application." }, 409);
      }
      return json({ error: insErr.message }, 400);
    }

    // Discord webhook — server side only
    const webhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
    if (webhookUrl) {
      const siteUrl = req.headers.get("origin") ?? "https://quotegang.lovable.app";
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Quote Gang Recruitment",
            embeds: [{
              title: `📥 New application — ${profile.ign}`,
              url: `${siteUrl}/admin/applications`,
              color: 0x4ade80,
              thumbnail: { url: `https://mc-heads.net/avatar/${profile.ign}/128` },
              fields: [
                { name: "Minecraft IGN", value: profile.ign, inline: true },
                { name: "Discord", value: discord, inline: true },
                { name: "Willing for events", value: willing == null ? "—" : willing ? "Yes" : "No", inline: true },
                { name: "Activity", value: activity.slice(0, 1024) },
              ],
              footer: { text: `Review at ${siteUrl}/admin/applications` },
              timestamp: inserted.created_at,
            }],
          }),
        });
      } catch (e) {
        console.error("webhook error", e);
      }
    }

    return json({ ok: true, id: inserted.id });
  } catch (e) {
    console.error("submit-application error", e);
    return json({ error: "Server error." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
}
