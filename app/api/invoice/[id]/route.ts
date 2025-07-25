import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid invoice ID" }, { status: 400 });
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
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch invoice" }, { status: 500 });
  }
}