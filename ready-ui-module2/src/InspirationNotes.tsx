import React, { useState } from 'react';
import { Avatar, Card } from '@nextui-org/react';
import NotesModal from './components/NotesModal';
import { Book, Note } from './types';

interface InspirationNotesProps {
  notes: Note[];
  book: Book;
  isInCart: boolean;
  onAddToCart: (bookId: string) => void;
  onNotesUpdate: (updatedNotes: Note[]) => void;
  onNoteClick?: (book: Book) => void;
}

const InspirationNotes: React.FC<InspirationNotesProps> = ({
  notes,
  book,
  isInCart,
  onAddToCart,
  onNotesUpdate,
  onNoteClick = () => {}
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState<string>('');
  const [selectedNotePosition, setSelectedNotePosition] = useState<
    number | null
  >();

  const handleNoteClick = (contributor: string, noteIndex: number) => {
    onNoteClick(book);
    setSelectedNotePosition(noteIndex);
    setSelectedContributor(contributor);
    setIsModalOpen(true);
  };

  if (notes.length === 0) {
    return null;
  }

  return (
    <>
      <div className='overflow-x-auto' onClick={(e) => e.stopPropagation()}>
        <div className='flex flex-nowrap space-x-4'>
          {notes.map((note, index) => (
            <div
              key={`${note.contributor}-${index}`}
              className='flex-shrink-0 w-64'
            >
              <Card
                isPressable
                onPress={() => handleNoteClick(note.contributor, index)}
                classNames={{
                  base: 'bg-default-50 dark:bg-default-50 shadow-none w-full'
                }}
              >
                <div className='p-3 w-full'>
                  <div className='flex items-center gap-2 w-full'>
                    <Avatar
                      src={note.imageUrl}
                      alt={note.contributor}
                      className='flex-shrink-0'
                      size='sm'
                    />
                    <div className='min-w-0 flex-1 ml-2'>
                      <p className='text-left font-medium text-sm text-default-700 dark:text-default-800 truncate'>
                        {note.contributor}
                      </p>
                      <p className='text-left text-sm text-default-600 dark:text-default-500 truncate'>
                        {note.text}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <NotesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notes={notes}
        book={book}
        isInCart={isInCart}
        onAddToCart={onAddToCart}
        initialContributor={selectedContributor}
        onNotesUpdate={onNotesUpdate}
        selectedNotePosition={selectedNotePosition}
      />
    </>
  );
};

export default InspirationNotes;
