import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

const BUCKET = 'uploaded-files';
const FILE_PATH = 'uploadthing_files.json';

// GET: Return only the current user's conversations
export async function GET(req: NextRequest) {
  const user_id = req.nextUrl.searchParams.get("user_id");
  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  const { data, error: dlErr } = await supabaseAdmin.storage.from(BUCKET).download(FILE_PATH);
  if (dlErr) {
    return NextResponse.json({ error: dlErr.message }, { status: 500 });
  }

  let all: any[] = [];
  if (data) {
    try {
      all = JSON.parse(await data.text());
    } catch {
      all = [];
    }
  }

  const user = all.find(u => u.user_id === user_id);
  return NextResponse.json({ files: user ? user.files : [] });
}