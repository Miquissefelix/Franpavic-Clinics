import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TriagemService } from '../../../core/services/triagem.service';

@Component({
  selector: 'app-form-triagem',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  template: `
    <div class="form-container">
      <header class="form-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1>Triagem de Paciente</h1>
          <p>Registo de sinais vitais e avaliação inicial.</p>
        </div>
      </header>

      <form [formGroup]="triagemForm" (ngSubmit)="onSubmit()" class="premium-form">
        
        <section class="form-section">
          <h2 class="section-title">Identificação do Paciente</h2>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>ID do Paciente</mat-label>
            <input matInput formControlName="pacienteId" placeholder="Ex: PAC-2023-001">
            <mat-icon matPrefix>person_search</mat-icon>
            <mat-hint>Pesquise ou insira o ID do paciente</mat-hint>
          </mat-form-field>
        </section>

        <section class="form-section">
          <h2 class="section-title">Sinais Vitais</h2>
          <div class="vitals-grid">
            <mat-form-field appearance="outline">
              <mat-label>Peso (kg)</mat-label>
              <input matInput type="number" formControlName="peso">
              <mat-icon matSuffix>scale</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Altura (cm)</mat-label>
              <input matInput type="number" formControlName="altura">
              <mat-icon matSuffix>height</mat-icon>
            </mat-form-field>

            <div class="imc-display" [ngClass]="imcColorClass">
              <span class="imc-label">IMC</span>
              <span class="imc-value">{{ imcValue | number:'1.1-1' }}</span>
              <span class="imc-status">{{ imcStatus }}</span>
            </div>

            <mat-form-field appearance="outline" [class.alert-field]="isTemperaturaElevada">
              <mat-label>Temperatura (°C)</mat-label>
              <input matInput type="number" formControlName="temperatura">
              <mat-icon matSuffix [class.text-danger]="isTemperaturaElevada">thermostat</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" [class.alert-field]="isPressaoElevada">
              <mat-label>Pressão Arterial</mat-label>
              <input matInput formControlName="pressaoArterial" placeholder="Ex: 120/80">
              <mat-icon matSuffix [class.text-danger]="isPressaoElevada">favorite</mat-icon>
              <mat-hint>Sistólica / Diastólica</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Frequência Cardíaca (bpm)</mat-label>
              <input matInput type="number" formControlName="frequenciaCardiaca">
              <mat-icon matSuffix>monitor_heart</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Saturação Oxigênio (%)</mat-label>
              <input matInput type="number" formControlName="saturacaoOxigenio">
              <mat-icon matSuffix>air</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Glicemia (mg/dL)</mat-label>
              <input matInput type="number" formControlName="glicemia">
              <mat-icon matSuffix>bloodtype</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Freq. Respiratória</mat-label>
              <input matInput type="number" formControlName="frequenciaRespiratoria">
              <mat-icon matSuffix>pulmonology</mat-icon>
            </mat-form-field>
          </div>
        </section>

        <section class="form-section">
          <h2 class="section-title">Avaliação Clínica</h2>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Queixa Principal</mat-label>
            <textarea matInput formControlName="queixaPrincipal" rows="3"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Observações</mat-label>
            <textarea matInput formControlName="observacoes" rows="2"></textarea>
          </mat-form-field>
        </section>

        <section class="form-section scale-section">
          <h2 class="section-title">Classificação de Risco (Manchester)</h2>
          <div class="scale-selector">
            @for (escala of escalas; track escala.nome) {
              <div class="scale-card" 
                   [class.selected]="triagemForm.get('escalaTriagem')?.value === escala.nome"
                   [ngStyle]="{'--accent-color': escala.cor, '--bg-color': escala.bg}"
                   (click)="triagemForm.get('escalaTriagem')?.setValue(escala.nome)">
                <div class="scale-header">
                  <span class="scale-dot" [style.backgroundColor]="escala.cor"></span>
                  <strong>{{ escala.nome }}</strong>
                </div>
                <p>{{ escala.desc }}</p>
              </div>
            }
          </div>
        </section>

        <div class="form-actions">
          <button mat-stroked-button type="button" (click)="goBack()">Cancelar</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="triagemForm.invalid" class="submit-btn">
            <mat-icon>save</mat-icon> Registar Triagem
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container { max-width: 900px; margin: 0 auto; padding: 32px 24px; }
    .form-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .form-header h1 { margin: 0; font-size: 28px; font-weight: 700; color: var(--color-gray-900, #111827); letter-spacing: -0.02em; }
    .form-header p { margin: 4px 0 0; color: var(--color-gray-500, #6b7280); font-size: 15px; }
    
    .premium-form { background: white; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01); padding: 32px; border: 1px solid var(--color-gray-100, #f3f4f6); }
    .form-section { margin-bottom: 32px; }
    .section-title { font-size: 18px; font-weight: 600; color: var(--color-gray-800, #1f2937); margin-bottom: 20px; padding-bottom: 8px; border-bottom: 2px solid var(--color-gray-100, #f3f4f6); }
    
    .w-full { width: 100%; }
    .vitals-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    
    ::ng-deep .mat-mdc-form-field-icon-suffix { color: var(--color-gray-400); }
    
    /* IMC Display */
    .imc-display { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 12px; border-radius: 8px; background: var(--color-gray-50); border: 1px solid var(--color-gray-200); height: calc(100% - 22px); margin-bottom: 22px; transition: all 0.3s; }
    .imc-label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--color-gray-500); }
    .imc-value { font-size: 24px; font-weight: 700; line-height: 1.2; }
    .imc-status { font-size: 13px; font-weight: 500; }
    
    .imc-bg-normal { background-color: #f0fdf4; border-color: #bbf7d0; color: #166534; }
    .imc-bg-warning { background-color: #fefce8; border-color: #fef08a; color: #854d0e; }
    .imc-bg-danger { background-color: #fef2f2; border-color: #fecaca; color: #991b1b; }
    
    /* Alert Fields */
    .alert-field ::ng-deep .mdc-notched-outline__leading,
    .alert-field ::ng-deep .mdc-notched-outline__notch,
    .alert-field ::ng-deep .mdc-notched-outline__trailing { border-color: #ef4444 !important; border-width: 2px; }
    .alert-field ::ng-deep .mat-mdc-form-field-focus-overlay { background-color: rgba(239, 68, 68, 0.05); }
    .text-danger { color: #ef4444 !important; }

    /* Scale Selector */
    .scale-selector { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
    .scale-card { border: 2px solid var(--color-gray-200, #e5e7eb); border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s; background: white; }
    .scale-card:hover { border-color: var(--color-gray-300); transform: translateY(-2px); }
    .scale-card.selected { border-color: var(--accent-color); background-color: var(--bg-color); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .scale-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 16px; }
    .scale-dot { width: 12px; height: 12px; border-radius: 50%; }
    .scale-card p { margin: 0; font-size: 12px; color: var(--color-gray-600, #4b5563); }

    .form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--color-gray-100, #f3f4f6); }
    .submit-btn { padding: 0 32px; height: 48px; font-size: 16px; border-radius: 24px; }
  `]
})
export class FormTriagemComponent implements OnInit {
  private fb = inject(FormBuilder);
  private triagemService = inject(TriagemService);
  private snackBar = inject(MatSnackBar);
  private location = inject(Location);

