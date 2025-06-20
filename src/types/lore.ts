export interface LoreEntry {
  id: string;
  created_at: string;
  story_title: string;
  story_text: string;
  story_summary: string;
  comic_panel_url?: string;
  tts_audio_url?: string;
  oracle_corruption_level: string;
  view_count: number;
  like_count: number;
  share_count: number;
  input_count: number;
  lore_cycle_id: string;
  image_generation_status?: string;
}

export interface OracleLoreSlideshowProps {
  isOpen: boolean;
  entries: LoreEntry[];
  initialEntryId?: string;
  onClose: () => void;
  onGenerateComicPanel: (entry: LoreEntry) => Promise<void>;
  onGenerateAudio: (entry: LoreEntry) => Promise<void>;
  onLike: (entryId: string) => Promise<void>;
  generatingPanels: Set<string>;
  generatingAudio: Set<string>;
}