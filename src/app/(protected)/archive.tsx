import ActivityCard from "@/components/activity-card";
import ArchiveIcon from "@/components/icons/archive-icon";
import WithArrowBack from "@/layout/with-arrow-back";
import { promptTodoActions } from "@/lib/todo-actions";
import { useFamilyStore } from "@/stores/family-store";
import { assigneeAvatarUris, useTodosStore } from "@/stores/todos-store";
import { StatusEnum } from "@/type";
import React, { useMemo } from "react";
import { FlatList, Text, View } from "react-native";

function EmptyArchive() {
  return (
    <View className="flex-1 items-center justify-center gap-2.5 py-12">
      <View className="size-10 items-center justify-center rounded-lg bg-[#00000033] p-2">
        <ArchiveIcon width={20} height={20} />
      </View>
      <Text className="text-text-day dark:text-text-night text-2xl font-semibold">
        No Archived Tasks
      </Text>
      <Text className="text-hint max-w-64 text-center text-base leading-0">
        Archived tasks will be stored here. You can archive a task anytime.
      </Text>
    </View>
  );
}

const Archive = () => {
  const { todos, loading, fetchTodos } = useTodosStore();
  const { members } = useFamilyStore();

  const data = useMemo(
    () => todos.filter((t) => t.status === "archived"),
    [todos]
  );

  return (
    <WithArrowBack title="Archived">
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
            status={StatusEnum.ARCHIVED}
            onLongPress={() => promptTodoActions(item)}
          />
        )}
        ListEmptyComponent={EmptyArchive}
        contentContainerClassName="gap-2.5 pt-6 grow"
      />
    </WithArrowBack>
  );
};

export default Archive;
