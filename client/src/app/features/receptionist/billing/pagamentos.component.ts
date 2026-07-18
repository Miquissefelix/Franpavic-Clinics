import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { PagamentoService } from '../../../core/services/pagamento.service';

@Component({
  selector: 'app-pagamentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>Faturação e Pagamentos</h2>
        <p class="subtitle">Gestão financeira da receção</p>
      </div>

      <div class="search-section">
        <mat-form-field appearance="outline" class="search-input">
          <mat-label>Pesquisar paciente, recibo ou descrição</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="aplicarFiltro()">
        </mat-form-field>
      </div>

      <div class="card-container">
        <mat-tab-group>
          <!-- Tab Pagamentos -->
          <mat-tab label="Pagamentos Pendentes e Histórico">
            <div class="tab-content">
              <table mat-table [dataSource]="pagamentosFiltrados()">
                
                <ng-container matColumnDef="data">
                  <th mat-header-cell *matHeaderCellDef> Data </th>
                  <td mat-cell *matCellDef="let p"> {{ p.data | date:'dd/MM/yyyy' }} </td>
                </ng-container>

                <ng-container matColumnDef="descricao">
                  <th mat-header-cell *matHeaderCellDef> Descrição </th>
                  <td mat-cell *matCellDef="let p"> {{ p.descricao }} </td>
                </ng-container>

                <ng-container matColumnDef="pacienteId">
                  <th mat-header-cell *matHeaderCellDef> Paciente ID </th>
                  <td mat-cell *matCellDef="let p"> {{ p.pacienteId }} </td>
                </ng-container>

                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef> Total </th>
                  <td mat-cell *matCellDef="let p" class="font-semibold text-primary"> 
                    {{ p.total | number:'1.2-2' }} MZN 
                  </td>
                </ng-container>

                <ng-container matColumnDef="metodoPagamento">
                  <th mat-header-cell *matHeaderCellDef> Método </th>
                  <td mat-cell *matCellDef="let p"> {{ p.metodoPagamento || '-' }} </td>
                </ng-container>

                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef> Estado </th>
                  <td mat-cell *matCellDef="let p">
                    <mat-chip [class]="getEstadoClass(p.estado)">
                      {{ p.estado }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="acoes">
                  <th mat-header-cell *matHeaderCellDef> Ações </th>
                  <td mat-cell *matCellDef="let p">
                    @if (p.estado === 'pendente') {
                      <button mat-stroked-button color="primary" (click)="registarPagamento(p)">
                        <mat-icon>payments</mat-icon>
                        Registar
                      </button>
                    }
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="colunasPagamentos"></tr>
                <tr mat-row *matRowDef="let row; columns: colunasPagamentos;"></tr>
                
                <!-- Empty State -->
                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell empty-cell" colspan="7">Nenhum pagamento encontrado.</td>
                </tr>
              </table>
            </div>
          </mat-tab>

          <!-- Tab Recibos -->
          <mat-tab label="Recibos Emitidos">
            <div class="tab-content">
              <table mat-table [dataSource]="recibosFiltrados()">
                
                <ng-container matColumnDef="numero">
                  <th mat-header-cell *matHeaderCellDef> N.º Recibo </th>
                  <td mat-cell *matCellDef="let r" class="font-mono font-bold"> {{ r.numero }} </td>
                </ng-container>

                <ng-container matColumnDef="data">
                  <th mat-header-cell *matHeaderCellDef> Data Emissão </th>
                  <td mat-cell *matCellDef="let r"> {{ r.data | date:'dd/MM/yyyy HH:mm' }} </td>
                </ng-container>

                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef> Total </th>
                  <td mat-cell *matCellDef="let r" class="font-semibold text-primary"> 
                    {{ r.total | number:'1.2-2' }} MZN 
                  </td>
                </ng-container>

                <ng-container matColumnDef="emitidoPor">
                  <th mat-header-cell *matHeaderCellDef> Emitido Por </th>
                  <td mat-cell *matCellDef="let r"> {{ r.emitidoPor }} </td>
                </ng-container>

                <ng-container matColumnDef="acoes">
                  <th mat-header-cell *matHeaderCellDef> Ações </th>
                  <td mat-cell *matCellDef="let r">
                    <button mat-icon-button color="primary" title="Imprimir Recibo">
                      <mat-icon>print</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="colunasRecibos"></tr>
                <tr mat-row *matRowDef="let row; columns: colunasRecibos;"></tr>
                
                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell empty-cell" colspan="5">Nenhum recibo encontrado.</td>
                </tr>
              </table>
            </div>
          </mat-tab>
        </mat-tab-group>
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
      margin-bottom: 24px;
      
      h2 { margin: 0; font-size: 28px; color: var(--color-gray-900); }
      .subtitle { margin: 4px 0 0 0; color: var(--color-gray-500); }
    }

    .search-section {
      margin-bottom: 24px;
      
      .search-input {
        width: 100%;
        max-width: 500px;
        background: white;
      }
    }

    .card-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .tab-content {
      padding: 16px 0;
    }

    table {
      width: 100%;
      
      th.mat-header-cell {
        background-color: var(--color-gray-50);
        color: var(--color-gray-700);
        font-weight: 600;
      }
    }

    .empty-cell {
      padding: 48px;
      text-align: center;
      color: var(--color-gray-500);
      font-style: italic;
    }

    .font-semibold { font-weight: 600; }
    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
    .text-primary { color: var(--color-primary-700); }

    .chip-pago {
      background-color: #dcfce7 !important;
      color: #15803d !important;
    }
    .chip-pendente {
      background-color: #fef9c3 !important;
      color: #a16207 !important;
    }
    .chip-cancelado {
      background-color: #fee2e2 !important;
      color: #b91c1c !important;
    }
  `]
})
export class PagamentosComponent implements OnInit {
  private pagamentoService = inject(PagamentoService);

  pagamentos = signal<any[]>([]);
  recibos = signal<any[]>([]);
  
  pagamentosFiltrados = signal<any[]>([]);
  recibosFiltrados = signal<any[]>([]);
  
  searchTerm = '';

  colunasPagamentos = ['data', 'descricao', 'pacienteId', 'total', 'metodoPagamento', 'estado', 'acoes'];
  colunasRecibos = ['numero', 'data', 'total', 'emitidoPor', 'acoes'];

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.pagamentoService.listar().subscribe(data => {
      this.pagamentos.set(data);
      this.aplicarFiltro();
    });

    this.pagamentoService.listarRecibos().subscribe(data => {
      this.recibos.set(data);
      this.aplicarFiltro();
    });
  }

  aplicarFiltro() {
    const term = this.searchTerm.toLowerCase();
    
    if (!term) {
      this.pagamentosFiltrados.set(this.pagamentos());
      this.recibosFiltrados.set(this.recibos());
      return;
    }

    const filteredPagamentos = this.pagamentos().filter(p => 
      p.descricao.toLowerCase().includes(term) ||
      p.pacienteId.toLowerCase().includes(term)
    );
    
    const filteredRecibos = this.recibos().filter(r => 
      r.numero.toLowerCase().includes(term) ||
      r.emitidoPor.toLowerCase().includes(term)
    );

    this.pagamentosFiltrados.set(filteredPagamentos);
    this.recibosFiltrados.set(filteredRecibos);
  }

  getEstadoClass(estado: string): string {
    const e = estado.toLowerCase();
    if (e === 'pago') return 'chip-pago';
    if (e === 'pendente') return 'chip-pendente';
    if (e === 'cancelado') return 'chip-cancelado';
    return '';
  }

  registarPagamento(pagamento: any) {
    if (confirm(`Confirmar o pagamento de ${pagamento.total} MZN para a descrição: ${pagamento.descricao}?`)) {
      this.pagamentoService.registarPagamento(pagamento.id, 'cartão').subscribe(() => {
        this.carregarDados();
      });
    }
  }
}
