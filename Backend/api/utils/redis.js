import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Helper function to generate session ID for guest users
export const generateSessionId = () => {
  return 'guest_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
};

// Cart operations for guest users
export const guestCartOperations = {
  // Add item to guest cart
  async addItem(sessionId, productId, quantity = 1) {
    try {
      const cartKey = `cart:${sessionId}`;
      const existingItem = await redis.hget(cartKey, productId);
      
      if (existingItem) {
        const currentQuantity = parseInt(existingItem);
        await redis.hset(cartKey, { [productId]: currentQuantity + quantity });
      } else {
        await redis.hset(cartKey, { [productId]: quantity });
      }
      
      // Set expiration for 5 days
      await redis.expire(cartKey, 5 * 24 * 60 * 60);
      
      return { success: true, message: 'Item added to cart' };
    } catch (error) {
      console.error('Redis cart add error:', error);
      return { success: false, message: 'Failed to add item to cart' };
    }
  },

  // Get guest cart items
  async getCart(sessionId) {
    try {
      const cartKey = `cart:${sessionId}`;
      const cartItems = await redis.hgetall(cartKey);
      
      if (!cartItems || Object.keys(cartItems).length === 0) {
        return { success: true, items: [] };
      }
      
      // Convert to array format
      const items = Object.entries(cartItems).map(([productId, quantity]) => ({
        productId: parseInt(productId),
        quantity: parseInt(quantity)
      }));
      
      return { success: true, items };
    } catch (error) {
      console.error('Redis cart get error:', error);
      return { success: false, items: [] };
    }
  },

  // Update item quantity in guest cart
  async updateQuantity(sessionId, productId, quantity) {
    try {
      const cartKey = `cart:${sessionId}`;

      console.log('=== REDIS UPDATE ===');
      console.log('Cart Key:', cartKey);
      console.log('Product ID:', productId);
      console.log('Quantity:', quantity);

      if (quantity <= 0) {
        console.log('Deleting item from Redis');
        await redis.hdel(cartKey, productId);
      } else {
        console.log('Setting quantity in Redis');
        await redis.hset(cartKey, { [productId]: quantity });
      }

      // Verify the update
      const updatedCart = await redis.hgetall(cartKey);
      console.log('Updated cart in Redis:', updatedCart);

      return { success: true, message: 'Cart updated' };
    } catch (error) {
      console.error('Redis cart update error:', error);
      return { success: false, message: 'Failed to update cart' };
    }
  },

  // Remove item from guest cart
  async removeItem(sessionId, productId) {
    try {
      const cartKey = `cart:${sessionId}`;
      await redis.hdel(cartKey, productId);
      
      return { success: true, message: 'Item removed from cart' };
    } catch (error) {
      console.error('Redis cart remove error:', error);
      return { success: false, message: 'Failed to remove item' };
    }
  },

  // Clear entire guest cart
  async clearCart(sessionId) {
    try {
      const cartKey = `cart:${sessionId}`;
      await redis.del(cartKey);
      
      return { success: true, message: 'Cart cleared' };
    } catch (error) {
      console.error('Redis cart clear error:', error);
      return { success: false, message: 'Failed to clear cart' };
    }
  }
};

// Favorites operations for guest users
export const guestFavoritesOperations = {
  // Add item to guest favorites
  async addItem(sessionId, productId) {
    try {
      const favKey = `favorites:${sessionId}`;
      await redis.sadd(favKey, productId);
      
      // Set expiration for 5 days
      await redis.expire(favKey, 5 * 24 * 60 * 60);
      
      return { success: true, message: 'Item added to favorites' };
    } catch (error) {
      console.error('Redis favorites add error:', error);
      return { success: false, message: 'Failed to add to favorites' };
    }
  },

  // Get guest favorites
  async getFavorites(sessionId) {
    try {
      const favKey = `favorites:${sessionId}`;
      const favorites = await redis.smembers(favKey);
      
      const items = favorites.map(productId => parseInt(productId));
      
      return { success: true, items };
    } catch (error) {
      console.error('Redis favorites get error:', error);
      return { success: false, items: [] };
    }
  },

  // Remove item from guest favorites
  async removeItem(sessionId, productId) {
    try {
      const favKey = `favorites:${sessionId}`;
      await redis.srem(favKey, productId);
      
      return { success: true, message: 'Item removed from favorites' };
    } catch (error) {
      console.error('Redis favorites remove error:', error);
      return { success: false, message: 'Failed to remove from favorites' };
    }
  },

  // Check if item is in favorites
  async isInFavorites(sessionId, productId) {
    try {
      const favKey = `favorites:${sessionId}`;
      const isMember = await redis.sismember(favKey, productId);

      return { success: true, isFavorite: isMember === 1 };
    } catch (error) {
      console.error('Redis favorites check error:', error);
      return { success: false, isFavorite: false };
    }
  },

  // Clear all favorites for a session
  async clearFavorites(sessionId) {
    try {
      const favKey = `favorites:${sessionId}`;
      await redis.del(favKey);

      return { success: true, message: 'Favorites cleared' };
    } catch (error) {
      console.error('Redis favorites clear error:', error);
      return { success: false, message: 'Failed to clear favorites' };
    }
  }
};

