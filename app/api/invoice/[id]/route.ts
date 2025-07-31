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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid invoice ID" },
        { status: 400 }
      );
    }
    const invoice = await prisma.invoice.findUnique({
      where: { id },
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
    });
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Calculate balancedDue for this invoice
    let balance = 0;
    if (invoice.status === "Cancelled") {
      balance = 0;
    } else {
      balance = (invoice.total || 0) - (invoice.amountReceived || 0);
      if (balance < 0) balance = 0;
    }
    const updatedInvoice = { ...invoice, balancedDue: balance };

    return NextResponse.json({ success: true, data: updatedInvoice });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

