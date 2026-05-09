// Signup edge function: validates IGN against Mojang, creates the auth user
// with the service role, and grants admin role when the special admin
// credentials are used. Keeps all sensitive checks off the client.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function ignToEmail(ign: string) {
  return `${ign.toLowerCase().trim()}@quotegang.local`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { ign, passcode } = await req.json();

    if (typeof ign !== "string" || !/^[A-Za-z0-9_]{3,16}$/.test(ign)) {
      return json({ error: "Invalid Minecraft username." }, 400);
    }
    if (typeof passcode !== "string" || passcode.length < 8 || passcode.length > 128) {
      return json({ error: "Passcode must be at least 8 characters." }, 400);
    }

    const isAdminSignup = ign.toLowerCase() === "admin";

    let mcUuid: string | null = null;

    if (isAdminSignup) {
      // Admin must match the configured passcode
      const expected = Deno.env.get("ADMIN_PASSCODE");
      if (!expected || passcode !== expected) {
        return json({ error: "Invalid Minecraft username." }, 400);
      }
    } else {
      // Validate the IGN against Mojang
      const mres = await fetch(
        `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(ign)}`,
        { headers: { "User-Agent": "TheQuoteGang-Site/1.0" } },
      );
      if (mres.status !== 200) {
        return json({ error: "That Minecraft username doesn't exist." }, 400);
      }
      const mdata = await mres.json();
      mcUuid = mdata.id ?? null;
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: ignToEmail(ign),
      password: passcode,
      email_confirm: true,
      user_metadata: { ign, mc_uuid: mcUuid },
    });

    if (createErr || !created.user) {
      const msg = (createErr?.message ?? "").toLowerCase();
      if (msg.includes("registered") || msg.includes("exists") || msg.includes("duplicate")) {
        return json({ error: "That username is already taken." }, 409);
      }
      return json({ error: createErr?.message ?? "Could not create account." }, 400);
    }

    if (isAdminSignup) {
      await supabase.from("user_roles").insert({ user_id: created.user.id, role: "admin" });
    }

    return json({ ok: true });
  } catch (e) {
    console.error("signup error", e);
    return json({ error: "Server error." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
