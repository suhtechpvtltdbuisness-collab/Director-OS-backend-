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
    if (!u.email?.trim() || !u.name?.trim() || !u.password) {
      throw new Error(`Invalid seed user config for role=${u.role}`);
    }

    const passwordHash = await hashPassword(u.password);
    await User.findOneAndUpdate(
      { email: u.email.toLowerCase() },
      {
        $set: {
          email: u.email.toLowerCase(),
          name: u.name,
          role: u.role,
          passwordHash,
        },
        $setOnInsert: {
          otpHash: null,
          otpExpiresAt: null,
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
  }
}
