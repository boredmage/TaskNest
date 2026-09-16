import { CustomButton } from "@/components/custom-button";
import { DateSelectorDialog } from "@/components/dialog/date-selector-dialog";
import { MemberPickerDialog } from "@/components/dialog/member-picker-dialog";
import { OptionPickerDialog } from "@/components/dialog/option-picker-dialog";
import { TaskCreatedDialog } from "@/components/dialog/task-created-dialog";
import {
  FieldButton,
  FieldInput,
  LabeledField,
} from "@/components/form/labeled-field";
import WithArrowBack from "@/layout/with-arrow-back";
import { getUser } from "@/lib/api";
import { CATEGORY_OPTIONS, categoryLabel } from "@/lib/categories";
import { formatDueLabel } from "@/lib/dates";
import {
  PRIORITY_OPTIONS,
  priorityLabel,
  REMINDER_OPTIONS,
  reminderLabel,
  REPEAT_OPTIONS,
  repeatLabel,
} from "@/lib/todo-options";
import { useFamilyStore } from "@/stores/family-store";
import {
  assigneeNames,
  useTodosStore,
  type TodoPriority,
  type TodoRepeat,
} from "@/stores/todos-store";
import { addHours } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Spinner } from "heroui-native";
import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";

type Picker = "category" | "assign" | "repeat" | "reminder" | "priority";

