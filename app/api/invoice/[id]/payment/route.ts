import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadImagetoCloudinary } from "@/lib/cloudinary";

const prisma = new PrismaClient();

function isValidDateString(dateStr: any): boolean {
  return dateStr && !isNaN(Date.parse(dateStr));
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = await context;
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
      let status = "PartiallyPaid";
      let balancedDue = Math.max(0, total - paidAmount);
      if (balancedDue === 0) status = "Paid";

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
        taxDeducted:
          body.taxDeducted === "Yes" ||
          body.taxDeducted === true ||
          body.taxDeducted === "true",
        paymentReceivedOn: isValidDateString(body.paymentReceivedOn)
          ? new Date(body.paymentReceivedOn)
          : invoice.paymentReceivedOn,
        paymentDocuments: [
          ...(invoice.paymentDocuments || []),
          ...paymentDocumentUrls,
        ],
        notes: body.notes || invoice.notes,
        balancedDue,
      };
    } else if (action === "writeOff") {
      // Store the current balancedDue in writeofamount, set balancedDue to 0
      const total = invoice.total || 0;
      const paidAmount = invoice.amountReceived || 0;
      const currentBalancedDue = Math.max(0, total - paidAmount);

      updatedFields = {
        status: "Paid",
        balancedDue: 0,
        writeofamount: currentBalancedDue,
        writeofnotes: body.reason || "",
        writeofdate: isValidDateString(body.writeOffDate)
          ? new Date(body.writeOffDate)
          : new Date(),
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

    return NextResponse.json(
      { success: true, data: updatedInvoice },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record payment" },
      { status: 500 }
    );
  }
}