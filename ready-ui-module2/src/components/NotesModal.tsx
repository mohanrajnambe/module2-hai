import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Avatar,
  Card,
  useDisclosure
} from '@nextui-org/react';
import { useMsal } from '@azure/msal-react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { getUserFullName } from '../utils/authUtils';
import { CartIcon } from '../icons/CartIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { FullPageLoader } from '../pages/Cart';
import ConfirmationDialog from './ConfirmationDialog';
import { useAtomValue } from 'jotai';
import { userPhotoAtom } from '../atoms/userAtom';
import axiosInstance from '../utils/api';

interface Note {
  text: string;
  contributor: string;
  imageUrl: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  about: string;
}

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  book: Book;
  isInCart: boolean;
  onAddToCart: (bookId: string) => void;
  initialContributor: string;
  onNotesUpdate: (updatedNotes: Note[]) => void;
  isAddingNoteFlag?: boolean;
  selectedNotePosition?: number | null;
}

const NotesModal: React.FC<NotesModalProps> = ({
  isOpen,
  onClose,
  notes,
  book,
  isInCart,
  onAddToCart,
  initialContributor,
  onNotesUpdate,
  isAddingNoteFlag = false,
  selectedNotePosition = null
}) => {
  const { isOpen: isConfirmDialogOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedNoteIndex, setSelectedNoteIndex] = useState<number | null>(
    selectedNotePosition
  );
  const [noteText, setNoteText] = useState('');
  const [notesList, setNotesList] = useState<Note[]>(notes);
  const { instance, accounts } = useMsal();
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [isUpdatingNote, setIsUpdatingNote] = useState<boolean>(false);
  const userFullName = getUserFullName(instance);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const userPhoto = useAtomValue(userPhotoAtom);

  useEffect(() => {
    setNotesList(notes);
  }, [notes]);

  useEffect(() => {
    setSelectedNoteIndex(selectedNotePosition);
  }, [selectedNotePosition]);

  const userHasNote = notesList.some(
    (note) => note.contributor === userFullName
  );

  useEffect(() => {
    if (!userHasNote) {
      setIsAddingNote(isAddingNoteFlag);
    }
  }, [userHasNote, isAddingNoteFlag]);

  const hasUserSelectedOwnNote =
    selectedNoteIndex !== null &&
    notesList[selectedNoteIndex]?.contributor === userFullName;

  const handleNoteSubmit = async () => {
    try {
      setIsLoading(true);
      const newNote: Note = {
        text: noteText,
        contributor: accounts[0]?.name || 'Anonymous',
        imageUrl: userPhoto
      };

      await axiosInstance.post(`books/${book.id}/notes`, newNote);

      setNotesList((prevNotes) => {
        const updatedNotes = [...prevNotes, newNote];
        setNoteText('');
        setIsAddingNote(false);
        onNotesUpdate(updatedNotes);
        return updatedNotes;
      });
      onClose(); // Close the modal after successful submission
    } catch (error) {
      console.error('Error submitting note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!hasUserSelectedOwnNote) {
      return;
    }

    try {
      setIsLoading(true);

      await axiosInstance.delete(`books/${book.id}/notes/${selectedNoteIndex}`);

      setNotesList((prevNotes) => {
        const updatedNotes = [...prevNotes].filter(
          (_, index) => index !== selectedNoteIndex
        );

        setNoteText('');
        setIsAddingNote(false);
        onNotesUpdate(updatedNotes);
        setSelectedNoteIndex(null);
        return updatedNotes;
      });
      onClose(); // Close the modal after successful submission
    } catch (error) {
      console.error('Error submitting note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNote = async () => {
    try {
      setIsLoading(true);

      const newNote: Note = {
        text: noteText,
        contributor: accounts[0]?.name || 'Anonymous',
        imageUrl: userPhoto
      };

      await axiosInstance.put(
        `books/${book.id}/notes/${selectedNoteIndex}`,
        newNote
      );

      setNotesList((prevNotes) => {
        const updatedNotes = [...prevNotes].map((note, index) =>
          index === selectedNoteIndex ? newNote : note
        );
        setNoteText('');
        setIsAddingNote(false);
        onNotesUpdate(updatedNotes);
        setSelectedNoteIndex(null);
        return updatedNotes;
      });
      onClose(); // Close the modal after successful submission
    } catch (error) {
      console.error('Error submitting note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size='3xl'
        scrollBehavior='outside'
        backdrop='blur'
        classNames={{
          base: 'bg-white dark:bg-gray-900',
          header: 'border-b border-gray-200 dark:border-gray-800',
          body: 'p-0',
          footer: 'border-t border-gray-200 dark:border-gray-800',
          closeButton: 'hover:bg-default-100 active:bg-default-200'
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              {isLoading && <FullPageLoader />}
              <ModalHeader className='flex gap-4 items-start'>
                <img
                  src={book.thumbnail}
                  alt={book.title}
                  className='w-16 h-auto object-contain rounded'
                />
                <div className='flex-grow'>
                  <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100 mb-1'>
                    {book.title}
                  </h2>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                    {book.author}
                  </p>
                  <button
                    className={`self-start flex items-center text-sm font-medium ${
                      isInCart
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-blue-500 hover:text-blue-600'
                    }`}
                    onClick={() => onAddToCart(book.id)}
                  >
                    <CartIcon size={16} className='mr-2' />
                    {isInCart ? 'Remove from Cart' : 'Add to Cart'}
                  </button>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='flex h-[400px]'>
                  <Card className='w-1/3 rounded-none border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shadow-none'>
                    {notesList.map((note, index) => (
                      <Button
                        key={`${note.contributor}-${index}`}
                        className={`flex justify-start items-center h-16 px-4 rounded-none ${
                          selectedNoteIndex === index && !isAddingNote
                            ? 'bg-default-100 dark:bg-default-50'
                            : 'bg-transparent hover:bg-default-50 dark:hover:bg-default-100'
                        }`}
                        onClick={() => {
                          setSelectedNoteIndex(index);
                          setIsAddingNote(false);
                          setIsUpdatingNote(false);
                        }}
                        variant='light'
                      >
                        <Avatar
                          src={note.imageUrl}
                          alt={note.contributor}
                          className='mr-3'
                          size='sm'
                        />
                        <span
                          className={`text-sm font-medium ${
                            selectedNoteIndex === index && !isAddingNote
                              ? 'text-primary'
                              : 'text-default-700 dark:text-default-500'
                          }`}
                        >
                          {note.contributor}
                        </span>
                      </Button>
                    ))}
                    {!userHasNote && (
                      <Button
                        className={`flex justify-start items-center h-16 px-4 rounded-none ${
                          isAddingNote
                            ? 'bg-default-100 dark:bg-default-50'
                            : 'bg-transparent hover:bg-default-50 dark:hover:bg-default-100'
                        }`}
                        onClick={() => {
                          setIsAddingNote(true);
                          setSelectedNoteIndex(null);
                        }}
                        variant='light'
                      >
                        <span className='text-sm font-medium text-default-700 dark:text-default-500'>
                          Add Note
                        </span>
                      </Button>
                    )}
                  </Card>

                  <div className='flex-1 overflow-y-auto'>
                    {isAddingNote ? (
                      !userHasNote ? (
                        <div className='p-6'>
                          <h3 className='text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100'>
                            Add Your Note
                          </h3>
                          <textarea
                            placeholder='Write your note here...'
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className='w-full h-32 p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600'
                          />
                          <Button
                            onClick={handleNoteSubmit}
                            disabled={!noteText}
                            className={`px-4 py-2 rounded text-white font-semibold bg-blue-500 ${
                              !noteText && 'opacity-50'
                            }`}
                          >
                            Submit Note
                          </Button>
                        </div>
                      ) : (
                        <div className='p-6'>
                          <p className='text-gray-700 dark:text-gray-300'>
                            You have already added a note for this book.
                          </p>
                        </div>
                      )
                    ) : selectedNoteIndex !== null ? (
                      <div className='p-6'>
                        <div className='flex items-center justify-between mb-4'>
                          <div className='flex items-center'>
                            <Avatar
                              src={notesList[selectedNoteIndex].imageUrl}
                              alt={notesList[selectedNoteIndex].contributor}
                              className='mr-3'
                              size='lg'
                            />
                            <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-100'>
                              {notesList[selectedNoteIndex].contributor}
                            </h3>
                          </div>
                          {hasUserSelectedOwnNote && (
                            <div className='flex items-center'>
                              <Button
                                isIconOnly
                                variant='light'
                                aria-label='Edit Note'
                                className='text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors'
                                onClick={() => {
                                  setIsUpdatingNote(true);
                                  setNoteText(
                                    notesList[selectedNoteIndex].text
                                  );
                                }}
                              >
                                <PencilIcon className='h-5 w-5' />
                              </Button>
                              <Button
                                isIconOnly
                                variant='light'
                                aria-label='Delete Note'
                                className='text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors'
                                onClick={() => {
                                  onOpen();
                                }}
                              >
                                <TrashIcon className='h-5 w-5' />
                              </Button>
                            </div>
                          )}
                        </div>
                        {isUpdatingNote ? (
                          <div>
                            <textarea
                              placeholder='Write your note here...'
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className='w-full h-32 p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600'
                            />
                            <div className='flex gap-2 items-center'>
                              <Button
                                onClick={handleUpdateNote}
                                disabled={!noteText}
                                className={`rounded text-white font-semibold bg-blue-500 ${
                                  !noteText && 'opacity-50'
                                }`}
                              >
                                Update Note
                              </Button>
                              <Button
                                variant='bordered'
                                className='rounded'
                                onPress={() => {
                                  setNoteText('');
                                  setIsUpdatingNote(false);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className='text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-8'>
                            {notesList[selectedNoteIndex].text}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className='p-6'>
                        <p className='text-gray-700 dark:text-gray-300'>
                          Select a note to view its details.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={onOpenChange}
        onConfirm={handleDeleteNote}
        title='Delete Note'
        message='Are you sure you want to delete note?'
      />
    </>
  );
};

export default NotesModal;
