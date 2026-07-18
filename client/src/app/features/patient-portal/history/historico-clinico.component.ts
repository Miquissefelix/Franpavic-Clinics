import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { ClinicaService } from '../../../core/services/clinica.service';
import { AuthService } from '../../../core/auth/auth.service';
import { RegistoClinico } from '../../../core/models';

@Component({
  selector: 'app-historico-clinico',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatChipsModule, MatExpansionModule],
  template: `
    <div class="page-enter">
      <div class="mb-6"><h1 class="text-3xl font-bold">Histórico Clínico</h1><p class="text-secondary mt-1">Todas as suas consultas e registos médicos</p></div>
      @if (registos().length === 0) {
        <div class="empty-state card p-8"><mat-icon>history_toggle_off</mat-icon><p>Sem histórico clínico disponível</p></div>
      }
      <div class="timeline">
        @for (r of registos(); track r.id) {
          <div class="timeline-item" [ngClass]="'item-' + (r.status === 'concluida' ? 'success' : 'warning')">
            <div class="card p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold">{{ formatarData(r.data) }}</span>
                <span class="chip" [ngClass]="r.status === 'concluida' ? 'chip-success' : 'chip-warning'">{{ r.status }}</span>
              </div>
              <div class="flex items-center gap-2 mb-2">
                <span class="chip chip-primary text-xs">{{ r.diagnosticoPrincipal.codigo }}</span>
                <span class="font-medium text-sm">{{ r.diagnosticoPrincipal.descricao }}</span>
              </div>
              <p class="text-sm text-secondary">{{ r.queixas }}</p>
              @if (r.observacoes) {
                <p class="text-xs text-tertiary mt-2">{{ r.observacoes }}</p>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`.empty-state{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;mat-icon{font-size:48px;color:var(--text-tertiary);opacity:0.4;}p{font-size:15px;color:var(--text-secondary);}}`],
})
export class HistoricoClinicoComponent implements OnInit {
  private clinicaSvc = inject(ClinicaService);
  private auth       = inject(AuthService);
  registos = signal<RegistoClinico[]>([]);
  ngOnInit(): void {
    const pacienteId = this.auth.utilizadorAtual()?.pacienteId ?? 'pac001';
    this.clinicaSvc.listarRegistos(pacienteId).subscribe(r => this.registos.set(r));
  }
  formatarData(d: string): string { return new Date(d).toLocaleDateString('pt-MZ', { weekday:'short', day:'2-digit', month:'long', year:'numeric' }); }
}
