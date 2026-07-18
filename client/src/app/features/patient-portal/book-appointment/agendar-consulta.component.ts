import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MedicoService } from '../../../core/services/medico.service';
import { ConsultaService } from '../../../core/services/consulta.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Especialidade, Medico } from '../../../core/models';

@Component({
  selector: 'app-agendar-consulta',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatStepperModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  template: `
    <div class="page-enter">
      <div class="page-header mb-6">
        <div><h1 class="text-3xl font-bold">Agendar Consulta</h1><p class="text-secondary mt-1">Escolha a especialidade, médico e horário</p></div>
      </div>

      <div class="card p-6">
        <mat-stepper [linear]="true" #stepper>
          <!-- Step 1: Especialidade -->
          <mat-step label="Especialidade">
            <h3 class="mb-4">Escolha a Especialidade</h3>
            <div class="specialty-grid">
              @for (esp of especialidades(); track esp.id) {
                <div class="specialty-card" [class.selected]="especialidadeSelecionada()?.id === esp.id" (click)="selecionarEspecialidade(esp)">
                  <mat-icon>{{ iconEspecialidade(esp.nome) }}</mat-icon>
                  <span>{{ esp.nome }}</span>
                </div>
              }
            </div>
            <div class="step-actions">
              <button mat-flat-button color="primary" matStepperNext [disabled]="!especialidadeSelecionada()">
                Próximo <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </mat-step>

          <!-- Step 2: Médico -->
          <mat-step label="Médico">
            <h3 class="mb-4">Escolha o Médico</h3>
            <div class="medico-grid">
              @for (m of medicosFiltrados(); track m.id) {
                <div class="medico-card" [class.selected]="medicoSelecionado()?.id === m.id" (click)="selecionarMedico(m)">
                  <div class="medico-avatar-sm">{{ iniciais(m.nome) }}</div>
                  <div class="medico-card-info">
                    <p class="font-semibold text-sm">{{ m.nome }}</p>
                    <p class="text-xs text-secondary">{{ m.crm }}</p>
                    <div class="flex items-center gap-1 mt-1">
                      <mat-icon style="font-size:13px;color:#f59e0b;width:13px;height:13px">star</mat-icon>
                      <span class="text-xs">{{ m.avaliacao }}</span>
                      <span class="text-xs text-tertiary ml-1">{{ m.consultas }} consultas</span>
                    </div>
                  </div>
                </div>
              }
            </div>
            <div class="step-actions">
              <button mat-stroked-button matStepperPrevious>Anterior</button>
              <button mat-flat-button color="primary" matStepperNext [disabled]="!medicoSelecionado()">
                Próximo <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </mat-step>

          <!-- Step 3: Data & Hora -->
          <mat-step label="Data e Hora">
            <h3 class="mb-4">Escolha a Data e Horário</h3>
            <div class="date-time-section">
              <mat-form-field appearance="outline">
                <mat-label>Data</mat-label>
                <input matInput type="date" [(ngModel)]="dataSelecionada" (change)="carregarHorarios()">
              </mat-form-field>
              @if (horarios().length > 0) {
                <div class="horarios-grid">
                  @for (h of horarios(); track h) {
                    <button class="horario-btn" [class.selected]="horaSelecionada() === h" (click)="selecionarHora(h)">
                      {{ h }}
                    </button>
                  }
                </div>
              }
            </div>
            <div class="step-actions">
              <button mat-stroked-button matStepperPrevious>Anterior</button>
              <button mat-flat-button color="primary" matStepperNext [disabled]="!horaSelecionada()">
                Próximo <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </mat-step>

          <!-- Step 4: Confirmação -->
          <mat-step label="Confirmar">
            <h3 class="mb-4">Confirmar Agendamento</h3>
            <div class="confirmacao-card card p-4 mb-4">
              <div class="confirm-row"><mat-icon>healing</mat-icon><div><span class="conf-label">Especialidade</span><span class="conf-value">{{ especialidadeSelecionada()?.nome }}</span></div></div>
              <div class="confirm-row"><mat-icon>person</mat-icon><div><span class="conf-label">Médico</span><span class="conf-value">{{ medicoSelecionado()?.nome }}</span></div></div>
              <div class="confirm-row"><mat-icon>calendar_today</mat-icon><div><span class="conf-label">Data e Hora</span><span class="conf-value">{{ dataSelecionada }} às {{ horaSelecionada() }}</span></div></div>
              <div class="confirm-row"><mat-icon>payments</mat-icon><div><span class="conf-label">Valor Estimado</span><span class="conf-value" style="color:var(--color-success-600)">1.500 MZN</span></div></div>
            </div>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Motivo da Consulta</mat-label>
              <input matInput [(ngModel)]="motivo" placeholder="Descreva brevemente o motivo da consulta">
            </mat-form-field>
            <div class="step-actions">
              <button mat-stroked-button matStepperPrevious>Anterior</button>
              <button mat-flat-button color="primary" (click)="confirmar()" [disabled]="agendando()">
                @if (agendando()) { <span>Agendando...</span> }
                @else { <mat-icon>check</mat-icon> Confirmar Agendamento }
              </button>
            </div>
          </mat-step>
        </mat-stepper>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px; }
    .specialty-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:16px; }
    .specialty-card { display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px;border-radius:12px;border:1px solid var(--border-color);background:var(--surface-input);cursor:pointer;transition:var(--transition-fast);text-align:center;font-size:12px;font-weight:500;
      mat-icon { font-size:28px;color:var(--text-tertiary); }
      &:hover { border-color:var(--color-primary-400);background:var(--color-primary-50); mat-icon { color:var(--color-primary-600); } }
      &.selected { border-color:var(--color-primary-600);background:var(--color-primary-50);box-shadow:0 0 0 2px var(--color-primary-300); mat-icon { color:var(--color-primary-600); } }
    }
    .medico-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:16px; }
    .medico-card { display:flex;gap:12px;padding:14px;border-radius:12px;border:1px solid var(--border-color);background:var(--surface-input);cursor:pointer;transition:var(--transition-fast);
      &:hover { border-color:var(--color-primary-400);background:var(--color-primary-50); }
      &.selected { border-color:var(--color-primary-600);background:var(--color-primary-50);box-shadow:0 0 0 2px var(--color-primary-300); }
    }
    .medico-avatar-sm { width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--color-primary-500),var(--color-secondary-500));color:white;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .medico-card-info { flex:1;min-width:0; }
    .date-time-section { display:flex;flex-direction:column;gap:16px;max-width:400px;margin-bottom:16px; }
    .horarios-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:8px; }
    .horario-btn { padding:8px;border-radius:8px;border:1px solid var(--border-color);background:var(--surface-input);cursor:pointer;font-size:13px;font-weight:500;transition:var(--transition-fast);
      &:hover { border-color:var(--color-primary-400);background:var(--color-primary-50);color:var(--color-primary-700); }
      &.selected { background:var(--color-primary-600);color:white;border-color:var(--color-primary-600); }
    }
    .confirmacao-card { display:flex;flex-direction:column;gap:12px; }
    .confirm-row { display:flex;align-items:center;gap:10px; mat-icon { color:var(--color-primary-600); } }
    .conf-label { font-size:11px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.05em;display:block; }
    .conf-value { font-size:14px;font-weight:600;color:var(--text-primary);display:block; }
    .step-actions { display:flex;gap:8px;justify-content:flex-end;padding-top:16px;margin-top:16px;border-top:1px solid var(--border-color); }
  `],
})
export class AgendarConsultaComponent implements OnInit {
  private medicoSvc  = inject(MedicoService);
  private consultaSvc = inject(ConsultaService);
  private auth       = inject(AuthService);
  private router     = inject(Router);
  private snack      = inject(MatSnackBar);

