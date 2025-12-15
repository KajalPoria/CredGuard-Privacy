CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)));
  
  -- Create initial encrypted identity
  INSERT INTO public.encrypted_identities (user_id, encrypted_vector, zk_proof, behavioral_metrics)
  VALUES (
    NEW.id,
    '0x' || encode(gen_random_bytes(32), 'hex'),
    'π = (A, B, C) ∈ G₁ × G₂ × G₁',
    '{"repayment_discipline": 85, "spending_stability": 80, "employment_consistency": 90, "income_regularity": 82}'::jsonb
  );
  
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: connected_institutions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.connected_institutions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    institution_name text NOT NULL,
    country text NOT NULL,
    institution_type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    trust_level text DEFAULT 'silver'::text,
    verifications_count integer DEFAULT 0,
    last_access_at timestamp with time zone,
    connected_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT connected_institutions_status_check CHECK ((status = ANY (ARRAY['connected'::text, 'pending'::text, 'disconnected'::text]))),
    CONSTRAINT connected_institutions_trust_level_check CHECK ((trust_level = ANY (ARRAY['platinum'::text, 'gold'::text, 'silver'::text])))
);


--
-- Name: consents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    institution_name text NOT NULL,
    purpose text NOT NULL,
    data_types text[] NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT consents_status_check CHECK ((status = ANY (ARRAY['active'::text, 'expired'::text, 'revoked'::text])))
);


--
-- Name: encrypted_identities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.encrypted_identities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    encrypted_vector text NOT NULL,
    zk_proof text,
    behavioral_metrics jsonb DEFAULT '{"income_regularity": 0, "spending_stability": 0, "repayment_discipline": 0, "employment_consistency": 0}'::jsonb,
    cyborgdb_indexed boolean DEFAULT false,
    cyborgdb_index_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    display_name text,
    email text,
    trust_score integer DEFAULT 750,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: verification_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    institution_name text NOT NULL,
    country text NOT NULL,
    verification_type text NOT NULL,
    status text NOT NULL,
    score integer,
    zk_proof text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT verification_history_status_check CHECK ((status = ANY (ARRAY['approved'::text, 'pending'::text, 'declined'::text])))
);


--
-- Name: connected_institutions connected_institutions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connected_institutions
    ADD CONSTRAINT connected_institutions_pkey PRIMARY KEY (id);


--
-- Name: consents consents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consents
    ADD CONSTRAINT consents_pkey PRIMARY KEY (id);


--
-- Name: encrypted_identities encrypted_identities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encrypted_identities
    ADD CONSTRAINT encrypted_identities_pkey PRIMARY KEY (id);


--
-- Name: encrypted_identities encrypted_identities_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encrypted_identities
    ADD CONSTRAINT encrypted_identities_user_id_key UNIQUE (user_id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: verification_history verification_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_history
    ADD CONSTRAINT verification_history_pkey PRIMARY KEY (id);


--
-- Name: encrypted_identities update_encrypted_identities_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_encrypted_identities_updated_at BEFORE UPDATE ON public.encrypted_identities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: connected_institutions connected_institutions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connected_institutions
    ADD CONSTRAINT connected_institutions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: consents consents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consents
    ADD CONSTRAINT consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: encrypted_identities encrypted_identities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encrypted_identities
    ADD CONSTRAINT encrypted_identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: verification_history verification_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_history
    ADD CONSTRAINT verification_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: encrypted_identities Users can insert their own identity; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own identity" ON public.encrypted_identities FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: verification_history Users can insert their own verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own verifications" ON public.verification_history FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: consents Users can manage their own consents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own consents" ON public.consents USING ((auth.uid() = user_id));


--
-- Name: connected_institutions Users can manage their own institutions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own institutions" ON public.connected_institutions USING ((auth.uid() = user_id));


--
-- Name: encrypted_identities Users can update their own identity; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own identity" ON public.encrypted_identities FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: consents Users can view their own consents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own consents" ON public.consents FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: encrypted_identities Users can view their own identity; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own identity" ON public.encrypted_identities FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: connected_institutions Users can view their own institutions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own institutions" ON public.connected_institutions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: verification_history Users can view their own verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own verifications" ON public.verification_history FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: connected_institutions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.connected_institutions ENABLE ROW LEVEL SECURITY;

--
-- Name: consents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

--
-- Name: encrypted_identities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.encrypted_identities ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: verification_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.verification_history ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


