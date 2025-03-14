import React, { useState, useEffect } from 'react';
import './List.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar/Sidebar';
import CrossIcon from '../CrossIcon/CrossIcon';

const List = () => {
  const [list, setList] = useState([]);
  const [nameFilter, setNameFilter] = useState(''); // Filter for Name
  const [categoryFilter, setCategoryFilter] = useState(''); // Filter for Category
  const [priceFilter, setPriceFilter] = useState(''); // Filter for Price

  const fetchList = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/food/list");
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error fetching the food list");
      }
    } catch (error) {
      toast.error("An error occurred while fetching the food list");
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

  // Clear all filters
  const clearFilters = () => {
    setNameFilter('');
    setCategoryFilter('');
    setPriceFilter('');
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Filter the list based on all filter criteria
  const filteredList = list.filter((item) => {
    const matchesName = item.name.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesCategory = item.category.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesPrice = item.price.toString().includes(priceFilter);
    return matchesName && matchesCategory && matchesPrice;
  });

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="list">
        <form className="list-form flex-col">
          <h1 className="header">All Foods List</h1>
          <div className="list-table">
            <div className="list-table-format title">
              <b>Image</b>
              <b>Name</b>
              <b>Category</b>
              <b>Price</b>
              <b>Action</b>
            </div>
            {/* Filter Inputs Row */}
            <div className="list-table-format filter-row">
              <div></div> {/* Placeholder for Image column */}
              <input
                type="text"
                placeholder="Filter by Name"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="filter-input"
              />
              <input
                type="text"
                placeholder="Filter by Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-input"
              />
              <input
                type="text"
                placeholder="Filter by Price"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="filter-input"
              />
              <button
                type="button"
                onClick={clearFilters}
                className="clear-filter-button"
              >
                Clear
              </button>
            </div>
            {/* Display Filtered List */}
            {filteredList.length === 0 ? (
              <div className="no-data-message">No matching food items found.</div>
            ) : (
              filteredList.map((item, index) => (
                <div key={index} className="list-table-format">
                  <img src={`http://localhost:5000/uploads/${item.image}`} alt={item.name} />
                  <p>{item.name}</p>
                  <p>{item.category}</p>
                  <p>${item.price}</p>
                  <CrossIcon onClick={() => removeFood(item._id)} />
                </div>
              ))
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default List;