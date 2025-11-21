export interface FusionCompany {
  id: string;
  name: string;
  approach: string;
  location: string;
  description: string;
  website: string;
}

export interface SearchResult {
  title: string;
  uri: string;
}

export enum FusionViewMode {
  REACTION = 'REACTION',
  TOKAMAK = 'TOKAMAK',
  STELLARATOR = 'STELLARATOR',
  INERTIAL = 'INERTIAL'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: SearchResult[];
}