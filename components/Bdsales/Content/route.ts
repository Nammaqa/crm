// import { prisma } from "@/lib/prisma";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const lead = await prisma.lead.create({
//       data: body,
//     });

//     return new Response(JSON.stringify(lead), { status: 201 });
//   } catch (error) {
//     if (error.code === "P2002") {
//       return new Response(
//         JSON.stringify({ error: "A lead with this companyID already exists." }),
//         { status: 400 }
//       );
//     }

//     console.error("Error creating lead:", error);
//     return new Response(
//       JSON.stringify({ error: "Failed to create lead." }),
//       { status: 500 }
//     );
//   }
// }

// const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     // Check if companyID already exists
//     const res = await fetch(`/api/lead/check?companyID=${formData.companyID}`);
//     const data = await res.json();

//     if (data.exists) {
//       toast.error("A lead with this companyID already exists.");
//       return;
//     }

//     // Proceed with form submission
//     const response = await fetch("/api/lead", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(formData),
//     });

//     if (response.ok) {
//       toast.success("Lead submitted successfully!");
//       // Clear the form
//       setFormData(initialFormData);
//     } else {
//       const errorData = await response.json();
//       toast.error(`Submission failed: ${errorData.error}`);
//     }
//   } catch (err) {
//     toast.error("Network error while submitting the form.");
//     console.error(err);
//   }
// };