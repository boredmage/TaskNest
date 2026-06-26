import ActivityCard from "@/components/activity-card";
import TrophyIcon from "@/components/icons/trophy-icon";
import WithArrowBack from "@/layout/with-arrow-back";
import { promptTodoActions } from "@/lib/todo-actions";
import { useFamilyStore } from "@/stores/family-store";
import { assigneeAvatarUris, useTodosStore } from "@/stores/todos-store";
import { StatusEnum } from "@/type";
import React, { useMemo } from "react";
import { FlatList, Text, View } from "react-native";

function EmptyCompleted() {
  return (
    <View className="flex-1 items-center justify-center gap-2.5 py-12">
      <View className="bg-main size-10 items-center justify-center rounded-lg p-2">
        <TrophyIcon width={20} height={20} />
      </View>
      <Text className="text-text-day text-2xl font-semibold">
        No Completed Tasks
      </Text>
      <Text className="text-hint max-w-xs text-center text-base leading-0">
        You haven't completed any tasks yet. Keep going—completed tasks will
        show up here.
      </Text>
    </View>
  );
}

const Completed = () => {
  const { todos, loading, fetchTodos, toggleComplete } = useTodosStore();
  const { members } = useFamilyStore();

  const data = useMemo(
    () => todos.filter((t) => t.status === "completed"),
    [todos]
  );

  return (
    <WithArrowBack title="Completed">
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
            status={StatusEnum.COMPLETED}
            onToggleComplete={() => toggleComplete(item.id, false)}
            onLongPress={() => promptTodoActions(item)}
          />
        )}
        ListEmptyComponent={EmptyCompleted}
        contentContainerClassName="gap-2.5 pt-6 grow"
      />
    </WithArrowBack>
  );
};

export default Completed;
