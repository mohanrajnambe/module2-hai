import React from 'react';
import './CartItem.css';
import { TrashIcon } from '@heroicons/react/24/outline';
import { books } from './data/books';

interface Book {
  id: string;
  thumbnail: string;
  title: string;
  author: string;
}

interface CartItemProps {
  book: Book;
  onRemove: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ book, onRemove }) => (
  <li className="cart-item">
    <img src={book.thumbnail} alt={`${book.title} cover`} className="cart-item-thumbnail" />
    <div className="cart-item-info">
      <h3 className="cart-item-title">{book.title}</h3>
      <p className="cart-item-author">{book.author}</p>
    </div>
    <button onClick={onRemove} className="cart-item-remove-button">
      <TrashIcon className="h-5 w-5 text-red-500" />
    </button>
  </li>
);

export default CartItem;
