import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Prescricao } from '../models';
import dadosPrescricoes from '../../../assets/mock-data/prescriptions.json';

@Injectable({ providedIn: 'root' })
export class PrescricaoService {
  private prescricoes: Prescricao[] = dadosPrescricoes as Prescricao[];

  listar(filtros?: { pacienteId?: string; medicoId?: string }): Observable<Prescricao[]> {
    let dados = [...this.prescricoes];
    if (filtros?.pacienteId) dados = dados.filter(p => p.pacienteId === filtros.pacienteId);
    if (filtros?.medicoId)   dados = dados.filter(p => p.medicoId === filtros.medicoId);
    return of(dados.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())).pipe(delay(300));
  }

  buscarPorId(id: string): Observable<Prescricao | undefined> {
    return of(this.prescricoes.find(p => p.id === id)).pipe(delay(200));
  }

  criar(prescricao: Omit<Prescricao, 'id'>): Observable<Prescricao> {
    const nova: Prescricao = { ...prescricao, id: `pres${Date.now()}` };
    this.prescricoes = [...this.prescricoes, nova];
    return of(nova).pipe(delay(500));
  }
}
