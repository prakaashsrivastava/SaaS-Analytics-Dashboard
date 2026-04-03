import { NextResponse } from "next/server";
import { getTenantContext } from "./tenant";
import { canDo } from "./permissions";

/**
 * ensurePermission checks if the authenticated user has the required permission.
 * If unauthorized, it returns a 403 Forbidden response.
 * If authorized, it returns the tenant context for further use.
 */
export async function ensurePermission(action: string) {
  try {
    const context = await getTenantContext();

    if (!canDo(context.role, action)) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            error: "FORBIDDEN",
            message: "You do not have permission to perform this action.",
          },
          { status: 403 }
        ),
      };
    }

    return { authorized: true, context };
  } catch {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "You must be logged in to perform this action.",
        },
        { status: 401 }
      ),
    };
  }
}