  especialidades        = signal<Especialidade[]>([]);
  medicosFiltrados      = signal<Medico[]>([]);
  horarios              = signal<string[]>([]);
  especialidadeSelecionada = signal<Especialidade | null>(null);
  medicoSelecionado     = signal<Medico | null>(null);
  horaSelecionada       = signal<string | null>(null);
  agendando             = signal(false);
  dataSelecionada       = '';
  motivo                = '';

  ngOnInit(): void {
    this.medicoSvc.listarEspecialidades().subscribe(e => this.especialidades.set(e));
  }

  selecionarEspecialidade(esp: Especialidade): void {
    this.especialidadeSelecionada.set(esp);
    this.medicoSelecionado.set(null);
    this.medicoSvc.listar({ especialidadeId: esp.id }).subscribe(m => this.medicosFiltrados.set(m));
  }

  selecionarMedico(m: Medico): void { this.medicoSelecionado.set(m); }
  selecionarHora(h: string): void   { this.horaSelecionada.set(h); }

  carregarHorarios(): void {
    if (this.medicoSelecionado() && this.dataSelecionada) {
      this.medicoSvc.horariosDisponiveis(this.medicoSelecionado()!.id, this.dataSelecionada).subscribe(h => this.horarios.set(h));
    }
  }

  confirmar(): void {
    if (!this.especialidadeSelecionada() || !this.medicoSelecionado() || !this.dataSelecionada || !this.horaSelecionada()) return;
    this.agendando.set(true);
    const pacienteId = this.auth.utilizadorAtual()?.pacienteId ?? 'pac001';
    this.consultaSvc.criar({
      pacienteId,
      medicoId: this.medicoSelecionado()!.id,
      data: this.dataSelecionada,
      hora: this.horaSelecionada()!,
      tipo: 'consulta',
      especialidade: this.especialidadeSelecionada()!.nome,
      status: 'agendada',
      motivo: this.motivo || 'Consulta de rotina',
      sala: 'A1', duracaoMinutos: 30, valorConsulta: 1500,
    }).subscribe(() => {
      this.agendando.set(false);
      this.snack.open('Consulta agendada com sucesso!', '', { duration: 3000 });
      this.router.navigate(['/portal/consultas']);
    });
  }

  iniciais(n: string): string { return n.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase(); }

  iconEspecialidade(nome: string): string {
    const m: Record<string,string> = {
      'Clínica Geral':'medical_services','Cardiologia':'favorite','Ginecologia':'pregnant_woman',
      'Pediatria':'child_care','Ortopedia':'accessibility','Endocrinologia':'science',
      'Neurologia':'psychology','Psiquiatria':'self_improvement','Medicina Interna':'local_hospital',
      'Dermatologia':'face',
    };
    return m[nome] ?? 'healing';
  }
}
