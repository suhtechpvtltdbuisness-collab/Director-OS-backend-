import type { NextFunction, Response } from "express";
import { z } from "zod";
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
import { AppError } from "../middleware/errorHandler";
import type { AuthRequest } from "../middleware/authenticate";
import { leanList, leanOne, logActivity } from "../utils/helpers";

function zodNext(error: unknown, next: NextFunction): void {
  if (error instanceof z.ZodError) {
    next(new AppError(error.errors[0]?.message ?? "Invalid input", 400));
    return;
  }
  next(error);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// —— Products ——
export async function listProducts(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await Product.find().sort({ name: 1 });
    res.json({ items: leanList(items) });
  } catch (e) { next(e); }
}

// —— Developers ——
export async function listDevs(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await Developer.find().sort({ name: 1 });
    res.json({ items: leanList(items) });
  } catch (e) { next(e); }
}

// —— Projects ——
export async function listProjects(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await Project.find().sort({ deadline: 1 });
    res.json({ items: leanList(items) });
  } catch (e) { next(e); }
}

export async function createProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = z.object({
      name: z.string().trim().min(1),
      product: z.string().trim().min(1),
      owner: z.string().trim().min(1),
      deadline: z.string().optional(),
    }).parse(req.body);
    const item = await Project.create({
      id: "pr" + Date.now(),
      name: body.name,
      product: body.product,
      owner: body.owner,
      health: "Green",
      progress: 0,
      deadline: body.deadline || "2026-10-01",
      deployStatus: "Dev",
      codeStatus: "Not started",
      risk: "Low",
    });
    await logActivity(req, `created project '${item.name}'`, "Projects");
    res.status(201).json({ item: leanOne(item) });
  } catch (e) { zodNext(e, next); }
}

export async function updateProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = z.object({
      progress: z.number().min(0).max(100).optional(),
      health: z.string().optional(),
      deployStatus: z.string().optional(),
      codeStatus: z.string().optional(),
      risk: z.string().optional(),
      deadline: z.string().optional(),
    }).parse(req.body);
    const item = await Project.findOneAndUpdate({ id: req.params.id }, body, { new: true });
    if (!item) throw new AppError("Project not found", 404);
    res.json({ item: leanOne(item) });
  } catch (e) { zodNext(e, next); }
}

// —— Clients ——
export async function listClients(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await Client.find().sort({ name: 1 });
    res.json({ items: leanList(items) });
  } catch (e) { next(e); }
}

// —— Leads ——
export async function listLeads(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await Lead.find().sort({ updated: -1 });
    res.json({ items: leanList(items) });
  } catch (e) { next(e); }
}

export async function createLead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = z.object({
      name: z.string().trim().min(1),
      product: z.string().trim().min(1),
      value: z.number().optional(),
      source: z.string().optional(),
      owner: z.string().optional(),
      stage: z.string().optional(),
    }).parse(req.body);
    const item = await Lead.create({
      id: "l" + Date.now(),
      name: body.name,
      product: body.product,
      value: body.value ?? 0,
      source: body.source ?? "Website",
      stage: body.stage ?? "New",
      owner: body.owner ?? "",
      updated: today(),
    });
    await logActivity(req, `added new lead '${item.name}'`, "CRM");
    res.status(201).json({ item: leanOne(item) });
  } catch (e) { zodNext(e, next); }
}

export async function updateLead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = z.object({
      stage: z.string().optional(),
      value: z.number().optional(),
      owner: z.string().optional(),
      product: z.string().optional(),
      name: z.string().optional(),
    }).parse(req.body);
    const item = await Lead.findOneAndUpdate(
      { id: req.params.id },
      { ...body, updated: today() },
      { new: true },
    );
    if (!item) throw new AppError("Lead not found", 404);
    if (body.stage) await logActivity(req, `moved lead '${item.name}' to ${body.stage}`, "CRM");
    res.json({ item: leanOne(item) });
  } catch (e) { zodNext(e, next); }
}

export async function deleteLead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const item = await Lead.findOneAndDelete({ id: req.params.id });
    if (!item) throw new AppError("Lead not found", 404);
    await logActivity(req, `removed lead '${item.name}'`, "CRM");
    res.json({ message: "Deleted", id: item.id });
  } catch (e) { next(e); }
}

