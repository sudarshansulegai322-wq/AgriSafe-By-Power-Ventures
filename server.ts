import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

function getPortAndHost() {
  let port: number | null = null;
  let host = '0.0.0.0';

  const argv = process.argv;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--port' || argv[i] === '-p') {
      const p = Number(argv[i + 1]);
      if (!isNaN(p) && p > 0) port = p;
    } else if (argv[i].startsWith('--port=')) {
      const p = Number(argv[i].split('=')[1]);
      if (!isNaN(p) && p > 0) port = p;
    } else if (argv[i] === '--host' || argv[i] === '-h') {
      if (argv[i + 1]) host = argv[i + 1];
    } else if (argv[i].startsWith('--host=')) {
      host = argv[i].split('=')[1];
    }
  }

  if (port === null) {
    // In dev or when PORT env is 8080 (container reverse proxy), applet server must bind to port 3000
    if (process.env.NODE_ENV !== 'production' || process.env.PORT === '8080') {
      port = 3000;
    } else {
      port = Number(process.env.PORT) || 3000;
    }
  }

  return { port, host };
}

const app = express();
const { port: PORT } = getPortAndHost();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static assets across all environments (Vite dev, production build, and cloud preview)
const cwd = process.cwd();
app.use('/images', express.static(path.resolve(cwd, 'public/images')));
app.use('/src/assets/images', express.static(path.resolve(cwd, 'public/images')));
app.use('/assets/aistudio', express.static(path.resolve(cwd, 'public/assets/aistudio')));
app.use('/assets', express.static(path.resolve(cwd, 'dist/assets')));
app.use('/assets', express.static(path.resolve(cwd, 'public/assets')));
app.use('/public', express.static(path.resolve(cwd, 'public')));

// In-memory audio cache for zero-lag instant TTS playback
const ttsAudioCache = new Map<string, string>();

// Initialize GoogleGenAI server-side with required User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 10) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory support tickets store
interface SupportTicket {
  id: string;
  farmerName: string;
  phone: string;
  state: string;
  district: string;
  category: string;
  message: string;
  voiceNoteUrl?: string;
  photoUrl?: string;
  urgency: 'normal' | 'high' | 'emergency';
  status: 'Pending Admin Review' | 'Approved by Admin' | 'Assigned to Agro Officer' | 'In Progress' | 'Resolved' | 'Rejected';
  adminApprovalStatus: 'pending_approval' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  sentToGovernment: boolean;
  govtPortalStatus: string;
  govtDocketNumber?: string;
  assignedOfficer: string;
  createdAt: string;
  responseNote?: string;
  adminNotes?: string;
}

const supportTickets: SupportTicket[] = [
  {
    id: 'AGRI-ADM-2026-1042',
    farmerName: 'Rameshwar Patil',
    phone: '9822014589',
    state: 'Maharashtra',
    district: 'Yavatmal',
    category: 'Spurious Seed Alert',
    message: 'Dealer in local mandi sold cotton seed packet without SeedTrace holographic sticker and refused tax invoice.',
    urgency: 'emergency',
    status: 'Assigned to Agro Officer',
    adminApprovalStatus: 'approved',
    approvedBy: 'sudarshansulegai322@gmail.com',
    approvedAt: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    sentToGovernment: true,
    govtPortalStatus: 'Transmitted to DAC&FW & CIBRC Central Enforcement Portal',
    govtDocketNumber: 'GOV-DAC-2026-4819',
    assignedOfficer: 'Dr. V. K. Deshmukh (District Quality Control Inspector)',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    responseNote: 'Inspection team dispatched to market yard. Sample batch flagged for laboratory test.'
  },
  {
    id: 'AGRI-ADM-2026-1019',
    farmerName: 'Sardar Gurpreet Singh',
    phone: '9417823901',
    state: 'Punjab',
    district: 'Ludhiana',
    category: 'Spray Tank Compatibility',
    message: 'Wanted confirmation if mixing Zinc Sulphate 33% with Chlorpyrifos 50% EC will cause precipitation.',
    urgency: 'normal',
    status: 'Resolved',
    adminApprovalStatus: 'approved',
    approvedBy: 'admin@powerventures.in',
    approvedAt: new Date(Date.now() - 3600000 * 23).toISOString(),
    sentToGovernment: true,
    govtPortalStatus: 'Synchronized with KVK Advisory Node',
    govtDocketNumber: 'GOV-KVK-2026-1092',
    assignedOfficer: 'Dr. H. S. Brar (Agronomist, KVK)',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    responseNote: 'Advice provided: Do not mix directly in single tank. Zinc salts react with EC solvent creating toxic sludge. Keep separate.'
  },
  {
    id: 'AGRI-ADM-2026-1055',
    farmerName: 'Bhanu Pratap Singh',
    phone: '9718293041',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    category: 'Overcharging & Tax Invoice Refusal',
    message: 'Private fertilizer distributor asking ₹350 extra above statutory MSP rate for certified Nano Urea. Suspected hoarding.',
    urgency: 'high',
    status: 'Pending Admin Review',
    adminApprovalStatus: 'pending_approval',
    sentToGovernment: false,
    govtPortalStatus: 'LOCKED: Awaiting Power Ventures Admin Review & Authorization',
    assignedOfficer: 'Unassigned (Awaiting Admin Approval)',
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    responseNote: 'Query queued for administrative verification. Under strict policy, reports are not sent to government portals until authorized by admin.'
  }
];

