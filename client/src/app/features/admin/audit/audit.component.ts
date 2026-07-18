import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import auditData from '../../../../assets/mock-data/audit-log.json';
import { AcaoAudit, AuditLog } from '../../../core/models';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTableModule, MatChipsModule],
  template: `
    <div class="page-enter">
      <div class="page-header mb-6">
        <div>
          <h1 class="text-3xl font-bold">Registo de Auditoria</h1>
          <p class="text-secondary mt-1">Histórico completo de ações no sistema</p>
        </div>
      </div>

      <div class="card">
        <table mat-table [dataSource]="logs" class="w-full">
          <ng-container matColumnDef="utilizador">
            <th mat-header-cell *matHeaderCellDef>Utilizador</th>
            <td mat-cell *matCellDef="let l">
              <div class="flex items-center gap-2">
                <div class="audit-avatar">{{ iniciais(l.utilizador) }}</div>
                <span class="text-sm font-medium">{{ l.utilizador }}</span>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="acao">
            <th mat-header-cell *matHeaderCellDef>Ação</th>
            <td mat-cell *matCellDef="let l">
              <span class="chip" [ngClass]="'chip-' + corAcao(l.acao)">{{ l.acao }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="modulo">
            <th mat-header-cell *matHeaderCellDef>Módulo</th>
            <td mat-cell *matCellDef="let l" class="text-sm text-secondary">{{ l.modulo }}</td>
          </ng-container>
          <ng-container matColumnDef="descricao">
            <th mat-header-cell *matHeaderCellDef>Descrição</th>
            <td mat-cell *matCellDef="let l" class="text-sm">{{ l.descricao }}</td>
          </ng-container>
          <ng-container matColumnDef="data">
            <th mat-header-cell *matHeaderCellDef>Data/Hora</th>
            <td mat-cell *matCellDef="let l" class="text-xs text-secondary">{{ formatarData(l.data) }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="colunas"></tr>
          <tr mat-row *matRowDef="let row; columns: colunas;"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`.audit-avatar{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--color-primary-500),var(--color-secondary-500));color:white;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}`],
})
export class AuditComponent implements OnInit {
  logs: AuditLog[] = [];
  colunas = ['utilizador','acao','modulo','descricao','data'];

  ngOnInit(): void {
    this.logs = auditData
      .map(log => ({
        ...log,
        acao: log.acao as AcaoAudit,
        utilizadorId: log.id,
        modulo: log.perfil,
      }))
      .sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }

  iniciais(n: string): string { return n.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase(); }
  formatarData(d: string): string { return new Date(d).toLocaleString('pt-MZ'); }
  corAcao(a: string): string {
    const m: Record<string,string> = {CRIAR:'success',EDITAR:'warning',EXCLUIR:'danger',LOGIN:'primary',VER:'neutral'};
    return m[a] ?? 'neutral';
  }
}
