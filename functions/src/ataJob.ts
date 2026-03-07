export interface AtaJob {
  id: string;
  storagePath: string;
  sessaoId: string;
  status: "pending" | "processing" | "completed" | "error";
  createdAt: number;
  transcription?: string;
  ata?: string;
  error?: string;
}