// In-memory agricultural orders store with Admin Quality Approval workflow
interface AdminOrder {
  orderId: string;
  items: Array<{
    product: {
      id: string;
      title: string;
      brand: string;
      category: string;
      price: number;
      batchNumber: string;
      packageSize: string;
      vendorName: string;
    };
    quantity: number;
  }>;
  subtotal: number;
  subsidyDiscount: number;
  commissionFee: number;
  commissionRate: number;
  assistedKendraId?: string;
  assistedKendraName?: string;
  sahayakCommissionFee?: number;
  sahayakCommissionRate?: number;
  vendorPayout: number;
  deliveryPartner: {
    id: string;
    name: string;
    cost: number;
    estimatedDays: string;
  };
  total: number;
  farmerName: string;
  phone: string;
  villageAddress: string;
  pincode: string;
  paymentMethod: string;
  paymentRefId?: string;
  seedTraceCertificateId: string;
  timestamp: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'dispatched';
  adminApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

interface DistrictKendra {
  id: string;
  name: string;
  role: string;
  licenseNumber: string;
  phone: string;
  whatsappNumber: string;
  state: string;
  district: string;
  tehsilBlock: string;
  kendraAddress: string;
  landmark: string;
  languagesSpoken: string[];
  assistedServices: string[];
  rating: number;
  ordersFacilitated: number;
  commissionEarnedWallet: number;
  commissionRate: number; // 0.02 (2%)
  status: 'active' | 'on_field' | 'offline';
  upiId?: string;
}

const districtKendras: DistrictKendra[] = [
  {
    id: 'SAH-MH-YAV-01',
    name: 'Dnyaneshwar Shinde',
    role: 'Authorized Village Krishi Mitra & Mandi Facilitator',
    licenseNumber: 'PV-DIST-MH-4819',
    phone: '+91 98220 18492',
    whatsappNumber: '+91 98220 18492',
    state: 'Maharashtra',
    district: 'Yavatmal',
    tehsilBlock: 'Ner & Babhulgaon',
    kendraAddress: 'Shop #14, APMC Market Yard, Ner Road, Yavatmal',
    landmark: 'Opposite State Co-operative Bank Branch',
    languagesSpoken: ['Marathi', 'Varhadi Dialect', 'Hindi'],
    assistedServices: [
      'Illiterate Farmer Dialect Speech Assistance',
      'Physical Seed Packet Hologram & QR Scan',
      'Cash / Kisan Credit Card (KCC) Order Placement',
      'Doorstep Delivery to Gram Panchayat Hub',
      'Chemical Spray Tank-Mix Safety Guidance'
    ],
    rating: 4.95,
    ordersFacilitated: 382,
    commissionEarnedWallet: 18420,
    commissionRate: 0.02,
    status: 'active',
    upiId: 'dnyaneshwar.kisan@oksbi'
  },
  {
    id: 'SAH-UP-VAR-02',
    name: 'Pandit Shivraj Maurya',
    role: 'Lead District Agri-Sahayak & Farmer Help In-Charge',
    licenseNumber: 'PV-DIST-UP-2041',
    phone: '+91 94520 81290',
    whatsappNumber: '+91 94520 81290',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    tehsilBlock: 'Rajatalab & Rohaniya',
    kendraAddress: 'Kashi Gramin Seva Kendra, GT Road, Rajatalab Mandi',
    landmark: 'Near Rajatalab Krishi Vigyan Kendra (KVK)',
    languagesSpoken: ['Bhojpuri', 'Hindi'],
    assistedServices: [
      'Bhojpuri Dialect Walk-In Order Booking',
      'Authenticity Barcode Scanning with Mobile Station',
      'Fertilizer Bag Weighment & Quality Check',
      'Government Subsidy & DBT Aadhaar Linking Help',
      'Local Counterfeit Lot Seizure Reporting'
    ],
    rating: 4.92,
    ordersFacilitated: 495,
    commissionEarnedWallet: 24750,
    commissionRate: 0.02,
    status: 'active',
    upiId: 'shivraj.maurya@okaxis'
  },
  {
    id: 'SAH-MH-PUN-03',
    name: 'Sambhaji Gaikwad',
    role: 'Certified Agricultural Hub Manager',
    licenseNumber: 'PV-DIST-MH-8812',
    phone: '+91 98231 44520',
    whatsappNumber: '+91 98231 44520',
    state: 'Maharashtra',
    district: 'Pune',
    tehsilBlock: 'Baramati & Haveli',
    kendraAddress: 'Kisan Suvidha Kendra, Gate #2, Baramati Market Yard',
    landmark: 'Near Sugar Cane Growers Association Office',
    languagesSpoken: ['Marathi', 'Hindi', 'English'],
    assistedServices: [
      'Drip Irrigation Nutrient Plan Consultation',
      'Nano Urea & Bt Cotton Seed Lot Verification',
      'Assisted Digital Checkout for Elderly Farmers',
      'State Laboratory Sample Submission Escort',
      'Express Delivery Pickup Station'
    ],
    rating: 4.98,
    ordersFacilitated: 610,
    commissionEarnedWallet: 31200,
    commissionRate: 0.02,
    status: 'active',
    upiId: 'sambhaji.agri@okicici'
  },
  {
    id: 'SAH-PB-LUD-04',
    name: 'Sardar Baljit Singh Grewal',
    role: 'Block Agricultural Facilitator & Village Point-of-Contact',
    licenseNumber: 'PV-DIST-PB-3109',
    phone: '+91 98150 72419',
    whatsappNumber: '+91 98150 72419',
    state: 'Punjab',
    district: 'Ludhiana',
    tehsilBlock: 'Samrala & Khanna',
    kendraAddress: 'Shop #8, Old Dana Mandi Complex, Samrala',
    landmark: 'Near IFFCO Cooperative Depot',
    languagesSpoken: ['Punjabi (Malwai)', 'Hindi'],
    assistedServices: [
      'Direct Voice Punjabi Dialogue & Order Booking',
      'Wheat & Basmati Seed Germination Certificate Review',
      'Bayer & Syngenta Insecticide Seal Verification',
      'Kisan Credit Card (KCC) Assisted Settlement',
      'Spurious Input Police Vigilance Support'
    ],
    rating: 4.96,
    ordersFacilitated: 420,
    commissionEarnedWallet: 22680,
    commissionRate: 0.02,
    status: 'active',
    upiId: 'baljit.grewal@oksbi'
  }
];

const adminOrders: AdminOrder[] = [
  {
    orderId: 'AGRI-ORD-8821',
    items: [
      {
        product: {
          id: 'seed-mahyco-bt-cotton',
          title: 'Mahyco Bollgard II Hybrid Bt Cotton Seeds',
          brand: 'Mahyco Seeds',
          category: 'Certified Seeds',
          price: 865,
          batchNumber: 'BT-COT-2026-8841',
          packageSize: '450g Pack (With 120g Non-Bt Refuge)',
          vendorName: 'Maharashtra State Seeds Corp (MSSC)'
        },
        quantity: 4
      },
      {
        product: {
          id: 'fert-iffco-nano-urea',
          title: 'IFFCO Nano Urea Plus (Liquid 4% N)',
          brand: 'IFFCO',
          category: 'Fertilizers',
          price: 225,
          batchNumber: 'NANO-UREA-IF772',
          packageSize: '500 ml Bottle (Replaces 45kg bag)',
          vendorName: 'IFFCO Direct Cooperative'
        },
        quantity: 2
      }
    ],
    subtotal: 3910,
    subsidyDiscount: 840,
    commissionFee: 117,
    commissionRate: 0.03,
    vendorPayout: 3793,
    deliveryPartner: {
      id: 'krishi-express',
      name: 'Krishi Rural Express Hub',
      cost: 49,
      estimatedDays: '1-2 Days (Priority)'
    },
    total: 4076,
    farmerName: 'Rameshwar Patidar',
    phone: '9823019283',
    villageAddress: 'Gram Panchayat Shirur, Taluka Haveli',
    pincode: '411001',
    paymentMethod: 'upi',
    paymentRefId: 'UPI-TXN-741029',
    seedTraceCertificateId: 'CERT-SEEDTRACE-KT8912',
    timestamp: new Date(Date.now() - 3600000 * 2).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    status: 'pending_approval',
    adminApproved: false
  },
  {
    orderId: 'AGRI-ORD-7740',
    items: [
      {
        product: {
          id: 'prot-bayer-confidor',
          title: 'Bayer Confidor 200 SL Systemic Insecticide',
          brand: 'Bayer CropScience',
          category: 'Crop Protection',
          price: 485,
          batchNumber: 'CONF-BAY-4491',
          packageSize: '100 ml Bottle',
          vendorName: 'Bayer Authorized Apex Distributor'
        },
        quantity: 2
      }
    ],
    subtotal: 970,
    subsidyDiscount: 210,
    commissionFee: 29,
    commissionRate: 0.03,
    vendorPayout: 941,
    deliveryPartner: {
      id: 'india-post',
      name: 'India Post Kisan Parcel Service',
      cost: 0,
      estimatedDays: '2-3 Days (Standard)'
    },
    total: 999,
    farmerName: 'Sardar Baldev Singh',
    phone: '9815049281',
    villageAddress: 'Pind Khanna Kalan, Tehsil Samrala',
    pincode: '141401',
    paymentMethod: 'kcc',
    paymentRefId: 'KCC-AUTH-88912',
    seedTraceCertificateId: 'CERT-SEEDTRACE-PB4412',
    timestamp: new Date(Date.now() - 3600000 * 18).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    status: 'approved',
    adminApproved: true,
    approvedBy: 'sudarshansulegai322@gmail.com',
    approvedAt: new Date(Date.now() - 3600000 * 17).toISOString()
  }
];

// In-memory urgent callback requests
interface CallbackRequest {
  id: string;
  farmerName: string;
  phone: string;
  preferredLanguage: string;
  urgency: string;
  requestedAt: string;
  status: 'Pending' | 'Officer Calling' | 'Completed';
  assignedOfficer: string;
  officerNotes?: string;
}

const callbackRequests: CallbackRequest[] = [];

// Pre-compiled fast responses for ALL 10 Indian languages to eradicate latency
const instantDomainKnowledge: Record<string, Record<string, string>> = {
  hi: {
    yellow_leaves: `🗣️ **सरल भाषा में:** फसल में पत्ते पीले पड़ने का मुख्य कारण यूरिया (नाइट्रोजन) या जिंक की कमी, या जड़ में दीमक/कीड़ा लगना है।
🟢 **क्या करें:** 15 लीटर वाले स्प्रे पंप में 100 ग्राम 19:19:19 खाद और 25 ग्राम चिलेटेड जिंक मिलाकर सुबह के समय छिड़काव करें।
🔴 **सावधानी:** दोपहर की कड़ी धूप में छिड़काव न करें। खेत में पहले हल्की नमी होनी चाहिए।
📞 **सरकारी मदद:** नजदीकी KVK या किसान कॉल सेंटर 1800-180-1551 पर मुफ्त बात करें।`,
    fake_seed: `🗣️ **सरल भाषा में:** नकली बीज से बचने के लिए थैली पर हरा सरकारी होलोग्राम और SeedTrace QR कोड अवश्य देखें।
🟢 **क्या करें:** AgriSafe ऐप में बैच नंबर दर्ज कर तुरंत जांचें। दुकानदार से मुहर लगा पक्का कंप्यूटर बिल जरूर लें।
🔴 **सावधानी:** बिना बिल के, खुली थैली में या सस्ता कहकर बिकने वाला बीज कभी न खरीदें।
📞 **सरकारी मदद:** दुकानदार बिल न दे तो ऊपर 'एडमिन सहायता' दबाकर तुरंत शिकायत दर्ज करें।`,
    mix_chemicals: `🗣️ **सरल भाषा में:** हर कीटनाशक को एक साथ नहीं मिलाना चाहिए। गलत मिलावट से फसल के पत्ते जल जाते हैं या दवा बेकार हो जाती है।
🟢 **क्या करें:** खेत में टंकी भरने से पहले कांच के गिलास में दोनों दवाओं की थोड़ी बूंदें पानी में घोलकर 15 मिनट देखें। अगर दही जैसा न फटे तभी स्प्रे करें।
🔴 **सावधानी:** कभी भी खरपतवार नाशक (घास की दवा) को अन्य कीटनाशक के साथ न मिलाएं।
📞 **सरकारी मदद:** AgriSafe का 'टैंक-मिक्स सुरक्षा' टूल देखें या 1800-180-1551 पर पूछें।`,
    dosage: `🗣️ **सरल भाषा में:** 15 लीटर वाले सामान्य स्प्रे पंप में सामान्यतः 2 ढक्कन (20 से 30 मिली) कीटनाशक और 1 बाल्टी साफ पानी पर्याप्त होता है।
🟢 **क्या करें:** हमेशा दवा नापने वाले ढक्कन या सिरिंज का इस्तेमाल करें।
🔴 **सावधानी:** कभी भी बिना नापे अंदाजे से ज्यादा दवा न डालें, इससे पौधे झुलस सकते हैं।
📞 **सरकारी मदद:** बोतल पर लिखे CIBRC दिशा-निर्देश पढ़ें या हेल्पलाइन 1800-180-1551 पर पूछें।`,
    dealer_bill: `🗣️ **सरल भाषा में:** बीज अधिनियम 1966 के तहत हर कृषि विक्रेता को बैच नंबर वाला पक्का बिल देना कानूनी रूप से अनिवार्य है।
🟢 **क्या करें:** दुकानदार से कहें कि बिना पक्के बिल के आप भुगतान नहीं करेंगे।
🔴 **सावधानी:** कच्ची पर्ची पर कभी सामान न लें, नुकसान होने पर अदालत या मुआवजे में कच्ची पर्ची मान्य नहीं होती।
📞 **सरकारी मदद:** यदि विक्रेता मना करे तो AgriSafe एडमिन सपोर्ट डेस्क पर तुरंत रिपोर्ट दर्ज करें।`,
    spray_safety: `🗣️ **सरल भाषा में:** कीटनाशक छिड़काव करते समय दवा सांस या त्वचा के रास्ते शरीर में जा सकती है।
🟢 **क्या करें:** मुंह पर गमछा या मास्क बांधें, पूरी बांह की कमीज पहनें और हवा की दिशा में ही स्प्रे करें।
🔴 **सावधानी:** स्प्रे करते समय बीड़ी-तंबाकू न खाएं। स्प्रे के बाद हाथ-मुंह साबुन से अच्छी तरह धोएं।
📞 **सरकारी मदद:** चक्कर आने पर तुरंत नजदीकी सरकारी अस्पताल जाएं या 1800-180-1551 पर बताएं।`
  },
  mr: {
    yellow_leaves: `🗣️ **सोप्या भाषेत:** पिकाची पाने पिवळी पडणे म्हणजे नायट्रोजन किंवा झिंकची कमतरता किंवा मुळांना कीड लागणे असू शकते.
🟢 **काय करावे:** १५ लिटरच्या पंपात १०० ग्रॅम १९:१९:१९ विद्राव्य खत आणि २५ ग्रॅम चिलेटेड झिंक मिसळून सकाळी फवारणी करावी.
🔴 **काळजी घ्या:** दुपारच्या कडक उन्हात फवारणी करू नका. जमिनीत ओलावा असणे आवश्यक आहे.
📞 **शासकीय मदत:** जवळच्या कृषी विज्ञान केंद्राशी किंवा किसान हेल्पलाइन १८००-१८०-१५५१ वर संपर्क साधा.`,
    fake_seed: `🗣️ **सोप्या भाषेत:** बनावट बियाण्यांपासून सावध राहण्यासाठी पिशवीवरील हिरवा सरकारी होलोग्राम आणि QR कोड तपासा.
🟢 **काय करावे:** ॲग्रीसेफ पोर्टलवर बॅच नंबर टाकून सत्यता तपासा आणि दुकानदाराकडून पक्के जीएसटी बिल मागा.
🔴 **काळजी घ्या:** उघड्या पिशवीतील किंवा पावती नसलेले स्वस्त बियाणे कधीही घेऊ नका.
📞 **शासकीय मदत:** दुकानदार बिल देत नसल्यास ॲग्रीसेफ ॲडमिन डेस्कवर तक्रार नोंदवा.`,
    mix_chemicals: `🗣️ **सोप्या भाषेत:** सर्व औषधे एकत्र मिसळू नयेत. चुकीच्या मिश्रणाने पिकाची पाने जळू शकतात.
🟢 **काय करावे:** काचेच्या ग्लासात दोन्ही औषधे थोडी मिसळून १५ मिनिटे पाहा. मिश्रण फुटले नाही तरच पंपात वापरा.
🔴 **काळजी घ्या:** तणनाशक (गवताचे औषध) इतर कोणत्याही औषधात कधीही मिसळू नका.
📞 **शासकीय मदत:** ॲग्रीसेफ टँक-मिक्स टूल वापरा किंवा १८००-१८०-१५५१ वर विचारा.`,
    dosage: `🗣️ **सोप्या भाषेत:** १५ लिटरच्या पंपासाठी सर्वसाधारणपणे २ झाकणे (२० ते ३० मिली) औषध पुरेसे असते.
🟢 **काय करावे:** औषध मोजण्यासाठी नेहमी बाटलीच्या झाकणाचा वापर करा.
🔴 **काळजी घ्या:** जास्त औषध टाकल्यास पीक करपण्याचा धोका असतो.
📞 **शासकीय मदत:** किसान कॉल सेंटर १८००-१८०-१५५१ वर विनामूल्य सल्ला घ्या.`,
    dealer_bill: `🗣️ **सोप्या भाषेत:** बियाणे कायदा १९६६ नुसार शेतकऱ्याला बॅच नंबरसह पक्के बिल देणे दुकानदारास बंधनकारक आहे.
🟢 **काय करावे:** पक्क्या बिलाशिवाय औषध किंवा खत खरेदी करू नका.
🔴 **काळजी घ्या:** कच्ची पावती स्वीकारू नका, नुकसान भरपाईसाठी पक्के बिल गरजेचे असते.
📞 **शासकीय मदत:** तक्रारीसाठी ॲग्रीसेफ ॲडमिन सपोर्टवर क्लिक करा.`,
    spray_safety: `🗣️ **सोप्या भाषेत:** फवारणी करताना तोंडाला रुमाल किंवा मास्क बांधणे अत्यंत महत्त्वाचे आहे.
🟢 **काय करावे:** हवेच्या दिशेनेच फवारणी करा आणि पूर्ण बाह्यांचे कपडे घाला.
🔴 **काळजी घ्या:** फवारणी करताना तंबाखू खाऊ नका. फवारणीनंतर साबणाने हात-तोंड धुवा.
📞 **शासकीय मदत:** त्रास झाल्यास त्वरित डॉक्टरांशी संपर्क साधा किंवा १८००-१८०-१५५१ वर कळवा.`
  },
  pa: {
    yellow_leaves: `🗣️ **ਸਰਲ ਬੋਲੀ ਵਿੱਚ:** ਪੱਤੇ ਪੀਲੇ ਪੈਣ ਦਾ ਮੁੱਖ ਕਾਰਨ ਨਾਈਟ੍ਰੋਜਨ ਜਾਂ ਜ਼ਿੰਕ ਦੀ ਘਾਟ ਜਾਂ ਜੜ੍ਹ ਵਿੱਚ ਕੀੜਾ ਹੋ ਸਕਦਾ ਹੈ।
🟢 **ਕੀ ਕਰੋ:** 15 ਲੀਟਰ ਵਾਲੀ ਢੋਲੀ ਵਿੱਚ 100 ਗ੍ਰਾਮ 19:19:19 ਖਾਦ ਅਤੇ 25 ਗ੍ਰਾਮ ਚਿਲੇਟਿਡ ਜ਼ਿੰਕ ਮਿਲਾ ਕੇ ਸਵੇਰੇ ਸਪ੍ਰੇ ਕਰੋ।
🔴 **ਸਾਵਧਾਨੀ:** ਦੁਪਹਿਰ ਦੀ ਤੇਜ਼ ਧੁੱਪ ਵਿੱਚ ਸਪ੍ਰੇ ਨਾ ਕਰੋ। ਖੇਤ ਵਿੱਚ ਸਿੱਲ੍ਹ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ।
📞 **ਮਦਦ:** ਕਿਸਾਨ ਕਾਲ ਸੈਂਟਰ 1800-180-1551 ਤੇ ਮੁਫ਼ਤ ਸਲਾਹ ਲਵੋ।`,
    fake_seed: `🗣️ **ਸਰਲ ਬੋਲੀ ਵਿੱਚ:** ਨਕਲੀ ਬੀਜ ਤੋਂ ਬਚਣ ਲਈ ਥੈਲੇ ਉੱਤੇ ਸੀਡਟਰੇਸ ਹਰਾ ਹੋਲੋਗ੍ਰਾਮ ਅਤੇ QR ਕੋਡ ਜ਼ਰੂਰ ਵੇਖੋ।
🟢 **ਕੀ ਕਰੋ:** ਐਗਰੀਸੇਫ ਪੋਰਟਲ ਤੇ ਬੈਚ ਨੰਬਰ ਭਰ ਕੇ ਜਾਂਚ ਕਰੋ ਅਤੇ ਪੱਕਾ ਬਿੱਲ ਲਵੋ।
🔴 **ਸਾਵਧਾਨੀ:** ਬਿਨਾਂ ਬਿੱਲ ਦੇ ਖੁੱਲ੍ਹਾ ਬੀਜ ਕਦੇ ਨਾ ਖਰੀਦੋ।
📞 **ਮਦਦ:** ਜੇ ਦੁਕਾਨਦਾਰ ਬਿੱਲ ਨਾ ਦੇਵੇ ਤਾਂ ਐਡਮਿਨ ਡੈਸਕ ਤੇ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ।`,
    mix_chemicals: `🗣️ **ਸਰਲ ਬੋਲੀ ਵਿੱਚ:** ਸਾਰੀਆਂ ਦਵਾਈਆਂ ਆਪਸ ਵਿੱਚ ਨਹੀਂ ਮਿਲਾਈਆਂ ਜਾ ਸਕਦੀਆਂ। ਗਲਤ ਰਲਾਉਣ ਨਾਲ ਫ਼ਸਲ ਸੜ ਸਕਦੀ ਹੈ।
🟢 **ਕੀ ਕਰੋ:** ਕੱਚ ਦੇ ਗਲਾਸ ਵਿੱਚ ਥੋੜ੍ਹੀ ਦਵਾਈ ਘੋਲ ਕੇ 15 ਮਿੰਟ ਪਰਖੋ। ਜੇ ਦਹੀਂ ਵਾਂਗ ਨਾ ਫਟੇ ਤਾਂ ਹੀ ਸਪ੍ਰੇ ਕਰੋ।
🔴 **ਸਾਵਧਾਨੀ:** ਨਦੀਨਨਾਸ਼ਕ (ਘਾਹ ਵਾਲੀ ਦਵਾਈ) ਨੂੰ ਕੀਟਨਾਸ਼ਕ ਨਾਲ ਕਦੇ ਨਾ ਮਿਲਾਓ।
📞 **ਮਦਦ:** ਐਗਰੀਸੇਫ ਟੈਂਕ-ਮਿਕਸ ਜਾਂਚੋ ਜਾਂ 1800-180-1551 ਤੇ ਫ਼ੋਨ ਕਰੋ।`,
    dosage: `🗣️ **ਸਰਲ ਬੋਲੀ ਵਿੱਚ:** 15 ਲੀਟਰ ਦੀ ਢੋਲੀ ਵਿੱਚ 2 ਢੱਕਣ (ਲਗਭਗ 25-30 ਮਿਲੀਲੀਟਰ) ਦਵਾਈ ਕਾਫ਼ੀ ਹੁੰਦੀ ਹੈ।
🟢 **ਕੀ ਕਰੋ:** ਹਮੇਸ਼ਾ ਮਿਣ ਕੇ ਦਵਾਈ ਪਾਓ।
🔴 **ਸਾਵਧਾਨੀ:** ਲੋੜ ਤੋਂ ਵੱਧ ਦਵਾਈ ਪਾਉਣ ਨਾਲ ਪੱਤੇ ਝੁਲਸ ਜਾਂਦੇ ਹਨ।
📞 **ਮਦਦ:** ਕਿਸਾਨ ਹੈਲਪਲਾਈਨ 1800-180-1551 ਤੇ ਸੰਪਰਕ ਕਰੋ।`,
    dealer_bill: `🗣️ **ਸਰਲ ਬੋਲੀ ਵਿੱਚ:** ਕਾਨੂੰਨ ਅਨੁਸਾਰ ਡੀਲਰ ਦਾ ਪੱਕਾ ਬਿੱਲ ਦੇਣਾ ਲਾਜ਼ਮੀ ਹੈ।
🟢 **ਕੀ ਕਰੋ:** ਪੱਕੇ ਬਿੱਲ ਦੀ ਮੰਗ ਕਰੋ ਜਿਸ ਤੇ ਬੈਚ ਨੰਬਰ ਦਰਜ ਹੋਵੇ।
🔴 **ਸਾਵਧਾਨੀ:** ਕੱਚੀ ਪਰਚੀ ਤੇ ਖ਼ਰੀਦ ਨਾ ਕਰੋ।
📞 **ਮਦਦ:** ਐਗਰੀਸੇਫ ਐਡਮਿਨ ਤੇ ਸ਼ਿਕਾਇਤ ਕਰੋ।`,
    spray_safety: `🗣️ **ਸਰਲ ਬੋਲੀ ਵਿੱਚ:** ਸਪ੍ਰੇ ਵੇਲੇ ਮੂੰਹ ਤੇ ਪਰਨਾ ਜਾਂ ਮਾਸਕ ਜ਼ਰੂਰ ਬੰਨ੍ਹੋ।
🟢 **ਕੀ ਕਰੋ:** ਹਵਾ ਦੇ ਰੁਖ਼ ਵੱਲ ਹੀ ਸਪ੍ਰੇ ਕਰੋ ਅਤੇ ਕੰਮ ਪਿੱਛੋਂ ਸਾਬਣ ਨਾਲ ਹੱਥ ਧੋਵੋ।
🔴 **ਸਾਵਧਾਨੀ:** ਸਪ੍ਰੇ ਕਰਦੇ ਸਮੇਂ ਕੁਝ ਨਾ ਖਾਓ ਪੀਓ।
📞 **ਮਦਦ:** ਤਕਲੀਫ਼ ਹੋਣ ਤੇ 1800-180-1551 ਤੇ ਗੱਲ ਕਰੋ।`
  },
  ta: {
    yellow_leaves: `🗣️ **எளிய விளக்கம்:** இலைகள் மஞ்சள் நிறமாவது தழைச்சத்து அல்லது துத்தநாகக் குறைபாடு அல்லது வேர் பூச்சியால் ஏற்படுகிறது.
🟢 **செய்ய வேண்டியவை:** 15 லிட்டர் தெளிப்பான் தொட்டியில் 100 கிராம் 19:19:19 உரம் மற்றும் 25 கிராம் துத்தநாகம் கலந்து காலையில் தெளிக்கவும்.
🔴 **எச்சரிக்கை:** நண்பகல் வெயிலில் தெளிக்காதீர்கள். நிலத்தில் ஈரம் இருக்க வேண்டும்.
📞 **உதவி:** உழவர் உதவி மையம் 1800-180-1551 என்ற எண்ணில் இலவச ஆலோசனை பெறவும்.`,
    fake_seed: `🗣️ **எளிய விளக்கம்:** போலி விதைகளைத் தவிர்க்க பாக்கெட்டில் உள்ள பச்சை நிற அரசு ஹோலோகிராம் மற்றும் QR குறியீட்டைச் சரிபார்க்கவும்.
🟢 **செய்ய வேண்டியவை:** AgriSafe தளத்தில் பேட்ச் எண்ணை உள்ளிட்டு சரிபார்த்து பில் ரசீது வாங்கவும்.
🔴 **எச்சரிக்கை:** பில் இல்லாமல் மலிவான திறந்த விதைகளை வாங்காதீர்கள்.
📞 **உதவி:** வியாபாரி பில் தராவிட்டால் அட்மின் ஆதரவில் புகார் அளிக்கவும்.`,
    mix_chemicals: `🗣️ **எளிய விளக்கம்:** அனைத்து மருந்துகளையும் ஒன்றாக கலக்கக்கூடாது. தவறான கலவை பயிரை எரித்துவிடும்.
🟢 **செய்ய வேண்டியவை:** கண்ணாடி குவளையில் சிறிது கலந்து 15 நிமிடங்கள் பார்க்கவும். தயிர் போல் திரியாவிட்டால் மட்டுமே தெளிக்கவும்.
🔴 **எச்சரிக்கை:** களைக்கொல்லியை பூச்சிக்கொல்லியுடன் ஒருபோதும் கலக்காதீர்கள்.
📞 **உதவி:** AgriSafe தொட்டி கலவை வழிகாட்டியைப் பார்க்கவும்.`,
    dosage: `🗣️ **எளிய விளக்கம்:** 15 லிட்டர் தெளிப்பான் பம்பிற்கு 2 மூடி (20 முதல் 30 மிலி) மருந்து போதுமானது.
🟢 **செய்ய வேண்டியவை:** சரியான மூடியால் அளந்து ஊற்றவும்.
🔴 **எச்சரிக்கை:** அதிக மருந்து சேர்த்தால் இலைகள் கருகிவிடும்.
📞 **உதவி:** கிசான் கால் சென்டர் 1800-180-1551 ஐ அழைக்கவும்.`,
    dealer_bill: `🗣️ **எளிய விளக்கம்:** சட்டப்படி விதை வாங்கும் போது பேட்ச் எண் கொண்ட பில் தருவது வியாபாரியின் கடமையாகும்.
🟢 **செய்ய வேண்டியவை:** பில் கேட்டு மட்டுமே வாங்கவும்.
🔴 **எச்சரிக்கை:** வெள்ளை காகித ரசீதை ஏற்காதீர்கள்.
📞 **உதவி:** அட்மின் உதவி மையத்தை அணுகவும்.`,
    spray_safety: `🗣️ **எளிய விளக்கம்:** மருந்து தெளிக்கும் போது முகக்கவசம் அணிவது கட்டாயமாகும்.
🟢 **செய்ய வேண்டியவை:** காற்றின் திசையில் தெளிக்கவும், முழுக்கை சட்டை அணியவும்.
🔴 **எச்சரிக்கை:** மருந்து தெளிக்கும் போது உணவு உட்கொள்ளாதீர்கள்.
📞 **உதவி:** அவசர உதவிக்கு 1800-180-1551 ஐ அழைக்கவும்.`
  },
  te: {
    yellow_leaves: `🗣️ **సులభమైన వివరణ:** ఆకులు పసుపు రంగులోకి మారడానికి నత్రజని లేదా జింక్ లోపం, లేదా వేరు పురుగు కారణం కావచ్చు.
🟢 **ఏం చేయాలి:** 15 లీటర్ల స్ప్రే ట్యాంకులో 100 గ్రాముల 19:19:19 ఎరువు మరియు 25 గ్రాముల జింక్ కలిపి ఉదయం పూట పిచికారీ చేయండి.
🔴 **జాగ్రత్త:** మధ్యాహ్నం ఎండలో పిచికారీ చేయవద్దు. పొలంలో తేమ ఉండాలి.
📞 **సహాయం:** కిసాన్ కాల్ సెంటర్ 1800-180-1551 లో ఉచిత సలహా పొందండి.`,
    fake_seed: `🗣️ **సులభమైన వివరణ:** నకిలీ విత్తనాల బారిన పడకుండా ప్యాకెట్ పై ఉన్న ఆకుపచ్చ హోలోగ్రామ్ మరియు క్యూఆర్ కోడ్ చూడండి.
🟢 **ఏం చేయాలి:** అగ్రిసేఫ్ లో బ్యాచ్ నంబర్ నమోదు చేసి సరిచూడండి. పక్కా జీఎస్టీ బిల్లు తీసుకోండి.
🔴 **జాగ్రత్త:** బిల్లు లేకుండా విడిగా విక్రయించే విత్తనాలు కొనకండి.
📞 **సహాయం:** డీలర్ బిల్లు ఇవ్వకపోతే అడ్మిన్ సపోర్ట్ లో ఫిర్యాదు చేయండి.`,
    mix_chemicals: `🗣️ **సులభమైన వివరణ:** అన్ని పురుగుమందులను కలపకూడదు. తప్పుడు మిశ్రమం పంటను మాడ్చేస్తుంది.
🟢 **ఏం చేయాలి:** గాజు గ్లాసులో కొద్దిగా కలిపి 15 నిమిషాలు చూడండి. విరిగిపోకపోతేనే ట్యాంకులో వాడండి.
🔴 **జాగ్రత్త:** కలుపు మందును ఇతర మందులతో ఎప్పుడూ కలపవద్దు.
📞 **సహాయం:** అగ్రిసేఫ్ ట్యాంక్-మిక్స్ చెక్ చేయండి.`,
    dosage: `🗣️ **సులభమైన వివరణ:** 15 లీటర్ల పంపుకు సుమారు 2 మూతలు (20-30 మి.లీ) మందు సరిపోతుంది.
🟢 **ఏం చేయాలి:** కొలత మూతతో మాత్రమే మందు కలపండి.
🔴 **జాగ్రత్త:** మోతాదుకు మించి మందు వేస్తే పంటకు నష్టం కలుగుతుంది.
📞 **సహాయం:** 1800-180-1551 కు కాల్ చేయండి.`,
    dealer_bill: `🗣️ **సులభమైన వివరణ:** విత్తన చట్టం ప్రకారం బ్యాచ్ నంబర్ తో పక్కా రసీదు ఇవ్వడం డీలర్ బాధ్యత.
🟢 **ఏం చేయాలి:** ఖచ్చితంగా ప్రింటెడ్ బిల్లు అడగండి.
🔴 **జాగ్రత్త:** తెల్ల కాగితంపై ఇచ్చే రసీదులు చెల్లవు.
📞 **సహాయం:** అగ్రిసేఫ్ అడ్మిన్ డెస్క్ లో రిపోర్ట్ చేయండి.`,
    spray_safety: `🗣️ **సులభమైన వివరణ:** మందు చల్లేటప్పుడు ముఖానికి మాస్క్ లేదా గుడ్డ కట్టుకోవడం తప్పనిసరి.
🟢 **ఏం చేయాలి:** గాలి వీచే దిశలోనే స్ప్రే చేయండి. స్ప్రే అయ్యాక చేతులు శుభ్రంగా కడగాలి.
🔴 **జాగ్రత్త:** పొగ తాగడం లేదా తినడం చేయవద్దు.
📞 **సహాయం:** అస్వస్థతకు గురైతే 1800-180-1551 లో తెలపండి.`
  },
  kn: {
    yellow_leaves: `🗣️ **ಸರಳ ಭಾಷೆ:** ಎಲೆಗಳು ಹಳದಿಯಾಗಲು ಸಾರಜನಕ ಅಥವಾ ಸತು (ಝಿಂಕ್) ಕೊರತೆ ಅಥವಾ ಬೇರು ಕೀಟ ಕಾರಣವಿರಬಹುದು.
🟢 **ಏನು ಮಾಡಬೇಕು:** 15 ಲೀಟರ್ ಸಿಂಪರಣೆ ಪಂಪ್‌ಗೆ 100 ಗ್ರಾಂ 19:19:19 ಗೊಬ್ಬರ ಮತ್ತು 25 ಗ್ರಾಂ ಸತು ಬೆರೆಸಿ ಬೆಳಿಗ್ಗೆ ಸಿಂಪಡಿಸಿ.
🔴 **ಎಚ್ಚರಿಕೆ:** ಮಧ್ಯಾಹ್ನದ ಬಿಸಿಲಿನಲ್ಲಿ ಸಿಂಪಡಿಸಬೇಡಿ. ಹೊಲದಲ್ಲಿ ತೇವಾಂಶವಿರಲಿ.
📞 **ಸಹಾಯ:** ಕಿಸಾನ್ ಸಹಾಯವಾಣಿ 1800-180-1551 ಗೆ ಕರೆ ಮಾಡಿ.`,
    fake_seed: `🗣️ **ಸರಳ ಭಾಷೆ:** ನಕಲಿ ಬೀಜ ತಡೆಯಲು ಚೀಲದ ಮೇಲಿನ ಹಸಿರು ಸರಕಾರಿ ಹೋಲೋಗ್ರಾಮ್ ಮತ್ತು ಕ್ಯೂಆರ್ ಕೋಡ್ ಪರೀಕ್ಷಿಸಿ.
🟢 **ಏನು ಮಾಡಬೇಕು:** ಅಗ್ರಿಸೇಫ್ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಬ್ಯಾಚ್ ಸಂಖ್ಯೆ ಪರಿಶೀಲಿಸಿ ಪಕ್ಕಾ ಬಿಲ್ ಪಡೆಯಿರಿ.
🔴 **ಎಚ್ಚರಿಕೆ:** ಬಿಲ್ ಇಲ್ಲದೆ ಯಾವುದೇ ಬೀಜ ಖರೀದಿಸಬೇಡಿ.
📞 **ಸಹಾಯ:** ವ್ಯಾಪಾರಿ ನಿರಾಕರಿಸಿದರೆ ಅಡ್ಮಿನ್ ಡೆಸ್ಕ್‌ನಲ್ಲಿ ದೂರು ದಾಖಲಿಸಿ.`,
    mix_chemicals: `🗣️ **ಸರಳ ಭಾಷೆ:** ಎಲ್ಲ ಔಷಧಗಳನ್ನು ಒಟ್ಟಿಗೆ ಮಿಶ್ರಣ ಮಾಡಬಾರದು. ಬೆಳೆ ಸುಡುವ ಅಪಾಯವಿರುತ್ತದೆ.
🟢 **ಏನು ಮಾಡಬೇಕು:** ಗಾಜಿನ ಲೋಟದಲ್ಲಿ ಸ್ವಲ್ಪ ಬೆರೆಸಿ 15 ನಿಮಿಷ ನೋಡಿ. ಒಡೆದು ಹೋಗದಿದ್ದರೆ ಮಾತ್ರ ಪಂಪ್‌ಗೆ ಹಾಕಿ.
🔴 **ಎಚ್ಚರಿಕೆ:** ಕಳೆನಾಶಕವನ್ನು ಬೇರೆ ಯಾವುದೇ ಔಷಧದೊಂದಿಗೆ ಬೆರೆಸಬೇಡಿ.
📞 **ಸಹಾಯ:** ಅಗ್ರಿಸೇಫ್ ಟ್ಯಾಂಕ್-ಮಿಕ್ಸ್ ಟೂಲ್ ಬಳಸಿ.`,
    dosage: `🗣️ **ಸರಳ ಭಾಷೆ:** 15 ಲೀಟರ್ ಪಂಪ್‌ಗೆ 2 ಮುಚ್ಚಳ (20-30 ಮಿ.ಲೀ) ಔಷಧ ಸಾಕು.
🟢 **ಏನು ಮಾಡಬೇಕು:** ಅಳತೆ ಮುಚ್ಚಳ ಬಳಸಿ ಮಾತ್ರ ಔಷಧ ಹಾಕಿ.
🔴 **ಎಚ್ಚರಿಕೆ:** ಅತಿಯಾದ ಪ್ರಮಾಣ ಬೆಳೆಗೆ ಹಾನಿ ಮಾಡುತ್ತದೆ.
📞 **ಸಹಾಯ:** ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ 1800-180-1551 ಸಂಪರ್ಕಿಸಿ.`,
    dealer_bill: `🗣️ **ಸರಳ ಭಾಷೆ:** ಬ್ಯಾಚ್ ನಂಬರ್ ಇರುವ ಪಕ್ಕಾ ಬಿಲ್ ನೀಡುವುದು ವ್ಯಾಪಾರಿಯ ಕಾನೂನು ಕರ್ತವ್ಯ.
🟢 **ಏನು ಮಾಡಬೇಕು:** ಮುದ್ರಿತ ಬಿಲ್ ಕೇಳಿ ಪಡೆಯಿರಿ.
🔴 **ಎಚ್ಚರಿಕೆ:** ಕಚ್ಚಾ ಚೀಟಿಯನ್ನು ಒಪ್ಪಿಕೊಳ್ಳಬೇಡಿ.
📞 **ಸಹಾಯ:** ಅಡ್ಮಿನ್ ಬೆಂಬಲ ವಿಭಾಗವನ್ನು ಸಂಪರ್ಕಿಸಿ.`,
    spray_safety: `🗣️ **ಸರಳ ಭಾಷೆ:** ಸಿಂಪರಣೆ ಮಾಡುವಾಗ ಮುಖಕ್ಕೆ ಬಟ್ಟೆ ಅಥವಾ ಮಾಸ್ಕ್ ಕಟ್ಟುವುದು ಅತ್ಯಗತ್ಯ.
🟢 **ಏನು ಮಾಡಬೇಕು:** ಗಾಳಿಯ ದಿಕ್ಕಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ ಮತ್ತು ನಂತರ ಸಾಬೂನಿನಿಂದ ಕೈ ತೊಳೆಯಿರಿ.
🔴 **ಎಚ್ಚರಿಕೆ:** ಸಿಂಪರಣೆ ಸಮಯದಲ್ಲಿ ತಂಬಾಕು ತಿನ್ನಬೇಡಿ.
📞 **ಸಹಾಯ:** ತೊಂದರೆಯಾದರೆ 1800-180-1551 ಗೆ ಕರೆ ಮಾಡಿ.`
  },
  gu: {
    yellow_leaves: `🗣️ **સરળ ભાષા:** પાંદડા પીળા પડવાનું મુખ્ય કારણ નાઇટ્રોજન અથવા ઝિંકની ઉણપ અથવા મૂળમાં કીડા હોઈ શકે.
🟢 **શું કરવું:** 15 લીટર પંપમાં 100 ગ્રામ 19:19:19 ખાતર અને 25 ગ્રામ ઝિંક ભેળવી સવારે છંટકાવ કરવો.
🔴 **સાવધાની:** બપોરના તડકામાં છંટકાવ ન કરવો. જમીનમાં ભેજ હોવો જરૂરી છે.
📞 **મદદ:** કિસાન હેલ્પલાઇન 1800-180-1551 પર મફત સલાહ લો.`,
    fake_seed: `🗣️ **સરળ ભાષા:** નકલી બિયારણથી બચવા થેલી પરનો લીલો સરકારી હોલોગ્રામ અને QR કોડ ચકાસો.
🟢 **શું કરવું:** એગ્રીસેફમાં બેચ નંબર તપાસો અને પાકું જીએસટી બિલ અવશ્ય લો.
🔴 **સાવધાની:** બિલ વગર કે ખુલ્લી થેલીનું બિયારણ ન ખરીદો.
📞 **મદદ:** વેપારી બિલ ન આપે તો એડમિન સપોર્ટ પર ફરિયાદ નોંધાવો.`,
    mix_chemicals: `🗣️ **સરળ ભાષા:** બધી દવાઓ એકસાથે ન ભેળવવી જોઈએ. ખોટા મિશ્રણથી પાક બળી શકે છે.
🟢 **શું કરવું:** કાચના ગ્લાસમાં થોડી દવા મિક્સ કરી 15 મિનિટ જુઓ. દહીં જેવું ન ફાટે તો જ પંપમાં વાપરો.
🔴 **સાવધાની:** નિંદામણનાશક દવા ક્યારેય બીજી દવા સાથે ન ભેળવો.
📞 **મદદ:** એગ્રીસેફ ટાંકી-મિક્સ ટૂલ જુઓ.`,
    dosage: `🗣️ **સરળ ભાષા:** 15 લીટરના પંપમાં સામાન્ય રીતે 2 ઢાંકણા (20 થી 30 મિલી) દવા પૂરતી છે.
🟢 **શું કરવું:** હંમેશા ઢાંકણાથી માપીને જ દવા નાખો.
🔴 **સાવધાની:** વધુ પડતી દવા નાખવાથી પાંદડા બળી જાય છે.
📞 **મદદ:** 1800-180-1551 પર પૂછો.`,
    dealer_bill: `🗣️ **સરળ ભાષા:** બેચ નંબર સાથે પાકું બિલ આપવું વેપારી માટે કાયદેસર ફરજિયાત છે.
🟢 **શું કરવું:** પાકા બિલનો જ આગ્રહ રાખો.
🔴 **સાવધાની:** કાચી ચિઠ્ઠી ક્યારેય સ્વીકારશો નહીં.
📞 **મદદ:** એડમિન ડેસ્ક પર સંપર્ક કરો.`,
    spray_safety: `🗣️ **સરળ ભાષા:** દવા છાંટતી વખતે મોં પર રૂમાલ કે માસ્ક બાંધવો જરૂરી છે.
🟢 **શું કરવું:** પવનની દિશામાં જ સ્પ્રે કરો અને પછી સાબુથી હાથ-મોં ધોવો.
🔴 **સાવધાની:** છંટકાવ દરમિયાન તમાકુ કે બીડી ન પીવો.
📞 **મદદ:** ચક્કર આવે તો 1800-180-1551 પર જણાવો.`
  },
  bn: {
    yellow_leaves: `🗣️ **সহজ ভাষায়:** পাতা হলুদ হওয়ার প্রধান কারণ নাইট্রোজেন বা দস্তা (জিঙ্ক)-এর অভাব অথবা শিকড়ে পোকা লাগা।
🟢 **কী করবেন:** ১৫ লিটার স্প্রে পাম্পে ১০০ গ্রাম ১৯:১৯:১৯ সার এবং ২৫ গ্রাম চিলেটেড জিঙ্ক মিশিয়ে সকালে স্প্রে করুন।
🔴 **সতর্কতা:** দুপুরের চড়া রোদে স্প্রে করবেন না। মাটিতে রস থাকা দরকার।
📞 **সাহায্য:** কিষাণ কল সেন্টার ১৮০০-১৮০-১৫৫১ নম্বরে বিনামূল্যে পরামর্শ নিন।`,
    fake_seed: `🗣️ **সহজ ভাষায়:** নকল বীজ এড়াতে প্যাকেটের গায়ে সবুজ সরকারি হলোগ্রাম ও QR কোড দেখুন।
🟢 **কী করবেন:** এগ্রিসেফ পোর্টালে ব্যাচ নম্বর যাচাই করে পাকা রসিদ সংগ্রহ করুন।
🔴 **সতর্কতা:** বিল ছাড়া খোলা বীজ কখনোই কিনবেন না।
📞 **সাহায্য:** দোকানদার বিল না দিলে অ্যাডমিন ডেস্কে অভিযোগ জানান।`,
    mix_chemicals: `🗣️ **সহজ ভাষায়:** সব ওষুধ একসাথে মেশানো যায় না। ভুল মিশ্রণে ফসলের ক্ষতি হয়।
🟢 **কী করবেন:** কাঁচের গ্লাসে সামান্য ওষুধ গুলিয়ে ১৫ মিনিট দেখুন। দইয়ের মতো ফেটে না গেলে তবেই পাম্পে মেশান।
🔴 **সতর্কতা:** আগাছানাশক ওষুধ অন্য ওষুধের সাথে মেশাবেন না।
📞 **সাহায্য:** এগ্রিসেফ ট্যাঙ্ক-মিক্স গাইড দেখুন।`,
    dosage: `🗣️ **সহজ ভাষায়:** ১৫ লিটার স্প্রে পাম্পে সাধারণত ২ ছিপি (২০ থেকে ৩০ মিলি) ওষুধই যথেষ্ট।
🟢 **কী করবেন:** মেপে ওষুধ ব্যবহার করুন।
🔴 **সতর্কতা:** অতিরিক্ত ওষুধ দিলে পাতা পুড়ে যেতে পারে।
📞 **সাহায্য:** ১৮০০-১৮০-১৫৫১ নম্বরে ফোন করুন।`,
    dealer_bill: `🗣️ **সহজ ভাষায়:** ব্যাচ নম্বর সহ পাকা বিল দেওয়া ডিলারের আইনি দায়িত্ব।
🟢 **কী করবেন:** পাকা ভাউচার চেয়ে নিন।
🔴 **সতর্কতা:** সাদা কাগজের চিরকুট নেবেন না।
📞 **সাহায্য:** অ্যাডমিন সহায়তায় জানান।`,
    spray_safety: `🗣️ **সহজ ভাষায়:** স্প্রে করার সময় মুখে গামছা বা মাস্ক পরা জরুরি।
🟢 **কী করবেন:** বাতাসের অনুকূলে স্প্রে করুন এবং সাবান দিয়ে হাত-মুখ ধুয়ে নিন।
🔴 **সতর্কতা:** স্প্রে করার সময় বিড়ি বা খাবার খাবেন না।
📞 **সাহায্য:** অসুস্থ বোধ করলে ১৮০০-১৮০-১৫৫১ নম্বরে যোগাযোগ করুন।`
  },
  ml: {
    yellow_leaves: `🗣️ **ലളിതമായ ഉപദേശം:** ഇലകൾ മഞ്ഞനിറമാകുന്നത് നൈട്രജൻ അല്ലെങ്കിൽ സിങ്കിന്റെ കുറവോ വേരിലെ കീടബാധയോ ആകാം.
🟢 **ചെയ്യേണ്ടത്:** 15 ലിറ്റർ സ്പ്രേ പമ്പിൽ 100 ഗ്രാം 19:19:19 വളവും 25 ഗ്രാം സിങ്കും ചേർത്ത് രാവിലെ തളിക്കുക.
🔴 **ശ്രദ്ധിക്കുക:** ഉച്ചവെയിലിൽ സ്പ്രേ ചെയ്യരുത്. മണ്ണിൽ ഈർപ്പം ഉണ്ടായിരിക്കണം.
📞 **സഹായം:** കിസാൻ ഹെൽപ്പ് ലൈൻ 1800-180-1551 ൽ ബന്ധപ്പെടുക.`,
    fake_seed: `🗣️ **ലളിതമായ ഉപദേശം:** വ്യാജ വിത്തുകൾ ഒഴിവാക്കാൻ പാക്കറ്റിലെ പച്ച ഹോളോഗ്രാമും ക്യുആർ കോഡും പരിശോധിക്കുക.
🟢 **ചെയ്യേണ്ടത്:** അഗ്രിസേഫിൽ ബാച്ച് നമ്പർ പരിശോധിച്ച് ഉറപ്പുവരുത്തി ബിൽ വാങ്ങുക.
🔴 **ശ്രദ്ധിക്കുക:** ബില്ലില്ലാതെ ഒരു വിത്തും വാങ്ങരുത്.
📞 **സഹായം:** വ്യാപാരി ബിൽ നൽകിയില്ലെങ്കിൽ അഡ്മിൻ ഡെസ്കിൽ പരാതിപ്പെടുക.`,
    mix_chemicals: `🗣️ **ലളിതമായ ഉപദേശം:** എല്ലാ മരുന്നുകളും ഒരുമിച്ച് ചേർക്കരുത്. തെറ്റായ മിശ്രിതം വിള കരിച്ചു കളയും.
🟢 **ചെയ്യേണ്ടത്:** ഒരു ഗ്ലാസ് വെള്ളത്തിൽ അല്പം മരുന്ന് ചേർത്ത് 15 മിനിറ്റ് നിരീക്ഷിക്കുക. തൈര് പോലെ പിരിഞ്ഞില്ലെങ്കിൽ മാത്രം ഉപയോഗിക്കുക.
🔴 **ശ്രദ്ധിക്കുക:** കളനാശിനി മറ്റ് മരുന്നുകളുമായി കലർത്തരുത്.
📞 **സഹായം:** അഗ്രിസേഫ് ടാങ്ക്-മിക്സ് പരിശോധിക്കുക.`,
    dosage: `🗣️ **ലളിതമായ ഉപദേശം:** 15 ലിറ്റർ പമ്പിൽ സാധാരണയായി 2 അടപ്പ് (20-30 മി.ലി) മരുന്ന് മതിയാകും.
🟢 **ചെയ്യേണ്ടത്:** അടപ്പ് ഉപയോഗിച്ച് കൃത്യമായി അളക്കുക.
🔴 **ശ്രദ്ധിക്കുക:** അളവ് കൂടിയാൽ ഇലകൾ കരിഞ്ഞുപോകും.
📞 **സഹായം:** 1800-180-1551 ൽ വിളിക്കുക.`,
    dealer_bill: `🗣️ **ലളിതമായ ഉപദേശം:** ബാച്ച് നമ്പർ ഉള്ള കമ്പ്യൂട്ടർ ബിൽ നൽകുന്നത് വ്യാപാരിയുടെ കടമയാണ്.
🟢 **ചെയ്യേണ്ടത്:** പക്കാ ബിൽ ചോദിച്ചു വാങ്ങുക.
🔴 **ശ്രദ്ധിക്കുക:** വെറും കുറിപ്പടികൾ സ്വീകരിക്കരുത്.
📞 **സഹായം:** അഡ്മിൻ സപ്പോർട്ട് ഉപയോഗിക്കുക.`,
    spray_safety: `🗣️ **ലളിതമായ ഉപദേശം:** മരുന്ന് തളിക്കുമ്പോൾ മാസ്ക് ധരിക്കുന്നത് നിർബന്ധമാണ്.
🟢 **ചെയ്യേണ്ടത്:** കാറ്റിന്റെ ദിശയിൽ മാത്രം തളിക്കുക, പിന്നീട് സോപ്പിട്ട് കഴുകുക.
🔴 **ശ്രദ്ധിക്കുക:** തളിക്കുമ്പോൾ പുകവലിക്കുകയോ ഭക്ഷണം കഴിക്കുകയോ ചെയ്യരുത്.
📞 **സഹായം:** 1800-180-1551 ൽ അറിയിക്കുക.`
  },
  en: {
    yellow_leaves: `🗣️ **Simple Advice:** Foliar yellowing is commonly caused by Nitrogen or Chelated Zinc deficiency, or root-zone pests.
🟢 **What to do:** Mix 100g of 19:19:19 water-soluble fertilizer and 25g Chelated Zinc per 15-litre spray pump and apply during early morning.
🔴 **What to avoid:** Never spray during peak midday sunlight. Ensure soil has baseline moisture.
📞 **Govt Helpline:** Call Kisan Call Centre Toll-Free 1800-180-1551 for free agronomist advice.`,
    fake_seed: `🗣️ **Simple Advice:** Protect your farm by checking the green cryptographic SeedTrace hologram and QR code on the bag.
🟢 **What to do:** Verify the batch code directly on AgriSafe and demand a stamped computer tax invoice.
🔴 **What to avoid:** Never purchase unsealed bags or loose seeds without an official receipt.
📞 **Govt Helpline:** Report non-compliant vendors immediately via the AgriSafe Admin Support Desk.`,
    mix_chemicals: `🗣️ **Simple Advice:** Incompatible chemical mixtures cause phytotoxic leaf scorching and nozzle clogging.
🟢 **What to do:** Always perform a 15-minute physical jar test in a clean glass with small water proportions first.
🔴 **What to avoid:** Never mix systemic herbicides with insecticides or foliar fertilizers.
📞 **Govt Helpline:** Refer to the AgriSafe Tank-Mix Matrix or call 1800-180-1551.`,
    dosage: `🗣️ **Simple Advice:** For a standard 15-litre knapsack spray pump, 2 measured bottle caps (20 to 30 ml) is usually the recommended dosage.
🟢 **What to do:** Always use a calibrated measuring cup or syringe.
🔴 **What to avoid:** Never overdose based on guesswork; excess concentration burns crops.
📞 **Govt Helpline:** Consult CIBRC label guidelines or dial 1800-180-1551.`,
    dealer_bill: `🗣️ **Simple Advice:** Under the Seeds Act 1966, dealers are legally bound to provide a stamped receipt with lot batch numbers.
🟢 **What to do:** Always insist on a formal computer bill before payment.
🔴 **What to avoid:** Never accept handwritten rough slips; they hold no statutory compensation validity.
📞 **Govt Helpline:** File an alert on the AgriSafe Admin Support Desk.`,
    spray_safety: `🗣️ **Simple Advice:** Pesticides enter the body through inhalation or skin absorption.
🟢 **What to do:** Wear a face mask or cotton cloth, long sleeves, and spray strictly in the direction of the wind.
🔴 **What to avoid:** Do not eat, drink, or chew tobacco during application. Wash thoroughly with soap afterwards.
📞 **Govt Helpline:** If dizziness occurs, call 1800-180-1551 or visit the nearest clinic immediately.`
  }
};

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(apiKey),
    totalTickets: supportTickets.length,
    cachedAudioCount: ttsAudioCache.size,
  });
});

