'use client';

import { SearchIcon } from 'lucide-react';

interface ProjectFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'updated' | 'created' | 'name';
  onSortChange: (sort: 'updated' | 'created' | 'name') => void;
}

export default function ProjectFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as 'updated' | 'created' | 'name')}
        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="updated">Last Updated</option>
        <option value="created">Date Created</option>
        <option value="name">Name</option>
      </select>
    </div>
  );
}
