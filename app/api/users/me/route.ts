import { verifyJwtToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { companyName, businessType, spocs, remarks, percentage } = data;

    if (!companyName || !/^[a-zA-Z\s]+$/.test(companyName)) {
      return NextResponse.json(
        { error: "Invalid or missing company name." },
        { status: 400 }
      );
    }

    // You can add validation for other fields here if needed

    console.log("Received Lead Data:", {
      companyName,
      businessType,
      spocs,
      remarks,
      percentage,
    });

    return NextResponse.json(
      { message: "Lead saved successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const valid = token && await verifyJwtToken(token);
  if (!valid) {

    return NextResponse.json(
      { error: "Unauthorised" },
      { status: 400 }
    );
  }
  // console.log(valid)
  const user = await prisma.user.findFirst({
    where:{
      userName:valid.userName
    },
    select:{
      userName:true,
      wbEmailId:true
    }
  })
  return NextResponse.json(
    { success:true, data: user || null },
    { status: 200 }
  );
}
