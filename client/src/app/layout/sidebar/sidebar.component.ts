import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { AuthService } from '../../core/auth/auth.service';
import { TemaService } from '../../core/theme/tema.service';
import { PerfilUtilizador } from '../../core/models';

interface NavItem {
  titulo: string;
  icone: string;
  rota: string;
  perfis: PerfilUtilizador[];
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule, MatRippleModule],
  template: `
    <aside class="sidebar" [class.collapsed]="colapsada" [class.mobile-open]="mobileAberto">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <mat-icon>local_hospital</mat-icon>
        </div>
        @if (!colapsada) {
          <div class="logo-text">
            <span class="logo-title">FranPavic</span>
            <span class="logo-subtitle">Clínicas</span>
          </div>
        }
        <button class="collapse-btn hide-mobile" (click)="colapsar.emit()" matRipple>
          <mat-icon>{{ colapsada ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>

      <!-- Perfil do Utilizador -->
      <div class="sidebar-user" [class.collapsed]="colapsada">
        <div class="user-avatar">
          <span>{{ iniciais() }}</span>
        </div>
        @if (!colapsada) {
          <div class="user-info">
            <span class="user-name">{{ nome() }}</span>
            <span class="user-role chip" [ngClass]="'chip-' + corPerfil()">{{ labelPerfil() }}</span>
          </div>
        }
      </div>

      <hr class="divider">

      <!-- Navegação -->
      <nav class="sidebar-nav">
        <span class="nav-label" *ngIf="!colapsada">Menu</span>
        @for (item of itemsVisiveis(); track item.rota) {
          <a
            class="nav-item"
            [routerLink]="item.rota"
            routerLinkActive="nav-item-active"
            (click)="fecharMobile.emit()"
            [matTooltip]="colapsada ? item.titulo : ''"
            matTooltipPosition="right"
            matRipple
          >
            <mat-icon class="nav-icon">{{ item.icone }}</mat-icon>
            @if (!colapsada) {
              <span class="nav-text">{{ item.titulo }}</span>
            }
          </a>
        }
      </nav>

      <div class="sidebar-footer">
        <hr class="divider">
        <!-- Tema -->
        <button class="nav-item" (click)="alternarTema()" matRipple
          [matTooltip]="colapsada ? 'Alternar Tema' : ''" matTooltipPosition="right">
          <mat-icon>{{ temaEscuro() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          @if (!colapsada) { <span class="nav-text">{{ temaEscuro() ? 'Tema Claro' : 'Tema Escuro' }}</span> }
        </button>
        <!-- Sair -->
        <button class="nav-item nav-logout" (click)="sair()" matRipple
          [matTooltip]="colapsada ? 'Sair' : ''" matTooltipPosition="right">
          <mat-icon>logout</mat-icon>
          @if (!colapsada) { <span class="nav-text">Sair</span> }
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0; top: 0; bottom: 0;
      width: var(--sidebar-width);
      background: var(--surface-card);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      z-index: var(--z-sidebar);
      transition: width 0.3s ease, transform 0.3s ease;
      overflow: hidden;

      &.collapsed { width: var(--sidebar-collapsed-width); }

      @media (max-width: 1024px) {
        transform: translateX(-100%);
        &.mobile-open { transform: translateX(0); }
      }
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 14px;
      min-height: 64px;
      border-bottom: 1px solid var(--border-color);

      .logo-icon {
        width: 36px; height: 36px;
        border-radius: 10px;
        background: linear-gradient(135deg, var(--color-primary-600), var(--color-secondary-500));
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        mat-icon { color: white; font-size: 20px; width: 20px; height: 20px; }
      }

      .logo-text {
        display: flex; flex-direction: column; flex: 1; min-width: 0;
        .logo-title  { font-size: 15px; font-weight: 700; color: var(--text-primary); }
        .logo-subtitle { font-size: 11px; color: var(--text-tertiary); }
      }

      .collapse-btn {
        background: none; border: none; cursor: pointer; padding: 4px; border-radius: 6px;
        color: var(--text-tertiary); display: flex; align-items: center;
        &:hover { background: var(--color-neutral-100); color: var(--text-primary); }
        mat-icon { font-size: 18px; width: 18px; height: 18px; }
      }
    }

    .sidebar-user {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px;

      .user-avatar {
        width: 36px; height: 36px; border-radius: 50%;
        background: linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500));
        display: flex; align-items: center; justify-content: center;
        color: white; font-size: 13px; font-weight: 600;
        flex-shrink: 0;
      }

      .user-info {
        display: flex; flex-direction: column; min-width: 0;
        .user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      }
    }

    .sidebar-nav {
      flex: 1; overflow-y: auto; padding: 8px 8px 0;
      .nav-label { font-size: 10px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.08em; padding: 8px 8px 4px; display: block; }
    }

    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 10px; border-radius: 8px;
      color: var(--text-secondary); text-decoration: none;
      cursor: pointer; border: none; background: none;
      width: 100%; font-size: 14px; font-weight: 500;
      transition: all 0.15s ease; margin-bottom: 2px;

      &:hover { background: var(--color-neutral-100); color: var(--text-primary); }

      .nav-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
      .nav-text  { white-space: nowrap; }

      &.nav-logout:hover { background: var(--color-danger-50); color: var(--color-danger-600); }
    }

    .nav-item-active {
      background: var(--color-primary-50) !important;
      color: var(--color-primary-700) !important;
      .nav-icon { color: var(--color-primary-600); }
    }

    [data-theme="dark"] .nav-item-active {
      background: rgba(37,99,235,0.15) !important;
      color: var(--color-primary-300) !important;
    }

    .sidebar-footer { padding: 8px; }

    .collapsed {
      .sidebar-nav { padding: 8px 8px 0; }
      .nav-item { justify-content: center; }
      .sidebar-user { justify-content: center; }
    }
  `],
})
export class SidebarComponent {
  @Input() colapsada   = false;
  @Input() mobileAberto = false;
  @Output() colapsar    = new EventEmitter<void>();
  @Output() fecharMobile = new EventEmitter<void>();

