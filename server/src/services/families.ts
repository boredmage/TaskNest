import { and, eq, inArray, sql } from "drizzle-orm";
import {
  db,
  families,
  familyInvites,
  familyJoinRequests,
  familyMembers,
  profiles,
  type DbOrTx,
  type Family,
} from "../db/index.ts";
import { badRequest, conflict, forbidden, notFound } from "../lib/errors.ts";
import { publish } from "../lib/realtime.ts";
import { randomInviteCode } from "../lib/tokens.ts";
import { markHandled, notify, removeByRef } from "./notifications.ts";
import { displayName } from "./profiles.ts";

// ---------------------------------------------------------------------------
// Membership helpers
// ---------------------------------------------------------------------------
async function membership(tx: DbOrTx, userId: string, familyId: string) {
  const [m] = await tx
    .select()
    .from(familyMembers)
    .where(and(eq(familyMembers.family_id, familyId), eq(familyMembers.user_id, userId)));
  return m ?? null;
}

export async function isMember(tx: DbOrTx, userId: string, familyId: string) {
  return (await membership(tx, userId, familyId)) !== null;
}

async function requireOwnerOrAdmin(tx: DbOrTx, userId: string, familyId: string) {
  const m = await membership(tx, userId, familyId);
  if (m?.role !== "owner" && m?.role !== "admin") {
    throw forbidden("Only a family owner or admin can do that");
  }
}

/** Everyone in the family, for live updates. */
export async function memberIds(tx: DbOrTx, familyId: string) {
  const rows = await tx
    .select({ user_id: familyMembers.user_id })
    .from(familyMembers)
    .where(eq(familyMembers.family_id, familyId));
  return rows.map((r) => r.user_id);
}

const familyChanged = async (tx: DbOrTx, familyId: string) =>
  publish(await memberIds(tx, familyId), { type: "family", action: "changed", family_id: familyId });

async function ownerAndAdminIds(tx: DbOrTx, familyId: string) {
  const rows = await tx
    .select({ user_id: familyMembers.user_id })
    .from(familyMembers)
    .where(and(eq(familyMembers.family_id, familyId), inArray(familyMembers.role, ["owner", "admin"])));
  return rows.map((r) => r.user_id);
}

