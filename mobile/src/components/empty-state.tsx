import { CustomButton } from "@/components/custom-button";
import { Link, type Href } from "expo-router";
import { Text, View } from "react-native";

type EmptyStateProps = {
  /** Optional 20pt glyph drawn in a 40pt tinted tile above the title. */
  icon?: React.ReactNode;
  iconColor?: string;
  /** Free-form artwork (e.g. the 46pt bell) rendered as-is above the title. */
  illustration?: React.ReactNode;
  title: string;
  body: string;
  /** Optional call to action rendered as the primary button. */
  action?: { label: string; href: Href };
  /** Custom call to action, e.g. a bottom-sheet trigger. */
  actionNode?: React.ReactNode;
};

/** Centred empty-state block shared by the tabs and list screens (Figma 205:6169, 205:5962, 205:6217). */
export function EmptyState({
  icon,
  iconColor,
  illustration,
  title,
  body,
  action,
  actionNode,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-4 py-12">
      {illustration}
      {icon ? (
        <View
          className="size-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconColor }}
        >
          {icon}
        </View>
      ) : null}
      <Text className="text-text-day dark:text-text-night text-center text-xl font-semibold">
        {title}
      </Text>
      <Text className="text-hint max-w-[320px] text-center text-base leading-snug">
        {body}
      </Text>
      {action ? (
        <Link href={action.href} asChild>
          <CustomButton className="mt-0 h-11 px-6">{action.label}</CustomButton>
        </Link>
      ) : null}
      {actionNode}
    </View>
  );
}
