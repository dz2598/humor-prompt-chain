import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://erivhrwjfmjhcehbmmgd.supabase.co";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_fRTUQdW18IeUK-dS1g2Z6A_2KSV2o7B";

export function createClient() {
    return createBrowserClient(
        supabaseUrl,
        supabasePublishableKey
    );
}
