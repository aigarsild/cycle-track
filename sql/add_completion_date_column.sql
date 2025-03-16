-- Function to add completion_date column to service_tickets table if it doesn't exist
CREATE OR REPLACE FUNCTION add_completion_date_column()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the column already exists to avoid errors
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'service_tickets'
    AND column_name = 'completion_date'
  ) THEN
    -- Add the completion_date column as a timestamp with time zone, nullable
    EXECUTE 'ALTER TABLE public.service_tickets 
             ADD COLUMN completion_date TIMESTAMP WITH TIME ZONE DEFAULT NULL';
    
    -- Add a comment to describe the column
    EXECUTE 'COMMENT ON COLUMN public.service_tickets.completion_date 
             IS ''The date and time when the service was completed''';
             
    RAISE NOTICE 'completion_date column added to service_tickets table';
  ELSE
    RAISE NOTICE 'completion_date column already exists in service_tickets table';
  END IF;
END;
$$; 