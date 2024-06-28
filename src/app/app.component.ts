import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { MainCarouselComponent } from './components/main-carousel/main-carousel.component';
import { MainBodyComponent } from './components/main-body/main-body.component';
import { LoginComponent } from './components/customer/account/login/login.component';
import { EditComponent } from './components/customer/account/edit/edit.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    MainCarouselComponent,
    MainBodyComponent,
    LoginComponent,
    EditComponent,
    RouterLink,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'ProjectKeystone';
}
