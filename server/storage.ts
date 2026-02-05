import { type Order, type InsertOrder, type SiteSettings, type InsertSiteSettings, type PartnershipRequest, type InsertPartnershipRequest, type JobOpening, type InsertJobOpening, type JobApplication, type InsertJobApplication, type Invoice, type InsertInvoice, orders, siteSettings, partnershipRequests, jobOpenings, jobApplications, invoices } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