// —— Campaigns ——
export async function listCampaigns(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await Campaign.find().sort({ start: -1 });
    res.json({ items: leanList(items) });
  } catch (e) { next(e); }
}

export async function createCampaign(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = z.object({
      name: z.string().trim().min(1),
      product: z.string().trim().min(1),
      channel: z.string().optional(),
      budget: z.number().optional(),
      status: z.string().optional(),
    }).parse(req.body);
    const item = await Campaign.create({
      id: "cm" + Date.now(),
      name: body.name,
      product: body.product,
      channel: body.channel || "Multi-channel",
      budget: body.budget ?? 0,
      spend: 0,
      leads: 0,
      conversions: 0,
      status: body.status ?? "Active",
      start: today(),
      end: "",
    });
    await logActivity(req, `created campaign '${item.name}'`, "Marketing");
    res.status(201).json({ item: leanOne(item) });
  } catch (e) { zodNext(e, next); }
}

export async function deleteCampaign(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const item = await Campaign.findOneAndDelete({ id: req.params.id });
    if (!item) throw new AppError("Campaign not found", 404);
    await logActivity(req, `archived campaign '${item.name}'`, "Marketing");
    res.json({ message: "Deleted", id: item.id });
  } catch (e) { next(e); }
}

// —— Tickets ——
export async function listTickets(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await Ticket.find().sort({ updated: -1 });
    res.json({ items: leanList(items) });
  } catch (e) { next(e); }
}

export async function updateTicket(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = z.object({
      status: z.string().optional(),
      priority: z.string().optional(),
    }).parse(req.body);
    const item = await Ticket.findOneAndUpdate(
      { id: req.params.id },
      { ...body, updated: today() },
      { new: true },
    );
    if (!item) throw new AppError("Ticket not found", 404);
    if (body.status) await logActivity(req, `updated ticket ${item.id} to ${body.status}`, "Support");
    res.json({ item: leanOne(item) });
  } catch (e) { zodNext(e, next); }
}

// —— Finance ——
export async function listInvoices(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await Invoice.find().sort({ dueDate: 1 });
    res.json({ items: leanList(items) });
  } catch (e) { next(e); }
}

export async function listRevenue(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await RevenuePoint.find();
    res.json({ items: leanList(items) });
  } catch (e) { next(e); }
}

export async function escalateInvoice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const item = await Invoice.findOne({ id: req.params.id });
    if (!item) throw new AppError("Invoice not found", 404);
    await logActivity(req, `approved payment reminder escalation for ${item.id}`, "Finance");
    res.json({ message: "Escalation recorded", item: leanOne(item) });
  } catch (e) { next(e); }
}

// —— Approvals ——
export async function listApprovals(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await Approval.find().sort({ createdAt: -1 });
    res.json({ items: leanList(items) });
  } catch (e) { next(e); }
}

export async function decideApproval(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = z.object({
      status: z.enum(["Approved", "Rejected"]),
    }).parse(req.body);
    const item = await Approval.findOneAndUpdate(
      { id: req.params.id },
      { status: body.status },
      { new: true },
    );
    if (!item) throw new AppError("Approval not found", 404);
    await logActivity(req, `${body.status.toLowerCase()} — ${item.title}`, "Approvals");
    res.json({ item: leanOne(item) });
  } catch (e) { zodNext(e, next); }
}

// —— Alerts ——
export async function listAlerts(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await Alert.find().sort({ severity: 1 });
    res.json({ items: leanList(items) });
  } catch (e) { next(e); }
}

export async function dismissAlert(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const item = await Alert.findOneAndUpdate(
      { id: req.params.id },
      { dismissed: true },
      { new: true },
    );
    if (!item) throw new AppError("Alert not found", 404);
    res.json({ item: leanOne(item) });
  } catch (e) { next(e); }
}

// —— Activity ——
export async function listActivity(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await Activity.find().sort({ createdAt: -1 }).limit(200);
    res.json({ items: leanList(items) });
  } catch (e) { next(e); }
}

