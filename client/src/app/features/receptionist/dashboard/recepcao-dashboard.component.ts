import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ConsultaService } from '../../../core/services/consulta.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { PagamentoService } from '../../../core/services/pagamento.service';

@Component({
  selector: 'app-recepcao-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  template: `
    <div class="page-enter">
      <div class="page-header mb-6">
        <div>
          <h1 class="text-3xl font-bold">Recepção</h1>
          <p class="text-secondary mt-1">Bom dia, Maria! • {{ hoje }}</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid mb-6">
        <div class="card p-4 kpi-card kpi-primary">
          <div class="kpi-body">
            <div class="kpi-icon"><mat-icon>people</mat-icon></div>
            <div class="kpi-info">
              <span class="kpi-label">Pacientes Hoje</span>
              <span class="kpi-value">9</span>
            </div>
          </div>
        </div>
        <div class="card p-4 kpi-card kpi-secondary">
          <div class="kpi-body">
            <div class="kpi-icon"><mat-icon>event</mat-icon></div>
            <div class="kpi-info">
              <span class="kpi-label">Consultas Hoje</span>
              <span class="kpi-value">12</span>
            </div>
          </div>
        </div>
        <div class="card p-4 kpi-card kpi-warning">
          <div class="kpi-body">
            <div class="kpi-icon"><mat-icon>pending</mat-icon></div>
            <div class="kpi-info">
              <span class="kpi-label">Em Espera</span>
              <span class="kpi-value">3</span>
            </div>
          </div>
        </div>
        <div class="card p-4 kpi-card kpi-success">
          <div class="kpi-body">
            <div class="kpi-icon"><mat-icon>payments</mat-icon></div>
            <div class="kpi-info">
              <span class="kpi-label">Pagamentos Pendentes</span>
              <span class="kpi-value">4</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Ações Rápidas -->
      <div class="card p-4 mb-6">
        <h3 class="mb-4">Ações Rápidas</h3>
        <div class="quick-actions">
          <div class="quick-action-card" routerLink="/recepcao/pacientes/novo">
            <mat-icon>person_add</mat-icon>
            <span>Registar Paciente</span>
          </div>
          <div class="quick-action-card" routerLink="/recepcao/consultas/nova">
            <mat-icon>event_available</mat-icon>
            <span>Agendar Consulta</span>
          </div>
          <div class="quick-action-card" routerLink="/recepcao/fila-espera">
            <mat-icon>queue</mat-icon>
            <span>Fila de Espera</span>
          </div>
          <div class="quick-action-card" routerLink="/recepcao/pagamentos">
            <mat-icon>payments</mat-icon>
            <span>Receber Pagamento</span>
          </div>
          <div class="quick-action-card" routerLink="/recepcao/pacientes">
            <mat-icon>search</mat-icon>
            <span>Buscar Paciente</span>
          </div>
        </div>
      </div>

      <!-- Próximas Consultas do Dia -->
      <div class="data-grid">
        <div class="card p-4">
          <div class="section-header mb-4">
            <h3>Consultas de Hoje</h3>
            <a routerLink="/recepcao/consultas" class="text-link text-sm">Ver todas</a>
          </div>
          @for (c of consultasHoje(); track c.id) {
            <div class="consulta-row">
              <div class="consulta-hora"><span class="hora">{{ c.hora }}</span></div>
              <div class="consulta-info flex-1">
                <span class="font-medium text-sm">{{ c.motivo }}</span>
                <span class="text-xs text-secondary">{{ c.especialidade }}</span>
              </div>
              <span class="chip" [ngClass]="chipStatus(c.status)">{{ labelStatus(c.status) }}</span>
            </div>
          }
        </div>

        <div class="card p-4">
          <div class="section-header mb-4">
            <h3>Pagamentos Pendentes</h3>
            <a routerLink="/recepcao/pagamentos" class="text-link text-sm">Ver todos</a>
          </div>
          @for (p of pagamentosPendentes(); track p.id) {
            <div class="pag-row">
              <div class="flex-1">
                <p class="font-medium text-sm">{{ p.descricao }}</p>
                <p class="text-xs text-secondary">{{ formatarData(p.data) }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-sm" style="color:var(--color-warning-600)">{{ p.total | number:'1.0-0' }} MZN</p>
                <span class="chip chip-warning">Pendente</span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card { .kpi-body { display:flex;gap:14px;align-items:flex-start; } .kpi-icon { width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0; mat-icon { font-size:24px; } } .kpi-label { font-size:12px;font-weight:500;color:var(--text-secondary);display:block;margin-bottom:4px; } .kpi-value { font-size:28px;font-weight:700;color:var(--text-primary);display:block;line-height:1.2; } }
    .kpi-primary .kpi-icon { background:var(--color-primary-100); mat-icon { color:var(--color-primary-600); } }
    .kpi-secondary .kpi-icon { background:var(--color-secondary-100); mat-icon { color:var(--color-secondary-600); } }
    .kpi-warning .kpi-icon { background:var(--color-warning-100); mat-icon { color:var(--color-warning-600); } }
    .kpi-success .kpi-icon { background:var(--color-success-100); mat-icon { color:var(--color-success-600); } }
    .consulta-row { display:flex;align-items:center;gap:14px;padding:10px 0;border-bottom:1px solid var(--border-color);&:last-child{border:none;} }
    .consulta-hora .hora { font-size:13px;font-weight:600;min-width:42px;display:block; }
    .consulta-info { display:flex;flex-direction:column; }
    .pag-row { display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-color);&:last-child{border:none;} }
  `],
})
export class RecepcaoDashboardComponent implements OnInit {
  private consultaSvc  = inject(ConsultaService);
  private pagamentoSvc = inject(PagamentoService);
  hoje = new Date().toLocaleDateString('pt-MZ', { weekday:'long', day:'2-digit', month:'long' });
  consultasHoje     = signal<any[]>([]);
  pagamentosPendentes = signal<any[]>([]);

  ngOnInit(): void {
    this.consultaSvc.consultasHoje().subscribe(c => this.consultasHoje.set(c));
    this.pagamentoSvc.listar({ estado: 'pendente' }).subscribe(p => this.pagamentosPendentes.set(p.slice(0,4)));
  }
  chipStatus(s: string): string {
    const m: Record<string,string> = {concluida:'chip-success','em-curso':'chip-primary',agendada:'chip-secondary',aguardando:'chip-warning',cancelada:'chip-danger'};
    return m[s] ?? 'chip-neutral';
  }
  labelStatus(s: string): string {
    const m: Record<string,string> = {concluida:'Concluída','em-curso':'Em Curso',agendada:'Agendada',aguardando:'Aguardando',cancelada:'Cancelada'};
    return m[s] ?? s;
  }
  formatarData(d: string): string { return new Date(d).toLocaleDateString('pt-MZ'); }
}
