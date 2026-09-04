import { Router } from "express";
import * as m from "../controllers/modules.controller";
import { authenticate, requireRole } from "../middleware/authenticate";

const router = Router();
const director = [authenticate, requireRole("director")] as const;
const auth = [authenticate] as const;

router.get("/bootstrap", ...auth, m.bootstrap);
router.get("/search", ...auth, m.searchAll);
router.post("/assistant/chat", ...auth, m.assistantChat);

router.get("/products", ...auth, m.listProducts);
router.get("/devs", ...auth, m.listDevs);
router.get("/clients", ...auth, m.listClients);
router.get("/documents", ...auth, m.listDocuments);
router.get("/alerts", ...auth, m.listAlerts);
router.patch("/alerts/:id/dismiss", ...auth, m.dismissAlert);

router.get("/projects", ...auth, m.listProjects);
router.post("/projects", ...director, m.createProject);
router.patch("/projects/:id", ...director, m.updateProject);

router.get("/leads", ...auth, m.listLeads);
router.post("/leads", ...director, m.createLead);
router.patch("/leads/:id", ...director, m.updateLead);
router.delete("/leads/:id", ...director, m.deleteLead);

router.get("/campaigns", ...auth, m.listCampaigns);
router.post("/campaigns", ...director, m.createCampaign);
router.delete("/campaigns/:id", ...director, m.deleteCampaign);

router.get("/tickets", ...auth, m.listTickets);
router.patch("/tickets/:id", ...director, m.updateTicket);

router.get("/invoices", ...auth, m.listInvoices);
router.get("/finance/revenue", ...auth, m.listRevenue);
router.post("/invoices/:id/escalate", ...director, m.escalateInvoice);

router.get("/approvals", ...auth, m.listApprovals);
router.patch("/approvals/:id", ...director, m.decideApproval);

router.get("/activity", ...auth, m.listActivity);
router.post("/activity", ...auth, m.createActivity);

router.get("/tasks", ...auth, m.listTasks);
router.post("/tasks", ...director, m.createTask);
router.patch("/tasks/:id", ...director, m.updateTask);
router.delete("/tasks/:id", ...director, m.deleteTask);

export default router;
