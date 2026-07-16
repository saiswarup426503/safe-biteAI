-- 1. Create the tables

CREATE TABLE IF NOT EXISTS public.todos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.restaurants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  location text,
  "cctvStreamUrl" text NOT NULL,
  "safeBiteAIScore" numeric DEFAULT 100,
  "mediaUploadTimeline" jsonb DEFAULT '[]'::jsonb,
  "menu" jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'customer',
  address text,
  "orderHistory" jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.merchants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'merchant',
  "linkedRestaurantId" text NOT NULL,
  "restaurantName" text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insert test data into the todos table so the frontend has something to display
INSERT INTO public.todos (name) VALUES 
('Setup Supabase Client'),
('Push Schema to Database'),
('Eat Biryani')
ON CONFLICT DO NOTHING;

-- 3. Insert the mock restaurants data
INSERT INTO public.restaurants (id, name, location, "cctvStreamUrl", "safeBiteAIScore", "mediaUploadTimeline", "menu")
VALUES
(
  '66778899-0011-2233-4455-66aa00000000',
  'Biryani Zone (BTM Layout)',
  'BTM Layout',
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  83,
  '[{"_id": "t1", "uploadedAt": "2026-07-16T12:00:00Z", "visionVerificationScore": 100, "detectedViolations": [], "predictions": [{"label": "apron", "confidence": 0.95}, {"label": "cap", "confidence": 0.91}]}]',
  '[{"name": "Special Chicken Biryani", "price": 280, "category": "Biryani"}, {"name": "Paneer Tikka Biryani", "price": 240, "category": "Biryani"}]'
),
(
  '66778899-0011-2233-4455-66bb00000000',
  'The Pizza Palace (Indiranagar)',
  'Indiranagar',
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  100,
  '[{"_id": "t3", "uploadedAt": "2026-07-16T12:00:00Z", "visionVerificationScore": 100, "detectedViolations": []}]',
  '[{"name": "Classic Margherita Pizza", "price": 320, "category": "Pizzas"}, {"name": "Cheesy Garlic Breadsticks", "price": 160, "category": "Starters"}]'
)
ON CONFLICT DO NOTHING;
