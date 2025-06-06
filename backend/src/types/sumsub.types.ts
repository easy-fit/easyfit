export interface SumsubApplicantResponse {
  id: string;
  [key: string]: any;
}

export interface SumsubWebSDKResponse {
  url: string;
  [key: string]: any;
}

export interface WebhookPayload {
  externalUserId: string;
  reviewResult: {
    reviewAnswer: string;
    [key: string]: any;
  };
  reviewStatus: string;
  [key: string]: any;
}
