export function toPublicUser(user: {
  _id: { toString(): string };
  email: string;
  name: string;
  role: string;
}) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function stripDoc<T extends Record<string, unknown>>(doc: T): Omit<T, "_id" | "__v"> {
  const { _id: _a, __v: _b, ...rest } = doc;
  return rest as Omit<T, "_id" | "__v">;
}
