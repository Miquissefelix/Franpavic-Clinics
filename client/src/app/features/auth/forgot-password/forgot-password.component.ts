import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="forgot-page">
      <div class="forgot-card card">
        <div class="card-header">
          <div class="icon-wrap"><mat-icon>lock_reset</mat-icon></div>
          <h2>Recuperar Senha</h2>
          <p>Introduza o seu email e enviaremos um link para redefinir a sua senha.</p>
        </div>

        @if (!enviado()) {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="forgot-form">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email">
              <mat-icon matPrefix>email_outlined</mat-icon>
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid" class="btn-submit">
              Enviar Link de Recuperação
            </button>
          </form>
        } @else {
          <div class="success-state">
            <div class="success-icon"><mat-icon>check_circle</mat-icon></div>
            <h3>Email enviado!</h3>
            <p>Verifique a sua caixa de entrada em <strong>{{ form.value.email }}</strong></p>
          </div>
        }

        <a routerLink="/entrar" class="back-link">
          <mat-icon>arrow_back</mat-icon> Voltar ao Login
        </a>
      </div>
    </div>
  `,
  styles: [`
    .forgot-page { display:flex; align-items:center; justify-content:center; min-height:100vh; background:var(--surface-background); padding:24px; }
    .forgot-card { max-width:420px; width:100%; padding:40px; border-radius:var(--border-radius-xl) !important; }
    .card-header { text-align:center; margin-bottom:28px;
      .icon-wrap { width:56px;height:56px;border-radius:50%;background:var(--color-primary-100);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;
        mat-icon { font-size:28px;color:var(--color-primary-600); } }
      h2 { font-size:22px;font-weight:700;margin:0 0 8px; }
      p  { font-size:14px;color:var(--text-secondary);margin:0; }
    }
    .forgot-form { display:flex;flex-direction:column;gap:12px; }
    .btn-submit { width:100%;height:44px;border-radius:10px !important; }
    .success-state { text-align:center;padding:16px 0;
      .success-icon { mat-icon { font-size:56px;color:var(--color-success-500); } }
      h3 { font-size:18px;font-weight:600;margin:12px 0 8px; }
      p  { font-size:14px;color:var(--text-secondary); }
    }
    .back-link { display:flex;align-items:center;gap:6px;justify-content:center;margin-top:24px;font-size:13px;color:var(--color-primary-600);text-decoration:none;
      &:hover { text-decoration:underline; }
      mat-icon { font-size:16px; }
    }
  `],
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  enviado = signal(false);
  onSubmit(): void { if (this.form.valid) this.enviado.set(true); }
}