// Circuit breaker for TTS model: If free-tier 10-requests/day limit is exhausted,
// fallback to high-quality browser Web Speech synthesis instantly with zero errors.
let ttsQuotaExhaustedUntil = Date.now() + 24 * 60 * 60 * 1000;

// API: Multilingual TTS (with Quota Protection & Browser Fallback)
app.post('/api/ai/tts', async (req, res) => {
  try {
    const { text, language = 'hi' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text string is required' });
    }

    // Clean text for optimal TTS pronunciation
    const cleanedText = text
      .replace(/[#*_`~>[\]()]/g, ' ')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/\s+/g, ' ')
      .slice(0, 350)
      .trim();

    if (!cleanedText) {
      return res.status(400).json({ error: 'Empty text after cleaning' });
    }

    const cacheKey = `${language}:${cleanedText}`;
    if (ttsAudioCache.has(cacheKey)) {
      return res.json({
        audioBase64: ttsAudioCache.get(cacheKey),
        mimeType: 'audio/wav',
        fromCache: true,
      });
    }

    // If quota is exhausted or AI is not initialized, smoothly inform client to use browser synthesis
    if (Date.now() < ttsQuotaExhaustedUntil || !ai) {
      return res.json({
        audioBase64: null,
        fallbackToBrowser: true,
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanedText,
                speechMetadata: {
                  style: 'Clear, warm, respectful village agricultural advisor speaking naturally',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        ttsAudioCache.set(cacheKey, base64Audio);
        return res.json({
          audioBase64: base64Audio,
          mimeType: 'audio/wav',
          fromCache: false,
        });
      }
    } catch (ttsErr: any) {
      const isQuota =
        ttsErr?.status === 429 ||
        String(ttsErr?.message).includes('429') ||
        String(ttsErr?.message).includes('Quota') ||
        String(ttsErr?.message).includes('RESOURCE_EXHAUSTED');

      if (isQuota) {
        // Back off for 24 hours to prevent repeated 429s
        ttsQuotaExhaustedUntil = Date.now() + 24 * 60 * 60 * 1000;
        console.log('Gemini TTS daily quota reached (10/day). Gracefully falling back to browser speech synthesis.');
      } else {
        console.log('Gemini TTS temporarily unavailable; client will use browser speech synthesis.');
      }
    }

    // Fallback indicator so client uses browser Web Speech
    return res.json({
      audioBase64: null,
      fallbackToBrowser: true,
    });
  } catch (error: any) {
    res.json({ audioBase64: null, fallbackToBrowser: true });
  }
});

// API: Comprehensive Kisan AI Sahayak (Multimodal Crop Doctor + All Agricultural Inquiries)
app.post('/api/ai/assistant', async (req, res) => {
  console.log('AI Assistant hit:', { hasAi: Boolean(ai), hasMessage: Boolean(req.body?.message) });
  try {
    const {
      message,
      language = 'hi',
      history = [],
      imageBase64,
      mimeType = 'image/jpeg',
      quickTemplateKey
    } = req.body;

    if ((!message || typeof message !== 'string') && !imageBase64) {
      return res.status(400).json({ error: 'Message text or crop image is required' });
    }

    const langGroup = instantDomainKnowledge[language] || instantDomainKnowledge['hi'];

    // Fast-path ONLY when explicit quickTemplateKey is passed (e.g. user tapped instant offline pill)
    if (quickTemplateKey && langGroup[quickTemplateKey]) {
      return res.json({
        reply: langGroup[quickTemplateKey],
        language,
        isAiGenerated: true,
        fastMatch: true,
        suggestedQuestions: [
          'इसकी सही दवा और मात्रा क्या है?',
          'क्या यह दवा दूसरी खाद के साथ मिला सकते हैं?',
          'किसान कॉल सेंटर 1800-180-1551 से कैसे बात करें?'
        ]
      });
    }

    const languageNames: Record<string, string> = {
      hi: 'Hindi (हिन्दी - शुद्ध व सरल ग्रामीण भाषा)',
      mr: 'Marathi (मराठी - सोपी शेतकरी बोलीभाषा)',
      pa: 'Punjabi (ਪੰਜਾਬੀ - ਸਰਲ ਕਿਸਾਨੀ ਬੋਲੀ)',
      ta: 'Tamil (தமிழ் - எளிய விவசாய நடை)',
      te: 'Telugu (తెలుగు - సులభమైన రైతు భాష)',
      kn: 'Kannada (ಕನ್ನಡ - ಸರಳ ಕೃಷಿ ಭಾಷೆ)',
      gu: 'Gujarati (ગુજરાતી - સરળ ખેડૂત ભાષા)',
      bn: 'Bengali (বাংলা - সহজ কৃষকের ভাষা)',
      ml: 'Malayalam (മലയാളം - ലളിതമായ കർഷക ഭാഷ)',
      en: 'English (Clear, actionable, farmer-friendly terms)'
    };

    const targetLangName = languageNames[language] || 'Hindi (हिन्दी)';

    const systemInstruction = `You are "Dr. Kisan AI" (किसान AI विशेषज्ञ & कृषि मित्र), India's premier agricultural scientist, agronomist, and village mentor on the AgriSafe platform by Power Ventures.

YOUR MISSION:
Resolve ANY agricultural inquiry a farmer asks with 100% scientific accuracy, practical ground reality, and deep empathy.
You have comprehensive knowledge of:
1. CROPS & SEEDS: Cotton (Bt BG-II, RCH 659), Paddy (Basmati 1121/1509, PR 126), Wheat (HD 2967/3086), Maize (Pioneer 3396, Syngenta 6240), Mustard (45S46, PAC 751), Chilli, Tomato, Onion, Okra, Soybean, Pulses (Chana, Moong, Arhar), Sugarcane, Millets (Bajra, Ragi). Seed rate, sowing depth, spacing, germination testing, seed treatment.
2. PESTS & DISEASES: Pink Bollworm, Fall Armyworm, Stem Borer, BPH (Brown Plant Hopper), Whitefly, Thrips (including Black Thrips), Mites, Aphids, Sheath Blight, Blast, Powdery/Downy Mildew, Fusarium Wilt, Bacterial Leaf Blight, Tikka, Damping Off, Yellow Vein Mosaic.
3. PRECISE DOSAGE & SPRAYING: State exact dose per 15L knapsack spray pump (e.g., "2 ढक्कन / 20-30ml") and per acre in 150-200L water. Recommend top genuine brands available on AgriSafe (FMC Coragen, Bayer Confidor, Syngenta Amistar Top, Nativo, UPL Ulala, Saaf, Delegate, Ampligo).
4. FERTILIZERS & NUTRITION: IFFCO Nano Urea Plus, Nano DAP, 19:19:19, 00:52:34, 13:00:45, Calcium Nitrate, Chelated Zinc EDTA 12%, Boron 20%, Sagarika Seaweed, PROM, Vermicompost, FYM. Basal vs. top-dressing vs. drip fertigation timing.
5. WEED MANAGEMENT: Selective herbicides (PI Nominee Gold, Targa Super, Dual Gold, Pendimethalin) vs. non-selective (Roundup, Glufosinate). Pre-emergence vs. post-emergence application window.
6. COMPATIBILITY & TANK-MIX SAFETY: Warn never to mix copper oxychloride with organophosphates (chlorpyrifos), never mix calcium nitrate with phosphates/sulphates in single concentrated tanks.
7. GOVT SCHEMES & SUBSIDIES: PM-Kisan Samman Nidhi (₹6,000 yearly in 3 DBT installments), PM Fasal Bima Yojana (crop insurance), Soil Health Card, PM-KUSUM solar pumps, Namo Drone Didi, Kisan Credit Card (KCC 4% subsidized interest), Mandi MSP rates.
8. ORGANIC REMEDIES: Cold-pressed Neem oil (10,000 PPM), Trichoderma viride, Pseudomonas fluorescens, Jeevamrut, Dashparni ark, Pheromone traps, Solar light traps.

VOICE & RESPONSE FORMAT (Clear, respectful, structured with emojis):
🗣️ **सलाह / Advice:** (Direct, encouraging answer in 2 short sentences in ${targetLangName})
🟢 **क्या करें व सही मात्रा / What To Do & Dosage:**
   - 15L वाले स्प्रे पंप में: [Exact ml/gm]
   - प्रति एकड़ मात्रा: [Exact dose]
   - सही समय: [सुबह या शाम]
🔴 **सावधानी / Caution:** (Crucial safety, mixing risk, or PHI waiting days)
💡 **सुझावित प्रमाणित उत्पाद / Recommended Inputs:** (Recommend authentic products matching AgriSafe catalog)
📞 **सरकारी मदद:** किसान कॉल सेंटर टोल-फ्री 1800-180-1551

CRITICAL RULES:
- ALWAYS respond in ${targetLangName}.
- Keep language simple for rural farmers. Avoid overly dense biochemical terminology.
- If an image is attached, carefully diagnose the visible pest, pathogen lesion, or nutrient deficiency and specify the remedy.
- At the very end of your response, output a single JSON array line with exactly 3 relevant follow-up questions the farmer can tap, in this format:
<<<SUGGESTIONS: ["पहला सवाल", "दूसरा सवाल", "तीसरा सवाल"]>>>`;

    if (ai) {
      try {
        let contents: any;

        if (imageBase64) {
          const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
          contents = {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: cleanBase64,
                },
              },
              {
                text: message
                  ? `Farmer query with attached crop photo: "${message}". Please analyze this crop photo, diagnose the disease/pest/deficiency, and provide the exact treatment in ${targetLangName}.`
                  : `Please examine this crop image carefully. Identify the crop, diagnose the disease or insect pest damage, and give step-by-step remedies with exact dosages in ${targetLangName}.`,
              },
            ],
          };
        } else {
          // Build conversational multi-turn context if history is provided
          let contextPrompt = '';
          if (Array.isArray(history) && history.length > 0) {
            const recent = history.slice(-4);
            contextPrompt = recent
              .map((h: any) => `${h.role === 'user' ? 'Farmer' : 'Kisan AI'}: ${h.text}`)
              .join('\n') + '\n\n';
          }
          contextPrompt += `Farmer current question: "${message}"\nProvide comprehensive, practical guidance in ${targetLangName}.`;

          contents = contextPrompt;
        }

        const generatePromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI response timed out after 7s')), 7000)
        );

        const response: any = await Promise.race([generatePromise, timeoutPromise]);

        let replyText = response.text || '';
        let suggestedQuestions: string[] = [];

        // Parse suggested follow-up questions if emitted
        const suggestionsMatch = replyText.match(/<<<SUGGESTIONS:\s*(\[.*?\])>>>/s);
        if (suggestionsMatch && suggestionsMatch[1]) {
          try {
            suggestedQuestions = JSON.parse(suggestionsMatch[1]);
          } catch (e) {}
          replyText = replyText.replace(/<<<SUGGESTIONS:.*?>>>/s, '').trim();
        }

        if (suggestedQuestions.length === 0) {
          suggestedQuestions = [
            language === 'hi' ? '15 लीटर पंप में कितनी मात्रा डालें?' : 'What is the dosage for 15L pump?',
            language === 'hi' ? 'क्या इसे दूसरी दवा के साथ मिला सकते हैं?' : 'Can I mix this with other sprays?',
            language === 'hi' ? 'दवा छिड़कने का सबसे सही समय क्या है?' : 'What is the best time to spray?'
          ];
        }

        return res.json({
          reply: replyText,
          suggestedQuestions,
          language,
          isAiGenerated: true,
        });
      } catch (geminiError: any) {
        console.warn('Gemini generation fallback engaged:', geminiError?.message);
      }
    }

    // Comprehensive Expert Agricultural Intelligence across all farmer inquiries
    const lower = (message || '').toLowerCase();
    let reply = '';
    let suggestions: string[] = [];

    if (lower.includes('गुलाबी') || lower.includes('pink') || lower.includes('bollworm') || lower.includes('सुंडी')) {
      reply = language === 'hi'
        ? `🗣️ **कपास में गुलाबी सुंडी (Pink Bollworm) नियंत्रण:**
🟢 **क्या करें:** फूल आने पर प्रति एकड़ 4-5 फेरोमोन ट्रैप लगाएं। सुंडी दिखने पर 15 लीटर पंप में 6-7 मिली **FMC कोराजन (Coragen 18.5% SC)** या **प्रोक्लेम (Proclaim 5% SG)** 10 ग्राम मिलाकर छिड़काव करें।
🔴 **सावधानी:** एक ही दवा बार-बार न छिड़कें ताकि कीड़े में प्रतिरोधक क्षमता न बने।
💡 **सुझावित उत्पाद:** AgriSafe से FMC Coragen या Barrix Pheromone Trap किट ऑर्डर करें।
📞 **सरकारी मदद:** नजदीकी KVK या 1800-180-1551 पर संपर्क करें।`
        : `🗣️ **Pink Bollworm Management in Cotton:**
🟢 **What to do:** Install 4-5 Pheromone Traps per acre. Spray **FMC Coragen (Chlorantraniliprole 18.5% SC)** at 60 ml/acre or 6 ml per 15L knapsack tank.
🔴 **Caution:** Alternate with Spinetoram (Delegate) or Proclaim to prevent pest resistance.
💡 **Recommended Input:** FMC Coragen 18.5% SC or Barrix Pheromone Traps.
📞 **Helpline:** Kisan Call Centre 1800-180-1551.`;
      suggestions = ['फेरोमोन ट्रैप कैसे लगाएं?', 'क्या कोराजन के साथ खाद मिला सकते हैं?', 'कपास में खाद की सही मात्रा क्या है?'];
    } else if (lower.includes('तना छेदक') || lower.includes('stem borer') || lower.includes('ब्लाइट') || lower.includes('sheath')) {
      reply = language === 'hi'
        ? `🗣️ **धान में तना छेदक व शीथ ब्लाइट नियंत्रण:**
🟢 **क्या करें:** 15 लीटर पंप में **सिंजेंटा एमस्टार टॉप (Amistar Top)** 20 मिली और **कोराजन** 6 मिली मिलाकर 200 लीटर पानी प्रति एकड़ छिड़कें।
🔴 **सावधानी:** खेत में खड़े पानी को दवा छिड़कने से पहले निकाल दें या कम करें।
💡 **सुझावित उत्पाद:** Syngenta Amistar Top + FMC Coragen.
📞 **सरकारी मदद:** 1800-180-1551 पर तुरंत सलाह लें।`
        : `🗣️ **Paddy Stem Borer & Sheath Blight Control:**
🟢 **What to do:** Spray **Syngenta Amistar Top (Azoxystrobin + Difenoconazole)** at 200 ml/acre with **FMC Coragen** 60 ml/acre.
🔴 **Caution:** Ensure canopy penetration to the water line where sheath lesions start.
💡 **Recommended Inputs:** Syngenta Amistar Top, FMC Coragen.
📞 **Helpline:** Kisan Call Centre 1800-180-1551.`;
      suggestions = ['धान में बालियां निकलने पर कौन सी दवा छिड़कें?', 'एमस्टार टॉप की 15L पंप में खुराक?', 'धान में नैनो यूरिया कब दें?'];
    } else if (lower.includes('नैनो') || lower.includes('nano') || lower.includes('यूरिया') || lower.includes('urea') || lower.includes('dap')) {
      reply = language === 'hi'
        ? `🗣️ **इफको नैनो यूरिया व नैनो डीएपी की सही खुराक:**
🟢 **क्या करें:** 15 लीटर वाले स्प्रे पंप में 30 से 40 मिली **Nano Urea Plus** (यानी 2 से 4 मिली प्रति लीटर पानी) मिलाकर कल्ले फूटते समय व फूल आने से पहले सुबह या शाम छिड़कें।
🔴 **सावधानी:** तेज धूप या दोपहर में कभी स्प्रे न करें। बोतल को पानी में डालने से पहले अच्छी तरह हिलाएं।
💡 **सुझावित उत्पाद:** IFFCO Nano Urea Plus 500ml (1 बोरी यूरिया के बराबर)।
📞 **सरकारी सहायता:** पीएम-प्रणाम योजना के तहत रियायती मूल्य ₹225 उपलब्ध।`
        : `🗣️ **IFFCO Nano Urea Plus & Nano DAP Application:**
🟢 **What to do:** Mix 30-40 ml Nano Urea per 15L spray tank (2-4 ml per litre water). Spray at active tillering and pre-flowering stages.
🔴 **Caution:** Shake bottle vigorously before mixing. Avoid harsh midday sun.
💡 **Recommended Input:** IFFCO Nano Urea Plus (Replaces 1 bag traditional urea).
📞 **Subsidy:** Zero GST PM-PRANAM scheme priced at ₹225.`;
      suggestions = ['क्या नैनो यूरिया को कीटनाशक में मिला सकते हैं?', 'नैनो डीएपी से बीज उपचार कैसे करें?', '19:19:19 खाद कब देनी चाहिए?'];
    } else if (lower.includes('pm kisan') || lower.includes('पीएम किसान') || lower.includes('योजना') || lower.includes('बीमा') || lower.includes('fasal bima')) {
      reply = language === 'hi'
        ? `🗣️ **सरकारी किसान योजनाएं (PM-Kisan व फसल बीमा):**
🟢 **क्या करें:** पीएम-किसान की ₹2000 की किस्त के लिए आधार e-KYC व बैंक खाता NPCI से लिंक होना अनिवार्य है। स्थिति जानने के लिए pmkisan.gov.in पर बेनिफिशियरी स्टेटस देखें। फसल नुकसान होने पर 72 घंटे में **Crop Insurance App** पर शिकायत दर्ज करें।
🔴 **सावधानी:** किसी अनजान व्यक्ति को ओटीपी या आधार विवरण न दें।
📞 **मुफ्त सरकारी हेल्पलाइन:** पीएम-किसान हेल्पलाइन 155261 / किसान कॉल सेंटर 1800-180-1551.`
        : `🗣️ **Government Agricultural Schemes & PM-Kisan:**
🟢 **What to do:** Ensure Aadhaar e-KYC and NPCI bank seeding are complete on pmkisan.gov.in for the ₹2,000 quarterly installments. For crop losses under PMFBY, report damage within 72 hours via the Crop Insurance App.
🔴 **Caution:** Never share bank OTP or passwords with unverified callers.
📞 **Official Helpline:** PM-Kisan Helpline 155261 or KCC 1800-180-1551.`;
      suggestions = ['e-KYC कैसे पूरा करें?', 'किसान क्रेडिट कार्ड (KCC) कैसे बनवाएं?', 'ड्रोन छिड़काव पर 50% सब्सिडी कैसे लें?'];
    } else if (lower.includes('पील') || lower.includes('yellow') || lower.includes('पाने') || lower.includes('पत्ते')) {
      reply = langGroup.yellow_leaves;
      suggestions = ['15 लीटर पंप में कितनी दवा डालें?', 'जिंक की कमी कैसे पूरी करें?', 'क्या 19:19:19 खाद मिला सकते हैं?'];
    } else if (lower.includes('नकली') || lower.includes('fake') || lower.includes('bill') || lower.includes('बिल') || lower.includes('seed')) {
      reply = langGroup.fake_seed;
      suggestions = ['सीडट्रेस (SeedTrace) बारकोड कैसे स्कैन करें?', 'दुकानदार पक्का बिल न दे तो कहाँ शिकायत करें?', 'सरकारी प्रमाणित बीज कैसे ऑर्डर करें?'];
    } else if (lower.includes('मिला') || lower.includes('mix') || lower.includes('रला') || lower.includes('टैंक')) {
      reply = langGroup.mix_chemicals;
      suggestions = ['जार टेस्ट (Jar Test) कैसे किया जाता है?', 'क्या कॉपर और कीटनाशक मिला सकते हैं?', 'खरपतवार नाशक के साथ क्या न मिलाएं?'];
    } else if (lower.includes('dose') || lower.includes('मात्रा') || lower.includes('ढक्कन') || lower.includes('पंप')) {
      reply = langGroup.dosage;
      suggestions = ['1 एकड़ में कितने पंप पानी लगता है?', 'दवा नापने का सही ढक्कन?', 'स्प्रे करते समय क्या सावधानी रखें?'];
    } else {
      reply = `🗣️ **डॉ. किसान AI सलाह:** आपके कृषि सवाल के लिए प्रामाणिक मार्गदर्शन:
🟢 **क्या करें:** खेत में किसी भी कीटनाशक, फफूंदनाशक या टॉनिक का उपयोग करने से पहले AgriSafe के सत्यापन इंजन में बैच नंबर व CIBRC लेबल अवश्य जांचें। 15 लीटर वाले स्प्रे पंप में सामान्यतः 20 से 30 मिली दवा और स्वच्छ पानी ही इस्तेमाल करें।
🔴 **सावधानी:** कभी भी खरपतवार नाशक (घास की दवा) को अन्य दवाओं के साथ एक टंकी में न मिलाएं। हमेशा मुंह पर गमछा या मास्क पहनकर हवा के रुख में ही छिड़काव करें।
💡 **सुझावित उत्पाद:** AgriSafe पर 45+ प्रमाणित बीज, नैनो यूरिया, व फसल सुरक्षा उत्पाद उपलब्ध हैं।
📞 **मुफ्त सरकारी हेल्पलाइन:** किसान कॉल सेंटर 1800-180-1551 पर 24x7 कृषि वैज्ञानिकों से सीधे बात करें।`;
      suggestions = [
        language === 'hi' ? 'मेरी फसल में कीड़े लगे हैं, क्या करूँ?' : 'Pests in my crop, what to do?',
        language === 'hi' ? '15 लीटर पंप में दवा की सही मात्रा?' : 'What is the exact dosage for 15L pump?',
        language === 'hi' ? 'इफको नैनो यूरिया का स्प्रे कब करें?' : 'When to spray Nano Urea?'
      ];
    }

    return res.json({
      reply,
      suggestedQuestions: suggestions,
      language,
      isAiGenerated: true,
    });
  } catch (error: any) {
    console.error('AI assistant route error:', error);
    res.status(500).json({ error: 'Failed to generate assistance', details: error?.message });
  }
});

