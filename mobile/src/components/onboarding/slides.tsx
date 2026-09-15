import * as d from "@/assets/onboarding/doodles";
import BagIcon from "@/components/icons/categories/bag";
import HomeIcon from "@/components/icons/categories/home";
import PlaneIcon from "@/components/icons/categories/plane";
import SearchIcon from "@/components/icons/search";
import { useAppTheme } from "@/contexts/app-theme-context";
import { Image, Text, View } from "react-native";
import { At, Doodle, Float, Reveal } from "./doodle";

const avatarSister = require("@/assets/onboarding/avatar-sister.png");
const avatarDad = require("@/assets/onboarding/avatar-dad.jpg");
const avatarMom = require("@/assets/onboarding/avatar-mom.png");

export type SlideProps = { active: boolean };

// All coordinates below are the Figma frame values (402 wide).

// ---------------------------------------------------------------------------
// Slide 1: Organize as a Family
// ---------------------------------------------------------------------------
export function FamilySlide({ active }: SlideProps) {
  const { isDark } = useAppTheme();
  return (
    <>
      <Doodle
        art={d.s1Sparkles}
        cx={50}
        cy={260.5}
        active={active}
        delay={420}
      />
      <Doodle
        art={d.s1Squiggle}
        cx={360}
        cy={348}
        active={active}
        delay={520}
      />
      <Doodle
        art={d.s1BoxChecked}
        cx={222}
        cy={266}
        active={active}
        delay={380}
      />
      <Doodle
        art={d.s1BoxCrossed}
        cx={185}
        cy={395}
        active={active}
        delay={440}
      />

      <At x={65} y={210}>
        <Reveal active={active} delay={120}>
          <Float delay={200}>
            <Avatar source={avatarSister} size={64} />
          </Float>
        </Reveal>
      </At>
      <At x={270} y={229}>
        <Reveal active={active} delay={200}>
          <Float delay={200}>
            <Chip label="#sister" />
          </Float>
        </Reveal>
      </At>

      <At x={44.5} y={301}>
        <Reveal active={active} delay={60}>
          <Float distance={3} duration={2400}>
            <View
              className="bg-background-day dark:bg-background-night h-[50px] w-[313px] flex-row items-center gap-4 rounded-full px-4"
              style={shadow(0, 15, 14, 0.07)}
            >
              <SearchIcon
                width={24}
                height={24}
                color={isDark ? "#FFFFFF" : "#1B1B1B"}
              />
              <Text className="text-hint text-[17px]">Search</Text>
            </View>
          </Float>
        </Reveal>
      </At>

      <At x={32} y={388}>
        <Reveal active={active} delay={300}>
          <Float delay={600}>
            <Chip label="#dad" />
          </Float>
        </Reveal>
      </At>
      <At x={271} y={383}>
        <Reveal active={active} delay={240}>
          <Float delay={600}>
            <Avatar source={avatarDad} size={64} />
          </Float>
        </Reveal>
      </At>
    </>
  );
}

// ---------------------------------------------------------------------------
// Slide 2: Stay in Sync
// ---------------------------------------------------------------------------
export function SyncSlide({ active }: SlideProps) {
  return (
    <>
      <Doodle art={d.s2Curl} cx={248} cy={227} active={active} delay={360} />
      <Doodle
        art={d.s2RaysLeft}
        cx={43.5}
        cy={265}
        active={active}
        delay={440}
      />
      <Doodle
        art={d.s2RaysRight}
        cx={360}
        cy={406}
        active={active}
        delay={480}
      />
      <Doodle art={d.s2Star} cx={148} cy={444} active={active} delay={520} />

      {/* Back card: same card, slightly smaller and faded */}
      <At x={57} y={346.5 - 36}>
        <Reveal active={active} delay={160}>
          <Float distance={4} delay={300} style={{ opacity: 0.8 }}>
            <NotificationCard width={288} scale={0.92} />
          </Float>
        </Reveal>
      </At>
      <At x={50} y={329.3 - 42}>
        <Reveal active={active} delay={60}>
          <Float distance={4}>
            <NotificationCard width={302} scale={1} shadowed />
          </Float>
        </Reveal>
      </At>
    </>
  );
}

