-- Enable Row Level Security for connections table
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Create policies for connections table
-- Allow users to read their own connections (both as requester and recipient)
CREATE POLICY "Allow users to read their own connections"
  ON connections FOR SELECT
  USING (
    auth.uid() = requester_id OR 
    auth.uid() = recipient_id
  );

-- Allow users to create connection requests
CREATE POLICY "Allow users to create connection requests"
  ON connections FOR INSERT
  WITH CHECK (
    auth.uid() = requester_id AND
    status = 'pending'
  );

-- Allow users to update their own connection requests
CREATE POLICY "Allow users to update their own connection requests"
  ON connections FOR UPDATE
  USING (
    auth.uid() = requester_id OR
    auth.uid() = recipient_id
  );

-- Allow users to delete their own connection requests
CREATE POLICY "Allow users to delete their own connection requests"
  ON connections FOR DELETE
  USING (
    auth.uid() = requester_id OR
    auth.uid() = recipient_id
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS connections_requester_id_idx ON connections(requester_id);
CREATE INDEX IF NOT EXISTS connections_recipient_id_idx ON connections(recipient_id);
CREATE INDEX IF NOT EXISTS connections_status_idx ON connections(status);

-- Add trigger to automatically set updated_at
CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 