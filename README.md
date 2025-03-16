# Bike Shop Service Management Application

A comprehensive application for managing bike shop service operations, including a dashboard, service inquiry form, workshop management, and product management.

## Features

- **Dashboard**: View service statistics and financial insights
- **Service Inquiry**: Submit new service requests and generate receipts
- **Workshop**: Manage service workflow with a Kanban board
- **Products**: Manage products, categories, and barcodes

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Material UI
- **Database**: Supabase
- **Deployment**: Vercel
- **Email Management**: Klaviyo

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd bike-shop-service-management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add the following variables:
     ```
     # Supabase Configuration
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

     # Klaviyo Configuration
     KLAVIYO_API_KEY=your_klaviyo_api_key
     KLAVIYO_LIST_ID=your_klaviyo_list_id
     ```

4. Set up Supabase:
   - Create a new Supabase project
   - Create the following tables:
     - `customers`: Store customer information
     - `service_requests`: Capture service inquiries
     - `service_tickets`: Store service ticket details and status
     - `products`: Store product details

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Schema

### Customers
- `id`: UUID (Primary Key)
- `name`: Text
- `email`: Text
- `phone`: Text
- `marketing_consent`: Boolean
- `created_at`: Timestamp

### Service Requests
- `id`: UUID (Primary Key)
- `customer_id`: UUID (Foreign Key to customers.id)
- `equipment_brand`: Text
- `service_type`: Text
- `recipient`: Text
- `additional_details`: Text
- `status`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Service Tickets
- `id`: UUID (Primary Key)
- `service_request_id`: UUID (Foreign Key to service_requests.id)
- `status`: Text
- `parts_used`: JSON
- `mechanic_id`: Text
- `completion_date`: Timestamp
- `total_cost`: Numeric
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Products
- `id`: UUID (Primary Key)
- `name`: Text
- `category`: Text
- `barcode`: Text
- `price`: Numeric
- `description`: Text
- `created_at`: Timestamp

## Deployment

The application can be deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Configure environment variables in Vercel
4. Deploy the application

## Future Enhancements

- Automated email notifications for service status updates
- Mobile-friendly UI for easy access via tablets or phones
- Analytics Dashboard for better insights into shop performance
- Multi-user access for different roles (Admin, Mechanic, Receptionist)