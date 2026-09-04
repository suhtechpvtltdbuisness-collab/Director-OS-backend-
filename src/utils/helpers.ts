import { Activity } from "../models/Activity";
import type { AuthRequest } from "../middleware/authenticate";

export async function logActivity(
  req: AuthRequest,
  action: string,
  area: string,
): Promise<void> {
  const actor = req.user?.name || req.user?.email || "System";
  await Activity.create({
    id: "ac" + Date.now() + Math.floor(Math.random() * 1000),
    time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    actor,
    action,
    area,
  });
}

function stripMeta(obj: Record<string, unknown>): Record<string, unknown> {
  const { _id: _a, __v: _b, createdAt: _c, updatedAt: _d, ...rest } = obj;
  return rest;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function leanList(docs: any[]): Record<string, unknown>[] {
  return docs.map((d) => stripMeta(typeof d.toObject === "function" ? d.toObject() : { ...d }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function leanOne(doc: any | null): Record<string, unknown> | null {
  if (!doc) return null;
  return stripMeta(typeof doc.toObject === "function" ? doc.toObject() : { ...doc });
}
