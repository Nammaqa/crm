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
    // Accept FormData for file upload
    const contentType = req.headers.get("content-type") || "";
    let jdImageUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      data.requirementName = formData.get("requirementName") as string;
      data.companyName = formData.get("companyName") as string;
      data.jobDescription = formData.get("jobDescription") as string;
      data.experience = Number(formData.get("experience"));
      data.noticePeriod = Number(formData.get("noticePeriod"));
      data.positions = Number(formData.get("positions"));
      data.primarySkills = formData.get("primarySkills") as string;
      data.secondarySkills = formData.get("secondarySkills") as string;
      data.closePositions = formData.get("closePositions") as string;
      data.requirementType = formData.get("requirementType") as string;
      data.workLocation = formData.get("workLocation") as string;
      data.budget = Number(formData.get("budget"));

      // Handle JD image upload (optional)
      const jdImage = formData.get("jdImage") as File | null;
      if (jdImage && jdImage.size > 0) {
        const arrayBuffer = await jdImage.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary
        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "jd_images" },
            (error, result) => {
              if (error || !result) return reject(error || new Error("Cloudinary upload failed"));
              resolve(result as { secure_url: string });
            }
          );
          stream.end(buffer);
        });
        jdImageUrl = uploadResult.secure_url;
      }
    } else {
      // Fallback: Accept JSON (no image)
      data = await req.json();
    }

    // Store in DB
    const newRequirement = await prisma.requirement.create({
      data: {
        requirementName: data.requirementName,
        companyName: data.companyName,
        jobDescription: data.jobDescription,
        jdImage: jdImageUrl, 
        experience: data.experience,
        noticePeriod: data.noticePeriod,
        positions: data.positions,
        primarySkills: data.primarySkills,
        secondarySkills: data.secondarySkills,
        closePositions: data.closePositions,
        requirementType: data.requirementType,
        workLocation: data.workLocation,
        budget: data.budget,
      },
    });

    console.log("POST /api/requirements - Created:", newRequirement);

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