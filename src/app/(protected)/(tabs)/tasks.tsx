import ActivityCard from "@/components/activity-card";
import { CustomButton } from "@/components/custom-button";
import { FilterChip, type FilterKey } from "@/components/filter-chip";
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
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const EmptyTasks = () => {
  return (
    <View className="flex-1 items-center justify-center gap-2.5">
      <Text className="text-text-day dark:text-text-night text-2xl font-semibold">
        No Tasks Yet
      </Text>
      <Text className="text-hint max-w-72 text-center text-base">
        You don't have any tasks right now. Create a new one to get started!
      </Text>
      <Link href="/new-task" asChild>
        <CustomButton size="sm" className="px-6">
          Create
        </CustomButton>
      </Link>
    </View>
  );
};

const Tasks = () => {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const { todos, loading, fetchTodos, toggleComplete } = useTodosStore();
  const { members } = useFamilyStore();

  const counts = useMemo(() => countByStatus(todos), [todos]);

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
      style={{
        flex: 1,
        backgroundColor: isDark ? "#222222" : "#F2F2F2",
      }}
    >
      <View className="flex-1 gap-4 px-4">
        <Text className="text-text-day dark:text-text-night my-2 self-center text-2xl font-semibold">
          {t("tabs.tasks")}
        </Text>

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

        <FlatList
          data={data}
          renderItem={({ item }) => (
            <ActivityCard
              title={item.title}
              description={item.description ?? undefined}
              dueDate={item.due_date ?? undefined}
              assignedAvatarUris={assigneeAvatarUris(
                item.assignee_ids,
                members
              )}
              status={todoStatusToEnum(item.status)}
              onToggleComplete={() =>
                toggleComplete(item.id, item.status !== "completed")
              }
              onLongPress={() => promptTodoActions(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchTodos}
          contentContainerClassName="gap-3 grow pb-24 "
          ListEmptyComponent={<EmptyTasks />}
          ListHeaderComponent={
            <View className="gap-3">
              <View>
                <Text className="text-text-day dark:text-text-night text-2xl font-semibold">
                  Daily Tasks
                </Text>
                <Text className="text-hint text-base">
                  {format(new Date(), "EEEE, d MMMM")}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2 py-1"
                className="-mx-4 px-4"
              >
                <FilterChip
                  label="All"
                  active={activeFilter === "all"}
                  onPress={() => setActiveFilter("all")}
                />
                <FilterChip
                  label="To Do"
                  active={activeFilter === "todo"}
                  onPress={() => setActiveFilter("todo")}
                />
                <FilterChip
                  label="Completed"
                  active={activeFilter === "completed"}
                  onPress={() => setActiveFilter("completed")}
                />
                <FilterChip
                  label="Overdue"
                  active={activeFilter === "overdue"}
                  onPress={() => setActiveFilter("overdue")}
                />
              </ScrollView>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default Tasks;
