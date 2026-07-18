import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { PacienteService } from '../../../core/services/paciente.service';
import { ConsultaService } from '../../../core/services/consulta.service';

@Component({
  selector: 'app-detalhe-paciente',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatListModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-actions">
          <button mat-icon-button routerLink="/recepcao/pacientes" color="primary">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h2>Detalhes do Paciente</h2>
        </div>
        <div class="header-buttons">
          <button mat-stroked-button color="primary" [routerLink]="['/recepcao/pacientes', pacienteId, 'editar']">
            <mat-icon>edit</mat-icon>
            Editar
          </button>
          <button mat-raised-button color="primary" routerLink="/recepcao/consultas/nova" [queryParams]="{paciente: pacienteId}">
            <mat-icon>event</mat-icon>
            Agendar Consulta
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>A carregar detalhes...</p>
        </div>
      } @else if (paciente()) {
        <div class="dashboard-grid">
          <div class="main-column">
            <mat-card class="info-card">
              <mat-card-header>
                <div mat-card-avatar class="patient-avatar">
                  <mat-icon>person</mat-icon>
                </div>
                <mat-card-title>{{ paciente()?.nome }}</mat-card-title>
                <mat-card-subtitle>Nº {{ paciente()?.numeroPaciente }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Idade</span>
                    <span class="value">{{ calcularIdade(paciente()?.dataNascimento) }} anos</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Nascimento</span>
                    <span class="value">{{ paciente()?.dataNascimento | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Género</span>
                    <span class="value">{{ paciente()?.genero }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">BI</span>
                    <span class="value">{{ paciente()?.bi || 'Não informado' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">NUIT</span>
                    <span class="value">{{ paciente()?.nuit || 'Não informado' }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="info-card mt-4">
              <mat-card-header>
                <mat-card-title>Histórico de Consultas</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                @if (consultas().length > 0) {
                  <mat-list>
                    @for (consulta of consultas(); track consulta.id) {
                      <mat-list-item>
                        <mat-icon matListItemIcon color="primary">event_available</mat-icon>
                        <div matListItemTitle>{{ consulta.especialidade }} - Dr(a). {{ consulta.medico }}</div>
                        <div matListItemLine>{{ consulta.hora | date:'dd/MM/yyyy HH:mm' }}</div>
                        <mat-chip-set matListItemMeta>
                          <mat-chip [color]="getConsultaStatusColor(consulta.status)">{{ consulta.status }}</mat-chip>
                        </mat-chip-set>
                      </mat-list-item>
                      <mat-divider></mat-divider>
                    }
                  </mat-list>
                } @else {
                  <div class="empty-state">
                    <mat-icon>event_busy</mat-icon>
                    <p>Nenhuma consulta registada para este paciente.</p>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </div>

          <div class="side-column">
            <mat-card class="info-card">
              <mat-card-header>
                <mat-card-title>Contactos</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="contact-list">
                  <div class="contact-item">
                    <mat-icon>phone</mat-icon>
                    <div>
                      <span class="label">Telefone</span>
                      <span class="value">{{ paciente()?.telefone }}</span>
                    </div>
                  </div>
                  <div class="contact-item">
                    <mat-icon>email</mat-icon>
                    <div>
                      <span class="label">Email</span>
                      <span class="value">{{ paciente()?.email || 'N/A' }}</span>
                    </div>
                  </div>
                  <div class="contact-item">
                    <mat-icon>location_on</mat-icon>
                    <div>
                      <span class="label">Endereço</span>
                      <span class="value">{{ paciente()?.endereco }}, {{ paciente()?.bairro }}, {{ paciente()?.cidade }}</span>
                    </div>
                  </div>
                </div>

                <mat-divider class="my-3"></mat-divider>
                
                <h4 class="section-title">Emergência</h4>
                @if (paciente()?.contatoEmergencia?.nome) {
                  <div class="contact-list">
                    <div class="contact-item">
                      <mat-icon>warning</mat-icon>
                      <div>
                        <span class="label">{{ paciente()?.contatoEmergencia?.nome }} ({{ paciente()?.contatoEmergencia?.parentesco }})</span>
                        <span class="value">{{ paciente()?.contatoEmergencia?.telefone }}</span>
                      </div>
                    </div>
                  </div>
                } @else {
                  <p class="text-muted">Não informado</p>
                }
              </mat-card-content>
            </mat-card>

            <mat-card class="info-card mt-4">
              <mat-card-header>
                <mat-card-title>Informação Médica</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="medical-badges">
                  <div class="badge-item">
                    <span class="label">Tipo Sanguíneo</span>
                    @if (paciente()?.tipoSanguineo) {
                      <mat-chip class="chip-danger">{{ paciente()?.tipoSanguineo }}</mat-chip>
                    } @else {
                      <span>N/A</span>
                    }
                  </div>
                  
                  <div class="badge-item">
                    <span class="label">Alergias</span>
                    <mat-chip-set>
                      @for (alergia of getAlergias(); track alergia) {
                        <mat-chip class="chip-warning">{{ alergia.trim() }}</mat-chip>
                      }
                      @if (getAlergias().length === 0) {
                        <span>Nenhuma</span>
                      }
                    </mat-chip-set>
                  </div>
                </div>

                @if (paciente()?.seguro?.empresa) {
                  <mat-divider class="my-3"></mat-divider>
                  <h4 class="section-title">Seguro de Saúde</h4>
                  <div class="contact-list">
                    <div class="contact-item">
                      <mat-icon>security</mat-icon>
                      <div>
                        <span class="label">{{ paciente()?.seguro?.empresa }}</span>
                        <span class="value">Apólice: {{ paciente()?.seguro?.numero }}</span>
                      </div>
                    </div>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      } @else {
        <div class="empty-state">
          <mat-icon>person_off</mat-icon>
          <h3>Paciente não encontrado</h3>
          <p>O paciente que procura não existe ou foi removido.</p>
          <button mat-button routerLink="/recepcao/pacientes" color="primary">Voltar à lista</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
      
      .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
        
        h2 { margin: 0; font-size: 24px; }
      }
      
      .header-buttons {
        display: flex;
        gap: 12px;
      }
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      color: var(--color-gray-500);
      text-align: center;
      
      mat-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        margin-bottom: 16px;
      }
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      
      @media (max-width: 960px) {
        grid-template-columns: 1fr;
      }
    }
    
    .info-card {
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .mt-4 { margin-top: 16px; }
    .my-3 { margin-top: 12px; margin-bottom: 12px; }

    .patient-avatar {
      background: var(--color-primary-100, #dbeafe);
      color: var(--color-primary-700, #1d4ed8);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
      padding-top: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      
      .label {
        font-size: 12px;
        color: var(--color-gray-500);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .value {
        font-weight: 500;
        color: var(--color-gray-900);
      }
    }

    .contact-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 8px;
    }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      
      mat-icon {
        color: var(--color-gray-400);
      }
      
      div {
        display: flex;
        flex-direction: column;
        
        .label {
          font-weight: 500;
          color: var(--color-gray-800);
        }
        .value {
          font-size: 14px;
          color: var(--color-gray-600);
        }
      }
    }
    
    .section-title {
      font-size: 14px;
      text-transform: uppercase;
      color: var(--color-gray-500);
      margin: 16px 0 8px 0;
    }
    
    .medical-badges {
      display: flex;
      flex-direction: column;
      gap: 16px;
      
      .badge-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        .label {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-gray-600);
        }
      }
    }
    
    .chip-danger {
      background-color: #fee2e2 !important;
      color: #b91c1c !important;
    }
    
    .chip-warning {
      background-color: #fef3c7 !important;
      color: #d97706 !important;
    }
  `]
})
export class DetalhePacienteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pacienteService = inject(PacienteService);
  private consultaService = inject(ConsultaService);

  pacienteId: string = '';
  paciente = signal<any>(null);
  consultas = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.pacienteId = this.route.snapshot.paramMap.get('id') || '';
    if (this.pacienteId) {
      this.loadData();
    }
  }

  loadData() {
    this.isLoading.set(true);
    
    this.pacienteService.buscarPorId(this.pacienteId).subscribe({
      next: (data) => {
        this.paciente.set(data);
        
        // Load appointments
        this.consultaService.listar({ pacienteId: this.pacienteId }).subscribe({
          next: (consultas) => {
            this.consultas.set(consultas);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  calcularIdade(dataNascimento: string | undefined): number {
    if (!dataNascimento) return 0;
    const today = new Date();
    const birthDate = new Date(dataNascimento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  getAlergias(): string[] {
    const alergias = this.paciente()?.alergias;
    if (!alergias) return [];
    return alergias.split(',').filter((a: string) => a.trim() !== '');
  }

  getConsultaStatusColor(status: string): string {
    switch(status.toLowerCase()) {
      case 'concluída': return 'primary';
      case 'agendada': return 'accent';
      case 'cancelada': return 'warn';
      default: return '';
    }
  }
}
