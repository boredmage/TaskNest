import { bolt } from "@/assets/icons";
import { PulseDots, SuccessOverlay } from "@/components/success-overlay";
import { SvgIcon } from "@/components/svg-icon";
import { useEffect } from "react";
import { Modal } from "react-native";

const SHOW_MS = 1400;

type TaskCreatedDialogProps = {
  open: boolean;
  /** Called once the dialog has been shown for its duration. */
  onDone: () => void;
  title?: string;
  body?: string;
};

/** "Task Created!" confirmation (Figma 205:12220), auto-dismisses. */
export function TaskCreatedDialog({
  open,
  onDone,
  title = "Task Created!",
  body = "Your task has been added to the family board.",
}: TaskCreatedDialogProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onDone, SHOW_MS);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <Modal transparent visible={open} animationType="none" statusBarTranslucent>
      <SuccessOverlay
        icon={<SvgIcon art={bolt} size={24} />}
        title={title}
        body={body}
        footer={<PulseDots />}
      />
    </Modal>
  );
}
