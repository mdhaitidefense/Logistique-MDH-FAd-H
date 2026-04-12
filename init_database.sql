-- Script de configuration complète de la base de données Logistique MDH
-- A exécute dans l'éditeur SQL de votre Dashboard Supabase

-- Désactiver les restrictions RLS (temporairement ou pour test) avant création
-- 1. Table users (Profils)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'Consultant',
    organization TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table pre_authorized_users (Accès)
CREATE TABLE IF NOT EXISTS public.pre_authorized_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    organization TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table des Unités Militaires
CREATE TABLE IF NOT EXISTS public.units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    branch TEXT NOT NULL,
    location TEXT,
    commander TEXT,
    "personnelCount" INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table des Catégories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Table des Méthodes de Transport
CREATE TABLE IF NOT EXISTS public.transport_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Table des Articles d'inventaire
CREATE TABLE IF NOT EXISTS public.items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    quantity INTEGER DEFAULT 0,
    unit TEXT,
    location TEXT,
    condition TEXT,
    organization TEXT,
    icon TEXT,
    serial_number TEXT,
    min_threshold INTEGER DEFAULT 0,
    estimated_value DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Table des Mouvements
CREATE TABLE IF NOT EXISTS public.movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES public.items(id),
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    origin TEXT,
    destination TEXT,
    status TEXT,
    transport_method TEXT,
    departure_date TIMESTAMP WITH TIME ZONE,
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- POLITIQUES DE SECURITÉ : Autoriser la lecture et écriture pour tout utilisateur connecté pour simplifier la configuration immédiate.
DO $$ DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', t);
    END LOOP;
END $$;
