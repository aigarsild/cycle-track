'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ReceiptPreview() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Get shop settings from query parameters or localStorage
    let shopName = searchParams.get('shopName');
    let shopPhone = searchParams.get('shopPhone');
    let shopEmail = searchParams.get('shopEmail');
    let shopAddress = searchParams.get('shopAddress');
    
    // If not in URL, try to get from localStorage
    if (!shopName || !shopPhone || !shopEmail || !shopAddress) {
      try {
        const savedSettings = localStorage.getItem('shopSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          shopName = shopName || settings.shopName;
          shopPhone = shopPhone || settings.shopPhone;
          shopEmail = shopEmail || settings.shopEmail;
          shopAddress = shopAddress || settings.shopAddress;
        }
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
    }
    
    // Default values if still not set
    shopName = shopName || 'Kauplus Rattapood';
    shopPhone = shopPhone || '56 86 17 63';
    shopEmail = shopEmail || 'tere@kauplusrattapood.ee';
    shopAddress = shopAddress || 'Vae 3a, Laagri, Saue vald';
    
    // Build receipt URL with all parameters
    const receiptUrl = '/api/receipt/custom?' + new URLSearchParams({
      id: 'SR-042684',
      customerName: 'Aigar Sild',
      equipmentBrand: 'Gt chucker',
      customerPhone: '56 86 17 63',
      customerEmail: 'Aigarsild@gmail.com',
      serviceType: 'Täishooldus',
      mechanic: 'Aigar',
      details: 'tere',
      shopName,
      shopPhone,
      shopEmail,
      shopAddress
    }).toString();
    
    // Open the receipt in a new tab
    window.open(receiptUrl, '_blank');
    
    setIsLoading(false);
  }, [searchParams]);
  
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
            href={`/api/receipt/custom?id=SR-042684&customerName=Aigar%20Sild&equipmentBrand=Gt%20chucker&customerPhone=56%2086%2017%2063&customerEmail=Aigarsild@gmail.com&serviceType=T%C3%A4ishooldus&mechanic=Aigar&details=tere`}
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