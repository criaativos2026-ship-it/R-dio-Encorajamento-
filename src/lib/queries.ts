import "server-only";
import { and, asc, count, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  activities,
  assignments,
  checklistItems,
  checks,
  notices,
  problems,
  services,
  users,
  type ChecklistKind,
} from "@/db/schema";
import { alias } from "drizzle-orm/pg-core";

/** Culto em andamento: o mais recente ainda não encerrado. */
export async function getActiveService() {
  const [service] = await db
    .select()
    .from(services)
    .where(isNull(services.closedAt))
    .orderBy(desc(services.date), desc(services.createdAt))
    .limit(1);
  return service ?? null;
}

export async function getChecklist(kind: ChecklistKind, serviceId: string | null) {
  const items = await db
    .select()
    .from(checklistItems)
    .where(and(eq(checklistItems.kind, kind), eq(checklistItems.active, true)))
    .orderBy(asc(checklistItems.position));

  const done = serviceId
    ? await db
        .select({ itemId: checks.itemId, checkedAt: checks.checkedAt, userName: users.name })
        .from(checks)
        .innerJoin(users, eq(users.id, checks.userId))
        .where(eq(checks.serviceId, serviceId))
    : [];
  const byItem = new Map(done.map((d) => [d.itemId, d]));

  const groups: { name: string; items: { id: string; label: string; done: { by: string; at: Date } | null }[] }[] = [];
  for (const item of items) {
    let group = groups.find((g) => g.name === item.group);
    if (!group) groups.push((group = { name: item.group, items: [] }));
    const d = byItem.get(item.id);
    group.items.push({ id: item.id, label: item.label, done: d ? { by: d.userName, at: d.checkedAt } : null });
  }
  const total = items.length;
  const completed = items.filter((i) => byItem.has(i.id)).length;
  return { groups, total, completed, pct: total ? Math.round((completed / total) * 100) : 0 };
}

export async function getProgress(kind: ChecklistKind, serviceId: string | null) {
  const { total, completed, pct, groups } = await getChecklist(kind, serviceId);
  const pendingGroups = groups.filter((g) => g.items.some((i) => !i.done)).map((g) => g.name);
  const doneGroups = groups.filter((g) => g.items.every((i) => i.done)).map((g) => g.name);
  return { total, completed, pct, pendingGroups, doneGroups };
}

const resolver = alias(users, "resolver");

export async function getProblems({ onlyOpen = false, limit = 100 } = {}) {
  return db
    .select({
      id: problems.id,
      title: problems.title,
      description: problems.description,
      severity: problems.severity,
      status: problems.status,
      createdAt: problems.createdAt,
      resolvedAt: problems.resolvedAt,
      resolutionNote: problems.resolutionNote,
      author: users.name,
      resolver: resolver.name,
    })
    .from(problems)
    .innerJoin(users, eq(users.id, problems.createdBy))
    .leftJoin(resolver, eq(resolver.id, problems.resolvedBy))
    .where(onlyOpen ? eq(problems.status, "aberto") : undefined)
    .orderBy(asc(problems.status), desc(problems.createdAt))
    .limit(limit);
}

export async function countOpenProblems() {
  const [row] = await db.select({ n: count() }).from(problems).where(eq(problems.status, "aberto"));
  return row?.n ?? 0;
}

export async function getNotices(limit = 50) {
  return db
    .select({
      id: notices.id,
      title: notices.title,
      body: notices.body,
      pinned: notices.pinned,
      createdAt: notices.createdAt,
      author: users.name,
    })
    .from(notices)
    .innerJoin(users, eq(users.id, notices.createdBy))
    .orderBy(desc(notices.pinned), desc(notices.createdAt))
    .limit(limit);
}

export async function getActivities(limit = 50) {
  return db
    .select({
      id: activities.id,
      type: activities.type,
      message: activities.message,
      createdAt: activities.createdAt,
      user: users.name,
    })
    .from(activities)
    .leftJoin(users, eq(users.id, activities.userId))
    .orderBy(desc(activities.createdAt))
    .limit(limit);
}

export async function getRoster(serviceId: string) {
  return db
    .select({ userId: users.id, name: users.name, function: assignments.function })
    .from(assignments)
    .innerJoin(users, eq(users.id, assignments.userId))
    .where(eq(assignments.serviceId, serviceId))
    .orderBy(asc(assignments.createdAt));
}

export async function countUsers() {
  const [row] = await db.select({ n: count() }).from(users);
  return row?.n ?? 0;
}
