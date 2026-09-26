import { BookOpen, Carrot, Cookie, Dumbbell, Footprints, Gem, Headphones, Laptop, Puzzle, Shirt, Smartphone, Sofa, Sparkles, type LucideIcon } from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  grocery: Carrot,
  snacks: Cookie,
  fashion: Shirt,
  beauty: Sparkles,
  electronics: Headphones,
  laptops: Laptop,
  mobiles: Smartphone,
  jewellery: Gem,
  home: Sofa,
  sports: Dumbbell,
  books: BookOpen,
  toys: Puzzle,
  footwear: Footprints,
};

export function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const Icon = CATEGORY_ICONS[category] ?? Sparkles;
  return <Icon className={className} />;
}
