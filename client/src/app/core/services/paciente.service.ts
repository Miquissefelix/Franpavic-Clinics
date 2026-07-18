import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Paciente, ParametrosPaginacao, RespostaApi } from '../models';
import dadosPacientes from '../../../assets/mock-data/patients.json';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private pacientes: Paciente[] = dadosPacientes as Paciente[];

  listar(params?: Partial<ParametrosPaginacao>): Observable<RespostaApi<Paciente[]>> {
    let dados = [...this.pacientes];

    if (params?.filtro) {
      const termo = params.filtro.toLowerCase();
      dados = dados.filter(p =>
        p.nome.toLowerCase().includes(termo) ||
        p.numeroPaciente.toLowerCase().includes(termo) ||
        p.telefone.includes(termo) ||
        p.bi?.toLowerCase().includes(termo)
      );
    }

    const total = dados.length;
    const pagina = params?.pagina ?? 1;
    const tamanho = params?.tamanhoPagina ?? 10;
    const inicio = (pagina - 1) * tamanho;
    const dadosPaginados = dados.slice(inicio, inicio + tamanho);

    return of({
      dados: dadosPaginados,
      total,
      pagina,
      totalPaginas: Math.ceil(total / tamanho),
      sucesso: true,
    }).pipe(delay(400));
  }

  listarTodos(): Observable<Paciente[]> {
    return of(this.pacientes).pipe(delay(300));
  }

  buscarPorId(id: string): Observable<Paciente | undefined> {
    return of(this.pacientes.find(p => p.id === id)).pipe(delay(250));
  }

  buscarPorNome(termo: string): Observable<Paciente[]> {
    const t = termo.toLowerCase();
    return of(this.pacientes.filter(p => p.nome.toLowerCase().includes(t))).pipe(delay(200));
  }

  criar(paciente: Omit<Paciente, 'id' | 'numeroPaciente' | 'criadoEm'>): Observable<Paciente> {
    const novo: Paciente = {
      ...paciente,
      id: `pac${Date.now()}`,
      numeroPaciente: `FPC-2025-${String(this.pacientes.length + 1).padStart(4, '0')}`,
      criadoEm: new Date().toISOString(),
    } as Paciente;
    this.pacientes = [...this.pacientes, novo];
    return of(novo).pipe(delay(500));
  }

  atualizar(id: string, dados: Partial<Paciente>): Observable<Paciente> {
    const idx = this.pacientes.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Paciente não encontrado');
    this.pacientes[idx] = { ...this.pacientes[idx], ...dados };
    return of(this.pacientes[idx]).pipe(delay(400));
  }

  excluir(id: string): Observable<boolean> {
    this.pacientes = this.pacientes.filter(p => p.id !== id);
    return of(true).pipe(delay(300));
  }

  estatisticas(): Observable<{ total: number; ativos: number; inativos: number; hoje: number }> {
    const hoje = new Date().toDateString();
    return of({
      total: this.pacientes.length,
      ativos: this.pacientes.filter(p => p.status === 'ativo').length,
      inativos: this.pacientes.filter(p => p.status === 'inativo').length,
      hoje: this.pacientes.filter(p => new Date(p.criadoEm).toDateString() === hoje).length,
    }).pipe(delay(200));
  }
}
