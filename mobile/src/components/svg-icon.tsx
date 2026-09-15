import type { Art } from "@/assets/icons";
import { SvgXml } from "react-native-svg";

/**
 * Renders a Figma-exported icon at a given size. Pass `color` to tint a
 * single-colour glyph: every fill/stroke that isn't "none" is swapped.
 */
export function SvgIcon({
  art,
  size = 24,
  color,
}: {
  art: Art;
  size?: number;
  color?: string;
}) {
  const xml = color
    ? art.xml.replace(/(fill|stroke)="(?!none")[^"]*"/gi, `$1="${color}"`)
    : art.xml;
  return <SvgXml xml={xml} width={size} height={(size * art.h) / art.w} />;
}
