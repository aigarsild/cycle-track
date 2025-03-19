'use client';

import { useState, useEffect } from 'react';

export default function ReceiptPreview() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Redirect to receipt generation when component mounts
    const receiptUrl = '/api/receipt/custom?' + new URLSearchParams({
      id: 'SR-042684',
      customerName: 'Aigar Sild',
      equipmentBrand: 'Gt chucker',
      customerPhone: '56 86 17 63',
      customerEmail: 'Aigarsild@gmail.com',
      serviceType: 'Täishooldus',
      mechanic: 'Aigar',
      details: 'tere'
    }).toString();
    
    // Open the receipt in a new tab
    window.open(receiptUrl, '_blank');
    
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
            href="/api/receipt/custom?id=SR-042684&customerName=Aigar%20Sild&equipmentBrand=Gt%20chucker&customerPhone=56%2086%2017%2063&customerEmail=Aigarsild@gmail.com&serviceType=T%C3%A4ishooldus&mechanic=Aigar&details=tere"
            target="_blank"
            className="underline font-medium"
          >
            click here
          </a> to open it.</p>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Receipt Details</h2>
        <ul className="space-y-2">
          <li><strong>ID:</strong> SR-042684</li>
          <li><strong>Name:</strong> Aigar Sild</li>
          <li><strong>Bike:</strong> Gt chucker</li>
          <li><strong>Phone:</strong> 56 86 17 63</li>
          <li><strong>Email:</strong> Aigarsild@gmail.com</li>
          <li><strong>Service type:</strong> Täishooldus</li>
          <li><strong>Worker:</strong> Aigar</li>
          <li><strong>Details:</strong> tere</li>
        </ul>
      </div>
    </div>
  );
} 