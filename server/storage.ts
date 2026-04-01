import { type Order, type InsertOrder, type SiteSettings, type InsertSiteSettings, type PartnershipRequest, type InsertPartnershipRequest, type JobOpening, type InsertJobOpening, type JobApplication, type InsertJobApplication, type Invoice, type InsertInvoice, type Proposal, type InsertProposal, type AdminUser, type AdminUserSafe, type SpinPrize, type InsertSpinPrize, type SpinEntry, type InsertSpinEntry, orders, siteSettings, partnershipRequests, jobOpenings, jobApplications, invoices, proposals, adminUsers, spinPrizes, spinEntries } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";

const DEFAULT_SPIN_PRIZES = [
  { name: "10% Discount", emoji: "💸", probability: 25, color: "#f472b6", isEnabled: "true", sortOrder: 0 },
  { name: "Free QR Code Entry", emoji: "🔑", probability: 15, color: "#a78bfa", isEnabled: "true", sortOrder: 1 },
  { name: "25% Discount", emoji: "🔥", probability: 20, color: "#fb923c", isEnabled: "true", sortOrder: 2 },
  { name: "WhatsApp Reminder", emoji: "📱", probability: 15, color: "#34d399", isEnabled: "true", sortOrder: 3 },
  { name: "Free Unlimited Edits", emoji: "✍️", probability: 12, color: "#60a5fa", isEnabled: "true", sortOrder: 4 },
  { name: "FREE Invitation Suite", emoji: "🎁", probability: 3, color: "#fbbf24", isEnabled: "true", sortOrder: 5 },
  { name: "50% Discount", emoji: "💣", probability: 10, color: "#f87171", isEnabled: "true", sortOrder: 6 },
];

export interface IStorage {
  // Order operations
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderPaymentStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Site settings operations
  getSiteSettings(): Promise<SiteSettings | undefined>;
  upsertSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings>;
  
  // Partnership request operations
  getPartnershipRequests(): Promise<PartnershipRequest[]>;
  createPartnershipRequest(request: InsertPartnershipRequest): Promise<PartnershipRequest>;
  updatePartnershipRequestStatus(id: string, status: string): Promise<PartnershipRequest | undefined>;
  
  // Job opening operations
  getJobOpenings(activeOnly?: boolean): Promise<JobOpening[]>;
  getJobOpening(id: string): Promise<JobOpening | undefined>;
  createJobOpening(job: InsertJobOpening): Promise<JobOpening>;
  updateJobOpening(id: string, job: Partial<InsertJobOpening>): Promise<JobOpening | undefined>;
  deleteJobOpening(id: string): Promise<boolean>;
  
  // Job application operations
  getJobApplications(jobId?: string): Promise<JobApplication[]>;
  getJobApplication(id: string): Promise<JobApplication | undefined>;
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  updateJobApplicationStatus(id: string, status: string, notes?: string): Promise<JobApplication | undefined>;
  
  // Invoice operations
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;
  getNextInvoiceNumber(): Promise<string>;

  // Proposal operations
  getProposals(): Promise<Proposal[]>;
  getProposal(id: string): Promise<Proposal | undefined>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: string, proposal: Partial<InsertProposal>): Promise<Proposal | undefined>;
  deleteProposal(id: string): Promise<boolean>;
  getNextProposalNumber(): Promise<string>;

  // Admin user operations
  getAdminUsers(): Promise<AdminUserSafe[]>;
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(user: { name: string; email: string; passwordHash: string; role: string; isActive?: string }): Promise<AdminUserSafe>;
  updateAdminUser(id: string, data: Partial<{ name: string; email: string; passwordHash: string; role: string; isActive: string }>): Promise<AdminUserSafe | undefined>;
  deleteAdminUser(id: string): Promise<boolean>;

  // Spin the Wheel operations
  getSpinPrizes(activeOnly?: boolean): Promise<SpinPrize[]>;
  updateSpinPrize(id: string, data: Partial<InsertSpinPrize>): Promise<SpinPrize | undefined>;
  resetSpinPrizesToDefaults(): Promise<SpinPrize[]>;
  seedSpinPrizesIfEmpty(): Promise<void>;
  getSpinEntries(): Promise<SpinEntry[]>;
  getSpinEntryByIp(ip: string): Promise<SpinEntry | undefined>;
  createSpinEntry(entry: InsertSpinEntry): Promise<SpinEntry>;
}

