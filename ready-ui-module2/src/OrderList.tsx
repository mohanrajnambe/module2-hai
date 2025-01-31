import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Select,
  SelectItem
} from '@nextui-org/react';
import { Order } from './types';

interface OrderListProps {
  orders: Order[];
  statusFilter: string;
  sortBy: string;
  availableStatuses: string[];
  onStatusFilterChange: (value: string) => void;
  onSortChange: (value: string) => void;
  isAdmin?: boolean;
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
}

const OrderList: React.FC<OrderListProps> = ({
  orders,
  statusFilter,
  sortBy,
  availableStatuses,
  onStatusFilterChange,
  onSortChange,
  isAdmin = false,
  onStatusUpdate
}) => {
  // Group orders by date (YYYY-MM-DD)
  const groupedOrders = orders.reduce(
    (groups: { [key: string]: Order[] }, order) => {
      const date = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(order);
      return groups;
    },
    {}
  );

  const statusOptions = [
    { key: '', value: '', label: 'All Statuses' },
    ...availableStatuses.map((status) => ({
      key: status,
      value: status,
      label: status
    }))
  ];

  const sortOptions = [
    { key: 'newest', value: 'newest', label: 'Newest First' },
    { key: 'oldest', value: 'oldest', label: 'Oldest First' }
  ];

  const allStatusOptions = [
    'Received',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled'
  ].map((status) => ({
    key: status,
    value: status,
    label: status
  }));

  const handleStatusChange = (
    orderId: string,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value;
    if (onStatusUpdate) {
      onStatusUpdate(orderId, newStatus);
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-4'>
      <div className='flex flex-col sm:flex-row flex-wrap gap-4 justify-between items-center mb-8 w-full'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
          {isAdmin ? 'All Orders' : 'Order History'}
        </h2>
        <div className='flex flex-col sm:flex-row flex-wrap gap-4 items-center'>
          <Select
            label='Filter by Status'
            placeholder='All Statuses'
            className='w-48'
            selectedKeys={statusFilter ? [statusFilter] : []}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            {statusOptions.map((option) => (
              <SelectItem key={option.key} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
          <Select
            label='Sort by'
            placeholder='Select sort'
            className='w-48'
            selectedKeys={[sortBy]}
            onChange={(e) => onSortChange(e.target.value)}
          >
            {sortOptions.map((option) => (
              <SelectItem key={option.key} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className='space-y-8'>
        {Object.entries(groupedOrders).map(([date, dateOrders]) => (
          <div key={date}>
            <h3 className='text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300'>
              {date}
            </h3>
            <div className='space-y-6'>
              {dateOrders.map((order) => (
                <Card
                  key={order.confirmationNumber}
                  className='w-full border border-gray-200 dark:border-gray-700'
                  shadow='none'
                >
                  <CardHeader className='flex justify-between px-6 py-4'>
                    <div>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
                        Confirmation #:
                      </p>
                      <p className='text-md text-gray-900 dark:text-white mb-4'>
                        {order.confirmationNumber}
                      </p>
                      <div className='flex flex gap-6'>
                        <div className='flex flex-col gap-1'>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>
                            Ordered On:
                          </p>
                          <p className='text-xs text-gray-900 dark:text-white'>
                            {new Date(order.createdAt).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {isAdmin && (
                          <>
                            <div className='flex flex-col gap-1'>
                              <p className='text-xs text-gray-500 dark:text-gray-400'>
                                Customer:
                              </p>
                              <p className='text-xs text-gray-900 dark:text-white'>
                                {order.fullName}
                              </p>
                            </div>
                            <div className='flex flex-col gap-1'>
                              <p className='text-xs text-gray-500 dark:text-gray-400'>
                                Location:
                              </p>
                              <p className='text-xs text-gray-900 dark:text-white'>
                                {order.location}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className='text-right'>
                      {isAdmin && onStatusUpdate ? (
                        <Select
                          label='Status'
                          className='min-w-[140px]'
                          selectedKeys={[order.status]}
                          onChange={(e) => handleStatusChange(order.id, e)}
                        >
                          {allStatusOptions.map((option) => (
                            <SelectItem key={option.key} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </Select>
                      ) : (
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'Delivered'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <Divider className='bg-gray-200 dark:bg-gray-700' />
                  <CardBody className='px-6 py-4'>
                    <div className='space-y-4'>
                      {order.items.map((book, index) => (
                        <div key={index} className='flex gap-4'>
                          <img
                            src={
                              !isAdmin || book.thumbnail.startsWith('http')
                                ? book.thumbnail
                                : `/${book.thumbnail}`
                            }
                            alt={`${book.title} cover`}
                            className='w-20 h-[100px] object-cover rounded'
                          />
                          <div className='flex-grow'>
                            <p className='font-semibold text-gray-900 dark:text-white'>
                              {book.title}
                            </p>
                            <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
                              {book.author}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;
