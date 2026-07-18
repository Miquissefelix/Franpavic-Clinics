import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MedicoService } from '../../../core/services/medico.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { ConsultaService } from '../../../core/services/consulta.service';
import { Consulta, Especialidade, Medico, Paciente } from '../../../core/models';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-form-consulta',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button (click)="cancelar()" color="primary">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2>Nova Consulta</h2>
      </div>

      <mat-stepper [linear]="true" #stepper class="custom-stepper">
        
        <!-- Passo 1: Especialidade -->
        <mat-step [stepControl]="especialidadeForm">
          <form [formGroup]="especialidadeForm">
            <ng-template matStepLabel>Especialidade</ng-template>
            <div class="step-content">
              <h3>Selecione a Especialidade</h3>
              
              <div class="specialty-grid">
                @for (esp of especialidades(); track esp) {
                  <mat-card 
                    class="selectable-card" 
                    [class.selected]="especialidadeForm.get('especialidade')?.value === esp.nome"
                    (click)="selecionarEspecialidade(esp, stepper)">
                    <mat-card-content>
                      <mat-icon color="primary">medical_services</mat-icon>
                      <h4>{{ esp.nome }}</h4>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
            <div class="stepper-actions">
              <button mat-raised-button color="primary" matStepperNext [disabled]="especialidadeForm.invalid">Próximo</button>
            </div>
          </form>
        </mat-step>

        <!-- Passo 2: Médico -->
        <mat-step [stepControl]="medicoForm">
          <form [formGroup]="medicoForm">
            <ng-template matStepLabel>Médico</ng-template>
            <div class="step-content">
              <h3>Selecione o Médico</h3>
              
              <div class="doctors-grid">
                @for (medico of medicosFiltrados(); track medico.id) {
                  <mat-card 
                    class="doctor-card selectable-card"
                    [class.selected]="medicoForm.get('medicoId')?.value === medico.id"
                    (click)="selecionarMedico(medico.id, stepper)">
                    <mat-card-header>
                      <div mat-card-avatar class="doc-avatar">
                        <mat-icon>person</mat-icon>
                      </div>
                      <mat-card-title>Dr(a). {{ medico.nome }}</mat-card-title>
                      <mat-card-subtitle>CRM: {{ medico.crm }}</mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="doc-stats">
                        <span class="rating"><mat-icon>star</mat-icon> {{ medico.avaliacao }}</span>
                        <span class="count">{{ medico.consultas }} consultas</span>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
                @if (medicosFiltrados().length === 0) {
                  <p class="empty-msg">Nenhum médico disponível para esta especialidade.</p>
                }
              </div>
            </div>
            <div class="stepper-actions">
              <button mat-button matStepperPrevious>Voltar</button>
              <button mat-raised-button color="primary" matStepperNext [disabled]="medicoForm.invalid">Próximo</button>
            </div>
          </form>
        </mat-step>

        <!-- Passo 3: Data e Hora -->
        <mat-step [stepControl]="dataHoraForm">
          <form [formGroup]="dataHoraForm">
            <ng-template matStepLabel>Data e Hora</ng-template>
            <div class="step-content">
              <h3>Escolha a Data e Horário</h3>
              
              <div class="datetime-layout">
                <mat-card class="calendar-card">
                  <mat-calendar 
                    (selectedChange)="onDateSelected($event)"
                    [selected]="dataHoraForm.get('data')?.value">
                  </mat-calendar>
                </mat-card>

                <div class="time-slots-container">
                  <h4>Horários Disponíveis</h4>
                  @if (horarios().length > 0) {
                    <div class="slots-grid">
                      @for (hora of horarios(); track hora) {
                        <button mat-stroked-button 
                          type="button"
                          class="time-slot"
                          [class.selected-slot]="dataHoraForm.get('hora')?.value === hora"
                          (click)="selecionarHorario(hora)">
                          {{ hora }}
                        </button>
                      }
                    </div>
                  } @else {
                    <p class="empty-msg">Selecione uma data para ver os horários.</p>
                  }
                </div>
              </div>
            </div>
            <div class="stepper-actions">
              <button mat-button matStepperPrevious>Voltar</button>
              <button mat-raised-button color="primary" matStepperNext [disabled]="dataHoraForm.invalid">Próximo</button>
            </div>
          </form>
        </mat-step>

        <!-- Passo 4: Paciente e Confirmação -->
        <mat-step [stepControl]="pacienteForm">
          <form [formGroup]="pacienteForm" (ngSubmit)="agendar()">
            <ng-template matStepLabel>Confirmação</ng-template>
            <div class="step-content">
              
              <div class="confirmation-layout">
                <div class="form-side">
                  <h3>Dados do Paciente</h3>
                  
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Pesquisar Paciente (Nome)</mat-label>
                    <input type="text" matInput formControlName="pacienteSearch" [matAutocomplete]="auto">
                    <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayPaciente" (optionSelected)="onPacienteSelected($event)">
                      @for (paciente of pacientesFiltrados(); track paciente.id) {
                        <mat-option [value]="paciente">
                          {{ paciente.nome }} (Nº {{ paciente.numeroPaciente }})
                        </mat-option>
                      }
                    </mat-autocomplete>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Motivo da Consulta</mat-label>
                    <textarea matInput formControlName="motivo" rows="3" placeholder="Sintomas, exames de rotina, etc."></textarea>
                  </mat-form-field>
                </div>

                <div class="summary-side">
                  <mat-card class="summary-card">
                    <mat-card-header>
                      <mat-card-title>Resumo do Agendamento</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="summary-list">
                        <div class="s-item">
                          <span class="s-label">Especialidade</span>
                          <span class="s-value">{{ especialidadeForm.get('especialidade')?.value }}</span>
                        </div>
                        <div class="s-item">
                          <span class="s-label">Médico</span>
                          <span class="s-value">{{ getMedicoNome() }}</span>
                        </div>
                        <div class="s-item">
                          <span class="s-label">Data e Hora</span>
                          <span class="s-value">{{ dataHoraForm.get('data')?.value | date:'dd/MM/yyyy' }} às {{ dataHoraForm.get('hora')?.value }}</span>
                        </div>
                        <div class="s-item total-item">
                          <span class="s-label">Valor da Consulta</span>
                          <span class="s-value price">2.500,00 MZN</span>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </div>
            
            <div class="stepper-actions">
              <button mat-button matStepperPrevious type="button">Voltar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="pacienteForm.invalid || isSubmitting()">
                @if (isSubmitting()) {
                  <mat-icon>hourglass_empty</mat-icon> Agendando...
                } @else {
                  Confirmar Agendamento
                }
              </button>
            </div>
          </form>
        </mat-step>

      </mat-stepper>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      
      h2 { margin: 0; font-size: 24px; }
    }

    .custom-stepper {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .step-content {
      padding: 24px 0;
      
      h3 {
        margin-top: 0;
        margin-bottom: 24px;
        color: var(--color-gray-800);
      }
    }

    .stepper-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--color-gray-200);
    }

    .w-full { width: 100%; }

    /* Grids */
    .specialty-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .doctors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .selectable-card {
      cursor: pointer;
      transition: all 0.2s ease;
      border: 2px solid transparent;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      &.selected {
        border-color: var(--color-primary-500);
        background-color: var(--color-primary-50);
      }

      mat-card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px;
        text-align: center;
        
        mat-icon {
          font-size: 40px;
          height: 40px;
          width: 40px;
          margin-bottom: 16px;
        }
        
        h4 { margin: 0; font-size: 16px; }
      }
    }

    .doctor-card {
      padding: 8px;
      
      .doc-avatar {
        background: var(--color-primary-100);
        color: var(--color-primary-700);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }
      
      .doc-stats {
        display: flex;
        justify-content: space-between;
        color: var(--color-gray-600);
        font-size: 14px;
        margin-top: 8px;
        
        .rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #eab308;
          mat-icon { font-size: 16px; height: 16px; width: 16px; }
        }
      }
    }

    /* DateTime layout */
    .datetime-layout {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 32px;
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .calendar-card {
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .time-slots-container {
      h4 { margin-top: 0; margin-bottom: 16px; }
      
      .slots-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 12px;
      }
      
      .time-slot {
        &.selected-slot {
          background-color: var(--color-primary-600);
          color: white;
          border-color: var(--color-primary-600);
        }
      }
    }

    /* Confirmation Layout */
    .confirmation-layout {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 32px;
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .summary-card {
      background-color: var(--color-gray-50);
      border: 1px solid var(--color-gray-200);
      border-radius: 12px;
      
      .summary-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .s-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .s-label {
          font-size: 13px;
          color: var(--color-gray-500);
          text-transform: uppercase;
        }
        .s-value {
          font-weight: 500;
          color: var(--color-gray-900);
        }
      }
      
      .total-item {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px dashed var(--color-gray-300);
        
        .price {
          font-size: 20px;
          color: var(--color-primary-700);
          font-weight: 700;
        }
      }
    }

    .empty-msg {
      color: var(--color-gray-500);
      font-style: italic;
    }
  `]
})
export class FormConsultaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private medicoService = inject(MedicoService);
  private pacienteService = inject(PacienteService);
  private consultaService = inject(ConsultaService);

  especialidadeForm = this.fb.group({
    especialidade: ['', Validators.required]
  });

  medicoForm = this.fb.group({
    medicoId: ['', Validators.required]
  });

  dataHoraForm = this.fb.group({
    data: [null as Date | null, Validators.required],
    hora: ['', Validators.required]
  });

  pacienteForm = this.fb.group({
    pacienteSearch: ['', Validators.required],
    pacienteId: ['', Validators.required],
    motivo: ['', Validators.required]
  });

  // State
  especialidades = signal<Especialidade[]>([]);
  todosMedicos = signal<Medico[]>([]);
  medicosFiltrados = signal<Medico[]>([]);
  horarios = signal<string[]>([]);
  pacientesFiltrados = signal<Paciente[]>([]);
  isSubmitting = signal(false);

  ngOnInit() {
    this.carregarEspecialidades();
    this.carregarMedicos();
    this.setupPacienteAutocomplete();
  }

  carregarEspecialidades() {
    this.medicoService.listarEspecialidades().subscribe(
      res => this.especialidades.set(res)
    );
  }

  carregarMedicos() {
    // We assume a generic list of doctors is available or we filter them based on specialty later
    this.medicoService.listar().subscribe(
      res => this.todosMedicos.set(res)
    );
  }

  setupPacienteAutocomplete() {
    this.pacienteForm.get('pacienteSearch')?.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        const nome = typeof value === 'string' ? value : (value as any)?.nome;
        return nome ? this.pacienteService.buscarPorNome(nome) : of([]);
      })
    ).subscribe(pacientes => {
      this.pacientesFiltrados.set(pacientes);
    });
  }

  selecionarEspecialidade(esp: Especialidade, stepper: any) {
    this.especialidadeForm.patchValue({ especialidade: esp.nome });
    
    // Filtrar medicos
    const filtrados = this.todosMedicos().filter(m => m.especialidadeId === esp.id);
    this.medicosFiltrados.set(filtrados);
    
    // Limpar selecao anterior de medico
    this.medicoForm.reset();
    
    stepper.next();
  }

  selecionarMedico(id: string, stepper: any) {
    this.medicoForm.patchValue({ medicoId: id });
    stepper.next();
  }

  onDateSelected(date: Date | null) {
    this.dataHoraForm.patchValue({ data: date, hora: '' });
    if (date) {
      // Fetch available slots
      const medicoId = this.medicoForm.value.medicoId;
      const data = date.toISOString().split('T')[0];
      if (!medicoId) {
        this.horarios.set([]);
        return;
      }
      this.medicoService.horariosDisponiveis(medicoId, data).subscribe(
        slots => this.horarios.set(slots)
      );
    } else {
      this.horarios.set([]);
    }
  }

  selecionarHorario(hora: string) {
    this.dataHoraForm.patchValue({ hora });
  }

  displayPaciente(paciente: any): string {
    return paciente ? paciente.nome : '';
  }

  onPacienteSelected(event: any) {
    const paciente = event.option.value;
    this.pacienteForm.patchValue({ pacienteId: paciente.id });
  }

  getMedicoNome(): string {
    const id = this.medicoForm.get('medicoId')?.value;
    const medico = this.todosMedicos().find(m => m.id === id);
    return medico ? `Dr(a). ${medico.nome}` : '';
  }

  agendar() {
    if (this.especialidadeForm.invalid || this.medicoForm.invalid || this.dataHoraForm.invalid || this.pacienteForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);

    const payload: Omit<Consulta, 'id' | 'criadoEm'> = {
      especialidade: this.especialidadeForm.value.especialidade!,
      medicoId: this.medicoForm.value.medicoId!,
      data: this.dataHoraForm.value.data!.toISOString(),
      hora: this.dataHoraForm.value.hora!,
      pacienteId: this.pacienteForm.value.pacienteId!,
      motivo: this.pacienteForm.value.motivo!,
      tipo: 'consulta',
      duracaoMinutos: 30,
      valorConsulta: 2500, // Hardcoded for display
      status: 'agendada'
    };

    this.consultaService.criar(payload).subscribe({
      next: () => {
        this.snackBar.open('Consulta agendada com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/recepcao/consultas']);
      },
      error: () => {
        this.snackBar.open('Erro ao agendar consulta.', 'Fechar', { duration: 3000 });
        this.isSubmitting.set(false);
      }
    });
  }

  cancelar() {
    this.router.navigate(['/recepcao/consultas']);
  }
}