export class DatabaseStorage implements IStorage {
  async getOrders(): Promise<Order[]> {
    return db.select().from(orders);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder as any).returning();
    return order;
  }

  async updateOrderPaymentStatus(id: string, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ paymentStatus: status })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, "main"));
    return settings;
  }

  async upsertSiteSettings(settingsData: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    const existing = await this.getSiteSettings();
    
    if (existing) {
      const [updated] = await db
        .update(siteSettings)
        .set({ ...settingsData, updatedAt: new Date() } as any)
        .where(eq(siteSettings.id, "main"))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(siteSettings)
        .values({ id: "main", ...settingsData } as any)
        .returning();
      return created;
    }
  }

  async getPartnershipRequests(): Promise<PartnershipRequest[]> {
    return db.select().from(partnershipRequests);
  }

  async createPartnershipRequest(request: InsertPartnershipRequest): Promise<PartnershipRequest> {
    const [partnershipRequest] = await db.insert(partnershipRequests).values(request as any).returning();
    return partnershipRequest;
  }

  async updatePartnershipRequestStatus(id: string, status: string): Promise<PartnershipRequest | undefined> {
    const [request] = await db
      .update(partnershipRequests)
      .set({ status })
      .where(eq(partnershipRequests.id, id))
      .returning();
    return request;
  }

  // Job opening operations
  async getJobOpenings(activeOnly: boolean = false): Promise<JobOpening[]> {
    if (activeOnly) {
      return db.select().from(jobOpenings).where(eq(jobOpenings.isActive, "true")).orderBy(desc(jobOpenings.createdAt));
    }
    return db.select().from(jobOpenings).orderBy(desc(jobOpenings.createdAt));
  }

  async getJobOpening(id: string): Promise<JobOpening | undefined> {
    const [job] = await db.select().from(jobOpenings).where(eq(jobOpenings.id, id));
    return job;
  }

  async createJobOpening(job: InsertJobOpening): Promise<JobOpening> {
    const [created] = await db.insert(jobOpenings).values(job as any).returning();
    return created;
  }

  async updateJobOpening(id: string, job: Partial<InsertJobOpening>): Promise<JobOpening | undefined> {
    const [updated] = await db
      .update(jobOpenings)
      .set({ ...job, updatedAt: new Date() } as any)
      .where(eq(jobOpenings.id, id))
      .returning();
    return updated;
  }

  async deleteJobOpening(id: string): Promise<boolean> {
    const result = await db.delete(jobOpenings).where(eq(jobOpenings.id, id));
    return true;
  }

  // Job application operations
  async getJobApplications(jobId?: string): Promise<JobApplication[]> {
    if (jobId) {
      return db.select().from(jobApplications).where(eq(jobApplications.jobId, jobId)).orderBy(desc(jobApplications.createdAt));
    }
    return db.select().from(jobApplications).orderBy(desc(jobApplications.createdAt));
  }

  async getJobApplication(id: string): Promise<JobApplication | undefined> {
    const [application] = await db.select().from(jobApplications).where(eq(jobApplications.id, id));
    return application;
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const [created] = await db.insert(jobApplications).values(application as any).returning();
    return created;
  }

  async updateJobApplicationStatus(id: string, status: string, notes?: string): Promise<JobApplication | undefined> {
    const updateData: any = { status };
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    const [updated] = await db
      .update(jobApplications)
      .set(updateData)
      .where(eq(jobApplications.id, id))
      .returning();
    return updated;
  }

  // Invoice operations
  async getInvoices(): Promise<Invoice[]> {
    return db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [created] = await db.insert(invoices).values(invoice as any).returning();
    return created;
  }

  async updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [updated] = await db
      .update(invoices)
      .set({ ...invoice, updatedAt: new Date() } as any)
      .where(eq(invoices.id, id))
      .returning();
    return updated;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    await db.delete(invoices).where(eq(invoices.id, id));
    return true;
  }

  async getNextInvoiceNumber(): Promise<string> {
    const allInvoices = await db.select().from(invoices);
    const year = new Date().getFullYear();
    const count = allInvoices.length + 1;
    return `INV-${year}-${count.toString().padStart(4, "0")}`;
  }

  async getProposals(): Promise<Proposal[]> {
    return db.select().from(proposals).orderBy(desc(proposals.createdAt));
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
    return proposal;
  }

  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const [created] = await db.insert(proposals).values(proposal as any).returning();
    return created;
  }

  async updateProposal(id: string, proposal: Partial<InsertProposal>): Promise<Proposal | undefined> {
    const [updated] = await db
      .update(proposals)
      .set({ ...proposal, updatedAt: new Date() } as any)
      .where(eq(proposals.id, id))
      .returning();
    return updated;
  }

  async deleteProposal(id: string): Promise<boolean> {
    await db.delete(proposals).where(eq(proposals.id, id));
    return true;
  }

  async getNextProposalNumber(): Promise<string> {
    const all = await db.select().from(proposals);
    const year = new Date().getFullYear();
    const count = all.length + 1;
    return `PRO-${year}-${count.toString().padStart(4, "0")}`;
  }

  private stripPasswordHash(user: AdminUser): AdminUserSafe {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async getAdminUsers(): Promise<AdminUserSafe[]> {
    const users = await db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));
    return users.map(u => this.stripPasswordHash(u));
  }

  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user;
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email.toLowerCase()));
    return user;
  }

  async createAdminUser(user: { name: string; email: string; passwordHash: string; role: string; isActive?: string }): Promise<AdminUserSafe> {
    const [created] = await db.insert(adminUsers).values({
      name: user.name,
      email: user.email.toLowerCase(),
      passwordHash: user.passwordHash,
      role: user.role,
      isActive: user.isActive || "true",
    } as any).returning();
    return this.stripPasswordHash(created);
  }

  async updateAdminUser(id: string, data: Partial<{ name: string; email: string; passwordHash: string; role: string; isActive: string }>): Promise<AdminUserSafe | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.email) updateData.email = data.email.toLowerCase();
    const [updated] = await db.update(adminUsers).set(updateData).where(eq(adminUsers.id, id)).returning();
    return updated ? this.stripPasswordHash(updated) : undefined;
  }

  async deleteAdminUser(id: string): Promise<boolean> {
    await db.delete(adminUsers).where(eq(adminUsers.id, id));
    return true;
  }

  async seedSpinPrizesIfEmpty(): Promise<void> {
    const existing = await db.select().from(spinPrizes);
    if (existing.length === 0) {
      await db.insert(spinPrizes).values(DEFAULT_SPIN_PRIZES as any);
    }
  }

  async getSpinPrizes(activeOnly: boolean = false): Promise<SpinPrize[]> {
    const prizes = await db.select().from(spinPrizes).orderBy(asc(spinPrizes.sortOrder));
    if (activeOnly) return prizes.filter(p => p.isEnabled === "true");
    return prizes;
  }

  async updateSpinPrize(id: string, data: Partial<InsertSpinPrize>): Promise<SpinPrize | undefined> {
    const [updated] = await db
      .update(spinPrizes)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(spinPrizes.id, id))
      .returning();
    return updated;
  }

  async resetSpinPrizesToDefaults(): Promise<SpinPrize[]> {
    await db.delete(spinPrizes);
    await db.insert(spinPrizes).values(DEFAULT_SPIN_PRIZES as any);
    return db.select().from(spinPrizes).orderBy(asc(spinPrizes.sortOrder));
  }

  async getSpinEntries(): Promise<SpinEntry[]> {
    return db.select().from(spinEntries).orderBy(desc(spinEntries.createdAt));
  }

  async getSpinEntryByIp(ip: string): Promise<SpinEntry | undefined> {
    const [entry] = await db.select().from(spinEntries).where(eq(spinEntries.ipAddress, ip));
    return entry;
  }

  async createSpinEntry(entry: InsertSpinEntry): Promise<SpinEntry> {
    const [created] = await db.insert(spinEntries).values(entry as any).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
