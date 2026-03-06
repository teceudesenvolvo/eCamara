/**
 * Valida se a URL fornecida pertence ao domínio do YouTube.
 * Suporta formatos padrão (youtube.com) e encurtados (youtu.be).
 *
 * @param {string} url A URL para validar.
 * @return {boolean} True se for uma URL válida do YouTube.
 */
export const validateYoutubeUrl = (url: string): boolean => {
  const regExp = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return regExp.test(url);
};

