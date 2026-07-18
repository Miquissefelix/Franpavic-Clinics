import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Pagamento, Recibo } from '../models';
import dadosPagamentos from '../../../assets/mock-data/payments.json';
import dadosRecibos from '../../../assets/mock-data/receipts.json';

@Injectable({ providedIn: 'root' })
export class PagamentoService {
  private pagamentos: Pagamento[] = dadosPagamentos as Pagamento[];
  private recibos: Recibo[] = dadosRecibos as Recibo[];

  listar(filtros?: { pacienteId?: string; estado?: string }): Observable<Pagamento[]> {
    let dados = [...this.pagamentos];
    if (filtros?.pacienteId) dados = dados.filter(p => p.pacienteId === filtros.pacienteId);
    if (filtros?.estado) dados = dados.filter(p => p.estado === filtros.estado);
    return of(dados.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())).pipe(delay(300));
  }

  buscarRecibo(id: string): Observable<Recibo | undefined> {
    return of(this.recibos.find(r => r.id === id)).pipe(delay(200));
  }

  listarRecibos(pacienteId?: string): Observable<Recibo[]> {
    let dados = [...this.recibos];
    if (pacienteId) dados = dados.filter(r => r.pacienteId === pacienteId);
    return of(dados).pipe(delay(300));
  }

  registarPagamento(pagamentoId: string, metodo: string): Observable<Pagamento> {
    const idx = this.pagamentos.findIndex(p => p.id === pagamentoId);
    const novoRecibo: Recibo = {
      id: `rec${Date.now()}`,
      pagamentoId,
      pacienteId: this.pagamentos[idx].pacienteId,
      numero: `REC-2025-${String(this.recibos.length + 1).padStart(4, '0')}`,
      data: new Date().toISOString(),
      total: this.pagamentos[idx].total,
      emitidoPor: 'Maria Conceição Sitoe',
    };
    this.recibos = [...this.recibos, novoRecibo];
    this.pagamentos[idx] = { ...this.pagamentos[idx], estado: 'pago', metodoPagamento: metodo as any, recibo: novoRecibo.id };
    return of(this.pagamentos[idx]).pipe(delay(500));
  }

  resumoFinanceiro(): Observable<{ totalReceita: number; pendente: number; hoje: number; totalConsultas: number }> {
    const pagos = this.pagamentos.filter(p => p.estado === 'pago');
    const pendentes = this.pagamentos.filter(p => p.estado === 'pendente');
    return of({
      totalReceita: pagos.reduce((s, p) => s + p.total, 0),
      pendente: pendentes.reduce((s, p) => s + p.total, 0),
      hoje: pagos.filter(p => p.data.startsWith('2025-01-15')).reduce((s, p) => s + p.total, 0),
      totalConsultas: this.pagamentos.length,
    }).pipe(delay(200));
  }
}
