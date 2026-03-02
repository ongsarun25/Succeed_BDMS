export interface User {
  id: number;
  username: string;
  password: string;
}

export const mockUsers: User[] = [
  { id: 1, username: "alice", password: "wonderland" },
  { id: 2, username: "bob", password: "builder" },
];