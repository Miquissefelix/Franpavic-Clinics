import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { ClinicaService } from '../../../core/services/clinica.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { ConsultaService } from '../../../core/services/consulta.service';
import { PrescricaoService } from '../../../core/services/prescricao.service';
import { Paciente, RegistoClinico, Prescricao, ResultadoLaboratorio } from '../../../core/models';

@Component({
  selector: 'app-emr-paciente',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatIconModule, MatButtonModule,
    MatTabsModule, MatChipsModule, MatCardModule, MatExpansionModule,
  ],
  template: `
    <div class="page-enter">
      @if (carregando()) {
        <div class="skeleton-header">
          <div class="skeleton" style="height:120px;border-radius:16px"></div>
        </div>
      } @else if (paciente()) {
        <!-- Cabeçalho do Paciente -->
        <div class="patient-header card mb-6">
          <div class="patient-header-content">
            <div class="patient-avatar-lg">{{ iniciais(paciente()!.nome) }}</div>
            <div class="patient-main-info">
              <div class="flex items-center gap-3 flex-wrap">
                <h1 class="text-2xl font-bold">{{ paciente()!.nome }}</h1>
                <span class="chip" [ngClass]="paciente()!.status === 'ativo' ? 'chip-success' : 'chip-neutral'">
                  {{ paciente()!.status === 'ativo' ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <p class="text-secondary mt-1">{{ paciente()!.numeroPaciente }} · {{ paciente()!.genero }} · {{ calcularIdade(paciente()!.dataNascimento) }} anos</p>
              <div class="patient-quick-stats mt-3">
                <div class="quick-stat">
                  <mat-icon>bloodtype</mat-icon>
                  <span class="chip chip-danger">{{ paciente()!.tipoSanguineo }}</span>
                </div>
                <div class="quick-stat">
                  <mat-icon>phone</mat-icon>
                  <span class="text-sm">{{ paciente()!.telefone }}</span>
                </div>
                @if (paciente()!.alergias.length > 0) {
                  <div class="quick-stat">
                    <mat-icon style="color:var(--color-warning-600)">warning</mat-icon>
                    <span class="text-sm text-warning font-medium">{{ paciente()!.alergias.join(', ') }}</span>
                  </div>
                }
              </div>
            </div>
            <div class="patient-actions">
              <button mat-stroked-button [routerLink]="['/recepcao/pacientes', paciente()!.id, 'editar']">
                <mat-icon>edit</mat-icon> Editar
              </button>
              <button mat-flat-button color="primary" routerLink="/recepcao/consultas/nova">
                <mat-icon>event_available</mat-icon> Agendar
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs do EMR -->
        <mat-tab-group animationDuration="200ms">
          <!-- Resumo Clínico -->
          <mat-tab label="Resumo">
            <div class="tab-content">
              <div class="data-grid">
                <div class="card p-4">
                  <h3 class="mb-4">Informações Pessoais</h3>
                  <div class="info-grid">
                    <div class="info-item"><span class="info-label">Data Nascimento</span><span class="info-value">{{ formatarData(paciente()!.dataNascimento) }}</span></div>
                    <div class="info-item"><span class="info-label">B.I.</span><span class="info-value">{{ paciente()!.bi ?? '—' }}</span></div>
                    <div class="info-item"><span class="info-label">NUIT</span><span class="info-value">{{ paciente()!.nuit ?? '—' }}</span></div>
                    <div class="info-item"><span class="info-label">Género</span><span class="info-value capitalize">{{ paciente()!.genero }}</span></div>
                    <div class="info-item"><span class="info-label">Email</span><span class="info-value">{{ paciente()!.email ?? '—' }}</span></div>
                    <div class="info-item"><span class="info-label">Endereço</span><span class="info-value">{{ paciente()!.bairro }}, {{ paciente()!.cidade }}</span></div>
                  </div>
                </div>
                <div class="card p-4">
                  <h3 class="mb-4">Contacto de Emergência</h3>
                  <div class="info-grid">
                    <div class="info-item"><span class="info-label">Nome</span><span class="info-value">{{ paciente()!.contatoEmergencia.nome }}</span></div>
                    <div class="info-item"><span class="info-label">Parentesco</span><span class="info-value">{{ paciente()!.contatoEmergencia.parentesco }}</span></div>
                    <div class="info-item"><span class="info-label">Telefone</span><span class="info-value">{{ paciente()!.contatoEmergencia.telefone }}</span></div>
                  </div>
                  @if (paciente()!.seguro) {
                    <h3 class="mb-3 mt-4">Seguro de Saúde</h3>
                    <div class="info-grid">
                      <div class="info-item"><span class="info-label">Seguradora</span><span class="info-value">{{ paciente()!.seguro!.empresa }}</span></div>
                      <div class="info-item"><span class="info-label">Número</span><span class="info-value">{{ paciente()!.seguro!.numero }}</span></div>
                      <div class="info-item"><span class="info-label">Validade</span><span class="info-value">{{ formatarData(paciente()!.seguro!.validade) }}</span></div>
                    </div>
                  }
                </div>
              </div>
              @if (paciente()!.notasMedicas) {
                <div class="card p-4 mt-4">
                  <h3 class="mb-2">Notas Médicas</h3>
                  <p class="text-secondary text-sm">{{ paciente()!.notasMedicas }}</p>
                </div>
              }
            </div>
          </mat-tab>

          <!-- Histórico de Consultas -->
          <mat-tab label="Consultas ({{ registosClinicosCount() }})">
            <div class="tab-content">
              @if (registosClinicosCount() === 0) {
                <div class="empty-state">
                  <mat-icon>event_busy</mat-icon>
                  <p>Sem registos de consultas</p>
                </div>
              } @else {
                <mat-accordion>
                  @for (r of registosClinicosFiltrados(); track r.id) {
                    <mat-expansion-panel class="mb-2">
                      <mat-expansion-panel-header>
                        <mat-panel-title>
                          <div class="flex items-center gap-3">
                            <span class="font-medium">{{ formatarData(r.data) }}</span>
                            <span class="chip chip-primary text-xs">{{ r.diagnosticoPrincipal.codigo }}</span>
                          </div>
                        </mat-panel-title>
                        <mat-panel-description>{{ r.diagnosticoPrincipal.descricao }}</mat-panel-description>
                      </mat-expansion-panel-header>
                      <div class="registo-detalhe">
                        <div class="info-grid">
                          <div class="info-item"><span class="info-label">Queixas</span><span class="info-value">{{ r.queixas }}</span></div>
                          <div class="info-item"><span class="info-label">Diagnóstico</span><span class="info-value">{{ r.diagnosticoPrincipal.descricao }}</span></div>
                          <div class="info-item"><span class="info-label">Status</span>
                            <span class="chip" [ngClass]="r.status === 'concluida' ? 'chip-success' : 'chip-warning'">{{ r.status }}</span>
                          </div>
                        </div>
                        @if (r.observacoes) {
                          <div class="mt-3">
                            <span class="info-label">Observações</span>
                            <p class="text-sm mt-1">{{ r.observacoes }}</p>
                          </div>
                        }
                      </div>
                    </mat-expansion-panel>
                  }
                </mat-accordion>
              }
            </div>
          </mat-tab>

          <!-- Prescrições -->
          <mat-tab label="Prescrições">
            <div class="tab-content">
              @if (prescricoes().length === 0) {
                <div class="empty-state"><mat-icon>medication</mat-icon><p>Sem prescrições</p></div>
              }
              @for (p of prescricoes(); track p.id) {
                <div class="card p-4 mb-3">
                  <div class="flex items-center justify-between mb-3">
                    <div>
                      <span class="font-semibold text-sm">{{ formatarData(p.data) }}</span>
                      <span class="chip ml-2" [ngClass]="p.status === 'ativa' ? 'chip-success' : 'chip-neutral'">{{ p.status }}</span>
                    </div>
                    <span class="text-xs text-secondary">Válido até {{ formatarData(p.validade) }}</span>
                  </div>
                  <div class="med-list">
                    @for (m of p.medicamentos; track m.nome) {
                      <div class="med-item">
                        <mat-icon style="color:var(--color-primary-600)">medication</mat-icon>
                        <div>
                          <p class="font-medium text-sm">{{ m.nome }} {{ m.dose }}</p>
                          <p class="text-xs text-secondary">{{ m.via }} · {{ m.frequencia }} · {{ m.duracao }}</p>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </mat-tab>

          <!-- Resultados de Lab -->
          <mat-tab label="Laboratório">
            <div class="tab-content">
              @if (resultados().length === 0) {
                <div class="empty-state"><mat-icon>biotech</mat-icon><p>Sem resultados laboratoriais</p></div>
              }
              @for (r of resultados(); track r.id) {
                <div class="card p-4 mb-3">
                  <div class="flex items-center justify-between mb-3">
                    <span class="font-semibold text-sm">{{ formatarData(r.data) }}</span>
                    <span class="text-xs text-secondary">{{ r.laboratorio }}</span>
                  </div>
                  <div class="results-grid">
                    @for (item of r.resultados; track item.exame) {
                      <div class="result-item-card" [ngClass]="'result-' + item.status">
                        <span class="result-exame">{{ item.exame }}</span>
                        <span class="result-valor">{{ item.valor }} {{ item.unidade }}</span>
                        <span class="result-ref">Ref: {{ item.referencia }}</span>
                        <span class="chip text-xs" [ngClass]="chipResultado(item.status)">{{ item.status }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      } @else {
        <div class="empty-state card p-8">
          <mat-icon>person_off</mat-icon>
          <p>Paciente não encontrado</p>
          <button mat-stroked-button routerLink="/recepcao/pacientes">Voltar à lista</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .patient-header { padding: 24px; }
    .patient-header-content { display:flex; align-items:flex-start; gap:20px; flex-wrap:wrap; }
    .patient-avatar-lg {
      width:72px;height:72px;border-radius:20px;flex-shrink:0;
      background:linear-gradient(135deg,var(--color-primary-500),var(--color-secondary-500));
      color:white;font-size:22px;font-weight:700;display:flex;align-items:center;justify-content:center;
    }
    .patient-main-info { flex:1; min-width:200px; }
    .patient-quick-stats { display:flex;flex-wrap:wrap;gap:16px; }
    .quick-stat { display:flex;align-items:center;gap:6px; mat-icon { font-size:18px;color:var(--text-tertiary); } }
    .patient-actions { display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap; }

    .tab-content { padding:20px 0; }

    .info-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px; @media(max-width:600px){grid-template-columns:1fr;} }
    .info-item { display:flex;flex-direction:column;gap:2px; }
    .info-label { font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary); }
    .info-value { font-size:14px;color:var(--text-primary);font-weight:500; }

    .registo-detalhe { padding:12px 0; }

    .med-list { display:flex;flex-direction:column;gap:8px; }
    .med-item { display:flex;align-items:flex-start;gap:10px;padding:8px;background:var(--surface-input);border-radius:8px; }

    .results-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px; }
    .result-item-card { background:var(--surface-input);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:4px;border-left:3px solid var(--border-color);
      &.result-normal  { border-color:var(--color-success-500); }
      &.result-elevado { border-color:var(--color-warning-500); }
      &.result-baixo   { border-color:var(--color-info-500); }
      &.result-critico { border-color:var(--color-danger-500); }
    }
    .result-exame { font-size:12px;font-weight:600;color:var(--text-primary); }
    .result-valor { font-size:18px;font-weight:700;color:var(--text-primary); }
    .result-ref   { font-size:11px;color:var(--text-tertiary); }

    .empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;padding:48px;text-align:center;
      mat-icon { font-size:48px;color:var(--text-tertiary);opacity:0.4; }
      p { font-size:15px;color:var(--text-secondary); }
    }

    .capitalize { text-transform:capitalize; }
  `],
})
export class EmrPacienteComponent implements OnInit {
  private route       = inject(ActivatedRoute);
  private pacienteSvc = inject(PacienteService);
  private clinicaSvc  = inject(ClinicaService);
  private prescSvc    = inject(PrescricaoService);