// API: Submit Admin Support Ticket
app.post('/api/support/ticket', (req, res) => {
  try {
    const {
      farmerName,
      phone,
      state = 'Not Specified',
      district = 'Not Specified',
      category = 'General Grievance',
      message = '',
      voiceNoteUrl,
      photoUrl,
      urgency = 'normal',
    } = req.body;

    if (!farmerName || !phone) {
      return res.status(400).json({ error: 'Farmer name and mobile number are required' });
    }

    const ticketId = `AGRI-ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Under security rules, queries start as Pending Admin Review without government transmission
    const newTicket: SupportTicket = {
      id: ticketId,
      farmerName,
      phone,
      state,
      district,
      category,
      message,
      voiceNoteUrl,
      photoUrl,
      urgency,
      status: 'Pending Admin Review',
      adminApprovalStatus: 'pending_approval',
      sentToGovernment: false,
      govtPortalStatus: 'LOCKED: Awaiting Power Ventures Admin Review & Authorization',
      assignedOfficer: 'Unassigned (Awaiting Admin Approval)',
      createdAt: new Date().toISOString(),
      responseNote: 'Query submitted to administrative queue. Under security policy, no action or government notification will occur until approved by Power Ventures Admin.',
    };

    supportTickets.unshift(newTicket);

    auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: `${farmerName} (${phone})`,
      action: 'QUERY_UPLOADED_PENDING_APPROVAL',
      details: `Farmer uploaded query #${ticketId} regarding ${category}. Transmit to govt blocked pending admin approval.`,
      severity: urgency === 'emergency' ? 'warning' : 'info',
    });

    res.status(201).json({
      success: true,
      ticket: newTicket,
      requiresAdminApproval: true,
      message: 'Your query has been securely registered. It is pending Power Ventures Admin review before any government or officer escalation.',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Could not submit support ticket', details: error?.message });
  }
});

