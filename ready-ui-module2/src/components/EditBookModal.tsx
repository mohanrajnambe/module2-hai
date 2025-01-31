import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button
} from '@nextui-org/react';
import { Book } from '../types';
import { useMsal } from '@azure/msal-react';
import axiosInstance from '../utils/api';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit?: Book | null; // Optional book for editing
  onEditBook?: () => void; // Function to handle edit
  isAdmin: boolean;
}

const EditBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  bookToEdit,
  onEditBook,
  isAdmin
}) => {
  const { instance } = useMsal();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stocksLeft, setStocksLeft] = useState<string>('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isChanged, setIsChanged] = useState(false);

  // Prepopulate data if editing a book
  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setDescription(bookToEdit.about);
      setStocksLeft(bookToEdit.qty.toString());
      setAuthor(bookToEdit.author);
      setPreviewUrl(bookToEdit.thumbnail);
    }
  }, [bookToEdit]);

  useEffect(() => {
    const initialTitle = bookToEdit?.title || '';
    const initialDescription = bookToEdit?.about || '';
    const initialStocksLeft = bookToEdit?.qty.toString() || '';
    const initialAuthor = bookToEdit?.author || '';

    setIsChanged(
      title !== initialTitle ||
        description !== initialDescription ||
        stocksLeft !== initialStocksLeft ||
        author !== initialAuthor ||
        file !== null
    );
  }, [title, description, stocksLeft, author, file, bookToEdit]);

  const previewFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddBook = async () => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('title', title);
      formData.append('about', description);
      formData.append('qty', stocksLeft || '0');
      formData.append('author', author);

      const method = bookToEdit ? 'PUT' : 'POST';
      const url = bookToEdit ? `/books/${bookToEdit.id}` : `/books/add-book`;

      await axiosInstance({
        method,
        url,
        data: formData
      });

      if (bookToEdit && onEditBook) {
        onEditBook();
      }

      clearForm();
      onClose();
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Failed to save the book. Please try again.');
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
    setPreviewUrl(null);
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
        <ModalHeader className='flex flex-col items-start'>
          <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100 mb-1'>
            {bookToEdit ? 'Edit Book' : 'Add New Book'}
          </h2>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {bookToEdit
              ? 'Edit the details of the book.'
              : 'Fill in the details of the new book.'}
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
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
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
                isDisabled={!isChanged}
                className="rounded text-white font-semibold bg-blue-500 ${
                  !file || !title || !description || !author ? 'opacity-50' : ''
                }"
              >
                {isSubmitting
                  ? 'Submitting...'
                  : bookToEdit
                  ? 'Save Changes'
                  : 'Add Book'}
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditBookModal;
