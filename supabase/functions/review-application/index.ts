// Admin reviews an application: changes status (accepted/rejected), saves an
// optional reviewer message, and posts a follow-up Discord webhook.
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

    // Verify admin role server-side
    const { data: roleRow } = await supabase
      .from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) return json({ error: "Admins only." }, 403);

    const body = await req.json();
    const id = String(body?.id ?? "");
    const status = body?.status;
    const message = typeof body?.message === "string" ? body.message.slice(0, 1000) : null;

    if (!id) return json({ error: "Missing id." }, 400);
    if (status !== "accepted" && status !== "rejected") {
      return json({ error: "Invalid status." }, 400);
    }

    const { data: updated, error: updErr } = await supabase
      .from("applications")
      .update({
        status,
        reviewer_message: message,
        reviewed_by: userData.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "pending")
      .select("ign, discord_username")
      .single();

    if (updErr || !updated) return json({ error: updErr?.message ?? "Application not found." }, 404);

    const webhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
    if (webhookUrl) {
      const siteUrl = req.headers.get("origin") ?? "https://quotegang.lovable.app";
      const accepted = status === "accepted";
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Quote Gang Recruitment",
            embeds: [{
              title: `${accepted ? "✅ Accepted" : "❌ Rejected"} — ${updated.ign}`,
              url: `${siteUrl}/admin/applications`,
              color: accepted ? 0x22c55e : 0xef4444,
              thumbnail: { url: `https://mc-heads.net/avatar/${updated.ign}/128` },
              fields: [
                { name: "IGN", value: updated.ign, inline: true },
                { name: "Discord", value: updated.discord_username, inline: true },
                ...(message ? [{ name: "Message", value: message }] : []),
              ],
              footer: { text: `Reviewed at ${siteUrl}/admin/applications` },
              timestamp: new Date().toISOString(),
            }],
          }),
        });
      } catch (e) { console.error("webhook error", e); }
    }

    return json({ ok: true });
  } catch (e) {
    console.error("review-application error", e);
    return json({ error: "Server error." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
}
