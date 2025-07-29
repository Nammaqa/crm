import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, PaymentTerms } from "@prisma/client";
import { uploadImagetoCloudinary, uploadPDFtoCloudinary } from "@/lib/cloudinary";

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
    let body: any = {};
    let files: File[] = [];
    let isMultipart = false;
    let invoiceTemplateUrl: string | undefined = undefined;
    let documentUrls: string[] = [];

    // Detect multipart/form-data
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      isMultipart = true;
      const formData = await request.formData();
      // Convert FormData to object
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          files.push(value);
        } else if (key === "items") {
          try {
            body.items = JSON.parse(value as string);
          } catch {
            body.items = [];
          }
        } else if (key === "isDraft") {
          body.isDraft = value === "true";
        } else if (key === "invoiceTemplate") {
          body.invoiceTemplate = value as string;
        } else {
          body[key] = value;
        }
      }
    } else {
      body = await request.json();
    }

    // Handle invoiceTemplate (base64 PDF)
    if (body.invoiceTemplate) {
      // Remove data URL prefix if present
      let base64 = body.invoiceTemplate;
      if (base64.startsWith("data:")) {
        base64 = base64.substring(base64.indexOf(",") + 1);
      }
      const buffer = Buffer.from(base64, "base64");
      invoiceTemplateUrl = await uploadPDFtoCloudinary(buffer, "invoices");
    }

    // Handle attached documents (files)
    for (const file of files) {
      // Accept only files with size > 0
      if (file.size > 0) {
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // Use uploadImagetoCloudinary for all file types (auto-detect)
        const url = await uploadImagetoCloudinary(buffer, "invoice-documents");
        if (url) documentUrls.push(url);
      }
    }

    // Extract fields
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

    if (!customerId || !invoiceCode || !invoiceDate || !items?.length) {
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
        Documents: documentUrls,
        status: isDraft || "Draft",
        isDraft: isDraft,
        gstNumber: gstNumber || null,
        gstTreatment: gstTreatment || null,
        placeOfSupply: placeOfSupply || null,
        invoiceTemplate: invoiceTemplateUrl || null,
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

    return NextResponse.json({ success: true, data: { ...invoice } }, { status: 201 });
  } catch (error: any) {
    console.error("Error saving invoice:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to save invoice" }, { status: 500 });
  }
}