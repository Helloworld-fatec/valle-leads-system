/**
 * Classe base para todos os erros da aplicação.
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Erro para ser usado quando um recurso específico não é encontrado.
 * Mapeia para um status HTTP 404 (Not Found).
 */
export class RecursoNaoEncontradoError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'RecursoNaoEncontradoError';
  }
}

/**
 * Erro para ser usado quando uma operação é negada por falta de permissão.
 * Mapeia para um status HTTP 403 (Forbidden).
 */
export class AcessoNaoAutorizadoError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'AcessoNaoAutorizadoError';
  }
}