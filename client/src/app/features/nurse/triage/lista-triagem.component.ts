import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { TriagemService } from '../../../core/services/triagem.service';

@Component({
  selector: 'app-lista-triagem',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1>Fila de Triagem</h1>
          <p>Gestão de pacientes a aguardar atendimento.</p>
        </div>
        <div class="actions">
          <div class="search-bar">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Pesquisar paciente..." (input)="onSearch($event)">
          </div>
          <button mat-flat-button color="primary" routerLink="/enfermagem/triagem/nova">
            <mat-icon>add</mat-icon> Nova Triagem
          </button>
        </div>
      </header>

      <div class="table-container">
        <table mat-table [dataSource]="filteredTriagens()" class="custom-table">
          <!-- Data/Hora Column -->
          <ng-container matColumnDef="dataHora">
            <th mat-header-cell *matHeaderCellDef> Data/Hora </th>
            <td mat-cell *matCellDef="let element"> {{ element.dataHora | date:'dd/MM/yyyy HH:mm' }} </td>
          </ng-container>

          <!-- Paciente Column -->
          <ng-container matColumnDef="pacienteId">
            <th mat-header-cell *matHeaderCellDef> ID Paciente </th>
            <td mat-cell *matCellDef="let element"> <strong>{{ element.pacienteId }}</strong> </td>
          </ng-container>

          <!-- Escala Column -->
          <ng-container matColumnDef="escalaTriagem">
            <th mat-header-cell *matHeaderCellDef> Escala </th>
            <td mat-cell *matCellDef="let element"> 
              <mat-chip class="escala-chip" [ngClass]="getEscalaClass(element.escalaTriagem)">
                {{ element.escalaTriagem }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Vitals Columns -->
          <ng-container matColumnDef="peso">
            <th mat-header-cell *matHeaderCellDef> Peso </th>
            <td mat-cell *matCellDef="let element"> {{ element.peso }} kg </td>
          </ng-container>

          <ng-container matColumnDef="altura">
            <th mat-header-cell *matHeaderCellDef> Altura </th>
            <td mat-cell *matCellDef="let element"> {{ element.altura }} cm </td>
          </ng-container>

          <ng-container matColumnDef="imc">
            <th mat-header-cell *matHeaderCellDef> IMC </th>
            <td mat-cell *matCellDef="let element"> 
              <span [ngClass]="getImcClass(element.imc)" class="imc-badge">{{ element.imc | number:'1.1-1' }}</span> 
            </td>
          </ng-container>

          <ng-container matColumnDef="temperatura">
            <th mat-header-cell *matHeaderCellDef> Temp. </th>
            <td mat-cell *matCellDef="let element" [class.text-danger]="element.temperatura > 37.5"> 
              {{ element.temperatura }} °C 
            </td>
          </ng-container>

          <ng-container matColumnDef="pressaoArterial">
            <th mat-header-cell *matHeaderCellDef> PA </th>
            <td mat-cell *matCellDef="let element"> {{ element.pressaoArterial }} </td>
          </ng-container>

          <ng-container matColumnDef="frequenciaCardiaca">
            <th mat-header-cell *matHeaderCellDef> FC </th>
            <td mat-cell *matCellDef="let element"> {{ element.frequenciaCardiaca }} bpm </td>
          </ng-container>

          <ng-container matColumnDef="saturacaoOxigenio">
            <th mat-header-cell *matHeaderCellDef> SpO2 </th>
            <td mat-cell *matCellDef="let element"> {{ element.saturacaoOxigenio }}% </td>
          </ng-container>

          <ng-container matColumnDef="queixaPrincipal">
            <th mat-header-cell *matHeaderCellDef> Queixa </th>
            <td mat-cell *matCellDef="let element" class="truncate-cell" [title]="element.queixaPrincipal"> 
              {{ element.queixaPrincipal }} 
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
        </table>
        
        @if (filteredTriagens().length === 0) {
          <div class="empty-state">Nenhum registo encontrado.</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
    .page-header h1 { margin: 0; font-size: 28px; font-weight: 600; color: var(--color-gray-900, #111827); }
    .page-header p { margin: 4px 0 0; color: var(--color-gray-500, #6b7280); }
    
    .actions { display: flex; gap: 16px; align-items: center; }
    .search-bar { display: flex; align-items: center; background: white; border: 1px solid var(--color-gray-300, #d1d5db); border-radius: 8px; padding: 0 12px; height: 40px; }
    .search-bar mat-icon { color: var(--color-gray-400, #9ca3af); font-size: 20px; width: 20px; height: 20px; }
    .search-bar input { border: none; outline: none; padding: 8px; font-size: 14px; width: 200px; background: transparent; }

    .table-container { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow-x: auto; border: 1px solid var(--color-gray-200, #e5e7eb); }
    .custom-table { width: 100%; }
    .custom-table th { background: var(--color-gray-50, #f9fafb); color: var(--color-gray-600, #4b5563); font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--color-gray-200, #e5e7eb); }
    .custom-table td { color: var(--color-gray-800, #1f2937); font-size: 14px; border-bottom: 1px solid var(--color-gray-100, #f3f4f6); }
    .table-row:hover { background-color: var(--color-gray-50, #f9fafb); transition: background-color 0.2s; }
    
    .truncate-cell { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .escala-chip { font-weight: 600 !important; font-size: 12px !important; min-height: 24px !important; }
    .chip-danger { background-color: #fee2e2 !important; color: #991b1b !important; }
    .chip-warning-orange { background-color: #ffedd5 !important; color: #9a3412 !important; }
    .chip-warning-yellow { background-color: #fefce8 !important; color: #854d0e !important; }
    .chip-success { background-color: #dcfce3 !important; color: #166534 !important; }
    .chip-primary { background-color: #dbeafe !important; color: #1e40af !important; }

    .imc-badge { padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; }
    .imc-normal { background: #dcfce3; color: #166534; }
    .imc-alert { background: #fefce8; color: #854d0e; }
    .imc-danger { background: #fee2e2; color: #991b1b; }

    .text-danger { color: #dc2626 !important; font-weight: 600; }
    
    .empty-state { padding: 32px; text-align: center; color: var(--color-gray-500, #6b7280); }
  `]
})
export class ListaTriagemComponent implements OnInit {
  private triagemService = inject(TriagemService);
  
  displayedColumns: string[] = ['dataHora', 'pacienteId', 'escalaTriagem', 'peso', 'altura', 'imc', 'temperatura', 'pressaoArterial', 'frequenciaCardiaca', 'saturacaoOxigenio', 'queixaPrincipal'];
  
  todasTriagens = signal<any[]>([]);
  filteredTriagens = signal<any[]>([]);

  ngOnInit() {
    this.triagemService.listar().subscribe(data => {
      this.todasTriagens.set(data);
      this.filteredTriagens.set(data);
    });
  }

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredTriagens.set(
      this.todasTriagens().filter(t => 
        t.pacienteId.toLowerCase().includes(term) || 
        t.queixaPrincipal.toLowerCase().includes(term)
      )
    );
  }

  getEscalaClass(escala: string): string {
    const map: Record<string, string> = {
      'Vermelho': 'chip-danger',
      'Laranja': 'chip-warning-orange',
      'Amarelo': 'chip-warning-yellow',
      'Verde': 'chip-success',
      'Azul': 'chip-primary'
    };
    return map[escala] || '';
  }

  getImcClass(imc: number): string {
    if (imc < 25) return 'imc-normal';
    if (imc >= 25 && imc <= 30) return 'imc-alert';
    return 'imc-danger';
  }
}
