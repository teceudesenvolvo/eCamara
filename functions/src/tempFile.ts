import * as path from "path";
import * as os from "os";
import * as fs from "fs";

/**
 * Gera um caminho de arquivo temporário único.
 * @param {string} extension Extensão do arquivo (ex: .mp3)
 * @return {string} Caminho completo do arquivo temporário
 */
export const getTempFilePath = (extension: string): string => {
  const filename = `audio-${Date.now()}-${Math.random().toString(36).substring(7)}${extension}`;
  return path.join(os.tmpdir(), filename);
};

/**
 * Remove um arquivo se ele existir.
 * @param {string} filePath Caminho do arquivo a ser removido
 */
export const cleanupFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
