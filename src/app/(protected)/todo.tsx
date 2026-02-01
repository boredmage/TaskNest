import { View, Text, FlatList } from "react-native";
import React from "react";
import WithArrowBack from "@/layout/with-arrow-back";
import { CustomButton } from "@/components/custom-button";
import { Link } from "expo-router";
import FileIcon from "@/components/icons/file-icon";
import ActivityCard from "@/components/activity-card";
import { getRandomActivities } from "@/mock-data";
import { StatusEnum } from "@/type";

function EmptyTodos() {
  return (
    <View className="flex-1 items-center justify-center gap-2.5 py-12">
      <View className="bg-[#A06CFF] rounded-lg p-2 items-center justify-center size-10">
        <FileIcon />
      </View>
      <Text className="text-2xl font-semibold text-text-day">No Tasks Yet</Text>
      <Text className="text-center max-w-60 text-hint text-base leading-0">
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
  return (
    <WithArrowBack title="To Do">
      <FlatList
        data={getRandomActivities(10)}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        renderItem={({ item }) => (
          <ActivityCard
            title={item.title}
            description={item.description}
            dateTime={item.dueDate}
            assignedAvatarUris={item.assignedAvatarUris ?? []}
            status={StatusEnum.TODO}
          />
        )}
        ListEmptyComponent={EmptyTodos}
        contentContainerClassName="gap-2.5 pt-6 grow"
      />
    </WithArrowBack>
  );
};

export default Todos;
