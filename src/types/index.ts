// Base types for the PerhitSiksha website

export interface Testimonial {
  id: string;
  name: string;
  role: 'Student' | 'Parent' | 'Mentor' | 'Contributor';
  location: string;
  youtubeId?: string;
  thumbnail?: string;
  quote: string;
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

// Component prop types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  href?: string;
  disabled?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export interface HeroProps {
  title: string;
  subtitle?: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  stats?: Array<{
    value: number;
    suffix?: string;
    prefix?: string;
    label: string;
  }>;
  backgroundImage?: string;
  overlay?: boolean;
}

export interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  thumbnail?: string;
  lazyLoad?: boolean;
  autoPlay?: boolean;
}
