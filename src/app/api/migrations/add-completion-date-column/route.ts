import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('Running migration: add_completion_date_column');
    
    // Check if the column already exists
    const { data: checkData, error: checkError } = await supabase
      .from('service_tickets')
      .select('completion_date')
      .limit(1);
    
    if (checkError) {
      if (checkError.message.includes("column \"completion_date\" does not exist")) {
        console.log('Column does not exist, adding it now...');
        
        // The column doesn't exist, so we need to add it
        const { error: addColumnError } = await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP WITH TIME ZONE DEFAULT NULL'
        });
        
        if (addColumnError) {
          console.error('Error adding completion_date column:', addColumnError);
          
          // Try a different approach if rpc fails
          try {
            // Direct SQL execution using the REST API
            const { error } = await fetch(
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                  'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
                  'Prefer': 'params=single-object'
                },
                body: JSON.stringify({
                  query: 'ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP WITH TIME ZONE DEFAULT NULL'
                })
              }
            ).then(res => res.json());
            
            if (error) {
              throw new Error(error);
            }
            
            console.log('Column added successfully using direct SQL');
            return NextResponse.json({ 
              success: true, 
              message: 'Migration completed successfully via direct SQL' 
            });
          } catch (directError: any) {
            console.error('Error with direct SQL execution:', directError);
            return NextResponse.json({ 
              success: false, 
              error: 'Migration failed with direct SQL', 
              details: directError.message 
            }, { status: 500 });
          }
        }
        
        console.log('Column added successfully');
        return NextResponse.json({ 
          success: true, 
          message: 'Migration completed successfully' 
        });
      } else {
        // Some other error checking the column
        console.error('Error checking for completion_date column:', checkError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to check for column existence', 
          details: checkError.message 
        }, { status: 500 });
      }
    } else {
      // Column already exists
      console.log('completion_date column already exists');
      return NextResponse.json({ 
        success: true, 
        message: 'Column already exists, no migration needed' 
      });
    }
  } catch (error: any) {
    console.error('Unexpected error in migration:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred', 
      details: error.message 
    }, { status: 500 });
  }
} 