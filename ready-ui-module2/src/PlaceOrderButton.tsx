import React from 'react';
import { getUserId, getUserFullName, getUserLocation, getUserIdToken } from './utils/authUtils';
import { useMsal } from "@azure/msal-react";

interface PlaceOrderButtonProps {
  cartItems: string[];
  clearCart: () => void;
}

const PlaceOrderButton: React.FC<PlaceOrderButtonProps> = ({ cartItems, clearCart }) => {
  const { instance } = useMsal();

  const placeOrder = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        console.error('API URL is not configured');
        alert('Configuration error. Please contact support.');
        return;
      }
      const userId = getUserId(instance);
      const fullName = getUserFullName(instance);
      const location = await getUserLocation(instance);
      const idToken = await getUserIdToken(instance);

      if (!userId || !fullName || !location || !idToken) {
        console.error('User information is incomplete', { userId, fullName, location, idToken });
        alert('User information is incomplete. Please check your profile settings.');
        return;
      }

      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          userId,
          fullName,
          location,
          items: cartItems.map(itemId => ({ productId: itemId })),
        }),
      });

      if (!response.ok) {
        alert('Failed to place order. Please try again.');
        return;
      }
      const data = await response.json();
      if (!data || typeof data !== 'object') {
        console.error('Invalid response data');
        return;
      }
      alert('Order placed successfully!');
      clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
      logError('Error placing order:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <button
      onClick={placeOrder}
      style={{
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      Place Order
    </button>
  );
};

function logError(message: string, error: any) {
  console.error(message, error);
}

export default PlaceOrderButton;
