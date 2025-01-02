export interface Article {
  id: string;
  publisherId: number;
  publishedAt: Date;
  title: string;
  description: string;
  imageLink: string;
  articleLink: string;
  parseAttempted: boolean;
  publisherTitle: string;
  publisher?: {
    id: number;
    title: string;
    rssLink: string;
  };
}
