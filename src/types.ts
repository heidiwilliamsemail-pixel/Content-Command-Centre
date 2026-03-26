export type ProblemType = 'Technical' | 'Strategic' | 'Psychological' | 'Operational';
export type BuyerType = 'Early Stage' | 'Scaling' | 'Enterprise' | 'Solo';
export type ContextType = 'Client' | 'Idea' | 'Rant' | 'Observation';
export type ContentStatus = 'Draft' | 'Posted' | 'Performing';

export interface Signal {
  id: string;
  content: string;
  type: 'text' | 'voice';
  tags: {
    problem?: ProblemType;
    buyer?: BuyerType;
    context?: ContextType;
  };
  createdAt: number;
}

export interface Idea {
  id: string;
  signalId: string;
  coreIdea: string;
  beliefChallenged: string;
  underlyingProblem: string;
  targetBuyer: string;
  reallyAbout: string;
  whyMatters: string;
  wrongApproach: string;
  createdAt: number;
}

export interface Angle {
  id: string;
  problem: string;
  buyerType: BuyerType;
  momentOfFriction: string;
  contentAngle: string;
  linkedIdeaId?: string;
}

export interface ContentAsset {
  id: string;
  ideaId: string;
  type: 'Authority' | 'Story' | 'Breakdown' | 'Contrarian' | 'Punchy' | 'Email';
  content: string;
  status: ContentStatus;
  tags: string[];
  createdAt: number;
}

export interface ProofItem {
  id: string;
  title: string;
  problemSolved: string;
  type: 'Result' | 'Story' | 'Screenshot';
  outcome: string;
  imageUrl?: string;
}

export interface Framework {
  id: string;
  name: string;
  whenToUse: string;
  structure: string;
  example: string;
}
