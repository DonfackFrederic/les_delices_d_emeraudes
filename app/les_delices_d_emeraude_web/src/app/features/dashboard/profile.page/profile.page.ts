import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

type SaveState = 'idle' | 'saving' | 'success' | 'error';

@Component({
  selector: 'app-profile.page',
  imports: [FormsModule],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage {
  protected readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
 
  protected readonly saveState = signal<SaveState>('idle');
 
  // Pré-remplir depuis l'objet Supabase Auth brut
  private readonly user = this.authService.currentUser();
  protected fullName: string = this.user?.user_metadata?.['full_name'] ?? '';
  protected phone: string = this.user?.phone ?? '';
  protected readonly userEmail = signal(this.user?.email ?? '');
 
  protected async save(): Promise<void> {
    this.saveState.set('saving');
 
    try {
      await firstValueFrom(
        this.http.patch(`${environment.apiUrl}/users/me/profile`, {
          fullName: this.fullName.trim(),
          phone: this.phone.trim() || null,
        }),
      );
 
      this.saveState.set('success');
 
      // Masquer le toast après 3 secondes
      setTimeout(() => {
        this.saveState.set('idle');
      }, 3000);
    } catch {
      this.saveState.set('error');
      setTimeout(() => {
        this.saveState.set('idle');
      }, 4000);
    }
  }
}
