import type { Language } from '../types';

export const NCD_TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    moduleTitle: 'NCD Care',
    moduleSubtitle: 'Non-Communicable Disease Screening & Early Detection',
    totalRegistered: 'Registered Beneficiaries',
    screenedBeneficiaries: 'Screened Beneficiaries',
    screeningsPending: 'Pending Screenings',
    followupsDue: 'Follow-ups Due',
    requiringClinicalAssessment: 'High Risk (Clinical Review)',
    pendingReferrals: 'Pending Referrals',
    
    // Tabs
    navDashboard: 'Dashboard',
    navBeneficiaries: 'Beneficiaries',
    navBasicScreening: 'NCD Screening',
    navVisualScreening: 'Visual Screening',
    navRiskAssessment: 'Risk Engine',
    navFollowups: 'Follow-ups',
    navReferrals: 'Referrals',
    navRecords: 'Health Records',
    navSupervisor: 'Supervisor View',

    // Visual Areas
    areaEyes: 'Eyes (Conjunctiva)',
    areaEyesDesc: 'Visible conjunctival pallor screening for anemia detection',
    areaNeck: 'Neck (Thyroid / Goiter)',
    areaNeckDesc: 'Visible anterior neck swelling and symmetry evaluation',
    areaFeet: 'Feet (Diabetic Lesions)',
    areaFeetDesc: 'Visible ulcers, open sores, discoloration & skin breakdown',
    areaLegs: 'Legs (Edema / Swelling)',
    areaLegsDesc: 'Visible bilateral or unilateral lower limb fluid retention',

    // Actions
    actionCaptureImage: 'Capture Photo',
    actionStartScreening: 'Start Screening',
    actionViewSummary: 'View Summary',
    actionVoiceAssist: 'Voice Entry',
  },
  hi: {
    moduleTitle: 'NCD जांच (NCD Care)',
    moduleSubtitle: 'गैर-संचारी रोग (बीपी, शुगर, कैंसर) प्रारंभिक जांच',
    totalRegistered: 'कुल पंजीकृत नागरिक',
    screenedBeneficiaries: 'जांच संपन्न नागरिक',
    screeningsPending: 'लंबित NCD जांच',
    followupsDue: 'नियत फॉलो-अप',
    requiringClinicalAssessment: 'उच्च जोखिम (डॉक्टर जांच जरूरी)',
    pendingReferrals: 'लंबित रेफरल',
    
    // Tabs
    navDashboard: 'डैशबोर्ड',
    navBeneficiaries: 'लाभार्थी सूची',
    navBasicScreening: 'NCD जांच',
    navVisualScreening: 'नेत्र/त्वचा विजुअल जांच',
    navRiskAssessment: 'जोखिम मूल्यांकन',
    navFollowups: 'फॉलो-अप कार्य',
    navReferrals: 'अस्पताल रेफरल',
    navRecords: 'स्वास्थ्य रिकॉर्ड',
    navSupervisor: 'पर्यवेक्षक दृश्य',

    // Visual Areas
    areaEyes: 'आंखें (कंजंक्टिवा)',
    areaEyesDesc: 'एनीमिया (खून की कमी) के लिए आंखों के अंदरूनी हिस्से का पीलापन',
    areaNeck: 'गर्दन (थायराइड / घेंघा)',
    areaNeckDesc: 'गर्दन के निचले हिस्से में उभार या सूजन की जांच',
    areaFeet: 'पैर (डायबिटीज घाव)',
    areaFeetDesc: 'पैर के तलवों में छाले, घाव, संक्रमण या रंग में बदलाव',
    areaLegs: 'टांगें (एडिमा / सूजन)',
    areaLegsDesc: 'पैरों या टखनों में दोनों तरफ सूजन या द्रव संचय',

    // Actions
    actionCaptureImage: 'फोटो लें (Camera)',
    actionStartScreening: 'जांच शुरू करें',
    actionViewSummary: 'सारांश देखें',
    actionVoiceAssist: 'बोलकर दर्ज करें',
  },
  mr: {
    moduleTitle: 'NCD तपासणी',
    moduleSubtitle: 'अंससर्गजन्य रोग तपासणी आणि लवकर निदान',
    totalRegistered: 'नोंदणीकृत नागरिक',
    screenedBeneficiaries: 'तपासणी पूर्ण नागरिक',
    screeningsPending: 'प्रलंबित तपासण्या',
    followupsDue: 'पाठपुरावा भेटी',
    requiringClinicalAssessment: 'उच्च धोका (वैद्यकीय तपासणी)',
    pendingReferrals: 'प्रलंबित संदर्भ (Referrals)',
    
    // Tabs
    navDashboard: 'डॅशबोर्ड',
    navBeneficiaries: 'नागरिक यादी',
    navBasicScreening: 'NCD तपासणी',
    navVisualScreening: 'व्हिज्युअल तपासणी',
    navRiskAssessment: 'धोका मूल्यांकन',
    navFollowups: 'पाठपुरावा',
    navReferrals: 'संदर्भ (Referrals)',
    navRecords: 'आरोग्य नोंदी',
    navSupervisor: 'पर्यवेक्षक',

    // Visual Areas
    areaEyes: 'डोळे (कंजंक्टिव्हा)',
    areaEyesDesc: 'अशक्तपणा आणि ॲनिमियासाठी डोळ्यांच्या आतील फिकटपणा तपासणी',
    areaNeck: 'मान (गलगंड / थायरॉईड)',
    areaNeckDesc: 'मानेच्या पुढील भागातील सूज तपासणी',
    areaFeet: 'पावले (मधुमेह जखमा)',
    areaFeetDesc: 'मधुमेहातील पावलांवरील जखमा, अल्सर व भेगा तपासणी',
    areaLegs: 'पाय (सूज / एडेमा)',
    areaLegsDesc: 'पायांवर किंवा घोट्यांवर पाणी साठून आलेली सूज',

    // Actions
    actionCaptureImage: 'फोटो काढा',
    actionStartScreening: 'तपासणी सुरू करा',
    actionViewSummary: 'सारांश पहा',
    actionVoiceAssist: 'आवाजाने नोंदवा',
  },
};