// ---------------------------------------------------------------------------
// Slide 3: One Place for Everything
// ---------------------------------------------------------------------------
export function EverythingSlide({ active }: SlideProps) {
  return (
    <>
      <Doodle
        art={d.s3RaysUnderline}
        cx={228.5}
        cy={299}
        active={active}
        delay={460}
      />
      <Doodle
        art={d.s3Triangle}
        cx={121.5}
        cy={213}
        active={active}
        delay={380}
      />
      <Doodle art={d.s3Bulb} cx={215} cy={294.5} active={active} delay={300} />
      <Doodle
        art={d.s3ArrowCurved}
        cx={212}
        cy={383}
        active={active}
        delay={440}
      />
      <Doodle art={d.s3Star} cx={138} cy={418} active={active} delay={500} />

      <At x={181} y={139}>
        <Reveal active={active} delay={60}>
          <Float delay={0}>
            <CategoryCard
              label="Household"
              tint="rgba(0,106,255,0.15)"
              icon={<HomeIcon width={17.5} height={17.5} />}
            />
          </Float>
        </Reveal>
      </At>
      <At x={29} y={273}>
        <Reveal active={active} delay={160}>
          <Float delay={400}>
            <CategoryCard
              label="Travel"
              tint="rgba(60,199,0,0.15)"
              icon={<PlaneIcon width={17.5} height={17.5} />}
            />
          </Float>
        </Reveal>
      </At>
      <At x={230} y={338}>
        <Reveal active={active} delay={260}>
          <Float delay={800}>
            <CategoryCard
              label="Shopping"
              tint="rgba(255,72,231,0.15)"
              icon={<BagIcon width={17.5} height={17.5} />}
            />
          </Float>
        </Reveal>
      </At>
    </>
  );
}

// ---------------------------------------------------------------------------
// Mock UI pieces used by the slides
// ---------------------------------------------------------------------------
function shadow(x: number, y: number, radius: number, opacity: number) {
  return {
    shadowColor: "#000",
    shadowOffset: { width: x, height: y },
    shadowRadius: radius,
    shadowOpacity: opacity,
    elevation: 8,
  } as const;
}

function Avatar({ source, size }: { source: number; size: number }) {
  return (
    <Image
      source={source}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View className="dark:bg-background-night rounded-full bg-black px-6 py-1.5">
      <Text className="text-[17px] leading-[22px] font-medium text-white">
        {label}
      </Text>
    </View>
  );
}

function NotificationCard({
  width,
  scale,
  shadowed,
}: {
  width: number;
  scale: number;
  shadowed?: boolean;
}) {
  const s = (n: number) => n * scale;
  return (
    <View
      className="bg-background-day dark:bg-background-night flex-row items-start rounded-xl"
      style={[
        {
          width,
          gap: s(9.8),
          paddingHorizontal: s(9.8),
          paddingVertical: s(13),
        },
        shadowed ? shadow(10, 15, 14, 0.09) : null,
      ]}
    >
      <Avatar source={avatarMom} size={s(45.6)} />
      <View className="flex-1" style={{ gap: s(6.5), opacity: 0.8 }}>
        <View
          className="flex-row flex-wrap items-center"
          style={{ gap: s(6.5) }}
        >
          <Text
            className="font-semibold text-[#1B1B1B] dark:text-white"
            style={{ fontSize: s(13.84) }}
          >
            Mom
          </Text>
          <Text className="text-hint" style={{ fontSize: s(11.26) }}>
            assigned a task to
          </Text>
          <Text
            className="flex-1 font-semibold text-[#1B1B1B] dark:text-white"
            style={{ fontSize: s(13.84) }}
          >
            Dad
          </Text>
          <View
            className="bg-main rounded-full"
            style={{ width: s(8), height: s(8) }}
          />
        </View>
        <View className="flex-row items-center" style={{ gap: s(4.9) }}>
          <Text className="text-hint" style={{ fontSize: s(9.3) }}>
            April 4
          </Text>
          <View
            className="bg-hint rounded-full"
            style={{ width: s(2.4), height: s(2.4) }}
          />
          <Text className="text-hint" style={{ fontSize: s(11.4) }}>
            13:23
          </Text>
        </View>
        <View
          className="dark:bg-transparent-night rounded-lg bg-black/[0.06]"
          style={{ padding: s(9.8) }}
        >
          <Text
            className="dark:text-hint text-black"
            style={{ fontSize: s(13.84) }}
          >
            Organize the garage.
          </Text>
        </View>
      </View>
    </View>
  );
}

function CategoryCard({
  label,
  tint,
  icon,
}: {
  label: string;
  tint: string;
  icon: React.ReactNode;
}) {
  return (
    <View
      className="bg-background-day dark:bg-background-night w-[122px] gap-[30px] rounded-xl p-[10.5px]"
      style={shadow(10, 14, 13, 0.09)}
    >
      <View
        className="size-[35px] items-center justify-center rounded-full"
        style={{ backgroundColor: tint }}
      >
        {icon}
      </View>
      <Text className="text-[14.8px] font-medium text-[#1B1B1B] dark:text-white">
        {label}
      </Text>
    </View>
  );
}
