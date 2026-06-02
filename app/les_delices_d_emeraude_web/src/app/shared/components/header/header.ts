import { Component, signal, inject } from '@angular/core';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private viewportScroller = inject(ViewportScroller);

  isMenuOpen = signal(false);
  isScrolled = signal(false);

  menuItems = [
    { label: 'Accueil', link: '#home' },
    { label: 'Spécialités', link: '#specialties' },
    { label: 'Créations', link: '#creations' },
    { label: 'Recettes', link: '#recipes' },
    { label: 'Témoignages', link: '#testimonials' },
    { label: 'Tarifs', link: '#pricing' }
  ];

  toggleMenu(): void {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  scrollToSection(link: string): void {
    const id = link.substring(1);
    setTimeout(() => {
      this.viewportScroller.scrollToPosition([0, 0]);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  }
}
