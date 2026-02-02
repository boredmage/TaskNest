import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CategoryCardProps {
  title: string;
  iconBackground?: string;
  icon: React.ReactNode;
  onPress?: () => void;
}

const CategoryCard = ({
  title,
  iconBackground,
  icon,
  onPress,
}: CategoryCardProps) => {
  return (
    <TouchableOpacity
      className="bg-primary-day dark:bg-primary-night h-28 w-32 rounded-xl border-0 p-2 text-base leading-tight shadow-none"
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View className="grow">
        <View
          className="size-10 items-center justify-center rounded-full p-2"
          style={{ backgroundColor: iconBackground }}
        >
          {icon}
        </View>
      </View>
      <Text className="text-text-day dark:text-text-night text-base">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CategoryCard;
