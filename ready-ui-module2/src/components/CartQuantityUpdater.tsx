import React, { useState } from 'react';

interface CartQuantityUpdaterProps {
  id: string;
  quantity: number;
  availableStock: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const CartQuantityUpdater: React.FC<CartQuantityUpdaterProps> = ({ id, quantity, availableStock, onUpdateQuantity }) => {
  const [error, setError] = useState<string | null>(null);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > availableStock) {
      setError(`Quantity must be between 1 and ${availableStock}`);
    } else {
      setError(null);
      onUpdateQuantity(id, newQuantity);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-2">
      <div className="flex items-center space-x-2">
        <span>Quantity:</span>
        <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => handleQuantityChange(quantity - 1)}>-</button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
          min="1"
          max={availableStock}
          className="w-16 text-center border rounded"
        />
        <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => handleQuantityChange(quantity + 1)}>+</button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default CartQuantityUpdater;
