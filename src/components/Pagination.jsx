import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-white/20">
            <div className="text-xs text-white/60 font-mono uppercase tracking-widest">
                Showing <span className="font-black text-[#CCFF00]">{startItem}</span> to <span className="font-black text-[#CCFF00]">{endItem}</span> of <span className="font-black text-[#CCFF00]">{totalItems}</span> results
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-white/20 text-white hover:bg-white hover:text-black hover:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous Page"
                >
                    <ChevronLeft size={20} className="stroke-[3px]" />
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
                                className={`w-10 h-10 text-sm font-black transition-colors border ${currentPage === pageNum
                                        ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                                        : 'text-white border-white/20 hover:bg-white/10 hover:border-white'
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
                    className="p-2 border border-white/20 text-white hover:bg-white hover:text-black hover:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next Page"
                >
                    <ChevronRight size={20} className="stroke-[3px]" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