/** The active family the user belongs to, or null. */
async function activeFamilyOf(tx: DbOrTx, userId: string): Promise<Family | null> {
  const [row] = await tx
    .select({ family: families })
    .from(familyMembers)
    .innerJoin(families, eq(families.id, familyMembers.family_id))
    .where(and(eq(familyMembers.user_id, userId), eq(families.is_archived, false)))
    .orderBy(familyMembers.joined_at)
    .limit(1);
  return row?.family ?? null;
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------
/** The user's family with its members (name + avatar resolved), or null. */
export async function getMyFamily(userId: string) {
  const family = await activeFamilyOf(db, userId);
  if (!family) return null;

  const members = await db
    .select({
      id: familyMembers.id,
      user_id: familyMembers.user_id,
      role: familyMembers.role,
      joined_at: familyMembers.joined_at,
      full_name: profiles.full_name,
      email: profiles.email,
      avatar_url: profiles.avatar_url,
    })
    .from(familyMembers)
    .innerJoin(profiles, eq(profiles.id, familyMembers.user_id))
    .where(eq(familyMembers.family_id, family.id))
    .orderBy(familyMembers.joined_at);

  return {
    ...family,
    members: members.map(({ full_name, email, ...m }) => ({
      ...m,
      name: full_name?.trim() || email.split("@")[0],
    })),
  };
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------
export function createFamily(userId: string) {
  return db.transaction(async (tx) => {
    if (await activeFamilyOf(tx, userId))
      throw conflict("You already belong to a family", "already_in_family");

    const [family] = await tx
      .insert(families)
      .values({ invite_code: await unusedInviteCode(tx), owner_id: userId })
      .returning();
    await tx.insert(familyMembers).values({ family_id: family!.id, user_id: userId, role: "owner" });
    await familyChanged(tx, family!.id);
    return family!;
  });
}

async function unusedInviteCode(tx: DbOrTx) {
  for (let i = 0; i < 5; i++) {
    const code = randomInviteCode();
    const [taken] = await tx.select({ id: families.id }).from(families).where(eq(families.invite_code, code));
    if (!taken) return code;
  }
  throw new Error("Could not allocate a unique invite code");
}

// ---------------------------------------------------------------------------
// Join requests: a user enters the family's invite code, owner/admins review
// ---------------------------------------------------------------------------
export function requestToJoin(userId: string, inviteCode: string) {
  return db.transaction(async (tx) => {
    const code = inviteCode.trim().toUpperCase();
    const [family] = await tx
      .select()
      .from(families)
      .where(and(eq(families.invite_code, code), eq(families.is_archived, false)));
    if (!family) throw notFound("No family found with that code", "invalid_code");
    if (await isMember(tx, userId, family.id))
      throw conflict("You are already a member of this family", "already_member");

    const [pending] = await tx
      .select({ id: familyJoinRequests.id })
      .from(familyJoinRequests)
      .where(
        and(
          eq(familyJoinRequests.family_id, family.id),
          eq(familyJoinRequests.user_id, userId),
          eq(familyJoinRequests.status, "pending")
        )
      );
    if (pending) throw conflict("You already have a pending request for this family", "request_pending");

    const [request] = await tx
      .insert(familyJoinRequests)
      .values({ family_id: family.id, user_id: userId })
      .returning();

    const name = await displayName(tx, userId);
    const reviewers = await ownerAndAdminIds(tx, family.id);
    await notify(
      tx,
      reviewers.map((user_id) => ({
        user_id,
        type: "join_request_received",
        title: "New join request",
        body: `${name} wants to join your family.`,
        data: { request_id: request!.id, family_id: family.id },
        initiator_id: userId,
      }))
    );
    return request!;
  });
}

async function pendingJoinRequest(tx: DbOrTx, id: string) {
  const [req] = await tx
    .select()
    .from(familyJoinRequests)
    .where(and(eq(familyJoinRequests.id, id), eq(familyJoinRequests.status, "pending")));
  if (!req) throw notFound("Join request not found or already processed");
  return req;
}

export function approveJoinRequest(reviewerId: string, requestId: string) {
  return db.transaction(async (tx) => {
    const req = await pendingJoinRequest(tx, requestId);
    await requireOwnerOrAdmin(tx, reviewerId, req.family_id);

    await tx
      .update(familyJoinRequests)
      .set({ status: "approved", reviewed_at: new Date(), reviewed_by: reviewerId })
      .where(eq(familyJoinRequests.id, req.id));
    await tx
      .insert(familyMembers)
      .values({ family_id: req.family_id, user_id: req.user_id })
      .onConflictDoNothing();
    await markHandled(tx, "join_request_received", { key: "request_id", id: req.id }, { approved: true });
    await familyChanged(tx, req.family_id);

    await notify(tx, [
      {
        user_id: req.user_id,
        type: "join_request_approved",
        title: "Request approved",
        body: `${await displayName(tx, reviewerId)} approved your request. Welcome to the family!`,
        data: { request_id: req.id, family_id: req.family_id },
        initiator_id: reviewerId,
      },
    ]);
  });
}

export function declineJoinRequest(reviewerId: string, requestId: string) {
  return db.transaction(async (tx) => {
    const req = await pendingJoinRequest(tx, requestId);
    await requireOwnerOrAdmin(tx, reviewerId, req.family_id);

    await tx
      .update(familyJoinRequests)
      .set({ status: "declined", reviewed_at: new Date(), reviewed_by: reviewerId })
      .where(eq(familyJoinRequests.id, req.id));
    await markHandled(tx, "join_request_received", { key: "request_id", id: req.id }, { declined: true });
  });
}

// ---------------------------------------------------------------------------
// Invites: the owner invites an existing user by email, the invitee responds
// ---------------------------------------------------------------------------
export function inviteByEmail(
  inviterId: string,
  { email, role }: { email: string; role: "admin" | "member" }
) {
  return db.transaction(async (tx) => {
    const family = await activeFamilyOf(tx, inviterId);
    if (family?.owner_id !== inviterId) throw forbidden("Only a family owner can invite members");

    const [invitee] = await tx
      .select({ id: profiles.id })
      .from(profiles)
      .where(sql`lower(${profiles.email}) = ${email.trim().toLowerCase()}`);
    if (!invitee) throw notFound("No TaskNest user found with that email", "user_not_found");
    if (invitee.id === inviterId) throw badRequest("self_invite", "You cannot invite yourself");
    if (await isMember(tx, invitee.id, family.id))
      throw conflict("This user is already a family member", "already_member");

    // Replace any earlier invite so a fresh one (and notification) goes out,
    // and drop the stale cards that pointed at the old invite.
    const old = await tx
      .delete(familyInvites)
      .where(and(eq(familyInvites.family_id, family.id), eq(familyInvites.user_id, invitee.id)))
      .returning({ id: familyInvites.id });
    await removeByRef(tx, "family_invite_received", { key: "invite_id", ids: old.map((o) => o.id) });
    const [invite] = await tx
      .insert(familyInvites)
      .values({ family_id: family.id, user_id: invitee.id, invited_by: inviterId, role })
      .returning();

    await notify(tx, [
      {
        user_id: invitee.id,
        type: "family_invite_received",
        title: "Family invitation",
        body: `${await displayName(tx, inviterId)} invited you to join their family.`,
        data: { invite_id: invite!.id, family_id: family.id },
        initiator_id: inviterId,
      },
    ]);
    return invite!;
  });
}

export function respondToInvite(userId: string, inviteId: string, accept: boolean) {
  return db.transaction(async (tx) => {
    const [invite] = await tx
      .select()
      .from(familyInvites)
      .where(and(eq(familyInvites.id, inviteId), eq(familyInvites.status, "pending")));
    if (!invite) throw notFound("Invite not found or already handled");
    if (invite.user_id !== userId) throw forbidden("This invite does not belong to you");

    await tx
      .update(familyInvites)
      .set({ status: accept ? "accepted" : "declined", responded_at: new Date() })
      .where(eq(familyInvites.id, invite.id));
    await markHandled(
      tx,
      "family_invite_received",
      { key: "invite_id", id: invite.id },
      { responded: true, accepted: accept }
    );

    if (!accept) return;

    await tx
      .insert(familyMembers)
      .values({ family_id: invite.family_id, user_id: userId, role: invite.role })
      .onConflictDoNothing();
    await familyChanged(tx, invite.family_id);

    const name = await displayName(tx, userId);
    const recipients = new Set([invite.invited_by, ...(await ownerAndAdminIds(tx, invite.family_id))]);
    recipients.delete(userId);
    await notify(
      tx,
      [...recipients].map((user_id) => ({
        user_id,
        type: "family_invite_accepted",
        title: "Invitation accepted",
        body: `${name} joined your family.`,
        data: { invite_id: invite.id, family_id: invite.family_id },
        initiator_id: userId,
      }))
    );
  });
}