  paciente     = signal<Paciente | null>(null);
  registos     = signal<RegistoClinico[]>([]);
  prescricoes  = signal<Prescricao[]>([]);
  resultados   = signal<ResultadoLaboratorio[]>([]);
  carregando   = signal(true);

  registosClinicosCount    = computed(() => this.registos().length);
  registosClinicosFiltrados = computed(() => this.registos());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.pacienteSvc.buscarPorId(id).subscribe(p => {
      this.paciente.set(p ?? null);
      this.carregando.set(false);
      if (p) {
        this.clinicaSvc.listarRegistos(id).subscribe(r => this.registos.set(r));
        this.prescSvc.listar({ pacienteId: id }).subscribe(pr => this.prescricoes.set(pr));
        this.clinicaSvc.listarResultados(id).subscribe(res => this.resultados.set(res));
      }
    });
  }

  iniciais(n: string): string { return n.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase(); }
  calcularIdade(dob: string): number { return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25*24*3600*1000)); }
  formatarData(d: string): string { return new Date(d).toLocaleDateString('pt-MZ'); }
  chipResultado(s: string): string {
    const m: Record<string,string> = {normal:'chip-success',elevado:'chip-warning',baixo:'chip-primary',critico:'chip-danger'};
    return m[s] ?? 'chip-neutral';
  }
}
