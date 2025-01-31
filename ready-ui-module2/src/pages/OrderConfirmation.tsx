import React from 'react';
import { Card, Button, Divider } from "@nextui-org/react";
import { useNavigate, useLocation } from 'react-router-dom';

const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const handleContinueShopping = () => {
    navigate('/dashboard');
  };

  if (!orderId) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="bg-white dark:bg-gray-900 shadow-none">
          <div className="p-6">
            <div className="flex flex-col items-center">
              <div className="mb-6 w-16 h-16 rounded-full bg-success/10 dark:bg-success/20 flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-success" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                Order Placed Successfully!
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Thank you for your order
              </p>
              
              <Card className="bg-default-50 dark:bg-default-100 shadow-none mb-6">
                <div className="p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Order Confirmation #
                  </p>
                  <p className="text-base font-medium text-gray-800 dark:text-gray-100">
                    {orderId}
                  </p>
                </div>
              </Card>

              <Divider className="my-4" />
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  color="primary"
                  variant="flat"
                  onPress={handleViewOrders}
                  className="flex-1 sm:flex-none"
                >
                  View Orders
                </Button>
                <Button
                  color="default"
                  variant="light"
                  onPress={handleContinueShopping}
                  className="flex-1 sm:flex-none"
                >
                  Continue Browsing
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OrderConfirmation;
