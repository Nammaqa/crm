import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary config from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Define a specific type for the `data` object
interface RequirementData {
  requirementId: string;  // Add this
  requirementName: string;
  companyName: string;
  jobDescription: string;
  experience: number;
  noticePeriod: number;
  positions: number;
  primarySkills: string;
  secondarySkills: string;
  closePositions: string;
  requirementType: string;
  workLocation: string;
  budget: number;
  jdImage?: string;
  priority: 'Low' | 'Medium' | 'High';  // Add this
}

let data: RequirementData = {} as RequirementData;

// ✅ GET all requirements
export async function GET() {
  try {
    console.log("GET /api/requirements - Fetching all requirements");

    const requirements = await prisma.requirement.findMany();

    console.log("GET /api/requirements - Success", requirements.length, "items found");

    return NextResponse.json(requirements, { status: 200 });
  } catch (error) {
    console.error("GET /api/requirements - Error:", error);
    return NextResponse.json({ error: 'Failed to fetch requirements' }, { status: 500 });
  }
}

// ✅ POST a new requirement (with optional JD image upload to Cloudinary)
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let jdImageUrl: string | null = null;
    let formData: RequirementData;

    if (contentType.includes("multipart/form-data")) {
      const formDataRaw = await req.formData();
      
      // Handle file upload first
      const jdImage = formDataRaw.get("jdImage") as File | null;
      if (jdImage && jdImage.size > 0) {
        const arrayBuffer = await jdImage.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "jd_images" },
            (error, result) => {
              if (error || !result) return reject(error || new Error("Upload failed"));
              resolve(result as { secure_url: string });
            }
          );
          stream.end(buffer);
        });
        jdImageUrl = uploadResult.secure_url;
      }

      // Prepare the data object
      formData = {
        requirementName: formDataRaw.get("requirementName") as string,
        companyName: formDataRaw.get("companyName") as string,
        jobDescription: formDataRaw.get("jobDescription") as string,
        experience: Number(formDataRaw.get("experience")),
        noticePeriod: Number(formDataRaw.get("noticePeriod")),
        positions: Number(formDataRaw.get("positions")),
        primarySkills: formDataRaw.get("primarySkills") as string,
        secondarySkills: formDataRaw.get("secondarySkills") as string,
        closePositions: formDataRaw.get("closePositions") as string,
        requirementType: formDataRaw.get("requirementType") as string,
        workLocation: formDataRaw.get("workLocation") as string,
        budget: Number(formDataRaw.get("budget")),
        priority: (formDataRaw.get("priority") as 'Low' | 'Medium' | 'High') || 'Medium',
        requirementId: formDataRaw.get("requirementId") as string,
      };
    } else {
      formData = await req.json();
    }

    // Create requirement in database
    const newRequirement = await prisma.requirement.create({
      data: {
        requirementName: formData.requirementName,
        companyName: formData.companyName,
        jobDescription: formData.jobDescription,
        experience: formData.experience,
        noticePeriod: formData.noticePeriod,
        positions: formData.positions,
        primarySkills: formData.primarySkills,
        secondarySkills: formData.secondarySkills,
        closePositions: formData.closePositions,
        requirementType: formData.requirementType,
        workLocation: formData.workLocation,
        budget: formData.budget,
        priority: formData.priority,
        requirementId: formData.requirementId,
        jdImage: jdImageUrl,
      },
    });

    return NextResponse.json(newRequirement, { status: 201 });

  } catch (error) {
    console.error("POST /api/requirements - Error:", error);
    return NextResponse.json({ error: "Failed to create requirement" }, { status: 500 });
  }
}

// ✅ PUT update a requirement
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("PUT /api/requirements - Body:", body);

    const { id, ...data } = body;
    if (!id) {
      console.error("PUT /api/requirements - Missing ID");
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const updatedRequirement = await prisma.requirement.update({
      where: { id: parseInt(id, 10) },
      data,
    });

    console.log("PUT /api/requirements - Updated:", updatedRequirement);

    return NextResponse.json(updatedRequirement, { status: 200 });

  } catch (error) {
    console.error("PUT /api/requirements - Error:", error);
    return NextResponse.json({ error: 'Failed to update requirement' }, { status: 500 });
  }
}

// ✅ DELETE a requirement
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    console.log("DELETE /api/requirements - ID:", id);

    if (!id) {
      console.error("DELETE /api/requirements - Missing ID");
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const deletedRequirement = await prisma.requirement.delete({
      where: { id: parseInt(id, 10) },
    });

    console.log("DELETE /api/requirements - Deleted:", deletedRequirement);

    return NextResponse.json(deletedRequirement, { status: 200 });

  } catch (error) {
    console.error("DELETE /api/requirements - Error:", error);
    return NextResponse.json({ error: 'Failed to delete requirement' }, { status: 500 });
  }
}