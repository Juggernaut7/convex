"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MarketCategory } from "@/types/market";
import { cn } from "@/lib/utils";

const categories: (MarketCategory | "All")[] = ["All", "Sports", "Crypto", "Culture", "Custom"];

type CategoryTabsProps = {
  activeCategory: MarketCategory;
  basePath?: string;
};

export function CategoryTabs({ activeCategory, basePath = "/markets" }: CategoryTabsProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const href = category === "All" ? basePath : `${basePath}/${category.toLowerCase()}`;
        const isActive =
          (category === "All" && pathname === basePath) ||
          pathname === href;

        return (
          <Link
            key={category}
            href={href}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold transition",
              isActive
                ? "bg-[#35D07F] text-white shadow-sm"
                : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5F5EE]"
            )}
          >
            {category}
          </Link>
        );
      })}
    </div>
  );
}