export async function createActivity(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = z.object({
      action: z.string().trim().min(1),
      area: z.string().trim().min(1),
      actor: z.string().optional(),
    }).parse(req.body);
    const item = await Activity.create({
      id: "ac" + Date.now(),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      actor: body.actor || req.user?.name || "Director",
      action: body.action,
      area: body.area,
    });
    res.status(201).json({ item: leanOne(item) });
  } catch (e) { zodNext(e, next); }
}

// —— Documents ——
export async function listDocuments(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await DocumentModel.find().sort({ updated: -1 });
    res.json({ items: leanList(items) });
  } catch (e) { next(e); }
}

// —— Tasks ——
export async function listTasks(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await Task.find().sort({ due: 1 });
    res.json({ items: leanList(items) });
  } catch (e) { next(e); }
}

export async function createTask(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = z.object({
      title: z.string().trim().min(1),
      product: z.string().trim().min(1),
      assignee: z.string().trim().min(1),
      priority: z.string().optional(),
      due: z.string().optional(),
    }).parse(req.body);
    const item = await Task.create({
      id: "tk" + Date.now(),
      title: body.title,
      product: body.product,
      assignee: body.assignee,
      priority: body.priority ?? "Medium",
      status: "Backlog",
      due: body.due || "2026-09-15",
    });
    await logActivity(req, `assigned task '${item.title}' to ${item.assignee}`, "Sprint Board");
    res.status(201).json({ item: leanOne(item) });
  } catch (e) { zodNext(e, next); }
}

export async function updateTask(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = z.object({
      status: z.string().optional(),
      priority: z.string().optional(),
      assignee: z.string().optional(),
      title: z.string().optional(),
    }).parse(req.body);
    const item = await Task.findOneAndUpdate({ id: req.params.id }, body, { new: true });
    if (!item) throw new AppError("Task not found", 404);
    res.json({ item: leanOne(item) });
  } catch (e) { zodNext(e, next); }
}

export async function deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const item = await Task.findOneAndDelete({ id: req.params.id });
    if (!item) throw new AppError("Task not found", 404);
    res.json({ message: "Deleted", id: item.id });
  } catch (e) { next(e); }
}

// —— Search / Dashboard / Assistant ——
export async function searchAll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const q = String(req.query.q ?? "").trim().toLowerCase();
    if (!q) {
      res.json({ results: [] });
      return;
    }
    const [products, clients, leads, tickets, devs] = await Promise.all([
      Product.find({ name: new RegExp(q, "i") }).limit(5),
      Client.find({ name: new RegExp(q, "i") }).limit(5),
      Lead.find({ name: new RegExp(q, "i") }).limit(5),
      Ticket.find({
        $or: [
          { subject: new RegExp(q, "i") },
          { client: new RegExp(q, "i") },
        ],
      }).limit(5),
      Developer.find({ name: new RegExp(q, "i") }).limit(5),
    ]);
    const results = [
      ...leanList(products).map((p) => ({ kind: "Product", label: String(p.name), tab: "products" })),
      ...leanList(clients).map((c) => ({ kind: "Client", label: String(c.name), tab: "clients" })),
      ...leanList(leads).map((l) => ({ kind: "Lead", label: String(l.name), tab: "crm" })),
      ...leanList(tickets).map((t) => ({
        kind: "Ticket",
        label: `${String(t.id)} — ${String(t.subject)}`,
        tab: "support",
      })),
      ...leanList(devs).map((d) => ({ kind: "Developer", label: String(d.name), tab: "team" })),
    ].slice(0, 8);
    res.json({ results });
  } catch (e) { next(e); }
}