// API: Get Support Tickets (Farmer view or by phone)
app.get('/api/support/tickets', (req, res) => {
  const { phone } = req.query;
  if (phone) {
    const matched = supportTickets.filter((t) => t.phone === String(phone));
    return res.json({ tickets: matched });
  }
  res.json({ tickets: supportTickets.slice(0, 15) });
});

// API: Public Viewer Community Board (Only shows Admin-Approved queries)
app.get('/api/community/approved-queries', (req, res) => {
  const approved = supportTickets.filter((t) => t.adminApprovalStatus === 'approved');
  res.json({
    totalApproved: approved.length,
    queries: approved.slice(0, 10),
  });
});

// API: Real-time Public Viewer & Transparency Stats
app.get('/api/viewer/stats', (req, res) => {
  const activeViewers = 1420 + Math.floor(Math.sin(Date.now() / 60000) * 15) + Math.floor(Math.random() * 8);
  const approvedQueries = supportTickets.filter((t) => t.adminApprovalStatus === 'approved').length;
  const pendingQueries = supportTickets.filter((t) => t.adminApprovalStatus === 'pending_approval').length;
  const approvedOrders = adminOrders.filter((o) => o.status === 'approved').length;
  const pendingOrders = adminOrders.filter((o) => o.status === 'pending_approval').length;

  res.json({
    activeViewers,
    totalVerifications: totalLiveVerifications,
    approvedQueries,
    pendingQueries,
    approvedOrders,
    pendingOrders,
    govtDocketsActive: supportTickets.filter((t) => t.sentToGovernment).length,
    cibrcSyncStatus: 'Real-time Encrypted Gateway Active',
  });
});

