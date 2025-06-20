# CHODE-NET Oracle Corruption Level Standards

This document outlines the standardized corruption levels used throughout the CHODE-NET Oracle system. Maintaining consistent corruption level naming is critical for proper functionality across the frontend display, database storage, and image generation systems.

## Standard Corruption Levels

The following are the **ONLY** officially supported corruption levels:

| Level | Name | Description | Visual Style |
|-------|------|-------------|--------------|
| 0 | `pristine` | Pure, untainted Oracle state | Clean, divine, ethereal, white/cyan glow |
| 1 | `cryptic` | Subtle corruption, mysterious | Purple/blue, mysterious shadows, occult imagery |
| 2 | `flickering` | Moderate corruption, unstable | Orange/amber, glitches, digital artifacts, unstable |
| 3 | `glitched_ominous` | Heavy corruption, system failure | Red/crimson, corrupted data, system errors |
| 4 | `forbidden_fragment` | Extreme corruption, reality breakdown | Black/deep red, eldritch horror, dimensional tears |

## Frontend-Backend Naming Convention

The system uses a consistent naming convention across layers:

- **Backend (Database, Edge Functions)**: Uses lowercase snake_case (`pristine`, `glitched_ominous`)
- **Frontend (TypeScript, React)**: Uses uppercase snake_case (`PRISTINE`, `GLITCHED_OMINOUS`)

A mapping function `map_corruption_level_case(level, to_uppercase)` is available in the database to convert between these formats.

## Normalization System

A comprehensive normalization system has been implemented to handle legacy or non-standard corruption level names:

1. **Database Trigger**: All entries in the `chode_lore_entries` table are automatically normalized via a database trigger
2. **SQL Function**: A `normalize_corruption_level()` function is available in the database
3. **Edge Functions**: All edge functions use the same normalization logic
4. **Worker Scripts**: The `local-sd-worker.cjs` uses matching normalization logic

### Mapping Table

| Non-Standard Name | Standardized To |
|-------------------|----------------|
| `unstable` | `flickering` |
| `radiant_clarity` | `pristine` |
| `critical_corruption` | `glitched_ominous` |
| `data_daemon_possession` | `forbidden_fragment` |
| `glitchedOminous` | `glitched_ominous` |
| `forbiddenFragment` | `forbidden_fragment` |

## Frontend Display

The frontend components (LoreArchive, ApocryphalScrolls, etc.) are configured to display these standard corruption levels with appropriate styling:

- Each level has a specific color scheme
- Each level has a unique icon
- CSS animations vary based on corruption level
- Border and glow effects match the corruption theme

## Implementation Details

The standardization is enforced at multiple levels:

1. **Database Constraint**: A CHECK constraint ensures only valid values are stored
2. **Database Trigger**: Automatically normalizes values on INSERT/UPDATE
3. **Edge Functions**: All use the same normalization function
4. **Worker Scripts**: Image generation uses matching normalization
5. **Frontend Types**: TypeScript types are updated to use the standard values

## Extending the System

If new corruption levels need to be added:

1. Update the database constraint
2. Add the new level to all normalization functions
3. Update frontend components with appropriate styling
4. Add corresponding visual DNA to the image generation systems
5. Update TypeScript types and interfaces

## Troubleshooting

If you encounter issues with corruption level display or processing:

1. Check the database for any non-standard values: `SELECT DISTINCT oracle_corruption_level FROM chode_lore_entries;`
2. Run the normalization migration again if needed
3. Verify frontend components are handling all standard levels
4. Check that image generation is using the correct normalization 