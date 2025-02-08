import {Component, ElementRef, HostListener, Inject, OnInit, ViewChild} from '@angular/core';
import {CommonModule, DOCUMENT} from "@angular/common";
import {Article} from "../interfaces/article.interface";
import {ArticleService} from "../services/article.service";
import {FormsModule} from "@angular/forms";
import {debounceTime, map, merge, Subject} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {AnalyticsService} from "../services";

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
  @ViewChild('searchContainer') searchContainer!: ElementRef;
  
  articles: Article[] = [];
  currentPage = 1;
  totalPages = 0;
  loading = false;
  error: string | null = null;
  
  bookmarkedArticles: Article[] = [];
  articleHistory: Article[] = [];
  
  predefinedKeywords = ['AI', 'Typescript', 'AWS', 'UI', 'Python', 'Golang', 'React'];
  showKeywords = false;
  
  searchFilters: SearchFilters = {
    title: ''
  };
  
  localStorage: Storage | undefined = undefined;
  
  private searchSubject = new Subject<void>();
  
  constructor(
    private articleService: ArticleService,
    private analyticsService: AnalyticsService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.localStorage = document.defaultView?.localStorage;
  }
  
  ngOnInit() {
    this.loadBookmarkedArticles();
    this.loadArticleHistory();
    
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
  
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const clickedInside = this.searchContainer.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showKeywords = false;
    }
  }
  
  onSearchInput(field: SearchFilterKeys, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchFilters[field] = value;
    this.currentPage = 1;
    this.searchSubject.next();
    this.showKeywords = true;
    this.analyticsService.trackEvent('Search', 'SearchInput', value);
  }
  
  handleKeydown(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter') {
      this.showKeywords = false;
      this.searchSubject.next();
      keyboardEvent.preventDefault();
    }
  }
  
  onReadMoreClick(article: Article) {
    this.saveArticleHistory(article);
    window.open(article.articleLink, '_blank');
  }
  
  onBookmarkArticle(article: Article) {
    this.bookmarkArticle(article);
    this.saveBookmarkedArticles();
  }
  
  private loadBookmarkedArticles() {
    this.bookmarkedArticles = JSON.parse(this.localStorage?.getItem('bookmarkedArticles') || '[]');
  }
  
  private bookmarkArticle(article: Article) {
    if (!this.bookmarkedArticles.some((a) => a.articleLink === article.articleLink)) {
      this.bookmarkedArticles.unshift(article);
      this.analyticsService.trackEvent('Bookmark', 'Article', article.title);
    } else {
      this.bookmarkedArticles = this.bookmarkedArticles.filter((a) => a.articleLink !== article.articleLink);
    }
  }
  
  private loadArticleHistory() {
    const storedHistory = this.localStorage?.getItem('articleHistory');
    this.articleHistory = storedHistory ? JSON.parse(storedHistory) : [];
  }
  
  private saveArticleHistory(article: Article) {
    if (!this.articleHistory.some(a => a.articleLink === article.articleLink)) {
      this.articleHistory.unshift(article);
      this.analyticsService.trackEvent('History', 'Article', article.title);
      this.localStorage?.setItem('articleHistory', JSON.stringify(this.articleHistory));
    }
  }
  
  private saveBookmarkedArticles() {
    this.localStorage?.setItem('bookmarkedArticles', JSON.stringify(this.bookmarkedArticles));
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
  
  isBookmarked(article: Article): boolean {
    return this.bookmarkedArticles.some(a => a.articleLink === article.articleLink);
  }
  
  selectKeyword(keyword: string) {
    this.searchFilters.title = keyword;
    this.currentPage = 1;
    this.searchSubject.next();
    this.showKeywords = false;
    this.searchInput.nativeElement.focus();
  }
  
  handleImageError(article: Article) {
    article.imageLink = 'blogging.png';
  }
}
