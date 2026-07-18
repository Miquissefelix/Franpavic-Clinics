import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/auth/auth.service';

interface DemoCredencial {
  perfil: string; email: string; senha: string; cor: string; icone: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatCheckboxModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatChipsModule,
  ],
  template: `
    <div class="login-page">
      <!-- Lado esquerdo — Ilustração -->
      <div class="login-visual">
        <div class="visual-content">
          <div class="brand-logo">
            <div class="brand-icon"><mat-icon>local_hospital</mat-icon></div>
            <div class="brand-text">
              <h1>FranPavic Clínicas</h1>
              <p>Sistema de Gestão Clínica</p>
            </div>
          </div>

          <div class="visual-stats">
            <div class="stat-card">
              <mat-icon>people</mat-icon>
              <div><span class="stat-num">1.200+</span><span class="stat-lbl">Pacientes</span></div>
            </div>
            <div class="stat-card">
              <mat-icon>medical_services</mat-icon>
              <div><span class="stat-num">10</span><span class="stat-lbl">Especialidades</span></div>
            </div>
            <div class="stat-card">
              <mat-icon>event_available</mat-icon>
              <div><span class="stat-num">98%</span><span class="stat-lbl">Satisfação</span></div>
            </div>
          </div>

          <div class="visual-illustration">
            <div class="illustration-circle">
              <div class="ill-pulse"></div>
              <mat-icon class="ill-icon">health_and_safety</mat-icon>
            </div>
            <div class="floating-badge badge-1">
              <mat-icon>check_circle</mat-icon>
              <span>Consulta Confirmada</span>
            </div>
            <div class="floating-badge badge-2">
              <mat-icon>biotech</mat-icon>
              <span>Resultado Disponível</span>
            </div>
          </div>

          <p class="visual-quote">
            "Cuidando de quem cuida de Moçambique"
          </p>
        </div>
      </div>

      <!-- Lado direito — Formulário -->
      <div class="login-form-side">
        <div class="login-form-container">
          <div class="form-header">
            <h2>Bem-vindo de volta</h2>
            <p>Inicie sessão na sua conta</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="utilizador@franpavic.co.mz">
              <mat-icon matPrefix>email_outlined</mat-icon>
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>Email é obrigatório</mat-error>
              }
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Email inválido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Senha</mat-label>
              <input matInput [type]="mostrarSenha() ? 'text' : 'password'" formControlName="senha">
              <mat-icon matPrefix>lock_outlined</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="toggleSenha()">
                <mat-icon>{{ mostrarSenha() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('senha')?.hasError('required') && form.get('senha')?.touched) {
                <mat-error>Senha é obrigatória</mat-error>
              }
            </mat-form-field>

            <div class="form-options">
              <mat-checkbox formControlName="lembrar" color="primary">Lembrar-me</mat-checkbox>
              <a class="forgot-link" href="#" (click)="irParaRecuperar($event)">Esqueceu a senha?</a>
            </div>

            @if (erro()) {
              <div class="error-alert">
                <mat-icon>error_outline</mat-icon>
                <span>{{ erro() }}</span>
              </div>
            }

            <button mat-flat-button color="primary" type="submit" class="btn-login"
              [disabled]="form.invalid || carregando()">
              @if (carregando()) {
                <mat-spinner diameter="20" color="accent"></mat-spinner>
                <span>A entrar...</span>
              } @else {
                <mat-icon>login</mat-icon>
                <span>Entrar</span>
              }
            </button>
          </form>

          <!-- Credenciais de Demo -->
          <div class="demo-section">
            <div class="demo-divider">
              <span>Credenciais de Demonstração</span>
            </div>
            <div class="demo-grid">
              @for (cred of credenciais; track cred.perfil) {
                <button class="demo-card" (click)="preencherCredencial(cred)" [class]="'demo-' + cred.cor">
                  <mat-icon>{{ cred.icone }}</mat-icon>
                  <span>{{ cred.perfil }}</span>
                </button>
              }
            </div>
          </div>

          <p class="login-footer">
            © 2025 FranPavic Clínicas — Maputo, Moçambique
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex; min-height: 100vh;
      background: var(--surface-background);

      @media (max-width: 900px) { flex-direction: column; }
    }

    /* ── Lado Esquerdo ── */
    .login-visual {
      flex: 1; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(145deg, #1e3a8a 0%, #2563eb 45%, #14b8a6 100%);
      position: relative; overflow: hidden; padding: 48px;
      min-height: 100vh;

      @media (max-width: 900px) { min-height: 280px; padding: 32px 24px; }
      @media (max-width: 600px) { display: none; }

      &::before {
        content: ''; position: absolute; inset: 0;
        background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      }
    }

    .visual-content {
      position: relative; z-index: 1; color: white;
      display: flex; flex-direction: column; gap: 32px; max-width: 480px;
    }

    .brand-logo {
      display: flex; align-items: center; gap: 14px;
      .brand-icon {
        width: 52px; height: 52px; border-radius: 16px;
        background: rgba(255,255,255,0.2); backdrop-filter: blur(10px);
        display: flex; align-items: center; justify-content: center;
        mat-icon { font-size: 28px; color: white; }
      }
      h1 { font-size: 22px; font-weight: 700; color: white; margin: 0; }
      p  { font-size: 13px; color: rgba(255,255,255,0.7); margin: 0; }
    }

    .visual-stats {
      display: flex; gap: 16px;
      @media (max-width: 900px) { display: none; }
    }

    .stat-card {
      flex: 1; background: rgba(255,255,255,0.12); backdrop-filter: blur(10px);
      border-radius: 14px; padding: 16px; display: flex; align-items: center; gap: 10px;
      border: 1px solid rgba(255,255,255,0.2);
      mat-icon { color: rgba(255,255,255,0.8); font-size: 22px; }
      .stat-num { font-size: 20px; font-weight: 700; color: white; display: block; }
      .stat-lbl { font-size: 11px; color: rgba(255,255,255,0.6); display: block; }
    }

    .visual-illustration {
      position: relative; display: flex; align-items: center; justify-content: center;
      height: 200px;
      @media (max-width: 900px) { display: none; }
    }

    .illustration-circle {
      width: 140px; height: 140px; border-radius: 50%;
      background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.3);
      display: flex; align-items: center; justify-content: center;
      position: relative;
      .ill-icon { font-size: 64px; width: 64px; height: 64px; color: white; opacity: 0.9; }
    }

    .ill-pulse {
      position: absolute; inset: -12px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.2);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.08); opacity: 0.3; }
    }

    .floating-badge {
      position: absolute; display: flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.95); border-radius: 10px; padding: 8px 12px;
      color: #1e293b; font-size: 12px; font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2); white-space: nowrap;
      mat-icon { font-size: 16px; color: var(--color-success-600); }

      &.badge-1 { top: 10px; right: -20px; animation: float 3s ease-in-out infinite; }
      &.badge-2 { bottom: 10px; left: -20px; animation: float 3s ease-in-out 1.5s infinite; }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    .visual-quote {
      font-size: 15px; color: rgba(255,255,255,0.8); font-style: italic;
      border-left: 3px solid rgba(255,255,255,0.5); padding-left: 16px;
      @media (max-width: 900px) { display: none; }
    }

    /* ── Lado Direito ── */
    .login-form-side {
      width: 480px; display: flex; align-items: center; justify-content: center;
      padding: 48px 40px; background: var(--surface-card);
      @media (max-width: 900px) { width: 100%; padding: 32px 24px; }
    }

    .login-form-container { width: 100%; max-width: 380px; }

    .form-header {
      margin-bottom: 32px;
      h2 { font-size: 26px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px; }
      p  { font-size: 14px; color: var(--text-secondary); margin: 0; }
    }

    .login-form {
      display: flex; flex-direction: column; gap: 4px;
      mat-form-field { width: 100%; }
    }

    .form-options {
      display: flex; align-items: center; justify-content: space-between;
      margin: 4px 0;
      .forgot-link { font-size: 13px; color: var(--color-primary-600); text-decoration: none;
        &:hover { text-decoration: underline; } }
    }

    .error-alert {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; border-radius: 8px;
      background: var(--color-danger-50); border: 1px solid var(--color-danger-200);
      color: var(--color-danger-700); font-size: 13px;
      mat-icon { font-size: 18px; }
    }

    .btn-login {
      height: 46px; font-size: 15px; font-weight: 600; border-radius: 10px !important;
      margin-top: 8px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%;
    }

    /* ── Demo Section ── */
    .demo-section { margin-top: 28px; }

    .demo-divider {
      display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
      &::before, &::after { content: ''; flex: 1; height: 1px; background: var(--border-color); }
      span { font-size: 11px; color: var(--text-tertiary); white-space: nowrap; font-weight: 500; }
    }

    .demo-grid {
      display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;
      @media (max-width: 480px) { grid-template-columns: repeat(3, 1fr); }
    }

    .demo-card {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 10px 6px; border-radius: 10px; border: 1px solid var(--border-color);
      background: var(--surface-input); cursor: pointer; transition: var(--transition-fast);
      font-size: 10px; font-weight: 600; color: var(--text-secondary);
      mat-icon { font-size: 20px; }

      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }

      &.demo-primary   { &:hover { border-color: var(--color-primary-400); background: var(--color-primary-50); color: var(--color-primary-700); mat-icon { color: var(--color-primary-600); } } }
      &.demo-success   { &:hover { border-color: var(--color-success-400); background: var(--color-success-50); color: var(--color-success-700); mat-icon { color: var(--color-success-600); } } }
      &.demo-warning   { &:hover { border-color: var(--color-warning-400); background: var(--color-warning-50); color: var(--color-warning-700); mat-icon { color: var(--color-warning-600); } } }
      &.demo-secondary { &:hover { border-color: var(--color-secondary-400); background: var(--color-secondary-50); color: var(--color-secondary-700); mat-icon { color: var(--color-secondary-600); } } }
      &.demo-danger    { &:hover { border-color: var(--color-danger-400); background: var(--color-danger-50); color: var(--color-danger-700); mat-icon { color: var(--color-danger-600); } } }
    }

    .login-footer {
      margin-top: 32px; font-size: 11px; color: var(--text-tertiary);
      text-align: center;
    }
  `],
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  form = this.fb.group({
    email:  ['', [Validators.required, Validators.email]],
    senha:  ['', [Validators.required, Validators.minLength(4)]],
    lembrar: [false],
  });

  mostrarSenha = signal(false);
  carregando   = this.auth.carregando;
  erro         = signal<string | null>(null);

  credenciais: DemoCredencial[] = [
    { perfil: 'Admin',      email: 'admin@franpavic.co.mz',      senha: 'admin123',       cor: 'danger',    icone: 'admin_panel_settings' },
    { perfil: 'Médico',     email: 'medico@franpavic.co.mz',     senha: 'medico123',      cor: 'primary',   icone: 'medical_services' },
    { perfil: 'Recepção',   email: 'recepcao@franpavic.co.mz',   senha: 'recepcao123',    cor: 'secondary', icone: 'support_agent' },
    { perfil: 'Enfermagem', email: 'enfermeira@franpavic.co.mz', senha: 'enfermeira123',  cor: 'success',   icone: 'health_and_safety' },
    { perfil: 'Paciente',   email: 'paciente@franpavic.co.mz',   senha: 'paciente123',    cor: 'warning',   icone: 'person' },
  ];

  toggleSenha(): void { this.mostrarSenha.update(v => !v); }

  preencherCredencial(cred: DemoCredencial): void {
    this.form.patchValue({ email: cred.email, senha: cred.senha });
    this.erro.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.erro.set(null);

    const { email, senha } = this.form.value;
    this.auth.login(email!, senha!).subscribe({
      next: sessao => {
        this.snack.open(`Bem-vindo, ${sessao.utilizador.nome.split(' ')[0]}!`, '', {
          duration: 3000, panelClass: ['success-snack'],
        });
        const rota = this.auth.getRoteamentoPorPerfil(sessao.utilizador.perfil);
        this.router.navigate([rota]);
      },
      error: err => {
        this.erro.set(err.message ?? 'Erro ao iniciar sessão.');
      },
    });
  }

  irParaRecuperar(e: Event): void {
    e.preventDefault();
    this.router.navigate(['/recuperar-senha']);
  }
}
