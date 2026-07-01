import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast-service';

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
 
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard/orders';
    await this.router.navigateByUrl(returnUrl);
  }
 
  async onGoogleSignIn(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const { error } = await this.auth.signInWithGoogle();
    if (error) {
      this.errorMessage.set(error);
      this.isLoading.set(false);
    }
    // Pas de navigation ici — Supabase redirige via OAuth
  }
}
