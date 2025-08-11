import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const paidInvoices = await prisma.invoice.findMany({
      where: { status: "Paid" },
      orderBy: { paymentDate: "desc" },
      include: {
        customer: {
          select: {
            displayName: true,
            companyName: true,
            emailAddress: true,
            phoneNumberWork: true,
            phoneNumberMobile: true,
          },
        },
      },
    });

    // Map data to match frontend expectations
    const mapped = paidInvoices.map((inv) => ({
      id: inv.id,
      invoiceDate: inv.invoiceDate,
      paymentDate: inv.paymentDate,
      referenceNumber: inv.referenceNumber,
      customer: {
        displayName: inv.customer?.displayName || "",
        companyName: inv.customer?.companyName || "",
        email: inv.customer?.emailAddress || "",
        phone: inv.customer?.phoneNumberWork || inv.customer?.phoneNumberMobile || "",
      },
      invoiceCode: inv.invoiceCode,
      paymentMode: inv.paymentMode,
      amountReceived: inv.amountReceived,
      unusedAmount: inv.balancedDue,
      total: inv.total,
      status: inv.status,
      poNumber: inv.poNumber,
      paymentReference: inv.paymentId,
      dueDate: inv.dueDate,
      taxAmount: 0, 
      discount: 0,  
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch paid invoices" }, { status: 500 });
  }
}