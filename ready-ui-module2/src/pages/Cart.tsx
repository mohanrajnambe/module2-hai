import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { Button, Card, Spinner } from '@nextui-org/react';
import OrderSummary from '../OrderSummary';
import { useNavigate } from 'react-router-dom';
import { TrashIcon } from '../icons/TrashIcon';
import {
  getUserFullName,
  getUserId,
  getUserIdToken,
  getUserLocation
} from '../utils/authUtils';
import { useMsal } from '@azure/msal-react';
import { Book } from '../types';
import axiosInstance from '../utils/api';
import { AxiosError } from 'axios';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const { instance } = useMsal();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const [books, setBooks] = useState<Book[]>([]);
  const [isBookLoading, setIsBookLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsBookLoading(true);
        const response = await axiosInstance.get(`books/${cartItems[0]}`);
        const data = response.data;

        if (data) {
          setBooks((prevBooks) => [...prevBooks, data]);
        } else {
          console.error(`Failed to fetch book: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setIsBookLoading(false);
      }
    };
    if (cartItems.length > 0) {
      fetchBooks();
    }
  }, [instance, apiUrl, cartItems]);

  const handlePlaceOrder = async () => {
    try {
      setErrorMessage(null);
      setIsLoading(true);
      if (!apiUrl) {
        console.error('API URL is not configured');
        setErrorMessage('Configuration error. Please contact support.');
        return;
      }

      const userId = getUserId(instance);
      const userFullName = getUserFullName(instance);
      const userLocation = await getUserLocation(instance);
      const items = cartItems.map((productId) => ({ productId }));

      const response = await axiosInstance.post('orders', {
        userId: userId,
        fullName: userFullName,
        location: userLocation,
        items: items
      });

      const data = response.data;
      if (data) {
        clearCart();
        // Navigate to order confirmation page with orderId
        navigate('/order-confirmation', {
          state: { orderId: data.responseObject.confirmationNumber }
        });
      } else {
        setErrorMessage('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      let message = 'An error occurred. Please try again.';
      if (error instanceof AxiosError) {
        message = error?.response?.data?.message;
      }
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen py-8'>
      {isLoading && <FullPageLoader />}
      <div className='max-w-4xl mx-auto p-4'>
        <div className='flex justify-between items-center mb-2'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Your Cart
          </h1>
        </div>
      </div>
      {isBookLoading ? (
        <div className='flex justify-center mt-24'>
          <Spinner size='lg' color='primary' labelColor='primary' />
        </div>
      ) : (
        <div className='max-w-4xl mx-auto p-4'>
          <p className='text-gray-600 dark:text-gray-400 mb-6'>
            {cartItems.length} {cartItems.length === 1 ? 'Book' : 'Books'}
          </p>
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                padding: '1rem',
                margin: '1rem 0',
                backgroundColor: 'hsl(var(--nextui-danger)/.2)',
                color:
                  'hsl(var(--nextui-danger-500)/var(--nextui-danger-500-opacity,var(--tw-text-opacity)))',
                borderRadius: '10px'
              }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-6'
              >
                <path
                  fillRule='evenodd'
                  d='M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z'
                  clipRule='evenodd'
                />
              </svg>
              <p style={{ marginLeft: '5px' }}>{errorMessage}</p>
            </div>
          )}

          <div className='flex flex-col lg:flex-row gap-6'>
            <div className='flex-1'>
              {cartItems.length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-gray-600 dark:text-gray-400 mb-4'>
                    Your cart is empty
                  </p>
                  <Button
                    color='primary'
                    onClick={() => navigate('/dashboard')}
                  >
                    Continue Browsing
                  </Button>
                </div>
              ) : (
                <div className='space-y-4'>
                  {cartItems.map((itemId) => {
                    const book = books.find((book) => book.id === itemId);
                    return book ? (
                      <Card
                        key={itemId}
                        className='border border-gray-200 dark:border-gray-700'
                        shadow='none'
                      >
                        <div className='p-4 flex items-center gap-4'>
                          <img
                            src={book.thumbnail}
                            alt={`${book.title} cover`}
                            className='w-20 h-[100px] object-cover rounded'
                          />
                          <div className='flex-1'>
                            <h4 className='text-lg font-semibold text-gray-900 dark:text-white mb-1'>
                              {book.title}
                            </h4>
                            <p className='text-gray-600 dark:text-gray-400'>
                              {book.author}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(itemId)}
                            className='flex items-center gap-2 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors'
                          >
                            <TrashIcon size={20} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </Card>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className='w-full lg:w-1/3'>
                <OrderSummary
                  cartItems={cartItems}
                  onPlaceOrder={handlePlaceOrder}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const FullPageLoader = () => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='flex flex-col items-center gap-4'>
        <Spinner size='lg' color='primary' labelColor='primary' />
      </div>
    </div>
  );
};

export default Cart;
