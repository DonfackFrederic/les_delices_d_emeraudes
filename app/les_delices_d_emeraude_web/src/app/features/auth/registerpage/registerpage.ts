import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registerpage',
  imports: [ReactiveFormsModule],
  templateUrl: './registerpage.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: [
    "../styles/_auth-shared.scss",
    './registerpage.scss'
  ]
})
export class Registerpage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
 
  readonly currentYear = new Date().getFullYear();
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isSuccess = signal(false);
  readonly showPassword = signal(false);
  readonly passwordStrengthValue = signal(0);
 
  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrengthValidator]],
  });
 
  isFieldInvalid(field: keyof typeof this.form.controls): boolean {
    const ctrl = this.form.get(field)!;
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }
 
  onPasswordInput(): void {
    const value: string = this.form.get('password')!.value;
    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    this.passwordStrengthValue.set(score);
  }
 
  readonly passwordStrength = () => {
    const score = this.passwordStrengthValue();
    if (score <= 1) return { percent: 20, level: 'weak', label: 'Faible' };
    if (score <= 2) return { percent: 40, level: 'fair', label: 'Passable' };
    if (score <= 3) return { percent: 65, level: 'good', label: 'Bon' };
    if (score <= 4) return { percent: 85, level: 'strong', label: 'Fort' };
    return { percent: 100, level: 'very-strong', label: 'Très fort' };
  };
 
  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
 
    this.isLoading.set(true);
    this.errorMessage.set(null);
 
    const { firstName, lastName, email, password } = this.form.getRawValue();
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
 
    const { error } = await this.auth.signUpWithEmail(email, password, fullName);
 
    this.isLoading.set(false);
 
    if (error) {
      this.errorMessage.set(error);
      return;
    }
 
    this.isSuccess.set(true);
  }
 
  async onGoogleSignIn(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const { error } = await this.auth.signInWithGoogle();
    if (error) {
      this.errorMessage.set(error);
      this.isLoading.set(false);
    }
  }
}

// Validateur force du mot de passe (min 8 chars, 1 majuscule, 1 chiffre)
const passwordStrengthValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value: string = control.value ?? '';
  if (value.length < 8) return { tooShort: true };
  if (!/[A-Z]/.test(value)) return { noUppercase: true };
  if (!/[0-9]/.test(value)) return { noNumber: true };
  return null;
};