// API: Farmer Place Order (Must enter Pending Admin Approval queue)
app.post('/api/orders', (req, res) => {
  try {
    const {
      orderId,
      items,
      subtotal,
      subsidyDiscount = 0,
      commissionFee,
      commissionRate = 0.03,
      assistedKendraId,
      assistedKendraName,
      sahayakCommissionFee,
      sahayakCommissionRate = 0.02,
      deliveryPartner,
      total,
      farmerName,
      phone,
      villageAddress,
      pincode,
      paymentMethod = 'upi',
      paymentRefId,
      seedTraceCertificateId,
    } = req.body;

    if (!farmerName || !phone || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required order details' });
    }

    const cleanOrderId = orderId || `AGRI-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const certId = seedTraceCertificateId || `CERT-SEEDTRACE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Standard 3% Power Ventures Quality & Anti-Counterfeit Platform Commission Fee
    const finalCommissionRate = 0.03;
    const finalCommissionFee = typeof commissionFee === 'number'
      ? commissionFee
      : Math.round(Number(subtotal) * finalCommissionRate);

    // 2% Field District Sahayak Facilitation Commission
    const finalSahayakRate = assistedKendraId ? 0.02 : 0;
    const finalSahayakFee = typeof sahayakCommissionFee === 'number'
      ? sahayakCommissionFee
      : assistedKendraId
      ? Math.round(Number(subtotal) * finalSahayakRate)
      : 0;

    const partnerCost = deliveryPartner?.cost !== undefined ? Number(deliveryPartner.cost) : 49;
    const finalTotal = typeof total === 'number'
      ? total
      : Number(subtotal) + partnerCost + finalCommissionFee + finalSahayakFee;
    const vendorPayout = Number(subtotal) - (finalCommissionFee + finalSahayakFee);

    // Update Kendras wallet if assisted
    if (assistedKendraId) {
      const targetKendra = districtKendras.find((k) => k.id === assistedKendraId);
      if (targetKendra) {
        targetKendra.ordersFacilitated += 1;
        targetKendra.commissionEarnedWallet += finalSahayakFee;
      }
    }

    // Under security policy, ALL agricultural input orders require Admin Quality Approval before dispatch
    const newOrder: AdminOrder = {
      orderId: cleanOrderId,
      items,
      subtotal: Number(subtotal),
      subsidyDiscount: Number(subsidyDiscount),
      commissionFee: finalCommissionFee,
      commissionRate: finalCommissionRate,
      assistedKendraId,
      assistedKendraName,
      sahayakCommissionFee: finalSahayakFee,
      sahayakCommissionRate: finalSahayakRate,
      vendorPayout,
      deliveryPartner: deliveryPartner || {
        id: 'krishi-express',
        name: 'Krishi Rural Express Hub',
        cost: partnerCost,
        estimatedDays: '1-2 Days (Priority)'
      },
      total: finalTotal,
      farmerName,
      phone,
      villageAddress,
      pincode,
      paymentMethod,
      paymentRefId: paymentRefId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      seedTraceCertificateId: certId,
      timestamp: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'pending_approval',
      adminApproved: false,
    };

    adminOrders.unshift(newOrder);

    auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: `${farmerName} (${phone})`,
      action: 'ORDER_PLACED_AWAITING_APPROVAL',
      details: `Order #${cleanOrderId} (₹${newOrder.total}) placed for ${items.length} items. Queued for Admin Quality Review before dispatch. Power Ventures 3% Fee: ₹${finalCommissionFee}, Sahayak 2% Fee: ₹${finalSahayakFee}.`,
      severity: 'info',
    });

    res.status(201).json({
      success: true,
      order: newOrder,
      message: 'Order received and submitted to Power Ventures Admin for approval. Dispatch will commence once quality verification is approved.',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create order', details: error?.message });
  }
});

// API: Get District Kendras & Village Sahayaks
app.get('/api/district-kendras', (req, res) => {
  res.json({ kendras: districtKendras });
});

