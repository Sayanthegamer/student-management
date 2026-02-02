import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="app-container flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar Skeleton (Desktop only mostly, but we can show it) */}
      <div className="hidden md:flex w-[260px] flex-col gap-4 p-4 border-r border-slate-200 bg-white h-full shrink-0">
        {/* Logo/Header */}
        <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse mb-6"></div>
        {/* Nav Items */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-full bg-slate-100 rounded-lg animate-pulse"></div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header Skeleton */}
        <div className="md:hidden h-16 border-b border-slate-200 bg-white flex items-center px-4 gap-4">
             <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
             <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
        </div>

        {/* Page Content */}
        <div className="p-6 flex flex-col gap-6 h-full overflow-y-auto">
             {/* Page Title */}
             <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>

             {/* Stats Cards Row */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 {Array.from({ length: 4 }).map((_, i) => (
                     <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse"></div>
                 ))}
             </div>

             {/* Main Table/Card Area */}
             <div className="flex-1 bg-white rounded-2xl border border-slate-100 animate-pulse min-h-[400px]"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
