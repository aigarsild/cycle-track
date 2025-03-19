'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountSettings() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [shopName, setShopName] = useState('Kauplus Rattapood');
  const [shopPhone, setShopPhone] = useState('56 86 17 63');
  const [shopEmail, setShopEmail] = useState('tere@kauplusrattapood.ee');
  const [shopAddress, setShopAddress] = useState('Vae 3a, Laagri, Saue vald');
  
  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('shopSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setShopName(settings.shopName || 'Kauplus Rattapood');
        setShopPhone(settings.shopPhone || '56 86 17 63');
        setShopEmail(settings.shopEmail || 'tere@kauplusrattapood.ee');
        setShopAddress(settings.shopAddress || 'Vae 3a, Laagri, Saue vald');
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
    }
  }, []);
  
  const handleSave = () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Save to localStorage
      const settings = {
        shopName,
        shopPhone,
        shopEmail,
        shopAddress
      };
      
      localStorage.setItem('shopSettings', JSON.stringify(settings));
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      setError('Failed to save settings. Please try again.');
      console.error('Error saving settings:', e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const previewReceipt = () => {
    // Build URL with current settings
    const url = `/receipt-preview?${new URLSearchParams({
      shopName,
      shopPhone,
      shopEmail,
      shopAddress
    }).toString()}`;
    
    // Use window.location instead of router.push for string URLs
    window.location.href = url;
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {isSaved && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <p>Settings saved successfully!</p>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Shop Information</h2>
        <p className="text-gray-600 mb-4">This information will appear on your receipts.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shopName">
              Shop Name
            </label>
            <input
              id="shopName"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Shop Name"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shopPhone">
              Phone
            </label>
            <input
              id="shopPhone"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={shopPhone}
              onChange={(e) => setShopPhone(e.target.value)}
              placeholder="Phone Number"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shopEmail">
              Email
            </label>
            <input
              id="shopEmail"
              type="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={shopEmail}
              onChange={(e) => setShopEmail(e.target.value)}
              placeholder="Email Address"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shopAddress">
              Address
            </label>
            <input
              id="shopAddress"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={shopAddress}
              onChange={(e) => setShopAddress(e.target.value)}
              placeholder="Shop Address"
            />
          </div>
        </div>
        
        <div className="flex gap-4 mt-8">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
          
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={previewReceipt}
          >
            Preview Receipt
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Logo Settings</h2>
        <p className="text-gray-600 mb-4">
          The receipt currently uses a simple bicycle logo drawn directly in the PDF.
          Custom logo upload functionality will be available in a future update.
        </p>
      </div>
    </div>
  );
} 