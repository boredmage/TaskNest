import ActivityCard from "@/components/activity-card";
import { EmptyState } from "@/components/empty-state";
import ArchiveIcon from "@/components/icons/archive-icon";
import { RefreshableFlatList } from "@/components/refreshable-flat-list";
import { archivedTileColor } from "@/components/stats-card";
import { useAppTheme } from "@/contexts/app-theme-context";
import WithArrowBack from "@/layout/with-arrow-back";
import { promptTodoActions } from "@/lib/todo-actions";
import { useFamilyStore } from "@/stores/family-store";
import { assigneeAvatarUris, useTodosStore } from "@/stores/todos-store";
import { StatusEnum } from "@/type";
import { router } from "expo-router";
import React, { useMemo } from "react";

const Archive = () => {
  const { todos, loading, fetchTodos } = useTodosStore();
  const { members } = useFamilyStore();
  const { isDark } = useAppTheme();

  const data = useMemo(
    () => todos.filter((t) => t.status === "archived"),
    [todos]
  );

  return (
    <WithArrowBack title="Archived">
      <RefreshableFlatList
        data={data}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchTodos}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="grow gap-2 pt-3 pb-10"
        renderItem={({ item }) => (
          <ActivityCard
            title={item.title}
            description={item.description ?? undefined}
            dueDate={item.due_date ?? undefined}
            assignedAvatarUris={assigneeAvatarUris(item.assignee_ids, members)}
            status={StatusEnum.ARCHIVED}
            onLongPress={() => promptTodoActions(item)}
            onPress={() =>
              router.push({ pathname: "/task/[id]", params: { id: item.id } })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<ArchiveIcon width={20} height={20} />}
            iconColor={archivedTileColor(isDark)}
            title="No Archived Tasks"
            body="Archived tasks will be stored here. You can archive a task anytime."
          />
        }
      />
    </WithArrowBack>
  );
};

export default Archive;
