export enum Tone {
  Professional = 'Professional',
  Witty = 'Witty',
  Urgent = 'Urgent',
  Casual = 'Casual',
  Inspirational = 'Inspirational',
}

export enum Audience {
  General = 'General Public',
  TechEnthusiasts = 'Tech Enthusiasts',
  BusinessProfessionals = 'Business Professionals',
  SmallBusinessOwners = 'Small Business Owners',
  Students = 'Students',
  Creatives = 'Artists and Creatives',
}

export enum SocialPlatform {
  LinkedIn = 'LinkedIn',
  Twitter = 'Twitter/X',
  Instagram = 'Instagram',
}

export interface GeneratedPost {
  platform: SocialPlatform;
  content: string;
  image: string | null;
  aspectRatio: '1:1' | '16:9' | '3:4';
}

export interface SocialPostText {
  linkedin: string;
  twitter: string;
  instagram: string;
}
