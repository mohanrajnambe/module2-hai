import React, { useState, useRef, useEffect } from 'react';
import { useCart } from './context/CartContext';
import InspirationNotes from './InspirationNotes';
import {
  Card,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
  Button
} from '@nextui-org/react';
import { ToastContainer } from 'react-toastify';
import { SearchIcon } from './icons/SearchIcon';
import { CartIcon } from './icons/CartIcon';
import { useMsal } from '@azure/msal-react';
import { getUserFullName } from './utils/authUtils';
import NotesModal from './components/NotesModal';
import { Book, Note } from './types';
import AddBookModal from './components/AddBookModal';
import { useSetAtom } from 'jotai';
import { booksAtom } from './atoms/booksAtom';
import { PencilIcon } from '@heroicons/react/24/outline';
import ConfirmationDialog from './components/ConfirmationDialog';
import { TrashIcon } from './icons/TrashIcon';
import EditBookModal from './components/EditBookModal';
import axiosInstance from './utils/api';

interface RecommendedBooksProps {
  isAdmin: boolean;
}

const RecommendedBooks: React.FC<RecommendedBooksProps> = ({ isAdmin }) => {
  const { instance, accounts } = useMsal();
  const { cartItems, addToCart, removeFromCart } = useCart();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currentSelectedBook, setCurrentSelectedBook] = useState<string>('');
  const [isNotesModalOpen, setIsNotesModalOpen] = useState<boolean>(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState<boolean>(false);
  const [selectedBookForModal, setSelectedBookForModal] = useState<Book | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const userFullName = getUserFullName(instance);
  const [qtyUpdates, setQtyUpdates] = useState<Record<string, number>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [isUpdatingStock, setIsUpdatingStock] = useState<boolean>(false);
  const setBooksAtom = useSetAtom(booksAtom);
  const [editBookId, setEditBookId] = useState<string>('');
  const [editBooks, setEditBooks] = useState<Book[]>();
  const [isEditBookModalOpen, setIsEditBookModalOpen] =
    useState<boolean>(false);
  const [deleteItemId, setDeleteItemId] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      setEmail(accounts[0].username);

      const response = await axiosInstance.get('books');

      setBooks(response.data);
      setBooksAtom(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [instance]);

  useEffect(() => {
    const initialQtyUpdates: Record<string, number> = {};
    const initialEditMode: Record<string, boolean> = {};
    books.forEach((book) => {
      initialQtyUpdates[book.id] = book.qty;
      initialEditMode[book.id] = false;
    });
    setQtyUpdates(initialQtyUpdates);
    setEditMode(initialEditMode);
  }, [books]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const filteredBooks = books
    .filter((book) => {
      if (selectedBook) {
        return book.id === selectedBook;
      }
      return (
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => b.qty - a.qty);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      setSelectedSuggestionIndex((prev) =>
        Math.min(prev + 1, filteredBooks.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      setSelectedSuggestionIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedSuggestionIndex !== -1) {
      const selectedBook = filteredBooks[selectedSuggestionIndex];
      handleSuggestionClick(selectedBook);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSelectedSuggestionIndex(-1);
    if (value === '') {
      setSelectedBook(null);
    }
  };

  const handleSuggestionClick = (book: Book) => {
    setSearchTerm(`${book.title} - ${book.author}`);
    setSelectedBook(book.id);
    setSelectedSuggestionIndex(-1);
  };

  const handleCartAction = (bookId: string) => {
    if (cartItems.includes(bookId)) {
      removeFromCart(bookId);
    } else {
      addToCart(bookId);
    }
  };

  const handleAddNoteClick = (book: Book) => {
    setSelectedBookForModal(book);
    setIsNotesModalOpen(true);
  };

  const handleAddBookClick = () => {
    setIsAddBookModalOpen(true);
  };

  const handleDeleteBookClick = (id: string) => {
    setDeleteItemId(id);
    setIsDeleteModalOpen(true);
  };

  const handleBookAdded = (book: Book) => {
    console.log(book);
    setBooks((prevBooks) => [...prevBooks, book]);
    setIsAddBookModalOpen(false);
  };

  const handleBookEdit = async () => {
    fetchBooks();
    setEditBooks([]);
    setIsEditBookModalOpen(false);
  };

  const handleEditBookClick = async (bookId: string) => {
    setEditBookId(bookId);
    setIsEditBookModalOpen(true);
    const filtered = books.filter(({ id }) => id === bookId);
    setEditBooks(filtered);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.delete(`books/${deleteItemId}`);
      fetchBooks();
    } catch (error) {
    } finally {
      setIsLoading(false);
      setDeleteItemId('');
      setIsDeleteModalOpen(false);
    }
  };

  const handleStockUpdate = async (bookId: string) => {
    const newQty = qtyUpdates[bookId];
    try {
      setIsUpdatingStock(true);
      await axiosInstance.put(`books/${bookId}`, { qty: newQty });
      // Update the local state
      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.id === bookId ? { ...book, qty: newQty } : book
        )
      );
      setEditMode((prev) => ({ ...prev, [bookId]: false }));
    } catch (error) {
      console.error('Error updating book quantity:', error);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  useEffect(() => {
    if (suggestionsRef.current && selectedSuggestionIndex !== -1) {
      const selectedElement = suggestionsRef.current.children[
        selectedSuggestionIndex
      ] as HTMLElement;
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedSuggestionIndex]);

  const handleNotesUpdate = (updatedNotes: Note[]) => {
    if (selectedBookForModal) {
      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.id === selectedBookForModal.id
            ? { ...book, notes: updatedNotes }
            : book
        )
      );
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 dark:bg-gray-900 py-8'>
      <ToastContainer />
      <div className='container mx-auto px-4'>
        <div className='mb-12 text-center'>
          <h1 className='text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100'>
            Welcome to ReadY
          </h1>
          <p className='text-xl mb-6 text-gray-600 dark:text-gray-300'>
            Discover your next favorite book
          </p>

          <div className={`relative flex flex-col md:flex-row max-w-full`}>
            {/* Search Bar Wrapper */}
            <div
              className={`flex w-full md:flex-1 justify-center md:justify-start`}
            >
              <div className={`relative w-full md:max-w-xl md:ml-auto`}>
                <Input
                  classNames={{
                    base: 'w-full h-10',
                    mainWrapper: 'h-full',
                    input: [
                      'bg-transparent',
                      'text-black/90 dark:text-white/90',
                      'placeholder:text-default-700/50 dark:placeholder:text-white/60'
                    ],
                    inputWrapper: [
                      'h-full',
                      'bg-default-200/50',
                      'dark:bg-default/60',
                      'backdrop-blur-xl',
                      'backdrop-saturate-200',
                      'hover:bg-default-200/70',
                      'dark:hover:bg-default/70',
                      'group-data-[focused=true]:bg-default-200/50',
                      'dark:group-data-[focused=true]:bg-default/60',
                      '!cursor-text'
                    ]
                  }}
                  placeholder='Search books by title or author'
                  size='sm'
                  startContent={<SearchIcon size={18} />}
                  value={searchTerm}
                  onValueChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  isClearable
                  onClear={() => {
                    setSearchTerm('');
                    setSelectedBook(null);
                  }}
                />

                {/* Suggestions Dropdown */}
                {searchTerm && !selectedBook && (
                  <ul
                    ref={suggestionsRef}
                    className='absolute w-full z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mt-1 max-h-60 overflow-y-auto'
                  >
                    {filteredBooks.map((book, index) => (
                      <li
                        key={book.id}
                        className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                          index === selectedSuggestionIndex
                            ? 'bg-gray-100 dark:bg-gray-700'
                            : ''
                        }`}
                        onClick={() => handleSuggestionClick(book)}
                      >
                        {book.title} - {book.author}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className='lg:w-52'></div>
            {/* Add Book Button */}
            {isAdmin && (
              <div className='w-full md:w-auto flex justify-center md:justify-end mt-4 md:mt-0 md:ml-4'>
                <button
                  className='px-3 md:px-4 py-2 bg-primary text-white rounded hover:bg-primary-600 transition-all text-sm'
                  onClick={handleAddBookClick}
                >
                  {isAdmin ? 'Add Book' : 'Recommend Book'}
                </button>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className='container flex items-center justify-center'>
            <Spinner size='lg' color='primary' labelColor='primary' />
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {filteredBooks.map((book) => {
              const userHasNote = book.notes.some(
                (note) => note.contributor === userFullName
              );

              return (
                <Card
                  key={book.id}
                  className='overflow-hidden dark:bg-gray-800 shadow-none'
                  radius='sm'
                  onPress={() => {
                    setSelectedBookForModal(book);
                    setIsNotesModalOpen(true);
                  }}
                >
                  <div className='flex flex-col h-full text-left'>
                    <div className='flex flex-col md:flex-row p-6 flex-grow'>
                      <div className='md:w-[100px] flex-shrink-0 mb-4 md:mb-0'>
                        <img
                          src={book.thumbnail}
                          alt={`${book.title} cover`}
                          className='w-full h-auto object-contain rounded'
                          style={{ aspectRatio: '2/3' }}
                        />
                      </div>

                      <div className='md:ml-6 flex-grow flex flex-col justify-between min-w-0'>
                        <div>
                          <div className='flex flex-row justify-between items-center mb-2'>
                            <h3 className='text-base font-semibold text-gray-800 dark:text-gray-100 truncate'>
                              {book.title}
                            </h3>
                          </div>
                          <p className='text-sm text-gray-600 dark:text-gray-300 mb-4 truncate'>
                            {book.author}
                          </p>
                          <p className='text-sm text-gray-700 dark:text-gray-400 mb-4 line-clamp-3'>
                            {book.about}
                          </p>
                        </div>
                        <div>
                          {isAdmin && editMode[book.id] ? (
                            <div className='flex items-center space-x-2'>
                              <Input
                                type='number'
                                min='0'
                                value={qtyUpdates[book.id]?.toString() || ''}
                                onValueChange={(value) => {
                                  setQtyUpdates((prev) => ({
                                    ...prev,
                                    [book.id]: Number(value)
                                  }));
                                }}
                                size='sm'
                                className='w-24'
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Button
                                size='sm'
                                color='primary'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStockUpdate(book.id);
                                }}
                              >
                                {isUpdatingStock ? (
                                  <Spinner size='sm' color='white' />
                                ) : (
                                  'Update'
                                )}
                              </Button>
                              <Button
                                size='sm'
                                color='danger'
                                variant='light'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (book) {
                                    setQtyUpdates((prev) => ({
                                      ...prev,
                                      [book.id]:
                                        books.find(({ id }) => id === book.id)
                                          ?.qty || 0
                                    }));
                                  }
                                  setEditMode((prev) => ({
                                    ...prev,
                                    [book.id]: false
                                  }));
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : isAdmin || book.qty > 0 ? (
                            <Chip
                              className='text-gray-700 dark:text-gray-200'
                              style={{
                                padding: '5px',
                                paddingRight: '2px',
                                height: '2rem',
                                marginBottom: '1rem',
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
                              {isAdmin
                                ? `Stock: ${book.qty}`
                                : `Only ${book.qty} books left`}
                              {isAdmin && (
                                <button
                                  className='ml-2 text-gray-500 hover:text-gray-700'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditMode((prev) => ({
                                      ...prev,
                                      [book.id]: !prev[book.id]
                                    }));
                                  }}
                                >
                                  ✏️
                                </button>
                              )}
                            </Chip>
                          ) : (
                            <p className='text-sm text-red-500 mb-4'>
                              Out of Stock
                            </p>
                          )}
                          {!isAdmin && book.qty > 0 && (
                            <button
                              className={`self-start flex items-center text-sm font-medium ${
                                cartItems.includes(book.id)
                                  ? 'text-red-500 hover:text-red-600'
                                  : 'text-primary hover:text-primary-600'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCartAction(book.id);
                              }}
                            >
                              <CartIcon size={16} className='mr-2' />
                              {cartItems.includes(book.id)
                                ? 'Remove from Cart'
                                : 'Add to Cart'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* <div
                      className='border-t border-gray-200 dark:border-gray-700 p-6 overflow-x-auto h-40 flex flex-col gap-4 justify-center'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <InspirationNotes
                        notes={book.notes}
                        book={book}
                        isInCart={cartItems.includes(book.id)}
                        onAddToCart={handleCartAction}
                        onNotesUpdate={handleNotesUpdate}
                        onNoteClick={(book) => {
                          setSelectedBookForModal(book);
                        }}
                      />
                      {!userHasNote && (
                        <button
                          className='text-primary hover:text-primary-600 self-start'
                          onClick={() => handleAddNoteClick(book)}
                        >
                          + Add Note
                        </button>
                      )}
                    </div> */}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {isAdmin && (
        <ConfirmationDialog
          isOpen={isDeleteModalOpen}
          onOpenChange={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title='Delete Book'
          message='Are you sure you want to delete the book?'
        />
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Update Shopping Cart
              </ModalHeader>
              <ModalBody>
                <p>
                  Your cart already contains a book. Do you want to replace it?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  onPress={() => {
                    addToCart(currentSelectedBook);
                    onClose();
                  }}
                >
                  OK
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {editBooks && editBooks?.length > 0 && (
        <EditBookModal
          isOpen={isEditBookModalOpen}
          onClose={() => setIsEditBookModalOpen(false)}
          onEditBook={handleBookEdit}
          bookToEdit={editBooks[0]}
          isAdmin={isAdmin}
        />
      )}

      {isNotesModalOpen && selectedBookForModal && (
        <NotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          notes={selectedBookForModal.notes}
          book={selectedBookForModal}
          isInCart={cartItems.includes(selectedBookForModal.id)}
          onAddToCart={handleCartAction}
          initialContributor=''
          onNotesUpdate={handleNotesUpdate}
          isAddingNoteFlag
        />
      )}

      {isAddBookModalOpen && (
        <AddBookModal
          isOpen={isAddBookModalOpen}
          onClose={() => setIsAddBookModalOpen(false)}
          onAddBook={handleBookAdded}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default RecommendedBooks;
