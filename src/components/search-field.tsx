import SearchIcon from "@/components/icons/search";
import { useAppTheme } from "@/contexts/app-theme-context";
import { TextField } from "heroui-native";
import { View } from "react-native";

export const SearchField = () => {
  const { isDark } = useAppTheme();

  return (
    <TextField>
      <View className="w-full flex-row items-center justify-center">
        <TextField.Input
          placeholder="Search"
          className="bg-primary-day dark:bg-primary-night h-12 flex-1 rounded-xl border-0 pl-12 text-base leading-tight shadow-none"
        />
        <View className="absolute left-4">
          <SearchIcon
            width={20}
            height={20}
            color={isDark ? "#A0A0A0" : "#A0A0A0"}
          />
        </View>
      </View>
    </TextField>
  );
};
