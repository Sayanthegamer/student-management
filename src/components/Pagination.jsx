import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{startItem}</span> to <span className="font-medium text-slate-700">{endItem}</span> of <span className="font-medium text-slate-700">{totalItems}</span> results
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous Page"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Logic to show window of pages around current page
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                                        : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next Page"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
