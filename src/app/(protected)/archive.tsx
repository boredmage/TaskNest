import ArchiveIcon from "@/components/icons/archive-icon";
import WithArrowBack from "@/layout/with-arrow-back";
import React from "react";
import { Text, View } from "react-native";

const Archive = () => {
  return (
    <WithArrowBack title="Archived">
      <View className="flex-1 items-center justify-center gap-2.5">
        <View className="size-10 items-center justify-center rounded-lg bg-[#00000033] p-2">
          <ArchiveIcon width={20} height={20} />
        </View>
        <Text className="text-text-day text-2xl font-semibold">
          No Archived Tasks
        </Text>
        <Text className="text-hint max-w-64 text-center text-base leading-0">
          Archived tasks will be stored here. You can archive a task anytime.
        </Text>
      </View>
    </WithArrowBack>
  );
};

export default Archive;
