import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { UserProfileService } from '../../../core/services/user-profile.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss',
})
export class DashboardLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly userProfileService = inject(UserProfileService); // ← nouveau
 
  protected readonly userInitials = this.authService.userInitials;
  protected readonly userDisplayName = this.authService.userDisplayName;
  protected readonly isAdmin = this.userProfileService.isAdmin; // ← nouveau
 
  protected async signOut(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/home']);
  }
}
