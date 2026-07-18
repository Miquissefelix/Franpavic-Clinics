import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { ClinicaService } from '../../../core/services/clinica.service';
import { Certificado } from '../../../core/models';

@Component({
  selector: 'app-certificados',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="page-enter">
      <div class="page-header mb-6">
        <div>
          <h1 class="text-3xl font-bold">Certificados Médicos</h1>
          <p class="text-secondary mt-1">Atestados e declarações emitidas</p>
        </div>
      </div>

      @if (certificados().length === 0) {
        <div class="empty-state card p-8">
          <mat-icon>description</mat-icon>
          <p>Nenhum certificado emitido</p>
        </div>
      }

      @for (c of certificados(); track c.id) {
        <div class="card p-4 mb-3 cert-card">
          <div class="cert-header">
            <div class="cert-icon"><mat-icon>description</mat-icon></div>
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold">{{ c.numero }}</span>
                <span class="chip chip-primary">{{ labelTipo(c.tipo) }}</span>
                @if (c.validado) { <span class="chip chip-success">Validado</span> }
              </div>
              <p class="text-xs text-secondary mt-1">{{ formatarData(c.data) }} · CID: {{ c.cid }}</p>
              <p class="text-sm mt-1">{{ c.diagnostico }}</p>
            </div>
          </div>
          @if (c.diasRepouso) {
            <div class="cert-detail mt-3">
              <mat-icon>hotel</mat-icon>
              <span class="text-sm">{{ c.diasRepouso }} dias de repouso ({{ formatarData(c.dataInicio!) }} — {{ formatarData(c.dataFim!) }})</span>
            </div>
          }
          @if (c.observacoes) {
            <p class="text-xs text-secondary mt-2">{{ c.observacoes }}</p>
          }
          <div class="cert-footer mt-3">
            <span class="text-xs text-tertiary">{{ c.assinatura }} · CRM: {{ c.crm }}</span>
            <button mat-stroked-button class="btn-xs">
              <mat-icon>print</mat-icon> Imprimir
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px; }
    .cert-card { border-left:4px solid var(--color-primary-500); }
    .cert-header { display:flex;align-items:flex-start;gap:12px; }
    .cert-icon { width:40px;height:40px;border-radius:10px;background:var(--color-primary-100);display:flex;align-items:center;justify-content:center;flex-shrink:0;
      mat-icon { color:var(--color-primary-600); }
    }
    .cert-detail { display:flex;align-items:center;gap:6px;background:var(--surface-input);padding:8px 10px;border-radius:8px;
      mat-icon { font-size:16px;color:var(--text-secondary); }
    }
    .cert-footer { display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;border-top:1px solid var(--border-color);padding-top:10px; }
    .btn-xs ::ng-deep .mat-mdc-button-touch-target { height:32px; }
    .empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;
      mat-icon { font-size:48px;color:var(--text-tertiary);opacity:0.4; }
      p { font-size:15px;color:var(--text-secondary); }
    }
  `],
})
export class CertificadosComponent implements OnInit {
  private clinicaSvc = inject(ClinicaService);
  certificados = signal<Certificado[]>([]);
  ngOnInit(): void {
    this.clinicaSvc.listarCertificados().subscribe(c => this.certificados.set(c));
  }
  labelTipo(t: string): string {
    const m: Record<string,string> = { 'atestado-medico':'Atestado Médico', 'declaracao-medica':'Declaração Médica', 'licenca-maternidade':'Licença Maternidade' };
    return m[t] ?? t;
  }
  formatarData(d: string): string { return new Date(d).toLocaleDateString('pt-MZ'); }
}
