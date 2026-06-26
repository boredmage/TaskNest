import { Todo, useTodosStore } from "@/stores/todos-store";
import { Alert, AlertButton } from "react-native";

/**
 * Present an action sheet for a todo (archive/unarchive + delete). Wired to the
 * task cards via `onLongPress` so archiving/deleting is actually reachable from
 * the UI.
 */
export function promptTodoActions(todo: Todo) {
  const { archiveTodo, deleteTodo, setStatus } = useTodosStore.getState();

  const buttons: AlertButton[] = [];

  if (todo.status === "archived") {
    buttons.push({
      text: "Unarchive",
      onPress: () => {
        setStatus(todo.id, "in_progress");
      },
    });
  } else {
    buttons.push({
      text: "Archive",
      onPress: () => {
        archiveTodo(todo.id);
      },
    });
  }

  buttons.push({
    text: "Delete",
    style: "destructive",
    onPress: () => {
      Alert.alert(
        "Delete task",
        `Delete "${todo.title}"? This can't be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deleteTodo(todo.id);
            },
          },
        ]
      );
    },
  });

  buttons.push({ text: "Cancel", style: "cancel" });

  Alert.alert(todo.title, undefined, buttons);
}
