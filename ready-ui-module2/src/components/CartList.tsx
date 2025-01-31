import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import CartQuantityUpdater from './CartQuantityUpdater';
import CartItemRemover from './CartItemRemover';

interface CartItem {
  id: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
  availableStock: number;
}

const CartList: React.FC = () => {
  const { cartItems: cartItemIds } = useCart();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const responses = await Promise.all(
          cartItemIds.map((id) => axios.get(`/api/books/${id}`))
        );
        const items = responses.map((response) => response.data);
        setCartItems(items);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, [cartItemIds]);

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prevItems: CartItem[]) =>
      prevItems.map((item: CartItem) =>
        item.id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.availableStock)) } : item
      )
    );
    axios.put(`/api/books/${id}`, { quantity })
      .catch(error => console.error('Error updating quantity:', error));
  };

  const removeItem = (id: string) => {
    setCartItems((prevItems: CartItem[]) => prevItems.filter((item: CartItem) => item.id !== id));
    axios.delete(`/api/books/${id}`)
      .catch(error => console.error('Error removing item:', error));
  };

  const calculateSubtotal = (item: CartItem) => item.price * item.quantity;

  const calculateTotal = () => cartItems.reduce((total: number, item: CartItem) => total + calculateSubtotal(item), 0);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-lg font-semibold">Your cart is empty</p>
        <a href="/shop" className="text-blue-500 hover:underline">Continue Shopping</a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      <ul className="space-y-4">
        {cartItems.map((item: CartItem) => (
          <li key={item.id} className="border p-4 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="text-gray-600">Author: {item.author}</p>
            <p className="text-gray-600">Price: ${item.price.toFixed(2)}</p>
            <CartQuantityUpdater
              id={item.id}
              quantity={item.quantity}
              availableStock={item.availableStock}
              onUpdateQuantity={updateQuantity}
            />
            <p className="text-gray-600">Subtotal: ${calculateSubtotal(item).toFixed(2)}</p>
            <CartItemRemover id={item.id} onRemoveItem={removeItem} />
          </li>
        ))}
      </ul>
      <h3 className="text-xl font-bold mt-4">Total: ${calculateTotal().toFixed(2)}</h3>
    </div>
  );
};

export default CartList;
