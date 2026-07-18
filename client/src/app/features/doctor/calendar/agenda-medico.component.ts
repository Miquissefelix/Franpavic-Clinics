import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConsultaService } from '../../../core/services/consulta.service';

@Component({
  selector: 'app-agenda-medico',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatButtonModule, MatIconModule],
  template: `
    <div class="agenda-container">
      <header class="agenda-header">
        <div>
          <h1>Agenda Médica</h1>
          <p>Gestão de horários e consultas.</p>
        </div>
        <div class="agenda-controls">
          <button mat-icon-button (click)="previous()"><mat-icon>chevron_left</mat-icon></button>
          <span class="current-period">{{ currentPeriodLabel }}</span>
          <button mat-icon-button (click)="next()"><mat-icon>chevron_right</mat-icon></button>
          <button mat-stroked-button color="primary" class="ml-4">Hoje</button>
        </div>
      </header>

      <mat-tab-group class="premium-tabs" animationDuration="0ms" (selectedIndexChange)="onTabChange($event)">
        <mat-tab label="Dia">
          <div class="day-view">
            <div class="time-column">
              @for (hour of hours; track hour) {
                <div class="time-slot-label">{{ hour }}:00</div>
              }
            </div>
            <div class="appointments-column">
              @for (hour of hours; track hour) {
                <div class="time-slot-row">
                  <!-- Render appointments that match this hour -->
                  @for (apt of getAppointmentsForHour(hour); track apt.id) {
                    <div class="appointment-block" [ngClass]="getStatusClass(apt.status)">
                      <div class="apt-time">{{ apt.hora }}</div>
                      <div class="apt-patient">{{ getPacienteName(apt.pacienteId) }}</div>
                      <div class="apt-reason">{{ apt.motivo }}</div>
                      <span class="status-indicator">{{ apt.status }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </mat-tab>
        
        <mat-tab label="Semana">
          <div class="week-view">
            <div class="week-header">
              <div class="time-spacer"></div>
              @for (day of weekDays; track day.date) {
                <div class="day-header">
                  <span class="day-name">{{ day.name }}</span>
                  <span class="day-number">{{ day.date | date:'dd' }}</span>
                </div>
              }
            </div>
            <div class="week-body">
              <div class="time-column">
                @for (hour of hours; track hour) {
                  <div class="time-slot-label">{{ hour }}:00</div>
                }
              </div>
              <div class="days-columns">
                @for (day of weekDays; track day.date) {
                  <div class="day-column">
                    @for (hour of hours; track hour) {
                      <div class="time-slot-cell">
                        <!-- Mock visual for week -->
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </mat-tab>
        
        <mat-tab label="Mês">
          <div class="month-view">
            <div class="month-grid-header">
              <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
            </div>
            <div class="month-grid">
              @for (day of monthDays; track day) {
                <div class="month-cell" [class.today]="day === 18">
                  <span class="day-num">{{ day }}</span>
                  @if (day === 18 || day === 20) {
                    <div class="apt-badge">3 consultas</div>
                  }
                </div>
              }
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .agenda-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); min-height: 80vh; }
    .agenda-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--color-gray-200); }
    .agenda-header h1 { margin: 0; font-size: 24px; font-weight: 600; color: var(--color-gray-900); }
    .agenda-header p { margin: 4px 0 0; color: var(--color-gray-500); }
    
    .agenda-controls { display: flex; align-items: center; gap: 8px; background: var(--color-gray-50); padding: 4px 16px; border-radius: 24px; border: 1px solid var(--color-gray-200); }
    .current-period { font-size: 16px; font-weight: 600; color: var(--color-gray-800); min-width: 150px; text-align: center; }
    .ml-4 { margin-left: 16px; }

    ::ng-deep .premium-tabs .mdc-tab__text-label { font-size: 15px; font-weight: 500; letter-spacing: 0.5px; }

    /* Day View */
    .day-view { display: flex; margin-top: 24px; border: 1px solid var(--color-gray-200); border-radius: 12px; overflow: hidden; }
    .time-column { width: 80px; background: var(--color-gray-50); border-right: 1px solid var(--color-gray-200); }
    .time-slot-label { height: 80px; display: flex; justify-content: center; padding-top: 8px; font-size: 13px; color: var(--color-gray-500); font-weight: 500; border-bottom: 1px solid var(--color-gray-200); box-sizing: border-box; }
    .appointments-column { flex: 1; display: flex; flex-direction: column; }
    .time-slot-row { height: 80px; border-bottom: 1px solid var(--color-gray-100); position: relative; padding: 4px; box-sizing: border-box; }
    
    .appointment-block { position: absolute; left: 8px; right: 8px; top: 4px; bottom: 4px; border-radius: 8px; padding: 8px 12px; display: flex; flex-direction: column; border-left: 4px solid transparent; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.1s; }
    .appointment-block:hover { transform: scale(1.01); z-index: 10; }
    .apt-time { font-size: 12px; font-weight: 600; margin-bottom: 2px; }
    .apt-patient { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
    .apt-reason { font-size: 12px; opacity: 0.8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .status-indicator { position: absolute; top: 8px; right: 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 10px; background: rgba(255,255,255,0.5); }

    .apt-agendada { background: #eff6ff; border-left-color: #3b82f6; color: #1e3a8a; }
    .apt-em-curso { background: #fff7ed; border-left-color: #f97316; color: #7c2d12; }
    .apt-concluida { background: #f0fdf4; border-left-color: #22c55e; color: #14532d; }
    .apt-cancelada { background: #f3f4f6; border-left-color: #9ca3af; color: #374151; }

    /* Week View */
    .week-view { display: flex; flex-direction: column; margin-top: 24px; border: 1px solid var(--color-gray-200); border-radius: 12px; overflow: hidden; }
    .week-header { display: flex; border-bottom: 1px solid var(--color-gray-200); background: var(--color-gray-50); }
    .time-spacer { width: 80px; border-right: 1px solid var(--color-gray-200); }
    .day-header { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px; border-right: 1px solid var(--color-gray-200); }
    .day-header:last-child { border-right: none; }
    .day-name { font-size: 12px; text-transform: uppercase; color: var(--color-gray-500); font-weight: 600; }
    .day-number { font-size: 24px; font-weight: 300; color: var(--color-gray-900); }
    .week-body { display: flex; }
    .days-columns { display: flex; flex: 1; }
    .day-column { flex: 1; border-right: 1px solid var(--color-gray-200); }
    .day-column:last-child { border-right: none; }
    .time-slot-cell { height: 80px; border-bottom: 1px solid var(--color-gray-100); box-sizing: border-box; }

    /* Month View */
    .month-view { margin-top: 24px; border: 1px solid var(--color-gray-200); border-radius: 12px; overflow: hidden; }
    .month-grid-header { display: grid; grid-template-columns: repeat(7, 1fr); background: var(--color-gray-50); border-bottom: 1px solid var(--color-gray-200); text-align: center; font-weight: 600; font-size: 13px; color: var(--color-gray-500); padding: 12px 0; text-transform: uppercase; }
    .month-grid { display: grid; grid-template-columns: repeat(7, 1fr); grid-auto-rows: 120px; }
    .month-cell { border-right: 1px solid var(--color-gray-100); border-bottom: 1px solid var(--color-gray-100); padding: 8px; display: flex; flex-direction: column; }
    .month-cell:nth-child(7n) { border-right: none; }
    .day-num { font-size: 14px; font-weight: 500; color: var(--color-gray-700); align-self: flex-end; margin-bottom: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
    .month-cell.today { background: #f8fafc; }
    .month-cell.today .day-num { background: var(--color-primary-600); color: white; }
    .apt-badge { background: var(--color-primary-100); color: var(--color-primary-700); font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 4px; margin-bottom: 4px; }
  `]
})
export class AgendaMedicoComponent implements OnInit {
  private consultaService = inject(ConsultaService);

