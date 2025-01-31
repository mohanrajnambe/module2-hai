import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { getUserIdToken, fetchUserPhoto } from './utils/authUtils';
import { Spinner, Chip, Input, Button } from '@nextui-org/react';
import InspirationNotes from './InspirationNotes';
import { useCart } from './context/CartContext';
import { CartIcon } from './icons/CartIcon';
import { Book, Note } from './types';

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { instance, accounts } = useMsal();
  const { cartItems, addToCart, removeFromCart } = useCart();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    fetchBook();
  }, [id, instance]);

  const fetchBook = async () => {
    try {
      setIsLoading(true);
      const idToken = await getUserIdToken(instance);
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        console.error('API URL is not configured');
        return;
      }
      const response = await fetch(`${apiUrl}/books/${id}`, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch book');
      }
      const data = await response.json();
      setBook(data);
    } catch (error) {
      console.error('Error fetching book:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchPhoto = async () => {
      const photo = await fetchUserPhoto(instance, accounts[0]);
      setUserPhoto(photo || null);
    };
    fetchPhoto();
  }, [instance, accounts]);

  const handleCartAction = (bookId: string) => {
    if (cartItems.includes(bookId)) {
      removeFromCart(bookId);
    } else {
      addToCart(bookId);
    }
  };

  const handleNoteSubmit = async () => {
    try {
      const idToken = await getUserIdToken(instance);
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        console.error('API URL is not configured');
        return;
      }
      const newNote: Note = {
        text: noteText,
        contributor: accounts[0]?.name || 'Anonymous',
        imageUrl: userPhoto || ''
      };
      const response = await fetch(`${apiUrl}/books/${id}/notes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNote)
      });
      if (!response.ok) {
        throw new Error('Failed to add note');
      }
      // Update the book's notes without refetching
      setBook((prevBook) =>
        prevBook
          ? { ...prevBook, notes: [...prevBook.notes, newNote] }
          : prevBook
      );
      setNoteText('');
    } catch (error) {
      console.error('Error submitting note:', error);
    }
  };

  const handleNotesUpdate = (updatedNotes: Note[]) => {
    setBook((prevBook) =>
      prevBook ? { ...prevBook, notes: updatedNotes } : prevBook
    );
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Spinner size='lg' color='primary' labelColor='primary' />
      </div>
    );
  }

  if (!book) {
    return (
      <p className='text-center text-gray-800 dark:text-gray-100'>
        Book not found.
      </p>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 dark:bg-gray-900 py-8'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-col md:flex-row'>
          <div className='md:w-1/3'>
            <img
              src={book.thumbnail}
              alt={`${book.title} cover`}
              className='w-full h-auto object-contain rounded'
              style={{ aspectRatio: '2/3' }}
            />
          </div>
          <div className='md:ml-6 flex-grow'>
            <h1 className='text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100'>
              {book.title}
            </h1>
            <p className='text-xl mb-6 text-gray-600 dark:text-gray-300'>
              {book.author}
            </p>
            <p className='text-lg text-gray-700 dark:text-gray-400 mb-4'>
              {book.about}
            </p>
            {book.qty > 0 ? (
              <Chip
                className='text-gray-700 dark:text-gray-200 mb-4'
                style={{
                  padding: '5px',
                  paddingRight: '2px',
                  height: '2rem',
                  backgroundColor: 'transparent'
                }}
                startContent={
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='size-6'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'
                    />
                  </svg>
                }
                variant='faded'
                color='success'
              >
                Only {book.qty} books left
              </Chip>
            ) : (
              <p className='text-sm text-red-500 mb-4'>Out of Stock</p>
            )}
            {book.qty > 0 && (
              <button
                className={`self-start flex items-center text-sm font-medium mb-4 ${
                  cartItems.includes(book.id)
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-primary hover:text-primary-600'
                }`}
                onClick={() => handleCartAction(book.id)}
              >
                <CartIcon size={16} className='mr-2' />
                {cartItems.includes(book.id)
                  ? 'Remove from Cart'
                  : 'Add to Cart'}
              </button>
            )}
            <InspirationNotes
              notes={book.notes}
              book={book}
              isInCart={cartItems.includes(book.id)}
              onAddToCart={handleCartAction}
              onNotesUpdate={handleNotesUpdate}
            />

            {/* Note submission form */}
            <div className='mt-8'>
              <h2 className='text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100'>
                Add Your Note
              </h2>
              <Input
                placeholder='Write your note here...'
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                fullWidth
                className='mb-4'
              />
              <Button onClick={handleNoteSubmit} disabled={!noteText}>
                Submit Note
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
