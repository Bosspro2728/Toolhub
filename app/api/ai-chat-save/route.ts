import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

const BUCKET = "ai-chat";
const FILE_PATH = "ai-chats.json";

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
  return NextResponse.json({ conversations: user ? user.conversations : [] });
}

// POST: Append or update a conversation
export async function POST(req: NextRequest) {
  const { user_id, user_email, conversation } = await req.json();
  if (!user_id || !user_email || !conversation) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error: dlErr } = await supabaseAdmin.storage.from(BUCKET).download(FILE_PATH);
  let all: any[] = [];
  if (data) {
    try { all = JSON.parse(await data.text()); } catch {}
  } else if (dlErr) {
    return NextResponse.json({ error: dlErr.message }, { status: 500 });
  }

  const idx = all.findIndex(u => u.user_id === user_id);
  if (idx > -1) all[idx].conversations.push(conversation);
  else all.push({ user_id, user_email, conversations: [conversation] });

  const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
  const { error: upErr } = await supabaseAdmin.storage.from(BUCKET).upload(FILE_PATH, blob, { upsert: true });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ success: true }, { status: 201 });
}

// DELETE: Delete a single conversation from user
export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const user_id = searchParams.get('user_id');
  const conversation_id = searchParams.get('conversation_id');
  if (!user_id || !conversation_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  console.log("Fields", user_id, conversation_id)
  const { data, error: dlErr } = await supabaseAdmin.storage.from(BUCKET).download(FILE_PATH);
  if (dlErr) {
    console.log(dlErr)
    return NextResponse.json({ error: dlErr.message }, { status: 500 });
  }

  let all: any[] = [];
  try { all = JSON.parse(await data.text()); } catch { all = []; }

  const idx = all.findIndex(u => u.user_id === user_id);
  if (idx < 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const convs = all[idx].conversations.filter((c: any) => c.id !== conversation_id);
  all[idx].conversations = convs;

  const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
  const { error: upErr } = await supabaseAdmin.storage.from(BUCKET).upload(FILE_PATH, blob, { upsert: true });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
