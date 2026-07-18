import { Component, Output, EventEmitter, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/auth/auth.service';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { BuscaGlobalService } from '../../core/services/busca-global.service';
import { TemaService } from '../../core/theme/tema.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatTooltipModule, MatDividerModule],
  template: `
    <header class="topbar">
      <!-- Botão menu hamburguer (mobile) -->
      <button class="icon-btn hide-desktop" (click)="abrirMobile.emit()">
        <mat-icon>menu</mat-icon>
      </button>
      <!-- Botão colapsar sidebar (desktop) -->
      <button class="icon-btn hide-mobile" (click)="alternarSidebar.emit()">
        <mat-icon>menu</mat-icon>
      </button>

      <!-- Busca Global (Ctrl+K) -->
      <button class="search-trigger" (click)="abrirBusca()">
        <mat-icon>search</mat-icon>
        <span class="search-placeholder hide-mobile">Buscar pacientes, consultas... </span>
        <kbd class="hide-mobile">Ctrl K</kbd>
      </button>

      <div class="topbar-right">
        <!-- Notificações -->
        <button class="icon-btn" [matMenuTriggerFor]="menuNotif"
          [matBadge]="naoLidas() > 0 ? naoLidas() : null"
          matBadgeColor="warn" matBadgeSize="small"
          matTooltip="Notificações">
          <mat-icon>notifications_outlined</mat-icon>
        </button>

        <!-- Menu Notificações -->
        <mat-menu #menuNotif="matMenu" class="notif-menu">
          <div class="notif-header" (click)="$event.stopPropagation()">
            <span>Notificações</span>
            @if (naoLidas() > 0) {
              <button class="text-btn" (click)="marcarTodasLidas()">Marcar todas como lidas</button>
            }
          </div>
          <div class="notif-list">
            @for (n of notificacoes().slice(0, 6); track n.id) {
              <div class="notif-item" [class.unread]="!n.lida" (click)="marcarLida(n.id)">
                <div class="notif-icon" [ngClass]="'notif-' + n.tipo">
                  <mat-icon>{{ n.icone }}</mat-icon>
                </div>
                <div class="notif-content">
                  <p class="notif-titulo">{{ n.titulo }}</p>
                  <p class="notif-msg">{{ n.mensagem }}</p>
                  <span class="notif-time">{{ formatarData(n.data) }}</span>
                </div>
              </div>
            }
            @if (notificacoes().length === 0) {
              <div class="notif-empty">
                <mat-icon>notifications_none</mat-icon>
                <span>Sem notificações</span>
              </div>
            }
          </div>
        </mat-menu>

        <!-- Avatar / Menu Utilizador -->
        <button class="user-btn" [matMenuTriggerFor]="menuUser">
          <div class="user-avatar-sm">{{ iniciais() }}</div>
          <span class="user-name-sm hide-mobile">{{ primeiroNome() }}</span>
          <mat-icon class="hide-mobile" style="font-size:16px;width:16px;height:16px;">expand_more</mat-icon>
        </button>

        <mat-menu #menuUser="matMenu">
          <div class="user-menu-header">
            <div class="user-avatar-lg">{{ iniciais() }}</div>
            <div>
              <p class="font-semibold text-sm">{{ nome() }}</p>
              <p class="text-xs text-secondary">{{ email() }}</p>
            </div>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="alternarTema()">
            <mat-icon>{{ temaEscuro() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            {{ temaEscuro() ? 'Tema Claro' : 'Tema Escuro' }}
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="sair()" style="color: var(--color-danger-600)">
            <mat-icon style="color: var(--color-danger-600)">logout</mat-icon>
            Sair
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: var(--topbar-height);
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 20px;
      background: var(--surface-card);
      border-bottom: 1px solid var(--border-color);
      z-index: var(--z-topbar);
      position: sticky;
      top: 0;
      box-shadow: var(--shadow-xs);
    }

    .icon-btn {
      width: 36px; height: 36px; border-radius: 8px;
      border: none; background: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-secondary); transition: var(--transition-fast);
      mat-icon { font-size: 20px; }
      &:hover { background: var(--color-neutral-100); color: var(--text-primary); }
    }

    .search-trigger {
      display: flex; align-items: center; gap: 8px;
      flex: 1; max-width: 440px;
      padding: 7px 14px; border-radius: 10px;
      border: 1px solid var(--border-color);
      background: var(--surface-input);
      cursor: pointer; color: var(--text-tertiary);
      transition: var(--transition-fast);
      font-size: 13px;
      mat-icon { font-size: 18px; color: var(--text-tertiary); }
      &:hover { border-color: var(--color-primary-400); background: var(--surface-card); }
      .search-placeholder { flex: 1; text-align: left; }
      kbd {
        padding: 2px 6px; border-radius: 4px; font-size: 11px;
        background: var(--color-neutral-200); color: var(--text-tertiary);
        border: 1px solid var(--border-color); font-family: inherit;
      }
    }

    .topbar-right {
      display: flex; align-items: center; gap: 6px; margin-left: auto;
    }

    .user-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 10px 5px 5px; border-radius: 10px;
      border: 1px solid var(--border-color);
      background: none; cursor: pointer;
      transition: var(--transition-fast);
      &:hover { background: var(--color-neutral-100); }
    }

    .user-avatar-sm {
      width: 30px; height: 30px; border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500));
      color: white; font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }

    .user-name-sm { font-size: 13px; font-weight: 500; color: var(--text-primary); }

    /* Notificações menu */
    .notif-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; font-size: 14px; font-weight: 600;
      border-bottom: 1px solid var(--border-color);
    }

    .text-btn {
      font-size: 12px; background: none; border: none;
      cursor: pointer; color: var(--color-primary-600);
      &:hover { text-decoration: underline; }
    }

    .notif-list { max-height: 380px; overflow-y: auto; min-width: 340px; }

    .notif-item {
      display: flex; gap: 10px; padding: 12px 16px;
      cursor: pointer; transition: var(--transition-fast);
      &:hover { background: var(--color-neutral-50); }
      &.unread { background: var(--color-primary-50); }
      [data-theme="dark"] &.unread { background: rgba(37,99,235,0.08); }
    }

    .notif-icon {
      width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: var(--color-primary-100);
      mat-icon { font-size: 18px; color: var(--color-primary-600); }
      &.notif-resultado-laboratorio { background: var(--color-warning-100); mat-icon { color: var(--color-warning-600); } }
      &.notif-pagamento { background: var(--color-success-100); mat-icon { color: var(--color-success-600); } }
      &.notif-sistema   { background: var(--color-neutral-100); mat-icon { color: var(--text-secondary); } }
    }

    .notif-content {
      flex: 1; min-width: 0;
      .notif-titulo { font-size: 13px; font-weight: 600; color: var(--text-primary); }
      .notif-msg    { font-size: 12px; color: var(--text-secondary); margin-top: 2px; line-height: 1.4; white-space: normal; }
      .notif-time   { font-size: 11px; color: var(--text-tertiary); margin-top: 4px; display: block; }
    }

    .notif-empty {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 32px; color: var(--text-tertiary); font-size: 13px;
      mat-icon { font-size: 32px; opacity: 0.5; }
    }

    .user-menu-header {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px; min-width: 200px;
    }

    .user-avatar-lg {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500));
      color: white; font-size: 14px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
  `],
})
export class TopbarComponent {
  @Output() alternarSidebar = new EventEmitter<void>();
  @Output() abrirMobile     = new EventEmitter<void>();

  private auth     = inject(AuthService);
  private notifSvc = inject(NotificacaoService);
  private busca    = inject(BuscaGlobalService);
  private temaService = inject(TemaService);

  notificacoes = this.notifSvc.notificacoes;
  naoLidas     = this.notifSvc.naoLidas;
  temaEscuro   = computed(() => this.temaService.temaEfetivo === 'escuro');

  nome        = computed(() => this.auth.nomeUtilizador());
  email       = computed(() => this.auth.utilizadorAtual()?.email ?? '');
  primeiroNome = computed(() => this.auth.nomeUtilizador().split(' ')[0]);
  iniciais    = computed(() => {
    const n = this.auth.nomeUtilizador();
    return n.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  });

  abrirBusca():         void { this.busca.abrirBusca(); }
  marcarLida(id: string): void { this.notifSvc.marcarLida(id).subscribe(); }
  marcarTodasLidas():   void { this.notifSvc.marcarTodasLidas().subscribe(); }
  alternarTema():       void { this.temaService.definirTema(this.temaService.temaEfetivo === 'escuro' ? 'claro' : 'escuro'); }
  sair():               void { this.auth.logout(); }

  formatarData(data: string): string {
    return new Date(data).toLocaleString('pt-MZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