  triagemForm = this.fb.group({
    pacienteId: ['', Validators.required],
    peso: [null as number | null],
    altura: [null as number | null],
    temperatura: [null as number | null, Validators.required],
    pressaoArterial: ['', Validators.required],
    frequenciaCardiaca: [null as number | null, Validators.required],
    saturacaoOxigenio: [null as number | null],
    glicemia: [null as number | null],
    frequenciaRespiratoria: [null as number | null],
    queixaPrincipal: ['', Validators.required],
    observacoes: [''],
    escalaTriagem: ['', Validators.required]
  });

  escalas = [
    { nome: 'Vermelho', desc: 'Emergência. Atendimento imediato.', cor: '#ef4444', bg: '#fef2f2' },
    { nome: 'Laranja', desc: 'Muito Urgente. Atendimento em 10 min.', cor: '#f97316', bg: '#fff7ed' },
    { nome: 'Amarelo', desc: 'Urgente. Atendimento em 60 min.', cor: '#eab308', bg: '#fefce8' },
    { nome: 'Verde', desc: 'Pouco Urgente. Atendimento em 120 min.', cor: '#22c55e', bg: '#f0fdf4' },
    { nome: 'Azul', desc: 'Não Urgente. Atendimento em 240 min.', cor: '#3b82f6', bg: '#eff6ff' }
  ];

  get imcValue(): number {
    const p = this.triagemForm.get('peso')?.value;
    const a = this.triagemForm.get('altura')?.value;
    if (p && a) {
      const altM = a / 100;
      return p / (altM * altM);
    }
    return 0;
  }

  get imcStatus(): string {
    const val = this.imcValue;
    if (!val) return '---';
    if (val < 18.5) return 'Baixo';
    if (val < 25) return 'Normal';
    if (val < 30) return 'Sobrepeso';
    return 'Obesidade';
  }

  get imcColorClass(): string {
    const val = this.imcValue;
    if (!val) return '';
    if (val < 25) return 'imc-bg-normal';
    if (val < 30) return 'imc-bg-warning';
    return 'imc-bg-danger';
  }

  get isTemperaturaElevada(): boolean {
    const t = this.triagemForm.get('temperatura')?.value;
    return t != null && t > 37.5;
  }

  get isPressaoElevada(): boolean {
    const pa = this.triagemForm.get('pressaoArterial')?.value;
    if (!pa) return false;
    const parts = pa.split('/');
    if (parts.length === 2) {
      const sis = parseInt(parts[0], 10);
      const dia = parseInt(parts[1], 10);
      return sis > 139 || dia > 89;
    }
    return false;
  }

  ngOnInit() {}

  onSubmit() {
    if (this.triagemForm.valid) {
      this.triagemService.criar(this.triagemForm.value as any).subscribe({
        next: () => {
          this.snackBar.open('Triagem registada com sucesso!', 'Fechar', { duration: 3000, panelClass: 'success-snackbar' });
          this.goBack();
        },
        error: () => {
          this.snackBar.open('Erro ao registar triagem.', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }
}
