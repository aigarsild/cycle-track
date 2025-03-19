import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use placeholders if environment variables are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(`
        <html>
          <body style="font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;">
            <h1 style="color: red;">Error: Supabase Configuration Missing</h1>
            <p>The Supabase URL or service role key is missing. Please check your environment variables.</p>
            <p>Supabase URL: ${supabaseUrl ? 'Set' : 'Missing'}</p>
            <p>Service Key: ${supabaseServiceKey ? 'Set' : 'Missing'}</p>
          </body>
        </html>
      `, {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create a test admin user (only for development purposes)
    const testEmail = 'admin@example.com';
    const testPassword = 'password123';

    // Check if the user already exists
    const { data: existingUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (searchError) {
      console.error('Error searching for existing users:', searchError);
      return new Response(`
        <html>
          <body style="font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;">
            <h1 style="color: red;">Error: Failed to Check Existing Users</h1>
            <p>Error: ${searchError.message}</p>
            <p>This might be due to invalid Supabase credentials or permissions.</p>
          </body>
        </html>
      `, {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const userExists = existingUsers.users.some(user => user.email === testEmail);
    
    if (userExists) {
      return new Response(`
        <html>
          <body style="font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;">
            <h1 style="color: green;">Test User Already Exists</h1>
            <p>The test user already exists in your Supabase project.</p>
            <h2>Login Credentials:</h2>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
              <p><strong>Email:</strong> ${testEmail}</p>
              <p><strong>Password:</strong> ${testPassword}</p>
            </div>
            <p>
              <a href="/login" style="display: inline-block; background: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                Go to Login Page
              </a>
            </p>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Create the admin user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        is_admin: true,
        name: 'Test Admin'
      }
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return new Response(`
        <html>
          <body style="font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;">
            <h1 style="color: red;">Error Creating Admin User</h1>
            <p>Error: ${error.message}</p>
            <p>This might be due to invalid Supabase credentials or permissions.</p>
          </body>
        </html>
      `, {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new Response(`
      <html>
        <body style="font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="color: green;">Admin User Created Successfully</h1>
          <p>A test admin user has been created in your Supabase project.</p>
          <h2>User Details:</h2>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
            <p><strong>ID:</strong> ${data.user.id}</p>
            <p><strong>Email:</strong> ${data.user.email}</p>
            <p><strong>Created at:</strong> ${new Date(data.user.created_at).toLocaleString()}</p>
          </div>
          
          <h2>Login Credentials:</h2>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
            <p><strong>Email:</strong> ${testEmail}</p>
            <p><strong>Password:</strong> ${testPassword}</p>
          </div>
          
          <p>
            <a href="/login" style="display: inline-block; background: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
              Go to Login Page
            </a>
          </p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
    
  } catch (error: any) {
    console.error('Unexpected error creating admin user:', error);
    return new Response(`
      <html>
        <body style="font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="color: red;">Unexpected Error</h1>
          <p>An unexpected error occurred: ${error.message || 'Unknown error'}</p>
          <p>Check your server logs for more details.</p>
        </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
} 