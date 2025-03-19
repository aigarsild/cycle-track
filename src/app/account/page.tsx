'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AccountSettings() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [shopName, setShopName] = useState('Kauplus Rattapood');
  const [shopPhone, setShopPhone] = useState('56 86 17 63');
  const [shopEmail, setShopEmail] = useState('tere@kauplusrattapood.ee');
  const [shopAddress, setShopAddress] = useState('Vae 3a, Laagri, Saue vald');
  const [logo, setLogo] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
        setLogo(settings.logo || null);
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
        shopAddress,
        logo
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
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
      setError('Please upload a valid image file (JPEG, PNG or GIF).');
      return;
    }
    
    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      setError('Logo image must be smaller than 500KB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogo(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const removeLogoImage = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const previewReceipt = () => {
    // Build URL with current settings
    const params = new URLSearchParams({
      shopName,
      shopPhone,
      shopEmail,
      shopAddress
    });
    
    // Add logo if available
    if (logo) {
      params.append('logo', logo);
    }
    
    const url = `/receipt-preview?${params.toString()}`;
    
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
          Upload a custom logo to appear on your receipts. For best results, use a square image (1:1 ratio).
        </p>
        
        <div className="mt-4">
          {logo ? (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
              <div className="relative w-40 h-40 border border-gray-200 rounded overflow-hidden mb-2">
                <Image
                  src={logo}
                  alt="Shop Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <button 
                onClick={removeLogoImage}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove Logo
              </button>
            </div>
          ) : (
            <div className="mb-4 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                No logo uploaded yet
              </p>
            </div>
          )}
          
          <div className="mt-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="logo">
              Upload Logo
            </label>
            <input
              ref={fileInputRef}
              id="logo"
              type="file"
              accept="image/jpeg, image/png, image/gif"
              onChange={handleLogoUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">Max file size: 500KB. Supported formats: JPEG, PNG, GIF</p>
          </div>
          
          <div className="mt-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Logo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 