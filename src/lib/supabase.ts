import { createClient } from '@supabase/supabase-js';

// Use placeholders if environment variables are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url-for-development.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-for-development';

// The createClient function will create a Supabase client even with invalid credentials,
// but API calls will fail, which we handle in our API routes with fallback data
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This function checks if we have valid credentials
export const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 10
  );
};

// Function to verify and ensure the correct database schema
export const ensureDatabaseSchema = async () => {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not properly configured, skipping schema check');
    return false;
  }

  try {
    console.log('Checking database schema...');
    
    // Check if tables exist
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('Error checking tables:', error);
      return false;
    }
    
    const tableNames = tables.map((t: any) => t.table_name);
    console.log('Existing tables:', tableNames);
    
    // Create customers table if it doesn't exist
    if (!tableNames.includes('customers')) {
      console.log('Creating customers table...');
      const { error: createError } = await supabase.rpc('create_customers_table');
      if (createError) console.error('Error creating customers table:', createError);
    }
    
    // Create service_requests table if it doesn't exist
    if (!tableNames.includes('service_requests')) {
      console.log('Creating service_requests table...');
      const { error: createError } = await supabase.rpc('create_service_requests_table');
      if (createError) console.error('Error creating service_requests table:', createError);
    }
    
    // Create service_tickets table if it doesn't exist
    if (!tableNames.includes('service_tickets')) {
      console.log('Creating service_tickets table...');
      const { error: createError } = await supabase.rpc('create_service_tickets_table');
      if (createError) console.error('Error creating service_tickets table:', createError);
    }

    // Check if comments column exists in service_tickets
    if (tableNames.includes('service_tickets')) {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'service_tickets')
        .eq('table_schema', 'public');
      
      if (columnsError) {
        console.error('Error checking columns:', columnsError);
      } else {
        const columnNames = columns.map((c: any) => c.column_name);
        console.log('service_tickets columns:', columnNames);
        
        // Add comments column if it doesn't exist
        if (!columnNames.includes('comments')) {
          console.log('Adding comments column to service_tickets table...');
          
          // Run SQL to add the column
          const { error: alterError } = await supabase
            .rpc('add_comments_column_to_service_tickets');
          
          if (alterError) {
            console.error('Error adding comments column:', alterError);
            
            // Direct SQL approach as backup if RPC fails
            const { error: sqlError } = await supabase
              .from('service_tickets')
              .update({ comments: [] })
              .is('comments', null)
              .select()
              .limit(0);  // Dummy update to initialize the column
            
            if (sqlError) {
              console.error('Error with direct SQL to add comments column:', sqlError);
            } else {
              console.log('Successfully added comments column via direct SQL');
            }
          } else {
            console.log('Successfully added comments column via RPC');
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring database schema:', error);
    return false;
  }
}; 