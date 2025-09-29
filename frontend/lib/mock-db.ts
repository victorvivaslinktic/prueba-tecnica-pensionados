type User = {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
};

const g = globalThis as any;
if (!g.__MOCK_DB__) {
  g.__MOCK_DB__ = {
    users: [
      {
        id: "u_1",
        email: "demo@livecode.dev",
        name: "Demo User",
        password: "secret123",
        createdAt: new Date().toISOString(),
      },
    ] as User[],
  };
}
const db = g.__MOCK_DB__ as { users: User[] };

export function findUserByEmail(email: string) {
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}
export function findUserById(id: string) {
  return db.users.find(u => u.id === id);
}
export function updateUserName(id: string, name: string) {
  const u = db.users.find(x => x.id === id);
  if (u) u.name = name;
  return u;
}
