-- Add tts_provider column to chode_lore_entries
ALTER TABLE chode_lore_entries
ADD COLUMN tts_provider VARCHAR(50);

-- Update existing entries to have 'elevenlabs' as provider where audio exists
UPDATE chode_lore_entries
SET tts_provider = 'elevenlabs'
WHERE tts_audio_url IS NOT NULL;

-- Add comment to the column
COMMENT ON COLUMN chode_lore_entries.tts_provider IS 'The TTS service used to generate the audio (elevenlabs or google)'; 