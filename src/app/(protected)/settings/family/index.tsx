import BagIcon from "@/components/icons/categories/bag";
import HomeIcon from "@/components/icons/categories/home";
import MedicalIcon from "@/components/icons/categories/medical";
import PetIcon from "@/components/icons/categories/pet";
import PlaneIcon from "@/components/icons/categories/plane";
import ChevronRight from "@/components/icons/chevron-right";
import PlusIcon from "@/components/icons/plus";
import User from "@/components/icons/user";
import WithArrowBack from "@/layout/with-arrow-back";
import { Link } from "expo-router";
import { Avatar } from "heroui-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";

const CATEGORIES = [
  {
    id: "household",
    title: "Household",
    icon: HomeIcon,
    iconBackground: "#006aff26",
    count: 5,
  },
  {
    id: "travel",
    title: "Travel",
    icon: PlaneIcon,
    iconBackground: "#3cc70026",
    count: 1,
  },
  {
    id: "shopping",
    title: "Shopping",
    icon: BagIcon,
    iconBackground: "#ff48e726",
    count: 3,
  },
  {
    id: "health",
    title: "Health",
    icon: MedicalIcon,
    iconBackground: "#0bcf8426",
    count: 2,
  },
  {
    id: "pets",
    title: "Pets",
    icon: PetIcon,
    iconBackground: "#f59c3026",
    count: 1,
  },
] as const;

const FamilySettings = () => {
  const { t } = useTranslation();
  return (
    <WithArrowBack>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Categories */}
        <View className="bg-primary-day dark:bg-primary-night gap-4 overflow-hidden rounded-xl p-4">
          {CATEGORIES.map((item) => {
            const IconComponent = item.icon;
            return (
              <Pressable
                key={item.id}
                className="flex-row items-center active:opacity-80"
                onPress={() => {
                  // TODO: navigate to category detail
                }}
              >
                <View
                  className="size-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: item.iconBackground }}
                >
                  <IconComponent width={20} height={20} />
                </View>
                <Text className="text-text-day dark:text-text-night ml-4 flex-1 text-base font-medium">
                  {item.title}
                </Text>
                <Text className="text-hint mr-2 text-base">{item.count}</Text>
                <ChevronRight />
              </Pressable>
            );
          })}
        </View>

        {/* Family members */}
        <View className="bg-primary-day dark:bg-primary-night gap-6 rounded-xl p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-text-day dark:text-text-night text-lg font-medium">
              Family members
            </Text>
            <Link href="/settings/family/members" asChild>
              <Pressable>
                <Text className="text-base text-[#006FFF]">See All</Text>
              </Pressable>
            </Link>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3 items-center"
          >
            <Pressable
              className="bg-transparent-day dark:bg-transparent-night size-14 items-center justify-center rounded-full active:opacity-80"
              onPress={() => {
                // TODO: add family member
              }}
            >
              <PlusIcon width={24} height={24} stroke="#A0A0A0" />
            </Pressable>
            {[
              "",
              "https://i.pravatar.cc/96?img=5",
              "https://i.pravatar.cc/96?img=9",
              "https://i.pravatar.cc/96?img=11",
            ].map((uri, i) => (
              <Avatar
                key={uri}
                alt={`Member ${i + 1}`}
                className="bg-transparent-day dark:bg-transparent-night size-14"
              >
                <Avatar.Image source={{ uri }} />
                <Avatar.Fallback color="accent">
                  <User width={20} height={20} color="#A0A0A0" />
                </Avatar.Fallback>
              </Avatar>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </WithArrowBack>
  );
};

export default FamilySettings;
