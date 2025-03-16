-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  marketing_consent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_requests table
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) NOT NULL,
  equipment_brand TEXT NOT NULL,
  service_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  additional_details TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_tickets table
CREATE TABLE service_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_request_id UUID REFERENCES service_requests(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo',
  parts_used JSONB,
  mechanic_id TEXT,
  completion_date TIMESTAMP WITH TIME ZONE,
  total_cost NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  barcode TEXT,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_service_requests_customer_id ON service_requests(customer_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_tickets_service_request_id ON service_tickets(service_request_id);
CREATE INDEX idx_service_tickets_status ON service_tickets(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_barcode ON products(barcode);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_service_requests_updated_at
BEFORE UPDATE ON service_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_tickets_updated_at
BEFORE UPDATE ON service_tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO customers (name, email, phone, marketing_consent)
VALUES 
  ('John Doe', 'john@example.com', '555-1234', true),
  ('Jane Smith', 'jane@example.com', '555-5678', false),
  ('Bob Johnson', 'bob@example.com', '555-9012', true);

INSERT INTO service_requests (customer_id, equipment_brand, service_type, recipient, additional_details, status)
VALUES 
  ((SELECT id FROM customers WHERE name = 'John Doe'), 'Trek', 'Simple Service', 'John', 'Brake adjustment needed', 'todo'),
  ((SELECT id FROM customers WHERE name = 'Jane Smith'), 'Specialized', 'Full Service', 'Jane', 'Annual maintenance', 'in-progress'),
  ((SELECT id FROM customers WHERE name = 'Bob Johnson'), 'Giant', 'Other', 'Bob', 'Wheel alignment and tire replacement', 'waiting-for-parts');

INSERT INTO service_tickets (service_request_id, status)
VALUES 
  ((SELECT id FROM service_requests WHERE customer_id = (SELECT id FROM customers WHERE name = 'John Doe')), 'todo'),
  ((SELECT id FROM service_requests WHERE customer_id = (SELECT id FROM customers WHERE name = 'Jane Smith')), 'in-progress'),
  ((SELECT id FROM service_requests WHERE customer_id = (SELECT id FROM customers WHERE name = 'Bob Johnson')), 'waiting-for-parts');

INSERT INTO products (name, category, barcode, price, description)
VALUES 
  ('Bike Chain', 'Parts', '123456789', 29.99, 'High-quality bike chain'),
  ('Brake Pads', 'Parts', '234567890', 19.99, 'Durable brake pads for all bike types'),
  ('Tire Set', 'Tires', '345678901', 59.99, 'Set of two all-terrain tires'),
  ('Handlebar Tape', 'Accessories', '456789012', 12.99, 'Comfortable handlebar tape'),
  ('Bike Pump', 'Tools', '567890123', 39.99, 'Portable bike pump for emergencies'); 