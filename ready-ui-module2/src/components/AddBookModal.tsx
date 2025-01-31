import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button
} from '@nextui-org/react';
import { Book } from '../types';
import axiosInstance from '../utils/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: Book) => void;
  isAdmin: boolean;
}

const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onAddBook
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stocksLeft, setStocksLeft] = useState<string>('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previewFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddBook = async () => {
    setErrorMessage(null); // Reset error message

    if (!file || !title || !description || !author) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Create FormData to send file and other book details
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('about', description);
      formData.append('qty', stocksLeft || '0');
      formData.append('author', author);

      const response = await axiosInstance.post('books/add-book', formData);
      const book: Book = response.data;

      if (isAdmin) {
        onAddBook(book); // Update books array with the new book
      }

      clearForm();
      onClose();
      toast.success(
        'Your book is submitted for approval and will appear on the dashboard once approved.'
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setErrorMessage(
          'The recommended book already exists, please try another book.'
        );
      } else {
        setErrorMessage('Failed to add the book. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setStocksLeft('');
    setAuthor('');
    setErrorMessage(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='lg'
      backdrop='blur'
      classNames={{
        base: 'bg-white dark:bg-gray-900',
        header: 'border-b border-gray-200 dark:border-gray-800',
        body: 'p-0'
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col items-start'>
              <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100 mb-1'>
                {isAdmin ? 'Add New Book' : 'Recommend New Book'}
              </h2>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Fill in the details of the new book.
              </p>
            </ModalHeader>
            <ModalBody>
              <div className='p-6 space-y-4'>
                <input
                  placeholder='Enter book title'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className='w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600'
                />
                <textarea
                  placeholder='Enter book description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className='w-full h-32 p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600'
                />
                {isAdmin && (
                  <input
                    placeholder='Enter stock count'
                    value={stocksLeft}
                    type='number'
                    onChange={(e) => setStocksLeft(e.target.value)}
                    className='w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600'
                  />
                )}
                <input
                  placeholder='Enter author name'
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className='w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600'
                />
                <div
                  onClick={() => document.getElementById('fileInput')?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.add('border-blue-500');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('border-blue-500');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('border-blue-500');
                    if (
                      e.dataTransfer.files &&
                      e.dataTransfer.files.length > 0
                    ) {
                      const droppedFile = e.dataTransfer.files[0];
                      setFile(droppedFile);
                      previewFile(droppedFile);
                    }
                  }}
                  className='w-full p-6 mb-4 border-2 border-dashed border-gray-300 rounded-md text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt='Preview'
                      className='w-full h-auto max-h-64 object-contain rounded-md'
                    />
                  ) : (
                    <p className='text-gray-700 dark:text-gray-300'>
                      Drag and drop an image here, or click to select a file
                    </p>
                  )}
                  <input
                    id='fileInput'
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] || null;
                      setFile(selectedFile);
                      if (selectedFile) {
                        previewFile(selectedFile);
                      }
                    }}
                    className='hidden'
                  />
                </div>
                {errorMessage && (
                  <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
                )}
                <div className='flex justify-end gap-4'>
                  <Button
                    variant='bordered'
                    onPress={() => {
                      clearForm();
                      onClose();
                    }}
                    className='rounded'
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddBook}
                    disabled={
                      !file || !title || !description || !author || isSubmitting
                    }
                    className={`rounded text-white font-semibold bg-blue-500 ${
                      (!file || !title || !description || !author) &&
                      'opacity-50'
                    }`}
                  >
                    {isSubmitting
                      ? 'Submitting...'
                      : isAdmin
                      ? 'Add Book'
                      : 'Submit'}
                  </Button>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddBookModal;
