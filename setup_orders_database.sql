CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  restaurant_id text NOT NULL,
  "restaurantName" text NOT NULL,
  item text NOT NULL,
  score numeric,
  "deliveryDuration" integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
