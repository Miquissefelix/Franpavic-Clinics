import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { PrescricaoService } from '../../../core/services/prescricao.service';
import { Prescricao } from '../../../core/models';

@Component({
  selector: 'app-prescricoes',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="page-enter">
      <div class="page-header mb-6">
        <div>
          <h1 class="text-3xl font-bold">Prescrições</h1>
          <p class="text-secondary mt-1">Histórico de prescrições emitidas</p>
        </div>
      </div>

      @if (prescricoes().length === 0) {
        <div class="empty-state card p-8">
          <mat-icon>medication</mat-icon>
          <p>Nenhuma prescrição encontrada</p>
        </div>
      }

      @for (p of prescricoes(); track p.id) {
        <div class="card p-4 mb-3">
          <div class="presc-header">
            <div>
              <p class="font-semibold">Prescrição — {{ formatarData(p.data) }}</p>
              <p class="text-xs text-secondary">Paciente ID: {{ p.pacienteId }} · Válido até {{ formatarData(p.validade) }}</p>
            </div>
            <span class="chip" [ngClass]="p.status === 'ativa' ? 'chip-success' : 'chip-neutral'">
              {{ p.status === 'ativa' ? 'Activa' : p.status }}
            </span>
          </div>
          <div class="med-list mt-3">
            @for (m of p.medicamentos; track m.nome) {
              <div class="med-row">
                <mat-icon>medication</mat-icon>
                <div class="flex-1">
                  <span class="font-medium text-sm">{{ m.nome }} {{ m.dose }}</span>
                  <span class="text-xs text-secondary ml-2">{{ m.via }} · {{ m.frequencia }} · {{ m.duracao }}</span>
                </div>
              </div>
            }
          </div>
          @if (p.observacoes) {
            <p class="text-xs text-secondary mt-2">{{ p.observacoes }}</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px; }
    .presc-header { display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:8px; }
    .med-list { display:flex;flex-direction:column;gap:6px; }
    .med-row { display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--surface-input);border-radius:6px;
      mat-icon { font-size:18px;color:var(--color-primary-600); }
    }
    .empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;
      mat-icon { font-size:48px;color:var(--text-tertiary);opacity:0.4; }
      p { font-size:15px;color:var(--text-secondary); }
    }
  `],
})
export class PrescricoesComponent implements OnInit {
  private prescSvc = inject(PrescricaoService);
  prescricoes = signal<Prescricao[]>([]);
  ngOnInit(): void {
    this.prescSvc.listar({ medicoId: 'med001' }).subscribe(p => this.prescricoes.set(p));
  }
  formatarData(d: string): string { return new Date(d).toLocaleDateString('pt-MZ'); }
}
