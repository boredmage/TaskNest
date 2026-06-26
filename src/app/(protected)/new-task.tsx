import { CustomButton } from "@/components/custom-button";
import { DateSelectorDialog } from "@/components/dialog/date-selector-dialog";
import ChevronRight from "@/components/icons/chevron-right";
import WithArrowBack from "@/layout/with-arrow-back";
import { useTodosStore } from "@/stores/todos-store";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { FormField, Select, Spinner, TextField } from "heroui-native";
import { useState } from "react";
import {
  Alert,
  NativeSyntheticEvent,
  Pressable,
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
  { value: "household", label: "Household" },
  { value: "travel", label: "Travel" },
  { value: "shopping", label: "Shopping" },
  { value: "health", label: "Health" },
  { value: "pets", label: "Pets" },
  { value: "other", label: "Other" },
];

const NewTask = () => {
  const router = useRouter();
  const { createTodo } = useTodosStore();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a task title.");
      return;
    }

    setSubmitting(true);
    const { error } = await createTodo({
      title,
      description,
      category,
      due_date: dueDate ? dueDate.toISOString() : null,
    });
    setSubmitting(false);

    if (error) {
      const message =
        typeof error === "string"
          ? error
          : ((error as { message?: string })?.message ??
            "Something went wrong. Please try again.");
      Alert.alert("Could not create task", message);
      return;
    }

    router.back();
  };

  return (
    <WithArrowBack title="New Task">
      <View className="mt-6 gap-4">
        <TextField>
          <TextField.Label>Task</TextField.Label>
          <TextField.Input
            placeholder="Task Title"
            value={title}
            onChangeText={setTitle}
            className="bg-transparent-day dark:bg-transparent-night h-12 rounded-xl border-0 text-base leading-tight shadow-none"
          />
        </TextField>

        <FormField className="w-full flex-col items-start gap-1">
          <FormField.Label>Category</FormField.Label>
          <Select
            value={
              category
                ? {
                    value: category,
                    label:
                      categories.find((c) => c.value === category)?.label ?? "",
                  }
                : undefined
            }
            onValueChange={(option) => setCategory(option?.value ?? null)}
            className="w-full"
          >
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
                {categories.map((cat) => (
                  <Select.Item
                    key={cat.value}
                    value={cat.value}
                    label={cat.label}
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

        <FormField className="w-full flex-col items-start gap-1">
          <FormField.Label>Due date</FormField.Label>
          <DateSelectorDialog
            date={dueDate ?? new Date()}
            setDate={(d) => setDueDate(d)}
          >
            <Pressable className="bg-transparent-day dark:bg-transparent-night h-12 w-full flex-row items-center justify-between rounded-xl p-3 active:opacity-80">
              <Text className="text-text-day dark:text-text-night text-base">
                Due date
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-hint text-base">
                  {dueDate ? format(dueDate, "MMM d, yyyy") : "Optional"}
                </Text>
                <ChevronRight />
              </View>
            </Pressable>
          </DateSelectorDialog>
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

        <CustomButton
          onPress={handleCreate}
          isDisabled={submitting || !title.trim()}
        >
          {submitting ? <Spinner color="#FFFFFF" size="md" /> : "Create Task"}
        </CustomButton>
      </View>
    </WithArrowBack>
  );
};

export default NewTask;
