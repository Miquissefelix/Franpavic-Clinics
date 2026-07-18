import { Routes } from '@angular/router';
import { authGuard, perfilGuard, loginGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // ─── Redireccionamento raiz ───────────────────────────────
  { path: '', redirectTo: '/entrar', pathMatch: 'full' },

  // ─── Autenticação ────────────────────────────────────────
  {
    path: 'entrar',
    canActivate: [loginGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'recuperar-senha',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },

  // ─── Shell com Layout ────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      // ── Administrador ──────────────────────────────────
      {
        path: 'admin',
        canActivate: [perfilGuard(['administrador'])],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
          { path: 'relatorios', loadComponent: () => import('./features/admin/reports/reports.component').then(m => m.ReportsComponent) },
          { path: 'auditoria',  loadComponent: () => import('./features/admin/audit/audit.component').then(m => m.AuditComponent) },
        ],
      },

      // ── Recepcionista ──────────────────────────────────
      {
        path: 'recepcao',
        canActivate: [perfilGuard(['recepcionista', 'administrador'])],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard',    loadComponent: () => import('./features/receptionist/dashboard/recepcao-dashboard.component').then(m => m.RecepcaoDashboardComponent) },
          { path: 'pacientes',    loadComponent: () => import('./features/receptionist/patients/lista-pacientes.component').then(m => m.ListaPacientesComponent) },
          { path: 'pacientes/novo', loadComponent: () => import('./features/receptionist/patients/form-paciente.component').then(m => m.FormPacienteComponent) },
          { path: 'pacientes/:id', loadComponent: () => import('./features/receptionist/patients/detalhe-paciente.component').then(m => m.DetalhePacienteComponent) },
          { path: 'pacientes/:id/editar', loadComponent: () => import('./features/receptionist/patients/form-paciente.component').then(m => m.FormPacienteComponent) },
          { path: 'consultas',    loadComponent: () => import('./features/receptionist/appointments/lista-consultas.component').then(m => m.ListaConsultasComponent) },
          { path: 'consultas/nova', loadComponent: () => import('./features/receptionist/appointments/form-consulta.component').then(m => m.FormConsultaComponent) },
          { path: 'fila-espera', loadComponent: () => import('./features/receptionist/waiting-queue/fila-espera.component').then(m => m.FilaEsperaComponent) },
          { path: 'pagamentos',  loadComponent: () => import('./features/receptionist/billing/pagamentos.component').then(m => m.PagamentosComponent) },
        ],
      },

      // ── Enfermagem ─────────────────────────────────────
      {
        path: 'enfermagem',
        canActivate: [perfilGuard(['enfermeira', 'administrador'])],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', loadComponent: () => import('./features/nurse/dashboard/enfermagem-dashboard.component').then(m => m.EnfermagemDashboardComponent) },
          { path: 'triagem',   loadComponent: () => import('./features/nurse/triage/lista-triagem.component').then(m => m.ListaTriagemComponent) },
          { path: 'triagem/nova', loadComponent: () => import('./features/nurse/triage/form-triagem.component').then(m => m.FormTriagemComponent) },
          { path: 'triagem/:id', loadComponent: () => import('./features/nurse/triage/form-triagem.component').then(m => m.FormTriagemComponent) },
        ],
      },

      // ── Médico ─────────────────────────────────────────
      {
        path: 'medico',
        canActivate: [perfilGuard(['medico', 'administrador'])],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard',   loadComponent: () => import('./features/doctor/dashboard/medico-dashboard.component').then(m => m.MedicoDashboardComponent) },
          { path: 'agenda',      loadComponent: () => import('./features/doctor/calendar/agenda-medico.component').then(m => m.AgendaMedicoComponent) },
          { path: 'consultas',   loadComponent: () => import('./features/doctor/consultations/lista-consulta-medico.component').then(m => m.ListaConsultaMedicoComponent) },
          { path: 'consultas/:id', loadComponent: () => import('./features/doctor/consultations/consulta-medica.component').then(m => m.ConsultaMedicaComponent) },
          { path: 'pacientes/:id', loadComponent: () => import('./features/doctor/patient-emr/emr-paciente.component').then(m => m.EmrPacienteComponent) },
          { path: 'prescricoes', loadComponent: () => import('./features/doctor/prescriptions/prescricoes.component').then(m => m.PrescricoesComponent) },
          { path: 'certificados', loadComponent: () => import('./features/doctor/certificates/certificados.component').then(m => m.CertificadosComponent) },
        ],
      },

      // ── Portal do Paciente ─────────────────────────────
      {
        path: 'portal',
        canActivate: [perfilGuard(['paciente', 'administrador'])],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard',   loadComponent: () => import('./features/patient-portal/dashboard/portal-dashboard.component').then(m => m.PortalDashboardComponent) },
          { path: 'consultas',   loadComponent: () => import('./features/patient-portal/appointments/minhas-consultas.component').then(m => m.MinhasConsultasComponent) },
          { path: 'agendar',     loadComponent: () => import('./features/patient-portal/book-appointment/agendar-consulta.component').then(m => m.AgendarConsultaComponent) },
          { path: 'historico',   loadComponent: () => import('./features/patient-portal/history/historico-clinico.component').then(m => m.HistoricoClinicoComponent) },
          { path: 'prescricoes', loadComponent: () => import('./features/patient-portal/prescriptions/minhas-prescricoes.component').then(m => m.MinhasPrescricoesComponent) },
          { path: 'resultados',  loadComponent: () => import('./features/patient-portal/lab-results/meus-resultados.component').then(m => m.MeusResultadosComponent) },
          { path: 'perfil',      loadComponent: () => import('./features/patient-portal/profile/perfil-paciente.component').then(m => m.PerfilPacienteComponent) },
        ],
      },

      // ── Erros ──────────────────────────────────────────
      { path: 'erro/403', loadComponent: () => import('./features/errors/forbidden/forbidden.component').then(m => m.ForbiddenComponent) },
      { path: 'erro/500', loadComponent: () => import('./features/errors/server-error/server-error.component').then(m => m.ServerErrorComponent) },
    ],
  },

  // ─── 404 ─────────────────────────────────────────────────
  { path: '**', loadComponent: () => import('./features/errors/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
