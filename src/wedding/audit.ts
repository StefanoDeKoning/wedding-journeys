import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "guest.added"
  | "guest.updated"
  | "guest.removed"
  | "guest.group_assigned"
  | "group.created"
  | "group.updated"
  | "group.removed"
  | "rsvp.updated"
  | "timeline.added"
  | "timeline.updated"
  | "timeline.removed"
  | "table.created"
  | "table.updated"
  | "table.removed"
  | "seat.assigned"
  | "seat.unassigned"
  | "photo.approved"
  | "photo.hidden"
  | "photo.deleted"
  | "wedding.updated";

export interface LogAuditInput {
  weddingId: string;
  action: AuditAction;
  targetType?: string;
  targetId?: string | null;
  details?: Record<string, unknown>;
  actorLabel?: string | null;
}

/**
 * Append an audit log entry. Failures are logged but never thrown — auditing
 * must never block the actual admin action.
 */
export async function logAudit(input: LogAuditInput): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const actorLabel =
      input.actorLabel ??
      (user?.user_metadata?.full_name as string | undefined) ??
      user?.email ??
      null;

    const { error } = await supabase.from("audit_log").insert({
      wedding_id: input.weddingId,
      actor_user_id: user?.id ?? null,
      actor_label: actorLabel,
      action: input.action,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      details: input.details ?? {},
    });
    if (error) console.warn("[audit] insert failed:", error.message);
  } catch (err) {
    console.warn("[audit] unexpected:", err);
  }
}

export function describeAction(a: string): string {
  switch (a) {
    case "guest.added": return "added a guest";
    case "guest.updated": return "edited a guest";
    case "guest.removed": return "removed a guest";
    case "guest.group_assigned": return "assigned a guest to a group";
    case "group.created": return "created a group";
    case "group.updated": return "renamed a group";
    case "group.removed": return "removed a group";
    case "rsvp.updated": return "updated an RSVP";
    case "timeline.added": return "added a timeline event";
    case "timeline.updated": return "edited a timeline event";
    case "timeline.removed": return "removed a timeline event";
    case "table.created": return "created a table";
    case "table.updated": return "edited a table";
    case "table.removed": return "removed a table";
    case "seat.assigned": return "seated a guest";
    case "seat.unassigned": return "unseated a guest";
    case "photo.approved": return "approved a photo";
    case "photo.hidden": return "hid a photo";
    case "photo.deleted": return "deleted a photo";
    case "wedding.updated": return "updated wedding settings";
    default: return a;
  }
}
