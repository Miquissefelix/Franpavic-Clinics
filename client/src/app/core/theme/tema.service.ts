import { Injectable, signal, effect } from '@angular/core';

export type Tema = 'claro' | 'escuro' | 'sistema';

@Injectable({ providedIn: 'root' })
export class TemaService {
  private readonly STORAGE_KEY = 'fpv_tema';
  private _tema = signal<Tema>(this.carregarTema());
  readonly tema = this._tema.asReadonly();

  constructor() {
    effect(() => {
      this.aplicarTema(this._tema());
    });

    // Listener para mudança de preferência do sistema
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (this._tema() === 'sistema') {
          this.aplicarTema('sistema');
        }
      });
  }

  definirTema(tema: Tema): void {
    localStorage.setItem(this.STORAGE_KEY, tema);
    this._tema.set(tema);
  }

  private aplicarTema(tema: Tema): void {
    const prefereSistemaEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const escuro = tema === 'escuro' || (tema === 'sistema' && prefereSistemaEscuro);
    document.documentElement.setAttribute('data-theme', escuro ? 'dark' : 'light');
  }

  private carregarTema(): Tema {
    return (localStorage.getItem(this.STORAGE_KEY) as Tema) ?? 'claro';
  }

  get temaEfetivo(): 'claro' | 'escuro' {
    const t = this._tema();
    if (t === 'sistema') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
    }
    return t as 'claro' | 'escuro';
  }
}
