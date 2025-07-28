import axios from 'axios';

// Add item to cart (works for both guest and authenticated users)
export const addToCart = async (productId, quantity = 1, authContext) => {
  try {
    const { getCurrentSessionId, getSessionType, getAuthHeaders } = authContext;
    const sessionId = getCurrentSessionId();
    const sessionType = getSessionType();

    if (sessionType === 'user') {
      // Add to user cart
      const response = await axios.post('http://localhost:5000/api/cart', {
        userId: sessionId,
        productId,
        quantity
      }, {
        headers: getAuthHeaders()
      });
      
      return { success: true, message: 'Item added to cart successfully' };
    } else {
      // Add to guest cart
      const response = await axios.post('http://localhost:5000/api/guest-cart/add', {
        sessionId,
        productId,
        quantity
      });
      
      return { success: true, message: 'Item added to cart successfully' };
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to add item to cart' 
    };
  }
};

// Add item to favorites (works for both guest and authenticated users)
export const addToFavorites = async (productId, authContext) => {
  try {
    const { getCurrentSessionId, getSessionType, getAuthHeaders } = authContext;
    const sessionId = getCurrentSessionId();
    const sessionType = getSessionType();

    if (sessionType === 'user') {
      // Add to user favorites (you'll need to create this endpoint)
      const response = await axios.post('http://localhost:5000/api/user/favorites', {
        productId
      }, {
        headers: getAuthHeaders()
      });
      
      return { success: true, message: 'Item added to favorites successfully' };
    } else {
      // Add to guest favorites
      const response = await axios.post('http://localhost:5000/api/guest-favorites/add', {
        sessionId,
        productId
      });
      
      return { success: true, message: 'Item added to favorites successfully' };
    }
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to add item to favorites' 
    };
  }
};

// Remove item from favorites
export const removeFromFavorites = async (productId, authContext) => {
  try {
    const { getCurrentSessionId, getSessionType, getAuthHeaders } = authContext;
    const sessionId = getCurrentSessionId();
    const sessionType = getSessionType();

    if (sessionType === 'user') {
      // Remove from user favorites
      await axios.delete(`http://localhost:5000/api/user/favorites/${productId}`, {
        headers: getAuthHeaders()
      });

      return { success: true, message: 'Item removed from favorites successfully' };
    } else {
      // Remove from guest favorites
      await axios.delete('http://localhost:5000/api/guest-favorites/remove', {
        data: { sessionId, productId }
      });

      return { success: true, message: 'Item removed from favorites successfully' };
    }
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to remove item from favorites'
    };
  }
};

// Get cart
export const getCart = async (authContext) => {
  try {
    const { getCurrentSessionId, getSessionType, getAuthHeaders } = authContext;
    const sessionId = getCurrentSessionId();
    const sessionType = getSessionType();

    if (sessionType === 'user') {
      // Get user cart
      const response = await axios.get(`http://localhost:5000/api/cart/${sessionId}`, {
        headers: getAuthHeaders()
      });

      return { success: true, cart: response.data || { items: [] } };
    } else {
      // Get guest cart
      const response = await axios.get(`http://localhost:5000/api/guest-cart/${sessionId}`);

      return { success: true, cart: response.data || { items: [] } };
    }
  } catch (error) {
    console.error('Error getting cart:', error);
    return { success: false, cart: { items: [] } };
  }
};

// Get favorites
export const getFavorites = async (authContext) => {
  try {
    const { getCurrentSessionId, getSessionType, getAuthHeaders } = authContext;
    const sessionId = getCurrentSessionId();
    const sessionType = getSessionType();

    if (sessionType === 'user') {
      // Get user favorites
      const response = await axios.get('http://localhost:5000/api/user/favorites', {
        headers: getAuthHeaders()
      });
      
      return { success: true, favorites: response.data.favorites || [] };
    } else {
      // Get guest favorites
      const response = await axios.get(`http://localhost:5000/api/guest-favorites/${sessionId}`);
      
      return { success: true, favorites: response.data.favorites || [] };
    }
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return { success: false, favorites: [] };
  }
};

// Check if item is in favorites
export const isInFavorites = async (productId, authContext) => {
  try {
    const { getCurrentSessionId, getSessionType, getAuthHeaders } = authContext;
    const sessionId = getCurrentSessionId();
    const sessionType = getSessionType();

    if (sessionType === 'user') {
      // Check user favorites
      const response = await axios.get(`http://localhost:5000/api/user/favorites/check/${productId}`, {
        headers: getAuthHeaders()
      });

      return { success: true, isFavorite: response.data.isFavorite };
    } else {
      // Check guest favorites
      const response = await axios.get(`http://localhost:5000/api/guest-favorites/check/${sessionId}/${productId}`);

      return { success: true, isFavorite: response.data.isFavorite };
    }
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return { success: false, isFavorite: false };
  }
};
