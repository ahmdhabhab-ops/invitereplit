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
import { Plus, Pencil, Trash2, FileDown, Loader2, X, Send } from "lucide-react";
import type { Proposal, InvoiceItem, SiteSettings } from "@shared/schema";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logoPath from "@assets/Logo_1769975575984.png";

type ProposalFormData = {
  proposalNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  proposalDate: string;
  validUntil: string;
  eventType: string;
  packageRecommendation: string;
  introMessage: string;
  items: InvoiceItem[];
  discountType: "percentage" | "fixed";
  discountValue: number;
  taxRate: number;
  status: string;
  terms: string;
  notes: string;
};

const defaultForm: ProposalFormData = {
  proposalNumber: "",
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  proposalDate: new Date().toISOString().split("T")[0],
  validUntil: "",
  eventType: "",
  packageRecommendation: "",
  introMessage: "Dear [Client Name],\n\nThank you for considering Einvite for your upcoming event. We are excited to present this proposal for your digital invitation needs. Please review the details below and feel free to reach out with any questions.",
  items: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
  discountType: "percentage",
  discountValue: 0,
  taxRate: 0,
  status: "draft",
  terms: "This proposal is valid for 30 days from the date of issue. A 50% deposit is required to commence work. The remaining balance is due upon delivery of the final invitation link.",
  notes: "",
};

const calculateTotals = (items: InvoiceItem[], discountType: string, discountValue: number, taxRate: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = Math.round((subtotal * discountValue) / 100);
  } else {
    discountAmount = discountValue * 100;
  }
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = Math.round((afterDiscount * taxRate) / 100);
  const total = afterDiscount + taxAmount;
  return { subtotal, discountAmount, taxAmount, total };
};

const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const getStatusColor = (status: string) => {
  switch (status) {
    case "accepted": return "default";
    case "sent": return "secondary";
    case "rejected": return "destructive";
    default: return "outline";
  }
};

