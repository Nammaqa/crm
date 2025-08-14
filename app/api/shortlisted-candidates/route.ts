import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get the logged-in user's name from the session/cookie (assuming JWT in cookie named 'token')
    // You may need to adjust this logic based on your actual auth implementation
    const userName = req.nextUrl.searchParams.get('userName');
    if (!userName) {
      return NextResponse.json({ success: false, message: 'Missing userName' }, { status: 400 });
    }

    // 1. Get all companyIDs for this sales user from Lead table
    const userLeads = await prisma.lead.findMany({
      where: { salesName: userName },
      select: { companyID: true },
    });
    const userCompanyIDs = userLeads.map((lead) => lead.companyID).filter(Boolean);
    console.log('API shortlisted-candidates:', { userName, userCompanyIDs });

    // 2. Get all shortlisted candidates whose demandCode is in userCompanyIDs
    const candidates = await prisma.candidate.findMany({
      where: {
        acmanagerStatus: 'Selected',
        demandCode: { in: userCompanyIDs },
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log('API shortlisted-candidates: candidates', candidates);

    return NextResponse.json({ success: true, data: candidates });
  } catch (error) {
    console.error('Error fetching shortlisted candidates:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
