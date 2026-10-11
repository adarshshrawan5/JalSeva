import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'mr' | 'hi';

export interface Translations {
  // Brand & Slogans
  brandName: string;
  brandSub: string;
  slogan: string;
  sloganMarathi: string;
  sloganHindi: string;

  // Nav Items
  navHome: string;
  navSchedule: string;
  navBookTanker: string;
  navCHSBulk: string;
  navReportGrievance: string;
  navTrackStatus: string;
  navMeterReading: string;
  navWardDirectory: string;
  navServices: string;
  navStaffPortals: string;
  navDriverPortal: string;
  navAdminDesk: string;

  // Common Actions
  viewDetails: string;
  bookNow: string;
  trackNow: string;
  submit: string;
  cancel: string;
  print: string;
  close: string;
  copy: string;
  copied: string;
  download: string;

  // Citizen Authentication & Account
  signIn: string;
  signUp: string;
  signInOrSignUp: string;
  signOut: string;
  myProfile: string;
  citizenAccount: string;

  // Helplines & Badges
  helplineTitle: string;
  emergency24x7: string;
  civicGuarantee: string;
  verifiedGov: string;

  // Citizen Dashboard
  coreModulesTitle: string;
  coreModulesSub: string;
  transparencyMetrics: string;
  distributionStats: string;
  suppliedToday: string;
  purityTested: string;
  activeGrievances: string;
  citizensServed: string;

  // Conservation Widget
  conservationTitle: string;
  conservationSubtitle: string;
  dailyTipBadge: string;
  pledgeButton: string;
  pledgedBadge: string;
  waterSavedEst: string;

  // WhatsApp Alert
  whatsappPreviewTitle: string;
  whatsappNotice: string;
  sendWhatsApp: string;
  otpWarning: string;

  // Meter Reading
  meterReaderTitle: string;
  meterReaderSubtitle: string;
  meterUploadPhoto: string;
  calculateBill: string;
  estimatedBill: string;
}

