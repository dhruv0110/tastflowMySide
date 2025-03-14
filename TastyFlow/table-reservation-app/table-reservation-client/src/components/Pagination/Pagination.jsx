// Pagination Logic
const Pagination = ({ totalItems, itemsPerPage, currentPage, paginate }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
  
    // Function to generate pagination buttons with ellipsis
    const getPaginationButtons = () => {
      const buttons = [];
      const maxVisibleButtons = 3; // Maximum number of visible buttons
      const halfVisibleButtons = Math.floor(maxVisibleButtons / 4);
  
      // Always show the first page
      buttons.push(
        <button
          key={1}
          onClick={() => paginate(1)}
          className={`pagination-button ${currentPage === 1 ? "active" : ""}`}
        >
          1
        </button>
      );
  
      // Add ellipsis if current page is far from the start
      if (currentPage > halfVisibleButtons + 1) {
        buttons.push(<span key="start-ellipsis">...</span>);
      }
  
      // Generate visible buttons around the current page
      for (
        let i = Math.max(2, currentPage - halfVisibleButtons);
        i <= Math.min(totalPages - 1, currentPage + halfVisibleButtons);
        i++
      ) {
        buttons.push(
          <button
            key={i}
            onClick={() => paginate(i)}
            className={`pagination-button ${currentPage === i ? "active" : ""}`}
          >
            {i}
          </button>
        );
      }
  
      // Add ellipsis if current page is far from the end
      if (currentPage < totalPages - halfVisibleButtons) {
        buttons.push(<span key="end-ellipsis">...</span>);
      }
  
      // Always show the last page
      if (totalPages > 1) {
        buttons.push(
          <button
            key={totalPages}
            onClick={() => paginate(totalPages)}
            className={`pagination-button ${
              currentPage === totalPages ? "active" : ""
            }`}
          >
            {totalPages}
          </button>
        );
      }
  
      return buttons;
    };
  
    return (
      <div className="pagination">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>
        {getPaginationButtons()}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    );
  };

  export default Pagination;