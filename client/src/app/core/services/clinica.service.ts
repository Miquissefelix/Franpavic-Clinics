import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PedidoLaboratorio, ResultadoLaboratorio, RegistoClinico, Certificado } from '../models';
import pedidosData from '../../../assets/mock-data/laboratory-requests.json';
import resultadosData from '../../../assets/mock-data/laboratory-results.json';
import consultasData from '../../../assets/mock-data/consultations.json';
import certificadosData from '../../../assets/mock-data/medical-certificates.json';

@Injectable({ providedIn: 'root' })
export class ClinicaService {
  private pedidos: PedidoLaboratorio[]      = pedidosData as PedidoLaboratorio[];
  private resultados: ResultadoLaboratorio[] = resultadosData as ResultadoLaboratorio[];
  private registos: RegistoClinico[]         = consultasData as RegistoClinico[];
  private certificados: Certificado[]        = certificadosData as Certificado[];

  // ─── Pedidos de Laboratório ──────────────────────────────
  listarPedidos(pacienteId?: string): Observable<PedidoLaboratorio[]> {
    let dados = [...this.pedidos];
    if (pacienteId) dados = dados.filter(p => p.pacienteId === pacienteId);
    return of(dados).pipe(delay(300));
  }

  criarPedido(pedido: Omit<PedidoLaboratorio, 'id'>): Observable<PedidoLaboratorio> {
    const novo: PedidoLaboratorio = { ...pedido, id: `lab-req${Date.now()}` };
    this.pedidos = [...this.pedidos, novo];
    return of(novo).pipe(delay(400));
  }

  // ─── Resultados ──────────────────────────────────────────
  listarResultados(pacienteId?: string): Observable<ResultadoLaboratorio[]> {
    let dados = [...this.resultados];
    if (pacienteId) dados = dados.filter(r => r.pacienteId === pacienteId);
    return of(dados.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())).pipe(delay(300));
  }

  buscarResultado(id: string): Observable<ResultadoLaboratorio | undefined> {
    return of(this.resultados.find(r => r.id === id)).pipe(delay(200));
  }

  // ─── Registos Clínicos / Consultas ───────────────────────
  listarRegistos(pacienteId?: string): Observable<RegistoClinico[]> {
    let dados = [...this.registos];
    if (pacienteId) dados = dados.filter(r => r.pacienteId === pacienteId);
    return of(dados.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())).pipe(delay(300));
  }

  buscarRegisto(id: string): Observable<RegistoClinico | undefined> {
    return of(this.registos.find(r => r.id === id)).pipe(delay(200));
  }

  criarRegisto(registo: Omit<RegistoClinico, 'id' | 'criadoEm'>): Observable<RegistoClinico> {
    const novo: RegistoClinico = {
      ...registo,
      id: `cons${Date.now()}`,
      criadoEm: new Date().toISOString(),
    };
    this.registos = [...this.registos, novo];
    return of(novo).pipe(delay(500));
  }

  // ─── Certificados ────────────────────────────────────────
  listarCertificados(pacienteId?: string): Observable<Certificado[]> {
    let dados = [...this.certificados];
    if (pacienteId) dados = dados.filter(c => c.pacienteId === pacienteId);
    return of(dados.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())).pipe(delay(300));
  }

  criarCertificado(cert: Omit<Certificado, 'id' | 'numero'>): Observable<Certificado> {
    const novo: Certificado = {
      ...cert,
      id: `cert${Date.now()}`,
      numero: `ATM-2025-${String(this.certificados.length + 1).padStart(4, '0')}`,
    };
    this.certificados = [...this.certificados, novo];
    return of(novo).pipe(delay(400));
  }
}
