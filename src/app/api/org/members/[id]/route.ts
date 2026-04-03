import { NextRequest, NextResponse } from "next/server";
import { ensurePermission } from "@/lib/api-utils";

/**
 * DELETE /api/org/members/[id]
 * Demonstration route for RBAC enforcement.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { authorized, context, response } =
    await ensurePermission("remove_member");

  if (!authorized) {
    return response;
  }

  // Demonstration: In a real app, we would:
  // 1. Check if the member exists in the user's organization
  // 2. Delete the record
  // 3. Return success

  console.log(
    `[RBAC DEMO] User ${context!.userId} (Role: ${context!.role}) is removing member ${id}`
  );

  return NextResponse.json({
    success: true,
    message: `Member ${id} removed successfully by ${context!.role}.`,
  });
}
