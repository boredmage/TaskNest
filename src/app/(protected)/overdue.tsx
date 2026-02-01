import { View, Text, FlatList } from "react-native";
import React from "react";
import WithArrowBack from "@/layout/with-arrow-back";
import ActivityCard from "@/components/activity-card";
import ClockIcon from "@/components/icons/clock-icon";
import { getRandomActivities } from "@/mock-data";
import { StatusEnum } from "@/type";

function EmptyOverdue() {
  return (
    <View className="flex-1 items-center justify-center gap-2.5 py-12">
      <View className="bg-[#FF5050] rounded-lg p-2 items-center justify-center size-10">
        <ClockIcon width={20} height={20} />
      </View>
      <Text className="text-2xl font-semibold text-text-day">
        Nothing&apos;s Overdue
      </Text>
      <Text className="text-center max-w-64 text-hint text-base leading-0">
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
            dateTime={item.dueDate}
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
