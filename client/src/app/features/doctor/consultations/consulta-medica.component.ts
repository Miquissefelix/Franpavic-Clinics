import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClinicaService } from '../../../core/services/clinica.service';
import { PrescricaoService } from '../../../core/services/prescricao.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { ConsultaService } from '../../../core/services/consulta.service';
import { Paciente, Consulta, Triagem, RegistoClinico } from '../../../core/models';
import { TriagemService } from '../../../core/services/triagem.service';

@Component({
  selector: 'app-consulta-medica',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatTabsModule, MatChipsModule, MatDividerModule, MatSnackBarModule,
  ],
  template: `
    <div class="page-enter">
      @if (carregando()) {
        <div class="skeleton" style="height:400px;border-radius:16px"></div>
      } @else if (consulta()) {
        <!-- Header -->
        <div class="page-header mb-6">
          <div class="flex items-center gap-3">
            <button mat-icon-button routerLink="/medico/consultas">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div>
              <h1 class="text-2xl font-bold">Consulta Médica</h1>
              <p class="text-secondary text-sm">{{ consulta()!.data | date:'dd/MM/yyyy' }} · {{ consulta()!.hora }} · {{ consulta()!.especialidade }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button mat-stroked-button (click)="salvar()">
              <mat-icon>save</mat-icon> Salvar Rascunho
            </button>
            <button mat-flat-button color="primary" (click)="concluir()">
              <mat-icon>check_circle</mat-icon> Concluir Consulta
            </button>
          </div>
        </div>

        <div class="consulta-layout">
          <!-- Coluna Esquerda: Paciente -->
          <div class="coluna-paciente">
            @if (paciente()) {
              <div class="card p-4 mb-4">
                <div class="flex items-center gap-3 mb-3">
                  <div class="pac-avatar">{{ iniciais(paciente()!.nome) }}</div>
                  <div>
                    <p class="font-semibold">{{ paciente()!.nome }}</p>
                    <p class="text-xs text-secondary">{{ paciente()!.numeroPaciente }} · {{ calcularIdade(paciente()!.dataNascimento) }} anos</p>
                  </div>
                </div>
                <div class="vitals-summary">
                  <div class="vital-badge"><mat-icon>bloodtype</mat-icon><span class="chip chip-danger">{{ paciente()!.tipoSanguineo }}</span></div>
                  @if (paciente()!.alergias.length > 0) {
                    <div class="vital-badge">
                      <mat-icon style="color:var(--color-warning-500)">warning</mat-icon>
                      <span class="text-xs text-warning">{{ paciente()!.alergias.join(', ') }}</span>
                    </div>
                  }
                </div>
              </div>

              @if (triagem()) {
                <div class="card p-4 mb-4">
                  <h4 class="font-semibold mb-3 flex items-center gap-2">
                    <mat-icon>monitor_heart</mat-icon> Triagem
                    <span class="chip chip-sm" [ngClass]="'chip-' + escalaColor(triagem()!.escalaTriagem)">{{ triagem()!.escalaTriagem | titlecase }}</span>
                  </h4>
                  <div class="vitals-grid">
                    <div class="vital-item"><span class="vl">TA</span><span class="vv">{{ triagem()!.pressaoArterial.sistolica }}/{{ triagem()!.pressaoArterial.diastolica }}</span><span class="vu">mmHg</span></div>
                    <div class="vital-item"><span class="vl">FC</span><span class="vv">{{ triagem()!.frequenciaCardiaca }}</span><span class="vu">bpm</span></div>
                    <div class="vital-item"><span class="vl">Temp</span><span class="vv">{{ triagem()!.temperatura }}</span><span class="vu">°C</span></div>
                    <div class="vital-item"><span class="vl">SpO₂</span><span class="vv">{{ triagem()!.saturacaoOxigenio }}</span><span class="vu">%</span></div>
                    <div class="vital-item"><span class="vl">Peso</span><span class="vv">{{ triagem()!.peso }}</span><span class="vu">kg</span></div>
                    <div class="vital-item"><span class="vl">IMC</span><span class="vv">{{ triagem()!.imc }}</span><span class="vu">kg/m²</span></div>
                  </div>
                  <p class="text-xs text-secondary mt-2">{{ triagem()!.queixaPrincipal }}</p>
                </div>
              }
            }
          </div>

          <!-- Coluna Direita: Formulário Clínico -->
          <div class="coluna-clinica">
            <mat-tab-group animationDuration="150ms">
              <!-- Anamnese -->
              <mat-tab label="Anamnese">
                <div class="tab-form-content">
                  <form [formGroup]="form">
                    <mat-form-field appearance="outline">
                      <mat-label>Queixas / História da Doença Actual</mat-label>
                      <textarea matInput formControlName="queixas" rows="4" placeholder="Descreva as queixas do paciente..."></textarea>
                    </mat-form-field>
                    <div class="form-grid mt-3">
                      <mat-form-field appearance="outline">
                        <mat-label>Diagnóstico Principal (CID)</mat-label>
                        <input matInput formControlName="diagnosticoCodigo" placeholder="Ex: I10">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Descrição do Diagnóstico</mat-label>
                        <input matInput formControlName="diagnosticoDescricao" placeholder="Ex: Hipertensão Essencial">
                      </mat-form-field>
                    </div>
                    <mat-form-field appearance="outline">
                      <mat-label>Observações Clínicas</mat-label>
                      <textarea matInput formControlName="observacoes" rows="3"></textarea>
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Plano de Seguimento</mat-label>
                      <textarea matInput formControlName="planoSeguimento" rows="2" placeholder="Retornar em 30 dias..."></textarea>
                    </mat-form-field>
                  </form>
                </div>
              </mat-tab>

              <!-- Prescrição -->
              <mat-tab label="Prescrição">
                <div class="tab-form-content">
                  <div class="section-header mb-3">
                    <h3>Medicamentos Prescritos</h3>
                    <button mat-stroked-button (click)="adicionarMedicamento()">
                      <mat-icon>add</mat-icon> Adicionar
                    </button>
                  </div>
                  @for (med of medicamentos(); track $index) {
                    <div class="med-form-card card p-3 mb-2">
                      <div class="form-grid cols-3">
                        <mat-form-field appearance="outline">
                          <mat-label>Medicamento</mat-label>
                          <input matInput [(ngModel)]="med.nome" placeholder="Nome do medicamento">
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Dose</mat-label>
                          <input matInput [(ngModel)]="med.dose" placeholder="Ex: 10mg">
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Via</mat-label>
                          <input matInput [(ngModel)]="med.via" placeholder="Oral / IV">
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Frequência</mat-label>
                          <input matInput [(ngModel)]="med.frequencia" placeholder="1x/dia">
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Duração</mat-label>
                          <input matInput [(ngModel)]="med.duracao" placeholder="7 dias">
                        </mat-form-field>
                      </div>
                      <button mat-icon-button color="warn" (click)="removerMedicamento($index)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  }
                  @if (medicamentos().length === 0) {
                    <div class="empty-state-sm">
                      <mat-icon>medication</mat-icon>
                      <p>Nenhum medicamento adicionado</p>
                    </div>
                  }
                  <div class="mt-4">
                    <button mat-flat-button color="primary" (click)="emitirPrescricao()">
                      <mat-icon>receipt_long</mat-icon> Emitir Prescrição
                    </button>
                  </div>
                </div>
              </mat-tab>

              <!-- Laboratório -->
              <mat-tab label="Laboratório">
                <div class="tab-form-content">
                  <div class="section-header mb-3">
                    <h3>Pedido de Exames</h3>
                    <button mat-stroked-button (click)="adicionarExame()">
                      <mat-icon>add</mat-icon> Adicionar
                    </button>
                  </div>
                  @for (exame of exames(); track $index) {
                    <div class="flex items-center gap-2 mb-2">
                      <mat-form-field appearance="outline" style="flex:1;margin-bottom:-16px">
                        <input matInput [(ngModel)]="exames()[$index]" placeholder="Ex: Hemograma Completo">
                      </mat-form-field>
                      <button mat-icon-button color="warn" (click)="removerExame($index)"><mat-icon>delete</mat-icon></button>
                    </div>
                  }
                  @if (exames().length > 0) {
                    <div class="mt-4">
                      <button mat-flat-button color="primary" (click)="pedirExames()">
                        <mat-icon>biotech</mat-icon> Enviar Pedido
                      </button>
                    </div>
                  }
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .consulta-layout { display:grid;grid-template-columns:320px 1fr;gap:20px; @media(max-width:900px){grid-template-columns:1fr;} }
    .pac-avatar { width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--color-primary-500),var(--color-secondary-500));color:white;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .vitals-summary { display:flex;flex-direction:column;gap:6px; }
    .vital-badge { display:flex;align-items:center;gap:6px; mat-icon { font-size:16px; } }
    .vitals-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:10px; }
    .vital-item { background:var(--surface-input);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:2px;
      .vl { font-size:10px;font-weight:600;text-transform:uppercase;color:var(--text-tertiary); }
      .vv { font-size:18px;font-weight:700;color:var(--text-primary);line-height:1.2; }
      .vu { font-size:10px;color:var(--text-tertiary); }
    }
    .tab-form-content { padding:20px 0;display:flex;flex-direction:column;gap:12px; }
    .med-form-card { position:relative; }
    mat-form-field { width:100%; }
    .empty-state-sm { display:flex;flex-direction:column;align-items:center;gap:8px;padding:32px;color:var(--text-tertiary);
      mat-icon { font-size:36px;opacity:0.4; }
      p { font-size:13px; }
    }
    .page-header { display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px; }
  `],
})
export class ConsultaMedicaComponent implements OnInit {
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private fb          = inject(FormBuilder);
  private clinicaSvc  = inject(ClinicaService);
  private prescSvc    = inject(PrescricaoService);
  private pacienteSvc = inject(PacienteService);
  private consultaSvc = inject(ConsultaService);
  private triagemSvc  = inject(TriagemService);
  private snack       = inject(MatSnackBar);

