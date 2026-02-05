import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  FileDown,
  Loader2,
  X,
} from "lucide-react";
import type { Invoice, InvoiceItem, SiteSettings } from "@shared/schema";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logoPath from "@assets/Logo_1769975575984.png";

type InvoiceFormData = {
  invoiceNumber: string;
  orderId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  discountType: "percentage" | "fixed";
  discountValue: number;
  taxRate: number;
  status: string;
  notes: string;
};

const defaultInvoiceForm: InvoiceFormData = {
  invoiceNumber: "",
  orderId: "",
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  clientAddress: "",
  issueDate: new Date().toISOString().split("T")[0],
  dueDate: "",
  items: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
  discountType: "percentage",
  discountValue: 0,
  taxRate: 0,
  status: "draft",
  notes: "",
};

export function InvoiceManager() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<InvoiceFormData>(defaultInvoiceForm);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/invoices", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Invoice created successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create invoice", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/invoices/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Invoice updated successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update invoice", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Invoice deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete invoice", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData(defaultInvoiceForm);
    setEditingInvoice(null);
    setShowForm(false);
  };

  const calculateTotals = (items: InvoiceItem[], discountType: string, discountValue: number, taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = Math.round((subtotal * discountValue) / 100);
    } else {
      discountAmount = discountValue * 100; // Convert to cents
    }
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = Math.round((afterDiscount * taxRate) / 100);
    const total = afterDiscount + taxAmount;
    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items];
    if (field === "quantity" || field === "unitPrice") {
      newItems[index] = {
        ...newItems[index],
        [field]: Number(value),
        total: field === "quantity" 
          ? Number(value) * newItems[index].unitPrice * 100
          : newItems[index].quantity * Number(value) * 100,
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index),
      });
    }
  };

  const fetchNextInvoiceNumber = async () => {
    try {
      const response = await fetch("/api/invoices/next-number", { credentials: "include" });
      const data = await response.json();
      setFormData((prev) => ({ ...prev, invoiceNumber: data.invoiceNumber }));
    } catch (error) {
      console.error("Failed to fetch next invoice number");
    }
  };

  const handleCreateNew = async () => {
    await fetchNextInvoiceNumber();
    setShowForm(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      invoiceNumber: invoice.invoiceNumber,
      orderId: invoice.orderId || "",
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientPhone: invoice.clientPhone || "",
      clientAddress: invoice.clientAddress || "",
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate || "",
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice / 100, // Convert from cents for display
        total: item.total, // Keep in cents for calculation consistency
      })),
      discountType: (invoice.discountType as "percentage" | "fixed") || "percentage",
      discountValue: invoice.discountType === "fixed" ? (invoice.discountValue || 0) / 100 : invoice.discountValue || 0,
      taxRate: invoice.taxRate || 0,
      status: invoice.status || "draft",
      notes: invoice.notes || "",
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    const { subtotal, discountAmount, taxAmount, total } = calculateTotals(
      formData.items.map((item) => ({ ...item, total: item.quantity * item.unitPrice * 100 })),
      formData.discountType,
      formData.discountValue,
      formData.taxRate
    );

    const invoiceData = {
      ...formData,
      items: formData.items.map((item) => ({
        ...item,
        unitPrice: Math.round(item.unitPrice * 100), // Convert to cents
        total: Math.round(item.quantity * item.unitPrice * 100),
      })),
      discountValue: formData.discountType === "fixed" ? Math.round(formData.discountValue * 100) : formData.discountValue,
      subtotal,
      discountAmount,
      taxAmount,
      total,
    };

    if (editingInvoice) {
      updateMutation.mutate({ id: editingInvoice.id, data: invoiceData });
    } else {
      createMutation.mutate(invoiceData);
    }
  };

  const exportToPDF = async (invoice: Invoice) => {
    setPreviewInvoice(invoice);
    
    // Wait for the preview to render
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    if (invoiceRef.current) {
      try {
        const canvas = await html2canvas(invoiceRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
        });
        
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${invoice.invoiceNumber}.pdf`);
        
        toast({ title: "PDF exported successfully" });
      } catch (error) {
        toast({ title: "Failed to export PDF", variant: "destructive" });
      }
    }
    
    setPreviewInvoice(null);
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "sent":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              Invoices
            </CardTitle>
            <CardDescription>
              Create, edit, and export invoices as PDF
            </CardDescription>
          </div>
          <Button onClick={handleCreateNew} data-testid="button-create-invoice">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invoices && invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id} data-testid={`invoice-${invoice.id}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{invoice.invoiceNumber}</span>
                          <Badge variant={getStatusColor(invoice.status || "draft")}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <p className="font-medium">{invoice.clientName}</p>
                        <p className="text-sm text-muted-foreground">{invoice.clientEmail}</p>
                        <p className="text-sm text-muted-foreground">
                          Issued: {invoice.issueDate} | Total: {formatCurrency(invoice.total)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportToPDF(invoice)}
                          data-testid={`button-export-pdf-${invoice.id}`}
                        >
                          <FileDown className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(invoice)}
                          data-testid={`button-edit-invoice-${invoice.id}`}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this invoice?")) {
                              deleteMutation.mutate(invoice.id);
                            }
                          }}
                          data-testid={`button-delete-invoice-${invoice.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No invoices yet. Create your first invoice to get started.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Invoice Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
            </DialogTitle>
            <DialogDescription>
              Fill in the invoice details below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  data-testid="input-invoice-number"
                />
              </div>
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  data-testid="input-issue-date"
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  data-testid="input-due-date"
                />
              </div>
            </div>

            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    data-testid="input-client-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Email</Label>
                  <Input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    data-testid="input-client-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Phone</Label>
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    data-testid="input-client-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Address</Label>
                  <Input
                    value={formData.clientAddress}
                    onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                    data-testid="input-client-address"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Line Items</h3>
                <Button variant="outline" size="sm" onClick={addItem} data-testid="button-add-item">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5 space-y-1">
                      {index === 0 && <Label className="text-xs">Description</Label>}
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        placeholder="Item description"
                        data-testid={`input-item-description-${index}`}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      {index === 0 && <Label className="text-xs">Qty</Label>}
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        data-testid={`input-item-qty-${index}`}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      {index === 0 && <Label className="text-xs">Price ($)</Label>}
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                        data-testid={`input-item-price-${index}`}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      {index === 0 && <Label className="text-xs">Total</Label>}
                      <Input
                        value={`$${(item.quantity * item.unitPrice).toFixed(2)}`}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="col-span-1">
                      {formData.items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          data-testid={`button-remove-item-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount and Tax */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: "percentage" | "fixed") =>
                    setFormData({ ...formData, discountType: value })
                  }
                >
                  <SelectTrigger data-testid="select-discount-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  data-testid="input-discount-value"
                />
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                  data-testid="input-tax-rate"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes for the invoice..."
                data-testid="input-notes"
              />
            </div>

            {/* Totals Preview */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="space-y-2 text-right">
                  {(() => {
                    const itemsWithTotals = formData.items.map((item) => ({
                      ...item,
                      total: item.quantity * item.unitPrice * 100,
                    }));
                    const { subtotal, discountAmount, taxAmount, total } = calculateTotals(
                      itemsWithTotals,
                      formData.discountType,
                      formData.discountValue,
                      formData.taxRate
                    );
                    return (
                      <>
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>-{formatCurrency(discountAmount)}</span>
                          </div>
                        )}
                        {taxAmount > 0 && (
                          <div className="flex justify-between">
                            <span>Tax ({formData.taxRate}%):</span>
                            <span>{formatCurrency(taxAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(total)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-invoice"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingInvoice ? "Update Invoice" : "Create Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden Invoice Preview for PDF Export */}
      {previewInvoice && (
        <div className="fixed left-[-9999px] top-0">
          <div
            ref={invoiceRef}
            className="bg-white p-8"
            style={{ width: "794px", minHeight: "1123px", fontFamily: "Arial, sans-serif" }}
          >
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-purple-600">
              <div>
                <img src={logoPath} alt="Einvite Logo" className="h-16 mb-2" />
                <p className="text-sm text-gray-600">Premium Digital Invitations</p>
                <p className="text-sm text-gray-600">{settings?.email || "info@einvite.me"}</p>
                <p className="text-sm text-gray-600">{settings?.phoneNumber || "+961 81 82 47 82"}</p>
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-purple-600 mb-2">INVOICE</h1>
                <p className="text-lg font-semibold">{previewInvoice.invoiceNumber}</p>
                <p className="text-sm text-gray-600 mt-2">Issue Date: {previewInvoice.issueDate}</p>
                {previewInvoice.dueDate && (
                  <p className="text-sm text-gray-600">Due Date: {previewInvoice.dueDate}</p>
                )}
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h2>
              <p className="font-semibold text-lg">{previewInvoice.clientName}</p>
              <p className="text-gray-600">{previewInvoice.clientEmail}</p>
              {previewInvoice.clientPhone && (
                <p className="text-gray-600">{previewInvoice.clientPhone}</p>
              )}
              {previewInvoice.clientAddress && (
                <p className="text-gray-600">{previewInvoice.clientAddress}</p>
              )}
            </div>

            {/* Line Items Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="text-left p-3 rounded-tl-lg">Description</th>
                  <th className="text-center p-3 w-20">Qty</th>
                  <th className="text-right p-3 w-28">Price</th>
                  <th className="text-right p-3 w-28 rounded-tr-lg">Total</th>
                </tr>
              </thead>
              <tbody>
                {previewInvoice.items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="p-3 border-b">{item.description}</td>
                    <td className="p-3 border-b text-center">{item.quantity}</td>
                    <td className="p-3 border-b text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-3 border-b text-right">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between p-2 border-b">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatCurrency(previewInvoice.subtotal)}</span>
                </div>
                {(previewInvoice.discountAmount || 0) > 0 && (
                  <div className="flex justify-between p-2 border-b text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(previewInvoice.discountAmount || 0)}</span>
                  </div>
                )}
                {(previewInvoice.taxAmount || 0) > 0 && (
                  <div className="flex justify-between p-2 border-b">
                    <span className="text-gray-600">Tax ({previewInvoice.taxRate}%):</span>
                    <span>{formatCurrency(previewInvoice.taxAmount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between p-3 bg-purple-600 text-white font-bold text-lg rounded-b-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(previewInvoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {previewInvoice.notes && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-gray-600 text-sm">{previewInvoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="absolute bottom-8 left-8 right-8 text-center text-sm text-gray-500 border-t pt-4">
              <p className="font-semibold text-purple-600">Thank you for your business!</p>
              <p className="mt-1">Einvite - Digicore Solutions SARL</p>
              <p>einvite.me | {settings?.phoneNumber || "+961 81 82 47 82"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
