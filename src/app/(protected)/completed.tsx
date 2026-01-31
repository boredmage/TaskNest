import { View, Text, FlatList } from "react-native";
import React from "react";
import WithArrowBack from "@/layout/with-arrow-back";
import ActivityCard from "@/components/activity-card";
import TrophyIcon from "@/components/icons/trophy-icon";
import { getRandomActivities } from "@/mock-data";
import { StatusEnum } from "@/type";

function EmptyCompleted() {
  return (
    <View className="flex-1 items-center justify-center gap-2.5 py-12">
      <View className="bg-main rounded-lg p-2 items-center justify-center size-10">
        <TrophyIcon width={20} height={20} />
      </View>
      <Text className="text-2xl font-semibold text-text-day">
        No Completed Tasks
      </Text>
      <Text className="text-center max-w-xs text-hint text-base leading-0">
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
            dateTime={item.dueDate}
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
