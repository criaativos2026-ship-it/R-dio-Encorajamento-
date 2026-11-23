import "server-only";
import { db } from "@/db";
import { activities, type ActivityType } from "@/db/schema";

export async function logActivity(type: ActivityType, message: string, userId: string | null, serviceId?: string | null) {
  await db.insert(activities).values({ type, message: message.slice(0, 240), userId, serviceId: serviceId ?? null });
}
