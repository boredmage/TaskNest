import ActivityCard from "@/components/activity-card";
import TrophyIcon from "@/components/icons/trophy-icon";
import WithArrowBack from "@/layout/with-arrow-back";
import { getRandomActivities } from "@/mock-data";
import { StatusEnum } from "@/type";
import React from "react";
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
  const completedActivities = getRandomActivities(4);

  return (
    <WithArrowBack title="Completed">
      <FlatList
        data={completedActivities}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        renderItem={({ item }) => (
          <ActivityCard
            title={item.title}
            description={item.description}
            dueDate={item.dueDate}
            assignedAvatarUris={item.assignedAvatarUris ?? []}
            status={StatusEnum.COMPLETED}
          />
        )}
        ListEmptyComponent={EmptyCompleted}
        contentContainerClassName="gap-2.5 pt-6 grow"
      />
    </WithArrowBack>
  );
};

export default Completed;
