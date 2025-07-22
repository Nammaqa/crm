import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, PaymentTerms } from "@prisma/client";

const prisma = new PrismaClient();

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received invoice data:", JSON.stringify(body, null, 2));

    const {
      customerId,
      invoiceCode,
      invoiceDate,
      terms,
      dueDate,
      poNumber,
      notes,
      gstTreatment,
      gstNumber,
      placeOfSupply,
      items,
      total,
      isDraft,
    } = body;

    if (!customerId || !invoiceCode || !invoiceDate || !dueDate || !items?.length) {
      return NextResponse.json({ success: false, error: "Missing required invoice data" }, { status: 400 });
    }

    // Convert terms string to enum
    const paymentTerms: PaymentTerms = mapTermsToEnum(terms);
   
    // Create invoice record
    const invoice = await prisma.invoice.create({
      data: {
        customerId: Number(customerId),
        invoiceCode,
        invoiceDate: new Date(invoiceDate),
        terms: paymentTerms,
        dueDate: new Date(dueDate),
        poNumber: poNumber || null,
        customerNotes: notes || null,
        total: Number(total),
        Documents: [],
        status: isDraft ? "Draft" : "Pending",
        isDraft: isDraft,
        gstNumber: gstNumber || null,
        gstTreatment: gstTreatment || null,
        placeOfSupply: placeOfSupply || null,
      },
    });

    // Create related items
    const itemsToCreate = items.map((item: any) => ({
      invoiceId: invoice.id,
      itemDetails: (item.description || item.name || '').trim(),
      quantity: parseInt(item.quantity) || 0,
      rate: parseFloat(item.rate) || 0,
      amount: parseFloat(item.amount) || 0,
      sac: item.sac || null,
      discountPercentage: parseFloat(item.discount) || 0,
      GstPercentage: parseFloat(item.gstPercentage) || 0,
    }));

    await prisma.item.createMany({
      data: itemsToCreate,
    });

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error: any) {
    console.error("Error saving invoice:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to save invoice" }, { status: 500 });
  }
}