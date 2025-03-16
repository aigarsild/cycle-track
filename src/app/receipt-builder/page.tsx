'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Product } from '@/types';

export default function ReceiptBuilder() {
  const searchParams = useSearchParams();
  
  // Get ticket information from URL parameters if available
  const ticketId = searchParams.get('ticketId');
  const customerName = searchParams.get('customerName') || '';
  const customerEmail = searchParams.get('customerEmail') || '';
  const customerPhone = searchParams.get('customerPhone') || '';
  const equipmentBrand = searchParams.get('equipmentBrand') || '';
  const serviceType = searchParams.get('serviceType') || '';
  
  // State for the product search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Create refs to track dropdown state
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // State for the item form
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  
  // State for receipt items and totals
  const [receiptItems, setReceiptItems] = useState<Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    serviceFee: number;
    total: number;
  }>>([]);
  
  const [productTotal, setProductTotal] = useState(0);
  const [serviceFeeTotal, setServiceFeeTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  
  // State for mechanics
  const [mechanics, setMechanics] = useState<Array<{id: string; name: string}>>([]);
  const [mechanicId, setMechanicId] = useState('');
  const [mechanic, setMechanic] = useState('');
  const [loadingMechanics, setLoadingMechanics] = useState(false);
  
  // State for receipt status
  const [receiptSaved, setReceiptSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  // Effect to search for products when search term changes
  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }
      
      setIsSearching(true);
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        
        if (data.success) {
          setSearchResults(data.data || []);
          setShowDropdown(true);
        } else {
          console.error('Failed to search products:', data.error);
          setSearchResults([]);
          setShowDropdown(false);
        }
      } catch (error) {
        console.error('Error searching products:', error);
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    };
    
    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);
  
  // Add click outside handler to close dropdown when clicking elsewhere
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Effect to recalculate totals when receipt items change
  useEffect(() => {
    const productTotal = receiptItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const serviceFeeTotal = receiptItems.reduce((sum, item) => sum + (item.serviceFee * item.quantity), 0);
    const grandTotal = productTotal + serviceFeeTotal;
    
    setProductTotal(productTotal);
    setServiceFeeTotal(serviceFeeTotal);
    setGrandTotal(grandTotal);
  }, [receiptItems]);
  
  // Effect to fetch mechanics from the database
  useEffect(() => {
    const fetchMechanics = async () => {
      setLoadingMechanics(true);
      try {
        const response = await fetch('/api/mechanics?active=true');
        const data = await response.json();
        
        if (data.success) {
          setMechanics(data.data || []);
        } else {
          console.error('Failed to fetch mechanics:', data.error);
        }
      } catch (error) {
        console.error('Error fetching mechanics:', error);
      } finally {
        setLoadingMechanics(false);
      }
    };
    
    fetchMechanics();
  }, []);
  
  // Handle product selection from search results
  const handleProductSelect = (product: Product) => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Fill the form with the selected product details
    setProductName(product.name);
    setPrice(product.price || 0);
    
    // Clear search and hide dropdown
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
  };
  
  // Add an item to the receipt
  const handleAddItem = () => {
    if (!productName.trim() || price < 0 || quantity < 1) {
      return;
    }
    
    const newItem = {
      id: `custom-${Date.now()}`,
      name: productName,
      price: price,
      quantity: quantity,
      serviceFee: serviceFee,
      total: (price * quantity) + (serviceFee * quantity)
    };
    
    setReceiptItems([...receiptItems, newItem]);
    
    // Reset form
    setProductName('');
    setPrice(0);
    setQuantity(1);
    setServiceFee(0);
  };
  
  // Remove an item from the receipt
  const handleRemoveItem = (index: number) => {
    const newItems = [...receiptItems];
    newItems.splice(index, 1);
    setReceiptItems(newItems);
  };
  
  // Handle mechanic selection from dropdown
  const handleMechanicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setMechanicId(selectedId);
    
    if (selectedId) {
      const selectedMechanic = mechanics.find(m => m.id === selectedId);
      setMechanic(selectedMechanic?.name || '');
    } else {
      setMechanic('');
    }
  };
  
  // Handle custom mechanic name input
  const handleCustomMechanicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMechanic(e.target.value);
    // Clear mechanic ID if entering custom name
    if (mechanicId) {
      setMechanicId('');
    }
  };
  
  // Save receipt to the ticket
  const saveReceiptToTicket = async (pdfUrl: string) => {
    if (!ticketId) return;
    
    try {
      setSaveError('');
      
      const receiptData = {
        items: receiptItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          serviceFee: item.serviceFee
        })),
        totalAmount: grandTotal,
        generatedAt: new Date().toISOString(),
        mechanicId: mechanicId || null,
        mechanic: mechanic,
        pdfUrl
      };
      
      console.log('Saving receipt data:', receiptData);
      
      // Send the receipt data to the API
      const response = await fetch('/api/service-tickets/receipt/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId,
          receiptData,
          pdfUrl
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save receipt to ticket');
      }
      
      setReceiptSaved(true);
      
      // Show a success message that will redirect after 3 seconds
      setTimeout(() => {
        // Redirect back to workshop page
        window.location.href = '/workshop';
      }, 3000);
    } catch (error: any) {
      console.error('Error saving receipt to ticket:', error);
      setSaveError(error.message || 'Failed to save receipt to ticket');
    }
  };
  
  // Generate the PDF receipt
  const handleGenerateReceipt = async () => {
    if (receiptItems.length === 0) {
      alert('Please add at least one item to the receipt');
      return;
    }
    
    // Create a unique ID for this receipt
    const uniqueId = ticketId ? ticketId : `custom-${Date.now()}`;
    
    // Encode the receipt items as a JSON string in the URL
    const encodedItems = encodeURIComponent(JSON.stringify(receiptItems));
    
    // Generate PDF URL with all parameters
    const pdfUrl = `/api/receipt/custom?id=${uniqueId}&customerName=${encodeURIComponent(customerName || 'Counter Sale')}&customerEmail=${encodeURIComponent(customerEmail || '')}&customerPhone=${encodeURIComponent(customerPhone || '')}&equipmentBrand=${encodeURIComponent(equipmentBrand || 'Various')}&serviceType=${encodeURIComponent(serviceType || 'Counter Sale')}&mechanic=${encodeURIComponent(mechanic || '')}&items=${encodedItems}`;
    
    // If this is a ticket, save the receipt to the ticket
    if (ticketId) {
      await saveReceiptToTicket(pdfUrl);
    }
    
    // Open the PDF in a new tab
    window.open(pdfUrl, '_blank');
  };
  
  return (
    <div className="container mx-auto p-4">
      <style jsx global>{`
        /* Remove arrows/spinners from price and service fee inputs only */
        .no-spinner::-webkit-inner-spin-button, 
        .no-spinner::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        
        .no-spinner {
          -moz-appearance: textfield;
        }
      `}</style>
      
      <h1 className="text-2xl font-bold mb-6">Service Receipt Builder</h1>
      
      {ticketId && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Ticket Information</h2>
          <p><strong>Ticket ID:</strong> {ticketId}</p>
          <p><strong>Customer:</strong> {customerName || 'N/A'}</p>
          <p><strong>Equipment:</strong> {equipmentBrand || 'N/A'}</p>
          <p><strong>Service Type:</strong> {serviceType || 'N/A'}</p>
        </div>
      )}
      
      {/* Mechanic field - always shown regardless of ticketId */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mechanic / Technician
        </label>
        
        <div className="space-y-4">
          {/* Mechanic selection dropdown */}
          <div>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={mechanicId}
              onChange={handleMechanicChange}
              disabled={loadingMechanics}
            >
              <option value="">-- Select a mechanic --</option>
              {mechanics.map(mech => (
                <option key={mech.id} value={mech.id}>
                  {mech.name}
                </option>
              ))}
            </select>
            {loadingMechanics && (
              <p className="text-xs text-gray-500 mt-1">Loading mechanics...</p>
            )}
          </div>
          
          {/* Custom mechanic input */}
          <div>
            <p className="text-xs text-gray-500 mb-1">
              Or enter a custom mechanic name below:
            </p>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter the name of the mechanic who performed the service"
              value={mechanic}
              onChange={handleCustomMechanicChange}
            />
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-1">
          This will appear on the receipt as the person who performed the service
        </p>
      </div>
      
      {receiptSaved && (
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <p className="text-green-700">
            Receipt successfully attached to service ticket!
          </p>
        </div>
      )}
      
      {saveError && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-700">
            Error saving receipt: {saveError}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Add Items</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product/Service Name
            </label>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Search products or enter product name..."
                value={searchTerm || productName}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setProductName(e.target.value);
                }}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding the dropdown to allow click events to register
                  timeoutRef.current = setTimeout(() => {
                    setShowDropdown(false);
                  }, 200);
                }}
              />
              
              {showDropdown && searchResults.length > 0 && (
                <div 
                  ref={dropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto"
                  onMouseEnter={() => {
                    // Clear any pending timeout
                    if (timeoutRef.current) {
                      clearTimeout(timeoutRef.current);
                      timeoutRef.current = null;
                    }
                  }}
                >
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur event
                        handleProductSelect(product);
                      }}
                    >
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        Price: ${product.price?.toFixed(2)} | Stock: {product.quantity || 0}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {isSearching && (
                <div className="text-sm text-gray-500 mt-1">Searching...</div>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-1">
              Search for products or enter a custom product name
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md no-spinner"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Fee
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md no-spinner"
                min="0"
                step="0.01"
                value={serviceFee}
                onChange={(e) => setServiceFee(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
            onClick={handleAddItem}
            disabled={!productName.trim()}
          >
            Add Item
          </button>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Receipt Items</h2>
          
          {receiptItems.length === 0 ? (
            <p className="text-gray-500">No items added yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Item</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Fee</th>
                    <th className="py-2 text-right">Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {receiptItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.name}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">${item.price.toFixed(2)}</td>
                      <td className="py-2 text-right">${item.serviceFee.toFixed(2)}</td>
                      <td className="py-2 text-right">${item.total.toFixed(2)}</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleRemoveItem(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-b">
                    <td colSpan={4} className="py-2 text-right font-medium">Product Total:</td>
                    <td className="py-2 text-right">${productTotal.toFixed(2)}</td>
                    <td></td>
                  </tr>
                  <tr className="border-b">
                    <td colSpan={4} className="py-2 text-right font-medium">Service Fee Total:</td>
                    <td className="py-2 text-right">${serviceFeeTotal.toFixed(2)}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="py-2 text-right font-bold">Grand Total:</td>
                    <td className="py-2 text-right font-bold">${grandTotal.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          
          <div className="mt-6">
            <button
              type="button"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 w-full"
              onClick={handleGenerateReceipt}
              disabled={receiptItems.length === 0}
            >
              Generate Receipt PDF
            </button>
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            Receipt will be generated in 80mm format suitable for thermal printers
          </p>
        </div>
      </div>
    </div>
  );
} 