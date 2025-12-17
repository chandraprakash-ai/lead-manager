import { ChevronLeft, ChevronRight } from 'lucide-react';
import './LeadsPagination.css';


interface LeadsPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (num: number) => void;
}

export const LeadsPagination = ({
    currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange
}: LeadsPaginationProps) => {

    // Generate page numbers (simplified logic for now)
    const getPageNumbers = () => {
        const pages = [];
        // Max 5 pages shown logic could go here, keeping it simple: all if < 7, else ellipsize
        // adhering to "Vanilla" requests, let's keep it clean
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Very simple split
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    if (totalItems === 0) return null;

    return (
        <div className="leads-pagination">
            <div className="pagination-info">
                <span>Showing <strong>{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</strong> to <strong>{Math.min(currentPage * itemsPerPage, totalItems)}</strong> of <strong>{totalItems}</strong> entries</span>
                <select
                    className="pagination-select"
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>

            <div className="pagination-controls">
                <button
                    className="page-btn nav"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map((p, i) => (
                    typeof p === 'number' ? (
                        <button
                            key={i}
                            className={`page-btn ${currentPage === p ? 'active' : ''}`}
                            onClick={() => onPageChange(p)}
                        >
                            {p}
                        </button>
                    ) : (
                        <span key={i} className="pagination-ellipsis">...</span>
                    )
                ))}

                <button
                    className="page-btn nav"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};
