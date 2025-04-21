
-- Function to get all users that the current user has exchanged messages with
-- along with the last message and unread count
CREATE OR REPLACE FUNCTION get_message_participants(user_id UUID)
RETURNS TABLE (
  profile JSONB,
  last_message JSONB,
  unread_count BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH message_users AS (
    -- Get unique user IDs that the current user has exchanged messages with
    SELECT DISTINCT
      CASE 
        WHEN m.sender_id = user_id THEN m.recipient_id
        ELSE m.sender_id
      END AS other_user_id
    FROM messages m
    WHERE m.sender_id = user_id OR m.recipient_id = user_id
  ),
  last_messages AS (
    -- Get the most recent message for each conversation
    SELECT DISTINCT ON (
      CASE 
        WHEN m.sender_id = user_id THEN m.recipient_id
        ELSE m.sender_id
      END
    )
      m.*,
      CASE 
        WHEN m.sender_id = user_id THEN m.recipient_id
        ELSE m.sender_id
      END AS other_user_id
    FROM messages m
    WHERE m.sender_id = user_id OR m.recipient_id = user_id
    ORDER BY other_user_id, m.created_at DESC
  ),
  unread_counts AS (
    -- Count unread messages for each conversation
    SELECT
      sender_id AS other_user_id,
      COUNT(*) AS unread_count
    FROM messages
    WHERE recipient_id = user_id AND read = false
    GROUP BY sender_id
  )
  
  -- Join everything together
  SELECT
    jsonb_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'title', p.title,
      'avatar_url', p.avatar_url
    ) AS profile,
    jsonb_build_object(
      'id', lm.id,
      'content', lm.content,
      'sender_id', lm.sender_id,
      'recipient_id', lm.recipient_id,
      'created_at', lm.created_at,
      'read', lm.read
    ) AS last_message,
    COALESCE(uc.unread_count, 0) AS unread_count
  FROM message_users mu
  JOIN profiles p ON p.id = mu.other_user_id
  LEFT JOIN last_messages lm ON lm.other_user_id = mu.other_user_id
  LEFT JOIN unread_counts uc ON uc.other_user_id = mu.other_user_id
  ORDER BY lm.created_at DESC NULLS LAST;
END;
$$;

-- Add comment
COMMENT ON FUNCTION get_message_participants IS 'Gets all users the current user has messaged with, plus their last message and unread count';
