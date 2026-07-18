import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { ConsultaService } from '../../../core/services/consulta.service';
import { Consulta } from '../../../core/models';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-minhas-consultas',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="page-enter">
      <div class="page-header mb-6">
        <div><h1 class="text-3xl font-bold">Minhas Consultas</h1><p class="text-secondary mt-1">Histórico e próximas consultas</p></div>
        <button mat-flat-button color="primary" routerLink="/portal/agendar"><mat-icon>add</mat-icon> Agendar</button>
      </div>
      @if (consultas().length === 0) {
        <div class="empty-state card p-8"><mat-icon>event_busy</mat-icon><p>Nenhuma consulta encontrada</p></div>
      }
      @for (c of consultas(); track c.id) {
        <div class="card p-4 mb-3 consulta-card">
          <div class="flex items-center gap-4">
            <div class="date-col">
              <span class="day">{{ getDia(c.data) }}</span>
              <span class="month">{{ getMes(c.data) }}</span>
              <span class="time">{{ c.hora }}</span>
            </div>
            <div class="flex-1">
              <p class="font-semibold">{{ c.motivo }}</p>
              <p class="text-sm text-secondary">{{ c.especialidade }}</p>
              <p class="text-xs text-tertiary mt-1">{{ labelTipo(c.tipo) }} · {{ c.duracaoMinutos }} min</p>
            </div>
            <div class="text-right">
              <span class="chip" [ngClass]="chipStatus(c.status)">{{ labelStatus(c.status) }}</span>
              <p class="text-sm font-medium mt-2" style="color:var(--color-success-600)">{{ c.valorConsulta | number:'1.0-0' }} MZN</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px; }
    .consulta-card { border-left:3px solid var(--color-primary-400); }
    .date-col { display:flex;flex-direction:column;align-items:center;min-width:44px;
      .day { font-size:22px;font-weight:700;color:var(--color-primary-700);line-height:1; }
      .month { font-size:10px;text-transform:uppercase;color:var(--color-primary-500); }
      .time { font-size:11px;color:var(--text-tertiary);margin-top:4px; }
    }
    .empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;
      mat-icon { font-size:48px;color:var(--text-tertiary);opacity:0.4; }
      p { font-size:15px;color:var(--text-secondary); }
    }
  `],
})
export class MinhasConsultasComponent implements OnInit {
  private consultaSvc = inject(ConsultaService);
  private auth = inject(AuthService);
  consultas = signal<Consulta[]>([]);
  ngOnInit(): void {
    const pacienteId = this.auth.utilizadorAtual()?.pacienteId ?? 'pac001';
    this.consultaSvc.listar({ pacienteId }).subscribe(c => this.consultas.set(c));
  }
  getDia(d: string): string { return new Date(d).getDate().toString().padStart(2,'0'); }
  getMes(d: string): string { return new Date(d).toLocaleDateString('pt-MZ', { month:'short' }); }
  chipStatus(s: string): string {
    const m: Record<string,string> = { agendada:'chip-primary', aguardando:'chip-warning', concluida:'chip-success', cancelada:'chip-neutral', 'em-curso':'chip-secondary' };
    return m[s] ?? 'chip-neutral';
  }
  labelStatus(s: string): string {
    const m: Record<string,string> = { agendada:'Agendada', aguardando:'Aguardando', concluida:'Concluída', cancelada:'Cancelada', 'em-curso':'Em Curso' };
    return m[s] ?? s;
  }
  labelTipo(t: string): string {
    const m: Record<string,string> = { 'consulta':'Consulta', 'pré-natal':'Pré-Natal', 'urgência':'Urgência', 'revisão':'Revisão', 'follow-up':'Follow-Up' };
    return m[t] ?? t;
  }
}
