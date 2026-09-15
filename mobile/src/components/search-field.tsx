import SearchIcon from "@/components/icons/search";
import { TextField } from "heroui-native";
import { View } from "react-native";

/** Compact search input with a leading icon (Figma 205:6088, reduced to 44pt). */
export const SearchField = () => {
  return (
    <TextField>
      <View className="w-full flex-row items-center justify-center">
        <TextField.Input
          placeholder="Search"
          className="bg-primary-day dark:bg-primary-night h-11 flex-1 rounded-xl border-0 pl-12 text-base leading-tight shadow-none"
        />
        <View className="absolute left-4">
          <SearchIcon width={20} height={20} color="#A0A0A0" />
        </View>
      </View>
    </TextField>
  );
};
