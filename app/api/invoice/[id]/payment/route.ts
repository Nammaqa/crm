import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadImagetoCloudinary } from "@/lib/cloudinary";

const prisma = new PrismaClient();

// Helper to validate date string
function isValidDateString(dateStr: any): boolean {
  return dateStr && !isNaN(Date.parse(dateStr));
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = Number(params.id);
    if (isNaN(invoiceId)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid invoice ID" }),
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
        // Accept both "attachments" and "files" as keys for uploaded files
        if (
          (key === "attachments" || key === "files") &&
          value instanceof File
        ) {
          files.push(value);
        } else {
          body[key] = value;
        }
      }
    } else {
      body = await request.json();
    }

    // Upload files if any
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
      return new Response(
        JSON.stringify({ success: false, error: "Invoice not found" }),
        { status: 404 }
      );
    }

    const action = body.action;
    let updatedFields: Record<string, any> = {};

    if (action === "recordPayment") {
      const prevAmountReceived = invoice.amountReceived || 0;
      const amountReceived = parseFloat(body.amountReceived || "0");
      const paidAmount = prevAmountReceived + amountReceived;
      const total = invoice.total || 0;
      const status = paidAmount >= total ? "Paid" : "PartiallyPaid";

      updatedFields = {
        amountReceived: paidAmount,
        status,
        paymentDate: isValidDateString(body.paymentDate)
          ? new Date(body.paymentDate)
          : invoice.paymentDate,
        paymentMode: body.paymentMode || invoice.paymentMode,
        referenceNumber:
          body.referenceNumber ||
          body.reference ||
          invoice.referenceNumber,
        bankCharges: body.bankCharges
          ? parseFloat(body.bankCharges)
          : invoice.bankCharges,
        taxDeducted: body.taxDeducted === "Yes" || body.taxDeducted === true,
        paymentReceivedOn: isValidDateString(body.paymentReceivedOn)
          ? new Date(body.paymentReceivedOn)
          : invoice.paymentReceivedOn,
        paymentDocuments: [
          ...(invoice.paymentDocuments || []),
          ...paymentDocumentUrls,
        ],
        notes: body.notes || invoice.notes,
        balancedDue: Math.max(0, total - paidAmount),
      };
    } else if (action === "writeOff") {
      updatedFields = {
        status: "Cancelled",
        balancedDue: 0,
        writeOffReason: body.reason || "",
        // Optionally store writeOffDate with validation
        ...(isValidDateString(body.writeOffDate)
          ? { writeOffDate: new Date(body.writeOffDate) }
          : {}),
      };
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid action" }),
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

    return new Response(
      JSON.stringify({ success: true, data: updatedInvoice }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to record payment",
      }),
      { status: 500 }
    );
  }
}