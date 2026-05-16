/**
 * Background canvas layers — fixed viewport の最下層, theme.background.layers を
 * 下から上に重ねる. parallax は β 以降 (= scroll 量に応じて translate3d).
 */

import type { PersonaTheme } from "@/lib/uranai/theme/types";

interface Props {
  theme: PersonaTheme;
}

export function BackgroundLayers({ theme }: Props) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ backgroundColor: theme.background.baseColor }}
      aria-hidden
    >
      {theme.background.layers.map((layer, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${layer.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: layer.opacity ?? 1,
            mixBlendMode: layer.blendMode ?? "normal",
          }}
        />
      ))}
    </div>
  );
}
