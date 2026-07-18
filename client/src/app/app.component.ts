import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TemaService } from './core/theme/tema.service';
import { NotificacaoService } from './core/services/notificacao.service';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent implements OnInit {
  private temaService        = inject(TemaService);
  private authService        = inject(AuthService);
  private notificacaoService = inject(NotificacaoService);

  ngOnInit(): void {
    const utilizador = this.authService.utilizadorAtual();
    if (utilizador) {
      this.notificacaoService.carregarParaUtilizador(utilizador.id).subscribe();
    }
  }
}
