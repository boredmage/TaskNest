import ActivityCard from "@/components/activity-card";
import { EmptyState } from "@/components/empty-state";
import ClockIcon from "@/components/icons/clock-icon";
import { RefreshableFlatList } from "@/components/refreshable-flat-list";
import { STATUS_COLORS } from "@/components/stats-card";
import WithArrowBack from "@/layout/with-arrow-back";
import { promptTodoActions } from "@/lib/todo-actions";
import { useFamilyStore } from "@/stores/family-store";
import { assigneeAvatarUris, useTodosStore } from "@/stores/todos-store";
import { StatusEnum } from "@/type";
import { router } from "expo-router";
import React, { useMemo } from "react";

const Overdue = () => {
  const { todos, loading, fetchTodos, toggleComplete } = useTodosStore();
  const { members } = useFamilyStore();

  const data = useMemo(
    () => todos.filter((t) => t.status === "overdue"),
    [todos]
  );

  return (
    <WithArrowBack title="Overdue">
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
            status={StatusEnum.OVERDUE}
            onToggleComplete={() => toggleComplete(item.id, true)}
            onLongPress={() => promptTodoActions(item)}
            onPress={() =>
              router.push({ pathname: "/task/[id]", params: { id: item.id } })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<ClockIcon width={20} height={20} />}
            iconColor={STATUS_COLORS[StatusEnum.OVERDUE]}
            title="Nothing's Overdue"
            body="Great job! You have no overdue tasks at the moment."
          />
        }
      />
    </WithArrowBack>
  );
};

export default Overdue;
