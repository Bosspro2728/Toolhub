// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { canUseFeature, getFeatureLimit, incrementFeatureUsage } from '@/utils/feature-limits';

const f = createUploadthing();
const BUCKET = 'uploaded-files';
const FILE_PATH = 'uploadthing_files.json';

export const ourFileRouter = {
  fileUploader: f({
    blob: { maxFileSize: "128MB", maxFileCount: 3 }
  } as const) // cast to satisfied FileRouterInputConfig
    .middleware(async ({ req }) => {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new UploadThingError("Unauthorized");

      // Check storage limit
      const hasAccess = await canUseFeature('file_conversion');
      if (!hasAccess) {
        throw new UploadThingError("Daily upload limit reached. Please upgrade your plan for more uploads.");
      }

      // Check storage limit
      const storageLimit = await getFeatureLimit('storage_limit_mb');
      if (typeof storageLimit !== 'number') {
        throw new UploadThingError("Failed to get storage limit");
      }

      // Get current storage usage
      const { data, error: dlErr } = await supabaseAdmin.storage.from(BUCKET).download(FILE_PATH);
      let currentUsageMB = 0;
      
      if (data) {
        try {
          const all = JSON.parse(await data.text());
          const userFiles = all.find((u: any) => u.user_id === user.id)?.files || [];
          currentUsageMB = userFiles.reduce((total: number, file: any) => total + (file.size || 0), 0);
        } catch (err) {
          console.error("Error parsing storage data:", err);
        }
      }

      // Check if upload would exceed storage limit
      if (currentUsageMB >= storageLimit) {
        throw new UploadThingError(`Storage limit of ${storageLimit}MB reached. Please upgrade your plan or delete some files.`);
      }

      return { userId: user.id, userEmail: user.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const type = file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("video")
        ? "video"
        : file.type.startsWith("audio")
        ? "audio"
        : "document";
      const new_file = {
        key: file.key,
        url: file.ufsUrl,
        name: file.name,
        size: file.size / (1024 * 1024),
        sizeMB: `${(file.size / (1024 * 1024)).toFixed(2)} MB`, // convert bytes to MB
        type: type,
        date: file.lastModified
            ? new Date(file.lastModified).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
      }
      const user_id = metadata.userId;
      const user_email = metadata.userEmail;

      const { data, error: dlErr } = await supabaseAdmin.storage.from(BUCKET).download(FILE_PATH);
      let all: any[] = [];
      if (data) {
        try { all = JSON.parse(await data.text()); } catch {}
      } else if (dlErr) {
        throw new UploadThingError(`error: ${ dlErr.message }, status: ${ 500 }`);
      }
    
      const idx = all.findIndex(u => u.user_id === user_id);
      if (idx > -1) all[idx].files.push(new_file);
      else all.push({ user_id, user_email, files: [new_file] });
    
      const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
      const { error: upErr } = await supabaseAdmin.storage.from(BUCKET).upload(FILE_PATH, blob, { upsert: true });
      if (upErr) throw new UploadThingError(`error: ${ upErr.message }, status: ${ 500 }`);

      // Increment usage after successful upload
      await incrementFeatureUsage('file_conversion');

      console.log("Upload complete for", metadata.userId, "file:", file, "URL:", file.ufsUrl);
      return { key: file.key, ufsUrl: file.ufsUrl, name: file.name, size: file.size, type: file.type, lastModified: file.lastModified };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;