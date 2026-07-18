import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PacienteService } from '../../../core/services/paciente.service';
import { ConsultaService } from '../../../core/services/consulta.service';
import { PagamentoService } from '../../../core/services/pagamento.service';
import { MedicoService } from '../../../core/services/medico.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatCardModule, MatChipsModule, NgApexchartsModule],
  template: `
    <div class="page-enter">
      <!-- Cabeçalho -->
      <div class="page-header mb-6">
        <div>
          <h1 class="text-3xl font-bold">Dashboard Executivo</h1>
          <p class="text-secondary mt-1">Visão geral do desempenho da clínica • {{ hoje }}</p>
        </div>
        <div class="flex gap-2">
          <button mat-stroked-button routerLink="/admin/relatorios">
            <mat-icon>bar_chart</mat-icon> Relatórios
          </button>
          <button mat-flat-button color="primary" routerLink="/recepcao/consultas/nova">
            <mat-icon>add</mat-icon> Nova Consulta
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="stats-grid mb-6">
        @for (kpi of kpis(); track kpi.titulo) {
          <div class="kpi-card card" [ngClass]="'kpi-' + kpi.cor">
            <div class="kpi-body">
              <div class="kpi-icon"><mat-icon>{{ kpi.icone }}</mat-icon></div>
              <div class="kpi-info">
                <span class="kpi-label">{{ kpi.titulo }}</span>
                <span class="kpi-value">{{ kpi.valor }}</span>
                @if (kpi.variacao !== undefined) {
                  <span class="kpi-trend" [class.positive]="kpi.variacao > 0" [class.negative]="kpi.variacao < 0">
                    <mat-icon>{{ kpi.variacao >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                    {{ kpi.variacao > 0 ? '+' : '' }}{{ kpi.variacao }}% vs mês anterior
                  </span>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Gráficos Row 1 -->
      <div class="data-grid mb-6">
        <!-- Receita Mensal -->
        <div class="card p-4">
          <div class="section-header">
            <div>
              <h3>Receita Mensal</h3>
              <p class="text-secondary text-sm">Janeiro — Dezembro 2024</p>
            </div>
            <span class="chip chip-success">+12.4%</span>
          </div>
          <apx-chart
            [series]="receitaChart.series"
            [chart]="receitaChart.chart"
            [xaxis]="receitaChart.xaxis"
            [colors]="receitaChart.colors"
            [stroke]="receitaChart.stroke"
            [fill]="receitaChart.fill"
            [dataLabels]="receitaChart.dataLabels"
            [tooltip]="receitaChart.tooltip"
            [grid]="receitaChart.grid"
          ></apx-chart>
        </div>

        <!-- Status Consultas (Donut) -->
        <div class="card p-4">
          <div class="section-header">
            <div>
              <h3>Consultas por Status</h3>
              <p class="text-secondary text-sm">Hoje, {{ hoje }}</p>
            </div>
          </div>
          <apx-chart
            [series]="statusChart.series"
            [chart]="statusChart.chart"
            [labels]="statusChart.labels"
            [colors]="statusChart.colors"
            [legend]="statusChart.legend"
            [plotOptions]="statusChart.plotOptions"
            [dataLabels]="statusChart.dataLabels"
          ></apx-chart>
        </div>
      </div>

      <!-- Gráficos Row 2 -->
      <div class="data-grid mb-6">
        <!-- Desempenho Médicos -->
        <div class="card p-4">
          <div class="section-header mb-4">
            <h3>Desempenho dos Médicos</h3>
          </div>
          <div class="medico-perf-list">
            @for (m of medicoDesempenho().slice(0, 6); track m.medicoId) {
              <div class="medico-perf-item">
                <div class="medico-avatar">{{ iniciais(m.nome) }}</div>
                <div class="medico-info">
                  <span class="medico-nome">{{ m.nome }}</span>
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="(m.consultas / 2200) * 100"></div>
                  </div>
                </div>
                <div class="medico-stats">
                  <span class="text-primary font-semibold">{{ m.consultas }}</span>
                  <span class="text-tertiary text-xs">consultas</span>
                </div>
                <div class="avaliacao">
                  <mat-icon style="font-size:14px;color:#f59e0b">star</mat-icon>
                  <span class="text-sm">{{ m.avaliacao }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Atividade Recente -->
        <div class="card p-4">
          <div class="section-header mb-4">
            <h3>Atividade Recente</h3>
            <a routerLink="/admin/auditoria" class="text-link text-sm">Ver tudo</a>
          </div>
          <div class="timeline">
            @for (log of logsRecentes; track log.id) {
              <div class="timeline-item" [ngClass]="'item-' + corLog(log.acao)">
                <div class="log-card">
                  <div class="log-header">
                    <span class="chip chip-neutral text-xs">{{ log.acao }}</span>
                    <span class="log-time text-xs text-tertiary">{{ formatarHora(log.data) }}</span>
                  </div>
                  <p class="log-desc text-sm">{{ log.descricao }}</p>
                  <span class="log-user text-xs text-tertiary">{{ log.utilizador }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Próximas Consultas -->
      <div class="card p-4">
        <div class="section-header mb-4">
          <h3>Próximas Consultas de Hoje</h3>
          <a routerLink="/recepcao/consultas" class="text-link text-sm">Ver todas</a>
        </div>
        <div class="consultas-list">
          @for (c of proximasConsultas(); track c.id) {
            <div class="consulta-row">
              <div class="consulta-hora">
                <span class="hora">{{ c.hora }}</span>
              </div>
              <div class="consulta-info">
                <span class="font-medium text-sm">{{ c.motivo }}</span>
                <span class="text-xs text-secondary">{{ c.especialidade }}</span>
              </div>
              <span class="chip" [ngClass]="chipStatus(c.status)">{{ labelStatus(c.status) }}</span>
              <span class="consulta-valor text-sm font-medium">{{ c.valorConsulta | number:'1.0-0' }} MZN</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px;
      h1 { margin:0; } }

    /* KPI */
    .kpi-card {
      padding: 20px;
      .kpi-body { display:flex; gap:14px; align-items:flex-start; }
      .kpi-icon { width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;
        mat-icon { font-size:24px; } }
      .kpi-label { font-size:12px; font-weight:500; color:var(--text-secondary); display:block; margin-bottom:4px; }
      .kpi-value { font-size:28px; font-weight:700; color:var(--text-primary); display:block; line-height:1.2; }
      .kpi-trend { font-size:11px; display:flex; align-items:center; gap:2px; margin-top:4px;
        mat-icon { font-size:14px; }
        &.positive { color:var(--color-success-600); }
        &.negative { color:var(--color-danger-600); }
      }
    }

    .kpi-primary   .kpi-icon { background:var(--color-primary-100); mat-icon { color:var(--color-primary-600); } }
    .kpi-success   .kpi-icon { background:var(--color-success-100); mat-icon { color:var(--color-success-600); } }
    .kpi-warning   .kpi-icon { background:var(--color-warning-100); mat-icon { color:var(--color-warning-600); } }
    .kpi-secondary .kpi-icon { background:var(--color-secondary-100); mat-icon { color:var(--color-secondary-600); } }

    /* Médico Performance */
    .medico-perf-list { display:flex; flex-direction:column; gap:14px; }
    .medico-perf-item { display:flex; align-items:center; gap:12px; }
    .medico-avatar { width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--color-primary-500),var(--color-secondary-500));color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .medico-info { flex:1; min-width:0;
      .medico-nome { font-size:13px; font-weight:500; display:block; margin-bottom:4px; white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    }
    .progress-bar { height:5px;background:var(--color-neutral-200);border-radius:99px;overflow:hidden;
      .progress-fill { height:100%;background:linear-gradient(90deg,var(--color-primary-500),var(--color-secondary-500));border-radius:99px;transition:width 1s ease; }
    }
    .medico-stats { text-align:right; }
    .avaliacao { display:flex;align-items:center;gap:2px;min-width:40px; }

    /* Timeline logs */
    .log-card { background:var(--surface-input);border-radius:8px;padding:10px 12px; }
    .log-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:4px; }
    .log-desc { color:var(--text-primary); margin:2px 0; }
    .log-user { display:block; }

    /* Consultas */
    .consultas-list { display:flex;flex-direction:column; }
    .consulta-row { display:flex;align-items:center;gap:14px;padding:10px 0;border-bottom:1px solid var(--border-color);
      &:last-child { border:none; }
    }
    .consulta-hora .hora { font-size:13px;font-weight:600;color:var(--text-primary);min-width:42px;display:block; }
    .consulta-info { flex:1;min-width:0;display:flex;flex-direction:column; }
    .consulta-valor { min-width:80px;text-align:right;color:var(--color-success-600); }
  `],
})
export class AdminDashboardComponent implements OnInit {
  private pacienteSvc = inject(PacienteService);
  private consultaSvc = inject(ConsultaService);
  private pagamentoSvc = inject(PagamentoService);
  private medicoSvc   = inject(MedicoService);

