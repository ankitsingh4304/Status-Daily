export type PhotoShape = 'circle' | 'rounded' | 'square';

export type PhotoBorder = 'gradient' | 'white' | 'black' | 'gold' | 'none';

export type NameColor = 'white' | 'black' | 'gold' | 'orangeGradient' | 'pinkGradient' | 'theme';

export type FontWeight = 'medium' | 'semibold' | 'bold' | 'extrabold';

export type TextAlign = 'left' | 'center' | 'right';

export type PositionAnchor = 'left' | 'center' | 'right';

export type DesignPreset =
  | 'motivational'
  | 'devotional'
  | 'romantic'
  | 'dark'
  | 'festival'
  | 'minimal'
  | 'emotional'
  | 'neon';

export type PersonalizeEditorState = {
  displayName: string;
  statusText: string;
  photoShape: PhotoShape;
  photoBorder: PhotoBorder;
  photoGlow: boolean;
  photoSize: number;
  photoOffsetX: number;
  photoOffsetY: number;
  photoAnchor: PositionAnchor;
  textOffsetX: number;
  textOffsetY: number;
  textAnchor: PositionAnchor;
  nameColor: NameColor;
  nameSize: number;
  fontWeight: FontWeight;
  statusTextSize: number;
  statusTextColor: NameColor;
  textAlign: TextAlign;
  textShadow: number;
  textGlow: boolean;
  preset: DesignPreset;
  /** Base gradient from the reel (or preset override) */
  backgroundGradient: string[];
  templateUri: string | null;
  mediaType: 'image' | 'video' | 'gradient';
  sourceStatusId: string | null;
  showReadyPanel: boolean;
  customizeExpanded: boolean;
};
