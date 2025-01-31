import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Spinner
} from '@nextui-org/react';
import { useMsal } from '@azure/msal-react';
import { getUserIdToken } from '../utils/authUtils';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Book {
  id: string;
  title: string;
  author: string;
  qty: number;
}

const AdminInventory: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { instance } = useMsal();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const idToken = await getUserIdToken(instance);
        const apiUrl = process.env.REACT_APP_API_URL;
        if (!apiUrl) {
          console.error('API URL is not configured');
          setLoading(false);
          return;
        }
        const response = await axios.get(`${apiUrl}/books`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
        setBooks(response.data);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [instance]);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setBooks(prevBooks =>
      prevBooks.map(book =>
        book.id === id ? { ...book, qty: newQuantity } : book
      )
    );
  };

  const handleSave = async (id: string) => {
    try {
      const idToken = await getUserIdToken(instance);
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        console.error('API URL is not configured');
        return;
      }
      const bookToUpdate = books.find(book => book.id === id);
      if (!bookToUpdate) {
        console.error('Book not found');
        return;
      }
      await axios.put(
        `${apiUrl}/books/${id}`,
        { qty: bookToUpdate.qty },
        {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success('Quantity updated successfully');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
          Inventory
        </h1>
        {loading ? (
          <div className="flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <Table aria-label="Inventory Table" selectionMode="none">
            <TableHeader>
              <TableColumn>Title</TableColumn>
              <TableColumn>Author</TableColumn>
              <TableColumn>Quantity</TableColumn>
              <TableColumn>Action</TableColumn>
            </TableHeader>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={book.qty.toString()}
                      onChange={(e) =>
                        handleQuantityChange(book.id, parseInt(e.target.value))
                      }
                      min={0}
                      width="100px"
                    />
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleSave(book.id)}>
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminInventory;
