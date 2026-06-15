import { ViewportScroller } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-hero',
  imports: [RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  private viewportScroller = inject(ViewportScroller);

  currentSlide = signal(0);
  private intervalId: any;

  slides = [
    {
      title: 'Gâteaux Artisanaux',
      subtitle: 'Faits avec Amour',
      description: 'Découvrez nos délicieux gâteaux artisanaux faits avec les meilleurs ingrédients',
      image: 'https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg?auto=compress&cs=tinysrgb&w=1920'
    },
    {
      title: 'Moments Sucrés',
      subtitle: 'Chaque Jour',
      description: 'Expérimentez le mélange parfait du goût et de l\'artisanat dans chaque bouchée',
      image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=1920'
    },
    {
      title: 'Créations sur Mesure',
      subtitle: 'Pour Vos Occasions Spéciales',
      description: 'Laissez-nous créer le gâteau parfait pour vos moments inoubliables',
      image: 'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=1920'
    }
  ];

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide(): void {
    this.currentSlide.set((this.currentSlide() + 1) % this.slides.length);
  }

  prevSlide(): void {
    this.currentSlide.set(
      this.currentSlide() === 0 ? this.slides.length - 1 : this.currentSlide() - 1
    );
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
    this.stopAutoSlide();
    this.startAutoSlide();
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
