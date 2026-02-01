import { View, Text } from "react-native";
import React from "react";
import WithArrowBack from "@/layout/with-arrow-back";
import ArchiveIcon from "@/components/icons/archive-icon";

const Archive = () => {
  return (
    <WithArrowBack title="Archived">
      <View className="flex-1 items-center justify-center gap-2.5">
        <View className="bg-[#00000033] rounded-lg p-2 items-center justify-center size-10">
          <ArchiveIcon width={20} height={20} />
        </View>
        <Text className="text-2xl font-semibold text-text-day">
          No Archived Tasks
        </Text>
        <Text className="text-center max-w-64 text-hint text-base leading-0">
          Archived tasks will be stored here. You can archive a task anytime.
        </Text>
      </View>
    </WithArrowBack>
  );
};

export default Archive;