  hoje = new Date().toLocaleDateString('pt-MZ', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  kpis = signal<any[]>([]);
  medicoDesempenho = signal<any[]>([]);
  proximasConsultas = signal<any[]>([]);

  logsRecentes = [
    { id:'l1', acao:'CRIAR', descricao:'Paciente Celeste Fumo registada (FPC-2024-0012)', utilizador:'Maria Sitoe', data:'2025-01-15T07:15:00Z' },
    { id:'l2', acao:'CRIAR', descricao:'Triagem realizada — Américo Guambe — Escala Amarelo', utilizador:'Beatriz Cumbe', data:'2025-01-15T06:45:00Z' },
    { id:'l3', acao:'CRIAR', descricao:'Consulta concluída — João Nhantumbo — CID I10', utilizador:'Dr. António Machava', data:'2025-01-15T08:35:00Z' },
    { id:'l4', acao:'CRIAR', descricao:'Pagamento registado — 1.500 MZN — João Nhantumbo', utilizador:'Maria Sitoe', data:'2025-01-15T08:50:00Z' },
    { id:'l5', acao:'VER',   descricao:'Relatório de receita de Janeiro 2025 consultado', utilizador:'Dr. Carlos Administrador', data:'2025-01-15T08:45:00Z' },
  ];

  receitaChart: any;
  statusChart: any;

  ngOnInit(): void {
    this.carregarDados();
    this.inicializarGraficos();
  }

  private carregarDados(): void {
    this.pacienteSvc.estatisticas().subscribe(e => {
      this.consultaSvc.estatisticasHoje().subscribe(c => {
        this.pagamentoSvc.resumoFinanceiro().subscribe(f => {
          this.kpis.set([
            { titulo: 'Pacientes Hoje', valor: '5', icone: 'people', cor: 'primary', variacao: 8 },
            { titulo: 'Consultas Hoje', valor: c.total, icone: 'event', cor: 'secondary', variacao: 12 },
            { titulo: 'Receita Hoje', valor: this.formatMZN(f.hoje), icone: 'payments', cor: 'success', variacao: 5 },
            { titulo: 'Pendente', valor: this.formatMZN(f.pendente), icone: 'pending', cor: 'warning', variacao: -3 },
          ]);
          this.proximasConsultas.set([
            { id:'c1', hora:'08:00', motivo:'Controlo de Hipertensão', especialidade:'Clínica Geral', status:'concluida', valorConsulta:1500 },
            { id:'c2', hora:'08:30', motivo:'Crise Asmática', especialidade:'Clínica Geral', status:'concluida', valorConsulta:2000 },
            { id:'c3', hora:'09:00', motivo:'Controlo de Diabetes', especialidade:'Endocrinologia', status:'em-curso', valorConsulta:2000 },
            { id:'c4', hora:'09:00', motivo:'Consulta Ginecológica', especialidade:'Ginecologia', status:'aguardando', valorConsulta:1800 },
            { id:'c5', hora:'09:30', motivo:'Dor Precordial', especialidade:'Cardiologia', status:'concluida', valorConsulta:4200 },
          ]);
        });
      });
    });

    this.medicoSvc.desempenho().subscribe(d => this.medicoDesempenho.set(d));
  }

  private inicializarGraficos(): void {
    this.receitaChart = {
      series: [{ name: 'Receita (MZN)', data: [42000,55000,38000,67000,72000,58000,89000,76000,95000,81000,104000,118000] }],
      chart: { type: 'area', height: 220, toolbar: { show: false }, sparkline: { enabled: false } },
      colors: ['#2563eb'],
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0,100] } },
      xaxis: { categories: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'], labels: { style: { fontSize: '11px' } } },
      dataLabels: { enabled: false },
      tooltip: { y: { formatter: (v: number) => `${v.toLocaleString('pt-MZ')} MZN` } },
      grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
    };