export function ProposalManager() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [formData, setFormData] = useState<ProposalFormData>(defaultForm);
  const [previewProposal, setPreviewProposal] = useState<Proposal | null>(null);
  const proposalRef = useRef<HTMLDivElement>(null);

  const { data: proposalsList, isLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
  });

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/proposals", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({ title: "Proposal created successfully" });
      resetForm();
    },
    onError: () => toast({ title: "Failed to create proposal", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/proposals/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({ title: "Proposal updated successfully" });
      resetForm();
    },
    onError: () => toast({ title: "Failed to update proposal", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/proposals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({ title: "Proposal deleted successfully" });
    },
    onError: () => toast({ title: "Failed to delete proposal", variant: "destructive" }),
  });

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingProposal(null);
    setShowForm(false);
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

  const handlePackageChange = (pkg: string) => {
    if (!settings || pkg === "Custom" || pkg === "") {
      setFormData((prev) => ({ ...prev, packageRecommendation: pkg }));
      return;
    }

    let packagePrice = 0;
    let features: string[] = [];
    let packageLabel = "";

    if (pkg === "Essential") {
      packagePrice = settings.essentialPrice ?? 49;
      features = (settings.essentialFeatures as string[]) ?? [
        "Single-page invitation design",
        "Mobile responsive",
        "Custom date & location",
        "Shareable link",
        "3 design revisions",
      ];
      packageLabel = "Essential";
    } else if (pkg === "Premium") {
      packagePrice = settings.premiumPrice ?? 99;
      features = (settings.premiumFeatures as string[]) ?? [
        "Multi-page interactive design",
        "Photo gallery integration",
        "Background music",
        "RSVP tracking",
        "5 design revisions",
        "Custom animations",
      ];
      packageLabel = "Premium";
    } else if (pkg === "Royal") {
      packagePrice = settings.royalPrice ?? 199;
      features = (settings.royalFeatures as string[]) ?? [
        "Everything in Premium",
        "Video backgrounds",
        "Guest messaging",
        "Live countdown timer",
        "Unlimited revisions",
        "Priority support",
        "Custom domain option",
      ];
      packageLabel = "Royal";
    }

    const newItems: InvoiceItem[] = [
      {
        description: `${packageLabel} Digital Invitation Package`,
        quantity: 1,
        unitPrice: packagePrice, // stored in dollars in form state
        total: packagePrice * 100, // cents for calculation consistency
      },
      ...features.map((feature) => ({
        description: `✓ ${feature}`,
        quantity: 1,
        unitPrice: 0,
        total: 0,
      })),
    ];

    setFormData((prev) => ({
      ...prev,
      packageRecommendation: pkg,
      items: newItems,
    }));
  };

  const fetchNextProposalNumber = async () => {
    try {
      const response = await fetch("/api/proposals/next-number", { credentials: "include" });
      const data = await response.json();
      setFormData((prev) => ({ ...prev, proposalNumber: data.proposalNumber }));
    } catch {}
  };

  const handleCreateNew = async () => {
    await fetchNextProposalNumber();
    setShowForm(true);
  };

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setFormData({
      proposalNumber: proposal.proposalNumber,
      clientName: proposal.clientName,
      clientEmail: proposal.clientEmail,
      clientPhone: proposal.clientPhone || "",
      proposalDate: proposal.proposalDate,
      validUntil: proposal.validUntil || "",
      eventType: proposal.eventType || "",
      packageRecommendation: proposal.packageRecommendation || "",
      introMessage: proposal.introMessage || defaultForm.introMessage,
      items: (proposal.items as InvoiceItem[]).map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice / 100,
        total: item.total,
      })),
      discountType: (proposal.discountType as "percentage" | "fixed") || "percentage",
      discountValue: proposal.discountType === "fixed" ? (proposal.discountValue || 0) / 100 : proposal.discountValue || 0,
      taxRate: proposal.taxRate || 0,
      status: proposal.status || "draft",
      terms: proposal.terms || defaultForm.terms,
      notes: proposal.notes || "",
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

    const data = {
      ...formData,
      items: formData.items.map((item) => ({
        ...item,
        unitPrice: Math.round(item.unitPrice * 100),
        total: Math.round(item.quantity * item.unitPrice * 100),
      })),
      discountValue: formData.discountType === "fixed" ? Math.round(formData.discountValue * 100) : formData.discountValue,
      subtotal,
      discountAmount,
      taxAmount,
      total,
    };

    if (editingProposal) {
      updateMutation.mutate({ id: editingProposal.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const exportToPDF = async (proposal: Proposal) => {
    setPreviewProposal(proposal);
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (proposalRef.current) {
      try {
        const canvas = await html2canvas(proposalRef.current, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${proposal.proposalNumber}.pdf`);
        toast({ title: "Proposal PDF exported successfully" });
      } catch {
        toast({ title: "Failed to export PDF", variant: "destructive" });
      }
    }
    setPreviewProposal(null);
  };

  const liveSubtotal = formData.items.reduce((s, i) => s + i.quantity * i.unitPrice * 100, 0);
  const liveTotals = calculateTotals(
    formData.items.map((i) => ({ ...i, total: i.quantity * i.unitPrice * 100 })),
    formData.discountType,
    formData.discountValue,
    formData.taxRate
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Proposals</CardTitle>
            <CardDescription>Create and send professional proposals to clients</CardDescription>
          </div>
          <Button onClick={handleCreateNew} data-testid="button-create-proposal">
            <Plus className="h-4 w-4 mr-2" />
            New Proposal
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : proposalsList && proposalsList.length > 0 ? (
            <div className="space-y-4">
              {proposalsList.map((proposal) => (
                <Card key={proposal.id} data-testid={`proposal-${proposal.id}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold" data-testid={`text-proposal-number-${proposal.id}`}>{proposal.proposalNumber}</span>
                          <Badge variant={getStatusColor(proposal.status || "draft")} data-testid={`badge-proposal-status-${proposal.id}`}>
                            {proposal.status}
                          </Badge>
                          {proposal.packageRecommendation && (
                            <Badge variant="outline">{proposal.packageRecommendation}</Badge>
                          )}
                        </div>
                        <p className="font-medium" data-testid={`text-proposal-client-${proposal.id}`}>{proposal.clientName}</p>
                        <p className="text-sm text-muted-foreground">{proposal.clientEmail}</p>
                        <p className="text-sm text-muted-foreground">
                          {proposal.eventType && <span className="mr-2">{proposal.eventType}</span>}
                          Date: {proposal.proposalDate}
                          {proposal.validUntil && ` · Valid until: ${proposal.validUntil}`}
                          · Total: {formatCurrency(proposal.total)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportToPDF(proposal)}
                          data-testid={`button-export-proposal-${proposal.id}`}
                        >
                          <FileDown className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(proposal)}
                          data-testid={`button-edit-proposal-${proposal.id}`}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete this proposal?")) deleteMutation.mutate(proposal.id);
                          }}
                          data-testid={`button-delete-proposal-${proposal.id}`}
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
              No proposals yet. Create your first proposal to get started.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Proposal Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProposal ? "Edit Proposal" : "Create New Proposal"}</DialogTitle>
            <DialogDescription>Fill in the proposal details below</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Proposal Meta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Proposal Number</Label>
                <Input
                  value={formData.proposalNumber}
                  onChange={(e) => setFormData({ ...formData, proposalNumber: e.target.value })}
                  data-testid="input-proposal-number"
                />
              </div>
              <div className="space-y-2">
                <Label>Proposal Date</Label>
                <Input
                  type="date"
                  value={formData.proposalDate}
                  onChange={(e) => setFormData({ ...formData, proposalDate: e.target.value })}
                  data-testid="input-proposal-date"
                />
              </div>
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  data-testid="input-valid-until"
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
                    placeholder="John & Jane Doe"
                    data-testid="input-proposal-client-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Email</Label>
                  <Input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="client@example.com"
                    data-testid="input-proposal-client-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Phone</Label>
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="+961 XX XXX XXX"
                    data-testid="input-proposal-client-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select value={formData.eventType} onValueChange={(v) => setFormData({ ...formData, eventType: v })}>
                    <SelectTrigger data-testid="select-event-type">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wedding">Wedding</SelectItem>
                      <SelectItem value="Birthday">Birthday</SelectItem>
                      <SelectItem value="Corporate Event">Corporate Event</SelectItem>
                      <SelectItem value="Baby Shower">Baby Shower</SelectItem>
                      <SelectItem value="Engagement">Engagement</SelectItem>
                      <SelectItem value="Graduation">Graduation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Package Recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Recommended Package</Label>
                <Select value={formData.packageRecommendation} onValueChange={handlePackageChange}>
                  <SelectTrigger data-testid="select-package">
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Essential">Essential (${settings?.essentialPrice ?? 49})</SelectItem>
                    <SelectItem value="Premium">Premium (${settings?.premiumPrice ?? 99})</SelectItem>
                    <SelectItem value="Royal">Royal (${settings?.royalPrice ?? 199})</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {formData.packageRecommendation && formData.packageRecommendation !== "Custom" && (
                  <p className="text-xs text-muted-foreground">Line items auto-filled from this plan's features</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger data-testid="select-proposal-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Intro Message */}
            <div className="space-y-2">
              <Label>Introduction Message</Label>
              <Textarea
                value={formData.introMessage}
                onChange={(e) => setFormData({ ...formData, introMessage: e.target.value })}
                className="min-h-[100px]"
                placeholder="Personalized greeting for the client..."
                data-testid="input-intro-message"
              />
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Services &amp; Pricing</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, items: [...formData.items, { description: "", quantity: 1, unitPrice: 0, total: 0 }] })}
                  data-testid="button-add-proposal-item"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-3">
                {formData.items.map((item, index) => {
                  const isIncluded = item.unitPrice === 0 && index > 0;
                  return (
                    <div key={index} className={`grid grid-cols-12 gap-2 items-end ${isIncluded ? "opacity-80" : ""}`}>
                      <div className="col-span-5 space-y-1">
                        {index === 0 && <Label className="text-xs">Description</Label>}
                        <Input
                          value={item.description}
                          onChange={(e) => handleItemChange(index, "description", e.target.value)}
                          placeholder={index === 0 ? "e.g. Premium Digital Invitation Package" : "Included feature"}
                          className={isIncluded ? "text-violet-600 text-sm" : ""}
                          data-testid={`input-proposal-item-desc-${index}`}
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        {index === 0 && <Label className="text-xs">Qty</Label>}
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          disabled={isIncluded}
                          className={isIncluded ? "bg-muted" : ""}
                          data-testid={`input-proposal-item-qty-${index}`}
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
                          disabled={isIncluded}
                          className={isIncluded ? "bg-muted" : ""}
                          data-testid={`input-proposal-item-price-${index}`}
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        {index === 0 && <Label className="text-xs">Total</Label>}
                        <Input
                          value={isIncluded ? "Included" : `$${(item.quantity * item.unitPrice).toFixed(2)}`}
                          disabled
                          className={`bg-muted ${isIncluded ? "text-violet-600 text-xs font-medium" : ""}`}
                        />
                      </div>
                      <div className="col-span-1">
                        {formData.items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) })}
                            data-testid={`button-remove-proposal-item-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Discount and Tax */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(v: "percentage" | "fixed") => setFormData({ ...formData, discountType: v })}
                >
                  <SelectTrigger data-testid="select-proposal-discount-type">
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
                  data-testid="input-proposal-discount"
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
                  data-testid="input-proposal-tax"
                />
              </div>
            </div>

            {/* Totals Preview */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="space-y-2 text-right">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(liveTotals.subtotal)}</span>
                  </div>
                  {liveTotals.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(liveTotals.discountAmount)}</span>
                    </div>
                  )}
                  {liveTotals.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({formData.taxRate}%):</span>
                      <span>{formatCurrency(liveTotals.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(liveTotals.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms */}
            <div className="space-y-2">
              <Label>Terms &amp; Conditions</Label>
              <Textarea
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                className="min-h-[80px]"
                placeholder="Payment terms, validity, etc."
                data-testid="input-proposal-terms"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Internal Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Internal notes (not shown on PDF)..."
                data-testid="input-proposal-notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-proposal"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingProposal ? "Update Proposal" : "Create Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden Proposal Preview for PDF Export */}
      {previewProposal && (
        <div className="fixed left-[-9999px] top-0">
          <div
            ref={proposalRef}
            className="bg-white"
            style={{ width: "794px", minHeight: "1123px", fontFamily: "Arial, sans-serif", position: "relative", padding: "0" }}
          >
            {/* Top accent bar */}
            <div style={{ height: "8px", background: "linear-gradient(90deg, #7c3aed, #a855f7)" }} />

            <div style={{ padding: "40px 48px 100px" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px", paddingBottom: "24px", borderBottom: "1px solid #e5e7eb" }}>
                <div>
                  <img src={logoPath} alt="Einvite" style={{ height: "56px", marginBottom: "8px" }} />
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0" }}>Premium Digital Invitations</p>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0" }}>{settings?.email || "info@einvite.me"}</p>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0" }}>{settings?.phoneNumber || "+961 81 82 47 82"}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "inline-block", background: "#7c3aed", color: "white", padding: "6px 20px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", letterSpacing: "2px", marginBottom: "12px" }}>
                    PROPOSAL
                  </div>
                  <p style={{ fontSize: "22px", fontWeight: "700", color: "#1f2937", margin: "0" }}>{previewProposal.proposalNumber}</p>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: "6px 0 2px" }}>Date: {previewProposal.proposalDate}</p>
                  {previewProposal.validUntil && (
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>Valid Until: {previewProposal.validUntil}</p>
                  )}
                </div>
              </div>

              {/* Prepared For */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "32px" }}>
                <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "20px" }}>
                  <p style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Prepared For</p>
                  <p style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937", margin: "0 0 4px" }}>{previewProposal.clientName}</p>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0" }}>{previewProposal.clientEmail}</p>
                  {previewProposal.clientPhone && (
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0" }}>{previewProposal.clientPhone}</p>
                  )}
                </div>
                {(previewProposal.eventType || previewProposal.packageRecommendation) && (
                  <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "8px", padding: "20px" }}>
                    <p style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Event Details</p>
                    {previewProposal.eventType && (
                      <p style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}>
                        <strong>Type:</strong> {previewProposal.eventType}
                      </p>
                    )}
                    {previewProposal.packageRecommendation && (
                      <p style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}>
                        <strong>Package:</strong> {previewProposal.packageRecommendation}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Intro message */}
              {previewProposal.introMessage && (
                <div style={{ marginBottom: "32px", padding: "20px", background: "#f9fafb", borderLeft: "4px solid #7c3aed", borderRadius: "0 8px 8px 0" }}>
                  <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.7", margin: "0", whiteSpace: "pre-line" }}>{previewProposal.introMessage}</p>
                </div>
              )}

              {/* Services Table */}
              <div style={{ marginBottom: "32px" }}>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#1f2937", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Services &amp; Pricing</p>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#7c3aed", color: "white" }}>
                      <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "13px", fontWeight: "600", borderRadius: "6px 0 0 0" }}>Description</th>
                      <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "13px", fontWeight: "600", width: "70px" }}>Qty</th>
                      <th style={{ textAlign: "right", padding: "12px 16px", fontSize: "13px", fontWeight: "600", width: "110px" }}>Unit Price</th>
                      <th style={{ textAlign: "right", padding: "12px 16px", fontSize: "13px", fontWeight: "600", width: "110px", borderRadius: "0 6px 0 0" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(previewProposal.items as InvoiceItem[]).map((item, idx) => {
                      const isIncluded = item.unitPrice === 0;
                      return (
                        <tr key={idx} style={{ background: isIncluded ? "#faf5ff" : (idx % 2 === 0 ? "#f9fafb" : "white") }}>
                          <td style={{ padding: "10px 16px", fontSize: isIncluded ? "12px" : "13px", color: isIncluded ? "#7c3aed" : "#374151", borderBottom: "1px solid #e5e7eb", paddingLeft: isIncluded ? "28px" : "16px" }}>
                            {item.description}
                          </td>
                          <td style={{ padding: "10px 16px", fontSize: "13px", color: "#9ca3af", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>
                            {isIncluded ? "—" : item.quantity}
                          </td>
                          <td style={{ padding: "10px 16px", fontSize: "13px", color: "#9ca3af", textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>
                            {isIncluded ? "—" : formatCurrency(item.unitPrice)}
                          </td>
                          <td style={{ padding: "10px 16px", fontSize: "12px", fontWeight: isIncluded ? "500" : "normal", color: isIncluded ? "#7c3aed" : "#374151", textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>
                            {isIncluded ? "Included" : formatCurrency(item.total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
                <div style={{ width: "280px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb", fontSize: "14px" }}>
                    <span style={{ color: "#6b7280" }}>Subtotal</span>
                    <span style={{ color: "#1f2937" }}>{formatCurrency(previewProposal.subtotal)}</span>
                  </div>
                  {(previewProposal.discountAmount || 0) > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb", fontSize: "14px" }}>
                      <span style={{ color: "#16a34a" }}>Discount</span>
                      <span style={{ color: "#16a34a" }}>-{formatCurrency(previewProposal.discountAmount || 0)}</span>
                    </div>
                  )}
                  {(previewProposal.taxAmount || 0) > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb", fontSize: "14px" }}>
                      <span style={{ color: "#6b7280" }}>Tax ({previewProposal.taxRate}%)</span>
                      <span style={{ color: "#1f2937" }}>{formatCurrency(previewProposal.taxAmount || 0)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#7c3aed", color: "white", borderRadius: "6px", marginTop: "8px", fontSize: "16px", fontWeight: "700" }}>
                    <span>Total</span>
                    <span>{formatCurrency(previewProposal.total)}</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              {previewProposal.terms && (
                <div style={{ marginBottom: "24px", padding: "16px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <p style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Terms &amp; Conditions</p>
                  <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6", margin: "0", whiteSpace: "pre-line" }}>{previewProposal.terms}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", background: "#7c3aed", color: "white", padding: "16px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: "700", margin: "0" }}>Ready to move forward?</p>
                <p style={{ fontSize: "12px", margin: "2px 0 0", opacity: 0.85 }}>Contact us to accept this proposal</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "13px", margin: "0", fontWeight: "600" }}>einvite.me</p>
                <p style={{ fontSize: "12px", margin: "2px 0 0", opacity: 0.85 }}>{settings?.phoneNumber || "+961 81 82 47 82"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