/** Create / edit a task (Figma 205:6390, 205:6402). Pass `?id=` to edit. */
const NewTask = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { todos, createTodo, updateTodo } = useTodosStore();
  const { family, members } = useFamilyStore();
  const existing = id ? todos.find((t) => t.id === id) : undefined;
  const editing = !!existing;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [category, setCategory] = useState<string | null>(
    existing?.category ?? null
  );
  const [description, setDescription] = useState(existing?.description ?? "");
  const [assignees, setAssignees] = useState<string[]>(
    existing?.assignee_ids ?? []
  );
  const [dueDate, setDueDate] = useState<Date | null>(
    existing?.due_date ? new Date(existing.due_date) : null
  );
  const [repeat, setRepeat] = useState<TodoRepeat>(existing?.repeat ?? "none");
  const [reminder, setReminder] = useState<number | null>(
    existing ? existing.reminder_minutes : 60
  );
  const [priority, setPriority] = useState<TodoPriority>(
    existing?.priority ?? "medium"
  );
  const [picker, setPicker] = useState<Picker | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);

  const canSubmit = title.trim().length > 0 && !submitting;
  const openPicker = (name: Picker) => () => setPicker(name);
  const closePicker = (open: boolean) => setPicker(open ? picker : null);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    // New tasks fall back to sensible defaults for anything left blank:
    // category "other", assigned to the creator, due in 24 hours. Repeat
    // ("none") and priority ("medium") are already the form's initial state.
    const creatorId = getUser()?.id;
    const input = editing
      ? {
          title,
          description,
          category,
          due_date: dueDate ? dueDate.toISOString() : null,
          assignee_ids: assignees.length ? assignees : null,
          priority,
          repeat,
          reminder_minutes: reminder,
        }
      : {
          title,
          description,
          category: category ?? "other",
          due_date: (dueDate ?? addHours(new Date(), 24)).toISOString(),
          assignee_ids: assignees.length
            ? assignees
            : creatorId
              ? [creatorId]
              : null,
          priority,
          repeat,
          reminder_minutes: reminder,
        };
    const { error, queued } = editing
      ? await updateTodo(existing.id, input)
      : await createTodo(input);
    setSubmitting(false);

    if (error) {
      const message =
        typeof error === "string"
          ? error
          : ((error as { message?: string })?.message ??
            "Something went wrong. Please try again.");
      Alert.alert(
        editing ? "Could not save task" : "Could not create task",
        message
      );
      return;
    }

    // Saved while offline: the assignees can't be told until we reconnect.
    const othersAssigned = (input.assignee_ids ?? []).filter(
      (id) => id !== creatorId && !(existing?.assignee_ids ?? []).includes(id)
    );
    if (queued && othersAssigned.length > 0) {
      const names = assigneeNames(othersAssigned, members);
      const who =
        names.length === 0
          ? "The assignee"
          : names.length === 1
            ? names[0]
            : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
      Alert.alert(
        "Saved offline",
        `${who} will be notified once you're back online.`
      );
    }

    if (editing) router.back();
    else setCreated(true);
  };

  return (
    <WithArrowBack title={editing ? "Edit Task" : "New Task"}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 pt-3 pb-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LabeledField label="Task">
          <FieldInput
            placeholder="Task title"
            value={title}
            onChangeText={setTitle}
            returnKeyType="done"
          />
        </LabeledField>

        <LabeledField label="Category">
          <FieldButton
            value={categoryLabel(category)}
            placeholder="Select category"
            onPress={openPicker("category")}
          />
        </LabeledField>

        <LabeledField label="Description (Optional)">
          <FieldInput
            multiline
            placeholder="Add a few details"
            value={description}
            onChangeText={setDescription}
          />
        </LabeledField>

        {family ? (
          <LabeledField label="Assign To">
            <FieldButton
              value={assigneeNames(assignees, members).join(", ")}
              placeholder="Select members"
              onPress={openPicker("assign")}
            />
          </LabeledField>
        ) : null}

        <LabeledField label="Due Date">
          <DateSelectorDialog
            mode="datetime"
            date={dueDate ?? new Date()}
            setDate={setDueDate}
          >
            <FieldButton
              value={dueDate ? formatDueLabel(dueDate) : null}
              placeholder="Select date"
            />
          </DateSelectorDialog>
        </LabeledField>

        <LabeledField label="Repeat">
          <FieldButton
            value={repeatLabel(repeat)}
            placeholder="None"
            onPress={openPicker("repeat")}
          />
        </LabeledField>

        <LabeledField label="Reminder">
          <FieldButton
            value={reminderLabel(reminder)}
            placeholder="None"
            onPress={openPicker("reminder")}
          />
        </LabeledField>

        <LabeledField label="Priority">
          <FieldButton
            value={priorityLabel(priority)}
            placeholder="Medium"
            onPress={openPicker("priority")}
          />
        </LabeledField>
      </ScrollView>

      <View className="pt-2 pb-4">
        <CustomButton
          className="h-[50px]"
          onPress={handleSubmit}
          isDisabled={!canSubmit}
        >
          {submitting ? (
            <Spinner color="#FFFFFF" size="md" />
          ) : editing ? (
            "Save Changes"
          ) : (
            "Create Task"
          )}
        </CustomButton>
      </View>

      <OptionPickerDialog
        title="Category"
        options={CATEGORY_OPTIONS}
        value={category ?? ""}
        onChange={(v) => setCategory(v || null)}
        open={picker === "category"}
        onOpenChange={closePicker}
      />
      <MemberPickerDialog
        members={members}
        selected={assignees}
        onChange={setAssignees}
        open={picker === "assign"}
        onOpenChange={closePicker}
      />
      <OptionPickerDialog
        title="Repeat"
        options={REPEAT_OPTIONS}
        value={repeat}
        onChange={setRepeat}
        open={picker === "repeat"}
        onOpenChange={closePicker}
      />
      <OptionPickerDialog
        title="Reminder"
        options={REMINDER_OPTIONS}
        value={reminder}
        onChange={setReminder}
        open={picker === "reminder"}
        onOpenChange={closePicker}
      />
      <OptionPickerDialog
        title="Priority"
        options={PRIORITY_OPTIONS}
        value={priority}
        onChange={setPriority}
        open={picker === "priority"}
        onOpenChange={closePicker}
      />

      <TaskCreatedDialog
        open={created}
        onDone={() => {
          setCreated(false);
          router.back();
        }}
        body={
          family
            ? "Your task has been added to the family board."
            : "Your task has been added to your list."
        }
      />
    </WithArrowBack>
  );
};

export default NewTask;
