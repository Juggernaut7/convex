"use client";

import { ChangeEvent, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type MarketCategory } from "@/types/market";
import { cn } from "@/lib/utils";

type MarketFilterBarProps = {
  categories?: MarketCategory[];
  activeCategory: MarketCategory | "All";
  onCategoryChange: (category: MarketCategory | "All") => void;
  onSearchChange: (value: string) => void;
  defaultSearch?: string;
  showFiltersButton?: boolean;
};

export function MarketFilterBar({
  categories = ["Sports", "Crypto", "Culture", "Custom"],
  activeCategory,
  onCategoryChange,
  onSearchChange,
  defaultSearch = "",
  showFiltersButton = true,
}: MarketFilterBarProps) {
  const [search, setSearch] = useState(defaultSearch);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const categoryOptions: (MarketCategory | "All")[] =
    categories.length > 0 ? (["All", ...categories] as (MarketCategory | "All")[]) : [];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-3">
          <Search className="h-4 w-4 text-[#6B7280]" />
          <Input
            value={search}
            onChange={(event: ChangeEvent<HTMLInputElement>) => handleSearchChange(event.target.value)}
            className="h-10 border-0 bg-transparent px-0 text-sm focus:ring-0 focus-visible:ring-0"
            placeholder="Search markets"
          />
        </div>
        {showFiltersButton && (
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-2xl border-[#E5E7EB] bg-white text-sm font-semibold text-[#4B5563] hover:bg-[#F3F4F6] sm:w-auto"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#35D07F]" />
            Filters
          </Button>
        )}
      </div>
      {categoryOptions.length > 0 && (
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          {categoryOptions.map((categoryOption) => (
            <button
              key={categoryOption}
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition sm:flex-none",
                activeCategory === categoryOption
                  ? "bg-[#35D07F] text-white shadow-sm"
                  : "bg-[#F3F4F6] text-[#4B5563]"
              )}
              onClick={() => onCategoryChange(categoryOption as MarketCategory | "All")}
            >
              {categoryOption}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
