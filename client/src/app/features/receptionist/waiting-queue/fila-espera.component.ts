import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { ConsultaService } from '../../../core/services/consulta.service';

@Component({
  selector: 'app-fila-espera',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatBadgeModule
  ],
  template: `
    <div class="page-container">
      <div class="header-section">
        <div class="title-area">
          <h2>Fila de Espera</h2>
          <p>Pacientes aguardando atendimento hoje</p>
        </div>
        <div class="live-indicator">
          <span class="pulse"></span>
          Em tempo real
        </div>
      </div>

      <div class="summary-cards">
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon color="primary">people_outline</mat-icon>
            <div class="stat-info">
              <span class="value">{{ totalAguardando() }}</span>
              <span class="label">Aguardando</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="text-warning">schedule</mat-icon>
            <div class="stat-info">
              <span class="value">15m</span>
              <span class="label">Tempo Médio Espera</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="text-success">check_circle_outline</mat-icon>
            <div class="stat-info">
              <span class="value">{{ pacientes().length }}</span>
              <span class="label">Total Hoje</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="queue-container">
        @if (pacientes().length === 0) {
          <div class="empty-state">
            <mat-icon>emoji_events</mat-icon>
            <h3>Fila Vazia</h3>
            <p>Não há pacientes aguardando no momento.</p>
          </div>
        } @else {
          <div class="queue-list">
            @for (paciente of pacientes(); track paciente.id; let i = $index) {
              <mat-card class="queue-item" [class.is-first]="i === 0">
                <div class="queue-position">
                  <span>{{ i + 1 }}º</span>
                </div>
                
                <div class="item-content">
                  <div class="patient-info">
                    <div class="patient-header">
                      <h3>Paciente ID: {{ paciente.pacienteId }}</h3>
                      <span class="badge" [class]="getTriagemClass(paciente.escalaTriagem)">
                        {{ paciente.escalaTriagem || 'Não avaliado' }}
                      </span>
                    </div>
                    
                    <div class="details">
                      <span class="detail-item">
                        <mat-icon>schedule</mat-icon>
                        Agendado para: {{ paciente.hora }}
                      </span>
                      <span class="detail-item">
                        <mat-icon>medical_services</mat-icon>
                        {{ paciente.especialidade }}
                      </span>
                      <span class="detail-item">
                        <mat-icon>person</mat-icon>
                        Dr(a). {{ paciente.medico }}
                      </span>
                    </div>
                  </div>

                  <div class="item-actions">
                    <button mat-stroked-button color="warn" (click)="cancelar(paciente.id)">
                      Cancelar
                    </button>
                    <button mat-raised-button color="primary" (click)="chamarParaConsultorio(paciente.id)">
                      <mat-icon>login</mat-icon>
                      Chamar
                    </button>
                  </div>
                </div>
              </mat-card>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      
      .title-area {
        h2 { margin: 0; font-size: 28px; color: var(--color-gray-900); }
        p { margin: 4px 0 0 0; color: var(--color-gray-500); }
      }
      
      .live-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f0fdf4;
        color: #166534;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 500;
        font-size: 14px;
        
        .pulse {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulse 2s infinite;
        }
      }
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
      100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
      
      .stat-card mat-card-content {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px;
        
        mat-icon {
          font-size: 48px;
          height: 48px;
          width: 48px;
          
          &.text-warning { color: #f59e0b; }
          &.text-success { color: #10b981; }
        }
        
        .stat-info {
          display: flex;
          flex-direction: column;
          
          .value { font-size: 28px; font-weight: 700; color: var(--color-gray-900); }
          .label { font-size: 14px; color: var(--color-gray-500); }
        }
      }
    }

    .queue-container {
      background: var(--color-gray-50);
      border-radius: 16px;
      padding: 24px;
      min-height: 400px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      color: var(--color-gray-500);
      
      mat-icon {
        font-size: 64px;
        height: 64px;
        width: 64px;
        margin-bottom: 16px;
        color: #fbbf24;
      }
      
      h3 { font-size: 20px; margin: 0 0 8px 0; color: var(--color-gray-800); }
      p { margin: 0; }
    }

    .queue-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .queue-item {
      border-radius: 12px;
      transition: transform 0.2s, box-shadow 0.2s;
      
      &:hover {
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      &.is-first {
        border-left: 4px solid var(--color-primary-500);
        background: #f8fafc;
      }
      
      :host ::ng-deep .mat-mdc-card-content {
        display: flex;
        padding: 0 !important;
      }

      display: flex;
      flex-direction: row !important;
      overflow: hidden;
    }

    .queue-position {
      background: var(--color-primary-50);
      color: var(--color-primary-700);
      width: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      border-right: 1px solid var(--color-gray-200);
    }

    .item-content {
      flex: 1;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      
      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .patient-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;
      
      h3 { margin: 0; font-size: 18px; color: var(--color-gray-900); }
    }

    .badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      
      &.triagem-vermelho { background: #fee2e2; color: #b91c1c; }
      &.triagem-laranja { background: #ffedd5; color: #c2410c; }
      &.triagem-amarelo { background: #fef9c3; color: #a16207; }
      &.triagem-verde { background: #dcfce7; color: #15803d; }
      &.triagem-azul { background: #e0f2fe; color: #0369a1; }
      &.triagem-default { background: #f3f4f6; color: #4b5563; }
    }

    .details {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      
      .detail-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--color-gray-600);
        font-size: 14px;
        
        mat-icon {
          font-size: 18px;
          height: 18px;
          width: 18px;
          color: var(--color-gray-400);
        }
      }
    }

    .item-actions {
      display: flex;
      gap: 12px;
    }
  `]
})
export class FilaEsperaComponent implements OnInit {
  private consultaService = inject(ConsultaService);

  pacientes = signal<any[]>([]);
  totalAguardando = signal(0);
  intervalId: any;

  ngOnInit() {
    this.carregarFila();
    // Simulacao de atualização em tempo real
    this.intervalId = setInterval(() => {
      this.carregarFila();
    }, 30000); // 30s
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  carregarFila() {
    this.consultaService.consultasHoje().subscribe(consultas => {
      // Filtrar apenas aguardando/agendada
      const fila = consultas.filter(c => 
        c.status.toLowerCase() === 'agendada' || 
        c.status.toLowerCase() === 'aguardando'
      ).sort((a, b) => {
        return new Date(a.hora).getTime() - new Date(b.hora).getTime();
      });
      
      this.pacientes.set(fila);
      this.totalAguardando.set(fila.length);
    });
  }

  getTriagemClass(escala: string): string {
    if (!escala) return 'triagem-default';
    const e = escala.toLowerCase();
    if (e.includes('vermelho')) return 'triagem-vermelho';
    if (e.includes('laranja')) return 'triagem-laranja';
    if (e.includes('amarelo')) return 'triagem-amarelo';
    if (e.includes('verde')) return 'triagem-verde';
    if (e.includes('azul')) return 'triagem-azul';
    return 'triagem-default';
  }

  chamarParaConsultorio(id: string) {
    this.consultaService.atualizarStatus(id, 'em-curso').subscribe(() => {
      this.carregarFila(); // Refresh
    });
  }

  cancelar(id: string) {
    if (confirm('Tem a certeza que deseja cancelar esta consulta?')) {
      this.consultaService.atualizarStatus(id, 'cancelada').subscribe(() => {
        this.carregarFila();
      });
    }
  }
}
