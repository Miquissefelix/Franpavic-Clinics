import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Consulta, StatusConsulta } from '../models';
import dadosConsultas from '../../../assets/mock-data/appointments.json';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private consultas: Consulta[] = dadosConsultas as Consulta[];

  listar(filtros?: { medicoId?: string; pacienteId?: string; status?: StatusConsulta; data?: string }): Observable<Consulta[]> {
    let dados = [...this.consultas];

    if (filtros?.medicoId)  dados = dados.filter(c => c.medicoId === filtros.medicoId);
    if (filtros?.pacienteId) dados = dados.filter(c => c.pacienteId === filtros.pacienteId);
    if (filtros?.status)    dados = dados.filter(c => c.status === filtros.status);
    if (filtros?.data)      dados = dados.filter(c => c.data.startsWith(filtros.data!));

    return of(dados.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())).pipe(delay(350));
  }

  buscarPorId(id: string): Observable<Consulta | undefined> {
    return of(this.consultas.find(c => c.id === id)).pipe(delay(250));
  }

  consultasHoje(): Observable<Consulta[]> {
    const hoje = new Date().toISOString().split('T')[0];
    // Para demo, mostrar as consultas de 2025-01-15 como "hoje"
    const dadosHoje = this.consultas.filter(c => c.data.startsWith('2025-01-15'));
    return of(dadosHoje).pipe(delay(300));
  }

  criar(consulta: Omit<Consulta, 'id' | 'criadoEm'>): Observable<Consulta> {
    const nova: Consulta = {
      ...consulta,
      id: `con${Date.now()}`,
      criadoEm: new Date().toISOString(),
    };
    this.consultas = [...this.consultas, nova];
    return of(nova).pipe(delay(500));
  }

  atualizarStatus(id: string, status: StatusConsulta): Observable<Consulta> {
    const idx = this.consultas.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Consulta não encontrada');
    this.consultas[idx] = { ...this.consultas[idx], status };
    return of(this.consultas[idx]).pipe(delay(300));
  }

  cancelar(id: string): Observable<boolean> {
    return this.atualizarStatus(id, 'cancelada').pipe(
      delay(200),
    ) as unknown as Observable<boolean>;
  }

  estatisticasHoje(): Observable<{
    total: number; agendadas: number; concluidas: number;
    emCurso: number; canceladas: number; aguardando: number;
  }> {
    const hoje = this.consultas.filter(c => c.data.startsWith('2025-01-15'));
    return of({
      total:      hoje.length,
      agendadas:  hoje.filter(c => c.status === 'agendada').length,
      concluidas: hoje.filter(c => c.status === 'concluida').length,
      emCurso:    hoje.filter(c => c.status === 'em-curso').length,
      canceladas: hoje.filter(c => c.status === 'cancelada').length,
      aguardando: hoje.filter(c => c.status === 'aguardando').length,
    }).pipe(delay(200));
  }
}
