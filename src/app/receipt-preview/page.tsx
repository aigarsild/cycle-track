'use client';

import { useState, useEffect } from 'react';

export default function ReceiptPreview() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Open the receipt in a new tab
    window.open('/api/receipt/custom?preview=true', '_blank');
    setIsLoading(false);
  }, []);
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Receipt Preview</h1>
      
      {isLoading ? (
        <p>Loading receipt...</p>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <p>The receipt has been opened in a new tab.</p>
          <p className="mt-2">If it didn&apos;t open, <a 
            href="/api/receipt/custom?preview=true"
            target="_blank"
            className="underline font-medium"
          >
            click here
          </a> to open it.</p>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Receipt Details</h2>
        <p>The receipt will show your latest shop settings and sample customer data.</p>
        <p className="mt-4">Your shop information and logo are saved in the database and will be displayed on all receipts.</p>
      </div>
      
      <div className="mt-6">
        <a 
          href="/account" 
          className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Edit Shop Settings
        </a>
      </div>
    </div>
  );
} 