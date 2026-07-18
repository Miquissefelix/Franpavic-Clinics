import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ConsultaService } from '../../../core/services/consulta.service';
import { PagamentoService } from '../../../core/services/pagamento.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, NgApexchartsModule],
  template: `
    <div class="page-enter">
      <div class="page-header mb-6">
        <div>
          <h1 class="text-3xl font-bold">Relatórios</h1>
          <p class="text-secondary mt-1">Análise de desempenho — Janeiro 2025</p>
        </div>
        <button mat-stroked-button>
          <mat-icon>download</mat-icon> Exportar PDF
        </button>
      </div>

      <div class="stats-grid mb-6">
        <div class="card p-4">
          <p class="text-secondary text-sm mb-1">Total Pacientes</p>
          <p class="text-4xl font-bold" style="color:var(--color-primary-600)">12</p>
          <p class="text-xs text-secondary mt-1">↑ 8% vs Dezembro</p>
        </div>
        <div class="card p-4">
          <p class="text-secondary text-sm mb-1">Total Consultas</p>
          <p class="text-4xl font-bold" style="color:var(--color-secondary-600)">12</p>
          <p class="text-xs text-secondary mt-1">↑ 12% vs Dezembro</p>
        </div>
        <div class="card p-4">
          <p class="text-secondary text-sm mb-1">Receita Total</p>
          <p class="text-4xl font-bold" style="color:var(--color-success-600)">16.730</p>
          <p class="text-xs text-secondary mt-1">MZN ↑ 5% vs Dezembro</p>
        </div>
        <div class="card p-4">
          <p class="text-secondary text-sm mb-1">Taxa de Comparência</p>
          <p class="text-4xl font-bold" style="color:var(--color-warning-600)">91.7%</p>
          <p class="text-xs text-secondary mt-1">11 de 12 agendados</p>
        </div>
      </div>

      <div class="data-grid mb-6">
        <div class="card p-4">
          <h3 class="mb-4">Consultas por Especialidade</h3>
          <apx-chart [series]="barChart.series" [chart]="barChart.chart" [xaxis]="barChart.xaxis"
            [colors]="barChart.colors" [plotOptions]="barChart.plotOptions" [dataLabels]="barChart.dataLabels"
            [grid]="barChart.grid"></apx-chart>
        </div>
        <div class="card p-4">
          <h3 class="mb-4">Métodos de Pagamento</h3>
          <apx-chart [series]="pieChart.series" [chart]="pieChart.chart" [labels]="pieChart.labels"
            [colors]="pieChart.colors" [legend]="pieChart.legend" [dataLabels]="pieChart.dataLabels"></apx-chart>
        </div>
      </div>

      <div class="card p-4">
        <h3 class="mb-4">Crescimento de Pacientes — 2024</h3>
        <apx-chart [series]="lineChart.series" [chart]="lineChart.chart" [xaxis]="lineChart.xaxis"
          [colors]="lineChart.colors" [stroke]="lineChart.stroke" [fill]="lineChart.fill"
          [dataLabels]="lineChart.dataLabels" [grid]="lineChart.grid" [markers]="lineChart.markers"></apx-chart>
      </div>
    </div>
  `,
})
export class ReportsComponent implements OnInit {
  barChart: any; pieChart: any; lineChart: any;

  ngOnInit(): void {
    this.barChart = {
      series: [{ name: 'Consultas', data: [3,2,2,1,1,1,1,1] }],
      chart: { type: 'bar', height: 260, toolbar: { show: false } },
      colors: ['#2563eb'],
      plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
      xaxis: { categories: ['Clín. Geral','Endocrinologia','Cardiologia','Ginecologia','Ortopedia','Med. Interna','Pediatria','Psiquiatria'], labels: { style: { fontSize: '11px' } } },
      dataLabels: { enabled: false },
      grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
    };
    this.pieChart = {
      series: [5, 3, 3, 1],
      chart: { type: 'pie', height: 260 },
      labels: ['Seguro', 'Transferência', 'Numerário', 'M-Pesa'],
      colors: ['#2563eb','#14b8a6','#f59e0b','#22c55e'],
      legend: { position: 'bottom', fontSize: '12px' },
      dataLabels: { style: { fontSize: '12px' } },
    };
    this.lineChart = {
      series: [
        { name: 'Novos Pacientes', data: [2,3,1,2,1,2,1,1,1,1,1,1] },
        { name: 'Consultas', data: [3,4,2,3,2,3,2,2,2,2,2,2] },
      ],
      chart: { type: 'line', height: 280, toolbar: { show: false } },
      colors: ['#2563eb','#14b8a6'],
      stroke: { curve: 'smooth', width: [2,2] },
      fill: { type: 'solid', opacity: [0.1,0.1] },
      markers: { size: 4 },
      xaxis: { categories: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'], labels: { style: { fontSize: '11px' } } },
      dataLabels: { enabled: false },
      grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
    };
  }
}
