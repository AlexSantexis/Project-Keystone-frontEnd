import { Component } from '@angular/core';
import { MainBodyComponent } from '../main-body/main-body.component';

@Component({
  selector: 'app-main-carousel',
  standalone: true,
  imports: [MainBodyComponent],
  templateUrl: './main-carousel.component.html',
  styleUrl: './main-carousel.component.css',
})
export class MainCarouselComponent {}
