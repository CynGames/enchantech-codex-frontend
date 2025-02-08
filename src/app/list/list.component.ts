import {Component, Inject, OnInit} from "@angular/core";
import {Article} from "../interfaces/article.interface";
import {ActivatedRoute} from "@angular/router";
import {CommonModule, DOCUMENT} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'generic-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class GenericListComponent implements OnInit {
  items: Article[] = []; // Changed to strict Article array
  pageTitle: string = '';
  localStorage: Storage | undefined = undefined;
  
  constructor(private route: ActivatedRoute, @Inject(DOCUMENT) private document: Document) {
    this.localStorage = document.defaultView?.localStorage;
  }
  
  ngOnInit() {
    this.route.url.subscribe(urlSegments => {
      const path = urlSegments[0].path;
      
      if (path === 'history') {
        this.pageTitle = 'History';
        this.items = JSON.parse(this.localStorage?.getItem('articleHistory') || '[]');
      } else if (path === 'bookmarks') {
        this.pageTitle = 'Bookmarks';
        this.items = JSON.parse(this.localStorage?.getItem('bookmarkedArticles') || '[]');
      }
    });
  }
  
  removeItem(item: Article) {
    if (this.pageTitle === 'History') {
      const updatedItems = this.items.filter(i => i.articleLink !== item.articleLink);
      localStorage.setItem('articleHistory', JSON.stringify(updatedItems));
      this.items = updatedItems;
    } else if (this.pageTitle === 'Bookmarks') {
      const updatedItems = this.items.filter(i => i.articleLink !== item.articleLink);
      localStorage.setItem('bookmarkedArticles', JSON.stringify(updatedItems));
      this.items = updatedItems;
    }
  }
}
