export interface Card {
  id: string; label: string; speech?: string;
  art?: string; photoId?: string; next?: string; hidden?: boolean;
}
export interface Question {
  id: string; prompt: string; cards: Card[];
  enabled: boolean; escape: boolean; shuffle: boolean;
}
export type Display = 'text' | 'art' | 'photo';
export interface Theme {
  id: string; title: string; icon: string; questions: Question[];
  display: Display; builtin: boolean; hidden?: boolean;
}
export interface Pick { questionId: string; cardId: string; label: string }
export interface HistoryEntry {
  id: string; at: string; themeId: string; themeTitle: string;
  picks: Pick[]; mark?: string;
}
export interface Settings { speech: boolean }
