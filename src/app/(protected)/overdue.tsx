import ActivityCard from "@/components/activity-card";
import ClockIcon from "@/components/icons/clock-icon";
import WithArrowBack from "@/layout/with-arrow-back";
import { getRandomActivities } from "@/mock-data";
import { StatusEnum } from "@/type";
import React from "react";
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
  const overdueActivities = getRandomActivities(4);

  return (
    <WithArrowBack title="Overdue">
      <FlatList
        data={overdueActivities}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        renderItem={({ item }) => (
          <ActivityCard
            title={item.title}
            description={item.description}
            dueDate={item.dueDate}
            assignedAvatarUris={item.assignedAvatarUris ?? []}
            status={StatusEnum.OVERDUE}
          />
        )}
        ListEmptyComponent={EmptyOverdue}
        contentContainerClassName="gap-2.5 pt-6 grow"
      />
    </WithArrowBack>
  );
};

export default Overdue;
