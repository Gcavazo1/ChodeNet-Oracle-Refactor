## apocryphal_scrolls

create table public.apocryphal_scrolls (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  prophecy_text text not null,
  source_metrics_snapshot jsonb null,
  corruption_level text null default 'none'::text,
  constraint apocryphal_scrolls_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_apocryphal_scrolls_created_at on public.apocryphal_scrolls using btree (created_at desc) TABLESPACE pg_default;

## automation_log

create table public.automation_log (
  id bigserial not null,
  event_type text not null,
  trigger_reason text null,
  girth_index_snapshot jsonb null,
  created_at timestamp with time zone null default now(),
  automation_type text null,
  trigger_source text null,
  events_processed integer null default 0,
  calculation_details jsonb null default '{}'::jsonb,
  success boolean null default true,
  error_message text null,
  constraint automation_log_pkey primary key (id)
) TABLESPACE pg_default;

## chode_lore_entries

create table public.chode_lore_entries (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone null default now(),
  lore_cycle_id uuid null,
  story_title text not null,
  story_text text not null,
  story_summary text null,
  comic_panel_url text null,
  tts_audio_url text null,
  generation_prompt text null,
  sd_prompt text null,
  input_count integer null,
  oracle_corruption_level text null default 'pristine'::text,
  text_generation_status text null default 'pending'::text,
  image_generation_status text null default 'pending'::text,
  audio_generation_status text null default 'pending'::text,
  view_count integer null default 0,
  like_count integer null default 0,
  share_count integer null default 0,
  story_metadata jsonb null default '{}'::jsonb,
  updated_at timestamp with time zone null default now(),
  constraint chode_lore_entries_pkey primary key (id),
  constraint chode_lore_entries_lore_cycle_id_fkey foreign KEY (lore_cycle_id) references lore_cycles (id)
) TABLESPACE pg_default;

create index IF not exists idx_lore_entries_cycle on public.chode_lore_entries using btree (lore_cycle_id) TABLESPACE pg_default;

## comic_generation_queue

create table public.comic_generation_queue (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  lore_entry_id uuid not null,
  status text not null default 'pending'::text,
  payload jsonb null,
  attempts integer null default 0,
  error_message text null,
  started_at timestamp with time zone null,
  completed_at timestamp with time zone null,
  failed_at timestamp with time zone null,
  result_url text null,
  constraint comic_generation_queue_pkey primary key (id),
  constraint comic_generation_queue_lore_entry_id_fkey foreign KEY (lore_entry_id) references chode_lore_entries (id) on delete CASCADE
) TABLESPACE pg_default;

## community_story_inputs

create table public.community_story_inputs (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone null default now(),
  player_address text not null,
  username text null,
  input_text text not null,
  submission_timestamp timestamp with time zone null default now(),
  lore_cycle_id uuid null,
  processed boolean null default false,
  oracle_significance text null default 'standard'::text,
  input_metadata jsonb null default '{}'::jsonb,
  constraint community_story_inputs_pkey primary key (id),
  constraint unique_user_per_cycle unique (player_address, lore_cycle_id),
  constraint fk_lore_cycle foreign KEY (lore_cycle_id) references lore_cycles (id),
  constraint community_story_inputs_input_text_check check ((char_length(input_text) <= 200)),
  constraint community_story_inputs_oracle_significance_check check (
    (
      oracle_significance = any (
        array[
          'standard'::text,
          'notable'::text,
          'legendary'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_story_inputs_cycle on public.community_story_inputs using btree (lore_cycle_id) TABLESPACE pg_default;

create index IF not exists idx_story_inputs_player on public.community_story_inputs using btree (player_address) TABLESPACE pg_default;

## early_adopters

create table public.early_adopters (
  id uuid not null default extensions.uuid_generate_v4 (),
  wallet_address text not null,
  username text not null,
  created_at timestamp with time zone null default now(),
  constraint early_adopters_pkey primary key (id),
  constraint early_adopters_wallet_address_key unique (wallet_address)
) TABLESPACE pg_default;

## girth_balances

create table public.girth_balances (
  id uuid not null default gen_random_uuid (),
  user_profile_id uuid not null,
  soft_balance numeric(20, 6) null default 0.0,
  hard_balance numeric(20, 6) null default 0.0,
  lifetime_earned numeric(20, 6) null default 0.0,
  lifetime_minted numeric(20, 6) null default 0.0,
  last_mint_at timestamp with time zone null,
  last_story_entry_at timestamp with time zone null,
  mint_cooldown_expires timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint girth_balances_pkey primary key (id),
  constraint girth_balances_user_profile_id_key unique (user_profile_id),
  constraint girth_balances_user_profile_id_fkey foreign KEY (user_profile_id) references user_profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_girth_balances_user_profile_id on public.girth_balances using btree (user_profile_id) TABLESPACE pg_default;

create index IF not exists idx_girth_balances_soft_balance on public.girth_balances using btree (soft_balance) TABLESPACE pg_default;

create index IF not exists idx_girth_balances_last_mint_at on public.girth_balances using btree (last_mint_at) TABLESPACE pg_default;

create index IF not exists idx_girth_balances_mint_cooldown on public.girth_balances using btree (mint_cooldown_expires) TABLESPACE pg_default;

create trigger girth_balance_change_trigger
after
update on girth_balances for EACH row
execute FUNCTION notify_balance_change ();

create trigger update_girth_balances_updated_at BEFORE
update on girth_balances for EACH row
execute FUNCTION update_updated_at_column ();

## girth_index_current_values

create table public.girth_index_current_values (
  id integer not null default 1,
  last_updated timestamp with time zone not null default now(),
  divine_girth_resonance numeric null default 50.0,
  tap_surge_index text null default 'Steady Pounding'::text,
  legion_morale text null default 'Cautiously Optimistic'::text,
  oracle_stability_status text null default 'Pristine'::text,
  previous_tap_surge_index text null,
  previous_legion_morale text null,
  previous_oracle_stability_status text null,
  calculation_source text null default 'manual'::text,
  constraint girth_index_current_values_pkey primary key (id),
  constraint only_one_row check ((id = 1))
) TABLESPACE pg_default;

create trigger automated_prophecy_trigger
after
update on girth_index_current_values for EACH row
execute FUNCTION trigger_automated_prophecy ();

create trigger special_report_trigger
after
update on girth_index_current_values for EACH row
execute FUNCTION check_special_report_triggers ();

## leaderboard_entries

create table public.leaderboard_entries (
  id uuid not null default gen_random_uuid (),
  player_address text not null,
  username text null,
  leaderboard_category text not null,
  score_value bigint not null,
  score_metadata jsonb null default '{}'::jsonb,
  soar_leaderboard_id text null,
  submission_timestamp timestamp with time zone null default now(),
  oracle_blessed boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint leaderboard_entries_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_leaderboard_entries_player_address on public.leaderboard_entries using btree (player_address) TABLESPACE pg_default;

create index IF not exists idx_leaderboard_entries_category on public.leaderboard_entries using btree (leaderboard_category) TABLESPACE pg_default;

create index IF not exists idx_leaderboard_entries_score_category on public.leaderboard_entries using btree (leaderboard_category, score_value desc) TABLESPACE pg_default;

create index IF not exists idx_leaderboard_entries_player_category on public.leaderboard_entries using btree (player_address, leaderboard_category) TABLESPACE pg_default;

create trigger trigger_update_leaderboard_entries_updated_at BEFORE
update on leaderboard_entries for EACH row
execute FUNCTION update_leaderboard_entries_updated_at ();

## live_game_events

create table public.leaderboard_entries (
  id uuid not null default gen_random_uuid (),
  player_address text not null,
  username text null,
  leaderboard_category text not null,
  score_value bigint not null,
  score_metadata jsonb null default '{}'::jsonb,
  soar_leaderboard_id text null,
  submission_timestamp timestamp with time zone null default now(),
  oracle_blessed boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint leaderboard_entries_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_leaderboard_entries_player_address on public.leaderboard_entries using btree (player_address) TABLESPACE pg_default;

create index IF not exists idx_leaderboard_entries_category on public.leaderboard_entries using btree (leaderboard_category) TABLESPACE pg_default;

create index IF not exists idx_leaderboard_entries_score_category on public.leaderboard_entries using btree (leaderboard_category, score_value desc) TABLESPACE pg_default;

create index IF not exists idx_leaderboard_entries_player_category on public.leaderboard_entries using btree (player_address, leaderboard_category) TABLESPACE pg_default;

create trigger trigger_update_leaderboard_entries_updated_at BEFORE
update on leaderboard_entries for EACH row
execute FUNCTION update_leaderboard_entries_updated_at ();

## lore_cycles

create table public.lore_cycles (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone null default now(),
  cycle_number integer not null,
  cycle_start_time timestamp with time zone not null,
  cycle_end_time timestamp with time zone not null,
  status text null default 'collecting'::text,
  total_inputs integer null default 0,
  story_theme text null,
  generation_metadata jsonb null default '{}'::jsonb,
  constraint lore_cycles_pkey primary key (id),
  constraint lore_cycles_status_check check (
    (
      status = any (
        array[
          'collecting'::text,
          'processing'::text,
          'generating'::text,
          'complete'::text,
          'failed'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_lore_cycles_status on public.lore_cycles using btree (status) TABLESPACE pg_default;

create index IF not exists idx_lore_cycles_start_time on public.lore_cycles using btree (cycle_start_time) TABLESPACE pg_default;

## mint_events

create table public.mint_events (
  id uuid not null default gen_random_uuid (),
  user_profile_id uuid not null,
  wallet_address text not null,
  soft_amount numeric(20, 6) not null,
  spl_amount numeric(20, 6) not null,
  transaction_hash text null,
  ip_address inet null,
  user_agent text null,
  captcha_token text null,
  status text null default 'pending'::text,
  created_at timestamp with time zone null default now(),
  completed_at timestamp with time zone null,
  constraint mint_events_pkey primary key (id),
  constraint mint_events_user_profile_id_fkey foreign KEY (user_profile_id) references user_profiles (id) on delete CASCADE,
  constraint mint_events_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'completed'::text,
          'failed'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_mint_events_user_profile_id on public.mint_events using btree (user_profile_id) TABLESPACE pg_default;

create index IF not exists idx_mint_events_wallet_address on public.mint_events using btree (wallet_address) TABLESPACE pg_default;

create index IF not exists idx_mint_events_ip_address on public.mint_events using btree (ip_address) TABLESPACE pg_default;

create index IF not exists idx_mint_events_created_at on public.mint_events using btree (created_at) TABLESPACE pg_default;

create index IF not exists idx_mint_events_status on public.mint_events using btree (status) TABLESPACE pg_default;

create index IF not exists idx_mint_events_transaction_hash on public.mint_events using btree (transaction_hash) TABLESPACE pg_default
where
  (transaction_hash is not null);

## oracle-commentary

create table public.oracle_commentary (
  id uuid not null default extensions.uuid_generate_v4 (),
  poll_id uuid not null,
  commentary_text text not null,
  urgency text not null default 'medium'::text,
  created_at timestamp with time zone null default now(),
  ai_generated boolean null default true,
  ai_prompt text null,
  ai_response_raw jsonb null,
  constraint oracle_commentary_pkey primary key (id),
  constraint oracle_commentary_poll_id_fkey foreign KEY (poll_id) references oracle_polls (id) on delete CASCADE,
  constraint oracle_commentary_urgency_check check (
    (
      urgency = any (
        array[
          'low'::text,
          'medium'::text,
          'high'::text,
          'critical'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

## oracle_influence_details

create table public.oracle_influence_details (
  id bigserial not null,
  session_id text not null,
  influences_json jsonb not null,
  calculated_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  constraint oracle_influence_details_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_oracle_influence_session on public.oracle_influence_details using btree (session_id) TABLESPACE pg_default;

create index IF not exists idx_oracle_influence_calculated_at on public.oracle_influence_details using btree (calculated_at) TABLESPACE pg_default;

## oracle-polls

create table public.oracle_polls (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  description text not null,
  category text not null,
  ai_generated boolean null default true,
  voting_start timestamp with time zone not null,
  voting_end timestamp with time zone not null,
  oracle_shards_reward integer not null default 10,
  girth_reward_pool integer null,
  required_authentication text not null default 'siws'::text,
  cooldown_hours integer not null default 24,
  oracle_personality text not null,
  corruption_influence integer not null default 0,
  status text not null default 'active'::text,
  created_at timestamp with time zone null default now(),
  created_by uuid null,
  ai_prompt text null,
  ai_response_raw jsonb null,
  constraint oracle_polls_pkey primary key (id),
  constraint fk_created_by foreign KEY (created_by) references auth.users (id),
  constraint oracle_polls_category_check check (
    (
      category = any (
        array[
          'prophecy'::text,
          'lore'::text,
          'game_evolution'::text,
          'oracle_personality'::text
        ]
      )
    )
  ),
  constraint oracle_polls_oracle_personality_check check (
    (
      oracle_personality = any (
        array[
          'pure_prophet'::text,
          'chaotic_sage'::text,
          'corrupted_oracle'::text
        ]
      )
    )
  ),
  constraint oracle_polls_status_check check (
    (
      status = any (
        array['active'::text, 'closed'::text, 'archived'::text]
      )
    )
  )
) TABLESPACE pg_default;

## oracle_shards

create table public.oracle_influence_details (
  id bigserial not null,
  session_id text not null,
  influences_json jsonb not null,
  calculated_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  constraint oracle_influence_details_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_oracle_influence_session on public.oracle_influence_details using btree (session_id) TABLESPACE pg_default;

create index IF not exists idx_oracle_influence_calculated_at on public.oracle_influence_details using btree (calculated_at) TABLESPACE pg_default;

player_profiles

create table public.player_profiles (
  player_address text not null,
  current_girth integer not null default 0,
  purchased_upgrades jsonb not null default '{}'::jsonb,
  username text null,
  last_saved_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  constraint player_profiles_pkey primary key (player_address)
) TABLESPACE pg_default;

## player_rituals

create table public.player_rituals (
  id uuid not null default gen_random_uuid (),
  user_profile_id uuid not null,
  base_id smallint not null,
  ingredient_ids integer[] null default '{}'::integer[],
  shard_boost integer null default 0,
  girth_cost numeric(10, 6) not null,
  corruption smallint not null,
  risk_level text not null,
  outcome text null default 'pending'::text,
  reward_text text null,
  corruption_effect text null,
  created_at timestamp with time zone null default now(),
  processed_at timestamp with time zone null,
  constraint player_rituals_pkey primary key (id),
  constraint player_rituals_base_id_fkey foreign KEY (base_id) references ritual_bases (id),
  constraint player_rituals_user_profile_id_fkey foreign KEY (user_profile_id) references user_profiles (id) on delete CASCADE,
  constraint player_rituals_outcome_check check (
    (
      outcome = any (
        array[
          'pending'::text,
          'success'::text,
          'failure'::text,
          'corrupted'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_player_rituals_user on public.player_rituals using btree (user_profile_id) TABLESPACE pg_default;

create index IF not exists idx_player_rituals_outcome on public.player_rituals using btree (outcome) TABLESPACE pg_default;

create index IF not exists idx_player_rituals_created on public.player_rituals using btree (created_at) TABLESPACE pg_default;

## player_states

create table public.player_rituals (
  id uuid not null default gen_random_uuid (),
  user_profile_id uuid not null,
  base_id smallint not null,
  ingredient_ids integer[] null default '{}'::integer[],
  shard_boost integer null default 0,
  girth_cost numeric(10, 6) not null,
  corruption smallint not null,
  risk_level text not null,
  outcome text null default 'pending'::text,
  reward_text text null,
  corruption_effect text null,
  created_at timestamp with time zone null default now(),
  processed_at timestamp with time zone null,
  constraint player_rituals_pkey primary key (id),
  constraint player_rituals_base_id_fkey foreign KEY (base_id) references ritual_bases (id),
  constraint player_rituals_user_profile_id_fkey foreign KEY (user_profile_id) references user_profiles (id) on delete CASCADE,
  constraint player_rituals_outcome_check check (
    (
      outcome = any (
        array[
          'pending'::text,
          'success'::text,
          'failure'::text,
          'corrupted'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_player_rituals_user on public.player_rituals using btree (user_profile_id) TABLESPACE pg_default;

create index IF not exists idx_player_rituals_outcome on public.player_rituals using btree (outcome) TABLESPACE pg_default;

create index IF not exists idx_player_rituals_created on public.player_rituals using btree (created_at) TABLESPACE pg_default;

## poll-options

create table public.poll_options (
  id uuid not null default extensions.uuid_generate_v4 (),
  poll_id uuid not null,
  text text not null,
  ai_reasoning text null,
  predicted_outcome text null,
  image_url text null,
  votes_count integer null default 0,
  created_at timestamp with time zone null default now(),
  constraint poll_options_pkey primary key (id),
  constraint unique_option_per_poll unique (poll_id, text),
  constraint poll_options_poll_id_fkey foreign KEY (poll_id) references oracle_polls (id) on delete CASCADE
) TABLESPACE pg_default;

## ritual_bases

 create table public.ritual_bases (
  id smallint not null,
  name text not null,
  description text not null,
  base_girth_cost numeric(10, 6) not null,
  base_corruption smallint null default 0,
  base_success_rate smallint null default 50,
  ritual_type text not null,
  created_at timestamp with time zone null default now(),
  constraint ritual_bases_pkey primary key (id)
) TABLESPACE pg_default;

## ritual_ingredients

create table public.ritual_ingredients (
  id smallint not null,
  name text not null,
  description text not null,
  rarity text not null,
  cost_modifier numeric(3, 2) null default 1.0,
  success_modifier smallint null default 0,
  corruption_modifier smallint null default 0,
  created_at timestamp with time zone null default now(),
  constraint ritual_ingredients_pkey primary key (id),
  constraint ritual_ingredients_rarity_check check (
    (
      rarity = any (
        array['common'::text, 'rare'::text, 'legendary'::text]
      )
    )
  )
) TABLESPACE pg_default;

## ritual_requests_log

 create table public.ritual_ingredients (
  id smallint not null,
  name text not null,
  description text not null,
  rarity text not null,
  cost_modifier numeric(3, 2) null default 1.0,
  success_modifier smallint null default 0,
  corruption_modifier smallint null default 0,
  created_at timestamp with time zone null default now(),
  constraint ritual_ingredients_pkey primary key (id),
  constraint ritual_ingredients_rarity_check check (
    (
      rarity = any (
        array['common'::text, 'rare'::text, 'legendary'::text]
      )
    )
  )
) TABLESPACE pg_default;

## special_reports

 create table public.special_reports (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  report_title text not null,
  report_text text not null,
  source_girth_index_snapshot jsonb null,
  elevenlabs_audio_url text null,
  generation_status text null default 'TEXT_PENDING_GENERATION'::text,
  trigger_reason text null,
  constraint special_reports_pkey primary key (id)
) TABLESPACE pg_default;

## user_profiles

create table public.user_profiles (
  id uuid not null default gen_random_uuid (),
  wallet_address text not null,
  username text null,
  display_name text null,
  avatar_url text null,
  bio text null,
  social_links jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  last_login_at timestamp with time zone null,
  total_sessions integer null default 0,
  profile_completion integer null default 0,
  oracle_relationship text null default 'novice'::text,
  preferences jsonb null default '{}'::jsonb,
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_username_key unique (username),
  constraint user_profiles_wallet_address_key unique (wallet_address),
  constraint user_profiles_bio_check check ((char_length(bio) <= 200)),
  constraint user_profiles_oracle_relationship_check check (
    (
      oracle_relationship = any (
        array[
          'novice'::text,
          'adept'::text,
          'master'::text,
          'legendary'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_wallet_address on public.user_profiles using btree (wallet_address) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_username on public.user_profiles using btree (username) TABLESPACE pg_default
where
  (username is not null);

create index IF not exists idx_user_profiles_created_at on public.user_profiles using btree (created_at) TABLESPACE pg_default;

create trigger update_user_profiles_updated_at BEFORE
update on user_profiles for EACH row
execute FUNCTION update_updated_at_column ();

## user-votes

create table public.user_votes (
  id uuid not null default extensions.uuid_generate_v4 (),
  poll_id uuid not null,
  option_id uuid not null,
  wallet_address text not null,
  voted_at timestamp with time zone null default now(),
  oracle_shards_earned integer not null default 0,
  voting_streak integer not null default 0,
  constraint user_votes_pkey primary key (id),
  constraint unique_vote_per_poll unique (poll_id, wallet_address),
  constraint user_votes_option_id_fkey foreign KEY (option_id) references poll_options (id) on delete CASCADE,
  constraint user_votes_poll_id_fkey foreign KEY (poll_id) references oracle_polls (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger on_vote_cast
after INSERT on user_votes for EACH row
execute FUNCTION update_vote_counts ();

## waitlist_entries

create table public.user_profiles (
  id uuid not null default gen_random_uuid (),
  wallet_address text not null,
  username text null,
  display_name text null,
  avatar_url text null,
  bio text null,
  social_links jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  last_login_at timestamp with time zone null,
  total_sessions integer null default 0,
  profile_completion integer null default 0,
  oracle_relationship text null default 'novice'::text,
  preferences jsonb null default '{}'::jsonb,
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_username_key unique (username),
  constraint user_profiles_wallet_address_key unique (wallet_address),
  constraint user_profiles_bio_check check ((char_length(bio) <= 200)),
  constraint user_profiles_oracle_relationship_check check (
    (
      oracle_relationship = any (
        array[
          'novice'::text,
          'adept'::text,
          'master'::text,
          'legendary'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_wallet_address on public.user_profiles using btree (wallet_address) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_username on public.user_profiles using btree (username) TABLESPACE pg_default
where
  (username is not null);

create index IF not exists idx_user_profiles_created_at on public.user_profiles using btree (created_at) TABLESPACE pg_default;

create trigger update_user_profiles_updated_at BEFORE
update on user_profiles for EACH row
execute FUNCTION update_updated_at_column ();

## wallet_sessions

create table public.wallet_sessions (
  id uuid not null default gen_random_uuid (),
  user_profile_id uuid not null,
  session_token text not null,
  wallet_address text not null,
  siws_message text not null,
  siws_signature text not null,
  siws_nonce text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone null default now(),
  last_active_at timestamp with time zone null default now(),
  ip_address inet null,
  user_agent text null,
  constraint wallet_sessions_pkey primary key (id),
  constraint wallet_sessions_session_token_key unique (session_token),
  constraint wallet_sessions_user_profile_id_fkey foreign KEY (user_profile_id) references user_profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_wallet_sessions_user_profile_id on public.wallet_sessions using btree (user_profile_id) TABLESPACE pg_default;

create index IF not exists idx_wallet_sessions_session_token on public.wallet_sessions using btree (session_token) TABLESPACE pg_default;

create index IF not exists idx_wallet_sessions_wallet_address on public.wallet_sessions using btree (wallet_address) TABLESPACE pg_default;

create index IF not exists idx_wallet_sessions_expires_at on public.wallet_sessions using btree (expires_at) TABLESPACE pg_default;
