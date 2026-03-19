export type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf' | 'clipboard' | 'mmd';

export interface MermaidSettings {
  theme: string;
  bgColor: string;
  diagramFontSize: number;
  diagramFontFamily: string;
  clrPrimary: string;
  clrSecondary: string;
  clrTertiary: string;
  clrBackground: string;
  clrText: string;
  clrLine: string;
}

export interface AppState {
  code: string;
  settings: MermaidSettings;
}

export const DEFAULT_SETTINGS: MermaidSettings = {
  theme: 'default',
  bgColor: '#ffffff',
  diagramFontSize: 16,
  diagramFontFamily: 'system-ui, sans-serif',
  clrPrimary: '#4C78DB',
  clrSecondary: '#E8D44D',
  clrTertiary: '#BB6BD9',
  clrBackground: '#ffffff',
  clrText: '#333333',
  clrLine: '#333333',
};

export const DEFAULT_CODE = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Do something]
    B -->|No| D[Do something else]
    C --> E[End]
    D --> E`;

export const BG_PRESETS = [
  { color: '#ffffff', title: 'White' },
  { color: '#f5f5f5', title: 'Light gray' },
  { color: '#1e1e2e', title: 'Dark' },
  { color: '#0d1117', title: 'GitHub Dark' },
  { color: '#fdf6e3', title: 'Solarized Light' },
  { color: '#002b36', title: 'Solarized Dark' },
  { color: 'transparent', title: 'Transparent' },
];

export const THEME_PRESETS = [
  { theme: 'default', gradient: 'linear-gradient(135deg,#4C78DB,#E8D44D)', title: 'Default' },
  { theme: 'dark', gradient: 'linear-gradient(135deg,#1f2020,#ccc)', title: 'Dark' },
  { theme: 'forest', gradient: 'linear-gradient(135deg,#2a6e3f,#8bc34a)', title: 'Forest' },
  { theme: 'neutral', gradient: 'linear-gradient(135deg,#999,#ddd)', title: 'Neutral' },
  { theme: 'base', gradient: 'linear-gradient(135deg,#f4f4f4,#cde)', title: 'Base (custom)' },
];

export const FONT_OPTIONS = [
  { value: 'system-ui, sans-serif', label: 'System UI' },
  { value: "'Segoe UI', Tahoma, sans-serif", label: 'Segoe UI' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: "'Times New Roman', serif", label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: "'Courier New', monospace", label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: "'Trebuchet MS', sans-serif", label: 'Trebuchet MS' },
  { value: "'Sarabun', sans-serif", label: 'Sarabun (Thai)' },
  { value: "'Prompt', sans-serif", label: 'Prompt (Thai)' },
  { value: "'Kanit', sans-serif", label: 'Kanit (Thai)' },
  { value: "'IBM Plex Sans Thai', sans-serif", label: 'IBM Plex Thai' },
  { value: "'Noto Sans Thai', sans-serif", label: 'Noto Sans Thai' },
  { value: "'Chakra Petch', sans-serif", label: 'Chakra Petch (Thai)' },
];
