import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { ConsultaService } from '../../../core/services/consulta.service';
import { PrescricaoService } from '../../../core/services/prescricao.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-medico-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatChipsModule, MatCardModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="greeting">
          <h1>Bom dia, <span>Dr. António Machava!</span></h1>
          <p>{{ todayFormatted }}</p>
        </div>
        <div class="quick-actions">
          <button mat-flat-button color="primary">
            <mat-icon>add</mat-icon> Nova Consulta
          </button>
          <button mat-stroked-button color="primary" routerLink="/medico/agenda">
            <mat-icon>calendar_today</mat-icon> Ver Agenda
          </button>
        </div>
      </header>

      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon bg-primary-100 text-primary-700"><mat-icon>assignment</mat-icon></div>
          <div class="stat-info">
            <span class="stat-value">5</span>
            <span class="stat-label">Consultas Hoje</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-success-100 text-success-700"><mat-icon>check_circle</mat-icon></div>
          <div class="stat-info">
            <span class="stat-value">3</span>
            <span class="stat-label">Concluídas</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-warning-100 text-warning-700"><mat-icon>hourglass_empty</mat-icon></div>
          <div class="stat-info">
            <span class="stat-value">2</span>
            <span class="stat-label">Pendentes</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-indigo-100 text-indigo-700"><mat-icon>people</mat-icon></div>
          <div class="stat-info">
            <span class="stat-value">12</span>
            <span class="stat-label">Pacientes Totais</span>
          </div>
        </div>
      </section>

      <div class="content-grid">
        <section class="main-content">
          <div class="section-header">
            <h2>Consultas de Hoje</h2>
            <button mat-button color="primary" routerLink="/medico/consultas">Ver todas</button>
          </div>
          
          <div class="consultas-list">
            @for (consulta of consultasHoje(); track consulta.id) {
              <mat-card class="consulta-card" appearance="outlined">
                <div class="time-block">
                  <span class="time">{{ consulta.dataHora | date:'HH:mm' }}</span>
                </div>
                <div class="info-block">
                  <h3>{{ getPacienteName(consulta.pacienteId) }}</h3>
                  <p class="motivo">{{ consulta.motivo }} • {{ consulta.especialidade }}</p>
                </div>
                <div class="status-block">
                  <mat-chip [ngClass]="getStatusClass(consulta.status)">{{ consulta.status }}</mat-chip>
                </div>
                <div class="action-block">
                  @if (consulta.status === 'Agendada' || consulta.status === 'Em Curso') {
                    <button mat-flat-button color="primary" [routerLink]="['/medico/consultas', consulta.id]">
                      Iniciar Consulta
                    </button>
                  } @else {
                    <button mat-stroked-button [routerLink]="['/medico/consultas', consulta.id]">
                      Ver
                    </button>
                  }
                </div>
              </mat-card>
            } @empty {
              <div class="empty-state">
                <mat-icon>event_available</mat-icon>
                <p>Não há mais consultas agendadas para hoje.</p>
              </div>
            }
          </div>
        </section>

        <aside class="side-content">
          <div class="section-header">
            <h2>Prescrições Recentes</h2>
            <button mat-button color="primary">Ver todas</button>
          </div>
          
          <div class="prescricoes-list">
            @for (presc of prescricoesRecentes(); track presc.id) {
              <div class="prescricao-item">
                <div class="presc-icon"><mat-icon>medication</mat-icon></div>
                <div class="presc-info">
                  <h4>{{ getPacienteName(presc.pacienteId) }}</h4>
                  <p>{{ presc.data | date:'dd/MM/yyyy' }}</p>
                </div>
                <button mat-icon-button color="primary"><mat-icon>download</mat-icon></button>
              </div>
            }
          </div>

          <div class="quick-links-card mt-4">
            <h3>Acessos Rápidos</h3>
            <button mat-button class="w-full text-left"><mat-icon>description</mat-icon> Emitir Certificado</button>
            <button mat-button class="w-full text-left"><mat-icon>science</mat-icon> Solicitar Exames</button>
            <button mat-button class="w-full text-left"><mat-icon>history</mat-icon> Histórico de Pacientes</button>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; }
    .greeting h1 { margin: 0; font-size: 28px; font-weight: 600; color: var(--color-gray-900); }
    .greeting h1 span { color: var(--color-primary-600); }
    .greeting p { margin: 4px 0 0; color: var(--color-gray-500); font-size: 16px; text-transform: capitalize; }
    .quick-actions { display: flex; gap: 16px; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
    .stat-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { font-size: 24px; width: 24px; height: 24px; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 28px; font-weight: 700; color: var(--color-gray-900); line-height: 1; }
    .stat-label { font-size: 13px; color: var(--color-gray-500); margin-top: 4px; font-weight: 500; }

    .bg-primary-100 { background: #dbeafe; } .text-primary-700 { color: #1d4ed8; }
    .bg-success-100 { background: #dcfce3; } .text-success-700 { color: #15803d; }
    .bg-warning-100 { background: #ffedd5; } .text-warning-700 { color: #c2410c; }
    .bg-indigo-100 { background: #e0e7ff; } .text-indigo-700 { color: #4338ca; }

    .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 32px; }
    @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } }
    
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h2 { font-size: 20px; font-weight: 600; margin: 0; color: var(--color-gray-900); }

    .consultas-list { display: flex; flex-direction: column; gap: 16px; }
    .consulta-card { display: flex; flex-direction: row; align-items: center; padding: 16px; border-radius: 12px; transition: box-shadow 0.2s; }
    .consulta-card:hover { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    
    ::ng-deep .consulta-card .mat-mdc-card-content { display: flex; flex-direction: row; align-items: center; width: 100%; padding: 0 !important; }
    
    .time-block { padding-right: 24px; border-right: 2px solid var(--color-gray-100); min-width: 80px; }
    .time { font-size: 18px; font-weight: 700; color: var(--color-primary-600); }
    
    .info-block { flex: 1; padding: 0 24px; }
    .info-block h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: var(--color-gray-900); }
    .info-block .motivo { margin: 0; font-size: 14px; color: var(--color-gray-500); }
    
    .status-block { padding: 0 24px; }
    .action-block { margin-left: auto; }

    .status-agendada { background-color: #dbeafe !important; color: #1e40af !important; font-weight: 600; }
    .status-em-curso { background-color: #ffedd5 !important; color: #c2410c !important; font-weight: 600; }
    .status-concluida { background-color: #dcfce3 !important; color: #166534 !important; font-weight: 600; }

    .prescricoes-list { display: flex; flex-direction: column; gap: 12px; background: white; padding: 16px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .prescricao-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; border: 1px solid var(--color-gray-100); }
    .presc-icon { background: var(--color-gray-50); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--color-primary-500); }
    .presc-info { flex: 1; }
    .presc-info h4 { margin: 0; font-size: 14px; font-weight: 600; color: var(--color-gray-800); }
    .presc-info p { margin: 2px 0 0; font-size: 12px; color: var(--color-gray-500); }

    .quick-links-card { background: white; padding: 16px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .quick-links-card h3 { margin: 0 0 12px 0; font-size: 16px; font-weight: 600; }
    .w-full { width: 100%; justify-content: flex-start; margin-bottom: 8px; }
    .mt-4 { margin-top: 24px; }

    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; color: var(--color-gray-400); background: white; border-radius: 12px; border: 1px dashed var(--color-gray-300); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; }
  `]
})
export class MedicoDashboardComponent implements OnInit {
  private consultaService = inject(ConsultaService);
  private prescricaoService = inject(PrescricaoService);

  today = new Date();
  todayFormatted = new Date().toLocaleDateString('pt-MZ', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  consultasHoje = signal<any[]>([]);
  prescricoesRecentes = signal<any[]>([]);

  // Mock patient names map
  pacientesMap: Record<string, string> = {
    'PAC001': 'João Silva',
    'PAC002': 'Maria Santos',
    'PAC003': 'Carlos Mendes',
    'PAC004': 'Ana Lúcia',
    'PAC005': 'Pedro Costa'
  };

  ngOnInit() {
    // Mocking data for UI
    this.consultasHoje.set([
      { id: '1', pacienteId: 'PAC001', dataHora: new Date().setHours(9, 0), motivo: 'Rotina', especialidade: 'Clínica Geral', status: 'Concluída' },
      { id: '2', pacienteId: 'PAC002', dataHora: new Date().setHours(11, 30), motivo: 'Dor no peito', especialidade: 'Cardiologia', status: 'Em Curso' },
      { id: '3', pacienteId: 'PAC003', dataHora: new Date().setHours(14, 0), motivo: 'Acompanhamento', especialidade: 'Clínica Geral', status: 'Agendada' },
      { id: '4', pacienteId: 'PAC004', dataHora: new Date().setHours(16, 0), motivo: 'Exames', especialidade: 'Clínica Geral', status: 'Agendada' },
    ]);

    this.prescricoesRecentes.set([
      { id: 'p1', pacienteId: 'PAC001', data: new Date() },
      { id: 'p2', pacienteId: 'PAC005', data: new Date(Date.now() - 86400000) },
      { id: 'p3', pacienteId: 'PAC002', data: new Date(Date.now() - 172800000) }
    ]);
  }

  getPacienteName(id: string): string {
    return this.pacientesMap[id] || id;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Agendada': return 'status-agendada';
      case 'Em Curso': return 'status-em-curso';
      case 'Concluída': return 'status-concluida';
      default: return '';
    }
  }
}
