import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, PaymentTerms } from "@prisma/client";
import { uploadImagetoCloudinary } from "@/lib/cloudinary";

const prisma = new PrismaClient();

function isValidDateString(dateStr: any): boolean {
  return dateStr && !isNaN(Date.parse(dateStr));
}

function mapTermsToEnum(term: string): PaymentTerms {
  switch ((term || "").toUpperCase()) {
    case "NET_15":
      return "NET_15";
    case "NET_30":
      return "NET_30";
    case "NET_45":
      return "NET_45";
    case "NET_60":
      return "NET_60";
    case "DUE_ON_RECEIPT":
      return "DUE_ON_RECEIPT";
    case "DUE_END_OF_MONTH":
      return "DUE_END_OF_MONTH";
    case "DUE_END_OF_NEXT_MONTH":
      return "DUE_END_OF_NEXT_MONTH";
    default:
      return "NET_30";
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = Number(params.id);
    if (isNaN(invoiceId)) {
      return NextResponse.json(
        { success: false, error: "Invalid invoice ID" },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        Item: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Calculate balancedDue if missing or set override
    let balancedDue = 0;
    if (invoice.status === "Cancelled") {
      balancedDue = 0;
    } else {
      balancedDue = (invoice.total || 0) - (invoice.amountReceived || 0);
      if (balancedDue < 0) balancedDue = 0;
    }

    const updatedInvoice = { ...invoice, balancedDue };

    return NextResponse.json({ success: true, data: updatedInvoice });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = Number(params.id);
    if (isNaN(invoiceId)) {
      return NextResponse.json(
        { success: false, error: "Invalid invoice ID" },
        { status: 400 }
      );
    }

    let body: Record<string, any> = {};
    let files: File[] = [];
    let paymentDocumentUrls: string[] = [];
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if ((key === "attachments" || key === "files") && value instanceof File)
          files.push(value);
        else body[key] = value;
      }
    } else {
      body = await request.json();
    }

    // File upload logic if any...
    if (files.length > 0) {
      for (const file of files) {
        if (file.size > 0) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const url = await uploadImagetoCloudinary(
            buffer,
            "invoice-payment-documents"
          );
          if (url) paymentDocumentUrls.push(url);
        }
      }
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    const action = body.action;
    let updatedFields: Record<string, any> = {};

    if (action === "recordPayment") {
      const prevAmountReceived = invoice.amountReceived || 0;
      const amountReceived = parseFloat(body.amountReceived || "0");
      if (amountReceived <= 0) {
        return NextResponse.json(
          { success: false, error: "Invalid amountReceived value" },
          { status: 400 }
        );
      }
      const paidAmount = prevAmountReceived + amountReceived;
      const total = invoice.total || 0;
      let status = paidAmount >= total ? "Paid" : "PartiallyPaid";
      let balancedDue = Math.max(0, total - paidAmount);

      updatedFields = {
        amountReceived: paidAmount,
        status,
        paymentDate: isValidDateString(body.paymentDate)
          ? new Date(body.paymentDate)
          : invoice.paymentDate,
        paymentMode: body.paymentMode || invoice.paymentMode,
        referenceNumber: body.referenceNumber || invoice.referenceNumber,
        bankCharges: body.bankCharges ? parseFloat(body.bankCharges) : invoice.bankCharges,
        taxDeducted:
          body.taxDeducted === "Yes" ||
          body.taxDeducted === true ||
          body.taxDeducted === "true",
        paymentReceivedOn: isValidDateString(body.paymentReceivedOn)
          ? new Date(body.paymentReceivedOn)
          : invoice.paymentReceivedOn,
        paymentDocuments: [...(invoice.paymentDocuments || []), ...paymentDocumentUrls],
        notes: body.notes || invoice.notes,
        balancedDue,
      };
    } else if (action === "writeOff") {
      // Write off: set status Paid, balancedDue 0
      updatedFields = {
        status: "Paid",
        balancedDue: 0,
        writeofnotes: body.reason || "",
        writeofdate: isValidDateString(body.writeOffDate)
          ? new Date(body.writeOffDate)
          : new Date(),
      };
    } else if (action === "send") {
      // Only set Sent if not already sent/paid/cancelled
      if (
        invoice.status === "Sent" ||
        invoice.status === "Paid" ||
        invoice.status === "Cancelled"
      ) {
        // If already sent/paid/cancelled, just return the current invoice (success: true)
        const updatedInvoice = await prisma.invoice.findUnique({
          where: { id: invoiceId },
          include: {
            customer: true,
            Item: true,
          },
        });
        return NextResponse.json(
          { success: true, data: updatedInvoice },
          { status: 200 }
        );
      }
      updatedFields = {
        status: "Sent",
      };
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: updatedFields,
      include: {
        customer: true,
        Item: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedInvoice }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed" },
      { status: 500 }
    );
  }
}