export async function bootstrap(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const [
      products, devs, projects, clients, leads, campaigns,
      tickets, invoices, approvals, alerts, activity, documents, tasks, revenue,
    ] = await Promise.all([
      Product.find().sort({ name: 1 }),
      Developer.find().sort({ name: 1 }),
      Project.find().sort({ deadline: 1 }),
      Client.find().sort({ name: 1 }),
      Lead.find().sort({ updated: -1 }),
      Campaign.find().sort({ start: -1 }),
      Ticket.find().sort({ updated: -1 }),
      Invoice.find().sort({ dueDate: 1 }),
      Approval.find().sort({ createdAt: -1 }),
      Alert.find(),
      Activity.find().sort({ createdAt: -1 }).limit(100),
      DocumentModel.find().sort({ updated: -1 }),
      Task.find().sort({ due: 1 }),
      RevenuePoint.find(),
    ]);
    res.json({
      products: leanList(products),
      devs: leanList(devs),
      projects: leanList(projects),
      clients: leanList(clients),
      leads: leanList(leads),
      campaigns: leanList(campaigns),
      tickets: leanList(tickets),
      invoices: leanList(invoices),
      approvals: leanList(approvals),
      alerts: leanList(alerts),
      activity: leanList(activity),
      documents: leanList(documents),
      tasks: leanList(tasks),
      revenueTrend: leanList(revenue),
      user: req.user
        ? { id: req.user.sub, email: req.user.email, role: req.user.role, name: req.user.name }
        : null,
    });
  } catch (e) { next(e); }
}

export async function assistantChat(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = z.object({ query: z.string().trim().min(1) }).parse(req.body);
    const q = body.query.toLowerCase();
    const [leads, campaigns, projects, approvals, tickets, invoices, devs] = await Promise.all([
      Lead.find(),
      Campaign.find(),
      Project.find(),
      Approval.find({ status: "Pending" }),
      Ticket.find(),
      Invoice.find({ status: "Overdue" }),
      Developer.find({ status: "Blocked" }),
    ]);

    const pendingApprovals = leanList(approvals);
    const atRisk = leanList(projects).filter((p) => p.health === "Red" || p.health === "Amber");
    const overdueInvoices = leanList(invoices);
    const campaignList = leanList(campaigns);
    const bestCampaign = [...campaignList].sort(
      (a, b) => Number(b.conversions) / (Number(b.leads) || 1) - Number(a.conversions) / (Number(a.leads) || 1),
    )[0];
    const worstCampaign = [...campaignList].sort(
      (a, b) => Number(a.conversions) / (Number(a.leads) || 1) - Number(b.conversions) / (Number(b.leads) || 1),
    )[0];
    const blockedDevs = leanList(devs);
    const leadList = leanList(leads);
    const openPipeline = leadList
      .filter((l) => !["Won", "Lost"].includes(String(l.stage)))
      .reduce((s, l) => s + Number(l.value || 0), 0);
    const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    let reply: string;
    if (q.includes("approv")) {
      reply = pendingApprovals.length
        ? `You have ${pendingApprovals.length} pending approvals: ${pendingApprovals.map((a) => `"${a.title}" (${a.risk} risk)`).join("; ")}.`
        : "No pending approvals right now — the queue is clear.";
    } else if (q.includes("risk") || q.includes("project")) {
      reply = atRisk.length
        ? `${atRisk.length} project(s) need attention: ${atRisk.map((p) => `${p.name} (${p.health}, ${p.progress}% done, due ${p.deadline})`).join("; ")}.`
        : "All projects are currently on track.";
    } else if (q.includes("market") || q.includes("campaign")) {
      reply = bestCampaign
        ? `Best campaign: "${bestCampaign.name}". Weakest: "${worstCampaign?.name ?? "n/a"}". Total leads: ${campaignList.reduce((s, c) => s + Number(c.leads || 0), 0)}.`
        : "No campaign data available.";
    } else if (q.includes("team") || q.includes("develop") || q.includes("block")) {
      reply = blockedDevs.length
        ? `${blockedDevs.length} developer(s) blocked: ${blockedDevs.map((d) => `${d.name} — ${d.task}`).join("; ")}.`
        : "No developers are currently blocked.";
    } else if (q.includes("finance") || q.includes("invoice") || q.includes("revenue")) {
      reply = `Outstanding overdue: ${inr(overdueInvoices.reduce((s, i) => s + Number(i.amount || 0), 0))} across ${overdueInvoices.length} invoice(s). Open pipeline: ${inr(openPipeline)}.`;
    } else {
      reply = `Today's snapshot: ${pendingApprovals.length} approvals waiting, ${atRisk.length} project(s) at risk, ${blockedDevs.length} developer(s) blocked, ${overdueInvoices.length} invoice(s) overdue, ${tickets.length} tickets tracked.`;
    }

    res.json({ reply });
  } catch (e) { zodNext(e, next); }
}
