// app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

const BUCKET = 'messages';
const FILE_PATH = 'contact_messages.json';


export async function POST(req: Request) {
  const { firstName,lastName,email,subject,message } = await req.json();

  if (!email || !message) {
    return NextResponse.json({ error: 'Email and message required' }, { status: 400 });
  }

  // 1) Download existing file (if any)
  const { data, error: downloadError } = await supabaseAdmin
    .storage
    .from(BUCKET)
    .download(FILE_PATH);

  let messages: Array<{ email: string; firstName: string; lastName: string; message: string; timestamp: string; subject: string }> = [];

  if (data) {
    try {
      const text = await data.text();
      messages = JSON.parse(text);
      console.log('messages:', messages);
    } catch {
      messages = [];
    }
  } else if (downloadError) {
    console.error('Download error:', downloadError);
    return NextResponse.json({ error: downloadError.message }, { status: 500 });
  }

  // 2) Append new message
  const newEntry = { email, firstName, lastName, subject, message, timestamp: new Date().toISOString() };
  messages.push(newEntry);
  console.log('New message entry:', newEntry);
  // 3) Upload back (upsert true will overwrite)
  const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
  const { error: uploadError } = await supabaseAdmin
    .storage
    .from(BUCKET)
    .upload(FILE_PATH, blob, { upsert: true });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  return NextResponse.json(newEntry, { status: 201 });
}

