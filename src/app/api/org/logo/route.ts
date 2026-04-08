import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensurePermission } from "@/lib/api-utils";
import { writeFile, mkdir, readdir, unlink } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const auth = await ensurePermission("change_settings");
  if (!auth.authorized || !auth.context) return auth.response!;

  const { orgId } = auth.context;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "NO_FILE", message: "No file provided" },
        { status: 400 }
      );
    }

    // Validation: Max 2MB, image types only
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "FILE_TOO_LARGE", message: "File size exceeds 2MB limit" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "INVALID_FILE_TYPE", message: "Only image files are allowed" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Prepare directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", orgId);
    await mkdir(uploadDir, { recursive: true });

    // --- Cleanup: Delete old logo files to keep space clean ---
    try {
      const files = await readdir(uploadDir);
      for (const f of files) {
        if (f.startsWith("logo")) {
          await unlink(path.join(uploadDir, f));
        }
      }
    } catch {
      // Ignore if dir is empty or doesn't exist yet
    }

    // Filename: logo.[extension]
    const ext = path.extname(file.name) || ".png";
    const fileName = `logo${ext}`;
    const filePath = path.join(uploadDir, fileName);

    // Save to disk
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${orgId}/${fileName}`;

    // Update database
    await prisma.organisation.update({
      where: { id: orgId },
      data: { logoUrl: publicUrl },
    });

    return NextResponse.json({
      message: "Logo uploaded successfully",
      logoUrl: publicUrl,
    });
  } catch (error) {
    console.error("Error uploading logo:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
