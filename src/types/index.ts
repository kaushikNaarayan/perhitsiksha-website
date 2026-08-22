// Base types for the Perhitsiksha website

export interface Testimonial {
  id: string;
  name: string;
  role: 'Student' | 'Parent' | 'Mentor' | 'Contributor';
  location: string;
  youtubeId?: string;
  thumbnail?: string;
  quote: { en: string; hi?: string };
  featured?: boolean;
}

export interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Education' | 'Career' | 'Community';
  date: string;
  image?: string;
  featured?: boolean;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  color?: string;
}

export interface Stats {
  studentsSupported: number;
  contributors: number;
  yearsOfImpact: number;
  programsActive: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  bio?: string;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  milestone?: boolean;
}

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string; // For video thumbnails
  alt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;

  // Single media fields
  image?: string;
  imageAlt?: string;
  videoUrl?: string;

  // Album support fields
  mediaType?: 'image' | 'video' | 'text' | 'album';
  thumbnailImage?: string;
  thumbnailAlt?: string;
  mediaCount?: number;
  media?: MediaItem[];

  // CTA fields
  ctaText: string;
  ctaLink: string;
}

// Component prop types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  href?: string;
  disabled?: boolean;
  /** Opt-in: pull the button toward the cursor on hover devices. */
  magnetic?: boolean;
  /** Opt-in: periodic attention shake (inner span) every 12s. */
  attention?: boolean;
  /** Optional accessible label (falls through to the rendered element). */
  'aria-label'?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export interface HeroProps {
  title: string;
  subheadline?: string;
  subtitle?: string;
  showLogo?: boolean;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  /** Optional ~12px muted note rendered under the primary CTA (e.g. 80G tax note). */
  taxNote?: string;
  stats?: Array<{
    value: number;
    suffix?: string;
    prefix?: string;
    label: string;
  }>;
  backgroundImage?: string;
  overlay?: boolean;
}

export interface HeroEditorialProps {
  eyebrow: string;
  /** Full headline sentence, e.g. "No student should drop out because of a lack of funds." */
  title: string;
  /** The single orange-signature accent word/phrase within `title` (v3 `.pop`), e.g. "funds." — must appear verbatim as a substring of `title`. */
  accentWord: string;
  lede: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  taxNote?: string;
  stats?: Array<{
    value: number;
    suffix?: string;
    prefix?: string;
    label: string;
  }>;
  /** The hero media — typically a <PhotoFrame><KidStackCarousel .../></PhotoFrame>. */
  media?: React.ReactNode;
  /** Prominent brand emblem (e.g. the coat-of-arms style logo) shown above the eyebrow in the copy column — distinct from, and much larger than, the header's 32px logo icon. Omit to render no emblem. */
  emblem?: string;
  /** Alt text for `emblem`. Required whenever `emblem` is set. */
  emblemAlt?: string;
  /** v3 About/Testimonials-style centered layout (no media column) — eyebrow/h1/lede/CTAs all centered in a single column instead of the left-aligned two-column grid. Ignored if `media` is set. */
  centered?: boolean;
  /** Purely decorative content (e.g. floating sprites) absolutely positioned within the hero section — rendered behind the copy. */
  decor?: React.ReactNode;
}

export interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  thumbnail?: string;
  lazyLoad?: boolean;
  autoPlay?: boolean;
}
