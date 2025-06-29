import { createRouteHandler } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { createClient } from '@/utils/supabase/server';
import { incrementFeatureUsage, canUseFeature, getFeatureLimit } from '@/utils/feature-limits';

import { ourFileRouter } from "./core";
const BUCKET = 'uploaded-files';
const FILE_PATH = 'uploadthing_files.json';

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});

export async function DELETE(req: NextRequest) {
  const { url, fileKey, user_id } = await req.json();
  if (!user_id || !fileKey || !url) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const key = url.split("/").pop(); // Extract fileKey from URL
  if (!key) return new Response("Invalid URL", { status: 400 });

  const utapi = new UTApi();
  await utapi.deleteFiles(key);

  
  const { data, error: dlErr } = await supabaseAdmin.storage.from(BUCKET).download(FILE_PATH);
  if (dlErr) {
    return NextResponse.json({ error: dlErr.message }, { status: 500 });
  }

  let all: any[] = [];
  try { all = JSON.parse(await data.text()); } catch { all = []; }

  const idx = all.findIndex(u => u.user_id === user_id);
  if (idx < 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const files = all[idx].files.filter((f: any) => f.key !== fileKey);
  all[idx].files = files;

  const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
  const { error: upErr } = await supabaseAdmin.storage.from(BUCKET).upload(FILE_PATH, blob, { upsert: true });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json(({ success: true }), { status: 200 });
}