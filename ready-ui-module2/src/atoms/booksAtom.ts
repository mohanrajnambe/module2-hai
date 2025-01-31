import { atom } from 'jotai';
import { Book } from '../types';

export const booksAtom = atom<Book[]>([]); 
