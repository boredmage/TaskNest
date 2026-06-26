import ActivityCard from "@/components/activity-card";
import { CustomButton } from "@/components/custom-button";
import FileIcon from "@/components/icons/file-icon";
import WithArrowBack from "@/layout/with-arrow-back";
import { promptTodoActions } from "@/lib/todo-actions";
import { useFamilyStore } from "@/stores/family-store";
import { assigneeAvatarUris, useTodosStore } from "@/stores/todos-store";
import { StatusEnum } from "@/type";
import { Link } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Text, View } from "react-native";

function EmptyTodos() {
  return (
    <View className="flex-1 items-center justify-center gap-2.5 py-12">
      <View className="size-10 items-center justify-center rounded-lg bg-[#A06CFF] p-2">
        <FileIcon />
      </View>
      <Text className="text-text-day text-2xl font-semibold">No Tasks Yet</Text>
      <Text className="text-hint max-w-60 text-center text-base leading-0">
        Start by adding a new task. Once you do, it will appear here.
      </Text>
      <Link href="/new-task" asChild>
        <CustomButton size="sm" className="px-6">
          Create
        </CustomButton>
      </Link>
    </View>
  );
}

const Todos = () => {
  const { todos, loading, fetchTodos, toggleComplete } = useTodosStore();
  const { members } = useFamilyStore();

  const data = useMemo(
    () => todos.filter((t) => t.status === "in_progress"),
    [todos]
  );

  return (
    <WithArrowBack title="To Do">
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
            status={StatusEnum.TODO}
            onToggleComplete={() => toggleComplete(item.id, true)}
            onLongPress={() => promptTodoActions(item)}
          />
        )}
        ListEmptyComponent={EmptyTodos}
        contentContainerClassName="gap-2.5 pt-6 grow"
      />
    </WithArrowBack>
  );
};

export default Todos;
