import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast-service';
import { UserProfileService } from '../../../core/services/user-profile.service';

@Component({
  selector: 'app-loginpage',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './loginpage.html',
  styleUrls: [
    "../styles/_auth-shared.scss",
    './loginpage.scss'
  ]
})
export class Loginpage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService)
  private readonly userProfileService = inject(UserProfileService);
 
  readonly currentYear = new Date().getFullYear();
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);
 
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor(){
    const expired = this.route.snapshot.queryParamMap.get('sessionExpired');
    if (expired) {
      this.toast.info('Session expiré', 'Votre session a expiré. Veuillez vous reconnecter.');
    }
  }
 
  isFieldInvalid(field: 'email' | 'password'): boolean {
    const ctrl = this.form.get(field)!;
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }
 
  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
 
    this.isLoading.set(true);
    this.errorMessage.set(null);
 
    const { email, password } = this.form.getRawValue();
    const { error } = await this.auth.signInWithEmail(email, password);
 
    if (error) {
      this.errorMessage.set(error);
      this.isLoading.set(false);
      return;
    }
 
    await this.navigateAfterLogin();
  }
 
  async onGoogleSignIn(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const { error } = await this.auth.signInWithGoogle();
    if (error) {
      this.errorMessage.set(error);
      this.isLoading.set(false);
    }
    // Navigation gérée par OAuthCallbackpage après redirection Supabase
  }
 
  private async navigateAfterLogin(): Promise<void> {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
 
    if (returnUrl) {
      await this.router.navigateByUrl(returnUrl);
      this.isLoading.set(false);
      return;
    }
 
    try {
      const profile = await this.userProfileService.fetchOnce();
      const destination = profile.role === 'admin' ? '/admin' : '/dashboard/orders';
      await this.router.navigateByUrl(destination);
    } catch {
      await this.router.navigateByUrl('/dashboard/orders');
    } finally {
      this.isLoading.set(false);
    }
  }
}
