import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Article } from '../interfaces/article.interface';
import { backendLocal } from "../environment/environment";

interface ArticleParams {
  page: number;
  title?: string;
  description?: string;
  publisherId?: number | null;
}

interface ArticleResponse {
  data: Article[];
  meta: {
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  constructor(private http: HttpClient) {}
  
  getArticles(params: ArticleParams) {
    return this.http.get<ArticleResponse>(`${backendLocal.apiUrl}/articles`, {
      params: this.cleanParams(params)
    });
  }
  
  private cleanParams(params: ArticleParams): { [key: string]: string | number } {
    return Object.entries(params)
      .reduce((acc: { [key: string]: string | number }, [key, value]) => {
        if (value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
  }
}
