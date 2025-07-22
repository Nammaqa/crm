import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, PaymentTerms } from "@prisma/client";

const prisma = new PrismaClient();

function mapTermsToEnum(term: string): PaymentTerms {
  switch ((term || "").toLowerCase()) {
    case "net 15":
      return "NET_15";
    case "net 30":
      return "NET_30";
    case "net 45":
      return "NET_45";
    case "net 60":
      return "NET_60";
    case "due on receipt":
      return "DUE_ON_RECEIPT";
    case "due end of the month":
      return "DUE_END_OF_MONTH";
    case "due end of next month":
      return "DUE_END_OF_NEXT_MONTH";
    default:
      return "NET_30";
  }
}

export async function GET(request: NextRequest) {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: {
          select: {
            id: true,
            displayName: true,
            companyName: true,
            emailAddress: true,
            gstNumber: true,
            gstTreatment: true,
            placeOfSupply: true,
            billingAddress: true,
            billingCity: true,
            billingState: true,
            billingPinCode: true,
            billingCountry: true,
            shippingAddress: true,
            shippingCity: true,
            shippingState: true,
            shippingPinCode: true,
            shippingCountry: true,
            phoneNumberWork: true,
            phoneNumberMobile: true,
          },
        },
        Item: true,
      },
      orderBy: { id: "desc" },
    });
    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let invoiceData, items;
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      // Not used in your UI
      return NextResponse.json({ success: false, error: "Multipart not supported" }, { status: 400 });
    } else {
      const body = await request.json();
      invoiceData = body.invoice;
      items = body.items;
    }

    // Validate required fields
    if (
      !invoiceData ||
      !invoiceData.customerId ||
      !invoiceData.invoiceNumber ||
      !invoiceData.invoiceDate ||
      !invoiceData.dueDate ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required invoice fields" },
        { status: 400 }
      );
    }

    // Check for duplicate invoiceCode
    const existing = await prisma.invoice.findUnique({
      where: { invoiceCode: invoiceData.invoiceNumber }
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Invoice number already exists. Please use a unique invoice number." },
        { status: 409 }
      );
    }

    const createdInvoice = await prisma.invoice.create({
      data: {
        customerId: Number(invoiceData.customerId),
        invoiceCode: invoiceData.invoiceNumber,
        invoiceDate: new Date(invoiceData.invoiceDate),
        terms: mapTermsToEnum(invoiceData.terms),
        dueDate: new Date(invoiceData.dueDate),
        customerNotes: invoiceData.notes || "",
        total: Number(invoiceData.total) || 0,
        poNumber: invoiceData.poNumber || "",
        isDraft: false,
        Item: {
          create: items.map((item: any) => ({
            itemDetails: item.name || "",
            quantity: Number(item.quantity) || 1,
            rate: Number(item.rate) || 0,
            amount: Number(item.amount) || 0,
            sac: item.sac || null,
            discountPercentage: item.discount || null,
            GstPercentage: item.taxType && item.taxType.startsWith('gst') ? parseFloat(item.taxType.replace('gst', '')) : null,
          })),
        },
      },
      include: {
        customer: true,
        Item: true,
      },
    });

    return NextResponse.json({ success: true, data: createdInvoice }, { status: 201 });
  } catch (error: any) {
    // Unique constraint error
    if (error.code === 'P2002' && error.meta?.target?.includes('invoiceCode')) {
      return NextResponse.json(
        { success: false, error: "Invoice number already exists. Please use a unique invoice number." },
        { status: 409 }
      );
    }
    console.error("Invoice POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}