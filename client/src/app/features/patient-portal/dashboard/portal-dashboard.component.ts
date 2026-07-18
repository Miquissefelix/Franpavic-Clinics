import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { ConsultaService } from '../../../core/services/consulta.service';
import { PrescricaoService } from '../../../core/services/prescricao.service';
import { ClinicaService } from '../../../core/services/clinica.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Consulta } from '../../../core/models';

@Component({
  selector: 'app-portal-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="page-enter">
      <!-- Hero de Boas-Vindas -->
      <div class="portal-hero mb-6">
        <div class="hero-content">
          <div class="hero-avatar">{{ iniciais() }}</div>
          <div class="hero-text">
            <h1>Olá, {{ primeiroNome() }}!</h1>
            <p>Bem-vindo ao seu portal de saúde FranPavic</p>
            <p class="text-sm mt-1">{{ hoje }}</p>
          </div>
        </div>
        <button mat-flat-button color="primary" routerLink="/portal/agendar">
          <mat-icon>add_circle</mat-icon> Agendar Consulta
        </button>
      </div>

      <!-- Stats Rápidas -->
      <div class="portal-stats-grid mb-6">
        <div class="portal-stat-card">
          <div class="stat-icon primary"><mat-icon>event</mat-icon></div>
          <div><span class="stat-value">{{ proximasConsultas().length }}</span><span class="stat-label">Próximas Consultas</span></div>
        </div>
        <div class="portal-stat-card">
          <div class="stat-icon success"><mat-icon>medication</mat-icon></div>
          <div><span class="stat-value">{{ prescricoesAtivas() }}</span><span class="stat-label">Prescrições Activas</span></div>
        </div>
        <div class="portal-stat-card">
          <div class="stat-icon warning"><mat-icon>biotech</mat-icon></div>
          <div><span class="stat-value">{{ resultadosPendentes() }}</span><span class="stat-label">Resultados Disponíveis</span></div>
        </div>
        <div class="portal-stat-card">
          <div class="stat-icon secondary"><mat-icon>timeline</mat-icon></div>
          <div><span class="stat-value">{{ totalConsultas() }}</span><span class="stat-label">Total Consultas</span></div>
        </div>
      </div>

      <div class="data-grid mb-6">
        <!-- Próximas Consultas -->
        <div class="card p-4">
          <div class="section-header mb-4">
            <h3>Próximas Consultas</h3>
            <a routerLink="/portal/consultas" class="text-link text-sm">Ver todas</a>
          </div>
          @if (proximasConsultas().length === 0) {
            <div class="empty-sm"><mat-icon>event_busy</mat-icon><p>Nenhuma consulta agendada</p>
              <button mat-flat-button color="primary" routerLink="/portal/agendar">Agendar Agora</button>
            </div>
          }
          @for (c of proximasConsultas().slice(0,3); track c.id) {
            <div class="portal-consulta-item">
              <div class="consulta-date-badge">
                <span class="day">{{ getDia(c.data) }}</span>
                <span class="month">{{ getMes(c.data) }}</span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-sm">{{ c.motivo }}</p>
                <p class="text-xs text-secondary">{{ c.especialidade }} · {{ c.hora }}</p>
              </div>
              <span class="chip" [ngClass]="chipStatus(c.status)">{{ labelStatus(c.status) }}</span>
            </div>
          }
        </div>

        <!-- Ações Rápidas -->
        <div class="card p-4">
          <h3 class="mb-4">O Que Deseja Fazer?</h3>
          <div class="portal-quick-actions">
            <a class="portal-action" routerLink="/portal/agendar">
              <div class="action-icon primary"><mat-icon>event_available</mat-icon></div>
              <span>Agendar Consulta</span>
            </a>
            <a class="portal-action" routerLink="/portal/historico">
              <div class="action-icon secondary"><mat-icon>history</mat-icon></div>
              <span>Histórico Clínico</span>
            </a>
            <a class="portal-action" routerLink="/portal/prescricoes">
              <div class="action-icon success"><mat-icon>medication</mat-icon></div>
              <span>Minhas Prescrições</span>
            </a>
            <a class="portal-action" routerLink="/portal/resultados">
              <div class="action-icon warning"><mat-icon>biotech</mat-icon></div>
              <span>Resultados Lab.</span>
            </a>
            <a class="portal-action" routerLink="/portal/perfil">
              <div class="action-icon neutral"><mat-icon>person</mat-icon></div>
              <span>Meu Perfil</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Última Visita -->
      @if (ultimaConsulta()) {
        <div class="card p-4">
          <h3 class="mb-3">Última Visita</h3>
          <div class="ultima-visita">
            <mat-icon style="color:var(--color-primary-600)">medical_services</mat-icon>
            <div class="flex-1">
              <p class="font-medium">{{ ultimaConsulta()!.motivo }}</p>
              <p class="text-xs text-secondary">{{ ultimaConsulta()!.especialidade }} · {{ formatarData(ultimaConsulta()!.data) }}</p>
            </div>
            <span class="chip chip-success">Concluída</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .portal-hero { background:linear-gradient(135deg,var(--color-primary-600),var(--color-secondary-500));border-radius:var(--border-radius-xl);padding:28px 32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;
      h1 { color:white;font-size:22px;font-weight:700;margin:0; }
      p  { color:rgba(255,255,255,0.8);margin:4px 0 0; }
      button { background:white !important;color:var(--color-primary-700) !important;font-weight:600; }
    }
    .hero-content { display:flex;align-items:center;gap:16px; }
    .hero-avatar { width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,0.25);color:white;font-size:20px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .hero-text { }

    .portal-stats-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:16px; @media(max-width:900px){grid-template-columns:repeat(2,1fr);} @media(max-width:480px){grid-template-columns:1fr;} }
    .portal-stat-card { background:var(--surface-card);border:1px solid var(--border-color);border-radius:var(--border-radius-md);padding:16px;display:flex;align-items:center;gap:12px;
      .stat-icon { width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;
        mat-icon { font-size:22px; }
        &.primary { background:var(--color-primary-100); mat-icon { color:var(--color-primary-600); } }
        &.success { background:var(--color-success-100); mat-icon { color:var(--color-success-600); } }
        &.warning { background:var(--color-warning-100); mat-icon { color:var(--color-warning-600); } }
        &.secondary { background:var(--color-secondary-100); mat-icon { color:var(--color-secondary-600); } }
      }
      .stat-value { font-size:26px;font-weight:700;color:var(--text-primary);display:block;line-height:1.2; }
      .stat-label { font-size:12px;color:var(--text-secondary); }
    }

    .portal-consulta-item { display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-color);&:last-child{border:none;} }
    .consulta-date-badge { width:40px;height:44px;background:var(--color-primary-50);border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid var(--color-primary-200);flex-shrink:0;
      .day { font-size:16px;font-weight:700;color:var(--color-primary-700);line-height:1; }
      .month { font-size:10px;color:var(--color-primary-500);text-transform:uppercase; }
    }

    .portal-quick-actions { display:grid;grid-template-columns:repeat(5,1fr);gap:10px; @media(max-width:600px){grid-template-columns:repeat(3,1fr);} }
    .portal-action { display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px;border-radius:10px;border:1px solid var(--border-color);background:var(--surface-input);text-decoration:none;transition:var(--transition-fast);text-align:center;
      span { font-size:11px;font-weight:500;color:var(--text-secondary); }
      &:hover { border-color:var(--color-primary-300);background:var(--color-primary-50);box-shadow:var(--shadow-md);transform:translateY(-1px);
        span { color:var(--color-primary-700); }
      }
    }
    .action-icon { width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;
      mat-icon { font-size:20px; }
      &.primary { background:var(--color-primary-100); mat-icon { color:var(--color-primary-600); } }
      &.secondary { background:var(--color-secondary-100); mat-icon { color:var(--color-secondary-600); } }
      &.success { background:var(--color-success-100); mat-icon { color:var(--color-success-600); } }
      &.warning { background:var(--color-warning-100); mat-icon { color:var(--color-warning-600); } }
      &.neutral { background:var(--color-neutral-100); mat-icon { color:var(--text-secondary); } }
    }

    .ultima-visita { display:flex;align-items:center;gap:12px;background:var(--surface-input);padding:12px;border-radius:10px;
      mat-icon { font-size:24px; }
    }

    .empty-sm { display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px;text-align:center;
      mat-icon { font-size:36px;color:var(--text-tertiary);opacity:0.4; }
      p { font-size:13px;color:var(--text-secondary); }
    }
  `],
})
export class PortalDashboardComponent implements OnInit {
  private auth        = inject(AuthService);
  private consultaSvc = inject(ConsultaService);
  private prescSvc    = inject(PrescricaoService);
  private clinicaSvc  = inject(ClinicaService);

  hoje = new Date().toLocaleDateString('pt-MZ', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });

  proximasConsultas  = signal<Consulta[]>([]);
  ultimaConsulta     = signal<Consulta | null>(null);
  prescricoesAtivas  = signal(0);
  resultadosPendentes = signal(0);
  totalConsultas     = signal(0);

  primeiroNome = computed(() => this.auth.nomeUtilizador().split(' ')[0]);
  iniciais     = computed(() => {
    const n = this.auth.nomeUtilizador();
    return n.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase();
  });

  ngOnInit(): void {
    const user = this.auth.utilizadorAtual();
    const pacienteId = user?.pacienteId ?? 'pac001';

    this.consultaSvc.listar({ pacienteId }).subscribe(consultas => {
      const futuras = consultas.filter(c => c.status === 'agendada' || c.status === 'aguardando');
      this.proximasConsultas.set(futuras);
      this.totalConsultas.set(consultas.length);
      const concluidas = consultas.filter(c => c.status === 'concluida');
      if (concluidas.length > 0) this.ultimaConsulta.set(concluidas[0]);
    });

    this.prescSvc.listar({ pacienteId }).subscribe(p => {
      this.prescricoesAtivas.set(p.filter(pr => pr.status === 'ativa').length);
    });

    this.clinicaSvc.listarResultados(pacienteId).subscribe(r => {
      this.resultadosPendentes.set(r.length);
    });
  }

  getDia(d: string): string  { return new Date(d).getDate().toString().padStart(2,'0'); }
  getMes(d: string): string  { return new Date(d).toLocaleDateString('pt-MZ', { month:'short' }); }
  formatarData(d: string): string { return new Date(d).toLocaleDateString('pt-MZ'); }
  chipStatus(s: string): string {
    const m: Record<string,string> = { agendada:'chip-primary', aguardando:'chip-warning', concluida:'chip-success', cancelada:'chip-neutral' };
    return m[s] ?? 'chip-neutral';
  }
  labelStatus(s: string): string {
    const m: Record<string,string> = { agendada:'Agendada', aguardando:'Aguardando', concluida:'Concluída', cancelada:'Cancelada' };
    return m[s] ?? s;
  }
}
