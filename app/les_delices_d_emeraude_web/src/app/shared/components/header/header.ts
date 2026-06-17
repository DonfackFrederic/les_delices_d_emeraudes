import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartIconComponent } from "./cart-icon/cart-icon";

@Component({
  selector: 'app-header',
  imports: [RouterLink, CartIconComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly auth = inject(AuthService);

  isMenuOpen = signal(false);
  isProfileMenuOpen = signal(false);

  // Signals exposés depuis AuthService
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly currentUser = this.auth.currentUser;

  // Initiales pour l'avatar (ex: "Marie Dupont" → "MD")
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    const name: string =
      user?.user_metadata?.['full_name'] ?? user?.email ?? '';
    return name
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    return user?.user_metadata?.['full_name'] ?? user?.email ?? '';
  });

  menuItems = [
    { label: 'Accueil', link: '/home' },
    { label: 'Produits', link: '/products' },
  ];

  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
    this.isProfileMenuOpen.set(false);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update((v) => !v);
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen.set(false);
  }

  async signOut(): Promise<void> {
    this.isProfileMenuOpen.set(false);
    this.isMenuOpen.set(false);
    await this.auth.signOut();
  }
}