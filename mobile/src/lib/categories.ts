import BagIcon from "@/components/icons/categories/bag";
import HomeIcon from "@/components/icons/categories/home";
import MedicalIcon from "@/components/icons/categories/medical";
import PetIcon from "@/components/icons/categories/pet";
import PlaneIcon from "@/components/icons/categories/plane";

/** The task categories shown on the Family tab and in the task form. */
export const CATEGORIES = [
  {
    id: "household",
    label: "Household",
    Icon: HomeIcon,
    tint: "rgba(0,106,255,0.15)",
  },
  {
    id: "travel",
    label: "Travel",
    Icon: PlaneIcon,
    tint: "rgba(60,199,0,0.15)",
  },
  {
    id: "shopping",
    label: "Shopping",
    Icon: BagIcon,
    tint: "rgba(255,72,231,0.15)",
  },
  {
    id: "health",
    label: "Health",
    Icon: MedicalIcon,
    tint: "rgba(11,207,132,0.15)",
  },
  { id: "pets", label: "Pets", Icon: PetIcon, tint: "rgba(245,156,48,0.15)" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_OPTIONS = [
  ...CATEGORIES.map((c) => ({ value: c.id as string, label: c.label })),
  { value: "other", label: "Other" },
];

export function categoryLabel(id: string | null | undefined) {
  if (!id) return "";
  return CATEGORY_OPTIONS.find((c) => c.value === id)?.label ?? id;
}
