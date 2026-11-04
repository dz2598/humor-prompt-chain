import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_superadmin, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_superadmin) redirect("/unauthorized");

  return { supabase, user, profile };
}
