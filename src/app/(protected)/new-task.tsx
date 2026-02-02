import { CustomButton } from "@/components/custom-button";
import ChevronRight from "@/components/icons/chevron-right";
import WithArrowBack from "@/layout/with-arrow-back";
import { FormField, Select, TextField } from "heroui-native";
import { useState } from "react";
import {
  NativeSyntheticEvent,
  Text,
  TextInputContentSizeChangeEventData,
  View,
} from "react-native";

const DESCRIPTION_MAX_HEIGHT = 160; // max-h-40 = 10rem
const DESCRIPTION_MIN_HEIGHT = 48; // ~one line
const LINE_HEIGHT = 24; // approximate line height for text-base

function heightFromValue(value: string): number {
  const lines = value ? value.split("\n").length : 1;
  const contentHeight = DESCRIPTION_MIN_HEIGHT + (lines - 1) * LINE_HEIGHT;
  return Math.min(
    Math.max(contentHeight, DESCRIPTION_MIN_HEIGHT),
    DESCRIPTION_MAX_HEIGHT
  );
}

const categories = [
  {
    value: "household",
    label: "Household",
  },
  {
    value: "travel",
    label: "Travel",
  },
  {
    value: "shopping",
    label: "Shopping",
  },
  {
    value: "health",
    label: "Health",
  },
  {
    value: "pets",
    label: "Pets",
  },
  {
    value: "other",
    label: "Other",
  },
];

const NewTask = () => {
  const [description, setDescription] = useState("");
  const [descriptionHeight, setDescriptionHeight] = useState(
    DESCRIPTION_MIN_HEIGHT
  );

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    setDescriptionHeight(heightFromValue(text));
  };

  const handleDescriptionContentSizeChange = (
    e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>
  ) => {
    const height = e.nativeEvent.contentSize.height;
    setDescriptionHeight(
      Math.min(Math.max(height, DESCRIPTION_MIN_HEIGHT), DESCRIPTION_MAX_HEIGHT)
    );
  };

  return (
    <WithArrowBack title="New Task">
      <View className="mt-6 gap-4">
        <TextField>
          <TextField.Label>Task</TextField.Label>
          <TextField.Input
            placeholder="Task Title"
            className="bg-transparent-day dark:bg-transparent-night h-12 rounded-xl border-0 text-base leading-tight shadow-none"
          />
        </TextField>

        <FormField className="w-full flex-col items-start gap-1">
          <FormField.Label>Category</FormField.Label>
          <Select className="w-full">
            <Select.Trigger className="bg-transparent-day dark:bg-transparent-night h-12 flex-row items-center justify-between rounded-xl border-0 p-3 text-base leading-tight shadow-none">
              <View className="flex-row items-center">
                <Text className="text-text-day dark:text-text-night text-base">
                  Category
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <Select.Value placeholder="" className="text-hint" />
                <ChevronRight />
              </View>
            </Select.Trigger>
            <Select.Portal>
              <Select.Overlay />
              <Select.Content
                width="full"
                className="bg-primary-day dark:bg-primary-night"
              >
                {categories.map((category) => (
                  <Select.Item
                    key={category.value}
                    value={category.value}
                    label={category.label}
                    className="p-2"
                  >
                    {({ isSelected }) => (
                      <>
                        <View className="flex-1 flex-row items-center gap-3">
                          <Select.ItemLabel
                            className={
                              isSelected
                                ? "text-main font-medium"
                                : "text-foreground"
                            }
                          />
                        </View>
                        <Select.ItemIndicator
                          iconProps={{ color: "#72d000" }}
                        />
                      </>
                    )}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Portal>
          </Select>
        </FormField>

        <TextField>
          <TextField.Label>Description</TextField.Label>
          <TextField.Input
            placeholder="Description"
            value={description}
            onChangeText={handleDescriptionChange}
            className="bg-transparent-day dark:bg-transparent-night rounded-xl border-0 text-base leading-tight shadow-none"
            style={{
              minHeight: descriptionHeight,
              maxHeight: DESCRIPTION_MAX_HEIGHT,
            }}
            multiline
            textAlignVertical="top"
            onContentSizeChange={handleDescriptionContentSizeChange}
          />
        </TextField>

        <CustomButton>Create Task</CustomButton>
      </View>
    </WithArrowBack>
  );
};

export default NewTask;
