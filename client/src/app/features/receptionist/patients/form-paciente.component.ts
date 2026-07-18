import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PacienteService } from '../../../core/services/paciente.service';
import { Paciente } from '../../../core/models';

@Component({
  selector: 'app-form-paciente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="form-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/recepcao/pacientes" color="primary">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2>{{ isEditMode() ? 'Editar Paciente' : 'Registar Paciente' }}</h2>
      </div>

      @if (isLoading()) {
        <div class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>A carregar dados do paciente...</p>
        </div>
      } @else {
        <form [formGroup]="pacienteForm" (ngSubmit)="onSubmit()" class="paciente-form">
          <div class="form-section">
            <h3>Informações Pessoais</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline" class="col-span-2">
                <mat-label>Número do Paciente</mat-label>
                <input matInput formControlName="numeroPaciente" readonly placeholder="Gerado automaticamente">
              </mat-form-field>

              <mat-form-field appearance="outline" class="col-span-2">
                <mat-label>Nome Completo</mat-label>
                <input matInput formControlName="nome" placeholder="Ex: João Silva">
                @if (pacienteForm.get('nome')?.hasError('required') && pacienteForm.get('nome')?.touched) {
                  <mat-error>O nome é obrigatório</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Género</mat-label>
                <mat-select formControlName="genero">
                  <mat-option value="masculino">Masculino</mat-option>
                  <mat-option value="feminino">Feminino</mat-option>
                  <mat-option value="outro">Outro</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Data de Nascimento</mat-label>
                <input matInput type="date" formControlName="dataNascimento">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>BI</mat-label>
                <input matInput formControlName="bi" placeholder="Número de BI">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>NUIT</mat-label>
                <input matInput formControlName="nuit" placeholder="Número de NUIT">
              </mat-form-field>
            </div>
          </div>

          <div class="form-section">
            <h3>Contactos</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Telefone</mat-label>
                <input matInput formControlName="telefone" placeholder="Ex: +258 84 000 0000">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" placeholder="Ex: joao@email.com">
              </mat-form-field>

              <mat-form-field appearance="outline" class="col-span-2">
                <mat-label>Endereço</mat-label>
                <input matInput formControlName="endereco" placeholder="Rua, Av, etc.">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Cidade</mat-label>
                <input matInput formControlName="cidade" placeholder="Ex: Maputo">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Bairro</mat-label>
                <input matInput formControlName="bairro" placeholder="Ex: Polana">
              </mat-form-field>
            </div>
          </div>

          <div class="form-section" formGroupName="contatoEmergencia">
            <h3>Contacto de Emergência</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Nome</mat-label>
                <input matInput formControlName="nome" placeholder="Nome do contacto">
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Parentesco</mat-label>
                <input matInput formControlName="parentesco" placeholder="Ex: Irmão">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Telefone</mat-label>
                <input matInput formControlName="telefone" placeholder="Telefone de emergência">
              </mat-form-field>
            </div>
          </div>

          <div class="form-section">
            <h3>Informações Médicas</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Tipo Sanguíneo</mat-label>
                <mat-select formControlName="tipoSanguineo">
                  <mat-option value="A+">A+</mat-option>
                  <mat-option value="A-">A-</mat-option>
                  <mat-option value="B+">B+</mat-option>
                  <mat-option value="B-">B-</mat-option>
                  <mat-option value="AB+">AB+</mat-option>
                  <mat-option value="AB-">AB-</mat-option>
                  <mat-option value="O+">O+</mat-option>
                  <mat-option value="O-">O-</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="col-span-2">
                <mat-label>Alergias (separadas por vírgula)</mat-label>
                <textarea matInput formControlName="alergias" rows="2" placeholder="Ex: Penicilina, Amendoim"></textarea>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="col-span-2">
                <mat-label>Notas Médicas</mat-label>
                <textarea matInput formControlName="notasMedicas" rows="3" placeholder="Informações adicionais relevantes..."></textarea>
              </mat-form-field>
            </div>
          </div>

          <div class="form-section" formGroupName="seguro">
            <h3>Seguro de Saúde</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Empresa</mat-label>
                <input matInput formControlName="empresa" placeholder="Nome da seguradora">
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Número da Apólice</mat-label>
                <input matInput formControlName="numero" placeholder="Número do seguro">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Validade</mat-label>
                <input matInput type="date" formControlName="validade">
              </mat-form-field>
            </div>
          </div>

          <div class="form-actions">
            <button mat-button type="button" routerLink="/recepcao/pacientes">Cancelar</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="pacienteForm.invalid || isSaving()">
              @if (isSaving()) {
                <mat-spinner diameter="20"></mat-spinner>
                A guardar...
              } @else {
                Guardar Paciente
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .form-container {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
      
      h2 {
        margin: 0;
        font-size: 24px;
        color: var(--color-gray-900, #111827);
      }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      color: var(--color-gray-600, #4b5563);
      gap: 16px;
    }

    .paciente-form {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .form-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      
      h3 {
        margin-top: 0;
        margin-bottom: 24px;
        color: var(--color-primary-700, #1d4ed8);
        font-size: 18px;
        border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
        padding-bottom: 12px;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }
    
    .col-span-2 {
      grid-column: span 2;
      @media (max-width: 600px) {
        grid-column: span 1;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 16px;
      
      button {
        padding: 0 24px;
      }
      
      .mat-mdc-raised-button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  `]
})
export class FormPacienteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pacienteService = inject(PacienteService);
  private snackBar = inject(MatSnackBar);

  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  pacienteId: string | null = null;

  pacienteForm = this.fb.group({
    numeroPaciente: [{ value: '', disabled: true }],
    nome: ['', Validators.required],
    genero: ['', Validators.required],
    dataNascimento: ['', Validators.required],
    bi: ['', Validators.required],
    nuit: [''],
    telefone: ['', Validators.required],
    email: ['', [Validators.email]],
    endereco: [''],
    cidade: [''],
    bairro: [''],
    tipoSanguineo: [''],
    alergias: [''],
    notasMedicas: [''],
    contatoEmergencia: this.fb.group({
      nome: [''],
      parentesco: [''],
      telefone: ['']
    }),
    seguro: this.fb.group({
      empresa: [''],
      numero: [''],
      validade: ['']
    })
  });

  ngOnInit() {
    this.pacienteId = this.route.snapshot.paramMap.get('id');
    
    if (this.pacienteId) {
      this.isEditMode.set(true);
      this.loadPaciente(this.pacienteId);
    }
  }

  loadPaciente(id: string) {
    this.isLoading.set(true);
    this.pacienteService.buscarPorId(id).subscribe({
      next: (paciente) => {
        if (!paciente) {
          this.snackBar.open('Paciente não encontrado', 'Fechar', { duration: 3000 });
          this.isLoading.set(false);
          this.router.navigate(['/recepcao/pacientes']);
          return;
        }

        this.pacienteForm.patchValue({
          ...paciente,
          alergias: paciente.alergias.join(', '),
          seguro: paciente.seguro ?? { empresa: '', numero: '', validade: '' }
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Erro ao carregar paciente', 'Fechar', { duration: 3000 });
        this.isLoading.set(false);
        this.router.navigate(['/recepcao/pacientes']);
      }
    });
  }

  onSubmit() {
    if (this.pacienteForm.invalid) {
      return;
    }

    this.isSaving.set(true);
    const formValue = this.toPacientePayload();

    const request = this.isEditMode() 
      ? this.pacienteService.atualizar(this.pacienteId!, formValue)
      : this.pacienteService.criar(formValue);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode() ? 'Paciente atualizado com sucesso!' : 'Paciente registado com sucesso!',
          'Fechar',
          { duration: 3000 }
        );
        this.router.navigate(['/recepcao/pacientes']);
      },
      error: () => {
        this.snackBar.open('Ocorreu um erro ao guardar', 'Fechar', { duration: 3000 });
        this.isSaving.set(false);
      }
    });
  }

  private toPacientePayload(): Omit<Paciente, 'id' | 'numeroPaciente' | 'criadoEm'> {
    const raw = this.pacienteForm.getRawValue();
    const seguro = raw.seguro;
    const hasSeguro = !!(seguro?.empresa || seguro?.numero || seguro?.validade);

    return {
      nome: raw.nome ?? '',
      genero: (raw.genero || 'outro') as Paciente['genero'],
      dataNascimento: raw.dataNascimento ?? '',
      bi: raw.bi ?? '',
      nuit: raw.nuit || null,
      telefone: raw.telefone ?? '',
      email: raw.email || null,
      endereco: raw.endereco ?? '',
      cidade: raw.cidade ?? '',
      bairro: raw.bairro ?? '',
      tipoSanguineo: (raw.tipoSanguineo || 'O+') as Paciente['tipoSanguineo'],
      alergias: (raw.alergias ?? '')
        .split(',')
        .map(alergia => alergia.trim())
        .filter(Boolean),
      notasMedicas: raw.notasMedicas ?? '',
      contatoEmergencia: {
        nome: raw.contatoEmergencia?.nome ?? '',
        parentesco: raw.contatoEmergencia?.parentesco ?? '',
        telefone: raw.contatoEmergencia?.telefone ?? ''
      },
      seguro: hasSeguro
        ? {
            empresa: seguro?.empresa ?? '',
            numero: seguro?.numero ?? '',
            validade: seguro?.validade ?? ''
          }
        : null,
      status: 'ativo'
    };
  }
}
