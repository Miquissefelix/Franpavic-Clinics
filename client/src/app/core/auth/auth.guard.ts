import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { PerfilUtilizador } from '../models';

// ─── Guard Autenticação ──────────────────────────────────────
export const authGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.estaAutenticado()) {
    router.navigate(['/entrar'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  return true;
};

// ─── Guard por Perfil ────────────────────────────────────────
export function perfilGuard(perfisPermitidos: PerfilUtilizador[]): CanActivateFn {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    if (!auth.estaAutenticado()) {
      router.navigate(['/entrar']);
      return false;
    }

    if (!auth.temPermissao(perfisPermitidos)) {
      router.navigate(['/erro/403']);
      return false;
    }

    return true;
  };
}

// ─── Guard Login (redireciona se já autenticado) ─────────────
export const loginGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.estaAutenticado()) {
    const perfil = auth.perfil();
    if (perfil) {
      const rota = auth.getRoteamentoPorPerfil(perfil);
      router.navigate([rota]);
      return false;
    }
  }
  return true;
};
