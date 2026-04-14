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

/**
 * Erro para ser usado quando uma operação viola uma regra de negócio.
 * Mapeia para um status HTTP 400 (Bad Request).
 */
export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'RegraDeNegocioError';
 * Erro para ser usado quando há conflito de dados (ex: CPF duplicado, e-mail já cadastrado).
 * Mapeia para um status HTTP 409 (Conflict).
 */
export class ConflitoDeDadosError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'ConflitoDeDadosError';
  }
}

/**
 * Erro para ser usado quando a requisição é inválida (ex: regra de negócio violada).
 * Mapeia para um status HTTP 400 (Bad Request).
 */
export class RequisicaoInvalidaError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'RequisicaoInvalidaError';
  }
}

/**
 * Erro para ser usado quando os dados enviados falham na validação do schema.
 * Mapeia para um status HTTP 422 (Unprocessable Entity).
 */
export class ErroDeValidacaoError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'ErroDeValidacaoError';
  }
}