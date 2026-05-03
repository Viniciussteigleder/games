interface PaintColor {
  paint: string;
  dark: string;
  glow: string;
}

export const LEVEL_COLORS: PaintColor[] = [
  { paint: "hsl(165,90%,52%)",  dark: "hsl(165,90%,35%)",  glow: "hsla(165,90%,52%,0.45)"  }, // 1  Teal
  { paint: "hsl(190,95%,52%)",  dark: "hsl(190,95%,35%)",  glow: "hsla(190,95%,52%,0.45)"  }, // 2  Cyan
  { paint: "hsl(210,90%,60%)",  dark: "hsl(210,90%,42%)",  glow: "hsla(210,90%,60%,0.45)"  }, // 3  Sky
  { paint: "hsl(250,85%,65%)",  dark: "hsl(250,85%,47%)",  glow: "hsla(250,85%,65%,0.45)"  }, // 4  Indigo
  { paint: "hsl(280,90%,65%)",  dark: "hsl(280,90%,47%)",  glow: "hsla(280,90%,65%,0.45)"  }, // 5  Violet
  { paint: "hsl(310,85%,62%)",  dark: "hsl(310,85%,44%)",  glow: "hsla(310,85%,62%,0.45)"  }, // 6  Magenta
  { paint: "hsl(340,90%,60%)",  dark: "hsl(340,90%,42%)",  glow: "hsla(340,90%,60%,0.45)"  }, // 7  Rose
  { paint: "hsl(10,90%,60%)",   dark: "hsl(10,90%,42%)",   glow: "hsla(10,90%,60%,0.45)"   }, // 8  Coral
  { paint: "hsl(28,95%,57%)",   dark: "hsl(28,95%,39%)",   glow: "hsla(28,95%,57%,0.45)"   }, // 9  Orange
  { paint: "hsl(45,100%,54%)",  dark: "hsl(45,100%,36%)",  glow: "hsla(45,100%,54%,0.45)"  }, // 10 Amber
  { paint: "hsl(62,90%,50%)",   dark: "hsl(62,90%,34%)",   glow: "hsla(62,90%,50%,0.45)"   }, // 11 Lime
  { paint: "hsl(140,80%,48%)",  dark: "hsl(140,80%,32%)",  glow: "hsla(140,80%,48%,0.45)"  }, // 12 Green
  { paint: "hsl(157,88%,48%)",  dark: "hsl(157,88%,32%)",  glow: "hsla(157,88%,48%,0.45)"  }, // 13 Emerald
  { paint: "hsl(174,85%,48%)",  dark: "hsl(174,85%,32%)",  glow: "hsla(174,85%,48%,0.45)"  }, // 14 Jade
  { paint: "hsl(195,92%,52%)",  dark: "hsl(195,92%,36%)",  glow: "hsla(195,92%,52%,0.45)"  }, // 15 Azure
  { paint: "hsl(225,88%,62%)",  dark: "hsl(225,88%,44%)",  glow: "hsla(225,88%,62%,0.45)"  }, // 16 Blue
  { paint: "hsl(266,90%,66%)",  dark: "hsl(266,90%,48%)",  glow: "hsla(266,90%,66%,0.45)"  }, // 17 Purple
  { paint: "hsl(295,85%,62%)",  dark: "hsl(295,85%,44%)",  glow: "hsla(295,85%,62%,0.45)"  }, // 18 Orchid
  { paint: "hsl(325,88%,60%)",  dark: "hsl(325,88%,42%)",  glow: "hsla(325,88%,60%,0.45)"  }, // 19 Pink
  { paint: "hsl(355,88%,60%)",  dark: "hsl(355,88%,42%)",  glow: "hsla(355,88%,60%,0.45)"  }, // 20 Red
];

export const DAILY_COLOR: PaintColor = {
  paint: "hsl(45,100%,55%)",
  dark:  "hsl(45,100%,37%)",
  glow:  "hsla(45,100%,55%,0.5)",
};

export function getLevelColor(levelId: number, isDaily = false): PaintColor {
  if (isDaily) return DAILY_COLOR;
  return LEVEL_COLORS[(levelId - 1) % LEVEL_COLORS.length];
}