  consulta   = signal<Consulta | null>(null);
  paciente   = signal<Paciente | null>(null);
  triagem    = signal<Triagem | null>(null);
  carregando = signal(true);
  medicamentos = signal<any[]>([]);
  exames       = signal<string[]>([]);

  form = this.fb.group({
    queixas:              ['', Validators.required],
    diagnosticoCodigo:    [''],
    diagnosticoDescricao: [''],
    observacoes:          [''],
    planoSeguimento:      [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.consultaSvc.buscarPorId(id).subscribe(c => {
      this.consulta.set(c ?? null);
      this.carregando.set(false);
      if (c) {
        this.pacienteSvc.buscarPorId(c.pacienteId).subscribe(p => this.paciente.set(p ?? null));
        this.triagemSvc.buscarPorConsulta(c.id).subscribe(t => this.triagem.set(t ?? null));
        this.form.patchValue({ queixas: c.motivo });
      }
    });
  }

  adicionarMedicamento(): void {
    this.medicamentos.update(list => [...list, { nome:'', dose:'', via:'', frequencia:'', duracao:'' }]);
  }
  removerMedicamento(i: number): void {
    this.medicamentos.update(list => list.filter((_,idx) => idx !== i));
  }
  adicionarExame(): void { this.exames.update(list => [...list, '']); }
  removerExame(i: number): void { this.exames.update(list => list.filter((_,idx) => idx !== i)); }

  emitirPrescricao(): void {
    this.snack.open('Prescrição emitida com sucesso!', '', { duration: 3000 });
  }

  pedirExames(): void {
    this.snack.open('Pedido de exames enviado!', '', { duration: 3000 });
  }

  salvar(): void {
    this.snack.open('Rascunho guardado!', '', { duration: 2000 });
  }

  concluir(): void {
    const id = this.consulta()?.id ?? '';
    this.consultaSvc.atualizarStatus(id, 'concluida').subscribe(() => {
      this.snack.open('Consulta concluída com sucesso!', '', { duration: 3000 });
      this.router.navigate(['/medico/consultas']);
    });
  }

  iniciais(n: string): string { return n.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase(); }
  calcularIdade(dob: string): number { return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25*24*3600*1000)); }
  escalaColor(e: string): string {
    const m: Record<string,string> = { vermelho:'danger', laranja:'warning', amarelo:'warning', verde:'success', azul:'primary' };
    return m[e] ?? 'neutral';
  }
}
