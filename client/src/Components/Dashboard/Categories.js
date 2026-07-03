import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://festpro-yvwm.onrender.com/categories');
        setCategories(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate('/venues', { state: { categoryId } });
  };


  const getCategoryIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'wedding':
        return '💍';
      case 'birthday':
        return '🎂';
      case 'conference':
        return '🏢';
      case 'concert':
        return '🎶';
      case 'party':
        return '🎉';
      case 'seminar':
        return '📚';
      case 'exhibition':
        return '🖼️';
      case 'sports':
        return '⚽';
      case 'engagement':
        return '💑';
      default:
        return '🎭';
    }
  };
  if (loading) return <div className="loading-spinner">Loading categories...</div>;
  if (error) return <div className="error-message">Error loading categories: {error}</div>;

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Categories</h2>
      </div>
      <div className="categories">
        {categories.map((category) => (
          <div
            key={category.id}
            className="category-item"
            onClick={() => handleCategoryClick(category.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="category-icon">
              {getCategoryIcon(category.name)}
            </div>

            <div className="category-name category-badge">{category.name}</div>
          </div>

        ))}
        <div className="category-item" >
          <div className="category-icon">🎭 </div>

          <div className="category-name category-badge"><a style={{ textDecoration: "none", color: "#ffffff" }} href='/explore'>All categories</a></div></div>
      </div>

    </div>
  );
};

export default Categories;
