import { z } from "zod";

export const managementSchema = z.object({
  impactOnService: z.string().min(1, "Required"),
  contributoryFactors: z.string().min(1, "Required"),
  actionsTakenOutcomes: z.string().min(1, "Required"),
  recommendations: z.string().min(1, "Required"),
  lessonsLearned: z.string().min(1, "Required"),

  informedPatient: z.boolean(),
  informedRelative: z.boolean(),
  informedSeniorManager: z.boolean(),
  informedPharmacist: z.boolean(),
  policeIncidentNumber: z.string().optional(),
  informedOther: z.string().optional(),

  riskSeverity: z.number().min(1, "1-5").max(5, "1-5"),
  riskLikelihood: z.number().min(1, "1-5").max(5, "1-5"),
  riskRating: z.number(),

  ohsAbsenceOver3Days: z.boolean(),
  ohsActOfViolenceOrDanger: z.boolean(),
  ohsHospitalizationOver24Hours: z.boolean(),
  ohsStaffName: z.string().optional(),
  ohsStaffDob: z.string().optional(),
  ohsStaffAddress: z.string().optional(),

  managerName: z.string().min(1, "Required"),
  managerSignature: z.boolean().refine((v) => v === true, {
    message: "Signature acknowledgement is required",
  }),
  managerDesignation: z.string().min(1, "Required"),
  managerDate: z.string().min(1, "Required"),
});

export type ManagementValues = z.infer<typeof managementSchema>;
