import { connectDatabase } from "../config/db";
import { env } from "../config/env";
import { ensureSeedUsers } from "./ensureUsers";
import { Product } from "../models/Product";
import { Developer } from "../models/Developer";
import { Project } from "../models/Project";
import { Client } from "../models/Client";
import { Lead } from "../models/Lead";
import { Campaign } from "../models/Campaign";
import { Ticket } from "../models/Ticket";
import { Invoice } from "../models/Invoice";
import { Approval } from "../models/Approval";
import { Alert } from "../models/Alert";
import { Activity } from "../models/Activity";
import { DocumentModel } from "../models/Document";
import { Task } from "../models/Task";
import { RevenuePoint } from "../models/RevenuePoint";
import {
  SEED_PRODUCTS,
  SEED_DEVS,
  SEED_PROJECTS,
  SEED_CLIENTS,
  SEED_LEADS,
  SEED_CAMPAIGNS,
  SEED_TICKETS,
  SEED_INVOICES,
  SEED_APPROVALS,
  SEED_ALERTS,
  SEED_ACTIVITY,
  SEED_DOCUMENTS,
  SEED_TASKS,
  SEED_REVENUE,
} from "../data/seedData";

async function upsertMany<T extends { id?: string; month?: string }>(
  model: { deleteMany: (q: object) => Promise<unknown>; insertMany: (docs: T[]) => Promise<unknown> },
  docs: T[],
): Promise<void> {
  await model.deleteMany({});
  if (docs.length) await model.insertMany(docs);
}

async function seed(): Promise<void> {
  await connectDatabase(env.mongoUri);
  await ensureSeedUsers();

  await upsertMany(Product, SEED_PRODUCTS);
  await upsertMany(Developer, SEED_DEVS);
  await upsertMany(Project, SEED_PROJECTS);
  await upsertMany(Client, SEED_CLIENTS);
  await upsertMany(Lead, SEED_LEADS);
  await upsertMany(Campaign, SEED_CAMPAIGNS);
  await upsertMany(Ticket, SEED_TICKETS);
  await upsertMany(Invoice, SEED_INVOICES);
  await upsertMany(Approval, SEED_APPROVALS);
  await upsertMany(Alert, SEED_ALERTS);
  await upsertMany(Activity, SEED_ACTIVITY);
  await upsertMany(DocumentModel, SEED_DOCUMENTS);
  await upsertMany(Task, SEED_TASKS);
  await upsertMany(RevenuePoint, SEED_REVENUE);

  console.log("Director OS seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
