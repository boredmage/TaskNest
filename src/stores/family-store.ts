import { supabase } from "@/lib/supabase";
import { create } from "zustand";

/** Matches family_members.role in DB. Use for display: owner → "owner", admin/member → "can edit" */
export type FamilyMemberRole = "owner" | "admin" | "member";

export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  role: FamilyMemberRole;
  avatar_url: string | null;
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

type FamilyRow = {
  id: string;
  invite_code: string;
  owner_id: string;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

type FamilyMemberRow = {
  id: string;
  user_id: string;
  role: FamilyMemberRole;
};

interface FamilyStore {
  family: Family | null;
  familyId: string | null;
  inviteCode: string | null;
  members: FamilyMember[];
  loading: boolean;
  error: string | null;

  fetchFamily: () => Promise<void>;
  clearFamily: () => void;
}

export const useFamilyStore = create<FamilyStore>((set) => ({
  family: null,
  familyId: null,
  inviteCode: null,
  members: [],
  loading: false,
  error: null,

  fetchFamily: async () => {
    set({ loading: true, error: null });
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        set({ loading: false, error: "User not authenticated" });
        return;
      }

      // Find family: as owner or as member
      const { data: ownedFamily } = await supabase
        .from("families")
        .select("id")
        .eq("owner_id", currentUser.id)
        .limit(1)
        .maybeSingle();

      const { data: membership } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", currentUser.id)
        .limit(1)
        .maybeSingle();

      const familyId = ownedFamily?.id ?? membership?.family_id ?? null;

      if (!familyId) {
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

      const { data: familyRow, error: familyError } = await supabase
        .from("families")
        .select("*")
        .eq("id", familyId)
        .single();

      if (familyError || !familyRow) {
        set({
          loading: false,
          error: familyError?.message ?? "Family not found",
        });
        return;
      }

      const { data: memberRows, error: membersError } = await supabase
        .from("family_members")
        .select("id, user_id, role")
        .eq("family_id", familyId);

      if (membersError) {
        set({ loading: false, error: membersError.message });
        return;
      }

      const userIds = (memberRows ?? []).map(
        (row: FamilyMemberRow) => row.user_id
      );
      const profileById = new Map<
        string,
        { full_name: string | null; avatar_url: string | null }
      >();

      if (userIds.length > 0) {
        const { data: profileRows } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);

        (profileRows ?? []).forEach(
          (p: {
            id: string;
            full_name: string | null;
            avatar_url: string | null;
          }) => {
            profileById.set(p.id, {
              full_name: p.full_name,
              avatar_url: p.avatar_url,
            });
          }
        );
      }

      const members: FamilyMember[] = (memberRows ?? []).map(
        (row: FamilyMemberRow) => {
          const prof = profileById.get(row.user_id);
          return {
            id: row.id,
            user_id: row.user_id,
            name: prof?.full_name ?? "Unknown",
            role: row.role,
            avatar_url: prof?.avatar_url ?? null,
          };
        }
      );

      const family: Family = {
        id: (familyRow as FamilyRow).id,
        invite_code: (familyRow as FamilyRow).invite_code,
        owner_id: (familyRow as FamilyRow).owner_id,
        is_archived: (familyRow as FamilyRow).is_archived,
        archived_at: (familyRow as FamilyRow).archived_at,
        created_at: (familyRow as FamilyRow).created_at,
        updated_at: (familyRow as FamilyRow).updated_at,
        members,
      };

      set({
        family,
        familyId: family.id,
        inviteCode: family.invite_code,
        members: family.members,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch family";
      set({ loading: false, error: message });
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
