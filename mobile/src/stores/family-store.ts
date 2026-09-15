import { api, errorMessage, getUser } from "@/lib/api";
import { create } from "zustand";

/** Matches family_members.role in DB. */
export type FamilyMemberRole = "owner" | "admin" | "member";

/** How a role reads in the UI (Figma 205:6382): owner, can edit, can view. */
export const ROLE_LABELS: Record<FamilyMemberRole, string> = {
  owner: "owner",
  admin: "can edit",
  member: "can view",
};

export const roleLabel = (role: FamilyMemberRole) => ROLE_LABELS[role] ?? role;

export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  role: FamilyMemberRole;
  avatar_url: string | null;
  joined_at?: string;
}

export interface Family {
  id: string;
  invite_code: string;
  members: FamilyMember[];
  owner_id: string;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

interface FamilyStore {
  family: Family | null;
  familyId: string | null;
  inviteCode: string | null;
  members: FamilyMember[];
  loading: boolean;
  error: string | null;

  /** `silent` refreshes without flipping `loading` (no spinner flash). */
  fetchFamily: (opts?: { silent?: boolean }) => Promise<void>;
  clearFamily: () => void;
}

export const useFamilyStore = create<FamilyStore>((set) => ({
  family: null,
  familyId: null,
  inviteCode: null,
  members: [],
  loading: false,
  error: null,

  fetchFamily: async (opts) => {
    if (!opts?.silent) set({ loading: true, error: null });
    try {
      if (!getUser()) {
        set({ loading: false, error: "User not authenticated" });
        return;
      }

      // The server resolves "the family I own or belong to" plus its members
      // (with names/avatars) in one call.
      const family = await api.get<Family | null>("/families/me");

      if (!family) {
        set({
          family: null,
          familyId: null,
          inviteCode: null,
          members: [],
          loading: false,
          error: null,
        });
        return;
      }

      set({
        family,
        familyId: family.id,
        inviteCode: family.invite_code,
        members: family.members,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      set({
        loading: false,
        error: errorMessage(err, "Failed to fetch family"),
      });
    }
  },

  clearFamily: () => {
    set({
      family: null,
      familyId: null,
      inviteCode: null,
      members: [],
      error: null,
    });
  },
}));
