// =============================================================
// MODELOS CORE — FranPavic Clinics
// Todas as interfaces TypeScript do sistema
// =============================================================

// ─── Utilizador / Auth ───────────────────────────────────────
export type PerfilUtilizador = 'administrador' | 'medico' | 'recepcionista' | 'enfermeira' | 'paciente';

export interface Utilizador {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  perfil: PerfilUtilizador;
  avatar?: string | null;
  telefone?: string;
  departamento?: string;
  especialidadeId?: string;
  medicoId?: string;
  pacienteId?: string;
  ativo: boolean;
  ultimoAcesso?: string;
  criadoEm: string;
}

export interface SessaoAuth {
  utilizador: Utilizador;
  token: string;
  expiracao: string;
}

// ─── Paciente ────────────────────────────────────────────────
export type TipoSanguineo = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type StatusPaciente = 'ativo' | 'inativo';
export type Genero = 'masculino' | 'feminino' | 'outro';

export interface ContatoEmergencia {
  nome: string;
  parentesco: string;
  telefone: string;
}

export interface Seguro {
  empresa: string;
  numero: string;
  validade: string;
}

export interface Paciente {
  id: string;
  numeroPaciente: string;
  nome: string;
  genero: Genero;
  dataNascimento: string;
  bi?: string;
  nuit?: string | null;
  telefone: string;
  email?: string | null;
  endereco: string;
  cidade: string;
  bairro?: string;
  contatoEmergencia: ContatoEmergencia;
  tipoSanguineo: TipoSanguineo;
  alergias: string[];
  seguro?: Seguro | null;
  notasMedicas?: string;
  status: StatusPaciente;
  criadoEm: string;
  ultimaConsulta?: string;
}

