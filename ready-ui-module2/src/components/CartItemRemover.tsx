import React from 'react';

interface CartItemRemoverProps {
  id: string;
  onRemoveItem: (id: string) => void;
}

const CartItemRemover: React.FC<CartItemRemoverProps> = ({ id, onRemoveItem }) => {
  return (
    <button
      className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      onClick={() => onRemoveItem(id)}
    >
      Remove
    </button>
  );
};

export default CartItemRemover;
