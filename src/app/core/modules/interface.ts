export type Note = {
  id: string;
  done: boolean;
  isPinned?: boolean;
  description: string | null;
  dateDone: Date;
};
