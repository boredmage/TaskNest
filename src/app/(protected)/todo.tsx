import ActivityCard from "@/components/activity-card";
import { CustomButton } from "@/components/custom-button";
import FileIcon from "@/components/icons/file-icon";
import WithArrowBack from "@/layout/with-arrow-back";
import { getRandomActivities } from "@/mock-data";
import { StatusEnum } from "@/type";
import { Link } from "expo-router";
import React from "react";
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
