import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ClinicaService } from '../../../core/services/clinica.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ResultadoLaboratorio } from '../../../core/models';

@Component({
  selector: 'app-meus-resultados',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="page-enter">
      <div class="mb-6"><h1 class="text-3xl font-bold">Resultados de Laboratório</h1><p class="text-secondary mt-1">Seus exames e análises</p></div>
      @if (resultados().length === 0) {
        <div class="empty-state card p-8"><mat-icon>biotech</mat-icon><p>Nenhum resultado disponível</p></div>
      }
      @for (r of resultados(); track r.id) {
        <div class="card p-4 mb-4">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="font-semibold">{{ r.laboratorio }}</p>
              <p class="text-xs text-secondary">{{ formatarData(r.data) }}</p>
            </div>
            <span class="chip chip-success">Disponível</span>
          </div>
          <div class="results-table">
            <div class="results-header">
              <span>Exame</span><span>Resultado</span><span>Referência</span><span>Status</span>
            </div>
            @for (item of r.resultados; track item.exame) {
              <div class="results-row" [ngClass]="'row-' + item.status">
                <span class="text-sm font-medium">{{ item.exame }}</span>
                <span class="text-sm font-bold">{{ item.valor }} {{ item.unidade }}</span>
                <span class="text-xs text-secondary">{{ item.referencia }}</span>
                <span class="chip text-xs" [ngClass]="chipResultado(item.status)">{{ item.status }}</span>
              </div>
            }
          </div>
          @if (r.observacoes) {
            <p class="text-xs text-secondary mt-3">Obs: {{ r.observacoes }}</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .results-table { border:1px solid var(--border-color);border-radius:10px;overflow:hidden; }
    .results-header { display:grid;grid-template-columns:2fr 1fr 1.5fr 1fr;gap:8px;padding:8px 14px;background:var(--surface-input);font-size:11px;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.05em; }
    .results-row { display:grid;grid-template-columns:2fr 1fr 1.5fr 1fr;gap:8px;padding:10px 14px;border-top:1px solid var(--border-color);align-items:center;
      &.row-elevado { background:rgba(245,158,11,0.05); }
      &.row-critico { background:rgba(239,68,68,0.05); }
      &.row-baixo   { background:rgba(14,165,233,0.05); }
    }
    .empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center; mat-icon { font-size:48px;color:var(--text-tertiary);opacity:0.4; } p { font-size:15px;color:var(--text-secondary); } }
  `],
})
export class MeusResultadosComponent implements OnInit {
  private clinicaSvc = inject(ClinicaService);
  private auth       = inject(AuthService);
  resultados = signal<ResultadoLaboratorio[]>([]);
  ngOnInit(): void {
    const pacienteId = this.auth.utilizadorAtual()?.pacienteId ?? 'pac001';
    this.clinicaSvc.listarResultados(pacienteId).subscribe(r => this.resultados.set(r));
  }
  formatarData(d: string): string { return new Date(d).toLocaleDateString('pt-MZ'); }
  chipResultado(s: string): string {
    const m: Record<string,string> = { normal:'chip-success', elevado:'chip-warning', baixo:'chip-primary', critico:'chip-danger' };
    return m[s] ?? 'chip-neutral';
  }
}