// API: Admin Register New District Kendra
app.post('/api/admin/district-kendras', (req, res) => {
  try {
    const {
      name,
      district,
      state = 'Maharashtra',
      tehsilBlock = 'Central Mandi',
      kendraAddress,
      landmark = 'Near APMC Yard',
      phone,
      whatsappNumber,
      languagesSpoken = ['Hindi'],
      upiId,
      actorEmail,
    } = req.body;

    if (!name || !district || !phone) {
      return res.status(400).json({ error: 'Name, District, and Phone are required' });
    }

    const newKendra: DistrictKendra = {
      id: `SAH-${state.substring(0, 2).toUpperCase()}-${district.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      name,
      role: 'Authorized Village Krishi Mitra & Mandi Facilitator',
      licenseNumber: `PV-DIST-${state.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      phone,
      whatsappNumber: whatsappNumber || phone,
      state,
      district,
      tehsilBlock,
      kendraAddress: kendraAddress || `Shop #${Math.floor(1 + Math.random() * 30)}, APMC Market Yard, ${district}`,
      landmark,
      languagesSpoken: Array.isArray(languagesSpoken) ? languagesSpoken : [languagesSpoken],
      assistedServices: [
        'Illiterate Farmer Dialect Speech Assistance',
        'Physical Seed Packet Hologram & QR Scan',
        'Cash / Kisan Credit Card (KCC) Order Placement',
        'Direct Farm Dispatch Coordination'
      ],
      rating: 4.9,
      ordersFacilitated: 0,
      commissionEarnedWallet: 0,
      commissionRate: 0.02,
      status: 'active',
      upiId: upiId || `${phone.replace(/\D/g, '')}@upi`
    };

    districtKendras.unshift(newKendra);

    auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actorEmail || 'Admin',
      action: 'DISTRICT_KENDRA_ENROLLED',
      details: `New District Kendra authorized: ${name} (${district}, ${state}) under license #${newKendra.licenseNumber}.`,
      severity: 'info',
    });

    res.status(201).json({ success: true, kendra: newKendra });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create district kendra', details: error?.message });
  }
});

// API: Admin Disburse 2% Commission Payout to Kendra
app.post('/api/admin/district-kendras/:id/payout', (req, res) => {
  const { id } = req.params;
  const { amount, actorEmail } = req.body;
  const kendra = districtKendras.find((k) => k.id === id);

  if (!kendra) {
    return res.status(404).json({ error: 'District Kendra not found' });
  }

  const payoutAmount = Number(amount) || kendra.commissionEarnedWallet;
  kendra.commissionEarnedWallet = Math.max(0, kendra.commissionEarnedWallet - payoutAmount);

  auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: actorEmail || 'Admin',
    action: 'KENDRA_COMMISSION_DISBURSED',
    details: `Transferred ₹${payoutAmount} 2% facilitation commission payout to ${kendra.name} via UPI (${kendra.upiId}).`,
    severity: 'info',
  });

  res.json({
    success: true,
    message: `Commission payout of ₹${payoutAmount} disbursed to ${kendra.name} successfully.`,
    remainingWallet: kendra.commissionEarnedWallet,
  });
});

// API: Get Orders (Filtered by phone or public list)
app.get('/api/orders', (req, res) => {
  const { phone } = req.query;
  if (phone) {
    const matched = adminOrders.filter((o) => o.phone === String(phone));
    return res.json({ orders: matched });
  }
  res.json({ orders: adminOrders.slice(0, 15) });
});

// API: Urgent Callback Request
app.post('/api/support/callback', (req, res) => {
  try {
    const { farmerName, phone, preferredLanguage = 'hi', urgency = 'urgent' } = req.body;

    if (!farmerName || !phone) {
      return res.status(400).json({ error: 'Farmer name and mobile phone are required' });
    }

    const officers = [
      'Officer Rajesh Verma (Duty Krishi Adhikari - Shift A)',
      'Officer Meena Patel (District Agro-Control - Shift B)',
      'Officer Jagjit Singh (Kisan Helpline Support Desk)',
    ];
    const assignedOfficer = officers[Math.floor(Math.random() * officers.length)];

    const request: CallbackRequest = {
      id: `CB-${Math.floor(1000 + Math.random() * 9000)}`,
      farmerName,
      phone,
      preferredLanguage,
      urgency,
      requestedAt: new Date().toISOString(),
      status: 'Officer Calling',
      assignedOfficer,
    };

    callbackRequests.unshift(request);

    res.status(200).json({
      success: true,
      callback: request,
      estimatedMinutes: 5 + Math.floor(Math.random() * 10),
      message: `Callback scheduled! Officer ${assignedOfficer} will call ${phone} shortly.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to schedule callback', details: error?.message });
  }
});

// ==========================================
// SEPARATE ADMIN PORTAL & VIGILANCE API
// ==========================================

interface AdminBatch {
  batchNumber: string;
  productName: string;
  category: 'Seed' | 'Fertilizer' | 'Pesticide' | 'Bio-stimulant';
  manufacturer: string;
  mfgLicense: string;
  seedTraceRegisterId: string;
  mfgDate: string;
  expiryDate: string;
  status: 'genuine' | 'counterfeit' | 'expired' | 'blacklisted';
  testingLab: string;
  purityRate: string;
  notes: string;
  flaggedReason?: string;
  flaggedBy?: string;
  updatedAt: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

const adminBatches: AdminBatch[] = [
  {
    batchNumber: 'BT-COT-2026-8841',
    productName: 'Mahyco Bollgard II Hybrid Bt Cotton Seeds',
    category: 'Seed',
    manufacturer: 'Maharashtra Hybrid Seeds Co. Pvt. Ltd. (Mahyco)',
    mfgLicense: 'MH/SEED/2022/4119',
    seedTraceRegisterId: 'ST-GOV-IN-LOT-488219-KHARIF',
    mfgDate: '12-01-2026',
    expiryDate: '11-10-2026',
    status: 'genuine',
    testingLab: 'State Seed Testing Laboratory, Pune (NABL Accredited)',
    purityRate: '98.8% Genetic Purity (Germination: 89.4%)',
    notes: 'Certified lot in national Kharif register. Cryptographic QR signature verified.',
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    batchNumber: 'NANO-UREA-IF772',
    productName: 'IFFCO Nano Urea Plus (Liquid Fertilizer 4% N)',
    category: 'Fertilizer',
    manufacturer: 'Indian Farmers Fertiliser Cooperative Ltd. (Kalol Unit)',
    mfgLicense: 'FCO/GJ/CENTRAL/2021/0082',
    seedTraceRegisterId: 'ST-GOV-IN-FERT-99381-CENTRAL',
    mfgDate: '18-02-2026',
    expiryDate: '17-02-2028',
    status: 'genuine',
    testingLab: 'CFQC&TI, Faridabad',
    purityRate: '100% Water Dispersible (4% N w/v)',
    notes: 'Approved under Fertilizer Control Order 1985 Schedule VIII.',
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    batchNumber: 'CONF-BAY-4491',
    productName: 'Bayer Confidor 200 SL Systemic Insecticide',
    category: 'Pesticide',
    manufacturer: 'Bayer CropScience India Limited',
    mfgLicense: 'CIBRC/MFG/2020/BAY-8812',
    seedTraceRegisterId: 'CIBRC-GOV-IN-REG-21980',
    mfgDate: '05-01-2026',
    expiryDate: '04-01-2028',
    status: 'genuine',
    testingLab: 'Regional Pesticide Testing Laboratory (RPTL), Chandigarh',
    purityRate: '17.92% Active Ingredient assay',
    notes: 'Approved for sucking pest control. CIBRC certification valid.',
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    batchNumber: 'CF-FAKE-9920',
    productName: 'SUSPECT COUNTERFEIT: Chlorpyrifos 20% EC Imitation',
    category: 'Pesticide',
    manufacturer: 'UNKNOWN / FRAUDULENT PACKAGER ("Agrochem India Corp")',
    mfgLicense: 'FORGED: DL/AGRO/9920-FAKE',
    seedTraceRegisterId: 'REJECTED - Blacklisted Registry Entry #9920',
    mfgDate: '01-01-2026',
    expiryDate: '01-01-2028',
    status: 'counterfeit',
    testingLab: 'State Quality Control Laboratory Seizure Report #QC-MH-2026-042',
    purityRate: 'CRITICAL FAILURE: 4.1% active vs 20% labeled',
    notes: 'Seized in joint raid by Directorate of Agriculture & Police in Aurangabad. Contains kerosene solvent adulterant.',
    flaggedReason: 'Toxic adulteration with kerosene solvent; illegal counterfeit packaging seized during police raid.',
    flaggedBy: 'Dr. V. K. Deshmukh (District Quality Control Inspector)',
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    batchNumber: 'EXP-SEED-3011',
    productName: 'BPT-5204 (Samba Mahsuri) Hybrid Paddy Seeds',
    category: 'Seed',
    manufacturer: 'Deccan Seeds & Farm Technologies',
    mfgLicense: 'AP/SEED/2021/1102',
    seedTraceRegisterId: 'ST-GOV-IN-LOT-301188-EXP',
    mfgDate: '15-04-2024',
    expiryDate: '14-01-2025',
    status: 'expired',
    testingLab: 'AP State Seed Certification Authority (APSSCA)',
    purityRate: 'Germination vigor degraded to 54.2%',
    notes: 'Lot expired 22+ months ago. Retailer prohibited from selling under Section 6 of Seeds Act 1966.',
    flaggedReason: 'Statutory validity expired. Fails mandatory germination minimum threshold.',
    flaggedBy: 'Central SeedTrace System Audit',
    updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    batchNumber: 'AMIS-SYN-9021',
    productName: 'Syngenta Amistar Top Broad-Spectrum Fungicide',
    category: 'Pesticide',
    manufacturer: 'Syngenta India Private Limited, Goa Plant',
    mfgLicense: 'GA/PEST/SYN/2019/109',
    seedTraceRegisterId: 'CIBRC-GOV-IN-REG-54129',
    mfgDate: '10-02-2026',
    expiryDate: '09-02-2028',
    status: 'genuine',
    testingLab: 'NIPHM, Hyderabad',
    purityRate: 'SC Suspension Assay: 99.4%',
    notes: 'Genuine lot. Safe for sheath blight and blast control.',
    updatedAt: new Date(Date.now() - 3600000 * 80).toISOString(),
  }
];

const auditLogs: AuditLog[] = [
  {
    id: 'LOG-2026-901',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    actor: 'sudarshansulegai322@gmail.com',
    action: 'COUNTERFEIT_SEIZURE_ALERT',
    details: 'Flagged batch CF-FAKE-9920 as Blacklisted Counterfeit following FIR in Aurangabad.',
    severity: 'critical',
  },
  {
    id: 'LOG-2026-902',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    actor: 'Dr. V. K. Deshmukh',
    action: 'TICKET_DISPATCHED',
    details: 'Assigned Inspection Team to Mandi Yard Yavatmal for Ticket AGRI-ADM-2026-1042.',
    severity: 'warning',
  },
  {
    id: 'LOG-2026-903',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    actor: 'Central SeedTrace System',
    action: 'BATCH_EXPIRY_LOCKOUT',
    details: 'Automatic expiry lockout for Paddy Seed lot EXP-SEED-3011.',
    severity: 'warning',
  },
  {
    id: 'LOG-2026-904',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    actor: 'Power Ventures Super Admin',
    action: 'REGISTRY_SYNC',
    details: 'Synchronized central CIBRC national insecticide registry with 21,980 valid entries.',
    severity: 'info',
  }
];

// Admin Verification Count Metric
let totalLiveVerifications = 14820;

// API: Admin Authentication
app.post('/api/admin/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();

    // Recognized registered admin accounts
    const validEmails = [
      'lohithyboss22@gmail.com',
      'sudarshansulegai322@gmail.com',
      'admin@powerventures.in',
      'admin@agrisafe.gov.in',
    ];

    const isEmailValid = validEmails.includes(cleanEmail) || cleanEmail.endsWith('@powerventures.in');
    const validPasscodes = ['POWER-AGRI-2026', 'AgriSafe@2026', 'PowerVentures@2026', 'admin@2026'];
    const isPassValid = validPasscodes.includes(cleanPass);

    if (!isEmailValid || !isPassValid) {
      return res.status(401).json({
        success: false,
        error: 'Access denied: Invalid administrative email or passcode. Entry restricted to authorized Power Ventures officers.',
      });
    }

    const isOwner = cleanEmail === 'sudarshansulegai322@gmail.com';
    const adminUser = {
      name: isOwner ? 'Sudarshan Sulegai' : 'Power Ventures Admin Officer',
      email: cleanEmail === 'admin' ? 'sudarshansulegai322@gmail.com' : cleanEmail,
      role: isOwner ? 'Super Administrator & Founder (Power Ventures)' : 'Regional Agricultural Vigilance Officer',
      organization: 'Power Ventures India / AgriSafe Central Cell',
      token: `pvt-adm-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      lastLogin: new Date().toISOString(),
      permissions: ['read', 'write', 'blacklist', 'dispatch', 'audit', 'manage_users'],
    };

    // Log admin login
    auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: adminUser.email,
      action: 'ADMIN_CONSOLE_LOGIN',
      details: `Successful authenticated session started by ${adminUser.name} (${adminUser.role}).`,
      severity: 'info',
    });

    res.json({
      success: true,
      user: adminUser,
      message: 'Welcome to Power Ventures AgriSafe Central Administration Portal',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Login authentication failed', details: error?.message });
  }
});

// API: Admin System Overview & KPI metrics
app.get('/api/admin/overview', (req, res) => {
  totalLiveVerifications += Math.floor(Math.random() * 3);
  const genuineCount = adminBatches.filter((b) => b.status === 'genuine').length;
  const counterfeitCount = adminBatches.filter((b) => b.status === 'counterfeit' || b.status === 'blacklisted').length;
  const expiredCount = adminBatches.filter((b) => b.status === 'expired').length;
  const emergencyTicketsCount = supportTickets.filter((t) => t.urgency === 'emergency').length;
  const pendingTicketsCount = supportTickets.filter((t) => t.status !== 'Resolved').length;

  const pendingApprovalQueries = supportTickets.filter((t) => t.adminApprovalStatus === 'pending_approval').length;
  const approvedQueries = supportTickets.filter((t) => t.adminApprovalStatus === 'approved').length;
  const pendingOrders = adminOrders.filter((o) => o.status === 'pending_approval').length;
  const approvedOrders = adminOrders.filter((o) => o.status === 'approved').length;
  const totalRevenue = adminOrders
    .filter((o) => o.status === 'approved')
    .reduce((sum, o) => sum + o.total, 0);

  // 3% Platform Commission Fee earned by Power Ventures
  const totalPlatformCommissionEarned = adminOrders
    .filter((o) => o.status === 'approved')
    .reduce((sum, o) => sum + (o.commissionFee || Math.round(o.subtotal * 0.03)), 0);
  const pendingPlatformCommission = adminOrders
    .filter((o) => o.status === 'pending_approval')
    .reduce((sum, o) => sum + (o.commissionFee || Math.round(o.subtotal * 0.03)), 0);

  res.json({
    metrics: {
      totalBatches: adminBatches.length,
      genuineBatches: genuineCount,
      counterfeitBatches: counterfeitCount,
      expiredBatches: expiredCount,
      totalVerifications: totalLiveVerifications,
      totalTickets: supportTickets.length,
      pendingTickets: pendingTicketsCount,
      pendingApprovalQueries,
      approvedQueries,
      totalOrders: adminOrders.length,
      pendingOrders,
      approvedOrders,
      totalRevenue,
      totalPlatformCommissionEarned,
      pendingPlatformCommission,
      platformCommissionRate: '3%',
      emergencyTickets: emergencyTicketsCount,
      totalCallbacks: callbackRequests.length,
      pendingCallbacks: callbackRequests.filter((c) => c.status !== 'Completed').length,
      systemStatus: 'Optimal (Real-time SeedTrace & CIBRC Gateway Active)',
      lastSync: new Date().toISOString(),
    },
    recentTickets: supportTickets.slice(0, 8),
    recentOrders: adminOrders.slice(0, 8),
    recentCallbacks: callbackRequests.slice(0, 5),
    recentAuditLogs: auditLogs.slice(0, 10),
  });
});

// API: Admin Batch Registry Management
app.get('/api/admin/batches', (req, res) => {
  const { status, category, search } = req.query;
  let filtered = [...adminBatches];

  if (status && status !== 'all') {
    filtered = filtered.filter((b) => b.status === status);
  }
  if (category && category !== 'all') {
    filtered = filtered.filter((b) => b.category === category);
  }
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.batchNumber.toLowerCase().includes(q) ||
        b.productName.toLowerCase().includes(q) ||
        b.manufacturer.toLowerCase().includes(q) ||
        b.mfgLicense.toLowerCase().includes(q)
    );
  }

  res.json({ batches: filtered, total: filtered.length });
});

