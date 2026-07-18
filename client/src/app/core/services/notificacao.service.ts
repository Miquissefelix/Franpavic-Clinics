import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Notificacao } from '../models';
import { AuthService } from '../auth/auth.service';
import dadosNotificacoes from '../../../assets/mock-data/notifications.json';

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private todas: Notificacao[] = dadosNotificacoes as Notificacao[];
  private _notificacoes = signal<Notificacao[]>([]);

  readonly notificacoes = this._notificacoes.asReadonly();
  readonly naoLidas = computed(() => this._notificacoes().filter(n => !n.lida).length);

  constructor(private auth: AuthService) {
    this.auth.utilizadorAtual() && this.carregarParaUtilizador(this.auth.utilizadorAtual()!.id);
  }

  carregarParaUtilizador(utilizadorId: string): Observable<Notificacao[]> {
    const dados = this.todas
      .filter(n => n.destinatarioId === utilizadorId)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    return of(dados).pipe(
      delay(300),
      tap(n => this._notificacoes.set(n))
    );
  }

  marcarLida(id: string): Observable<boolean> {
    this._notificacoes.update(ns => ns.map(n => n.id === id ? { ...n, lida: true } : n));
    return of(true).pipe(delay(100));
  }

  marcarTodasLidas(): Observable<boolean> {
    this._notificacoes.update(ns => ns.map(n => ({ ...n, lida: true })));
    return of(true).pipe(delay(200));
  }

  adicionar(notificacao: Omit<Notificacao, 'id'>): void {
    const nova: Notificacao = { ...notificacao, id: `not${Date.now()}` };
    this._notificacoes.update(ns => [nova, ...ns]);
  }
}
