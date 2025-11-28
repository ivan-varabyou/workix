/**
 * Users Controller Response Interfaces
 * Интерфейсы для ответов контроллера пользователей
 *
 * Правило: В интерфейсах НЕ используются импорты, только примитивные типы и другие интерфейсы
 */

/**
 * Update Avatar Request Body
 */
export interface UpdateAvatarRequestBody {
  avatarUrl: string;
  fileKey?: string;
}
