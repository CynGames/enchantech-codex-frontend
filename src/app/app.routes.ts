import { Routes } from '@angular/router';
import {ArticlesComponent} from "./articles/articles.component";
import {GenericListComponent} from "./list/list.component";

export const routes: Routes = [
  { path: '', component: ArticlesComponent },
  { path: 'history', component: GenericListComponent },
  { path: 'bookmarks', component: GenericListComponent }
];


