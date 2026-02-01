import { type Order, type InsertOrder, type SiteSettings, type InsertSiteSettings, orders, siteSettings } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Order operations
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderPaymentStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Site settings operations
  getSiteSettings(): Promise<SiteSettings | undefined>;
  upsertSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings>;
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
}

export const storage = new DatabaseStorage();
