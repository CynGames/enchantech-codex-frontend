import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  imports: [
    RouterLinkActive,
    RouterLink
  ],
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {}
