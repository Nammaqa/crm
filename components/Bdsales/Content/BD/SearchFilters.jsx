"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";

export default function SearchFilters({
  filters,
  onFilterChange,
  onClearFilters,
}) {
  const handleInputChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, val]) => key !== "status" && val !== ""
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-5">
        {/* <div className="p-2 bg-blue-50 rounded-lg"> */}
          {/* <Filter className="w-5 h-5 text-blue-600" /> */}
        </div>
        {/* <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3> */}
      {/* </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Company Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search company..."
              value={filters.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              className="pl-10 h-11 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
        </div>

        {/* Sales Owner */}
        {/* <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Sales Owner
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search owner..."
              value={filters.salesOwner}
              onChange={(e) => handleInputChange("salesOwner", e.target.value)}
              className="pl-10 h-11 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
        </div> */}

        {/* Date From */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Date From
          </label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleInputChange("dateFrom", e.target.value)}
            className="h-11 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>

        {/* Date To */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Date To
          </label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleInputChange("dateTo", e.target.value)}
            className="h-11 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mt-5 flex justify-end">
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="h-10 px-5 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-all"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
