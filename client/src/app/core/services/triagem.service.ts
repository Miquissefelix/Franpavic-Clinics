import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Triagem } from '../models';
import dadosTriagem from '../../../assets/mock-data/triage.json';

@Injectable({ providedIn: 'root' })
export class TriagemService {
  private triagens: Triagem[] = dadosTriagem as Triagem[];

  listar(filtros?: { pacienteId?: string; data?: string }): Observable<Triagem[]> {
    let dados = [...this.triagens];
    if (filtros?.pacienteId) dados = dados.filter(t => t.pacienteId === filtros.pacienteId);
    if (filtros?.data) dados = dados.filter(t => t.data.startsWith(filtros.data!));
    return of(dados.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())).pipe(delay(300));
  }

  buscarPorId(id: string): Observable<Triagem | undefined> {
    return of(this.triagens.find(t => t.id === id)).pipe(delay(200));
  }

  buscarPorConsulta(consultaId: string): Observable<Triagem | undefined> {
    return of(this.triagens.find(t => t.consultaId === consultaId)).pipe(delay(200));
  }

  criar(triagem: Omit<Triagem, 'id'>): Observable<Triagem> {
    const nova: Triagem = { ...triagem, id: `tri${Date.now()}` };
    this.triagens = [...this.triagens, nova];
    return of(nova).pipe(delay(500));
  }

  filaEspera(): Observable<{ consultaId: string; pacienteNome: string; escala: string; hora: string; triagem: Triagem }[]> {
    const hoje = this.triagens.filter(t => t.data.startsWith('2025-01-15'));
    return of(hoje.map(t => ({
      consultaId: t.consultaId,
      pacienteNome: `Paciente ${t.pacienteId}`,
      escala: t.escalaTriagem,
      hora: new Date(t.data).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
      triagem: t,
    }))).pipe(delay(300));
  }
}
