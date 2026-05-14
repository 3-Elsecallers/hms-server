import axios from 'axios';
import 'dotenv/config';

const CDR_URL = process.env.CDR_URL || 'http://localhost:8080/ehrbase/rest/openehr/v1';

export const EhrService = {
  /**
   * Creates a new EHR in the CDR for a patient
   */
  async createEhr(patientId: string, userToken: string): Promise<string> {
    const response = await axios.post(`${CDR_URL}/ehr`, {
      queryable: true,
      modifiable: true,
      subject_id: patientId,
      subject_namespace: "hms-system"
    }, { headers: { 'Authorization': `Basic ${userToken}` } });

    return response.data.ehr_id.value;
  },

  /**
   * Commits a Clinical Composition (e.g., Vitals)
   */
  async saveVitals(ehrId: string, vitalsData: any, userToken: string) {
    const composition = {
      "_type": "COMPOSITION",
      "archetype_node_id": "openEHR-EHR-COMPOSITION.encounter.v1",
      "name": { "value": "Vital Signs Encounter" },
      "language": { "terminology_id": { "value": "ISO_639-1" }, "code_string": "en" },
      "territory": { "terminology_id": { "value": "ISO_3166-1" }, "code_string": "GH" }, // Ghana context
      "category": { "value": "event", "defining_code": { "code_string": "433" } },
      "content": [
        // This would be mapped from vitalsData to the specific Archetype structure
      ]
    };

    return axios.post(`${CDR_URL}/ehr/${ehrId}/composition`, composition, {
      headers: {
        'Authorization': `Basic ${userToken}`,
        'template_id': 'vitals_v1'
      }
    });
  }
};