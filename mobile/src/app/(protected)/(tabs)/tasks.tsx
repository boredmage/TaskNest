import ActivityCard from "@/components/activity-card";
import { EmptyState } from "@/components/empty-state";
import { FilterChip, type FilterKey } from "@/components/filter-chip";
import { TabHeader } from "@/components/header";
import { RefreshableFlatList } from "@/components/refreshable-flat-list";
import { SearchField } from "@/components/search-field";
import StatsCard from "@/components/stats-card";
import { useAppTheme } from "@/contexts/app-theme-context";
import { promptTodoActions } from "@/lib/todo-actions";
import { useFamilyStore } from "@/stores/family-store";
import {
  assigneeAvatarUris,
  countByStatus,
  todoStatusToEnum,
  useTodosStore,
} from "@/stores/todos-store";
import { StatusEnum as Status } from "@/type";
import { format } from "date-fns";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Empty state shared with the Family tab (Figma 205:6090). */
export const EmptyTasks = () => (
  <EmptyState
    title="No Tasks Yet"
    body={
      "You don't have any tasks right now.\nCreate a new one to get started!"
    }
    action={{ label: "Create", href: "/new-task" }}
  />
);

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "todo", label: "To Do" },
  { key: "completed", label: "Completed" },
  { key: "overdue", label: "Overdue" },
];

const Tasks = () => {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("todo");
  const { todos, loading, fetchTodos, toggleComplete } = useTodosStore();
  const { members } = useFamilyStore();

  const counts = useMemo(() => countByStatus(todos), [todos]);
  // Heading, date and filters only make sense once there is something to filter.
  const hasTasks = todos.some((t) => t.status !== "archived");

  const data = useMemo(() => {
    switch (activeFilter) {
      case "todo":
        return todos.filter((item) => item.status === "in_progress");
      case "completed":
        return todos.filter((item) => item.status === "completed");
      case "overdue":
        return todos.filter((item) => item.status === "overdue");
      default:
        return todos.filter((item) => item.status !== "archived");
    }
  }, [todos, activeFilter]);

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: isDark ? "#222222" : "#F2F2F2" }}
    >
      <TabHeader title={t("tabs.tasks")} />

      {/* The whole page scrolls: search, summary tiles, heading, chips, then the list. */}
      <RefreshableFlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityCard
            title={item.title}
            description={item.description ?? undefined}
            dueDate={item.due_date ?? undefined}
            assignedAvatarUris={assigneeAvatarUris(item.assignee_ids, members)}
            status={todoStatusToEnum(item.status)}
            onToggleComplete={() =>
              toggleComplete(item.id, item.status !== "completed")
            }
            onLongPress={() => promptTodoActions(item)}
            onPress={() =>
              router.push({ pathname: "/task/[id]", params: { id: item.id } })
            }
          />
        )}
        refreshing={loading}
        onRefresh={fetchTodos}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="grow gap-2 px-4 pt-3 pb-32"
        ListEmptyComponent={<EmptyTasks />}
        ListHeaderComponent={
          <View className="gap-3 pb-1">
            <SearchField />

            <View className="gap-2">
              <View className="flex-row gap-2">
                <StatsCard type={Status.TODO} value={counts.in_progress} />
                <StatsCard type={Status.COMPLETED} value={counts.completed} />
              </View>
              <View className="flex-row gap-2">
                <StatsCard type={Status.OVERDUE} value={counts.overdue} />
                <StatsCard type={Status.ARCHIVED} value={counts.archived} />
              </View>
            </View>

            {hasTasks ? (
              <View className="gap-2">
                <View className="gap-0.5">
                  <Text className="text-text-day dark:text-text-night text-xl leading-6 font-semibold">
                    Daily Tasks
                  </Text>
                  <Text className="text-hint text-sm leading-5">
                    {format(new Date(), "EEEE, d MMMM")}
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
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Tasks;
