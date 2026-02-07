import { TriggerNewFamilyBottomSheet } from "@/components/bottom-sheet/trigger-new-family-bottom-sheet";
import CategoryCard from "@/components/category-card";
import { FamilyCreatedSuccessDialog } from "@/components/dialog/family-created-success";
import { FilterChip, FilterKey } from "@/components/filter-chip";
import BagIcon from "@/components/icons/categories/bag";
import HomeIcon from "@/components/icons/categories/home";
import MedicalIcon from "@/components/icons/categories/medical";
import PetIcon from "@/components/icons/categories/pet";
import PlaneIcon from "@/components/icons/categories/plane";
import SettingsOutline from "@/components/icons/settings-outline";
import PremiumActivityCard from "@/components/premium-activity-card";
import { SearchField } from "@/components/search-field";
import { useAppTheme } from "@/contexts/app-theme-context";
import { getRandomActivities } from "@/mock-data";
import { useFamilyStore } from "@/stores/family-store";
import { useProfileStore } from "@/stores/profile-store";
import { UPDATE_PROFILE_REDIRECT_KEY } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Spinner } from "heroui-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyTasks } from "./tasks";

type NoFamilyViewProps = {
  onFamilyCreated?: (inviteCode: string | null) => void;
};

const NoFamilyView = ({ onFamilyCreated }: NoFamilyViewProps) => {
  return (
    <View className="mb-24 flex-1 items-center justify-center gap-2.5">
      <Text className="text-text-day dark:text-text-night text-2xl font-semibold">
        🏡 No Family Yet
      </Text>
      <Text className="text-hint max-w-72 text-center text-base">
        To get started, create your own or join an existing one using a family
        code.
      </Text>
      <TriggerNewFamilyBottomSheet onFamilyCreated={onFamilyCreated} />
    </View>
  );
};

const Family = () => {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const activities = getRandomActivities(0);
  const { profile, loading } = useProfileStore();
  const { family, loading: familyLoading, error } = useFamilyStore();
  const [familyCreatedDialogOpen, setFamilyCreatedDialogOpen] = useState(false);
  const [createdFamilyCode, setCreatedFamilyCode] = useState<string | null>(
    null
  );
  const handleFilterChange = (filter: FilterKey) => {
    setActiveFilter(filter);
  };

  // Redirect to update-profile only once when profile is incomplete
  useEffect(() => {
    if (loading) return;

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
  }, [profile, loading]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#222222" : "#F2F2F2",
      }}
    >
      <View className="flex-1 gap-4 px-4">
        <View className="my-2 flex-row items-center justify-between">
          <View className="flex-1"></View>
          <View className="flex-1">
            <Text className="text-text-day dark:text-text-night self-center text-2xl font-semibold">
              {t("tabs.family")}
            </Text>
          </View>
          <View className="flex-1 items-end">
            <TouchableOpacity
              onPress={() => router.push("/settings/family")}
              activeOpacity={0.8}
              hitSlop={10}
            >
              <SettingsOutline width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>

        <SearchField />

        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 py-1"
            className="-mx-4 h-fit shrink-0 flex-row px-4"
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
        </View>

        {familyLoading ? (
          <View className="mb-24 flex-1 items-center justify-center">
            <Spinner size="lg" color="#72d000" className="self-center" />
          </View>
        ) : family ? (
          <FlatList
            bounces={false}
            data={activities}
            renderItem={({ item }) => <PremiumActivityCard {...item} />}
            keyExtractor={(item) => item.title}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3 grow pb-24"
            ListEmptyComponent={<EmptyTasks />}
            ListHeaderComponent={
              <View className="gap-2">
                <View>
                  <Text className="text-text-day dark:text-text-night text-2xl font-semibold">
                    Tasks
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-2"
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
            }
          />
        ) : (
          <NoFamilyView
            onFamilyCreated={(inviteCode) => {
              setCreatedFamilyCode(inviteCode);
              setFamilyCreatedDialogOpen(true);
            }}
          />
        )}
        <FamilyCreatedSuccessDialog
          open={familyCreatedDialogOpen}
          onOpenChange={setFamilyCreatedDialogOpen}
          familyCode={createdFamilyCode ?? ""}
        />
      </View>
    </SafeAreaView>
  );
};

export default Family;
