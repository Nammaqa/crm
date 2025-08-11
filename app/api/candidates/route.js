import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(fileBuffer, fileName) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'auto', public_id: fileName },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    ).end(fileBuffer);
  });
}

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
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const data = {};
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          data[key] = value;
        } else {
          data[key] = value;
        }
      }

      let resumeUrl = null;
      if (data['Upload Resume'] instanceof File && data['Upload Resume'].size > 0) {
        const arrayBuffer = await data['Upload Resume'].arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        resumeUrl = await uploadToCloudinary(buffer, data['Upload Resume'].name);
      }

      // Fix: Ensure demandCode is mapped correctly
      const demandCodeValue = data['Demand Code'] ?? data['demandCode'] ?? null;

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
          demandCode: demandCodeValue, 
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
          resumeLink: resumeUrl
        }
      });

      return Response.json(candidate, { status: 201 });
    } else {
      return new Response('Unsupported content type', { status: 400 });
    }
  } catch (error) {
    console.error('POST error:', error);
    return new Response('Failed to create candidate', { status: 500 });
  }
}