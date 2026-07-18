import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { PrescricaoService } from '../../../core/services/prescricao.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Prescricao } from '../../../core/models';

@Component({
  selector: 'app-minhas-prescricoes',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="page-enter">
      <div class="mb-6"><h1 class="text-3xl font-bold">Minhas Prescrições</h1><p class="text-secondary mt-1">Medicamentos prescritos pelo médico</p></div>
      @if (prescricoes().length === 0) {
        <div class="empty-state card p-8"><mat-icon>medication_off</mat-icon><p>Nenhuma prescrição disponível</p></div>
      }
      @for (p of prescricoes(); track p.id) {
        <div class="card p-4 mb-3">
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="font-semibold">{{ formatarData(p.data) }}</p>
              <p class="text-xs text-secondary">Válido até {{ formatarData(p.validade) }}</p>
            </div>
            <span class="chip" [ngClass]="p.status === 'ativa' ? 'chip-success' : 'chip-neutral'">{{ p.status === 'ativa' ? 'Activa' : p.status }}</span>
          </div>
          @for (m of p.medicamentos; track m.nome) {
            <div class="med-row">
              <div class="med-icon"><mat-icon>medication</mat-icon></div>
              <div>
                <p class="font-medium text-sm">{{ m.nome }} — {{ m.dose }}</p>
                <p class="text-xs text-secondary">{{ m.via }} · {{ m.frequencia }} · {{ m.duracao }}</p>
                @if (m.instrucoes) { <p class="text-xs text-tertiary">{{ m.instrucoes }}</p> }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .med-row { display:flex;gap:10px;align-items:flex-start;padding:8px;background:var(--surface-input);border-radius:8px;margin-bottom:6px; }
    .med-icon { width:32px;height:32px;border-radius:8px;background:var(--color-primary-100);display:flex;align-items:center;justify-content:center;flex-shrink:0; mat-icon { color:var(--color-primary-600);font-size:18px; } }
    .empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center; mat-icon { font-size:48px;color:var(--text-tertiary);opacity:0.4; } p { font-size:15px;color:var(--text-secondary); } }
  `],
})
export class MinhasPrescricoesComponent implements OnInit {
  private prescSvc = inject(PrescricaoService);
  private auth     = inject(AuthService);
  prescricoes = signal<Prescricao[]>([]);
  ngOnInit(): void {
    const pacienteId = this.auth.utilizadorAtual()?.pacienteId ?? 'pac001';
    this.prescSvc.listar({ pacienteId }).subscribe(p => this.prescricoes.set(p));
  }
  formatarData(d: string): string { return new Date(d).toLocaleDateString('pt-MZ'); }
}
