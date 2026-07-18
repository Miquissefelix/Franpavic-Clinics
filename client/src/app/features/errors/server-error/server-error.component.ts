import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({ selector:'app-server-error', standalone:true, imports:[CommonModule,RouterLink,MatIconModule,MatButtonModule],
  template:`<div class="error-page"><div class="error-content"><div class="error-code">500</div><div class="error-icon"><mat-icon>error_outline</mat-icon></div><h1>Erro no Servidor</h1><p>Ocorreu um erro interno. Tente novamente mais tarde.</p><button mat-flat-button color="primary" routerLink="/"><mat-icon>home</mat-icon> Voltar</button></div></div>`,
  styles:[`
    .error-page { display:flex; align-items:center; justify-content:center; min-height:100vh; background:var(--surface-background); padding:24px; }
    .error-content { text-align:center; max-width:400px; }
    .error-code { font-size:120px; font-weight:800; color:var(--color-danger-100); line-height:1; }
    .error-icon { margin-top:-20px; margin-bottom:16px; }
    .error-icon mat-icon { font-size:64px; width:64px; height:64px; color:var(--color-danger-500); }
    .error-content h1 { font-size:28px; font-weight:700; margin:0 0 12px; color:var(--text-primary); }
    .error-content p { font-size:16px; color:var(--text-secondary); margin:0 0 28px; }
  `],
})
export class ServerErrorComponent {}
