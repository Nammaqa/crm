// app/api/candidates/route.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany();
    return Response.json(candidates);
  } catch (error) {
    return new Response('Failed to fetch candidates', { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const candidate = await prisma.candidate.create({
      data: {
        name: data['Name'],
        contactNumber: data['Contact Number'],
        alternateContactNumber: data['Alternate Contact Number'],
        email: data['Email ID'],
        sourcedFrom: data['Sourced From'],
        employmentType: data['Employment Type'],
        domainExperience: data['Domain Experience (Primary)'],
        company: data['Current / Previous Company'],
        role: data['Role'],
        currentCTC: parseFloat(data['Current CTC (In LPA)'] || 0),
        expectedCTC: parseFloat(data['Expected CTC (In LPA)'] || 0),
        workingStatus: data['Current Working Status'],
        noticePeriod: parseInt(data['Notice Period (In Days)'] || 0),
        location: data['Current Location (Nearest City)'],
        relocate: data['Ready to Relocate for Other Location'] === 'Yes',
        preferredLocation: data['Prefered Location (City)'],
        interviewAvailability: data['Availability for the Interview'],
        clientName: data['Client Name'],
        demandCode: data['Demand Code'],
        interviewTakenBy: data['Interview taken by'],
        comments: data['Comments'] ? [data['Comments']] : [],
        status: data['Status'],
        followUps: data['Follow Ups'],
        updatedBy: data['Updated By'],
        offersAny: data['Offers Any'] === 'Yes',
        offerDetails: data['Offer Details'],
        screeningComment: data['Screening Comment (L2)'],
        technicalSkills: data['Technical Skills'],
        relevantExperience: data['Relavant Experience'],
        primarySkillExp: data['Relevant Experience in Primary Skill'],
        secondarySkillExp: data['Relevant Experience in Secondary Skill'],
        nammaqaUpdate: data['NammaQA update'],
        clientInterviewStatus: data['Client Interview Status'],
        feedback: data['Feedback'],
        resumeLink: data['Upload Resume']
      }
    });

    return Response.json(candidate, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return new Response('Failed to create candidate', { status: 500 });
  }
}
