import ActivityCard from "@/components/activity-card";
import { CustomButton } from "@/components/custom-button";
import { FilterChip, type FilterKey } from "@/components/filter-chip";
import { SearchField } from "@/components/search-field";
import StatsCard from "@/components/stats-card";
import { useAppTheme } from "@/contexts/app-theme-context";
import { getRandomActivities } from "@/mock-data";
import { StatusEnum as Status } from "@/type";
import { Link } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Tasks = () => {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#222222" : "#F2F2F2",
      }}
    >
      <View className="flex-1 gap-4 px-4">
        <Text className="text-text-day dark:text-text-night my-2 self-center text-2xl font-semibold">
          {t("tabs.tasks")}
        </Text>

        <SearchField />

        <View className="gap-2">
          <View className="flex-row gap-2">
            <StatsCard type={Status.TODO} value={10} />
            <StatsCard type={Status.COMPLETED} value={4} />
          </View>
          <View className="flex-row gap-2">
            <StatsCard type={Status.OVERDUE} value={4} />
            <StatsCard type={Status.ARCHIVED} value={0} />
          </View>
        </View>

        <FlatList
          data={getRandomActivities(4)}
          renderItem={({ item }) => <ActivityCard {...item} />}
          keyExtractor={(item) => item.title}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 grow pb-24 "
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center gap-2.5 pb-20">
              <Text className="text-text-day dark:text-text-night text-2xl font-semibold">
                No Tasks Yet
              </Text>
              <Text className="text-hint max-w-72 text-center text-base">
                You don't have any tasks right now. Create a new one to get
                started!
              </Text>
              <Link href="/new-task" asChild>
                <CustomButton size="sm" className="px-6">
                  Create
                </CustomButton>
              </Link>
            </View>
          }
          ListHeaderComponent={
            <View className="gap-3">
              <View>
                <Text className="text-text-day dark:text-text-night text-2xl font-semibold">
                  Daily Tasks
                </Text>
                <Text className="text-hint text-base">Wednesday, 4 April</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2 py-1"
                className="-mx-4 px-4"
              >
                <FilterChip
                  label="All"
                  active={activeFilter === "all"}
                  onPress={() => setActiveFilter("all")}
                />
                <FilterChip
                  label="To Do"
                  active={activeFilter === "todo"}
                  onPress={() => setActiveFilter("todo")}
                />
                <FilterChip
                  label="Completed"
                  active={activeFilter === "completed"}
                  onPress={() => setActiveFilter("completed")}
                />
                <FilterChip
                  label="Overdue"
                  active={activeFilter === "overdue"}
                  onPress={() => setActiveFilter("overdue")}
                />
              </ScrollView>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default Tasks;