    this.statusChart = {
      series: [4, 1, 5, 1, 1],
      chart: { type: 'donut', height: 220 },
      labels: ['Concluídas', 'Em Curso', 'Agendadas', 'Aguardando', 'Canceladas'],
      colors: ['#22c55e','#2563eb','#14b8a6','#f59e0b','#ef4444'],
      legend: { position: 'bottom', fontSize: '12px' },
      plotOptions: { pie: { donut: { size: '65%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '13px' } } } } },
      dataLabels: { enabled: false },
    };
  }

  chipStatus(s: string): string {
    const m: Record<string,string> = { concluida:'chip-success', 'em-curso':'chip-primary', agendada:'chip-secondary', aguardando:'chip-warning', cancelada:'chip-danger' };
    return m[s] ?? 'chip-neutral';
  }

  labelStatus(s: string): string {
    const m: Record<string,string> = { concluida:'Concluída', 'em-curso':'Em Curso', agendada:'Agendada', aguardando:'Aguardando', cancelada:'Cancelada' };
    return m[s] ?? s;
  }

  corLog(acao: string): string {
    const m: Record<string,string> = { CRIAR:'success', EDITAR:'warning', EXCLUIR:'danger', LOGIN:'primary', VER:'neutral' };
    return m[acao] ?? 'neutral';
  }

  formatarHora(d: string): string {
    return new Date(d).toLocaleTimeString('pt-MZ', { hour:'2-digit', minute:'2-digit' });
  }

  iniciais(nome: string): string {
    return nome.split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase();
  }

  formatMZN(v: number): string {
    return `${v.toLocaleString('pt-MZ')} MZN`;
  }
}
