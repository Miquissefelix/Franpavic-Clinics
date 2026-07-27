import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { ConsultaService } from '../../../core/services/consulta.service';

@Component({
  selector: 'app-lista-consultas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Consultas</h2>
          <p class="subtitle">Gestão de agendamentos e atendimento</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/recepcao/consultas/nova">
          <mat-icon>add</mat-icon>
          Nova Consulta
        </button>
      </div>

      <div class="filters-section">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Pesquisar por motivo</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterData()" placeholder="Ex: Dor de cabeça">
        </mat-form-field>

        <mat-chip-listbox [(ngModel)]="selectedFilter" (ngModelChange)="filterData()">
          <mat-chip-option value="Todas" selected>Todas</mat-chip-option>
          <mat-chip-option value="Agendadas">Agendadas</mat-chip-option>
          <mat-chip-option value="Em Curso">Em Curso</mat-chip-option>
          <mat-chip-option value="Concluídas">Concluídas</mat-chip-option>
          <mat-chip-option value="Canceladas">Canceladas</mat-chip-option>
        </mat-chip-listbox>
      </div>

      <div class="table-container mat-elevation-z2">
        @if (isLoading()) {
          <div class="loading-state">
            <mat-spinner diameter="40"></mat-spinner>
            <p>A carregar consultas...</p>
          </div>
        } @else if (filteredConsultas().length === 0) {
          <div class="empty-state">
            <mat-icon>event_busy</mat-icon>
            <h3>Sem Consultas</h3>
            <p>Não foram encontradas consultas com os filtros atuais.</p>
          </div>
        } @else {
          <table mat-table [dataSource]="filteredConsultas()">
            
            <ng-container matColumnDef="hora">
              <th mat-header-cell *matHeaderCellDef> Data/Hora </th>
              <td mat-cell *matCellDef="let consulta"> 
                <div class="datetime-cell">
                  <span class="date">{{ consulta.data | date:'dd/MM/yyyy' }}</span>
                  <span class="time">{{ consulta.hora }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="paciente">
              <th mat-header-cell *matHeaderCellDef> Paciente </th>
              <td mat-cell *matCellDef="let consulta"> 
                <div class="user-cell">
                  <mat-icon>person</mat-icon>
                  <span>{{ consulta.pacienteId }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="medico">
              <th mat-header-cell *matHeaderCellDef> Médico </th>
              <td mat-cell *matCellDef="let consulta"> Dr(a). {{ consulta.medico }} </td>
            </ng-container>

            <ng-container matColumnDef="especialidade">
              <th mat-header-cell *matHeaderCellDef> Especialidade </th>
              <td mat-cell *matCellDef="let consulta"> {{ consulta.especialidade }} </td>
            </ng-container>

            <ng-container matColumnDef="tipo">
              <th mat-header-cell *matHeaderCellDef> Tipo </th>
              <td mat-cell *matCellDef="let consulta"> {{ consulta.tipo }} </td>
            </ng-container>
            
            <ng-container matColumnDef="valorConsulta">
              <th mat-header-cell *matHeaderCellDef> Valor </th>
              <td mat-cell *matCellDef="let consulta"> {{ consulta.valorConsulta | number:'1.2-2' }} MZN </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef> Estado </th>
              <td mat-cell *matCellDef="let consulta"> 
                <span class="status-chip" [class]="getStatusClass(consulta.status)">
                  {{ consulta.status }}
                </span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
          </table>
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
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      
      h2 { 
        margin: 0; 
        font-size: 28px; 
        color: var(--color-gray-900);
      }
      
      .subtitle {
        margin: 4px 0 0 0;
        color: var(--color-gray-500);
      }
    }

    .filters-section {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      background: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      
      .search-field {
        width: 300px;
        margin-bottom: -1.25em; /* Compensate for mat-form-field extra bottom space */
      }
    }

    .table-container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      
      table {
        width: 100%;
      }
      
      th.mat-header-cell {
        background-color: var(--color-gray-50, #f9fafb);
        color: var(--color-gray-700, #374151);
        font-weight: 600;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .table-row {
        &:hover {
          background-color: var(--color-gray-50);
        }
      }
    }

    .datetime-cell {
      display: flex;
      flex-direction: column;
      
      .date { font-weight: 500; }
      .time { font-size: 12px; color: var(--color-gray-500); }
    }
    
    .user-cell {
      display: flex;
      align-items: center;
      gap: 8px;
      
      mat-icon {
        color: var(--color-gray-400);
        font-size: 20px;
        height: 20px;
        width: 20px;
      }
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      color: var(--color-gray-500);
      
      mat-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        margin-bottom: 16px;
      }
    }

    .status-chip {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      
      &.status-agendada { background: #e0f2fe; color: #0369a1; }
      &.status-em-curso { background: #fef08a; color: #a16207; }
      &.status-concluida { background: #dcfce7; color: #15803d; }
      &.status-cancelada { background: #fee2e2; color: #b91c1c; }
      &.status-default { background: #f3f4f6; color: #374151; }
    }
  `]
})
export class ListaConsultasComponent implements OnInit {
  private consultaService = inject(ConsultaService);

  consultas = signal<any[]>([]);
  filteredConsultas = signal<any[]>([]);
  isLoading = signal(true);
  
  searchTerm = '';
  selectedFilter = 'Todas';

  displayedColumns = ['hora', 'paciente', 'medico', 'especialidade', 'tipo', 'valorConsulta', 'status'];

  ngOnInit() {
    this.loadConsultas();
  }

  loadConsultas() {
    this.isLoading.set(true);
    this.consultaService.listar().subscribe({
      next: (data) => {
        this.consultas.set(data);
        this.filterData();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  filterData() {
    let filtered = this.consultas();

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        (c.motivo && c.motivo.toLowerCase().includes(term)) ||
        (c.especialidade && c.especialidade.toLowerCase().includes(term))
      );
    }

    if (this.selectedFilter !== 'Todas') {
      const statusMap: any = {
        'Agendadas': 'agendada',
        'Em Curso': 'em-curso',
        'Concluídas': 'concluida',
        'Canceladas': 'cancelada'
      };
      
      const targetStatus = statusMap[this.selectedFilter];
      filtered = filtered.filter(c => c.status.toLowerCase() === targetStatus);
    }

    this.filteredConsultas.set(filtered);
  }

  getStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('agendada')) return 'status-agendada';
    if (s.includes('curso')) return 'status-em-curso';
    if (s.includes('conclu')) return 'status-concluida';
    if (s.includes('cancel')) return 'status-cancelada';
    return 'status-default';
  }
}
