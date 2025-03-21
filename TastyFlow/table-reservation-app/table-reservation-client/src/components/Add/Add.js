import React, { useState } from 'react';
import './Add.css';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Howl } from 'howler';

const Add = () => {
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Salad',
    ingredients: [],
    preparationSteps: [],
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
    },
    reviews: [], // Reviews array
    similarDishes: [],
  });

  const [reviewInput, setReviewInput] = useState({
    text: '',
    author: '',
    rating: 0,
  });

  const foodAdd = new Howl({
    src: ['/sounds/success.mp3'], // Path to your success sound file
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onArrayChangeHandler = (event, field) => {
    const { value } = event.target;
    setData((prevData) => ({
      ...prevData,
      [field]: value.split(',').map((item) => item.trim()), // Split by comma and trim whitespace
    }));
  };

  const onNutritionChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({
      ...prevData,
      nutritionalInfo: {
        ...prevData.nutritionalInfo,
        [name]: Number(value),
      },
    }));
  };

  const onReviewChangeHandler = (event) => {
    const { name, value } = event.target;
    setReviewInput((prevReview) => ({
      ...prevReview,
      [name]: value,
    }));
  };

  const addReview = () => {
    if (reviewInput.text && reviewInput.author && reviewInput.rating > 0) {
      const newReview = {
        text: reviewInput.text,
        author: reviewInput.author,
        rating: Number(reviewInput.rating),
        date: new Date().toISOString(),
      };
      setData((prevData) => ({
        ...prevData,
        reviews: [...prevData.reviews, newReview],
      }));
      setReviewInput({ text: '', author: '', rating: 0 }); // Reset review input fields
      toast.success('Review added successfully!');
    } else {
      toast.error('Please fill all review fields and provide a valid rating.');
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', Number(data.price));
    formData.append('category', data.category);
    formData.append('image', image);
    formData.append('ingredients', JSON.stringify(data.ingredients)); // Convert array to JSON string
    formData.append('preparationSteps', JSON.stringify(data.preparationSteps)); // Convert array to JSON string
    formData.append('nutritionalInfo', JSON.stringify(data.nutritionalInfo)); // Convert object to JSON string
    formData.append('reviews', JSON.stringify(data.reviews)); // Convert array to JSON string
    formData.append('similarDishes', JSON.stringify(data.similarDishes)); // Convert array to JSON string

    try {
      const response = await axios.post('http://localhost:5000/api/food/admin/add', formData);
      if (response.data.success) {
        setData({
          name: '',
          description: '',
          price: '',
          category: 'Salad',
          ingredients: [],
          preparationSteps: [],
          nutritionalInfo: {
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
          },
          reviews: [],
          similarDishes: [],
        });
        setImage(false);
        foodAdd.play();
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('An error occurred while adding the food item.');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="add">
        <form className="flex-col" onSubmit={onSubmitHandler}>
          {/* Image Upload */}
          <div className="add-img-upload flex-col">
            <p>Upload Image</p>
            <label htmlFor="image">
              <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
            </label>
            <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden required />
          </div>

          {/* Product Name */}
          <div className="add-product-name flex-col">
            <p>Product Name</p>
            <input onChange={onChangeHandler} value={data.name} type="text" name="name" placeholder="Type here" required />
          </div>

          {/* Product Description */}
          <div className="add-product-description flex-col">
            <p>Product Description</p>
            <textarea
              onChange={onChangeHandler}
              value={data.description}
              name="description"
              rows="6"
              placeholder="Write content here"
              required
            ></textarea>
          </div>

          {/* Ingredients */}
          <div className="add-ingredients flex-col">
            <p>Ingredients (comma-separated)</p>
            <input
              onChange={(e) => onArrayChangeHandler(e, 'ingredients')}
              value={data.ingredients.join(', ')}
              type="text"
              name="ingredients"
              placeholder="e.g., Fresh tomatoes, Basil leaves, Mozzarella cheese"
              required
            />
          </div>

          {/* Preparation Steps */}
          <div className="add-preparation-steps flex-col">
            <p>Preparation Steps (comma-separated)</p>
            <input
              onChange={(e) => onArrayChangeHandler(e, 'preparationSteps')}
              value={data.preparationSteps.join(', ')}
              type="text"
              name="preparationSteps"
              placeholder="e.g., Slice tomatoes, Layer with cheese, Bake for 20 minutes"
              required
            />
          </div>

          {/* Nutritional Information */}
          <div className="add-nutritional-info flex-col">
            <p>Nutritional Information</p>
            <div className="nutrition-fields">
              <div className="nutrition-field">
                <label>Calories (kcal)</label>
                <input
                  onChange={onNutritionChangeHandler}
                  value={data.nutritionalInfo.calories}
                  type="number"
                  name="calories"
                  placeholder="Calories"
                  required
                />
              </div>
              <div className="nutrition-field">
                <label>Protein (g)</label>
                <input
                  onChange={onNutritionChangeHandler}
                  value={data.nutritionalInfo.protein}
                  type="number"
                  name="protein"
                  placeholder="Protein"
                  required
                />
              </div>
              <div className="nutrition-field">
                <label>Carbohydrates (g)</label>
                <input
                  onChange={onNutritionChangeHandler}
                  value={data.nutritionalInfo.carbohydrates}
                  type="number"
                  name="carbohydrates"
                  placeholder="Carbohydrates"
                  required
                />
              </div>
              <div className="nutrition-field">
                <label>Fat (g)</label>
                <input
                  onChange={onNutritionChangeHandler}
                  value={data.nutritionalInfo.fat}
                  type="number"
                  name="fat"
                  placeholder="Fat"
                  required
                />
              </div>
              <div className="nutrition-field">
                <label>Fiber (g)</label>
                <input
                  onChange={onNutritionChangeHandler}
                  value={data.nutritionalInfo.fiber}
                  type="number"
                  name="fiber"
                  placeholder="Fiber"
                  required
                />
              </div>
              <div className="nutrition-field">
                <label>Sugar (g)</label>
                <input
                  onChange={onNutritionChangeHandler}
                  value={data.nutritionalInfo.sugar}
                  type="number"
                  name="sugar"
                  placeholder="Sugar"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category and Price */}
          <div className="add-category-price">
            <div className="add-category flex-col">
              <p>Product Category</p>
              <select onChange={onChangeHandler} name="category" value={data.category}>
                <option value="Salad">Salad</option>
                <option value="Rolls">Rolls</option>
                <option value="Deserts">Deserts</option>
                <option value="Sandwich">Sandwich</option>
                <option value="Cake">Cake</option>
                <option value="Pure Veg">Pure Veg</option>
                <option value="Pasta">Pasta</option>
                <option value="Noodles">Noodles</option>
              </select>
            </div>
            <div className="add-price flex-col">
              <p>Product Price</p>
              <input
                onChange={onChangeHandler}
                value={data.price}
                type="number"
                name="price"
                placeholder="$20"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="add-btn">
            ADD
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;