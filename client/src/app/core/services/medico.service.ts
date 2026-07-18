import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Medico, Especialidade } from '../models';
import dadosMedicos from '../../../assets/mock-data/doctors.json';
import dadosEspecialidades from '../../../assets/mock-data/specialties.json';

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private medicos: Medico[] = dadosMedicos as Medico[];
  private especialidades: Especialidade[] = dadosEspecialidades as Especialidade[];

  listar(filtros?: { especialidadeId?: string; ativo?: boolean }): Observable<Medico[]> {
    let dados = [...this.medicos];
    if (filtros?.especialidadeId) dados = dados.filter(m => m.especialidadeId === filtros.especialidadeId);
    if (filtros?.ativo !== undefined) dados = dados.filter(m => m.ativo === filtros.ativo);
    return of(dados).pipe(delay(300));
  }

  buscarPorId(id: string): Observable<Medico | undefined> {
    return of(this.medicos.find(m => m.id === id)).pipe(delay(200));
  }

  listarEspecialidades(): Observable<Especialidade[]> {
    return of(this.especialidades.filter(e => e.ativo)).pipe(delay(200));
  }

  horariosDisponiveis(medicoId: string, data: string): Observable<string[]> {
    const horarios = ['08:00','08:30','09:00','09:30','10:00','10:30',
                      '11:00','11:30','14:00','14:30','15:00','15:30','16:00'];
    // Simular alguns horários ocupados
    const ocupados = ['09:00','11:00','14:30'];
    return of(horarios.filter(h => !ocupados.includes(h))).pipe(delay(400));
  }

  desempenho(): Observable<{ medicoId: string; nome: string; consultas: number; avaliacao: number }[]> {
    return of(this.medicos.map(m => ({
      medicoId: m.id,
      nome: m.nome,
      consultas: m.consultas,
      avaliacao: m.avaliacao,
    }))).pipe(delay(300));
  }
}
