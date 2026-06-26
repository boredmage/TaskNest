import ActivityCard from "@/components/activity-card";
import ClockIcon from "@/components/icons/clock-icon";
import WithArrowBack from "@/layout/with-arrow-back";
import { promptTodoActions } from "@/lib/todo-actions";
import { useFamilyStore } from "@/stores/family-store";
import { assigneeAvatarUris, useTodosStore } from "@/stores/todos-store";
import { StatusEnum } from "@/type";
import React, { useMemo } from "react";
import { FlatList, Text, View } from "react-native";

function EmptyOverdue() {
  return (
    <View className="flex-1 items-center justify-center gap-2.5 py-12">
      <View className="size-10 items-center justify-center rounded-lg bg-[#FF5050] p-2">
        <ClockIcon width={20} height={20} />
      </View>
      <Text className="text-text-day text-2xl font-semibold">
        Nothing&apos;s Overdue
      </Text>
      <Text className="text-hint max-w-64 text-center text-base leading-0">
        Great job! You have no overdue tasks at the moment.
      </Text>
    </View>
  );
}

const Overdue = () => {
  const { todos, loading, fetchTodos, toggleComplete } = useTodosStore();
  const { members } = useFamilyStore();

  const data = useMemo(
    () => todos.filter((t) => t.status === "overdue"),
    [todos]
  );

  return (
    <WithArrowBack title="Overdue">
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchTodos}
        renderItem={({ item }) => (
          <ActivityCard
            title={item.title}
            description={item.description ?? undefined}
            dueDate={item.due_date ?? undefined}
            assignedAvatarUris={assigneeAvatarUris(item.assignee_ids, members)}
            status={StatusEnum.OVERDUE}
            onToggleComplete={() => toggleComplete(item.id, true)}
            onLongPress={() => promptTodoActions(item)}
          />
        )}
        ListEmptyComponent={EmptyOverdue}
        contentContainerClassName="gap-2.5 pt-6 grow"
      />
    </WithArrowBack>
  );
};

export default Overdue;
