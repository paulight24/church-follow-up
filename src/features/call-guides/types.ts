export type CallGuideStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type QuestionType = 'TEXT' | 'YES_NO' | 'SCALE' | 'MULTIPLE_CHOICE';

export interface CallGuideUserRef {
  id: string;
  firstName: string;
  lastName: string;
}

export interface CallGuideVersion {
  id: string;
  callGuideId: string;
  versionNumber: number;
  title: string;
  content: string;
  variablesJson?: string | null;
  createdById?: string | null;
  createdBy?: CallGuideUserRef | null;
  publishedById?: string | null;
  publishedBy?: CallGuideUserRef | null;
  publishedAt?: string | null;
  createdAt: string;
}

export interface CallGuideQuestion {
  id: string;
  callGuideId: string;
  question: string;
  questionType: QuestionType;
  options?: string | null;
  isRequired: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface CallGuide {
  id: string;
  name: string;
  reasonCode?: string | null;
  status: CallGuideStatus;
  currentVersionId?: string | null;
  currentVersion?: CallGuideVersion | null;
  questions: CallGuideQuestion[];
  versions?: CallGuideVersion[];
  createdAt: string;
  updatedAt: string;
  _count?: { versions: number; completions: number };
}

export interface CreateCallGuideRequest {
  name: string;
  reasonCode?: string;
  initialVersion?: {
    title: string;
    content: string;
    variablesJson?: string;
  };
}

export interface UpdateCallGuideRequest {
  name?: string;
  reasonCode?: string;
  status?: CallGuideStatus;
}

export interface CallGuideListFilters {
  status?: CallGuideStatus;
  reasonCode?: string;
}

export interface CreateVersionRequest {
  title: string;
  content: string;
  variablesJson?: string;
}

export interface CreateQuestionRequest {
  question: string;
  questionType?: QuestionType;
  options?: string;
  isRequired?: boolean;
  sortOrder?: number;
}

export type UpdateQuestionRequest = Partial<CreateQuestionRequest>;

export interface CallGuideCompletionAnswer {
  questionId: string;
  answer: string;
}

export interface CreateCompletionRequest {
  callGuideId: string;
  taskId: string;
  interactionId?: string;
  answers: CallGuideCompletionAnswer[];
}
