import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { PacienteService } from '../../../core/services/paciente.service';
import { Paciente } from '../../../core/models';

@Component({
  selector: 'app-lista-pacientes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatTableModule, MatChipsModule, MatTooltipModule, MatMenuModule],
  template: `
    <div class="page-enter">
      <div class="page-header mb-6">
        <div>
          <h1 class="text-3xl font-bold">Pacientes</h1>
          <p class="text-secondary mt-1">{{ total() }} pacientes registados</p>
        </div>
        <button mat-flat-button color="primary" routerLink="/recepcao/pacientes/novo">
          <mat-icon>person_add</mat-icon> Registar Paciente
        </button>
      </div>

      <!-- Barra de Busca -->
      <div class="card p-4 mb-4">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex-1" style="min-width:240px">
            <mat-form-field appearance="outline" class="w-full" style="margin-bottom:-20px">
              <mat-label>Buscar paciente</mat-label>
              <input matInput [(ngModel)]="termoBusca" (ngModelChange)="filtrar()" placeholder="Nome, nº paciente, BI...">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>
          </div>
          <mat-chip-listbox>
            <mat-chip-option (click)="filtrarStatus('')"    [selected]="statusFiltro === ''">Todos</mat-chip-option>
            <mat-chip-option (click)="filtrarStatus('ativo')"   [selected]="statusFiltro === 'ativo'">Activos</mat-chip-option>
            <mat-chip-option (click)="filtrarStatus('inativo')" [selected]="statusFiltro === 'inativo'">Inactivos</mat-chip-option>
          </mat-chip-listbox>
        </div>
      </div>

      <!-- Tabela -->
      <div class="card" style="overflow:hidden">
        @if (carregando()) {
          <div class="p-8 text-center">
            <div class="skeleton" style="height:48px;margin-bottom:8px;border-radius:8px"></div>
            @for (i of [1,2,3,4,5]; track i) {
              <div class="skeleton" style="height:60px;margin-bottom:4px;border-radius:6px"></div>
            }
          </div>
        } @else if (pacientesFiltrados().length === 0) {
          <div style="padding:64px;text-align:center">
            <mat-icon style="font-size:56px;color:var(--text-tertiary);opacity:0.4">person_search</mat-icon>
            <p style="font-size:16px;font-weight:600;margin:12px 0 4px">Nenhum paciente encontrado</p>
            <p class="text-secondary text-sm">Tente outro termo de busca</p>
          </div>
        } @else {
          <table mat-table [dataSource]="pacientesFiltrados()" class="w-full">
            <ng-container matColumnDef="numero">
              <th mat-header-cell *matHeaderCellDef>Nº Paciente</th>
              <td mat-cell *matCellDef="let p">
                <span class="text-sm font-medium text-link">{{ p.numeroPaciente }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="nome">
              <th mat-header-cell *matHeaderCellDef>Paciente</th>
              <td mat-cell *matCellDef="let p">
                <div class="flex items-center gap-2">
                  <div class="pac-avatar">{{ iniciais(p.nome) }}</div>
                  <div>
                    <p class="font-medium text-sm">{{ p.nome }}</p>
                    <p class="text-xs text-secondary">{{ calcularIdade(p.dataNascimento) }} anos · {{ p.genero }}</p>
                  </div>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="telefone">
              <th mat-header-cell *matHeaderCellDef>Contacto</th>
              <td mat-cell *matCellDef="let p" class="text-sm">{{ p.telefone }}</td>
            </ng-container>
            <ng-container matColumnDef="tipoSanguineo">
              <th mat-header-cell *matHeaderCellDef>Tipo Sang.</th>
              <td mat-cell *matCellDef="let p">
                <span class="chip chip-danger">{{ p.tipoSanguineo }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="ultimaConsulta">
              <th mat-header-cell *matHeaderCellDef>Última Consulta</th>
              <td mat-cell *matCellDef="let p" class="text-sm text-secondary">
                {{ p.ultimaConsulta ? formatarData(p.ultimaConsulta) : '—' }}
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let p">
                <span class="chip" [ngClass]="p.status === 'ativo' ? 'chip-success' : 'chip-neutral'">
                  {{ p.status === 'ativo' ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="acoes">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let p">
                <div class="flex gap-1 justify-end">
                  <button mat-icon-button [routerLink]="['/recepcao/pacientes', p.id]" matTooltip="Ver detalhes">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button [routerLink]="['/recepcao/pacientes', p.id, 'editar']" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="colunas"></tr>
            <tr mat-row *matRowDef="let row; columns: colunas;" class="cursor-pointer"></tr>
          </table>
        }
      </div>
    </div>
  `,
  styles: [`.pac-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--color-primary-500),var(--color-secondary-500));color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}`],
})
export class ListaPacientesComponent implements OnInit {
  private pacienteSvc = inject(PacienteService);
  todos = signal<Paciente[]>([]);
  pacientesFiltrados = signal<Paciente[]>([]);
  carregando  = signal(true);
  total       = signal(0);
  termoBusca  = '';
  statusFiltro = '';
  colunas = ['numero','nome','telefone','tipoSanguineo','ultimaConsulta','status','acoes'];

  ngOnInit(): void {
    this.pacienteSvc.listarTodos().subscribe(p => {
      this.todos.set(p);
      this.pacientesFiltrados.set(p);
      this.total.set(p.length);
      this.carregando.set(false);
    });
  }

  filtrar(): void {
    let dados = this.todos();
    if (this.termoBusca) {
      const t = this.termoBusca.toLowerCase();
      dados = dados.filter(p => p.nome.toLowerCase().includes(t) || p.numeroPaciente.toLowerCase().includes(t) || p.bi?.toLowerCase().includes(t));
    }
    if (this.statusFiltro) dados = dados.filter(p => p.status === this.statusFiltro);
    this.pacientesFiltrados.set(dados);
  }

  filtrarStatus(s: string): void { this.statusFiltro = s; this.filtrar(); }
  iniciais(n: string): string { return n.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase(); }
  calcularIdade(dob: string): number { return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000)); }
  formatarData(d: string): string { return new Date(d).toLocaleDateString('pt-MZ'); }
}
