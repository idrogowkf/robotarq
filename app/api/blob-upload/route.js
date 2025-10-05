// app/api/blob-upload/route.js
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN no definido en el entorno" },
        { status: 500 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    const originalName =
      form.get("filename") || (file && file.name) || `upload-${Date.now()}`;

    if (!file || typeof file !== "object") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const blob = await put(`uploads/${Date.now()}-${originalName}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true,
      contentType: file.type || "application/octet-stream",
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: `Blob upload failed: ${String(err)}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST multipart/form-data" },
    { status: 405 }
  );
}
