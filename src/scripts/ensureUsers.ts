import { env } from "../config/env";
import { User } from "../models/User";
import { hashPassword } from "../utils/hash";

export async function ensureSeedUsers(): Promise<void> {
  const users = [
    {
      email: env.directorEmail,
      name: env.directorName,
      password: env.directorPassword,
      role: "director" as const,
    },
    {
      email: env.managerEmail,
      name: env.managerName,
      password: env.managerPassword,
      role: "manager" as const,
    },
  ];

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      existing.name = u.name;
      existing.role = u.role;
      existing.passwordHash = await hashPassword(u.password);
      await existing.save();
      continue;
    }
    await User.create({
      email: u.email,
      name: u.name,
      role: u.role,
      passwordHash: await hashPassword(u.password),
    });
  }
}
