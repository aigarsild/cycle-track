'use client';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Cycle Track</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            The comprehensive management solution for bicycle service shops
          </p>
          <div className="flex justify-center gap-4">
            <a href="/dashboard" className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors">
              Dashboard
            </a>
            <a href="/service-inquiry" className="bg-transparent border-2 border-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-blue-600 transition-colors">
              New Service Request
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Manage Your Bike Shop Efficiently</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">Service Tracking</h3>
              <p className="text-gray-600">Track all bike service requests from intake to completion with our intuitive workshop board.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">Inventory Management</h3>
              <p className="text-gray-600">Keep track of parts, accessories, and tools with real-time inventory updates and low stock alerts.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Customer Database</h3>
              <p className="text-gray-600">Build lasting relationships with comprehensive customer profiles and service history tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to streamline your bike shop operations?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-gray-600">
            Start using Cycle Track today and transform how you manage your bicycle service business.
          </p>
          <a href="/dashboard" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors">
            Get Started
          </a>
        </div>
      </section>
    </div>
  );
}