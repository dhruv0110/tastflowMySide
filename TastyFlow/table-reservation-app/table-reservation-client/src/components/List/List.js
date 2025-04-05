import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faFilter, faTimes } from '@fortawesome/free-solid-svg-icons';
import Pagination from '../Pagination/Pagination';
import './List.css';

const List = () => {
  const [list, setList] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    category: '',
    price: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);

  const fetchList = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/food/list");
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error fetching the food list");
      }
    } catch (error) {
      toast.error("An error occurred while fetching the food list");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post("http://localhost:5000/api/food/admin/remove", { id: foodId });
      await fetchList();
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error("Error removing the food item");
      }
    } catch (error) {
      toast.error("An error occurred while removing the food item");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      category: '',
      price: ''
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filteredList = list.filter((item) => {
    const matchesName = item.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesCategory = item.category.toLowerCase().includes(filters.category.toLowerCase());
    const matchesPrice = item.price.toString().includes(filters.price);
    return matchesName && matchesCategory && matchesPrice;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <main className="list-content">
        <header className="list-header">
          <h1 className="list-title">
            Food Items Management
          </h1>
          <p className="list-subtitle">View and manage all food items in the system</p>
        </header>

        <div className="list-controls">
          <div className="filter-container">
            <div className="filter-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                placeholder="Filter by name"
                value={filters.name}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>Category:</label>
              <input
                type="text"
                name="category"
                placeholder="Filter by category"
                value={filters.category}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>Price:</label>
              <input
                type="text"
                name="price"
                placeholder="Filter by price"
                value={filters.price}
                onChange={handleFilterChange}
              />
            </div>
            <button 
              onClick={clearFilters}
              className="clear-filters-btn"
              disabled={!filters.name && !filters.category && !filters.price}
            >
              <FontAwesomeIcon icon={faTimes} />
              Clear Filters
            </button>
          </div>

          <div className="items-per-page">
            <label>Items per page:</label>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              {[5, 10, 20, 50].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading food items...</p>
          </div>
        ) : (
          <div className="list-table-container">
            {currentItems.length === 0 ? (
              <div className="empty-state">
                <p>{Object.values(filters).some(Boolean) ? 
                  'No matching food items found' : 
                  'No food items available'}
                </p>
              </div>
            ) : (
              <>
                <div className="list-table-header">
                  <div className="header-cell image-cell">Image</div>
                  <div className="header-cell">Name</div>
                  <div className="header-cell">Category</div>
                  <div className="header-cell">Price</div>
                  <div className="header-cell">Actions</div>
                </div>

                <div className="list-table-body">
                  {currentItems.map((item) => (
                    <div key={item._id} className="list-table-row">
                      <div className="table-cell image-cell">
                        <img 
                          src={`http://localhost:5000/uploads/${item.image}`} 
                          alt={item.name} 
                          className="food-image"
                        />
                      </div>
                      <div className="table-cell">{item.name}</div>
                      <div className="table-cell">{item.category}</div>
                      <div className="table-cell">${item.price.toFixed(2)}</div>
                      <div className="table-cell actions-cell">
                        <button 
                          onClick={() => removeFood(item._id)}
                          className="delete-btn"
                          title="Delete item"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <Pagination
          totalItems={filteredList.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          paginate={paginate}
        />
          </div>
          
        )}

        
      </main>
    </div>
  );
};

export default List;