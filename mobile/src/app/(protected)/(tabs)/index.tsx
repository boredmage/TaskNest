import { tabFile } from "@/assets/icons";
import { TriggerNewFamilyBottomSheet } from "@/components/bottom-sheet/trigger-new-family-bottom-sheet";
import CategoryCard from "@/components/category-card";
import { CheckmarkLoader } from "@/components/checkmark-loader";
import { FamilyCreatedSuccessDialog } from "@/components/dialog/family-created-success";
import { WelcomeAboardDialog } from "@/components/dialog/welcome-aboard-dialog";
import { EmptyState } from "@/components/empty-state";
import { FilterChip, FilterKey } from "@/components/filter-chip";
import { TabHeader } from "@/components/header";
import SettingsOutline from "@/components/icons/settings-outline";
import PremiumActivityCard from "@/components/premium-activity-card";
import { RefreshableFlatList } from "@/components/refreshable-flat-list";
import { SearchField } from "@/components/search-field";
import { SvgIcon } from "@/components/svg-icon";
import { useAppTheme } from "@/contexts/app-theme-context";
import { CATEGORIES } from "@/lib/categories";
import { useFamilyStore } from "@/stores/family-store";
import { useProfileStore } from "@/stores/profile-store";
import {
  assigneeAvatarUris,
  assigneeNames,
  todoStatusToEnum,
  useTodosStore,
} from "@/stores/todos-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyTasks } from "./tasks";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "todo", label: "To Do" },
  { key: "completed", label: "Completed" },
  { key: "overdue", label: "Overdue" },
];

/** Per user + family, so the welcome card shows once per family joined. */
const WELCOMED_KEY = "tasknest.welcomed";

const Family = () => {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("todo");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const {
    family,
    loading: familyLoading,
    members,
    fetchFamily,
  } = useFamilyStore();
  const myId = useProfileStore((s) => s.profile?.id);
  const { todos, loading: todosLoading, fetchTodos } = useTodosStore();
  const [familyCreatedDialogOpen, setFamilyCreatedDialogOpen] = useState(false);
  const [createdFamilyCode, setCreatedFamilyCode] = useState<string | null>(
    null
  );
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  const familyTodos = useMemo(
    () => todos.filter((item) => item.scope === "family"),
    [todos]
  );

  // Open (to do / overdue) tasks per category; uncategorised counts as "other".
  const openCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of familyTodos) {
      if (item.status !== "in_progress" && item.status !== "overdue") continue;
      const key = item.category ?? "other";
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [familyTodos]);

  const activities = useMemo(() => {
    const byCategory = activeCategory
      ? familyTodos.filter(
          (item) => (item.category ?? "other") === activeCategory
        )
      : familyTodos;
    switch (activeFilter) {
      case "todo":
        return byCategory.filter((item) => item.status === "in_progress");
      case "completed":
        return byCategory.filter((item) => item.status === "completed");
      case "overdue":
        return byCategory.filter((item) => item.status === "overdue");
      default:
        return byCategory.filter((item) => item.status !== "archived");
    }
  }, [familyTodos, activeFilter, activeCategory]);

  const toggleCategory = (id: string) =>
    setActiveCategory((current) => (current === id ? null : id));

  // Someone who asked to join only finds out they were approved on the next
  // fetch, so re-check quietly whenever the tab is opened without a family.
  useFocusEffect(
    useCallback(() => {
      if (!family) fetchFamily({ silent: true });
    }, [family])
  );

  // First time a member (not the owner) sees their family: "Welcome aboard!"
  useEffect(() => {
    if (!family || !myId || family.owner_id === myId) return;
    const key = `${WELCOMED_KEY}:${family.id}:${myId}`;
    AsyncStorage.getItem(key).then((seen) => {
      if (seen) return;
      AsyncStorage.setItem(key, "1");
      setWelcomeOpen(true);
    });
  }, [family?.id, myId]);

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: isDark ? "#222222" : "#F2F2F2" }}
    >
      <TabHeader
        title={t("tabs.family")}
        right={<SettingsOutline width={28} height={28} />}
        onRightPress={() => router.push("/settings/family")}
        rightHidden={!family}
      />
      <View className="flex-1 gap-3 px-4 pt-3">
        <SearchField />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-4"
          className="-mx-4 shrink-0 grow-0"
        >
          {CATEGORIES.map(({ id, label, Icon, tint }) => (
            <CategoryCard
              key={id}
              title={label}
              count={openCounts[id] ?? 0}
              iconBackground={tint}
              icon={<Icon width={16} height={16} />}
              selected={activeCategory === id}
              onPress={() => toggleCategory(id)}
            />
          ))}
          <CategoryCard
            title="Other"
            count={openCounts.other ?? 0}
            iconBackground={
              isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"
            }
            icon={<SvgIcon art={tabFile} size={14} color="#A0A0A0" />}
            selected={activeCategory === "other"}
            onPress={() => toggleCategory("other")}
          />
        </ScrollView>

        {familyLoading && !family ? (
          <View className="mb-24 flex-1 items-center justify-center">
            <CheckmarkLoader size={48} />
          </View>
        ) : family ? (
          <RefreshableFlatList
            data={activities}
            renderItem={({ item }) => (
              <PremiumActivityCard
                title={item.title}
                description={item.description ?? undefined}
                dueDate={item.due_date ?? undefined}
                status={todoStatusToEnum(item.status)}
                assignedAvatarUris={assigneeAvatarUris(
                  item.assignee_ids,
                  members
                )}
                assignedNames={assigneeNames(item.assignee_ids, members)}
                onPress={() =>
                  router.push({
                    pathname: "/task/[id]",
                    params: { id: item.id },
                  })
                }
              />
            )}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshing={todosLoading}
            onRefresh={fetchTodos}
            contentContainerClassName="gap-2 grow pb-32"
            ListEmptyComponent={<EmptyTasks />}
            ListHeaderComponent={
              <View className="gap-2 pb-1">
                <View className="justify-center">
                  <Text className="text-text-day dark:text-text-night text-xl font-semibold">
                    Tasks
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-2 px-4"
                  className="-mx-4"
                >
                  {FILTERS.map(({ key, label }) => (
                    <FilterChip
                      key={key}
                      label={label}
                      active={activeFilter === key}
                      onPress={() => setActiveFilter(key)}
                    />
                  ))}
                </ScrollView>
              </View>
            }
          />
        ) : (
          <View className="mb-24 flex-1">
            <EmptyState
              title="🏡 No Family Yet"
              body="To get started, create your own or join an existing one using a family code."
              actionNode={
                <TriggerNewFamilyBottomSheet
                  onFamilyCreated={(inviteCode) => {
                    setCreatedFamilyCode(inviteCode);
                    setFamilyCreatedDialogOpen(true);
                  }}
                />
              }
            />
          </View>
        )}

        <FamilyCreatedSuccessDialog
          open={familyCreatedDialogOpen}
          onOpenChange={setFamilyCreatedDialogOpen}
          familyCode={createdFamilyCode ?? ""}
        />
        <WelcomeAboardDialog open={welcomeOpen} onOpenChange={setWelcomeOpen} />
      </View>
    </SafeAreaView>
  );
};

export default Family;
