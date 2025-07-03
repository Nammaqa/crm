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

// ✅ GET handler
export async function GET(req, context) {
  const { params } = context;
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: "Invalid candidate ID" }), { status: 400 });
  }

  try {
    const candidate = await prisma.candidate.findUnique({ where: { id } });

    if (!candidate) {
      return new Response(JSON.stringify({ error: "Candidate not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(candidate), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

// ✅ PUT handler
export async function PUT(req, context) {
  const { params } = context;
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: "Invalid candidate ID" }), { status: 400 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response("Unsupported content type", { status: 400 });
    }

    const formData = await req.formData();
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    let resumeUrl = data['Upload Resume'];

    if (resumeUrl instanceof File && resumeUrl.size > 0) {
      const arrayBuffer = await resumeUrl.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      resumeUrl = await uploadToCloudinary(buffer, resumeUrl.name);
    }

    const updated = await prisma.candidate.update({
      where: { id },
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
        resumeLink: typeof resumeUrl === 'string' ? resumeUrl : null,
      },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PUT error:", error);
    return new Response(JSON.stringify({ error: "Failed to update candidate" }), { status: 500 });
  }
}

// ✅ DELETE handler
export async function DELETE(req, context) {
  const { params } = context;
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: "Invalid candidate ID" }), { status: 400 });
  }

  try {
    await prisma.candidate.delete({ where: { id } });

    return new Response(JSON.stringify({ message: "Deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("DELETE error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete candidate" }), { status: 500 });
  }
}
