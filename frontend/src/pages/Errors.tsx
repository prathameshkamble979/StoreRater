import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ErrorProps {
  code: string;
  title: string;
  message: string;
}

const ErrorPage: React.FC<ErrorProps> = ({ code, title, message }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-gray-200 mb-4 tracking-tighter">{code}</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{title}</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">{message}</p>
        
        <div className="flex justify-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
          >
            Go Back
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md shadow-sm hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotFound = () => (
  <ErrorPage 
    code="404" 
    title="Page Not Found" 
    message="Sorry, we couldn't find the page you're looking for. It might have been moved or deleted." 
  />
);

export const Unauthorized = () => (
  <ErrorPage 
    code="401" 
    title="Unauthorized Access" 
    message="Hold up! You need to be logged in to access this resource. Please sign in to continue." 
  />
);

export const Forbidden = () => (
  <ErrorPage 
    code="403" 
    title="Access Denied" 
    message="You do not have the required permissions to view this page. If you believe this is an error, please contact your system administrator." 
  />
);