  private auth      = inject(AuthService);
  private temaService = inject(TemaService);

  private allNavItems: NavItem[] = [
    // Admin
    { titulo: 'Dashboard',    icone: 'dashboard',       rota: '/admin/dashboard',    perfis: ['administrador'] },
    { titulo: 'Relatórios',   icone: 'bar_chart',        rota: '/admin/relatorios',   perfis: ['administrador'] },
    { titulo: 'Auditoria',    icone: 'history',          rota: '/admin/auditoria',    perfis: ['administrador'] },
    // Recepção
    { titulo: 'Dashboard',    icone: 'dashboard',        rota: '/recepcao/dashboard', perfis: ['recepcionista'] },
    { titulo: 'Pacientes',    icone: 'people',           rota: '/recepcao/pacientes', perfis: ['recepcionista'] },
    { titulo: 'Consultas',    icone: 'event',            rota: '/recepcao/consultas', perfis: ['recepcionista'] },
    { titulo: 'Fila de Espera', icone: 'queue',          rota: '/recepcao/fila-espera', perfis: ['recepcionista'] },
    { titulo: 'Pagamentos',   icone: 'payments',         rota: '/recepcao/pagamentos', perfis: ['recepcionista'] },
    // Enfermagem
    { titulo: 'Dashboard',    icone: 'dashboard',        rota: '/enfermagem/dashboard', perfis: ['enfermeira'] },
    { titulo: 'Triagem',      icone: 'monitor_heart',    rota: '/enfermagem/triagem',   perfis: ['enfermeira'] },
    // Médico
    { titulo: 'Dashboard',    icone: 'dashboard',        rota: '/medico/dashboard',   perfis: ['medico'] },
    { titulo: 'Minha Agenda', icone: 'calendar_month',   rota: '/medico/agenda',      perfis: ['medico'] },
    { titulo: 'Consultas',    icone: 'medical_services', rota: '/medico/consultas',   perfis: ['medico'] },
    { titulo: 'Prescrições',  icone: 'medication',       rota: '/medico/prescricoes', perfis: ['medico'] },
    { titulo: 'Certificados', icone: 'description',      rota: '/medico/certificados', perfis: ['medico'] },
    // Portal Paciente
    { titulo: 'Início',       icone: 'home',             rota: '/portal/dashboard',   perfis: ['paciente'] },
    { titulo: 'Minhas Consultas', icone: 'event',        rota: '/portal/consultas',   perfis: ['paciente'] },
    { titulo: 'Agendar',      icone: 'add_circle',       rota: '/portal/agendar',     perfis: ['paciente'] },
    { titulo: 'Histórico',    icone: 'timeline',         rota: '/portal/historico',   perfis: ['paciente'] },
    { titulo: 'Prescrições',  icone: 'medication',       rota: '/portal/prescricoes', perfis: ['paciente'] },
    { titulo: 'Resultados',   icone: 'biotech',          rota: '/portal/resultados',  perfis: ['paciente'] },
    { titulo: 'Meu Perfil',   icone: 'person',           rota: '/portal/perfil',      perfis: ['paciente'] },
  ];

  itemsVisiveis = computed(() => {
    const perfil = this.auth.perfil();
    return perfil ? this.allNavItems.filter(i => i.perfis.includes(perfil)) : [];
  });

  nome     = computed(() => this.auth.nomeUtilizador());
  iniciais = computed(() => {
    const n = this.auth.nomeUtilizador();
    return n.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  });

  temaEscuro = computed(() => this.temaService.temaEfetivo === 'escuro');

  labelPerfil = computed(() => {
    const map: Record<string, string> = {
      administrador: 'Admin', medico: 'Médico',
      recepcionista: 'Recepção', enfermeira: 'Enfermagem', paciente: 'Paciente',
    };
    return map[this.auth.perfil() ?? ''] ?? '';
  });

  corPerfil = computed(() => {
    const map: Record<string, string> = {
      administrador: 'danger', medico: 'primary',
      recepcionista: 'secondary', enfermeira: 'success', paciente: 'warning',
    };
    return map[this.auth.perfil() ?? ''] ?? 'neutral';
  });

  alternarTema(): void {
    this.temaService.definirTema(this.temaService.temaEfetivo === 'escuro' ? 'claro' : 'escuro');
  }

  sair(): void { this.auth.logout(); }
}
