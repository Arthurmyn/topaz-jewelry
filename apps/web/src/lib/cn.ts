import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The theme's pixel-named font sizes (text-13 ...) must be known to tailwind-merge,
// otherwise it mistakes them for text colors and drops one of the classes.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "12",
            "13",
            "14",
            "15",
            "16",
            "18",
            "20",
            "22",
            "24",
            "28",
            "32",
            "36",
            "40",
            "56",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
