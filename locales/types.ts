/** BCP-47 style locale codes — add new languages here + matching JSON file */
export type LocaleCode = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'kn' | 'ml';

export type LanguageOption = {
  code: LocaleCode;
  nativeLabel: string;
  englishLabel: string;
  /** Future RTL support */
  rtl?: boolean;
};

/** Nested translation tree — all locale JSON files must share this shape */
export type TranslationTree = {
  common: {
    continue: string;
    appName: string;
    loading: string;
    share: string;
  };
  tabs: {
    home: string;
    explore: string;
    upload: string;
    saved: string;
    profile: string;
    studio: string;
    reels: string;
  };
  home: {
    categories: Record<
      | 'all'
      | 'happy'
      | 'sad'
      | 'goodMorning'
      | 'goodNight'
      | 'friendship'
      | 'love'
      | 'motivational'
      | 'devotional'
      | 'festival'
      | 'shayari'
      | 'birthday'
      | 'anniversary'
      | 'attitude'
      | 'emotional',
      string
    >;
    actions: {
      position: string;
      edit: string;
      download: string;
      shareStatus: string;
    };
    views: string;
    likes: string;
  };
  onboarding: {
    profile: {
      title: string;
      subtitle: string;
      photoHint: string;
      nameLabel: string;
      namePlaceholder: string;
      languageLabel: string;
      nameError: string;
      step: string;
    };
  };
  saved: {
    added: string;
    removed: string;
    subtitle: string;
    sortRecent: string;
    sortTitle: string;
    sortLikes: string;
    empty: string;
  };
  feed: {
    empty: string;
    trending: string;
  };
  settings: {
    title: string;
    language: string;
    preferences: string;
    changeLanguage: string;
    theme: string;
    religion?: string;
    support: string;
    helpSupport?: string;
    helpCenter?: string;
    contactUs: string;
    billing?: string;
    subscriptionRow?: string;
    invoicesRow?: string;
    testing?: string;
    testPremium?: string;
    testPremiumHint?: string;
    legalSection: string;
    privacy: string;
    terms: string;
    refund: string;
    about: string;
    account: string;
    signOut: string;
    signOutConfirm: string;
    deleteAccount: string;
    deleteConfirm: string;
    deleteCta: string;
    cancel: string;
  };
  legal: {
    privacyTitle: string;
    termsTitle: string;
    refundTitle: string;
    aboutTitle: string;
    aboutBody: string;
    privacyBody?: string;
    termsBody?: string;
    refundBody?: string;
    placeholderBody: string;
  };
  religion?: Record<string, string>;
  invoices?: Record<string, string>;
  subscription?: {
    plan: Record<string, string>;
    method: Record<string, string>;
    [key: string]: string | Record<string, string>;
  };
  help?: {
    title: string;
    subtitle: string;
    searchHint: string;
    faqTitle: string;
    contactTitle: string;
    responseNote: string;
    email: string;
    whatsapp: string;
    report: string;
    rate: string;
    faq: Record<string, string>;
  };
  studio: {
    pickPhoto: string;
    export: string;
  };
  editor: {
    title: string;
    back: string;
    yourName: string;
    namePlaceholder: string;
    statusText: string;
    statusPlaceholder: string;
    customizeLook: string;
    photoShape: string;
    photoBorder: string;
    photoGlow: string;
    photoSize: string;
    photoPosition: string;
    horizontal: string;
    vertical: string;
    nameColor: string;
    nameSize: string;
    fontWeight: string;
    statusStyle: string;
    textAlign: string;
    textShadow: string;
    textGlow: string;
    presets: string;
    statusReady: string;
    shareWhatsapp: string;
    shareInstagram: string;
    shareFacebook: string;
    shareMore: string;
    download: string;
    downloadSuccess: string;
    exportError: string;
    textPosition: string;
    dragTextHint: string;
    dragPhotoHint: string;
    dragNameHint: string;
    editAgain: string;
    shapes: { circle: string; rounded: string; square: string };
    borders: { gradient: string; white: string; black: string; gold: string; none: string };
    presetsList: Record<
      | 'motivational'
      | 'devotional'
      | 'romantic'
      | 'dark'
      | 'festival'
      | 'minimal'
      | 'emotional'
      | 'neon',
      string
    >;
    weights: { medium: string; semibold: string; bold: string; extrabold: string };
    aligns: { left: string; center: string; right: string };
  };
  profile: {
    title: string;
    bioDefault: string;
    joined: string;
    streak: string;
    streakDays: string;
    languageBadge: string;
    stats: {
      created: string;
      downloads: string;
      likes: string;
      shares: string;
      savedDesigns: string;
    };
    tabs: {
      statuses: string;
      saved: string;
      downloads: string;
      favorites: string;
    };
    engagement: {
      title: string;
      topCategory: string;
      trending: string;
      topDesign: string;
    };
    actions: {
      editProfile: string;
      changeLanguage: string;
      customizeTheme: string;
      savedDesigns: string;
      notifications: string;
      privacy: string;
      shareProfile: string;
      logout: string;
    };
    edit: {
      title: string;
      save: string;
      cancel: string;
      bioLabel: string;
      bioPlaceholder: string;
      themeLabel: string;
    };
    themes: {
      light: string;
      dark: string;
      gradient: string;
      amoled: string;
    };
    empty: string;
    logoutConfirm: string;
    logoutTitle: string;
  };
};
