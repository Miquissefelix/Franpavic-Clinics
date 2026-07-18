import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConsultaService } from '../../../core/services/consulta.service';

@Component({
  selector: 'app-lista-consulta-medico',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatChipsModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1>Consultas de Hoje</h1>
          <p>Lista detalhada de pacientes aguardando atendimento.</p>
        </div>
        <div class="actions">
          <button mat-stroked-button><mat-icon>filter_list</mat-icon> Filtrar</button>
        </div>
      </header>

      <div class="cards-grid">
        @for (consulta of consultas(); track consulta.id) {
          <mat-card class="consulta-card premium-card" appearance="outlined">
            <div class="card-status-bar" [ngClass]="getStatusBarClass(consulta.status)"></div>
            <div class="card-header">
              <div class="patient-info">
                <div class="avatar">{{ getInitials(getPacienteName(consulta.pacienteId)) }}</div>
                <div>
                  <h3 class="patient-name">{{ getPacienteName(consulta.pacienteId) }}</h3>
                  <span class="patient-id">{{ consulta.pacienteId }}</span>
                </div>
              </div>
              <div class="time-badge">
                <mat-icon>schedule</mat-icon> {{ consulta.hora }}
              </div>
            </div>
            
            <mat-card-content class="card-body">
              <div class="info-row">
                <span class="label">Motivo:</span>
                <span class="value">{{ consulta.motivo }}</span>
              </div>
              <div class="info-row">
                <span class="label">Especialidade:</span>
                <span class="value">{{ consulta.especialidade }}</span>
              </div>
              
              <div class="tags-row mt-4">
                <mat-chip-set>
                  <mat-chip [ngClass]="getStatusClass(consulta.status)">{{ consulta.status }}</mat-chip>
                  <mat-chip [ngClass]="getEscalaClass(consulta.triagemEscala)">Triagem: {{ consulta.triagemEscala }}</mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>

            <mat-card-actions class="card-actions">
              @if (consulta.status === 'Agendada' || consulta.status === 'Em Curso') {
                <button mat-flat-button color="primary" class="full-width-btn" [routerLink]="['/medico/consultas', consulta.id]">
                  <mat-icon>play_circle</mat-icon> Iniciar Consulta
                </button>
              } @else {
                <button mat-stroked-button class="full-width-btn" [routerLink]="['/medico/consultas', consulta.id]">
                  <mat-icon>visibility</mat-icon> Ver Detalhes
                </button>
              }
            </mat-card-actions>
          </mat-card>
        } @empty {
          <div class="empty-state">
            <mat-icon>sentiment_satisfied_alt</mat-icon>
            <h2>Excelente trabalho!</h2>
            <p>Não há mais consultas para o dia de hoje.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
    .page-header h1 { margin: 0; font-size: 32px; font-weight: 700; color: var(--color-gray-900); letter-spacing: -0.02em; }
    .page-header p { margin: 8px 0 0; color: var(--color-gray-500); font-size: 16px; }

    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
    
    .premium-card { position: relative; border-radius: 16px; overflow: hidden; border: 1px solid var(--color-gray-200); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s; }
    .premium-card:hover { transform: translateY(-4px); box-shadow: 0 12px 20px -5px rgba(0,0,0,0.1); }
    
    .card-status-bar { position: absolute; top: 0; left: 0; right: 0; height: 6px; }
    .bar-agendada { background: var(--color-primary-500, #3b82f6); }
    .bar-em-curso { background: #f97316; }
    .bar-concluida { background: #22c55e; }

    .card-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px 24px 16px; }
    .patient-info { display: flex; gap: 16px; align-items: center; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--color-gray-100); color: var(--color-gray-700); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 600; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .patient-name { margin: 0; font-size: 18px; font-weight: 700; color: var(--color-gray-900); }
    .patient-id { font-size: 13px; color: var(--color-gray-500); font-family: monospace; }
    
    .time-badge { display: flex; align-items: center; gap: 4px; background: var(--color-gray-50); padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 14px; color: var(--color-gray-700); border: 1px solid var(--color-gray-200); }
    .time-badge mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .card-body { padding: 0 24px 16px; }
    .info-row { display: flex; margin-bottom: 8px; font-size: 14px; }
    .label { width: 100px; color: var(--color-gray-500); font-weight: 500; }
    .value { flex: 1; color: var(--color-gray-800); font-weight: 500; }
    .mt-4 { margin-top: 16px; }

    .card-actions { padding: 16px 24px 24px; border-top: 1px solid var(--color-gray-100); margin: 0; }
    .full-width-btn { width: 100%; height: 44px; border-radius: 8px; font-size: 15px; font-weight: 600; }

    .chip-agendada { background-color: #dbeafe !important; color: #1e40af !important; font-weight: 600; }
    .chip-em-curso { background-color: #ffedd5 !important; color: #9a3412 !important; font-weight: 600; }
    .chip-concluida { background-color: #dcfce3 !important; color: #166534 !important; font-weight: 600; }

    .escala-amarelo { background-color: #fefce8 !important; color: #854d0e !important; border: 1px solid #facc15 !important; font-weight: 600; }
    .escala-verde { background-color: #f0fdf4 !important; color: #166534 !important; border: 1px solid #4ade80 !important; font-weight: 600; }

    .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 24px; text-align: center; background: white; border-radius: 16px; border: 1px dashed var(--color-gray-300); }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: var(--color-success-500, #22c55e); margin-bottom: 24px; }
    .empty-state h2 { margin: 0 0 8px; font-size: 24px; font-weight: 700; color: var(--color-gray-900); }
    .empty-state p { margin: 0; color: var(--color-gray-500); font-size: 16px; }
  `]
})
export class ListaConsultaMedicoComponent implements OnInit {
  private consultaService = inject(ConsultaService);

  consultas = signal<any[]>([]);

  pacientesMap: Record<string, string> = {
    'PAC001': 'João Silva',
    'PAC002': 'Maria Santos',
    'PAC003': 'Carlos Mendes'
  };

  ngOnInit() {
    this.consultas.set([
      { id: '1', pacienteId: 'PAC001', hora: '09:00', motivo: 'Consulta de Rotina', especialidade: 'Clínica Geral', status: 'Concluída', triagemEscala: 'Verde' },
      { id: '2', pacienteId: 'PAC002', hora: '11:00', motivo: 'Acompanhamento', especialidade: 'Clínica Geral', status: 'Em Curso', triagemEscala: 'Amarelo' },
      { id: '3', pacienteId: 'PAC003', hora: '14:00', motivo: 'Retorno Exames', especialidade: 'Clínica Geral', status: 'Agendada', triagemEscala: 'Verde' }
    ]);
  }

  getPacienteName(id: string): string {
    return this.pacientesMap[id] || id;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getStatusBarClass(status: string): string {
    switch (status) {
      case 'Agendada': return 'bar-agendada';
      case 'Em Curso': return 'bar-em-curso';
      case 'Concluída': return 'bar-concluida';
      default: return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Agendada': return 'chip-agendada';
      case 'Em Curso': return 'chip-em-curso';
      case 'Concluída': return 'chip-concluida';
      default: return '';
    }
  }

  getEscalaClass(escala: string): string {
    switch (escala) {
      case 'Amarelo': return 'escala-amarelo';
      case 'Verde': return 'escala-verde';
      default: return '';
    }
  }
}