  currentPeriodLabel = '18 de Julho de 2026';
  hours = Array.from({length: 12}, (_, i) => i + 7); // 7 to 18
  
  weekDays = [
    { name: 'Seg', date: new Date(2026, 6, 13) },
    { name: 'Ter', date: new Date(2026, 6, 14) },
    { name: 'Qua', date: new Date(2026, 6, 15) },
    { name: 'Qui', date: new Date(2026, 6, 16) },
    { name: 'Sex', date: new Date(2026, 6, 17) }
  ];

  monthDays = Array.from({length: 31}, (_, i) => i + 1);

  mockAppointments = [
    { id: '1', hora: '09:00', horaNum: 9, pacienteId: 'PAC001', motivo: 'Consulta de Rotina', status: 'Concluída' },
    { id: '2', hora: '11:00', horaNum: 11, pacienteId: 'PAC002', motivo: 'Acompanhamento', status: 'Em Curso' },
    { id: '3', hora: '14:00', horaNum: 14, pacienteId: 'PAC003', motivo: 'Retorno Exames', status: 'Agendada' }
  ];

  pacientesMap: Record<string, string> = {
    'PAC001': 'João Silva',
    'PAC002': 'Maria Santos',
    'PAC003': 'Carlos Mendes'
  };

  ngOnInit() {}

  getAppointmentsForHour(hour: number) {
    return this.mockAppointments.filter(a => a.horaNum === hour);
  }

  getPacienteName(id: string) {
    return this.pacientesMap[id] || id;
  }

  getStatusClass(status: string) {
    const map: Record<string, string> = {
      'Agendada': 'apt-agendada',
      'Em Curso': 'apt-em-curso',
      'Concluída': 'apt-concluida',
      'Cancelada': 'apt-cancelada'
    };
    return map[status] || '';
  }

  previous() {}
  next() {}
  onTabChange(index: number) {}
}
