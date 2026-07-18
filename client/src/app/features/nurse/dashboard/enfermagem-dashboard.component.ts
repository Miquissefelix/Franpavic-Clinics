import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { TriagemService } from '../../../core/services/triagem.service';

@Component({
  selector: 'app-enfermagem-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="greeting">
          <h1>Bom dia, <span>Beatriz Cumbe!</span></h1>
          <p>Visão geral das triagens de hoje - {{ today | date:'dd/MM/yyyy' }}</p>
        </div>
        <div class="quick-actions">
          <button mat-flat-button color="primary" routerLink="/enfermagem/triagem/nova">
            <mat-icon>add</mat-icon> Nova Triagem
          </button>
          <button mat-stroked-button color="primary" routerLink="/enfermagem/triagem">
            <mat-icon>list</mat-icon> Ver Fila
          </button>
        </div>
      </header>

      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon bg-primary-100 text-primary-700"><mat-icon>people</mat-icon></div>
          <div class="stat-info">
            <span class="stat-value">5</span>
            <span class="stat-label">Pacientes Hoje</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-warning-100 text-warning-700"><mat-icon>pending_actions</mat-icon></div>
          <div class="stat-info">
            <span class="stat-value">2</span>
            <span class="stat-label">Em Triagem</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-success-100 text-success-700"><mat-icon>check_circle</mat-icon></div>
          <div class="stat-info">
            <span class="stat-value">8</span>
            <span class="stat-label">Concluídas</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-danger-100 text-danger-700"><mat-icon>warning</mat-icon></div>
          <div class="stat-info">
            <span class="stat-value">1</span>
            <span class="stat-label">Urgentes</span>
          </div>
        </div>
      </section>

      <section class="triagens-recentes">
        <h2>Triagens Recentes</h2>
        <div class="cards-grid">
          @for (triagem of triagens(); track triagem.id) {
            <div class="triagem-card">
              <div class="card-header">
                <span class="paciente-id">{{ triagem.pacienteId }}</span>
                <span class="hora">{{ triagem.hora }}</span>
              </div>
              <div class="card-body">
                <p class="queixa"><strong>Queixa:</strong> {{ triagem.queixaPrincipal }}</p>
                <div class="vitals">
                  <span><mat-icon>favorite</mat-icon> {{ triagem.frequenciaCardiaca }} bpm</span>
                  <span><mat-icon>monitor_heart</mat-icon> {{ triagem.pressaoArterial }}</span>
                  <span><mat-icon>air</mat-icon> {{ triagem.saturacaoOxigenio }}%</span>
                </div>
              </div>
              <div class="card-footer">
                <mat-chip-set>
                  <mat-chip [ngClass]="getEscalaClass(triagem.escalaTriagem)">{{ triagem.escalaTriagem }}</mat-chip>
                </mat-chip-set>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <mat-icon>assignment</mat-icon>
              <p>Nenhuma triagem registada hoje.</p>
            </div>
          }
        </div>
      </section>

      <section class="escala-legend">
        <h3>Escala de Manchester</h3>
        <div class="legend-items">
          <div class="legend-item"><span class="badge bg-danger"></span> Vermelho (Emergência)</div>
          <div class="legend-item"><span class="badge bg-warning"></span> Laranja (Urgente)</div>
          <div class="legend-item"><span class="badge bg-yellow"></span> Amarelo (Prioritário)</div>
          <div class="legend-item"><span class="badge bg-success"></span> Verde (Pouco Urgente)</div>
          <div class="legend-item"><span class="badge bg-primary"></span> Azul (Não Urgente)</div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .greeting h1 { margin: 0; font-size: 28px; font-weight: 600; color: var(--color-gray-900, #111827); }
    .greeting h1 span { color: var(--color-primary-600, #2563eb); }
    .greeting p { margin: 8px 0 0; color: var(--color-gray-500, #6b7280); }
    .quick-actions { display: flex; gap: 16px; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
    .stat-card { background: white; border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: transform 0.2s; }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 32px; font-weight: 700; color: var(--color-gray-900, #111827); line-height: 1; }
    .stat-label { font-size: 14px; color: var(--color-gray-500, #6b7280); margin-top: 4px; font-weight: 500; }
    
    .bg-primary-100 { background: #dbeafe; } .text-primary-700 { color: #1d4ed8; }
    .bg-warning-100 { background: #ffedd5; } .text-warning-700 { color: #c2410c; }
    .bg-success-100 { background: #dcfce3; } .text-success-700 { color: #15803d; }
    .bg-danger-100 { background: #fee2e2; } .text-danger-700 { color: #b91c1c; }

    .triagens-recentes h2 { font-size: 20px; font-weight: 600; margin-bottom: 16px; color: var(--color-gray-900, #111827); }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .triagem-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid var(--color-gray-200, #e5e7eb); }
    .card-header { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid var(--color-gray-100, #f3f4f6); padding-bottom: 8px; }
    .paciente-id { font-weight: 600; color: var(--color-gray-800, #1f2937); }
    .hora { color: var(--color-gray-500, #6b7280); font-size: 14px; }
    .card-body .queixa { margin: 0 0 16px 0; font-size: 14px; color: var(--color-gray-700, #374151); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .vitals { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; color: var(--color-gray-600, #4b5563); }
    .vitals span { display: flex; align-items: center; gap: 4px; background: var(--color-gray-50, #f9fafb); padding: 4px 8px; border-radius: 6px; }
    .vitals mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .card-footer { margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--color-gray-100, #f3f4f6); }
    
    .escala-legend { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .escala-legend h3 { margin: 0 0 16px 0; font-size: 16px; font-weight: 600; }
    .legend-items { display: flex; flex-wrap: wrap; gap: 24px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--color-gray-600, #4b5563); }
    .badge { width: 16px; height: 16px; border-radius: 4px; }
    .bg-danger { background: #ef4444; }
    .bg-warning { background: #f97316; }
    .bg-yellow { background: #eab308; }
    .bg-success { background: #22c55e; }
    .bg-primary { background: #3b82f6; }
    
    .escala-vermelho { background-color: #fef2f2 !important; color: #991b1b !important; border: 1px solid #f87171 !important; }
    .escala-laranja { background-color: #fff7ed !important; color: #9a3412 !important; border: 1px solid #fb923c !important; }
    .escala-amarelo { background-color: #fefce8 !important; color: #854d0e !important; border: 1px solid #facc15 !important; }
    .escala-verde { background-color: #f0fdf4 !important; color: #166534 !important; border: 1px solid #4ade80 !important; }
    .escala-azul { background-color: #eff6ff !important; color: #1e40af !important; border: 1px solid #60a5fa !important; }

    .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; color: var(--color-gray-400, #9ca3af); background: white; border-radius: 12px; border: 1px dashed var(--color-gray-300, #d1d5db); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; }
  `]
})
export class EnfermagemDashboardComponent implements OnInit {
  private triagemService = inject(TriagemService);
  
  today = new Date();
  triagens = signal<any[]>([]);

  ngOnInit() {
    this.triagemService.listar().subscribe(data => {
      // Mock formatting for display if needed
      this.triagens.set(data.slice(0, 6).map(t => ({
        ...t,
        hora: new Date(t.data || t.criadoEm).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      })));
    });
  }

  getEscalaClass(escala: string): string {
    const map: Record<string, string> = {
      'Vermelho': 'escala-vermelho',
      'Laranja': 'escala-laranja',
      'Amarelo': 'escala-amarelo',
      'Verde': 'escala-verde',
      'Azul': 'escala-azul'
    };
    return map[escala] || '';
  }
}
