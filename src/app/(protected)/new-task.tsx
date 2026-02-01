import { CustomButton } from "@/components/custom-button";
import ChevronRight from "@/components/icons/chevron-right";
import WithArrowBack from "@/layout/with-arrow-back";
import { Select } from "heroui-native";
import { Text, View } from "react-native";

const NewTask = () => {
  return (
    <WithArrowBack title="New Task">
      <View className="mt-10 gap-4">
        <Select>
          <Select.Trigger className="bg-transparent-day h-12 flex-row items-center justify-between rounded-xl border-0 p-3 text-base leading-tight shadow-none">
            <View className="flex-row items-center">
              <Text className="text-text-day text-base">Category</Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Select.Value placeholder="" />
              <ChevronRight />
            </View>
          </Select.Trigger>
          <Select.Portal>
            <Select.Overlay />
            <Select.Content width="full">
              <Select.Item value="1" label="Item 1" />
              <Select.Item value="2" label="Item 2" />
            </Select.Content>
          </Select.Portal>
        </Select>

        <CustomButton>Create Task</CustomButton>
      </View>
    </WithArrowBack>
  );
};

export default NewTask;
