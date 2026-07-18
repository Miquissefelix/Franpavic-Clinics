import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { BuscaGlobalService, ResultadoBusca } from '../../core/services/busca-global.service';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, MatProgressSpinnerModule],
  template: `
    @if (aberta()) {
      <div class="search-overlay" (click)="fechar()">
        <div class="search-modal" (click)="$event.stopPropagation()">
          <div class="search-input-row">
            <mat-icon>search</mat-icon>
            <input
              #inputBusca
              type="text"
              [(ngModel)]="termo"
              (ngModelChange)="onTermo($event)"
              placeholder="Pesquisar pacientes, médicos, consultas..."
              autofocus
              class="search-input"
            />
            @if (carregando()) {
              <mat-spinner diameter="18"></mat-spinner>
            }
            <kbd class="esc-key" (click)="fechar()">ESC</kbd>
          </div>

          @if (resultados().length > 0) {
            <div class="search-results">
              @for (grupo of grupos(); track grupo.tipo) {
                <div class="result-group">
                  <span class="group-label">{{ grupo.label }}</span>
                  @for (r of grupo.items; track r.id) {
                    <a class="result-item" [routerLink]="r.link" (click)="fechar()">
                      <div class="result-icon">
                        <mat-icon>{{ r.icone }}</mat-icon>
                      </div>
                      <div class="result-content">
                        <span class="result-titulo">{{ r.titulo }}</span>
                        <span class="result-sub">{{ r.subtitulo }}</span>
                      </div>
                      <mat-icon class="result-arrow">chevron_right</mat-icon>
                    </a>
                  }
                </div>
              }
            </div>
          } @else if (termo.length >= 2 && !carregando()) {
            <div class="search-empty">
              <mat-icon>search_off</mat-icon>
              <p>Nenhum resultado para "<strong>{{ termo }}</strong>"</p>
            </div>
          } @else if (termo.length === 0) {
            <div class="search-hints">
              <p class="hint-title">Sugestões de busca</p>
              <div class="hints">
                <span class="hint-chip" (click)="buscarDireto('João')">João Nhantumbo</span>
                <span class="hint-chip" (click)="buscarDireto('FPC-2024')">FPC-2024-0001</span>
                <span class="hint-chip" (click)="buscarDireto('Cardiologia')">Cardiologia</span>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .search-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      z-index: var(--z-modal);
      display: flex; align-items: flex-start; justify-content: center;
      padding-top: 80px;
      animation: fadeIn 0.15s ease;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { from { opacity:0; transform: translateY(-10px); } to { opacity:1; transform:translateY(0); } }

    .search-modal {
      width: 100%; max-width: 620px;
      background: var(--surface-card);
      border-radius: var(--border-radius-xl);
      box-shadow: var(--shadow-2xl);
      overflow: hidden;
      animation: slideDown 0.2s ease;
      border: 1px solid var(--border-color);
    }

    .search-input-row {
      display: flex; align-items: center; gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      mat-icon { color: var(--text-tertiary); font-size: 22px; }
      .search-input {
        flex: 1; border: none; background: none; outline: none;
        font-size: 16px; color: var(--text-primary); font-family: var(--font-family);
        &::placeholder { color: var(--text-tertiary); }
      }
    }

    .esc-key {
      padding: 2px 8px; border-radius: 4px; font-size: 11px;
      background: var(--color-neutral-200); color: var(--text-tertiary);
      border: 1px solid var(--border-color); cursor: pointer; font-family: inherit;
      &:hover { background: var(--color-neutral-300); }
    }

    .search-results { max-height: 400px; overflow-y: auto; padding: 8px 0; }

    .result-group { margin-bottom: 4px; }

    .group-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      color: var(--text-tertiary); letter-spacing: 0.08em;
      padding: 8px 20px 4px; display: block;
    }

    .result-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 20px; text-decoration: none;
      transition: var(--transition-fast); cursor: pointer;
      &:hover { background: var(--color-neutral-50); }
      [data-theme="dark"] &:hover { background: var(--color-neutral-800); }
    }

    .result-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: var(--color-primary-100);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 18px; color: var(--color-primary-600); }
    }

    .result-content { flex: 1; min-width: 0; }
    .result-titulo  { font-size: 14px; font-weight: 500; color: var(--text-primary); display: block; }
    .result-sub     { font-size: 12px; color: var(--text-tertiary); display: block; }
    .result-arrow   { color: var(--text-tertiary); font-size: 18px !important; }

    .search-empty, .search-hints {
      padding: 24px 20px; text-align: center;
      mat-icon { font-size: 40px; color: var(--text-tertiary); opacity: 0.5; }
      p { font-size: 14px; color: var(--text-secondary); margin-top: 8px; }
    }

    .hint-title { font-size: 12px; color: var(--text-tertiary); margin-bottom: 12px; text-align: left; }
    .hints { display: flex; gap: 8px; flex-wrap: wrap; }
    .hint-chip {
      padding: 4px 12px; border-radius: 99px; font-size: 12px;
      background: var(--color-neutral-100); color: var(--text-secondary);
      cursor: pointer; border: 1px solid var(--border-color);
      &:hover { background: var(--color-primary-100); color: var(--color-primary-700); border-color: var(--color-primary-300); }
    }
  `],
})
export class GlobalSearchComponent implements OnDestroy {
  private buscaService = inject(BuscaGlobalService);
  private destroy$     = new Subject<void>();
  private termo$       = new Subject<string>();

  aberta    = this.buscaService.aberta;
  termo     = '';
  resultados = signal<ResultadoBusca[]>([]);
  carregando = signal(false);

  grupos = computed(() => {
    const tipos = ['paciente', 'medico', 'consulta'] as const;
    const labels: Record<string, string> = { paciente: 'Pacientes', medico: 'Médicos', consulta: 'Consultas' };
    return tipos
      .map(tipo => ({
        tipo,
        label: labels[tipo],
        items: this.resultados().filter(r => r.tipo === tipo),
      }))
      .filter(g => g.items.length > 0);
  });

  constructor() {
    this.termo$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(t => {
        this.carregando.set(true);
        return this.buscaService.buscar(t);
      }),
      takeUntil(this.destroy$),
    ).subscribe(r => {
      this.resultados.set(r);
      this.carregando.set(false);
    });
  }

  onTermo(t: string): void { this.termo$.next(t); }
  fechar(): void { this.buscaService.fecharBusca(); this.termo = ''; this.resultados.set([]); }
  buscarDireto(t: string): void { this.termo = t; this.termo$.next(t); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
