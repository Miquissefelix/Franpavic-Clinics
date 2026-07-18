import { Injectable, signal } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { PacienteService } from './paciente.service';
import { MedicoService } from './medico.service';
import { ConsultaService } from './consulta.service';

export interface ResultadoBusca {
  tipo: 'paciente' | 'medico' | 'consulta';
  id: string;
  titulo: string;
  subtitulo: string;
  icone: string;
  link: string;
}

@Injectable({ providedIn: 'root' })
export class BuscaGlobalService {
  private _aberta = signal(false);
  readonly aberta = this._aberta.asReadonly();

  constructor(
    private pacienteService: PacienteService,
    private medicoService: MedicoService,
  ) {}

  abrirBusca(): void  { this._aberta.set(true); }
  fecharBusca(): void { this._aberta.set(false); }
  alternarBusca(): void { this._aberta.update(v => !v); }

  buscar(termo: string): Observable<ResultadoBusca[]> {
    if (!termo || termo.length < 2) return of([]);
    const t = termo.toLowerCase();

    return combineLatest([
      this.pacienteService.listarTodos(),
      this.medicoService.listar(),
    ]).pipe(
      delay(200),
      map(([pacientes, medicos]) => {
        const results: ResultadoBusca[] = [];

        pacientes
          .filter(p => p.nome.toLowerCase().includes(t) || p.numeroPaciente.toLowerCase().includes(t))
          .slice(0, 5)
          .forEach(p => results.push({
            tipo: 'paciente', id: p.id,
            titulo: p.nome, subtitulo: `${p.numeroPaciente} · ${p.telefone}`,
            icone: 'person', link: `/recepcao/pacientes/${p.id}`,
          }));

        medicos
          .filter(m => m.nome.toLowerCase().includes(t) || m.especialidade.toLowerCase().includes(t))
          .slice(0, 3)
          .forEach(m => results.push({
            tipo: 'medico', id: m.id,
            titulo: m.nome, subtitulo: m.especialidade,
            icone: 'medical_services', link: `/admin/medicos/${m.id}`,
          }));

        return results;
      })
    );
  }
}
