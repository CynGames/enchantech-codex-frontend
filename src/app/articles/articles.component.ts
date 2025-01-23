import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";
import {Article} from "../interfaces/article.interface";
import {ArticleService} from "../services/article.service";
import {FormsModule} from "@angular/forms";
import {debounceTime, map, merge, Subject} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";

interface SearchFilters {
  title: string;
}

type SearchFilterKeys = keyof SearchFilters;

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css'
})

export class ArticlesComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  
  articles: Article[] = [];
  currentPage = 1;
  totalPages = 0;
  loading = false;
  error: string | null = null;
  
  predefinedKeywords = ['AI', 'NestJS', 'AWS', 'UI', 'Data Science', 'Machine Learning'];
  showKeywords = false;
  
  searchFilters: SearchFilters = {
    title: ''
  };
  
  private searchSubject = new Subject<void>();
  
  constructor(
    private articleService: ArticleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit() {
    merge(
      this.route.queryParams,
      this.searchSubject.pipe(
        debounceTime(300),
        map(() => {
          const queryParams: any = { page: this.currentPage };
          if (this.searchFilters.title) queryParams.title = this.searchFilters.title;
          
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams,
            queryParamsHandling: 'replace',
          });
          
          return queryParams;
        })
      )
    ).subscribe((params) => {
      this.searchFilters = {
        title: params['title'] as string || '',
      };
      this.currentPage = Number(params['page']) || 1;
      
      this.loadArticles();
    });
  }

  onSearchInput(field: SearchFilterKeys, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchFilters[field] = value;
    this.currentPage = 1;
    this.searchSubject.next();
  }
  
  clearFilters() {
    this.searchFilters = {
      title: '',
    };
    this.currentPage = 1;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage },
      queryParamsHandling: 'replace',
    });
    
    this.loadArticles();
  }
  
  private updateUrlAndLoadArticles() {
    const queryParams: any = { page: this.currentPage };
    
    Object.keys(this.searchFilters).forEach((key) => {
      if (this.searchFilters[key as SearchFilterKeys]) {
        queryParams[key] = this.searchFilters[key as SearchFilterKeys];
      }
    });
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace',
    });
    
    this.loadArticles();
  }
  
  loadArticles() {
    this.loading = true;
    this.error = null;
    
    const params = {
      page: this.currentPage,
      ...this.searchFilters
    };
    
    this.articleService.getArticles(params).subscribe({
      next: (response) => {
        this.articles = response.data;
        this.totalPages = response.meta.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load articles. Please try again later.';
        this.loading = false;
        console.error('Error loading articles:', err);
      }
    });
  }
  
  changePage(newPage: number) {
    this.currentPage = newPage;
    this.updateUrlAndLoadArticles();
  }
  
  onSearchBlur() {
    setTimeout(() => {
      if (!this.searchInput.nativeElement.contains(document.activeElement)) {
        this.showKeywords = false;
      }
    }, 100);
  }
  
  selectKeyword(keyword: string) {
    this.searchFilters.title = keyword;
    this.currentPage = 1;
    this.searchSubject.next();
    this.showKeywords = false;
    this.searchInput.nativeElement.focus();
  }
  
  ngOnDestroy() {
    this.searchSubject.complete();
  }
}