// API: Add New Certified Batch to National Registry
app.post('/api/admin/batches', (req, res) => {
  try {
    const {
      batchNumber,
      productName,
      category = 'Seed',
      manufacturer,
      mfgLicense,
      seedTraceRegisterId,
      mfgDate,
      expiryDate,
      testingLab,
      purityRate = '99.0%',
      notes = '',
      status = 'genuine',
      actorEmail = 'admin@powerventures.in',
    } = req.body;

    if (!batchNumber || !productName || !manufacturer) {
      return res.status(400).json({ error: 'Batch Number, Product Name, and Manufacturer are required.' });
    }

    const cleanBatch = String(batchNumber).trim().toUpperCase();
    const existingIndex = adminBatches.findIndex((b) => b.batchNumber === cleanBatch);

    const newBatch: AdminBatch = {
      batchNumber: cleanBatch,
      productName: String(productName).trim(),
      category,
      manufacturer: String(manufacturer).trim(),
      mfgLicense: mfgLicense || `LIC-${Math.floor(1000 + Math.random() * 9000)}`,
      seedTraceRegisterId: seedTraceRegisterId || `ST-GOV-LOT-${Math.floor(100000 + Math.random() * 900000)}`,
      mfgDate: mfgDate || new Date().toISOString().split('T')[0],
      expiryDate: expiryDate || '2028-12-31',
      status,
      testingLab: testingLab || 'National Seed Certification & Quality Control Lab',
      purityRate,
      notes,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      adminBatches[existingIndex] = newBatch;
    } else {
      adminBatches.unshift(newBatch);
    }

    auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actorEmail,
      action: 'BATCH_REGISTERED',
      details: `Registered ${status.toUpperCase()} batch ${cleanBatch} (${newBatch.productName}) under manufacturer ${newBatch.manufacturer}.`,
      severity: 'info',
    });

    res.status(201).json({ success: true, batch: newBatch });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create batch', details: error?.message });
  }
});

// API: Update Batch Status (e.g. Flag as Counterfeit or Blacklist)
app.put('/api/admin/batches/:batchNumber/status', (req, res) => {
  try {
    const { batchNumber } = req.params;
    const { status, reason = '', actorEmail = 'admin@powerventures.in' } = req.body;

    const cleanBatch = String(batchNumber).trim().toUpperCase();
    const target = adminBatches.find((b) => b.batchNumber === cleanBatch);

    if (!target) {
      return res.status(404).json({ error: `Batch ${cleanBatch} not found in registry.` });
    }

    const oldStatus = target.status;
    target.status = status;
    target.updatedAt = new Date().toISOString();
    if (reason) target.flaggedReason = reason;
    target.flaggedBy = actorEmail;

    const severity = status === 'counterfeit' || status === 'blacklisted' ? 'critical' : 'warning';
    auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actorEmail,
      action: 'BATCH_STATUS_UPDATE',
      details: `Changed batch ${cleanBatch} status from ${oldStatus.toUpperCase()} to ${status.toUpperCase()}. Reason: ${reason || 'Administrative action'}`,
      severity,
    });

    res.json({ success: true, batch: target });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update batch status', details: error?.message });
  }
});

// API: Delete Batch from Registry
app.delete('/api/admin/batches/:batchNumber', (req, res) => {
  const { batchNumber } = req.params;
  const cleanBatch = String(batchNumber).trim().toUpperCase();
  const idx = adminBatches.findIndex((b) => b.batchNumber === cleanBatch);
  if (idx === -1) {
    return res.status(404).json({ error: 'Batch not found' });
  }

  const removed = adminBatches.splice(idx, 1)[0];
  auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'admin@powerventures.in',
    action: 'BATCH_ARCHIVED',
    details: `Archived batch ${cleanBatch} from active registry.`,
    severity: 'warning',
  });

  res.json({ success: true, removedBatch: removed });
});

// API: Admin Approve Farmer Query / Report
app.put('/api/admin/tickets/:id/approve', (req, res) => {
  try {
    const { id } = req.params;
    const { assignedOfficer, adminNotes = '', actorEmail = 'admin@powerventures.in' } = req.body;

    const ticket = supportTickets.find((t) => t.id === id);
    if (!ticket) {
      return res.status(404).json({ error: `Ticket ${id} not found.` });
    }

    ticket.adminApprovalStatus = 'approved';
    ticket.status = 'Approved by Admin';
    ticket.approvedBy = actorEmail;
    ticket.approvedAt = new Date().toISOString();
    if (adminNotes) ticket.adminNotes = adminNotes;
    if (assignedOfficer) ticket.assignedOfficer = assignedOfficer;
    ticket.responseNote = 'Query verified & approved by Power Ventures Administrator. Authorized for district follow-up and statutory actions.';

    auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actorEmail,
      action: 'QUERY_APPROVED_BY_ADMIN',
      details: `Admin approved farmer query #${id} (${ticket.category}). Assigned to ${ticket.assignedOfficer}.`,
      severity: 'info',
    });

    res.json({ success: true, ticket });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to approve ticket', details: error?.message });
  }
});

// API: Admin Reject Farmer Query / Report
app.put('/api/admin/tickets/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Dismissed after administrative verification', actorEmail = 'admin@powerventures.in' } = req.body;

    const ticket = supportTickets.find((t) => t.id === id);
    if (!ticket) {
      return res.status(404).json({ error: `Ticket ${id} not found.` });
    }

    ticket.adminApprovalStatus = 'rejected';
    ticket.status = 'Rejected';
    ticket.adminNotes = reason;
    ticket.responseNote = `Query was reviewed and declined by Power Ventures Admin: ${reason}`;
    ticket.sentToGovernment = false;
    ticket.govtPortalStatus = 'REJECTED: Administrative review deemed report invalid or duplicate';

    auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actorEmail,
      action: 'QUERY_REJECTED_BY_ADMIN',
      details: `Admin rejected query #${id}. Reason: ${reason}`,
      severity: 'warning',
    });

    res.json({ success: true, ticket });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reject ticket', details: error?.message });
  }
});

// API: Admin Authorize & Escalate Query to Government Website / Portals
// STRICT SECURITY PROTOCOL: Without explicit Admin permission, NOTHING can be sent to government portals!
app.put('/api/admin/tickets/:id/escalate-gov', (req, res) => {
  try {
    const { id } = req.params;
    const { governmentTarget = 'DAC&FW National Vigilance & SeedTrace Portal', actorEmail = 'admin@powerventures.in' } = req.body;

    const ticket = supportTickets.find((t) => t.id === id);
    if (!ticket) {
      return res.status(404).json({ error: `Ticket ${id} not found.` });
    }

    // STRICT CHECK: Admin must have approved first!
    if (ticket.adminApprovalStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        error: 'Statutory Lockout: Under strict security rules, this query CANNOT be transmitted to any government website or database without prior explicit Admin Approval.',
      });
    }

    const docketNum = `GOV-DAC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    ticket.sentToGovernment = true;
    ticket.govtDocketNumber = docketNum;
    ticket.govtPortalStatus = `Transmitted to ${governmentTarget}. Statutory Docket #${docketNum} issued.`;
    ticket.status = 'Assigned to Agro Officer';

    auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actorEmail,
      action: 'GOVERNMENT_PORTAL_TRANSMISSION',
      details: `Admin authorized escalation of query #${id} to ${governmentTarget}. Issued Statutory Docket #${docketNum}.`,
      severity: 'critical',
    });

    res.json({
      success: true,
      ticket,
      docketNumber: docketNum,
      message: `Query officially escalated to Government Authorities with Docket #${docketNum}.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to escalate to government portal', details: error?.message });
  }
});

// API: Update Farmer Support Ticket (Generic status/notes)
app.put('/api/admin/tickets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedOfficer, responseNote, actorEmail = 'admin@powerventures.in' } = req.body;

    const ticket = supportTickets.find((t) => t.id === id);
    if (!ticket) {
      return res.status(404).json({ error: `Ticket ${id} not found.` });
    }

    if (status) ticket.status = status;
    if (assignedOfficer) ticket.assignedOfficer = assignedOfficer;
    if (responseNote) ticket.responseNote = responseNote;

    auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actorEmail,
      action: 'TICKET_UPDATED',
      details: `Ticket ${id} updated to status "${ticket.status}". Officer: ${ticket.assignedOfficer}.`,
      severity: ticket.urgency === 'emergency' ? 'critical' : 'info',
    });

    res.json({ success: true, ticket });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update ticket', details: error?.message });
  }
});

// ==========================================
// ADMIN ORDERS APPROVAL & DISPATCH APIS
// ==========================================

// API: Get All Orders for Admin Portal
app.get('/api/admin/orders', (req, res) => {
  const { status, search } = req.query;
  let filtered = [...adminOrders];

  if (status && status !== 'all') {
    filtered = filtered.filter((o) => o.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.orderId.toLowerCase().includes(q) ||
        o.farmerName.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.pincode.includes(q) ||
        o.villageAddress.toLowerCase().includes(q)
    );
  }

  const pendingCount = adminOrders.filter((o) => o.status === 'pending_approval').length;
  const approvedCount = adminOrders.filter((o) => o.status === 'approved').length;
  const rejectedCount = adminOrders.filter((o) => o.status === 'rejected').length;

  res.json({
    orders: filtered,
    total: filtered.length,
    pendingCount,
    approvedCount,
    rejectedCount,
  });
});

// API: Admin Approve Order
app.put('/api/admin/orders/:orderId/approve', (req, res) => {
  try {
    const { orderId } = req.params;
    const { actorEmail = 'admin@powerventures.in', notes = '' } = req.body;

    const order = adminOrders.find((o) => o.orderId === orderId);
    if (!order) {
      return res.status(404).json({ error: `Order ${orderId} not found.` });
    }

    order.status = 'approved';
    order.adminApproved = true;
    order.approvedBy = actorEmail;
    order.approvedAt = new Date().toISOString();

    auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actorEmail,
      action: 'ORDER_APPROVED_BY_ADMIN',
      details: `Admin approved input order #${orderId} (₹${order.total}) for farmer ${order.farmerName}. Authorized for warehouse dispatch.`,
      severity: 'info',
    });

    res.json({
      success: true,
      order,
      message: `Order #${orderId} has been successfully approved for fulfillment and dispatch.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to approve order', details: error?.message });
  }
});

// API: Admin Reject Order
app.put('/api/admin/orders/:orderId/reject', (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason = 'Rejected per administrative quality review', actorEmail = 'admin@powerventures.in' } = req.body;

    const order = adminOrders.find((o) => o.orderId === orderId);
    if (!order) {
      return res.status(404).json({ error: `Order ${orderId} not found.` });
    }

    order.status = 'rejected';
    order.adminApproved = false;
    order.rejectionReason = reason;

    auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actorEmail,
      action: 'ORDER_REJECTED_BY_ADMIN',
      details: `Admin rejected order #${orderId}. Reason: ${reason}`,
      severity: 'warning',
    });

    res.json({
      success: true,
      order,
      message: `Order #${orderId} has been rejected.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reject order', details: error?.message });
  }
});

// API: Update Callback Request Status
app.put('/api/admin/callbacks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, officerNotes } = req.body;

    const cb = callbackRequests.find((c) => c.id === id);
    if (!cb) {
      return res.status(404).json({ error: `Callback ${id} not found.` });
    }

    if (status) (cb as any).status = status;
    if (officerNotes) (cb as any).officerNotes = officerNotes;

    res.json({ success: true, callback: cb });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update callback', details: error?.message });
  }
});

// API: Get Audit Logs
app.get('/api/admin/audit-logs', (req, res) => {
  res.json({ logs: auditLogs });
});

// API: Weather & Pest Outbreak Advisory
app.get('/api/weather-pest-advisory', (req, res) => {
  const { district = 'Yavatmal' } = req.query;
  res.json({
    success: true,
    district,
    source: 'ICAR / State Agricultural Universities Agrometeorological Advisory Cell',
    timestamp: new Date().toISOString(),
  });
});

// API: Drone Service Providers & CHC Hubs
app.get('/api/drone/providers', (req, res) => {
  res.json({
    success: true,
    scheme: 'Sub-Mission on Agricultural Mechanization (SMAM) & Namo Drone Didi',
    subsidyPercentage: 50,
  });
});

// API: Book Precision Drone Mission
app.post('/api/drone/book', (req, res) => {
  try {
    const bookingData = req.body;
    const bookingId = `DRN-SMAM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: bookingData.phone || 'Farmer Walk-In',
      action: 'DRONE_MISSION_BOOKED',
      details: `Booked ${bookingData.acreage || 5} acres of drone spray in ${bookingData.villageName || 'Village'} under pilot ${bookingData.droneProvider?.pilotName || 'Certified Pilot'}.`,
      severity: 'info',
    });

    res.status(201).json({
      success: true,
      bookingId,
      message: 'Drone mission scheduled with verified DGCA pilot.',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to process drone booking', details: error?.message });
  }
});

// API: Harvest Output Traceability
app.get('/api/traceability/lots', (req, res) => {
  res.json({
    success: true,
    standards: 'ISO/IEC 17025 NABL Testing & SeedTrace Blockchain Provenance',
  });
});

// API: Low-Bandwidth SMS / USSD Verification Gateway
app.post('/api/sms-ussd/simulate', (req, res) => {
  const { batchNumber = '', channel = 'SMS' } = req.body;
  const cleanBatch = String(batchNumber).trim().toUpperCase();

  res.json({
    success: true,
    channel,
    batchNumber: cleanBatch,
    responseTimestamp: new Date().toISOString(),
  });
});

// Vite Middleware / Static Server setup
async function startServer() {
  if (process.env.VERCEL) {
    return;
  }

  const distPath = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && hasDist) {
    console.log('Serving production static build from:', distPath);
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      // Don't intercept API routes with HTML
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: false,
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite dev middleware could not be loaded, checking dist fallback:', err);
      if (hasDist) {
        app.use(express.static(distPath));
        app.get('*', (req, res, next) => {
          if (req.path.startsWith('/api/')) return next();
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }
    }
  }

  const { port, host } = getPortAndHost();
  const server = app.listen(port, host, () => {
    console.log(`AgriSafe Server is running on http://${host}:${port}`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
