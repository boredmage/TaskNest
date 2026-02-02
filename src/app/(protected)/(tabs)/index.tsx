import { TriggerNewFamilyBottomSheet } from "@/components/bottom-sheet/trigger-new-family-bottom-sheet";
import CategoryCard from "@/components/category-card";
import { FilterChip, FilterKey } from "@/components/filter-chip";
import BagIcon from "@/components/icons/categories/bag";
import HomeIcon from "@/components/icons/categories/home";
import MedicalIcon from "@/components/icons/categories/medical";
import PetIcon from "@/components/icons/categories/pet";
import PlaneIcon from "@/components/icons/categories/plane";
import PremiumActivityCard from "@/components/premium-activity-card";
import { SearchField } from "@/components/search-field";
import { useAppTheme } from "@/contexts/app-theme-context";
import { UPDATE_PROFILE_REDIRECT_KEY } from "@/lib/constant";
import { getRandomActivities } from "@/mock-data";
import { useProfileStore } from "@/stores/profile-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Family = () => {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const activities = getRandomActivities(0);
  const { profile } = useProfileStore();
  const handleFilterChange = (filter: FilterKey) => {
    setActiveFilter(filter);
  };

  // Redirect to update-profile only once when profile is incomplete
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const alreadyRedirected = await AsyncStorage.getItem(
        UPDATE_PROFILE_REDIRECT_KEY
      );
      if (cancelled) return;
      if (!profile || !profile.full_name) {
        if (!alreadyRedirected) {
          await AsyncStorage.setItem(UPDATE_PROFILE_REDIRECT_KEY, "true");
          router.push("/update-profile");
        }
      } else {
        await AsyncStorage.setItem(UPDATE_PROFILE_REDIRECT_KEY, "true");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#222222" : "#F2F2F2",
      }}
    >
      <View className="flex-1 gap-4 px-4">
        <Text className="text-text-day dark:text-text-night my-2 self-center text-2xl font-semibold">
          {t("tabs.family")}
        </Text>

        <SearchField />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 py-1"
          className="-mx-4 shrink-0 px-4"
        >
          <CategoryCard
            title="Household"
            iconBackground="#006aff26"
            icon={<HomeIcon />}
          />
          <CategoryCard
            title="Travel"
            iconBackground="#3cc70026"
            icon={<PlaneIcon />}
          />
          <CategoryCard
            title="Shopping"
            iconBackground="#ff48e726"
            icon={<BagIcon />}
          />
          <CategoryCard
            title="Health"
            iconBackground="#0bcf8426"
            icon={<MedicalIcon />}
          />
          <CategoryCard
            title="Pets"
            iconBackground="#f59c3026"
            icon={<PetIcon />}
          />
        </ScrollView>

        <FlatList
          data={activities}
          renderItem={({ item }) => <PremiumActivityCard {...item} />}
          keyExtractor={(item) => item.title}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 grow pb-24"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center gap-2.5 pb-20">
              <Text className="text-text-day dark:text-text-night text-2xl font-semibold">
                🏡 No Family Yet
              </Text>
              <Text className="text-hint max-w-72 text-center text-base">
                To get started, create your own or join an existing one using a
                family code.
              </Text>

              <TriggerNewFamilyBottomSheet />
            </View>
          }
          ListHeaderComponent={
            activities.length > 0 ? (
              <View className="gap-3">
                <View>
                  <Text className="text-text-day dark:text-text-night text-2xl font-semibold">
                    Tasks
                  </Text>
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
                    onPress={() => handleFilterChange("all")}
                  />
                  <FilterChip
                    label="To Do"
                    active={activeFilter === "todo"}
                    onPress={() => handleFilterChange("todo")}
                  />
                  <FilterChip
                    label="Completed"
                    active={activeFilter === "completed"}
                    onPress={() => handleFilterChange("completed")}
                  />
                  <FilterChip
                    label="Overdue"
                    active={activeFilter === "overdue"}
                    onPress={() => handleFilterChange("overdue")}
                  />
                </ScrollView>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default Family;
