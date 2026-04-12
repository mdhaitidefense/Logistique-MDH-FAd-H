-- Script SQL à exécuter dans la console Supabase (SQL Editor)

-- 1. Création de la table des Catégories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ajouter quelques catégories par défaut
INSERT INTO public.categories (name) VALUES 
('Armement & Munitions'),
('Véhicules & Transport'),
('Équipement Tactique'),
('Communications & Électronique'),
('Médical & Santé'),
('Subsistance (Nourriture/Eau)'),
('Carburant & Lubrifiants'),
('Matériaux de Construction'),
('Fournitures de Bureau'),
('Habillement & Protection'),
('Mobilier'),
('Informatique'),
('Outillage'),
('Autre')
ON CONFLICT DO NOTHING;

-- 2. Création de la table des Méthodes de transport
CREATE TABLE IF NOT EXISTS public.transport_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ajouter quelques méthodes par défaut
INSERT INTO public.transport_methods (name) VALUES 
('Camion Militaire'),
('Véhicule Léger'),
('Hélicoptère'),
('Avion Cargo'),
('Bateau/Navire'),
('Transport par un tiers'),
('Autre')
ON CONFLICT DO NOTHING;

-- Configuration de la RLS (Row Level Security) - Optionnel mais recommandé
-- Permettre la lecture à tout utilisateur authentifié
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for authenticated users" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert access for authenticated users" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE public.transport_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for authenticated users" ON public.transport_methods FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert access for authenticated users" ON public.transport_methods FOR INSERT TO authenticated WITH CHECK (true);
