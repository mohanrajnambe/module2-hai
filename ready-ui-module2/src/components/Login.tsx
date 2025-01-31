import React from 'react';
import { Button, Card, Image } from "@nextui-org/react";
import MicrosoftIcon from '../assets/Microsoft-Sign-in-Branding.png';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image
            src="https://source.unsplash.com/random/200x200?book"
            alt="ReadY Logo"
            width={100}
            height={100}
            className="rounded-full"
          />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Welcome to ReadY</h2>
        <Button 
          onClick={onLogin} 
          color="primary" 
          fullWidth
          radius='sm'
          startContent={<img src={MicrosoftIcon} alt="Microsoft logo" className="w-5 h-5" />}
        >
          Sign in with Microsoft
        </Button>
      </Card>
    </div>
  );
};

export default Login;