const translations: Record<Language, Translations> = {
  en: {
    brandName: 'JalSeva',
    brandSub: 'Mira Bhayandar Municipal Corporation',
    slogan: 'Every Drop Counts • MBMC Water Network',
    sloganMarathi: 'प्रत्येक थेंब मोलाचा आहे',
    sloganHindi: 'हर बूंद मायने रखती है',

    navHome: 'Portal Home',
    navSchedule: 'Schedule & Outages',
    navBookTanker: 'Book Tanker',
    navCHSBulk: 'Society Bulk Booking',
    navReportGrievance: 'Report Grievance',
    navTrackStatus: 'Track Live Status',
    navMeterReading: 'Water Meter Self-Reading',
    navWardDirectory: 'Ward Directory',
    navServices: 'Citizen Services',
    navStaffPortals: 'Staff Desk',
    navDriverPortal: 'Driver Portal',
    navAdminDesk: 'Admin Desk',

    viewDetails: 'View Details',
    bookNow: 'Book Tanker',
    trackNow: 'Track Live',
    submit: 'Submit Application',
    cancel: 'Cancel',
    print: 'Print Receipt',
    close: 'Close',
    copy: 'Copy',
    copied: 'Copied!',
    download: 'Download PDF',

    signIn: 'Sign In',
    signUp: 'Sign Up',
    signInOrSignUp: 'Sign In / Register',
    signOut: 'Sign Out',
    myProfile: 'My Profile',
    citizenAccount: 'Citizen Account',

    helplineTitle: '24x7 Water Helpline',
    emergency24x7: 'Emergency Control Room',
    civicGuarantee: 'MBMC Citizen Charter Guarantee',
    verifiedGov: 'Official MBMC Civic Portal',

    coreModulesTitle: 'Citizen Core Modules',
    coreModulesSub: 'Access municipal water services in under 3 clicks',
    transparencyMetrics: 'Transparency Metrics',
    distributionStats: 'MBMC JalSeva Distribution Statistics Today',
    suppliedToday: 'Supplied Today',
    purityTested: 'Chlorination Standard',
    activeGrievances: 'Active Grievances',
    citizensServed: 'Citizens Covered',

    conservationTitle: 'Water Conservation Hub',
    conservationSubtitle: 'Daily citizen practices to preserve our municipal reservoirs',
    dailyTipBadge: 'Daily Sustainability Tip',
    pledgeButton: 'I Practice This!',
    pledgedBadge: 'Pledge Recorded!',
    waterSavedEst: 'Potential Saving',

    whatsappPreviewTitle: 'WhatsApp & SMS Dispatched Alert',
    whatsappNotice: 'Simulated WhatsApp notification directly to citizen phone',
    sendWhatsApp: 'Open in WhatsApp',
    otpWarning: 'Share this OTP ONLY with municipal driver upon physical tanker arrival.',

    meterReaderTitle: 'Self-Service Water Meter Reading',
    meterReaderSubtitle: 'Snap your meter dial for instant transparent bill estimation and billing audit',
    meterUploadPhoto: 'Upload / Snap Meter Photo',
    calculateBill: 'Calculate Tariff Estimate',
    estimatedBill: 'Estimated Water Bill',
  },
  mr: {
    brandName: 'जलसेवा',
    brandSub: 'मिरा भाईंदर महानगरपालिका',
    slogan: 'प्रत्येक थेंब मोलाचा आहे • मि.भा.म.न.पा. जल वितरण',
    sloganMarathi: 'प्रत्येक थेंब मोलाचा आहे',
    sloganHindi: 'हर बूंद मायने रखती है',

    navHome: 'मुख्य पृष्ठ',
    navSchedule: 'वेळापत्रक व खंडित पाणी',
    navBookTanker: 'टँकर नोंदणी',
    navCHSBulk: 'गृहनिर्माण संस्था बल्क टँकर',
    navReportGrievance: 'तक्रार नोंदवा',
    navTrackStatus: 'थेट स्थिती ट्रॅक करा',
    navMeterReading: 'मीटर स्वयं-वाचन व बिल अंदाज',
    navWardDirectory: 'प्रभाग कार्यालय संपर्क',
    navServices: 'नागरी सेवा',
    navStaffPortals: 'कर्मचारी कक्ष',
    navDriverPortal: 'चालक पोर्टल',
    navAdminDesk: 'प्रशासकीय कक्ष',

    viewDetails: 'तपशील पहा',
    bookNow: 'टँकर बुक करा',
    trackNow: 'थेट ट्रॅक करा',
    submit: 'अर्ज सादर करा',
    cancel: 'रद्द करा',
    print: 'पावती प्रिंट करा',
    close: 'बंद करा',
    copy: 'प्रत करा',
    copied: 'प्रत केली!',
    download: 'पीडीएफ डाउनलोड',

    signIn: 'साइन इन',
    signUp: 'नोंदणी करा',
    signInOrSignUp: 'साइन इन / नोंदणी',
    signOut: 'साइन आउट',
    myProfile: 'माझे प्रोफाईल',
    citizenAccount: 'नागरिक खाते',

    helplineTitle: '२४x७ पाणी हेल्पलाइन',
    emergency24x7: 'आपत्कालीन नियंत्रण कक्ष',
    civicGuarantee: 'नागरी सनद हमी',
    verifiedGov: 'अधिकृत महापालिका पोर्टल',

    coreModulesTitle: 'नागरी मुख्य सेवा',
    coreModulesSub: 'महापालिका पाणी सेवा फक्त ३ क्लिकमध्ये उपलब्ध',
    transparencyMetrics: 'पारदर्शकता आकडेवारी',
    distributionStats: 'आजचे मि.भा.म.न.पा. जल वितरण आकडेवारी',
    suppliedToday: 'आज पुरवलेले पाणी',
    purityTested: 'क्लोरीनेशन दर्जा (शुद्धता)',
    activeGrievances: 'सक्रिय तक्रारी',
    citizensServed: 'पाणीपुरवठा लाभार्थी नागरिक',

    conservationTitle: 'जल संवर्धन केंद्र',
    conservationSubtitle: 'महानगरपालिका जलाशय जतन करण्यासाठी दैनंदिन पाणी बचत टिप्स',
    dailyTipBadge: 'दैनंदिन पाणी बचत उपाय',
    pledgeButton: 'मी हा नियम पाळतो!',
    pledgedBadge: 'संकल्प नोंदवला!',
    waterSavedEst: 'अंदाजे बचत',

    whatsappPreviewTitle: 'व्हॉट्सअ‍ॅप व एसएमएस संदेश पूर्वदृश्य',
    whatsappNotice: 'नागरिकांच्या मोबाईलवर पाठवलेला अधिकृत ओटीपी संदेश',
    sendWhatsApp: 'व्हॉट्सअ‍ॅपवर उघडा',
    otpWarning: 'हा ओटीपी फक्त टँकर आल्यावर पालिकेच्या चालकालाच द्या.',

    meterReaderTitle: 'पाणी मीटर स्वयं-वाचन व बिल अंदाज',
    meterReaderSubtitle: 'मीटरचा फोटो काढून पालिकेच्या अधिकृत दरांनुसार त्वरित बिल अंदाज मिळवा',
    meterUploadPhoto: 'मीटर फोटो अपलोड करा',
    calculateBill: 'बिल अंदाज काढा',
    estimatedBill: 'अंदाजित पाणी बिल',
  },
  hi: {
    brandName: 'जलसेवा',
    brandSub: 'मीरा भायंदर महानगरपालिका',
    slogan: 'हर बूंद मायने रखती है • एमबीएमसी जल वितरण',
    sloganMarathi: 'प्रत्येक थेंब मोलाचा आहे',
    sloganHindi: 'हर बूंद मायने रखती है',

    navHome: 'पोर्टल होम',
    navSchedule: 'समय सारणी व कटौती',
    navBookTanker: 'टैंकर बुकिंग',
    navCHSBulk: 'सोसायटी बल्क बुकिंग',
    navReportGrievance: 'शिकायत दर्ज करें',
    navTrackStatus: 'लाइव ट्रैकिंग',
    navMeterReading: 'मीटर स्वयं-वाचन व बिल अनुमान',
    navWardDirectory: 'वार्ड कार्यालय निर्देशिका',
    navServices: 'नागरिक सेवाएं',
    navStaffPortals: 'स्टाफ डेस्क',
    navDriverPortal: 'चालक पोर्टल',
    navAdminDesk: 'प्रशासन डेस्क',

    viewDetails: 'विवरण देखें',
    bookNow: 'टैंकर बुक करें',
    trackNow: 'लाइव ट्रैक करें',
    submit: 'आवेदन जमा करें',
    cancel: 'रद्द करें',
    print: 'रसीद प्रिंट करें',
    close: 'बंद करें',
    copy: 'कॉपी करें',
    copied: 'कॉपी हो गया!',
    download: 'पीडीएफ डाउनलोड',

    signIn: 'साइन इन',
    signUp: 'साइन अप',
    signInOrSignUp: 'साइन इन / रजिस्टर',
    signOut: 'साइन आउट',
    myProfile: 'मेरी प्रोफाइल',
    citizenAccount: 'नागरिक खाता',

    helplineTitle: '24x7 जल हेल्पलाइन',
    emergency24x7: 'आपातकालीन नियंत्रण कक्ष',
    civicGuarantee: 'नागरिक अधिकार पत्र गारंटी',
    verifiedGov: 'आधिकारिक एमबीएमसी पोर्टल',

    coreModulesTitle: 'नागरिक मुख्य सेवाएं',
    coreModulesSub: 'नगर निगम की जल सेवाएं 3 क्लिक में उपलब्ध',
    transparencyMetrics: 'पारदर्शिता मेट्रिक्स',
    distributionStats: 'आज का एमबीएमसी जल वितरण विवरण',
    suppliedToday: 'आज की कुल जलापूर्ति',
    purityTested: 'क्लोरीनेशन शुद्धता मानक',
    activeGrievances: 'सक्रिय शिकायतें',
    citizensServed: 'लाभार्थी नागरिक संख्या',

    conservationTitle: 'जल संरक्षण केंद्र',
    conservationSubtitle: 'नगर निगम जलाशयों को सुरक्षित रखने हेतु दैनिक जल बचत उपाय',
    dailyTipBadge: 'दैनिक जल संरक्षण टिप',
    pledgeButton: 'मैं यह संकल्प लेता हूँ!',
    pledgedBadge: 'संकल्प दर्ज हुआ!',
    waterSavedEst: 'संभावित बचत',

    whatsappPreviewTitle: 'व्हाट्सएप एवं एसएमएस अलर्ट पूर्वावलोकन',
    whatsappNotice: 'नागरिकों के मोबाइल पर भेजा गया आधिकारिक ओटीपी संदेश',
    sendWhatsApp: 'व्हाट्सएप पर खोलें',
    otpWarning: 'यह ओटीपी टैंकर आने पर केवल नगर निगम चालक को ही दें।',

    meterReaderTitle: 'जल मीटर स्वयं-रीडिंग एवं बिल अनुमान',
    meterReaderSubtitle: 'मीटर की फोटो अपलोड कर तत्काल पारदर्शी बिल अनुमान प्राप्त करें',
    meterUploadPhoto: 'मीटर फोटो अपलोड करें',
    calculateBill: 'बिल अनुमान गणना करें',
    estimatedBill: 'अनुमानित जल बिल',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('jalseva_user_lang');
    if (saved === 'mr' || saved === 'hi' || saved === 'en') {
      return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('jalseva_user_lang', lang);
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
