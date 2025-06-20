-- Oracle's Referendum System Database Schema
-- Migration to create the necessary tables for the AI-powered community polling system

-- Check if the tables already exist before creating them
DO $$
BEGIN
    -- Add admin_role column to user_profiles if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'admin_role'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN admin_role BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add oracle_shards column to user_profiles if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'oracle_shards'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN oracle_shards INTEGER DEFAULT 0;
        ALTER TABLE public.user_profiles ADD COLUMN voting_streak INTEGER DEFAULT 0;
        ALTER TABLE public.user_profiles ADD COLUMN last_vote_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE public.user_profiles ADD COLUMN total_votes INTEGER DEFAULT 0;
        ALTER TABLE public.user_profiles ADD COLUMN total_shards_earned INTEGER DEFAULT 0;
    END IF;

    -- Create oracle_polls table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'oracle_polls') THEN
        CREATE TABLE public.oracle_polls (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL CHECK (category IN ('prophecy', 'lore', 'game_evolution', 'oracle_personality')),
            ai_generated BOOLEAN DEFAULT TRUE,
            voting_start TIMESTAMP WITH TIME ZONE NOT NULL,
            voting_end TIMESTAMP WITH TIME ZONE NOT NULL,
            oracle_shards_reward INTEGER NOT NULL DEFAULT 10,
            girth_reward_pool INTEGER,
            required_authentication TEXT NOT NULL DEFAULT 'siws',
            cooldown_hours INTEGER NOT NULL DEFAULT 24,
            oracle_personality TEXT NOT NULL CHECK (oracle_personality IN ('pure_prophet', 'chaotic_sage', 'corrupted_oracle')),
            corruption_influence INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            created_by UUID,
            ai_prompt TEXT,
            ai_response_raw JSONB,
            CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id)
        );

        -- Add RLS policies
        ALTER TABLE public.oracle_polls ENABLE ROW LEVEL SECURITY;
        
        -- Everyone can read polls
        CREATE POLICY "Anyone can read polls" ON public.oracle_polls
            FOR SELECT USING (true);
            
        -- Only authenticated users with admin role can create/update/delete polls
        CREATE POLICY "Admins can manage polls" ON public.oracle_polls
            FOR ALL USING (
                auth.role() = 'authenticated' AND 
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE wallet_address = auth.jwt() ->> 'sub'
                    AND admin_role = true
                )
            );
    END IF;

    -- Create poll_options table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'poll_options') THEN
        CREATE TABLE public.poll_options (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            poll_id UUID NOT NULL REFERENCES public.oracle_polls(id) ON DELETE CASCADE,
            text TEXT NOT NULL,
            ai_reasoning TEXT,
            predicted_outcome TEXT,
            image_url TEXT,
            votes_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            CONSTRAINT unique_option_per_poll UNIQUE (poll_id, text)
        );

        -- Add RLS policies
        ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
        
        -- Everyone can read poll options
        CREATE POLICY "Anyone can read poll options" ON public.poll_options
            FOR SELECT USING (true);
            
        -- Only authenticated users with admin role can create/update/delete poll options
        CREATE POLICY "Admins can manage poll options" ON public.poll_options
            FOR ALL USING (
                auth.role() = 'authenticated' AND 
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE wallet_address = auth.jwt() ->> 'sub'
                    AND admin_role = true
                )
            );
    END IF;

    -- Create user_votes table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_votes') THEN
        CREATE TABLE public.user_votes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            poll_id UUID NOT NULL REFERENCES public.oracle_polls(id) ON DELETE CASCADE,
            option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
            wallet_address TEXT NOT NULL,
            voted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            oracle_shards_earned INTEGER NOT NULL DEFAULT 0,
            voting_streak INTEGER NOT NULL DEFAULT 0,
            CONSTRAINT unique_vote_per_poll UNIQUE (poll_id, wallet_address)
        );

        -- Add RLS policies
        ALTER TABLE public.user_votes ENABLE ROW LEVEL SECURITY;
        
        -- Users can read their own votes
        CREATE POLICY "Users can read their own votes" ON public.user_votes
            FOR SELECT USING (
                auth.role() = 'authenticated' AND 
                wallet_address = auth.jwt() ->> 'sub'
            );
            
        -- Users can insert their own votes
        CREATE POLICY "Users can insert their own votes" ON public.user_votes
            FOR INSERT WITH CHECK (
                auth.role() = 'authenticated' AND 
                wallet_address = auth.jwt() ->> 'sub'
            );
            
        -- Admins can read all votes
        CREATE POLICY "Admins can read all votes" ON public.user_votes
            FOR SELECT USING (
                auth.role() = 'authenticated' AND 
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE wallet_address = auth.jwt() ->> 'sub'
                    AND admin_role = true
                )
            );
    END IF;

    -- Create oracle_commentary table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'oracle_commentary') THEN
        CREATE TABLE public.oracle_commentary (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            poll_id UUID NOT NULL REFERENCES public.oracle_polls(id) ON DELETE CASCADE,
            commentary_text TEXT NOT NULL,
            urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            ai_generated BOOLEAN DEFAULT TRUE,
            ai_prompt TEXT,
            ai_response_raw JSONB
        );

        -- Add RLS policies
        ALTER TABLE public.oracle_commentary ENABLE ROW LEVEL SECURITY;
        
        -- Everyone can read oracle commentary
        CREATE POLICY "Anyone can read oracle commentary" ON public.oracle_commentary
            FOR SELECT USING (true);
            
        -- Only authenticated users with admin role can create/update/delete oracle commentary
        CREATE POLICY "Admins can manage oracle commentary" ON public.oracle_commentary
            FOR ALL USING (
                auth.role() = 'authenticated' AND 
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE wallet_address = auth.jwt() ->> 'sub'
                    AND admin_role = true
                )
            );
    END IF;
END$$;

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the vote count for the option
    UPDATE public.poll_options
    SET votes_count = votes_count + 1
    WHERE id = NEW.option_id;
    
    -- Update user profile statistics
    UPDATE public.user_profiles
    SET 
        oracle_shards = oracle_shards + NEW.oracle_shards_earned,
        total_shards_earned = COALESCE(total_shards_earned, 0) + NEW.oracle_shards_earned,
        voting_streak = NEW.voting_streak,
        last_vote_at = NEW.voted_at,
        total_votes = COALESCE(total_votes, 0) + 1
    WHERE wallet_address = NEW.wallet_address;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for vote counts
DROP TRIGGER IF EXISTS on_vote_cast ON public.user_votes;
CREATE TRIGGER on_vote_cast
AFTER INSERT ON public.user_votes
FOR EACH ROW
EXECUTE FUNCTION update_vote_counts();

-- Create function to check if a poll is active
CREATE OR REPLACE FUNCTION is_poll_active(poll_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    poll_status TEXT;
    poll_start TIMESTAMP WITH TIME ZONE;
    poll_end TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT status, voting_start, voting_end 
    INTO poll_status, poll_start, poll_end
    FROM public.oracle_polls
    WHERE id = poll_id;
    
    RETURN poll_status = 'active' AND NOW() BETWEEN poll_start AND poll_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 