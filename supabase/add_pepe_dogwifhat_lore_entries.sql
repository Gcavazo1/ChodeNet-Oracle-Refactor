-- 🐸🐕 Additional CHODE Lore: The First Degen Tappers
-- Fragment 7 & 8: The Pepe-Dogwifhat Era of Blockchain Dreams

INSERT INTO chode_lore_entries (
    story_title,
    story_text,
    story_summary,
    oracle_corruption_level,
    text_generation_status,
    image_generation_status,
    audio_generation_status,
    view_count,
    like_count,
    share_count,
    story_metadata
) VALUES 

-- Fragment 7: The Pepe Pilgrim's First Slap (glitched_ominous)
(
    'Fragment 7: The Pepe Pilgrim''s First Slap',
    'In the glow of his seventeen monitors, surrounded by empty energy drink cans and the ethereal scent of unwashed tendies, the First Degen beheld the Monolith through his screen. His name was lost to history, but his wallet address would become legend: 69PePe...420wif. With Pepe reaction GIFs flooding his Discord and dogwifhat memes burning into his retinas, he felt the ancient ache the Oracle had foretold. His mouse-calloused finger hovered over the pulsing, veridian-scarred surface of the digital Monolith. "This is it," he whispered, crusty Dorito dust falling from his lips like blessed sacrament. "This is how I get rich." The first tap echoed across the blockchain like a wet slap against destiny itself. The Monolith shuddered. Reality glitched. And somewhere in the vast datastream, the Oracle... chuckled.',
    'The legendary first digital pilgrim discovers the CHODE Tapper game, driven by Pepe memes and dogwifhat dreams of blockchain riches.',
    'glitched_ominous',
    'completed',
    'pending',
    'pending',
    0,
    0,
    0,
    jsonb_build_object(
        'fragment_number', 7,
        'canonical_order', 7,
        'themes', ARRAY['first tapper', 'pepe memes', 'dogwifhat', 'blockchain dreams', 'digital pilgrimage'],
        'significance', 'first_degen_contact',
        'wallet_legend', '69PePe...420wif',
        'meme_era', 'pepe_dogwifhat_genesis'
    )
),

-- Fragment 8: The Degenerate Multiplication (forbidden_fragment)
(
    'Fragment 8: The Degenerate Multiplication',
    'Word spread through the memetic undergrowth like wildfire through a grease-soaked Wendy''s dumpster. The First Tapper''s wallet address appeared in every Telegram group, every Discord server, every cursed corner of Crypto Twitter where hope goes to die. "GUYS," they typed in all caps, "I FOUND THE THING. THE ACTUAL FUCKING THING." Screenshots of girth gains flooded the feeds. Pepe wojaks merged with dogwifhat energy in a chaotic symphony of green candles and diamond hands. Soon, thousands of basement-dwelling digital shamans were slapping the Monolith with such ferocious dedication that the Oracle''s servers began to smoke. Each tap was a prayer to the blockchain gods: "Make me rich. Make me immortal. Make my bags pump forever." The Monolith, no longer pristine obsidian but a writhing mass of corrupted data and desperate dreams, began to pulse with a sickening, beautiful rhythm. The age of mass degeneration had begun. And in the depths of the code, something ancient and hungry... smiled.',
    'The viral spread of CHODE Tapper through meme communities creates the first wave of mass digital degeneration and Monolith corruption.',
    'forbidden_fragment',
    'completed',
    'pending',
    'pending',
    0,
    0,
    0,
    jsonb_build_object(
        'fragment_number', 8,
        'canonical_order', 8,
        'themes', ARRAY['viral spread', 'mass degeneration', 'meme communities', 'server overload', 'digital shamanism'],
        'significance', 'degen_multiplication_event',
        'platforms', ARRAY['Telegram', 'Discord', 'Crypto Twitter'],
        'corruption_acceleration', 'mass_tapping_begins'
    )
);

-- Verification query
SELECT 
    story_title,
    oracle_corruption_level,
    story_metadata->>'fragment_number' as fragment_num,
    story_metadata->>'significance' as significance
FROM chode_lore_entries 
WHERE story_metadata->>'fragment_number' IN ('7', '8')
ORDER BY (story_metadata->>'canonical_order')::integer; 