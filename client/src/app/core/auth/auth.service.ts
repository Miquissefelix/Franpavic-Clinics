import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Utilizador, SessaoAuth, PerfilUtilizador } from '../models';
import utilizadoresData from '../../../assets/mock-data/users.json';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'fpv_token';
  private readonly USER_KEY  = 'fpv_user';

  // ─── Signals ─────────────────────────────────────────────
  private _utilizadorAtual = signal<Utilizador | null>(this.carregarUtilizadorStorage());
  private _carregando      = signal<boolean>(false);

  readonly utilizadorAtual = this._utilizadorAtual.asReadonly();
  readonly carregando      = this._carregando.asReadonly();
  readonly estaAutenticado = computed(() => this._utilizadorAtual() !== null);
  readonly perfil          = computed(() => this._utilizadorAtual()?.perfil ?? null);
  readonly nomeUtilizador  = computed(() => this._utilizadorAtual()?.nome ?? '');

  constructor(private router: Router) {}

  // ─── Login ───────────────────────────────────────────────
  login(email: string, senha: string): Observable<SessaoAuth> {
    this._carregando.set(true);

    const utilizador = (utilizadoresData as Utilizador[]).find(
      u => u.email === email && u.senha === senha && u.ativo
    );

    if (!utilizador) {
      this._carregando.set(false);
      return throwError(() => new Error('Credenciais inválidas. Verifique o email e a senha.'));
    }

    const sessao: SessaoAuth = {
      utilizador,
      token: `mock_token_${utilizador.id}_${Date.now()}`,
      expiracao: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    };

    return of(sessao).pipe(
      delay(800),
      tap(s => {
        localStorage.setItem(this.TOKEN_KEY, s.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(s.utilizador));
        this._utilizadorAtual.set(s.utilizador);
        this._carregando.set(false);
      })
    );
  }

  // ─── Logout ──────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._utilizadorAtual.set(null);
    this.router.navigate(['/entrar']);
  }

  // ─── Rota por Perfil ─────────────────────────────────────
  getRoteamentoPorPerfil(perfil: PerfilUtilizador): string {
    const rotas: Record<PerfilUtilizador, string> = {
      administrador: '/admin/dashboard',
      medico:        '/medico/dashboard',
      recepcionista: '/recepcao/dashboard',
      enfermeira:    '/enfermagem/dashboard',
      paciente:      '/portal/dashboard',
    };
    return rotas[perfil] ?? '/entrar';
  }

  // ─── Verificar Permissão ─────────────────────────────────
  temPermissao(perfisPermitidos: PerfilUtilizador[]): boolean {
    const perfil = this._utilizadorAtual()?.perfil;
    return perfil ? perfisPermitidos.includes(perfil) : false;
  }

  // ─── Token ───────────────────────────────────────────────
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private carregarUtilizadorStorage(): Utilizador | null {
    try {
      const dados = localStorage.getItem(this.USER_KEY);
      return dados ? JSON.parse(dados) : null;
    } catch {
      return null;
    }
  }
}
