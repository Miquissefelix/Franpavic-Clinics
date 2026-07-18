import { Component, OnInit, signal, computed, inject, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { GlobalSearchComponent } from '../../shared/global-search/global-search.component';
import { AuthService } from '../../core/auth/auth.service';
import { BuscaGlobalService } from '../../core/services/busca-global.service';
import { NotificacaoService } from '../../core/services/notificacao.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, MatSidenavModule,
    SidebarComponent, TopbarComponent, GlobalSearchComponent,
  ],
  template: `
    <div class="app-shell" [class.sidebar-collapsed]="sidebarColapsada()">
      <!-- Overlay mobile -->
      @if (mobileAberto()) {
        <div class="mobile-overlay" (click)="fecharMobile()"></div>
      }

      <!-- Sidebar -->
      <app-sidebar
        [colapsada]="sidebarColapsada()"
        [mobileAberto]="mobileAberto()"
        (colapsar)="alternarSidebar()"
        (fecharMobile)="fecharMobile()"
      />

      <!-- Área principal -->
      <div class="app-content-area">
        <app-topbar
          (alternarSidebar)="alternarSidebar()"
          (abrirMobile)="abrirMobile()"
        />
        <main class="app-main">
          <div class="page-container">
            <router-outlet />
          </div>
        </main>
      </div>

      <!-- Busca Global (Ctrl+K) -->
      <app-global-search />
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--surface-background);
    }

    .mobile-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: calc(var(--z-sidebar) - 1);
      backdrop-filter: blur(2px);
    }

    .app-content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin-left: var(--sidebar-width);
      transition: margin-left 0.3s ease;

      .sidebar-collapsed & {
        margin-left: var(--sidebar-collapsed-width);
      }

      @media (max-width: 1024px) {
        margin-left: 0 !important;
      }
    }

    .app-main {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 24px;
      background: var(--surface-background);

      @media (max-width: 768px) { padding: 16px; }
    }
  `],
})
export class ShellComponent implements OnInit {
  private auth     = inject(AuthService);
  private busca    = inject(BuscaGlobalService);
  private notifSvc = inject(NotificacaoService);

  sidebarColapsada = signal(false);
  mobileAberto     = signal(false);

  ngOnInit(): void {
    const utilizador = this.auth.utilizadorAtual();
    if (utilizador) {
      this.notifSvc.carregarParaUtilizador(utilizador.id).subscribe();
    }
    // Colapsar sidebar em telas médias
    if (window.innerWidth < 1280) this.sidebarColapsada.set(true);
  }

  alternarSidebar(): void { this.sidebarColapsada.update(v => !v); }
  abrirMobile():    void  { this.mobileAberto.set(true); }
  fecharMobile():   void  { this.mobileAberto.set(false); }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      this.busca.alternarBusca();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (window.innerWidth < 1024) this.mobileAberto.set(false);
  }
}
