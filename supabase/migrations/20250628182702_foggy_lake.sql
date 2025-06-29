/*
  # Usage Tracking Functions

  1. New Functions
    - `increment_feature_usage`: Increments usage count for a specific feature
    - `get_feature_usage`: Gets current usage for a specific feature
    - `reset_feature_usage`: Resets usage for a specific feature
*/

-- Function to increment feature usage
CREATE OR REPLACE FUNCTION increment_feature_usage(user_id_param uuid, feature_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  column_name text;
  query_text text;
BEGIN
  -- Construct the column name
  column_name := feature_name || '_daily_count';
  
  -- Check if the user has a usage record
  PERFORM 1 FROM user_feature_usage WHERE user_id = user_id_param;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_feature_usage (user_id, last_reset) 
    VALUES (user_id_param, now());
  END IF;
  
  -- Construct and execute dynamic SQL to increment the specific column
  query_text := format('
    UPDATE user_feature_usage 
    SET %I = %I + 1, 
        updated_at = now() 
    WHERE user_id = %L', 
    column_name, column_name, user_id_param);
  
  EXECUTE query_text;
END;
$$;

-- Function to get feature usage
CREATE OR REPLACE FUNCTION get_feature_usage(user_id_param uuid, feature_name text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  column_name text;
  query_text text;
  usage_count integer;
BEGIN
  -- Construct the column name
  column_name := feature_name || '_daily_count';
  
  -- Check if the user has a usage record
  PERFORM 1 FROM user_feature_usage WHERE user_id = user_id_param;
  
  -- If no record exists, return 0
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Construct and execute dynamic SQL to get the specific column value
  query_text := format('
    SELECT %I 
    FROM user_feature_usage 
    WHERE user_id = %L', 
    column_name, user_id_param);
  
  EXECUTE query_text INTO usage_count;
  
  RETURN COALESCE(usage_count, 0);
END;
$$;

-- Function to reset feature usage
CREATE OR REPLACE FUNCTION reset_feature_usage(user_id_param uuid, feature_name text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query_text text;
BEGIN
  -- If feature_name is provided, reset only that feature
  IF feature_name IS NOT NULL THEN
    query_text := format('
      UPDATE user_feature_usage 
      SET %I = 0, 
          updated_at = now() 
      WHERE user_id = %L', 
      feature_name || '_daily_count', user_id_param);
    
    EXECUTE query_text;
  ELSE
    -- Reset all features
    UPDATE user_feature_usage 
    SET 
      ai_chat_daily_count = 0,
      text_humanizer_daily_count = 0,
      ai_detection_daily_count = 0,
      translation_daily_count = 0,
      text_to_speech_daily_count = 0,
      seo_analyzer_daily_count = 0,
      code_snippets_daily_count = 0,
      document_view_daily_count = 0,
      file_conversion_daily_count = 0,
      media_conversion_daily_count = 0,
      url_shortener_daily_count = 0,
      last_reset = now(),
      updated_at = now()
    WHERE user_id = user_id_param;
  END IF;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_feature_usage(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_feature_usage(uuid, text) TO authenticated;