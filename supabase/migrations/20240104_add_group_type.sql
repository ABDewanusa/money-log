-- Add type column to groups table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'type') THEN
        ALTER TABLE groups ADD COLUMN type text CHECK (type IN ('need', 'want', 'savings'));
    END IF;
END $$;

-- Update standard legacy groups
UPDATE groups SET type = 'need' WHERE title = 'Needs' AND type IS NULL;
UPDATE groups SET type = 'want' WHERE title = 'Wants' AND type IS NULL;
UPDATE groups SET type = 'savings' WHERE title = 'Savings' AND type IS NULL;

-- Update specific groups from our new seed logic
UPDATE groups SET type = 'need' WHERE title IN ('Housing', 'Food', 'Transportation', 'Utilities') AND type IS NULL;
UPDATE groups SET type = 'want' WHERE title IN ('Entertainment', 'Shopping') AND type IS NULL;
UPDATE groups SET type = 'savings' WHERE title IN ('Emergency Fund', 'Goals') AND type IS NULL;