// Session management
export const sessionOperations = {
  // Store session data
  async setSession(sessionId, data) {
    try {
      const sessionKey = `session:${sessionId}`;
      await redis.setex(sessionKey, 7 * 24 * 60 * 60, JSON.stringify(data));
      
      return { success: true };
    } catch (error) {
      console.error('Redis session set error:', error);
      return { success: false };
    }
  },

  // Get session data
  async getSession(sessionId) {
    try {
      const sessionKey = `session:${sessionId}`;
      const data = await redis.get(sessionKey);
      
      return { success: true, data: data ? JSON.parse(data) : null };
    } catch (error) {
      console.error('Redis session get error:', error);
      return { success: false, data: null };
    }
  },

  // Delete session
  async deleteSession(sessionId) {
    try {
      const sessionKey = `session:${sessionId}`;
      await redis.del(sessionKey);
      
      return { success: true };
    } catch (error) {
      console.error('Redis session delete error:', error);
      return { success: false };
    }
  }
};

// Transfer guest data to PostgreSQL when user logs in or checks out
export const transferGuestDataToPostgreSQL = {
  // Transfer guest cart to user cart
  async transferCart(sessionId, userId, pool) {
    try {
      const cartKey = `cart:${sessionId}`;
      const cartItems = await redis.hgetall(cartKey);

      if (!cartItems || Object.keys(cartItems).length === 0) {
        return { success: true, message: 'No cart items to transfer' };
      }

      // Start transaction
      await pool.query('BEGIN');

      for (const [productId, quantity] of Object.entries(cartItems)) {
        // Check if item already exists in user cart
        const existingItem = await pool.query(
          'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
          [userId, productId]
        );

        if (existingItem.rows.length > 0) {
          // Update quantity (add guest quantity to existing)
          await pool.query(
            'UPDATE cart_items SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND product_id = $3',
            [parseInt(quantity), userId, productId]
          );
        } else {
          // Insert new item
          await pool.query(
            'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
            [userId, productId, parseInt(quantity)]
          );
        }
      }

      // Commit transaction
      await pool.query('COMMIT');

      // Clear guest cart from Redis
      await redis.del(cartKey);

      return { success: true, message: 'Cart transferred successfully' };
    } catch (error) {
      // Rollback on error
      await pool.query('ROLLBACK');
      console.error('Cart transfer error:', error);
      return { success: false, message: 'Failed to transfer cart' };
    }
  },

  // Transfer guest favorites to user favorites
  async transferFavorites(sessionId, userId, pool) {
    try {
      const favKey = `favorites:${sessionId}`;
      const favorites = await redis.smembers(favKey);

      if (!favorites || favorites.length === 0) {
        return { success: true, message: 'No favorites to transfer' };
      }

      // Start transaction
      await pool.query('BEGIN');

      for (const productId of favorites) {
        // Check if item already exists in user favorites
        const existingFav = await pool.query(
          'SELECT * FROM user_favorites WHERE user_id = $1 AND product_id = $2',
          [userId, productId]
        );

        if (existingFav.rows.length === 0) {
          // Insert new favorite (avoid duplicates)
          await pool.query(
            'INSERT INTO user_favorites (user_id, product_id) VALUES ($1, $2)',
            [userId, productId]
          );
        }
      }

      // Commit transaction
      await pool.query('COMMIT');

      // Clear guest favorites from Redis
      await redis.del(favKey);

      return { success: true, message: 'Favorites transferred successfully' };
    } catch (error) {
      // Rollback on error
      await pool.query('ROLLBACK');
      console.error('Favorites transfer error:', error);
      return { success: false, message: 'Failed to transfer favorites' };
    }
  },

  // Transfer both cart and favorites
  async transferAll(sessionId, userId, pool) {
    try {
      const cartResult = await this.transferCart(sessionId, userId, pool);
      const favResult = await this.transferFavorites(sessionId, userId, pool);

      return {
        success: cartResult.success && favResult.success,
        cartTransfer: cartResult,
        favoritesTransfer: favResult
      };
    } catch (error) {
      console.error('Full transfer error:', error);
      return { success: false, message: 'Failed to transfer guest data' };
    }
  }
};

// Export both named and default exports for compatibility
export const redisClient = redis;
export default redis;
