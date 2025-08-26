-- =====================================================
-- COMPLETE SUPABASE DATABASE SETUP FOR IDEA MARKETPLACE
-- =====================================================
-- Run this entire script in your Supabase SQL Editor

-- 1. CREATE PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. CREATE IDEAS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL CHECK (length(title) >= 3 AND length(title) <= 100),
  description text NOT NULL CHECK (length(description) >= 10 AND length(description) <= 2000),
  category text NOT NULL CHECK (length(category) >= 2 AND length(category) <= 50),
  tags text[] DEFAULT '{}',
  price numeric NOT NULL DEFAULT 0 CHECK (price >= 0),
  image_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'sold', 'draft')),
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. CREATE SALES TABLE (for analytics)
-- =====================================================
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  commission numeric DEFAULT 0,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. CREATE CATEGORIES TABLE (for better organization)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- 5. INSERT DEFAULT CATEGORIES
-- =====================================================
INSERT INTO categories (name, description, icon, color) VALUES
('technology', 'Tech innovations and software ideas', '💻', '#3B82F6'),
('business', 'Business models and entrepreneurship', '💼', '#10B981'),
('health', 'Healthcare and wellness solutions', '🏥', '#EF4444'),
('education', 'Learning and educational tools', '📚', '#F59E0B'),
('entertainment', 'Games, media, and fun concepts', '🎮', '#8B5CF6'),
('finance', 'Financial services and fintech', '💰', '#059669'),
('travel', 'Tourism and travel innovations', '✈️', '#0EA5E9'),
('food', 'Culinary and food service ideas', '🍕', '#F97316'),
('fashion', 'Style, clothing, and accessories', '👗', '#EC4899'),
('sports', 'Fitness and sports-related concepts', '⚽', '#84CC16'),
('art', 'Creative and artistic projects', '🎨', '#A855F7'),
('music', 'Musical instruments and audio tech', '🎵', '#06B6D4'),
('environment', 'Eco-friendly and green solutions', '🌱', '#22C55E'),
('social', 'Social networking and community', '👥', '#6366F1'),
('other', 'Miscellaneous innovative ideas', '💡', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_price ON ideas(price);
CREATE INDEX IF NOT EXISTS idx_ideas_views ON ideas(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_sales_buyer_id ON sales(buyer_id);
CREATE INDEX IF NOT EXISTS idx_sales_seller_id ON sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_ideas_title_search ON ideas USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_ideas_description_search ON ideas USING gin(to_tsvector('english', description));

-- 7. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 8. CREATE RLS POLICIES FOR PROFILES
-- =====================================================
-- Allow users to read all profiles (for displaying usernames)
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 9. CREATE RLS POLICIES FOR IDEAS
-- =====================================================
-- Allow everyone to read active ideas
CREATE POLICY "ideas_select_policy" ON ideas
  FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

-- Allow authenticated users to create ideas
CREATE POLICY "ideas_insert_policy" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own ideas
CREATE POLICY "ideas_update_policy" ON ideas
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own ideas
CREATE POLICY "ideas_delete_policy" ON ideas
  FOR DELETE USING (auth.uid() = user_id);

-- 10. CREATE RLS POLICIES FOR SALES
-- =====================================================
-- Allow users to see sales where they are buyer or seller
CREATE POLICY "sales_select_policy" ON sales
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Allow authenticated users to create sales
CREATE POLICY "sales_insert_policy" ON sales
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- 11. CREATE RLS POLICIES FOR CATEGORIES
-- =====================================================
-- Allow everyone to read categories
CREATE POLICY "categories_select_policy" ON categories
  FOR SELECT USING (true);

-- 12. CREATE FUNCTIONS FOR AUTOMATIC TIMESTAMPS
-- =====================================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER profiles_updated_at_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER ideas_updated_at_trigger
  BEFORE UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER sales_updated_at_trigger
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- 14. CREATE FUNCTION TO HANDLE NEW USER REGISTRATION
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, username, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. CREATE TRIGGER FOR NEW USER REGISTRATION
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 16. CREATE FUNCTION TO INCREMENT VIEW COUNT
-- =====================================================
CREATE OR REPLACE FUNCTION increment_idea_views(idea_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE ideas 
  SET views_count = views_count + 1 
  WHERE id = idea_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. CREATE ANALYTICS VIEWS
-- =====================================================
CREATE OR REPLACE VIEW user_analytics AS
SELECT 
  u.id as user_id,
  p.username,
  p.email,
  COUNT(i.id) as total_ideas,
  COALESCE(SUM(i.price), 0) as total_value,
  COALESCE(SUM(s.amount), 0) as total_sales,
  COUNT(s.id) as sales_count,
  COALESCE(AVG(i.views_count), 0) as avg_views
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN ideas i ON u.id = i.user_id
LEFT JOIN sales s ON u.id = s.seller_id
GROUP BY u.id, p.username, p.email;

-- 18. INSERT SAMPLE DATA (OPTIONAL - for testing)
-- =====================================================
-- Uncomment the following lines if you want sample data for testing

/*
-- Sample ideas (only if you want test data)
INSERT INTO ideas (user_id, title, description, category, price, tags) VALUES
(
  (SELECT id FROM auth.users LIMIT 1),
  'AI-Powered Recipe Generator',
  'An intelligent system that creates personalized recipes based on available ingredients, dietary restrictions, and taste preferences using machine learning algorithms.',
  'technology',
  299.99,
  ARRAY['AI', 'Food', 'Machine Learning', 'Mobile App']
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Sustainable Urban Farming Kit',
  'Complete hydroponic growing system designed for urban apartments, including smart sensors for optimal plant growth and mobile app integration.',
  'environment',
  149.99,
  ARRAY['Sustainability', 'Urban Farming', 'IoT', 'Green Tech']
);
*/

-- 19. GRANT NECESSARY PERMISSIONS
-- =====================================================
-- Grant permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions for anonymous users (for reading public data)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ideas TO anon;
GRANT SELECT ON categories TO anon;
GRANT SELECT ON profiles TO anon;

-- 20. FINAL VERIFICATION QUERIES
-- =====================================================
-- Run these to verify everything is set up correctly
SELECT 'Tables created successfully' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'ideas', 'sales', 'categories');
SELECT 'RLS enabled on all tables' as status;
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'ideas', 'sales', 'categories');