// ─── Especialidade ───────────────────────────────────────────
export interface Especialidade {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

// ─── Médico ──────────────────────────────────────────────────
export interface HorarioMedico {
  segunda?: string[];
  terca?: string[];
  quarta?: string[];
  quinta?: string[];
  sexta?: string[];
  sabado?: string[];
}

export interface Medico {
  id: string;
  nome: string;
  crm: string;
  especialidadeId: string;
  especialidade: string;
  telefone: string;
  email: string;
  genero: Genero;
  biografia?: string;
  consultas: number;
  avaliacao: number;
  horario: HorarioMedico;
  duracaoConsulta: number;
  ativo: boolean;
}

// ─── Consulta (Agendamento) ──────────────────────────────────
export type StatusConsulta = 'agendada' | 'em-curso' | 'concluida' | 'cancelada' | 'aguardando' | 'faltou';
export type TipoConsulta = 'consulta' | 'pré-natal' | 'urgência' | 'revisão' | 'follow-up';

export interface Consulta {
  id: string;
  pacienteId: string;
  medicoId: string;
  consultaId?: string | null;
  data: string;
  hora: string;
  tipo: TipoConsulta;
  especialidade: string;
  status: StatusConsulta;
  motivo: string;
  sala?: string;
  observacoes?: string | null;
  duracaoMinutos: number;
  valorConsulta: number;
  criadoEm: string;
}

// ─── Triagem ─────────────────────────────────────────────────
export type EscalaTriagem = 'vermelho' | 'laranja' | 'amarelo' | 'verde' | 'azul';

export interface PressaoArterial {
  sistolica: number;
  diastolica: number;
}

export interface Triagem {
  id: string;
  pacienteId: string;
  enfermeiraId: string;
  consultaId: string;
  data: string;
  peso: number;
  altura: number;
  imc: number;
  temperatura: number;
  pressaoArterial: PressaoArterial;
  frequenciaCardiaca: number;
  saturacaoOxigenio: number;
  glicemia?: number | null;
  frequenciaRespiratoria: number;
  escalaTriagem: EscalaTriagem;
  queixaPrincipal: string;
  observacoes?: string;
  criadoEm: string;
}

// ─── Diagnóstico ─────────────────────────────────────────────
export interface Diagnostico {
  codigo: string;
  descricao: string;
  categoria?: string;
}

// ─── Consulta Médica (Registo Clínico) ───────────────────────
export type StatusRegistoClinico = 'em-progresso' | 'concluida' | 'cancelada';

export interface RegistoClinico {
  id: string;
  pacienteId: string;
  medicoId: string;
  consultaId: string;
  data: string;
  queixas: string;
  diagnosticoPrincipal: Diagnostico;
  diagnosticosSecundarios: Diagnostico[];
  prescricoes: string[];
  pedidosLaboratorio: string[];
  observacoes: string;
  planoSeguimento?: string;
  atestado?: string | null;
  status: StatusRegistoClinico;
  criadoEm: string;
}

// ─── Medicamento ─────────────────────────────────────────────
export interface Medicamento {
  id: string;
  nome: string;
  dose: string;
  forma: string;
  classe: string;
}

export interface ItemPrescricao {
  nome: string;
  dose: string;
  via: string;
  frequencia: string;
  duracao: string;
  instrucoes?: string;
}

export type StatusPrescricao = 'ativa' | 'concluida' | 'cancelada';

export interface Prescricao {
  id: string;
  pacienteId: string;
  medicoId: string;
  consultaId: string;
  data: string;
  medicamentos: ItemPrescricao[];
  observacoes?: string;
  validade: string;
  status: StatusPrescricao;
}

// ─── Pedido Laboratório ──────────────────────────────────────
export type UrgenciaLaboratorio = 'rotina' | 'urgente' | 'muito-urgente';
export type StatusPedidoLab = 'pendente' | 'em-processamento' | 'resultado-disponivel' | 'cancelado';

export interface PedidoLaboratorio {
  id: string;
  pacienteId: string;
  medicoId: string;
  consultaId: string;
  data: string;
  exames: string[];
  urgencia: UrgenciaLaboratorio;
  instrucoes?: string;
  status: StatusPedidoLab;
  resultadoId?: string | null;
}

// ─── Resultado Laboratório ───────────────────────────────────
export type StatusResultado = 'normal' | 'elevado' | 'baixo' | 'critico';

export interface ItemResultado {
  exame: string;
  valor: string;
  unidade: string;
  referencia: string;
  status: StatusResultado;
}

export interface ResultadoLaboratorio {
  id: string;
  pedidoId: string;
  pacienteId: string;
  data: string;
  laboratorio: string;
  tecnico?: string;
  resultados: ItemResultado[];
  observacoes?: string;
  validadoPor?: string;
  status: 'disponivel' | 'pendente';
}

// ─── Pagamento ───────────────────────────────────────────────
export type MetodoPagamento = 'numerário' | 'transferência' | 'seguro' | 'mpesa' | 'emola' | 'cartão';
export type StatusPagamento = 'pendente' | 'pago' | 'cancelado' | 'reembolsado';

export interface ItemPagamento {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

export interface Pagamento {
  id: string;
  pacienteId: string;
  consultaId: string;
  data: string;
  descricao: string;
  itens: ItemPagamento[];
  subtotal: number;
  desconto: number;
  total: number;
  metodoPagamento?: MetodoPagamento | null;
  seguradora?: string;
  estado: StatusPagamento;
  recibo?: string | null;
  operadorId?: string | null;
  criadoEm: string;
}

// ─── Recibo ──────────────────────────────────────────────────
export interface Recibo {
  id: string;
  pagamentoId: string;
  pacienteId: string;
  numero: string;
  data: string;
  total: number;
  emitidoPor: string;
}

// ─── Atestado / Certificado ──────────────────────────────────
export type TipoCertificado = 'atestado-medico' | 'declaracao-medica' | 'licenca-maternidade';

export interface Certificado {
  id: string;
  pacienteId: string;
  medicoId: string;
  consultaId: string;
  numero: string;
  tipo: TipoCertificado;
  data: string;
  diasRepouso?: number | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  cid: string;
  diagnostico: string;
  observacoes: string;
  destinatario?: string;
  crm: string;
  assinatura: string;
  validado: boolean;
}

// ─── Notificação ─────────────────────────────────────────────
export type TipoNotificacao = 'consulta' | 'resultado-laboratorio' | 'prescricao' | 'pagamento' | 'sistema' | 'triagem' | 'lembrete';
export type PrioridadeNotificacao = 'baixa' | 'normal' | 'alta' | 'urgente';

export interface Notificacao {
  id: string;
  destinatarioId: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data: string;
  icone: string;
  prioridade: PrioridadeNotificacao;
  link?: string;
}

// ─── Serviço Clínico ─────────────────────────────────────────
export interface ServicoClinco {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  duracao: number;
  ativo: boolean;
}

// ─── Audit Log ───────────────────────────────────────────────
export type AcaoAudit = 'LOGIN' | 'LOGOUT' | 'CRIAR' | 'EDITAR' | 'EXCLUIR' | 'VER';

export interface AuditLog {
  id: string;
  utilizadorId: string;
  utilizador: string;
  acao: AcaoAudit;
  modulo: string;
  descricao: string;
  ip: string;
  data: string;
}

// ─── Dashboard Statistics ────────────────────────────────────
export interface EstatisticaDashboard {
  titulo: string;
  valor: number | string;
  variacao?: number;
  icone: string;
  cor: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
  link?: string;
}

// ─── Resposta API (para futura integração) ───────────────────
export interface RespostaApi<T> {
  dados: T;
  mensagem?: string;
  pagina?: number;
  totalPaginas?: number;
  total?: number;
  sucesso: boolean;
}

export interface ParametrosPaginacao {
  pagina: number;
  tamanhoPagina: number;
  filtro?: string;
  ordenarPor?: string;
  direcaoOrdem?: 'asc' | 'desc';
}
