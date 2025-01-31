import React from 'react';
import { Card, Button } from "@nextui-org/react";
import { books } from './data/books';

interface OrderSummaryProps {
  cartItems: string[];
  onPlaceOrder: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cartItems, onPlaceOrder }) => {
  const totalPrice = cartItems.reduce((total, itemId) => {
    const book = books.find(book => book.id === itemId);
    // Assuming a default price of 9.99 if not specified
    return total + (book ? (book as any).price || 9.99 : 0);
  }, 0);

  return (
    <Card 
      className="border border-gray-200 dark:border-gray-700"
      shadow="none"
    >
      <div className="p-6">
        <h4 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Order Summary</h4>
        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Books Qty: {cartItems.length}</span>
            {/* <span>${totalPrice.toFixed(2)}</span> */}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between font-bold text-gray-900 dark:text-white">
              {/* <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span> */}
            </div>
          </div>
        </div>
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onPlaceOrder} 
          isDisabled={cartItems.length === 0}
        >
          Checkout
        </Button>
      </div>
    </Card>
  );
};

export default OrderSummary;
