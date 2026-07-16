import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { IncidentReportValues } from "@/lib/schemas/incident-report";

export function useCreateIncidentReportMutation() {
  return useMutation({
    mutationFn: (values: IncidentReportValues) =>
      apiFetch("/incidents", {
        auth: false,
        method: "POST",
        body: {
          principalName: values.principalName,
          principalGender: values.principalGender,
          principalDob: values.principalDob,
          principalType: values.principalType,
          patientId: values.patientId,
          patientWardDept: values.patientWardDept,
          staffJobTitle: values.staffJobTitle,
          staffPhone: values.staffPhone,
          staffPlaceOfWork: values.staffPlaceOfWork,
          staffSite: values.staffSite,
          peopleInvolved: values.peopleInvolved,
          dateOfIncident: values.dateOfIncident,
          timeOfIncident: values.timeOfIncident,
          locationOfIncident: values.locationOfIncident,
          incidentWardDept: values.incidentWardDept,
          witnesses: values.witnesses,
          witnessType: values.witnessType,
          witnessWardDept: values.witnessWardDept,
          witnessJobTitle: values.witnessJobTitle,
          // NOTE: backend expects this misspelled key — preserved intentionally.
          witenssPhone: values.witnessPhone,
          isNearMiss: values.isNearMiss,
          causeGroup: values.causeGroup,
          causes: values.causes,
          prescribingDoctor: values.prescribingDoctor,
          treatmentReceived: values.treatmentReceived,
          equipmentInvolved: values.equipmentInvolved,
          equipmentModel: values.equipmentModel,
          equipmentSentForRepair: values.equipmentSentForRepair,
          equipmentWithdrawn: values.equipmentWithdrawn,
          equipmentRetained: values.equipmentRetained,
          equipmentNumber: values.equipmentNumber,
          isMedicalDevice: values.isMedicalDevice,
          reporterName: values.reporterName,
          reporterDesignation: values.reporterDesignation,
          signature: values.signature,
          reporterInfo: values.reporterInfo,
          date: values.reporterDate,
          severityLevel: values.severityLevel,
          incidentStatus: values.incidentStatus,
        },
      }),
  });
}
