import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { PacienteService } from '../../../core/services/paciente.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Paciente } from '../../../core/models';

@Component({
  selector: 'app-perfil-paciente',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="page-enter">
      <div class="mb-6"><h1 class="text-3xl font-bold">Meu Perfil</h1><p class="text-secondary mt-1">As suas informações pessoais e médicas</p></div>
      @if (paciente()) {
        <div class="data-grid">
          <div class="card p-5">
            <div class="profile-header mb-4">
              <div class="profile-avatar-lg">{{ iniciais(paciente()!.nome) }}</div>
              <div>
                <h2>{{ paciente()!.nome }}</h2>
                <p class="text-secondary text-sm">{{ paciente()!.numeroPaciente }}</p>
                <span class="chip chip-success mt-1">Activo</span>
              </div>
            </div>
            <div class="info-section">
              <h4 class="section-sub-title">Dados Pessoais</h4>
              <div class="info-rows">
                <div class="info-row"><mat-icon>badge</mat-icon><div><span class="lbl">B.I.</span><span class="val">{{ paciente()!.bi ?? '—' }}</span></div></div>
                <div class="info-row"><mat-icon>cake</mat-icon><div><span class="lbl">Data de Nascimento</span><span class="val">{{ formatarData(paciente()!.dataNascimento) }} ({{ calcularIdade(paciente()!.dataNascimento) }} anos)</span></div></div>
                <div class="info-row"><mat-icon>person</mat-icon><div><span class="lbl">Género</span><span class="val capitalize">{{ paciente()!.genero }}</span></div></div>
                <div class="info-row"><mat-icon>phone</mat-icon><div><span class="lbl">Telefone</span><span class="val">{{ paciente()!.telefone }}</span></div></div>
                <div class="info-row"><mat-icon>email</mat-icon><div><span class="lbl">Email</span><span class="val">{{ paciente()!.email ?? '—' }}</span></div></div>
                <div class="info-row"><mat-icon>location_on</mat-icon><div><span class="lbl">Endereço</span><span class="val">{{ paciente()!.bairro }}, {{ paciente()!.cidade }}</span></div></div>
              </div>
            </div>
          </div>

          <div class="card p-5">
            <div class="info-section">
              <h4 class="section-sub-title">Informações Médicas</h4>
              <div class="flex items-center gap-2 mb-4">
                <mat-icon>bloodtype</mat-icon>
                <span class="text-sm">Tipo Sanguíneo:</span>
                <span class="chip chip-danger">{{ paciente()!.tipoSanguineo }}</span>
              </div>
              @if (paciente()!.alergias.length > 0) {
                <div class="mb-4">
                  <p class="lbl mb-2">Alergias</p>
                  <div class="flex flex-wrap gap-2">
                    @for (a of paciente()!.alergias; track a) {
                      <span class="chip chip-warning"><mat-icon style="font-size:12px">warning</mat-icon>{{ a }}</span>
                    }
                  </div>
                </div>
              }
              @if (paciente()!.seguro) {
                <h4 class="section-sub-title mt-4">Seguro de Saúde</h4>
                <div class="info-rows">
                  <div class="info-row"><mat-icon>health_and_safety</mat-icon><div><span class="lbl">Seguradora</span><span class="val">{{ paciente()!.seguro!.empresa }}</span></div></div>
                  <div class="info-row"><mat-icon>confirmation_number</mat-icon><div><span class="lbl">Número</span><span class="val">{{ paciente()!.seguro!.numero }}</span></div></div>
                  <div class="info-row"><mat-icon>event</mat-icon><div><span class="lbl">Validade</span><span class="val">{{ formatarData(paciente()!.seguro!.validade) }}</span></div></div>
                </div>
              }
              <h4 class="section-sub-title mt-4">Contacto de Emergência</h4>
              <div class="info-rows">
                <div class="info-row"><mat-icon>person</mat-icon><div><span class="lbl">Nome</span><span class="val">{{ paciente()!.contatoEmergencia.nome }}</span></div></div>
                <div class="info-row"><mat-icon>family_restroom</mat-icon><div><span class="lbl">Parentesco</span><span class="val">{{ paciente()!.contatoEmergencia.parentesco }}</span></div></div>
                <div class="info-row"><mat-icon>phone</mat-icon><div><span class="lbl">Telefone</span><span class="val">{{ paciente()!.contatoEmergencia.telefone }}</span></div></div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-header { display:flex;gap:16px;align-items:center;flex-wrap:wrap; h2{font-size:20px;font-weight:700;margin:0;} }
    .profile-avatar-lg { width:64px;height:64px;border-radius:20px;background:linear-gradient(135deg,var(--color-primary-500),var(--color-secondary-500));color:white;font-size:20px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .section-sub-title { font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-tertiary);margin-bottom:12px; }
    .info-rows { display:flex;flex-direction:column;gap:8px; }
    .info-row { display:flex;gap:10px;align-items:flex-start; mat-icon { font-size:18px;color:var(--text-tertiary);margin-top:2px;flex-shrink:0; } }
    .lbl { font-size:11px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.04em;display:block;line-height:1; }
    .val { font-size:14px;font-weight:500;color:var(--text-primary);display:block;margin-top:2px; }
    .capitalize { text-transform:capitalize; }
    .info-section { margin-top:4px; }
  `],
})
export class PerfilPacienteComponent implements OnInit {
  private pacienteSvc = inject(PacienteService);
  private auth        = inject(AuthService);
  paciente = signal<Paciente | null>(null);
  ngOnInit(): void {
    const pacienteId = this.auth.utilizadorAtual()?.pacienteId ?? 'pac001';
    this.pacienteSvc.buscarPorId(pacienteId).subscribe(p => this.paciente.set(p ?? null));
  }
  iniciais(n: string): string { return n.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase(); }
  calcularIdade(d: string): number { return Math.floor((Date.now() - new Date(d).getTime()) / (365.25*24*3600*1000)); }
  formatarData(d: string): string { return new Date(d).toLocaleDateString('pt-MZ'); }
}
