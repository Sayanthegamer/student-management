import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Component for handling pagination navigation.
 *
 * @param {Object} props - The component props.
 * @param {number} props.currentPage - The current active page.
 * @param {number} props.totalPages - The total number of pages.
 * @param {Function} props.onPageChange - Callback function to handle page changes.
 * @param {number} props.totalItems - The total number of items being paginated.
 * @param {number} props.itemsPerPage - The number of items displayed per page.
 * @returns {JSX.Element|null} The rendered pagination component, or null if 1 or fewer pages.
 */
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-[var(--border-color)]">
            <div className="text-xs text-[var(--text-secondary)] font-medium">
                Showing <span className="font-bold text-[var(--text-primary)]">{startItem}</span> to <span className="font-bold text-[var(--text-primary)]">{endItem}</span> of <span className="font-bold text-[var(--text-primary)]">{totalItems}</span> results
            </div>

            <div className="flex flex-wrap justify-center items-center gap-2 w-full sm:w-auto">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] disabled:opacity-50 disabled:hover:border-[var(--border-color)] disabled:hover:text-[var(--text-secondary)] disabled:cursor-not-allowed transition-colors rounded-[12px] flex items-center justify-center shrink-0 min-w-[44px] min-h-[44px]"
                    aria-label="Previous Page"
                >
                    <ChevronLeft size={20} className="stroke-[2.5px]" />
                </button>

                <div className="flex flex-wrap justify-center items-center gap-1 flex-1 sm:flex-none">
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
                                aria-label={`Page ${pageNum}`}
                                aria-current={currentPage === pageNum ? 'page' : undefined}
                                className={`w-11 h-11 sm:w-10 sm:h-10 text-xs sm:text-sm font-bold transition-colors border rounded-[12px] shrink-0 flex items-center justify-center ${currentPage === pageNum
                                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                                        : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]'
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
                    className="p-2 border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] disabled:opacity-50 disabled:hover:border-[var(--border-color)] disabled:hover:text-[var(--text-secondary)] disabled:cursor-not-allowed transition-colors rounded-[12px] flex items-center justify-center shrink-0 min-w-[44px] min-h-[44px]"
                    aria-label="Next Page"
                >
                    <ChevronRight size={20} className="stroke-[2.5px]" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
