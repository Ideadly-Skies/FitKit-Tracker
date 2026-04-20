import { useState, useMemo, useEffect } from "react";

const P="#4B2D83",PD="#3a2268",LAV="#E8E0F5",LAV2="#F4F0FA",TX="#2D1A50",TXM="#5a4a7a",TXL="#9080b0",BR="#D5C8ED",BG="#F7F4FD";
const FONT=`"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

const STAGES=[
  {id:1,label:"Pending send for kit packing",sub:"Received from NCSS",color:"#185FA5",light:"#E6F1FB"},
  {id:2,label:"Pending dispatch kit to patient",sub:"Sent to drop-ship company",color:"#854F0B",light:"#FAEEDA"},
  {id:3,label:"Pending return kit to lab",sub:"Patient returned sample",color:"#0F6E56",light:"#E1F5EE"},
  {id:4,label:"Lab result",sub:"Test result received",color:"#4B2D83",light:"#E8E0F5"},
];

// Each patient = 1 unique NCSS reference = 1 kit. Seed dataset spans the 4 stages
// with days-pending spread so >30d overdue rows trigger the red flag, and a mix of
// result types in Stage 4 including Inconclusive and Withdrawn.
const INIT_PATIENTS=[
  // ── Stage 1 — Pending send for kit packing (12) ─────────────────────────
  {id:1,name:"Tan Ah Kow",nric:"S****234A",dob:"1965-03-12",age:61,gender:"M",mobile:"91234567",address:"Blk 123 Ang Mo Kio Ave 6 #05-12 S560123",stage:1,ncssRef:"NCSS-2026-001",dispatchDate:"",labRef:"",receivedDate:"",result:"",resultDate:"",notes:""},
  {id:2,name:"Wong Mei Fong",nric:"S****789F",dob:"1968-01-14",age:58,gender:"F",mobile:"96789012",address:"Blk 89 Clementi Ave 3 #06-45 S120089",stage:1,ncssRef:"NCSS-2026-002",dispatchDate:"",labRef:"",receivedDate:"",result:"",resultDate:"",notes:""},
  {id:3,name:"Suresh Pillai",nric:"S****321K",dob:"1961-08-19",age:64,gender:"M",mobile:"83456789",address:"Blk 22 Hougang Ave 3 #07-11 S530022",stage:1,ncssRef:"NCSS-2026-003",dispatchDate:"",labRef:"",receivedDate:"",result:"",resultDate:"",notes:"Prefers morning calls"},
  {id:4,name:"Mdm Lee Geok Eng",nric:"S****654B",dob:"1956-04-02",age:70,gender:"F",mobile:"97654321",address:"Blk 5 Queenstown Rd #03-08 S140005",stage:1,ncssRef:"NCSS-2026-004",dispatchDate:"",labRef:"",receivedDate:"",result:"",resultDate:"",notes:""},
  {id:5,name:"Hamid Bin Osman",nric:"S****112C",dob:"1963-11-30",age:62,gender:"M",mobile:"91122334",address:"Blk 301 Bukit Batok St 31 #10-05 S650301",stage:1,ncssRef:"NCSS-2026-005",dispatchDate:"",labRef:"",receivedDate:"",result:"",resultDate:"",notes:""},
  {id:6,name:"Chua Boon Huat",nric:"S****445D",dob:"1958-06-15",age:67,gender:"M",mobile:"94455667",address:"Blk 88 Pasir Ris Dr 6 #12-22 S510088",stage:1,ncssRef:"NCSS-2026-006",dispatchDate:"",labRef:"",receivedDate:"",result:"",resultDate:"",notes:"Family history of CRC"},
  {id:7,name:"Noor Aini Bte Kassim",nric:"S****778E",dob:"1966-09-07",age:59,gender:"F",mobile:"98778899",address:"Blk 47 Woodlands Ave 6 #05-33 S730047",stage:1,ncssRef:"NCSS-2026-007",dispatchDate:"",labRef:"",receivedDate:"",result:"",resultDate:"",notes:""},
  {id:8,name:"Kamala d/o Raman",nric:"S****991A",dob:"1962-02-17",age:64,gender:"F",mobile:"97991002",address:"Blk 14 Simei St 1 #04-88 S520014",stage:1,ncssRef:"NCSS-2026-008",dispatchDate:"",labRef:"",receivedDate:"",result:"",resultDate:"",notes:""},
  {id:9,name:"Ng Kim Soon",nric:"S****662B",dob:"1955-10-08",age:70,gender:"M",mobile:"96662501",address:"Blk 220 Hougang St 21 #03-17 S530220",stage:1,ncssRef:"NCSS-2026-009",dispatchDate:"",labRef:"",receivedDate:"",result:"",resultDate:"",notes:"Awaiting address confirmation"},
  {id:10,name:"Zulkifli Bin Mohd",nric:"S****105G",dob:"1964-07-25",age:61,gender:"M",mobile:"81050012",address:"Blk 311 Bukit Batok St 31 #07-66 S650311",stage:1,ncssRef:"NCSS-2026-010",dispatchDate:"",labRef:"",receivedDate:"",result:"",resultDate:"",notes:""},
  {id:11,name:"Lee Wai Keong",nric:"S****488H",dob:"1959-04-19",age:66,gender:"M",mobile:"94881234",address:"Blk 408 Fernvale Rd #11-09 S790408",stage:1,ncssRef:"NCSS-2026-011",dispatchDate:"",labRef:"",receivedDate:"",result:"",resultDate:"",notes:""},
  {id:12,name:"Maria D'Souza",nric:"S****221C",dob:"1960-12-11",age:65,gender:"F",mobile:"92210456",address:"Blk 27 Telok Blangah Cres #05-113 S090027",stage:1,ncssRef:"NCSS-2026-012",dispatchDate:"",labRef:"",receivedDate:"",result:"",resultDate:"",notes:""},

  // ── Stage 2 — Pending dispatch kit to patient (13) ──────────────────────
  // dispatchDate spread: 3d to 45d ago (2026-03-05 to 2026-04-16)
  {id:13,name:"Siti Binte Rahmat",nric:"S****567B",dob:"1958-07-22",age:67,gender:"F",mobile:"92345678",address:"Blk 45 Bedok North Rd #08-23 S460045",stage:2,ncssRef:"NCSS-2026-013",dispatchDate:"2026-04-16",labRef:"",receivedDate:"",result:"",resultDate:"",notes:""},
  {id:14,name:"Muthu Selvam",nric:"S****012G",dob:"1957-06-08",age:68,gender:"M",mobile:"97890123",address:"Blk 34 Serangoon Ave 2 #14-02 S550034",stage:2,ncssRef:"NCSS-2026-014",dispatchDate:"2026-04-12",labRef:"",receivedDate:"",result:"",resultDate:"",notes:""},
  {id:15,name:"Goh Siew Leng",nric:"S****233F",dob:"1960-02-28",age:66,gender:"F",mobile:"93322110",address:"Blk 115 Bishan St 12 #09-14 S570115",stage:2,ncssRef:"NCSS-2026-015",dispatchDate:"2026-04-08",labRef:"",receivedDate:"",result:"",resultDate:"",notes:"Kit returned once — resent"},
  {id:16,name:"Rajan s/o Pillai",nric:"S****509H",dob:"1962-05-12",age:63,gender:"M",mobile:"96509876",address:"Blk 19 Jurong East Ave 1 #04-09 S609019",stage:2,ncssRef:"NCSS-2026-016",dispatchDate:"2026-04-05",labRef:"",receivedDate:"",result:"",resultDate:"",notes:""},
  {id:17,name:"Tan Swee Huat",nric:"S****381J",dob:"1955-12-03",age:70,gender:"M",mobile:"91238765",address:"Blk 72 Toa Payoh Lor 4 #06-18 S310072",stage:2,ncssRef:"NCSS-2026-017",dispatchDate:"2026-04-01",labRef:"",receivedDate:"",result:"",resultDate:"",notes:""},
  {id:18,name:"Fatimah Bte Yusuf",nric:"S****620L",dob:"1967-03-19",age:58,gender:"F",mobile:"94620831",address:"Blk 203 Tampines St 21 #11-04 S520203",stage:2,ncssRef:"NCSS-2026-018",dispatchDate:"2026-03-28",labRef:"",receivedDate:"",result:"",resultDate:"",notes:"Reminder SMS sent"},
  {id:19,name:"Aw Beng Tiong",nric:"S****702P",dob:"1956-11-27",age:69,gender:"M",mobile:"97020015",address:"Blk 180 Bedok North St 4 #10-23 S460180",stage:2,ncssRef:"NCSS-2026-019",dispatchDate:"2026-03-22",labRef:"",receivedDate:"",result:"",resultDate:"",notes:""},
  {id:20,name:"Chong Poh Hoon",nric:"S****818Q",dob:"1963-08-04",age:62,gender:"F",mobile:"98180772",address:"Blk 512 Yishun St 51 #03-201 S760512",stage:2,ncssRef:"NCSS-2026-020",dispatchDate:"2026-03-18",labRef:"",receivedDate:"",result:"",resultDate:"",notes:""},
  {id:21,name:"Balakrishnan s/o Muniandy",nric:"S****444R",dob:"1959-09-15",age:66,gender:"M",mobile:"94440891",address:"Blk 78 Circuit Rd #09-145 S370078",stage:2,ncssRef:"NCSS-2026-021",dispatchDate:"2026-03-15",labRef:"",receivedDate:"",result:"",resultDate:"",notes:"2nd reminder sent"},
  {id:22,name:"Chia Mui Lan",nric:"S****309S",dob:"1961-06-22",age:64,gender:"F",mobile:"93090218",address:"Blk 623 Ang Mo Kio Ave 5 #14-302 S560623",stage:2,ncssRef:"NCSS-2026-022",dispatchDate:"2026-03-10",labRef:"",receivedDate:"",result:"",resultDate:"",notes:""},
  {id:23,name:"Abdullah Bin Ramli",nric:"S****155T",dob:"1957-01-28",age:69,gender:"M",mobile:"81550933",address:"Blk 6 Eunos Cres #08-2844 S400006",stage:2,ncssRef:"NCSS-2026-023",dispatchDate:"2026-03-05",labRef:"",receivedDate:"",result:"",resultDate:"",notes:"Overdue — call patient"},
  {id:24,name:"Vanitha d/o Kumar",nric:"S****733U",dob:"1964-10-16",age:61,gender:"F",mobile:"97330144",address:"Blk 209 Toa Payoh Nth #06-412 S310209",stage:2,ncssRef:"NCSS-2026-024",dispatchDate:"2026-03-04",labRef:"",receivedDate:"",result:"",resultDate:"",notes:"Uncontactable — 3 attempts"},
  {id:25,name:"Yap Guan Seng",nric:"S****920V",dob:"1955-05-06",age:70,gender:"M",mobile:"91920338",address:"Blk 419 Jurong West Ave 1 #10-11 S640419",stage:2,ncssRef:"NCSS-2026-025",dispatchDate:"2026-03-02",labRef:"",receivedDate:"",result:"",resultDate:"",notes:"Very overdue"},

  // ── Stage 3 — Pending return kit to lab (14) ────────────────────────────
  // receivedDate spread: 3d to 40d ago (2026-03-10 to 2026-04-16)
  {id:26,name:"Rajesh Kumar",nric:"S****890C",dob:"1962-11-05",age:63,gender:"M",mobile:"93456789",address:"Blk 78 Jurong West St 42 #12-34 S640078",stage:3,ncssRef:"NCSS-2026-026",dispatchDate:"2026-04-01",labRef:"LAB-10050",receivedDate:"2026-04-16",result:"",resultDate:"",notes:""},
  {id:27,name:"Chan Soo Lin",nric:"S****345H",dob:"1963-12-25",age:62,gender:"F",mobile:"98901234",address:"Blk 67 Punggol Rd #09-12 S820067",stage:3,ncssRef:"NCSS-2026-027",dispatchDate:"2026-03-30",labRef:"LAB-10051",receivedDate:"2026-04-14",result:"",resultDate:"",notes:""},
  {id:28,name:"Ong Beng Kiat",nric:"S****177M",dob:"1959-07-14",age:66,gender:"M",mobile:"90177234",address:"Blk 33 Marine Parade Rd #02-05 S440033",stage:3,ncssRef:"NCSS-2026-028",dispatchDate:"2026-03-26",labRef:"LAB-10052",receivedDate:"2026-04-11",result:"",resultDate:"",notes:""},
  {id:29,name:"Madam Zainab Hussain",nric:"S****293N",dob:"1961-01-22",age:65,gender:"F",mobile:"92293041",address:"Blk 410 Yishun Ave 6 #08-31 S760410",stage:3,ncssRef:"NCSS-2026-029",dispatchDate:"2026-03-22",labRef:"LAB-10053",receivedDate:"2026-04-08",result:"",resultDate:"",notes:"Diabetic — flag for doctor"},
  {id:30,name:"Loh Chin Wah",nric:"S****854P",dob:"1964-09-09",age:61,gender:"M",mobile:"98854321",address:"Blk 55 Clementi Ave 2 #15-03 S120055",stage:3,ncssRef:"NCSS-2026-030",dispatchDate:"2026-03-20",labRef:"LAB-10054",receivedDate:"2026-04-05",result:"",resultDate:"",notes:""},
  {id:31,name:"Selvamary d/o Rajan",nric:"S****716Q",dob:"1966-04-30",age:59,gender:"F",mobile:"91716082",address:"Blk 9 Geylang Bahru #06-22 S330009",stage:3,ncssRef:"NCSS-2026-031",dispatchDate:"2026-03-17",labRef:"LAB-10055",receivedDate:"2026-04-02",result:"",resultDate:"",notes:""},
  {id:32,name:"Koh Teck Soon",nric:"S****428R",dob:"1957-10-11",age:68,gender:"M",mobile:"84428765",address:"Blk 141 Bukit Timah Rd #04-07 S590141",stage:3,ncssRef:"NCSS-2026-032",dispatchDate:"2026-03-14",labRef:"LAB-10056",receivedDate:"2026-03-30",result:"",resultDate:"",notes:""},
  {id:33,name:"Ang Poh Choo",nric:"S****562S",dob:"1960-06-18",age:65,gender:"F",mobile:"96562034",address:"Blk 88 Sengkang East Way #10-18 S540088",stage:3,ncssRef:"NCSS-2026-033",dispatchDate:"2026-03-10",labRef:"LAB-10057",receivedDate:"2026-03-27",result:"",resultDate:"",notes:""},
  {id:34,name:"Pereira Francisco",nric:"S****631W",dob:"1958-03-09",age:68,gender:"M",mobile:"96310447",address:"Blk 218 Pasir Ris St 21 #08-902 S510218",stage:3,ncssRef:"NCSS-2026-034",dispatchDate:"2026-03-07",labRef:"LAB-10058",receivedDate:"2026-03-24",result:"",resultDate:"",notes:"Lab backlog"},
  {id:35,name:"Tay Ai Lian",nric:"S****404X",dob:"1962-12-20",age:63,gender:"F",mobile:"84040929",address:"Blk 185 Bishan St 13 #04-336 S570185",stage:3,ncssRef:"NCSS-2026-035",dispatchDate:"2026-03-04",labRef:"LAB-10059",receivedDate:"2026-03-21",result:"",resultDate:"",notes:""},
  {id:36,name:"Ibrahim Bin Saleh",nric:"S****219Y",dob:"1955-08-02",age:70,gender:"M",mobile:"97190882",address:"Blk 17 Marsiling Ln #11-188 S730017",stage:3,ncssRef:"NCSS-2026-036",dispatchDate:"2026-03-01",labRef:"LAB-10060",receivedDate:"2026-03-18",result:"",resultDate:"",notes:"Lab queued"},
  {id:37,name:"Kalyani d/o Mohan",nric:"S****887Z",dob:"1960-07-25",age:65,gender:"F",mobile:"98870201",address:"Blk 76 Redhill Ln #03-442 S150076",stage:3,ncssRef:"NCSS-2026-037",dispatchDate:"2026-02-26",labRef:"LAB-10061",receivedDate:"2026-03-15",result:"",resultDate:"",notes:"Sample re-run requested"},
  {id:38,name:"Teo Chin Huat",nric:"S****543Q",dob:"1956-05-13",age:69,gender:"M",mobile:"81430995",address:"Blk 12 Bendemeer Rd #09-88 S330012",stage:3,ncssRef:"NCSS-2026-038",dispatchDate:"2026-02-22",labRef:"LAB-10062",receivedDate:"2026-03-12",result:"",resultDate:"",notes:"Overdue — chase lab"},
  {id:39,name:"Wong Ah Bee",nric:"S****166B",dob:"1954-10-30",age:71,gender:"F",mobile:"91660328",address:"Blk 201 Boon Lay Dr #02-14 S640201",stage:3,ncssRef:"NCSS-2026-039",dispatchDate:"2026-02-20",labRef:"LAB-10063",receivedDate:"2026-03-10",result:"",resultDate:"",notes:"Overdue"},

  // ── Stage 4 — Lab result (15) ───────────────────────────────────────────
  // Mix: 6 Negative, 4 Positive, 3 Inconclusive, 2 Withdrawn
  {id:40,name:"Lim Bee Choo",nric:"S****123D",dob:"1955-05-18",age:70,gender:"F",mobile:"94567890",address:"Blk 12 Toa Payoh Lorong 2 #03-05 S310012",stage:4,ncssRef:"NCSS-2026-040",dispatchDate:"2026-03-24",labRef:"LAB-10064",receivedDate:"2026-04-07",result:"Negative",resultDate:"2026-04-13",notes:"Normal. Re-screen in 1 year."},
  {id:41,name:"Ahmad Bin Yusof",nric:"S****456E",dob:"1960-09-30",age:65,gender:"M",mobile:"95678901",address:"Blk 56 Tampines St 21 #10-11 S520056",stage:4,ncssRef:"NCSS-2026-041",dispatchDate:"2026-03-12",labRef:"LAB-10065",receivedDate:"2026-03-23",result:"Positive",resultDate:"2026-03-29",notes:"Referred to polyclinic for colonoscopy."},
  {id:42,name:"Mdm Phua Geok Tin",nric:"S****039T",dob:"1956-03-25",age:70,gender:"F",mobile:"93039182",address:"Blk 6 Redhill Cl #07-12 S150006",stage:4,ncssRef:"NCSS-2026-042",dispatchDate:"2026-03-05",labRef:"LAB-10066",receivedDate:"2026-03-17",result:"Negative",resultDate:"2026-03-22",notes:"Normal. Re-screen in 1 year."},
  {id:43,name:"David Pereira",nric:"S****281U",dob:"1963-07-04",age:62,gender:"M",mobile:"91281047",address:"Blk 20 Serangoon Garden Way #01-05 S556020",stage:4,ncssRef:"NCSS-2026-043",dispatchDate:"2026-03-19",labRef:"LAB-10067",receivedDate:"2026-03-29",result:"Positive",resultDate:"2026-04-02",notes:"Referred for follow-up."},
  {id:44,name:"Madam Ho Siew Khim",nric:"S****374V",dob:"1958-11-13",age:67,gender:"F",mobile:"94374920",address:"Blk 303 Choa Chu Kang Ave 4 #08-09 S680303",stage:4,ncssRef:"NCSS-2026-044",dispatchDate:"2026-03-23",labRef:"LAB-10068",receivedDate:"2026-04-05",result:"Negative",resultDate:"2026-04-09",notes:"Normal."},
  {id:45,name:"Govindasamy s/o Nair",nric:"S****815W",dob:"1961-02-07",age:65,gender:"M",mobile:"98815034",address:"Blk 77 Little India Arc #03-11 S210077",stage:4,ncssRef:"NCSS-2026-045",dispatchDate:"2026-03-16",labRef:"LAB-10069",receivedDate:"2026-03-26",result:"Positive",resultDate:"2026-04-04",notes:"Urgent referral — colonoscopy booked."},
  {id:46,name:"Teo Lay Hoon",nric:"S****647X",dob:"1964-08-20",age:61,gender:"F",mobile:"92647813",address:"Blk 55 Ang Mo Kio St 44 #11-22 S560055",stage:4,ncssRef:"NCSS-2026-046",dispatchDate:"2026-03-02",labRef:"LAB-10070",receivedDate:"2026-03-11",result:"Negative",resultDate:"2026-03-14",notes:"Normal. Re-screen in 1 year."},
  {id:47,name:"Ismail Bin Hashim",nric:"S****903Y",dob:"1957-05-29",age:68,gender:"M",mobile:"97903456",address:"Blk 112 Yishun Ring Rd #06-05 S760112",stage:4,ncssRef:"NCSS-2026-047",dispatchDate:"2026-03-14",labRef:"LAB-10071",receivedDate:"2026-03-22",result:"Negative",resultDate:"2026-03-30",notes:""},
  {id:48,name:"Lily Tan Bee Lian",nric:"S****258Z",dob:"1959-12-01",age:66,gender:"F",mobile:"93258741",address:"Blk 18 Dover Rd #09-04 S130018",stage:4,ncssRef:"NCSS-2026-048",dispatchDate:"2026-03-18",labRef:"LAB-10072",receivedDate:"2026-03-24",result:"Positive",resultDate:"2026-04-03",notes:"Referred to SGH colorectal specialist."},
  // Inconclusive (3)
  {id:49,name:"Koh Beng Wah",nric:"S****055A",dob:"1958-02-14",age:68,gender:"M",mobile:"92050117",address:"Blk 88 Bukit Panjang Ring Rd #05-12 S670088",stage:4,ncssRef:"NCSS-2026-049",dispatchDate:"2026-03-10",labRef:"LAB-10073",receivedDate:"2026-03-22",result:"Inconclusive",resultDate:"2026-03-28",notes:"Insufficient sample — repeat kit sent."},
  {id:50,name:"Chandrika d/o Rao",nric:"S****472G",dob:"1963-11-11",age:62,gender:"F",mobile:"94720665",address:"Blk 7 Haig Rd #08-118 S430007",stage:4,ncssRef:"NCSS-2026-050",dispatchDate:"2026-03-25",labRef:"LAB-10074",receivedDate:"2026-04-08",result:"Inconclusive",resultDate:"2026-04-14",notes:"Repeat test requested."},
  {id:51,name:"Lee Ah Seng",nric:"S****338H",dob:"1956-07-09",age:69,gender:"M",mobile:"81380044",address:"Blk 144 Lor 2 Toa Payoh #09-1220 S310144",stage:4,ncssRef:"NCSS-2026-051",dispatchDate:"2026-02-28",labRef:"LAB-10075",receivedDate:"2026-03-16",result:"Inconclusive",resultDate:"2026-03-22",notes:"Contaminated sample — patient notified."},
  // Withdrawn (2)
  {id:52,name:"Goh Hock Seng",nric:"S****714J",dob:"1953-04-22",age:72,gender:"M",mobile:"91710933",address:"Blk 43 Holland Dr #05-442 S270043",stage:4,ncssRef:"NCSS-2026-052",dispatchDate:"2026-03-04",labRef:"",receivedDate:"",result:"Withdrawn",resultDate:"2026-03-28",notes:"[Withdrawn] Patient declined — prefers private screening."},
  {id:53,name:"Nurhayati Bte Salleh",nric:"S****926K",dob:"1959-12-18",age:66,gender:"F",mobile:"97260288",address:"Blk 101 Lor 1 Toa Payoh #14-801 S310101",stage:4,ncssRef:"NCSS-2026-053",dispatchDate:"2026-02-25",labRef:"",receivedDate:"",result:"Withdrawn",resultDate:"2026-03-18",notes:"[Withdrawn] Uncontactable after 4 reminder attempts."},
  // One more negative to round the stage to 15
  {id:54,name:"Ramasamy s/o Kuppan",nric:"S****683L",dob:"1961-06-03",age:64,gender:"M",mobile:"96830110",address:"Blk 260 Pasir Ris St 21 #11-337 S510260",stage:4,ncssRef:"NCSS-2026-054",dispatchDate:"2026-03-20",labRef:"LAB-10076",receivedDate:"2026-04-01",result:"Negative",resultDate:"2026-04-08",notes:"Normal."},
];

const STAGE_CSV_HEADERS={
  1:"NCSS Ref *,Full Name *,NRIC (masked),Date of Birth,Age *,Gender *,Mobile *,Home Address,Notes\ne.g. NCSS-2024-031,e.g. Tan Ah Kow,e.g. S****234A,YYYY-MM-DD,50-100,M or F,e.g. 91234567,Blk/Street/Unit,Any remarks",
  2:"NCSS Ref *,Dispatch Date *,Notes\ne.g. NCSS-2024-001,YYYY-MM-DD,Any remarks",
  3:"NCSS Ref *,Lab Reference *,Date Kit Received *,Notes\ne.g. NCSS-2024-001,e.g. LAB-10025,YYYY-MM-DD,Any remarks",
  4:"NCSS Ref *,Result *,Result Date *,Notes\ne.g. NCSS-2024-001,Negative or Positive or Inconclusive or Withdrawn,YYYY-MM-DD,Any remarks",
};
const STAGE_CSV_NAMES={1:"FIT_Stage1_NCSS.csv",2:"FIT_Stage2_Dispatch.csv",3:"FIT_Stage3_Lab.csv",4:"FIT_Stage4_Result.csv"};

function normalise(h){return String(h).toLowerCase().replace(/[^a-z0-9]/g,"");}

// Compute age from DOB (YYYY-MM-DD). Returns "" if DOB invalid/missing.
function ageFromDob(dob){
  if(!dob) return "";
  const d=new Date(dob); if(isNaN(d)) return "";
  const now=new Date();
  let a=now.getFullYear()-d.getFullYear();
  const m=now.getMonth()-d.getMonth();
  if(m<0||(m===0&&now.getDate()<d.getDate())) a--;
  return a>=0 && a<130 ? a : "";
}

// SG mobile: exactly 8 digits, starting with 6, 8 or 9. Rejects "+" / country codes / spaces etc.
function isValidSgMobile(v){
  if(v==null) return false;
  const s=String(v).trim();
  return /^[689]\d{7}$/.test(s);
}

const HEADER_MAP={ncssref:"ncssRef",fullname:"name",nricmasked:"nric",nric:"nric",dateofbirth:"dob",dob:"dob",age:"age",gender:"gender",sex:"gender",mobile:"mobile",homeaddress:"address",address:"address",stage:"stage",dispatchdate:"dispatchDate",labreference:"labRef",labref:"labRef",datekitreceived:"receivedDate",datereceived:"receivedDate",result:"result",resultdate:"resultDate",notes:"notes"};

const STAGE_REQUIRED={1:["ncssref","fullname","age","gender","mobile"],2:["ncssref","dispatchdate"],3:["ncssref","labreference","datekitreceived"],4:["ncssref","result","resultdate"]};

function Field({label,value,onChange,type="text",readOnly=false,children}){
  const s={display:"flex",flexDirection:"column",gap:3};
  const ls={fontSize:11,fontWeight:700,color:TXM};
  const is={border:`1px solid ${BR}`,borderRadius:4,padding:"6px 8px",fontSize:12,color:TX,width:"100%",background:readOnly?"#f5f3fb":"#fff",cursor:readOnly?"default":"text",fontFamily:FONT};
  return <div style={s}><label style={ls}>{label}</label>{children||<input type={type} value={value||""} onChange={readOnly?undefined:e=>onChange(e.target.value)} readOnly={readOnly} style={is}/>}</div>;
}

function Row({children,gap=10}){return <div style={{display:"flex",gap,flexWrap:"wrap"}}>{children}</div>;}

function ErrorText({msg}){
  if(!msg) return null;
  return <div style={{color:"#791F1F",fontSize:11,marginTop:-2,fontWeight:600}}>⚠ {msg}</div>;
}

export default function App(){
  const [patients,setPatients]=useState(INIT_PATIENTS);
  const [archived,setArchived]=useState([
    {id:901,name:"Chua Beng Hock",nric:"S****312J",dob:"1958-04-10",age:67,gender:"M",mobile:"91234001",address:"Blk 45 Bishan St 22 #08-12 S570045",stage:4,ncssRef:"NCSS-2025-101",dispatchDate:"2025-10-05",labRef:"LAB-20001",receivedDate:"2025-10-18",result:"Negative",resultDate:"2025-10-25",notes:"Normal. Re-screen in 1 year.",archivedAt:"2025-11-01",archiveNote:"Closed — follow-up not required."},
    {id:902,name:"Rohani Bte Samad",nric:"S****567K",dob:"1961-09-22",age:63,gender:"F",mobile:"92345002",address:"Blk 12 Tampines St 11 #05-88 S520012",stage:4,ncssRef:"NCSS-2025-102",dispatchDate:"2025-10-08",labRef:"LAB-20002",receivedDate:"2025-10-20",result:"Positive",resultDate:"2025-10-28",notes:"Referred to polyclinic for colonoscopy.",archivedAt:"2025-11-03",archiveNote:"Referral letter issued to patient."},
    {id:903,name:"Tan Chee Keong",nric:"S****891M",dob:"1955-07-14",age:69,gender:"M",mobile:"93456003",address:"Blk 88 Jurong West Ave 5 #11-03 S640088",stage:4,ncssRef:"NCSS-2025-103",dispatchDate:"2025-10-12",labRef:"LAB-20003",receivedDate:"2025-10-26",result:"Negative",resultDate:"2025-11-02",notes:"Normal.",archivedAt:"2025-11-10",archiveNote:""},
    {id:904,name:"Lim Geok Hwa",nric:"S****234N",dob:"1963-02-28",age:62,gender:"F",mobile:"94567004",address:"Blk 201 Hougang Ave 7 #03-44 S530201",stage:4,ncssRef:"NCSS-2025-104",dispatchDate:"2025-09-20",labRef:"LAB-20004",receivedDate:"2025-10-05",result:"Inconclusive",resultDate:"2025-10-12",notes:"Insufficient sample — repeat kit dispatched.",archivedAt:"2025-11-12",archiveNote:"Repeat kit sent under new NCSS ref NCSS-2026-031."},
    {id:905,name:"Subramaniam s/o Rajan",nric:"S****678P",dob:"1957-11-03",age:67,gender:"M",mobile:"95678005",address:"Blk 34 Serangoon Ave 3 #09-22 S550034",stage:4,ncssRef:"NCSS-2025-105",dispatchDate:"2025-09-25",labRef:"LAB-20005",receivedDate:"2025-10-10",result:"Positive",resultDate:"2025-10-18",notes:"Urgent referral — colonoscopy booked at SGH.",archivedAt:"2025-11-15",archiveNote:"SGH appointment confirmed 2025-12-02."},
    {id:906,name:"Wong Siew Fong",nric:"S****023Q",dob:"1960-06-17",age:64,gender:"F",mobile:"96789006",address:"Blk 77 Clementi Ave 4 #06-15 S120077",stage:4,ncssRef:"NCSS-2025-106",dispatchDate:"2025-08-14",labRef:"",receivedDate:"",result:"Withdrawn",resultDate:"2025-09-01",notes:"[Withdrawn] Uncontactable after 4 attempts.",archivedAt:"2025-11-18",archiveNote:"Case closed — no response."},
    {id:907,name:"Ng Boon Teck",nric:"S****456R",dob:"1956-03-09",age:69,gender:"M",mobile:"97890007",address:"Blk 5 Toa Payoh Lor 6 #12-01 S310005",stage:4,ncssRef:"NCSS-2025-107",dispatchDate:"2025-10-18",labRef:"LAB-20007",receivedDate:"2025-11-02",result:"Negative",resultDate:"2025-11-09",notes:"Normal. Re-screen in 1 year.",archivedAt:"2025-11-20",archiveNote:""},
    {id:908,name:"Fatimah Bte Ibrahim",nric:"S****789S",dob:"1964-08-31",age:60,gender:"F",mobile:"98901008",address:"Blk 303 Woodlands Ave 5 #10-44 S730303",stage:4,ncssRef:"NCSS-2025-108",dispatchDate:"2025-10-22",labRef:"LAB-20008",receivedDate:"2025-11-05",result:"Negative",resultDate:"2025-11-12",notes:"Normal.",archivedAt:"2025-11-25",archiveNote:"Closed — annual re-screen reminder set."},
    {id:909,name:"Gopal s/o Krishnan",nric:"S****112T",dob:"1959-12-20",age:65,gender:"M",mobile:"90123009",address:"Blk 18 Little India Cres #04-08 S210018",stage:4,ncssRef:"NCSS-2025-109",dispatchDate:"2025-11-01",labRef:"LAB-20009",receivedDate:"2025-11-14",result:"Inconclusive",resultDate:"2025-11-20",notes:"Contaminated sample — patient notified.",archivedAt:"2025-12-01",archiveNote:"Repeat screening to be arranged via new referral."},
    {id:910,name:"Teo Lay Keng",nric:"S****345U",dob:"1962-05-05",age:62,gender:"F",mobile:"91234010",address:"Blk 90 Pasir Ris Dr 3 #07-22 S510090",stage:4,ncssRef:"NCSS-2025-110",dispatchDate:"2025-11-05",labRef:"LAB-20010",receivedDate:"2025-11-18",result:"Positive",resultDate:"2025-11-25",notes:"Referred to polyclinic. Family history of CRC noted.",archivedAt:"2025-12-05",archiveNote:"Follow-up referral sent to Tampines Polyclinic."},
  ]); // archived Stage-4 patients
  const [nextId,setNextId]=useState(55);
  const [activeStage,setActiveStage]=useState(0);
  const [activeFilter,setActiveFilter]=useState(null);// null | "positive"
  const [search,setSearch]=useState("");
  const [editModal,setEditModal]=useState(null);// {patient}
  const [advModal,setAdvModal]=useState(null);// {patient,toStage}
  const [withdrawModal,setWithdrawModal]=useState(null);// {patient}
  const [archiveModal,setArchiveModal]=useState(null);// {patient}
  const [archiveListOpen,setArchiveListOpen]=useState(false);// archive listing modal
  const [archiveView,setArchiveView]=useState({search:"",resultFilter:"",dateFrom:"",dateTo:"",page:1});// filters/pagination for archive modal
  const [expandedStages,setExpandedStages]=useState({});// {1:true} = Stage 1 showing all rows
  const [uploadModal,setUploadModal]=useState(null);// {stageId}
  const [uploadState,setUploadState]=useState({preview:null,errors:null,parsedRows:null});

  // Load Inter font once on mount (idempotent)
  useEffect(()=>{
    const id="inter-font-loader";
    if(document.getElementById(id)) return;
    const l=document.createElement("link");
    l.id=id;
    l.rel="stylesheet";
    l.href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(l);
  },[]);

  const filtered=useMemo(()=>{
    const t=search.trim().toLowerCase();
    if(!t) return patients;
    const digitsOnly=t.replace(/[^0-9]/g,"");
    return patients.filter(p=>
      p.name.toLowerCase().includes(t) ||
      p.ncssRef.toLowerCase().includes(t) ||
      (digitsOnly && (p.mobile||"").includes(digitsOnly))
    );
  },[patients,search]);

  const stageCount=s=>patients.filter(p=>p.stage===s).length;

  // ── Advance
  function advanceOne(p){setAdvModal({patient:p,toStage:p.stage+1,form:{dispatchDate:today(),labRef:"",receivedDate:today(),result:"",resultDate:today(),notes:p.notes||""}});}

  function today(){return new Date().toISOString().split("T")[0];}

  function saveAdvance(){
    const {patient,toStage,form}=advModal;
    if(toStage===2&&!form.dispatchDate){alert("Dispatch date required.");return;}
    if(toStage===3&&!form.labRef){alert("Lab reference required.");return;}
    if(toStage===4&&!form.result){alert("Result required.");return;}
    setPatients(ps=>ps.map(p=>p.id===patient.id?{...p,...(toStage===2?{dispatchDate:form.dispatchDate}:toStage===3?{labRef:form.labRef,receivedDate:form.receivedDate}:{result:form.result,resultDate:form.resultDate,labRef:form.labRef||p.labRef}),notes:form.notes,stage:toStage}:p));
    setAdvModal(null);
  }

  // Withdraw — moves patient to Stage 4, sets result="Withdrawn"
  function saveWithdraw(){
    const {patient,reason}=withdrawModal;
    setPatients(ps=>ps.map(p=>p.id===patient.id?{...p,stage:4,result:"Withdrawn",resultDate:today(),notes:reason?`[Withdrawn] ${reason}${p.notes?" — "+p.notes:""}`:(p.notes||"[Withdrawn]")}:p));
    setWithdrawModal(null);
  }

  // Archive — removes patient from active list, moves to archive with archivedAt date
  function saveArchive(){
    const {patient,note}=archiveModal;
    setPatients(ps=>ps.filter(p=>p.id!==patient.id));
    setArchived(a=>[{...patient,archivedAt:today(),archiveNote:note||""},...a]);
    setArchiveModal(null);
  }



  function saveEdit(){
    const {patient,form}=editModal;
    const errors={};

    if(patient.stage===1){
      if(!form.name||!form.name.trim()) errors.name="Full Name is required.";
      if(!form.mobile||!form.mobile.trim()) errors.mobile="Phone number is required.";
      else if(!isValidSgMobile(form.mobile)) errors.mobile="Must be 8 digits starting with 6, 8 or 9. No '+' or country code.";
      if(form.dob){
        const a=ageFromDob(form.dob);
        if(a==="") errors.dob="Invalid date of birth.";
        else if(a<50||a>100) errors.dob="Age (from DOB) must be 50–100.";
      }
      if(!form.gender||!["M","F"].includes(form.gender)) errors.gender="Gender must be M or F.";
    }
    if(patient.stage===2){
      if(!form.dispatchDate) errors.dispatchDate="Kit Dispatch Date is required.";
    }
    if(patient.stage===3){
      if(!form.labRef||!form.labRef.trim()) errors.labRef="Lab Reference is required.";
      if(!form.receivedDate) errors.receivedDate="Lab Received Date is required.";
    }
    if(patient.stage===4){
      if(!form.result) errors.result="Result is required.";
      if(!form.resultDate) errors.resultDate="Result Date is required.";
    }

    if(Object.keys(errors).length){
      setEditModal(m=>({...m,errors}));
      return;
    }

    setPatients(ps=>ps.map(p=>{
      if(p.id!==patient.id)return p;
      if(p.stage===1){
        const age=ageFromDob(form.dob);
        return {...p,name:form.name||p.name,age:age===""?p.age:age,nric:form.nric,gender:form.gender,dob:form.dob,mobile:form.mobile,address:form.address,notes:form.notes};
      }
      if(p.stage===2)return {...p,dispatchDate:form.dispatchDate,notes:form.notes};
      if(p.stage===3)return {...p,labRef:form.labRef,receivedDate:form.receivedDate,notes:form.notes};
      if(p.stage===4)return {...p,result:form.result,resultDate:form.resultDate,notes:form.notes};
      return p;
    }));
    setEditModal(null);
  }

  // ── Export CSV
  function exportCSV(){
    const hdr=["NCSS Ref","Patient Name","Mobile","Stage","Dispatch Date","Lab Ref","Date Received","Result","Result Date","Notes"];
    const rows=patients.map(p=>[p.ncssRef,p.name,p.mobile,p.stage,p.dispatchDate||"",p.labRef||"",p.receivedDate||"",p.result||"",p.resultDate||"",'"'+(p.notes||"").replace(/"/g,'""')+'"']);
    const csv=[hdr,...rows].map(r=>r.join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.setAttribute("download","fit_kit_tracker.csv");a.style.display="none";
    document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(url);document.body.removeChild(a);},200);
  }

  // Open archive modal with fresh view state
  function openArchive(){
    setArchiveView({search:"",resultFilter:"",dateFrom:"",dateTo:"",page:1});
    setArchiveListOpen(true);
  }

  // Export the CURRENTLY FILTERED archive rows
  function exportArchiveCSV(rows){
    const hdr=["NCSS Ref","Patient Name","Phone","Result","Result Date","Archived On","Archive Note"];
    const body=rows.map(p=>[p.ncssRef,p.name,p.mobile,p.result||"",p.resultDate||"",p.archivedAt||"",'"'+(p.archiveNote||"").replace(/"/g,'""')+'"']);
    const csv=[hdr,...body].map(r=>r.join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.setAttribute("download",`fit_kit_archive_${today()}.csv`);a.style.display="none";
    document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(url);document.body.removeChild(a);},200);
  }

  // ── Download CSV template
  function downloadTemplate(stageId){
    const csv=STAGE_CSV_HEADERS[stageId];
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.setAttribute("download",STAGE_CSV_NAMES[stageId]);a.style.display="none";
    document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(url);document.body.removeChild(a);},200);
  }

  // ── Upload / parse CSV
  function handleFile(file,stageId){
    if(!file.name.toLowerCase().endsWith(".csv")){setUploadState({errors:[{type:"format",msg:"Please upload a .csv file. Download the template, fill it in Excel, then File → Save As → CSV."}],preview:null,parsedRows:null});return;}
    const reader=new FileReader();
    reader.onload=e=>{
      const text=e.target.result;
      const rows=text.split(/\r?\n/).map(r=>{
        const cells=[];let cur="",inQ=false;
        for(const ch of r){if(ch==='"'){inQ=!inQ;}else if(ch===","&&!inQ){cells.push(cur.trim());cur="";}else cur+=ch;}
        cells.push(cur.trim());return cells;
      }).filter(r=>r.some(c=>c.trim()!==""));

      const reqCols=STAGE_REQUIRED[stageId]||STAGE_REQUIRED[1];
      let headerIdx=-1;
      for(let i=0;i<Math.min(rows.length,10);i++){
        const norm=rows[i].map(normalise);
        if(reqCols.every(req=>norm.some(n=>n.includes(req)))){headerIdx=i;break;}
      }
      if(headerIdx<0){setUploadState({errors:[{type:"format",msg:`Wrong template for Stage ${stageId}. Please download the correct Stage ${stageId} template.`}],preview:null,parsedRows:null});return;}

      const normHeaders=rows[headerIdx].map(normalise);
      const colIdx={};
      normHeaders.forEach((nh,i)=>{for(const[k,v]of Object.entries(HEADER_MAP)){if(nh.includes(k)&&!colIdx[v])colIdx[v]=i;}});

      let dataStart=headerIdx+1;
      if(dataStart<rows.length){const nr=rows[dataStart].join(" ").toLowerCase();if(nr.includes("e.g")||nr.includes("yyyy"))dataStart++;}

      const dataRows=rows.slice(dataStart).filter(r=>r.some(c=>c.trim()!==""));
      if(!dataRows.length){setUploadState({errors:[{type:"format",msg:"No patient data found. Fill in at least one row below the header."}],preview:null,parsedRows:null});return;}

      const get=(r,field)=>colIdx[field]!=null?String(r[colIdx[field]]??"").trim():"";
      const parsed=[];const errors=[];

      dataRows.forEach((r,idx)=>{
        const rowNum=dataStart+idx+1;
        const ncssRef=get(r,"ncssRef");
        if(!ncssRef){errors.push({type:"field",msg:`Row ${rowNum}: NCSS Ref required`});return;}

        if(stageId===1){
          const name=get(r,"name"),ageRaw=get(r,"age"),gender=get(r,"gender").toUpperCase(),mobile=get(r,"mobile");
          const errs=[];
          if(!name)errs.push("Full Name required");
          const age=parseInt(ageRaw);
          if(!ageRaw)errs.push("Age required");else if(isNaN(age))errs.push("Age must be a number");else if(age<50||age>100)errs.push("Age must be 50–100");
          if(!gender)errs.push("Gender required");else if(!["M","F"].includes(gender))errs.push("Gender must be M or F");
          if(!mobile)errs.push("Mobile required");else if(!/^[689]\d{7}$/.test(mobile.replace(/\s/g,"")))errs.push("Invalid SG mobile number");
          if(patients.some(p=>p.ncssRef===ncssRef))errs.push(`NCSS Ref "${ncssRef}" already exists in portal`);
          if(parsed.some(p=>p.ncssRef===ncssRef))errs.push(`NCSS Ref "${ncssRef}" duplicated in file`);
          if(errs.length){errors.push({type:"field",msg:`Row ${rowNum} (${name||ncssRef}): ${errs.join("; ")}`});return;}
          parsed.push({id:0,name,ncssRef,nric:get(r,"nric"),dob:get(r,"dob"),age,gender,mobile:mobile.replace(/\s/g,""),address:get(r,"address"),stage:1,dispatchDate:"",labRef:"",receivedDate:"",result:"",resultDate:"",notes:get(r,"notes")});
        } else {
          const existing=patients.find(p=>p.ncssRef===ncssRef);
          const errs=[];
          if(!existing)errs.push(`NCSS Ref "${ncssRef}" not found in portal`);
          // Change 1: patient must be in the PREVIOUS stage to be advanced via CSV
          else if(existing.stage!==stageId-1)errs.push(`NCSS Ref "${ncssRef}" is currently in Stage ${existing.stage} — must be in Stage ${stageId-1} to advance to Stage ${stageId}`);
          if(stageId===2){
            const dispatchDate=get(r,"dispatchDate");
            if(!dispatchDate)errs.push("Dispatch Date required");
            if(errs.length){errors.push({type:existing?"field":"ncss",msg:`Row ${rowNum} (${ncssRef}): ${errs.join("; ")}`});return;}
            // Change 2: include stage:2 so patient moves out of Stage 1
            parsed.push({_patch:true,ncssRef,stage:2,dispatchDate,notes:get(r,"notes")});
          } else if(stageId===3){
            const labRef=get(r,"labRef"),receivedDate=get(r,"receivedDate");
            if(!labRef)errs.push("Lab Reference required");
            if(!receivedDate)errs.push("Date Kit Received required");
            if(errs.length){errors.push({type:existing?"field":"ncss",msg:`Row ${rowNum} (${ncssRef}): ${errs.join("; ")}`});return;}
            // Change 2: include stage:3 so patient moves out of Stage 2
            parsed.push({_patch:true,ncssRef,stage:3,labRef,receivedDate,notes:get(r,"notes")});
          } else if(stageId===4){
            const result=get(r,"result"),resultDate=get(r,"resultDate");
            if(!result)errs.push("Result required");
            else if(!["Negative","Positive","Inconclusive","Withdrawn"].includes(result))errs.push("Result must be Negative, Positive, Inconclusive or Withdrawn");
            if(!resultDate)errs.push("Result Date required");
            if(errs.length){errors.push({type:existing?"field":"ncss",msg:`Row ${rowNum} (${ncssRef}): ${errs.join("; ")}`});return;}
            // Change 2: include stage:4 so patient moves out of Stage 3
            parsed.push({_patch:true,ncssRef,stage:4,result,resultDate,notes:get(r,"notes")});
          }
        }
      });

      if(errors.length){setUploadState({errors,preview:null,parsedRows:null});return;}
      setUploadState({errors:null,preview:parsed,parsedRows:parsed});
    };
    reader.readAsText(file);
  }

  function confirmUpload(stageId){
    const {parsedRows}=uploadState;
    let nid=nextId;
    setPatients(ps=>{
      let updated=[...ps];
      parsedRows.forEach(row=>{
        if(row._patch){
          const i=updated.findIndex(p=>p.ncssRef===row.ncssRef);
          if(i>=0){
            const prior=updated[i];
            // Change 3: merge notes (append) rather than overwrite, preserve all prior stage fields
            const mergedNotes=row.notes
              ?(prior.notes?prior.notes+" | "+row.notes:row.notes)
              :prior.notes;
            updated[i]={...prior,...row,notes:mergedNotes};
          }
        }
        else{updated=[...updated,{...row,id:nid++}];}
      });
      return updated;
    });
    setNextId(nid);
    setUploadModal(null);setUploadState({preview:null,errors:null,parsedRows:null});
  }

  // ── Render helpers
  const stageColors={1:"#185FA5",2:"#854F0B",3:"#0F6E56",4:"#4B2D83"};
  const stagesToShow=activeStage?STAGES.filter(s=>s.id===activeStage):STAGES;

  const btnS={background:P,color:"#fff",border:"none",padding:"7px 14px",borderRadius:4,cursor:"pointer",fontSize:12,fontWeight:700};
  const btnOl={background:"#fff",color:P,border:`1.5px solid ${BR}`,padding:"7px 14px",borderRadius:4,cursor:"pointer",fontSize:12,fontWeight:700};
  const actBtn=(extra={})=>({background:"none",border:`0.5px solid ${BR}`,borderRadius:4,padding:"3px 8px",fontSize:11,cursor:"pointer",color:TXM,...extra});
  const advBtn={background:P,color:"#fff",border:`1px solid ${P}`,borderRadius:4,padding:"3px 8px",fontSize:11,cursor:"pointer"};

  function ResultBadge({result}){
    if(!result)return <span style={{background:"#FAEEDA",color:"#633806",fontSize:10,padding:"2px 8px",borderRadius:10,fontWeight:600}}>Pending</span>;
    // Colour scheme: Positive red, Negative green, Inconclusive amber, Withdrawn neutral grey
    const styles={
      Positive:    {bg:"#FCEBEB", fg:"#791F1F", br:"#F09595"},
      Negative:    {bg:"#EAF3DE", fg:"#27500A", br:"#97C459"},
      Inconclusive:{bg:"#FFF4D6", fg:"#7A5200", br:"#E6B84D"},
      Withdrawn:   {bg:"#EEEEEE", fg:"#555555", br:"#BBBBBB"},
    };
    const s=styles[result]||{bg:"#EEEEEE",fg:"#555",br:"#BBB"};
    return <span style={{background:s.bg,color:s.fg,border:`1px solid ${s.br}`,fontSize:10,padding:"2px 8px",borderRadius:10,fontWeight:700,whiteSpace:"nowrap"}}>{result}</span>;
  }

  // ── Days pending in CURRENT stage only (not cumulative from Stage 1)
  // Stage 1: no entry timestamp recorded → "—"
  // Stage 2: days since dispatchDate (time in Stage 2 waiting for kit return)
  // Stage 3: days since receivedDate (time in Stage 3 waiting for lab result)
  // Stage 4: result is recorded → no longer pending → "—"
  function daysPending(p){
    if(p.stage===1) return null;
    if(p.stage===4) return null; // result is in, patient flow complete
    const entryDate = p.stage===2 ? p.dispatchDate
                    : p.stage===3 ? p.receivedDate
                    : null;
    if(!entryDate) return null;
    const diff=Math.floor((Date.now()-new Date(entryDate).getTime())/86400000);
    return isNaN(diff)||diff<0 ? null : diff;
  }

  return (
    <div style={{fontFamily:FONT,background:BG,color:TX,fontSize:13,minHeight:"100vh"}}>
      {/* Header */}
      <header style={{background:"#fff",borderBottom:`1px solid ${BR}`,padding:"0 20px",display:"flex",alignItems:"stretch",justifyContent:"space-between",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src="/scs-logo.png" alt="Singapore Cancer Society" style={{height:40,width:"auto",objectFit:"contain"}}/>
            <div><div style={{fontSize:15,fontWeight:700,color:TX}}>Singapore Cancer Society</div><div style={{fontSize:10,color:TXL}}>Minimising Cancer, Maximising Lives</div></div>
          </div>
          <div style={{width:1,background:BR,margin:"10px 0"}}/>
          <div style={{paddingLeft:14}}><span style={{fontSize:12,color:TXM,fontWeight:600,display:"block"}}>FIT Kit Tracker</span><small style={{fontSize:10,color:TXL}}>Faecal Immunochemical Test — Colorectal Cancer Screening</small></div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",padding:"12px 0"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patient name or phone..." style={{border:`1px solid ${BR}`,borderRadius:4,padding:"6px 10px",fontSize:12,width:220,background:"#fff",color:TX}}/>
          <button style={btnOl} onClick={openArchive}>Archive ({archived.length})</button>
          <button style={btnOl} onClick={exportCSV}>Export CSV</button>
        </div>
      </header>

      {/* Pipeline */}
      <div style={{background:"#fff",padding:"14px 20px 10px",borderBottom:`1px solid ${BR}`}}>
        <div style={{display:"flex",alignItems:"stretch",gap:6,overflowX:"auto"}}>
          {STAGES.map((s,idx)=>{
            const active=activeStage===s.id;
            const count=stageCount(s.id);
            return (
              <div key={s.id} style={{display:"flex",alignItems:"stretch",flex:1,minWidth:200,gap:6}}>
                <div
                  onClick={()=>{setActiveStage(active?0:s.id);setActiveFilter(null);}}
                  style={{
                    flex:1,
                    display:"flex",
                    alignItems:"center",
                    gap:14,
                    padding:"14px 16px",
                    cursor:"pointer",
                    borderRadius:10,
                    background: active ? s.light : LAV2,
                    border: active ? `1px solid ${s.color}` : `1px solid ${BR}`,
                    transition:"background .15s, border-color .15s",
                    position:"relative",
                    overflow:"hidden",
                  }}
                  onMouseEnter={e=>{if(!active)e.currentTarget.style.background=LAV;}}
                  onMouseLeave={e=>{if(!active)e.currentTarget.style.background=LAV2;}}
                >
                  {/* Accent color bar on left */}
                  <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:s.color}}/>
                  {/* Label */}
                  <div style={{flex:1,minWidth:0,paddingLeft:4}}>
                    <div style={{fontSize:13,fontWeight:700,color:active?s.color:TX,lineHeight:1.25,letterSpacing:.1}}>{s.label}</div>
                  </div>
                  {/* Count pill */}
                  <div
                    style={{
                      flexShrink:0,
                      minWidth:44,
                      height:44,
                      padding:"0 10px",
                      borderRadius:22,
                      background: active ? s.color : `${s.color}22`,
                      color: active ? "#fff" : s.color,
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center",
                      fontSize:20,
                      fontWeight:800,
                      lineHeight:1,
                      boxShadow: active ? "0 2px 8px rgba(0,0,0,.15)" : "none",
                      transition:"background .15s",
                    }}
                  >{count}</div>
                </div>
                {/* Chevron separator between stages (not after the last) */}
                {idx<STAGES.length-1 && (
                  <div style={{display:"flex",alignItems:"center",color:TXL,fontSize:20,fontWeight:300,userSelect:"none"}}>›</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div style={{padding:"12px 20px 16px",background:"#fff",borderBottom:`1px solid ${BR}`}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"stretch"}}>
          {(()=>{
            const archiveCount=archived.length;
            const activeTotal=patients.length;
            const awaitingResult=patients.filter(p=>p.stage<4).length;
            const positiveResult=patients.filter(p=>p.result==="Positive").length;
            const otherResult=patients.filter(p=>["Negative","Inconclusive","Withdrawn"].includes(p.result)).length;

            const rollupTiles=[
              {n:archiveCount,l:"Archive",kind:"rollup",onClick:openArchive,clickable:true},
              {n:activeTotal,l:"Active test",kind:"rollup"},
            ];
            const breakdownTiles=[
              {n:awaitingResult,l:"Awaiting result"},
              {
                n:positiveResult,
                l:"Positive result",
                accent:"#C0392B",
                onClick:()=>{
                  if(activeFilter==="positive"){setActiveFilter(null);}
                  else{setActiveFilter("positive");setActiveStage(0);}
                },
                clickable:true,
                active:activeFilter==="positive",
              },
              {n:otherResult,l:"Other result"},
            ];

            const renderTile=(s)=>{
              const isActive=s.active;
              const baseBg = s.kind==="rollup" ? LAV : LAV2;
              const baseBorder = s.kind==="rollup" ? BR : `${BR}99`;
              return (
                <div
                  key={s.l}
                  onClick={s.onClick}
                  style={{
                    background: isActive ? P : baseBg,
                    border:`1px solid ${isActive ? P : baseBorder}`,
                    borderRadius:8,
                    padding:"10px 14px",
                    minWidth:110,
                    textAlign:"center",
                    flex:"1 1 auto",
                    cursor: s.clickable ? "pointer" : "default",
                    transition: "background .15s, border-color .15s",
                    boxShadow: isActive ? "0 2px 8px rgba(75,45,131,.25)" : "none",
                  }}
                  onMouseEnter={s.clickable && !isActive ? e=>{e.currentTarget.style.background=LAV;} : undefined}
                  onMouseLeave={s.clickable && !isActive ? e=>{e.currentTarget.style.background=baseBg;} : undefined}
                >
                  <div style={{fontSize:22,fontWeight:800,color: isActive ? "#fff" : (s.accent||TX),lineHeight:1}}>{s.n}</div>
                  <div style={{fontSize:10,color: isActive ? "rgba(255,255,255,.8)" : TXM,marginTop:4,textTransform:"uppercase",letterSpacing:.4,fontWeight:s.kind==="rollup"?700:500}}>{s.l}</div>
                </div>
              );
            };

            return (
              <>
                {rollupTiles.map(renderTile)}
                {/* visual divider between rollups and breakdowns */}
                <div style={{width:1,background:BR,margin:"4px 4px"}} aria-hidden/>
                {breakdownTiles.map(renderTile)}
              </>
            );
          })()}
        </div>
      </div>

      {/* Main table */}
      <div style={{padding:"16px 20px"}}>
        {activeFilter==="positive" && (
          <div style={{
            background:"#FCEBEB",
            border:"1px solid #F09595",
            borderRadius:8,
            padding:"10px 14px",
            marginBottom:10,
            display:"flex",
            alignItems:"center",
            justifyContent:"space-between",
            flexWrap:"wrap",
            gap:8,
          }}>
            <div style={{display:"flex",alignItems:"center",gap:10,fontSize:12}}>
              <span style={{background:"#791F1F",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:10,letterSpacing:.4,textTransform:"uppercase"}}>Filter</span>
              <span style={{color:"#791F1F",fontWeight:700}}>Positive Result</span>
              <span style={{color:TXM,fontSize:11}}>— sorted by result date, latest first</span>
            </div>
            <span
              onClick={()=>setActiveFilter(null)}
              style={{color:"#791F1F",fontSize:11,fontWeight:700,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2}}
            >✕ Clear filter</span>
          </div>
        )}
        <div style={{background:"#fff",border:`0.5px solid ${BR}`,borderRadius:8,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",tableLayout:"fixed"}}>
            <colgroup>
              <col style={{width:130}}/>{/* Refer ID */}
              <col style={{width:170}}/>{/* Patient Name */}
              <col style={{width:100}}/>{/* Phone */}
              <col style={{width:115}}/>{/* Kit Dispatch Date */}
              <col style={{width:115}}/>{/* Lab Received Date */}
              <col style={{width:115}}/>{/* Lab Result Date */}
              <col style={{width:105}}/>{/* Result */}
              <col/>{/* Notes */}
              <col style={{width:100}}/>{/* Days Pending */}
              <col style={{width:110}}/>{/* Actions */}
            </colgroup>
            <thead>
              <tr style={{background:LAV2}}>
                {["Refer ID","Patient Name","Phone","Kit Dispatch Date","Lab Received Date","Lab Result Date","Result","Notes","Days Pending","Actions"].map(h=>(
                  <th key={h} style={{color:TXM,fontSize:11,fontWeight:700,padding:"8px 12px",textAlign:"left",borderBottom:`1px solid ${BR}`,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeFilter==="positive" ? (()=>{
                // Positive-only view: sort by resultDate desc (latest first)
                const pos=filtered.filter(p=>p.result==="Positive").sort((a,b)=>{
                  const da=a.resultDate||"", db=b.resultDate||"";
                  if(da===db) return 0;
                  return db.localeCompare(da);
                });
                if(!pos.length) return (
                  <tr><td colSpan={10} style={{textAlign:"center",padding:"40px 20px",color:TXL}}>No positive results{search?" match the current search":""}.</td></tr>
                );
                return pos.map(p=>(
                  <tr
                    key={p.id}
                    onClick={()=>setEditModal({patient:p,form:{...p},errors:{}})}
                    style={{borderBottom:`0.5px solid ${BR}`,cursor:"pointer"}}
                    onMouseEnter={e=>e.currentTarget.style.background=LAV2}
                    onMouseLeave={e=>e.currentTarget.style.background=""}
                  >
                    <td style={{padding:"8px 12px",fontSize:12}}>{p.ncssRef||"—"}</td>
                    <td style={{padding:"8px 12px",fontSize:12}}>{p.name}</td>
                    <td style={{padding:"8px 12px",fontSize:12}}>{p.mobile||"—"}</td>
                    <td style={{padding:"8px 12px",fontSize:12}}>{p.dispatchDate||"—"}</td>
                    <td style={{padding:"8px 12px",fontSize:12}}>{p.receivedDate||"—"}</td>
                    <td style={{padding:"8px 12px",fontSize:12,fontWeight:700}}>{p.resultDate||"—"}</td>
                    <td style={{padding:"8px 12px"}}><ResultBadge result={p.result}/></td>
                    <td style={{padding:"8px 12px",fontSize:11,color:TXL,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={p.notes}>{p.notes||"—"}</td>
                    <td style={{padding:"8px 12px",textAlign:"center",color:"#ccc"}}>—</td>
                    <td
                      style={{padding:"8px 12px",whiteSpace:"nowrap"}}
                      onClick={e=>e.stopPropagation()}
                    >
                      <span
                        onClick={()=>setArchiveModal({patient:p,note:""})}
                        style={{color:TXM,fontSize:11,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2}}
                      >Archive</span>
                    </td>
                  </tr>
                ));
              })() : stagesToShow.map(s=>{
                const all=filtered.filter(p=>p.stage===s.id);
                // Sort by days pending descending (most urgent first). null days sort to bottom.
                const sorted=[...all].sort((a,b)=>{
                  const da=daysPending(a), db=daysPending(b);
                  if(da===null && db===null) return 0;
                  if(da===null) return 1;
                  if(db===null) return -1;
                  return db-da;
                });
                const expanded=!!expandedStages[s.id];
                const CAP=10;
                const rows = expanded ? sorted : sorted.slice(0,CAP);
                const hiddenCount = sorted.length - rows.length;
                return [
                  <tr key={"hdr"+s.id} style={{background:s.light}}>
                    <td colSpan={10} style={{padding:"8px 14px",borderBottom:`1px solid ${BR}`}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:10,height:10,borderRadius:"50%",background:s.color}}/>
                          <span style={{fontSize:14,fontWeight:700,color:s.color}}>Stage {s.id} — {s.label}</span>
                          <span style={{background:s.color+"22",color:s.color,fontSize:10,padding:"2px 8px",borderRadius:10,fontWeight:600}}>{all.length} patient{all.length!==1?"s":""}</span>
                          {all.length>CAP && (
                            <span style={{fontSize:10,color:TXM,fontStyle:"italic"}}>sorted by days pending (most urgent first)</span>
                          )}
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <button style={actBtn({borderColor:P,color:P,fontWeight:700})} onClick={()=>{setUploadModal({stageId:s.id});setUploadState({preview:null,errors:null,parsedRows:null});}}>↑ Upload CSV</button>
                        </div>
                      </div>
                    </td>
                  </tr>,
                  ...( rows.length ? rows.map(p=>(
                    <tr
                      key={p.id}
                      onClick={()=>setEditModal({patient:p,form:{...p},errors:{}})}
                      style={{borderBottom:`0.5px solid ${BR}`,cursor:"pointer"}}
                      onMouseEnter={e=>e.currentTarget.style.background=LAV2}
                      onMouseLeave={e=>e.currentTarget.style.background=""}
                    >
                      <td style={{padding:"8px 12px",fontSize:12}}>{p.ncssRef||"—"}</td>
                      <td style={{padding:"8px 12px",fontSize:12}}>{p.name}</td>
                      <td style={{padding:"8px 12px",fontSize:12}}>{p.mobile||"—"}</td>
                      <td style={{padding:"8px 12px",fontSize:12}}>{s.id>=2?(p.dispatchDate||"—"):<span style={{color:BR}}>—</span>}</td>
                      <td style={{padding:"8px 12px",fontSize:12}}>{s.id>=3?(p.receivedDate||"—"):<span style={{color:BR}}>—</span>}</td>
                      <td style={{padding:"8px 12px",fontSize:12}}>{s.id>=4&&p.resultDate?p.resultDate:<span style={{color:BR}}>—</span>}</td>
                      <td style={{padding:"8px 12px"}}>{s.id>=4?<ResultBadge result={p.result}/>:<span style={{color:BR}}>—</span>}</td>
                      <td style={{padding:"8px 12px",fontSize:11,color:TXL,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={p.notes}>{p.notes||"—"}</td>
                      <td style={{padding:"8px 12px",textAlign:"center"}}>
                        {(()=>{
                          const d=daysPending(p);
                          if(d===null) return <span style={{color:"#ccc"}}>—</span>;
                          const over=d>30;
                          return <span style={{
                            display:"inline-block",
                            padding:"2px 8px",
                            borderRadius:10,
                            fontSize:11,
                            fontWeight:over?700:400,
                            background:over?"#FCEBEB":"transparent",
                            color:over?"#791F1F":TXL,
                            border:over?"1px solid #F09595":"none",
                          }}>{d}d</span>;
                        })()}
                      </td>
                      <td
                        style={{padding:"8px 12px",whiteSpace:"nowrap"}}
                        onClick={e=>e.stopPropagation()}
                      >
                        {p.stage<4 ? (
                          <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-start"}}>
                            <span
                              onClick={()=>advanceOne(p)}
                              style={{color:P,fontWeight:700,fontSize:11,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2}}
                            >Advance →</span>
                            <span
                              onClick={()=>setWithdrawModal({patient:p,reason:""})}
                              style={{color:"#791F1F",fontSize:11,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2}}
                            >Withdraw</span>
                          </div>
                        ) : (
                          <span
                            onClick={()=>setArchiveModal({patient:p,note:""})}
                            style={{color:TXM,fontSize:11,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2}}
                          >Archive</span>
                        )}
                      </td>
                    </tr>
                  )) : [<tr key={"empty"+s.id}><td colSpan={10} style={{textAlign:"center",padding:"40px 20px",color:TXL}}>No patients in this stage.</td></tr>]),
                  // Pagination footer
                  ...(all.length>CAP ? [
                    <tr key={"more"+s.id} style={{background:"#FBFAFD"}}>
                      <td colSpan={10} style={{padding:"10px 14px",textAlign:"center",borderBottom:`1px solid ${BR}`}}>
                        {expanded ? (
                          <>
                            <span style={{fontSize:11,color:TXM}}>Showing all {all.length} patients.</span>{" "}
                            <span
                              onClick={()=>setExpandedStages(es=>({...es,[s.id]:false}))}
                              style={{color:P,fontSize:11,fontWeight:700,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2,marginLeft:6}}
                            >Show top {CAP}</span>
                          </>
                        ) : (
                          <>
                            <span style={{fontSize:11,color:TXM}}>Showing top {CAP} of {all.length} — {hiddenCount} more</span>{" "}
                            <span
                              onClick={()=>setExpandedStages(es=>({...es,[s.id]:true}))}
                              style={{color:P,fontSize:11,fontWeight:700,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2,marginLeft:6}}
                            >Show all</span>
                          </>
                        )}
                      </td>
                    </tr>
                  ] : [])
                ];
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal&&(()=>{
        const errs=editModal.errors||{};
        const errCount=Object.keys(errs).length;
        return <Modal title={`Edit — ${editModal.patient.name} (Stage ${editModal.patient.stage})`} onClose={()=>setEditModal(null)} onSave={saveEdit}>
        {errCount>0 && (
          <div style={{background:"#FEF6F6",border:"1px solid #F09595",borderRadius:6,padding:"10px 12px",fontSize:12,color:"#791F1F",lineHeight:1.5}}>
            <b>⚠ {errCount} validation error{errCount>1?"s":""} — please correct below before saving.</b>
          </div>
        )}
        {editModal.patient.stage===1&&<>
          <p style={{fontSize:11,color:TXM,marginBottom:4}}>Most fields are editable for Stage 1. <b>Age is auto-computed from Date of Birth.</b></p>
          <Field label="NCSS Reference" value={editModal.patient.ncssRef} readOnly/>
          <Row><Field label="Full Name *" value={editModal.form.name} onChange={v=>setEditModal(m=>({...m,form:{...m.form,name:v}}))}/><Field label="Age (auto)" value={ageFromDob(editModal.form.dob)||""} readOnly/></Row>
          <ErrorText msg={errs.name}/>
          <Row><Field label="NRIC (masked)" value={editModal.form.nric} onChange={v=>setEditModal(m=>({...m,form:{...m.form,nric:v}}))}/><div style={{display:"flex",flexDirection:"column",gap:3,flex:"0 0 60px"}}><label style={{fontSize:11,fontWeight:700,color:TXM}}>Gender</label><select value={editModal.form.gender} onChange={e=>setEditModal(m=>({...m,form:{...m.form,gender:e.target.value}}))} style={{border:`1px solid ${errs.gender?"#F09595":BR}`,borderRadius:4,padding:"6px 8px",fontSize:12}}><option value="M">M</option><option value="F">F</option></select></div></Row>
          <ErrorText msg={errs.gender}/>
          <Row><Field label="Mobile * (SG, 8 digits, starts 6/8/9)" value={editModal.form.mobile} onChange={v=>setEditModal(m=>({...m,form:{...m.form,mobile:v.replace(/[^0-9]/g,"").slice(0,8)}}))}/><Field label="Date of Birth" type="date" value={editModal.form.dob} onChange={v=>setEditModal(m=>({...m,form:{...m.form,dob:v}}))}/></Row>
          <ErrorText msg={errs.mobile}/>
          <ErrorText msg={errs.dob}/>
          <Field label="Shipping Address" value={editModal.form.address} onChange={v=>setEditModal(m=>({...m,form:{...m.form,address:v}}))}/>
          <Field label="Notes"><textarea value={editModal.form.notes||""} onChange={e=>setEditModal(m=>({...m,form:{...m.form,notes:e.target.value}}))} style={{border:`1px solid ${BR}`,borderRadius:4,padding:"6px 8px",fontSize:12,width:"100%",resize:"vertical",minHeight:60,fontFamily:FONT}}/></Field>
        </>}
        {editModal.patient.stage===2&&<>
          <p style={{fontSize:11,color:TXM,marginBottom:4}}>Only <b>Kit Dispatch Date</b> and <b>Notes</b> are editable at Stage 2.</p>
          <Field label="NCSS Reference" value={editModal.patient.ncssRef} readOnly/>
          <Field label="Patient Name" value={editModal.patient.name} readOnly/>
          <Field label="Kit Dispatch Date *" type="date" value={editModal.form.dispatchDate} onChange={v=>setEditModal(m=>({...m,form:{...m.form,dispatchDate:v}}))}/>
          <ErrorText msg={errs.dispatchDate}/>
          <Field label="Notes"><textarea value={editModal.form.notes||""} onChange={e=>setEditModal(m=>({...m,form:{...m.form,notes:e.target.value}}))} style={{border:`1px solid ${BR}`,borderRadius:4,padding:"6px 8px",fontSize:12,width:"100%",resize:"vertical",minHeight:60,fontFamily:FONT}}/></Field>
        </>}
        {editModal.patient.stage===3&&<>
          <p style={{fontSize:11,color:TXM,marginBottom:4}}>Only <b>Lab Reference</b>, <b>Lab Received Date</b> and <b>Notes</b> are editable at Stage 3.</p>
          <Field label="NCSS Reference" value={editModal.patient.ncssRef} readOnly/>
          <Field label="Patient Name" value={editModal.patient.name} readOnly/>
          <Row><Field label="Lab Reference *" value={editModal.form.labRef} onChange={v=>setEditModal(m=>({...m,form:{...m.form,labRef:v}}))}/><Field label="Lab Received Date *" type="date" value={editModal.form.receivedDate} onChange={v=>setEditModal(m=>({...m,form:{...m.form,receivedDate:v}}))}/></Row>
          <ErrorText msg={errs.labRef}/>
          <ErrorText msg={errs.receivedDate}/>
          <Field label="Notes"><textarea value={editModal.form.notes||""} onChange={e=>setEditModal(m=>({...m,form:{...m.form,notes:e.target.value}}))} style={{border:`1px solid ${BR}`,borderRadius:4,padding:"6px 8px",fontSize:12,width:"100%",resize:"vertical",minHeight:60,fontFamily:FONT}}/></Field>
        </>}
        {editModal.patient.stage===4&&<>
          <p style={{fontSize:11,color:TXM,marginBottom:4}}>Only <b>Result</b>, <b>Result Date</b> and <b>Notes</b> are editable at Stage 4.</p>
          <Field label="NCSS Reference" value={editModal.patient.ncssRef} readOnly/>
          <Field label="Patient Name" value={editModal.patient.name} readOnly/>
          <Row>
            <div style={{display:"flex",flexDirection:"column",gap:3,flex:1}}><label style={{fontSize:11,fontWeight:700,color:TXM}}>Result *</label><select value={editModal.form.result||""} onChange={e=>setEditModal(m=>({...m,form:{...m.form,result:e.target.value}}))} style={{border:`1px solid ${errs.result?"#F09595":BR}`,borderRadius:4,padding:"6px 8px",fontSize:12}}><option value="">-- Select --</option><option>Negative</option><option>Positive</option><option>Inconclusive</option><option>Withdrawn</option></select></div>
            <Field label="Result Date *" type="date" value={editModal.form.resultDate} onChange={v=>setEditModal(m=>({...m,form:{...m.form,resultDate:v}}))}/>
          </Row>
          <ErrorText msg={errs.result}/>
          <ErrorText msg={errs.resultDate}/>
          <Field label="Notes"><textarea value={editModal.form.notes||""} onChange={e=>setEditModal(m=>({...m,form:{...m.form,notes:e.target.value}}))} style={{border:`1px solid ${BR}`,borderRadius:4,padding:"6px 8px",fontSize:12,width:"100%",resize:"vertical",minHeight:60,fontFamily:FONT}}/></Field>
        </>}
      </Modal>;
      })()}

      {/* Advance Modal */}
      {advModal&&<Modal title={`Advance to Stage ${advModal.toStage} — ${STAGES[advModal.toStage-1].label}`} onClose={()=>setAdvModal(null)} onSave={saveAdvance}>
        <p style={{fontSize:12,color:TXM,marginBottom:8}}>Patient: <b>{advModal.patient.name}</b></p>
        {advModal.toStage===2&&<Field label="Dispatch Date *" type="date" value={advModal.form.dispatchDate} onChange={v=>setAdvModal(m=>({...m,form:{...m.form,dispatchDate:v}}))}/>}
        {advModal.toStage===3&&<Row><Field label="Lab Reference *" value={advModal.form.labRef} onChange={v=>setAdvModal(m=>({...m,form:{...m.form,labRef:v}}))}/><Field label="Date Received *" type="date" value={advModal.form.receivedDate} onChange={v=>setAdvModal(m=>({...m,form:{...m.form,receivedDate:v}}))}/></Row>}
        {advModal.toStage===4&&<>
          <Row>
            <div style={{display:"flex",flexDirection:"column",gap:3,flex:1}}><label style={{fontSize:11,fontWeight:700,color:TXM}}>Result *</label><select value={advModal.form.result} onChange={e=>setAdvModal(m=>({...m,form:{...m.form,result:e.target.value}}))} style={{border:`1px solid ${BR}`,borderRadius:4,padding:"6px 8px",fontSize:12}}><option value="">-- Select --</option><option>Negative</option><option>Positive</option><option>Inconclusive</option><option>Withdrawn</option></select></div>
            <Field label="Result Date *" type="date" value={advModal.form.resultDate} onChange={v=>setAdvModal(m=>({...m,form:{...m.form,resultDate:v}}))}/>
          </Row>
          <Field label="Lab Reference" value={advModal.form.labRef||advModal.patient.labRef} onChange={v=>setAdvModal(m=>({...m,form:{...m.form,labRef:v}}))}/>
        </>}
        <Field label="Notes"><textarea value={advModal.form.notes||""} onChange={e=>setAdvModal(m=>({...m,form:{...m.form,notes:e.target.value}}))} style={{border:`1px solid ${BR}`,borderRadius:4,padding:"6px 8px",fontSize:12,width:"100%",resize:"vertical",minHeight:60,fontFamily:FONT}}/></Field>
      </Modal>}



      {/* Withdraw Modal */}
      {withdrawModal&&<Modal title="Withdraw Patient" onClose={()=>setWithdrawModal(null)} onSave={saveWithdraw} saveLabel="Confirm Withdrawal">
        <div style={{background:"#FEF6F6",border:"1px solid #F09595",borderRadius:6,padding:12,fontSize:12,color:"#791F1F",lineHeight:1.6}}>
          <b>Confirm withdrawal for:</b><br/>
          <span style={{fontSize:13}}>{withdrawModal.patient.name}</span> <span style={{color:TXM}}>({withdrawModal.patient.ncssRef})</span><br/>
          <div style={{marginTop:8,fontSize:11}}>This patient will be moved to <b>Stage 4</b> with result marked <b>Withdrawn</b>. This action should be used when the patient is no longer participating (e.g. declined, deceased, uncontactable).</div>
        </div>
        <Field label="Reason (optional)"><textarea value={withdrawModal.reason||""} onChange={e=>setWithdrawModal(m=>({...m,reason:e.target.value}))} placeholder="e.g. Patient declined; uncontactable after 3 reminders" style={{border:`1px solid ${BR}`,borderRadius:4,padding:"6px 8px",fontSize:12,width:"100%",resize:"vertical",minHeight:60,fontFamily:FONT}}/></Field>
      </Modal>}

      {/* Archive Modal */}
      {archiveModal&&<Modal title="Archive Patient" onClose={()=>setArchiveModal(null)} onSave={saveArchive} saveLabel="Confirm Archive">
        <div style={{background:LAV2,border:`1px solid ${BR}`,borderRadius:6,padding:12,fontSize:12,color:TXM,lineHeight:1.6}}>
          <b style={{color:P}}>Confirm archive for:</b><br/>
          <span style={{fontSize:13,color:TX}}>{archiveModal.patient.name}</span> <span style={{color:TXL}}>({archiveModal.patient.ncssRef})</span><br/>
          <div style={{marginTop:8,fontSize:11}}>This completed record will be removed from the active Stage 4 list and moved to the Archive. The result and history are preserved. You can review all archived records via the <b>Archive</b> button in the header.</div>
        </div>
        <Field label="Result on file" value={archiveModal.patient.result||"—"} readOnly/>
        <Field label="Archive note (optional)"><textarea value={archiveModal.note||""} onChange={e=>setArchiveModal(m=>({...m,note:e.target.value}))} placeholder="e.g. Closed — follow-up completed at polyclinic" style={{border:`1px solid ${BR}`,borderRadius:4,padding:"6px 8px",fontSize:12,width:"100%",resize:"vertical",minHeight:60,fontFamily:FONT}}/></Field>
      </Modal>}

      {/* Archive Listing Modal */}
      {archiveListOpen&&(()=>{
        const {search:aSearch,resultFilter,dateFrom,dateTo,page}=archiveView;
        const PAGE_SIZE=25;

        // Pre-sort full archive by archivedAt desc
        const allSorted=[...archived].sort((a,b)=>(b.archivedAt||"").localeCompare(a.archivedAt||""));

        // Apply filters
        const searchDigits=aSearch.replace(/[^0-9]/g,"");
        const searchLower=aSearch.trim().toLowerCase();
        const filteredArchive=allSorted.filter(p=>{
          if(searchLower){
            const matchText=p.name.toLowerCase().includes(searchLower) || p.ncssRef.toLowerCase().includes(searchLower);
            const matchPhone=searchDigits && (p.mobile||"").includes(searchDigits);
            if(!matchText && !matchPhone) return false;
          }
          if(resultFilter && p.result!==resultFilter) return false;
          if(dateFrom && (p.archivedAt||"")<dateFrom) return false;
          if(dateTo && (p.archivedAt||"")>dateTo) return false;
          return true;
        });

        const totalPages=Math.max(1,Math.ceil(filteredArchive.length/PAGE_SIZE));
        const currentPage=Math.min(page,totalPages);
        const startIdx=(currentPage-1)*PAGE_SIZE;
        const pageRows=filteredArchive.slice(startIdx,startIdx+PAGE_SIZE);

        const hasActiveFilter = aSearch || resultFilter || dateFrom || dateTo;

        // Build compact pager: [1] 2 3 ... 14  with current highlighted, ellipses where gaps exist
        function pagerPages(cur,total){
          if(total<=7) return Array.from({length:total},(_,i)=>i+1);
          const pages=new Set([1,total,cur,cur-1,cur+1]);
          const arr=[...pages].filter(n=>n>=1&&n<=total).sort((a,b)=>a-b);
          const out=[];
          for(let i=0;i<arr.length;i++){
            if(i>0 && arr[i]-arr[i-1]>1) out.push("…");
            out.push(arr[i]);
          }
          return out;
        }
        const pagerItems=pagerPages(currentPage,totalPages);

        const inputS={border:`1px solid ${BR}`,borderRadius:4,padding:"6px 10px",fontSize:12,fontFamily:FONT,color:TX,background:"#fff"};

        return (
          <div style={{position:"fixed",inset:0,background:"rgba(45,26,80,.45)",zIndex:50,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:20,overflowY:"auto"}}>
            <div style={{background:"#fff",borderRadius:10,width:"100%",maxWidth:1100,margin:"auto",border:`1px solid ${BR}`}}>
              {/* Header */}
              <div style={{background:P,color:"#fff",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"10px 10px 0 0"}}>
                <h2 style={{fontSize:14,fontWeight:700,margin:0}}>
                  Archive — {archived.length.toLocaleString()} total record{archived.length!==1?"s":""}
                  {archived.length>0 && <span style={{fontWeight:400,color:"rgba(255,255,255,.65)",fontSize:11,marginLeft:8}}>sorted by archive date, latest first</span>}
                </h2>
                <button onClick={()=>setArchiveListOpen(false)} style={{background:"none",border:"none",color:"#fff",fontSize:18,cursor:"pointer",opacity:.8}}>✕</button>
              </div>

              {/* Body */}
              <div style={{padding:18}}>
                {archived.length===0 ? (
                  <div style={{textAlign:"center",padding:"40px 20px",color:TXL,fontSize:13}}>
                    No archived patients yet.<br/>
                    <span style={{fontSize:11}}>Archive completed Stage 4 records using the <b>Archive</b> action on any row.</span>
                  </div>
                ) : (
                  <>
                    {/* Filter bar */}
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end",marginBottom:12,padding:12,background:LAV2,border:`1px solid ${BR}`,borderRadius:8}}>
                      <div style={{display:"flex",flexDirection:"column",gap:3,flex:"2 1 240px",minWidth:200}}>
                        <label style={{fontSize:10,fontWeight:700,color:TXM,textTransform:"uppercase",letterSpacing:.3}}>Search</label>
                        <input
                          value={aSearch}
                          onChange={e=>setArchiveView(v=>({...v,search:e.target.value,page:1}))}
                          placeholder="Name, NCSS ref, or phone..."
                          style={inputS}
                        />
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:3,flex:"1 1 150px",minWidth:130}}>
                        <label style={{fontSize:10,fontWeight:700,color:TXM,textTransform:"uppercase",letterSpacing:.3}}>Result</label>
                        <select
                          value={resultFilter}
                          onChange={e=>setArchiveView(v=>({...v,resultFilter:e.target.value,page:1}))}
                          style={inputS}
                        >
                          <option value="">All results</option>
                          <option>Positive</option>
                          <option>Negative</option>
                          <option>Inconclusive</option>
                          <option>Withdrawn</option>
                        </select>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:3,flex:"1 1 140px",minWidth:130}}>
                        <label style={{fontSize:10,fontWeight:700,color:TXM,textTransform:"uppercase",letterSpacing:.3}}>Archived from</label>
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={e=>setArchiveView(v=>({...v,dateFrom:e.target.value,page:1}))}
                          style={inputS}
                        />
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:3,flex:"1 1 140px",minWidth:130}}>
                        <label style={{fontSize:10,fontWeight:700,color:TXM,textTransform:"uppercase",letterSpacing:.3}}>Archived to</label>
                        <input
                          type="date"
                          value={dateTo}
                          onChange={e=>setArchiveView(v=>({...v,dateTo:e.target.value,page:1}))}
                          style={inputS}
                        />
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        {hasActiveFilter && (
                          <button
                            onClick={()=>setArchiveView({search:"",resultFilter:"",dateFrom:"",dateTo:"",page:1})}
                            style={{background:"#fff",color:TXM,border:`1px solid ${BR}`,padding:"7px 12px",borderRadius:4,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:FONT,whiteSpace:"nowrap"}}
                          >Reset</button>
                        )}
                        <button
                          onClick={()=>exportArchiveCSV(filteredArchive)}
                          disabled={filteredArchive.length===0}
                          style={{background:filteredArchive.length?P:"#ccc",color:"#fff",border:"none",padding:"7px 12px",borderRadius:4,cursor:filteredArchive.length?"pointer":"not-allowed",fontSize:11,fontWeight:700,fontFamily:FONT,whiteSpace:"nowrap"}}
                        >↓ Export CSV</button>
                      </div>
                    </div>

                    {/* Summary row */}
                    <div style={{fontSize:11,color:TXM,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                      <span>
                        {filteredArchive.length===0 ? (
                          <span style={{color:"#791F1F"}}>No records match the current filters.</span>
                        ) : (
                          <>
                            Showing <b>{(startIdx+1).toLocaleString()}–{Math.min(startIdx+PAGE_SIZE,filteredArchive.length).toLocaleString()}</b> of <b>{filteredArchive.length.toLocaleString()}</b>
                            {hasActiveFilter && archived.length!==filteredArchive.length && (
                              <span style={{color:TXL}}> &nbsp;(filtered from {archived.length.toLocaleString()} total)</span>
                            )}
                          </>
                        )}
                      </span>
                      <span style={{color:TXL}}>Page {currentPage} of {totalPages}</span>
                    </div>

                    {/* Table */}
                    <div style={{border:`1px solid ${BR}`,borderRadius:6,overflow:"hidden",maxHeight:480,overflowY:"auto"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                        <thead>
                          <tr style={{background:LAV2,position:"sticky",top:0,zIndex:1}}>
                            {["Refer ID","Patient Name","Phone","Result","Result Date","Archived On","Archive Note"].map(h=>(
                              <th key={h} style={{color:TXM,fontSize:11,fontWeight:700,padding:"8px 12px",textAlign:"left",borderBottom:`1px solid ${BR}`,whiteSpace:"nowrap",background:LAV2}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pageRows.length===0 ? (
                            <tr><td colSpan={7} style={{textAlign:"center",padding:"40px 20px",color:TXL,fontSize:12}}>
                              No records match these filters.<br/>
                              <span style={{fontSize:11}}>Try clearing filters or adjusting the date range.</span>
                            </td></tr>
                          ) : pageRows.map(p=>(
                            <tr key={p.id} style={{borderBottom:`0.5px solid ${BR}`}}>
                              <td style={{padding:"8px 12px"}}>{p.ncssRef}</td>
                              <td style={{padding:"8px 12px"}}>{p.name}</td>
                              <td style={{padding:"8px 12px"}}>{p.mobile}</td>
                              <td style={{padding:"8px 12px"}}><ResultBadge result={p.result}/></td>
                              <td style={{padding:"8px 12px"}}>{p.resultDate||"—"}</td>
                              <td style={{padding:"8px 12px",color:TXM}}>{p.archivedAt||"—"}</td>
                              <td style={{padding:"8px 12px",fontSize:11,color:TXL,maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={p.archiveNote}>{p.archiveNote||"—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pager */}
                    {totalPages>1 && (
                      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:4,marginTop:12}}>
                        <button
                          onClick={()=>setArchiveView(v=>({...v,page:Math.max(1,currentPage-1)}))}
                          disabled={currentPage===1}
                          style={{background:"#fff",color:currentPage===1?TXL:TXM,border:`1px solid ${BR}`,padding:"6px 10px",borderRadius:4,cursor:currentPage===1?"not-allowed":"pointer",fontSize:11,fontFamily:FONT,fontWeight:600}}
                        >‹ Prev</button>
                        {pagerItems.map((it,i)=>(
                          it==="…" ? (
                            <span key={"gap"+i} style={{color:TXL,padding:"0 4px",fontSize:11}}>…</span>
                          ) : (
                            <button
                              key={it}
                              onClick={()=>setArchiveView(v=>({...v,page:it}))}
                              style={{
                                background: it===currentPage ? P : "#fff",
                                color: it===currentPage ? "#fff" : TXM,
                                border:`1px solid ${it===currentPage ? P : BR}`,
                                padding:"6px 10px",
                                borderRadius:4,
                                cursor:"pointer",
                                fontSize:11,
                                fontFamily:FONT,
                                fontWeight:700,
                                minWidth:30,
                              }}
                            >{it}</button>
                          )
                        ))}
                        <button
                          onClick={()=>setArchiveView(v=>({...v,page:Math.min(totalPages,currentPage+1)}))}
                          disabled={currentPage===totalPages}
                          style={{background:"#fff",color:currentPage===totalPages?TXL:TXM,border:`1px solid ${BR}`,padding:"6px 10px",borderRadius:4,cursor:currentPage===totalPages?"not-allowed":"pointer",fontSize:11,fontFamily:FONT,fontWeight:600}}
                        >Next ›</button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div style={{padding:"12px 18px",borderTop:`1px solid ${BR}`,display:"flex",justifyContent:"flex-end"}}>
                <button onClick={()=>setArchiveListOpen(false)} style={{background:P,color:"#fff",border:"none",padding:"7px 14px",borderRadius:4,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:FONT}}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Upload Modal */}
      {uploadModal&&<Modal title={`Upload CSV — Stage ${uploadModal.stageId}`} onClose={()=>setUploadModal(null)} onSave={uploadState.parsedRows?()=>confirmUpload(uploadModal.stageId):null} saveLabel={`Import ${uploadState.parsedRows?.length||0} record${uploadState.parsedRows?.length!==1?"s":""}`}>
        <div style={{background:LAV2,border:`1px solid ${BR}`,borderRadius:6,padding:14,fontSize:12,color:TXM,lineHeight:1.8}}>
          <b style={{color:P}}>How to use:</b><br/>
          1. Download the CSV template below<br/>
          2. Fill in patient details (one row per patient)<br/>
          3. Save as <b>.csv</b> and upload here
        </div>
        <button style={{...btnS,width:"100%",padding:10}} onClick={()=>downloadTemplate(uploadModal.stageId)}>↓ Download CSV Template (Stage {uploadModal.stageId})</button>
        <div style={{display:"flex",alignItems:"center",gap:10,margin:"4px 0"}}>
          <div style={{flex:1,height:1,background:BR}}/><span style={{fontSize:11,color:TXL}}>then upload your filled file</span><div style={{flex:1,height:1,background:BR}}/>
        </div>
        <div
          onClick={()=>document.getElementById("csv-upload-inp").click()}
          onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=P;}}
          onDragLeave={e=>e.currentTarget.style.borderColor=BR}
          onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor=BR;const f=e.dataTransfer.files[0];if(f)handleFile(f,uploadModal.stageId);}}
          style={{border:`2px dashed ${BR}`,borderRadius:8,padding:28,textAlign:"center",cursor:"pointer",background:LAV2}}>
          <div style={{fontSize:28,marginBottom:8}}>📂</div>
          <div style={{fontSize:13,fontWeight:700,color:TX}}>Click to select or drag & drop</div>
          <div style={{fontSize:11,color:TXL,marginTop:4}}>.csv files only</div>
          <input id="csv-upload-inp" type="file" accept=".csv" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f)handleFile(f,uploadModal.stageId);}}/>
        </div>
        {uploadState.errors&&<UploadErrors errors={uploadState.errors}/>}
        {uploadState.preview&&<UploadPreview rows={uploadState.preview} stageId={uploadModal.stageId}/>}
      </Modal>}
    </div>
  );
}

function Modal({title,children,onClose,onSave,saveLabel="Save"}){
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(45,26,80,.45)",zIndex:50,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:20,overflowY:"auto"}}>
      <div style={{background:"#fff",borderRadius:10,width:"100%",maxWidth:560,margin:"auto",border:`1px solid ${BR}`}}>
        <div style={{background:P,color:"#fff",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"10px 10px 0 0"}}>
          <h2 style={{fontSize:14,fontWeight:700,margin:0}}>{title}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#fff",fontSize:18,cursor:"pointer",opacity:.8}}>✕</button>
        </div>
        <div style={{padding:18,display:"flex",flexDirection:"column",gap:10}}>{children}</div>
        <div style={{padding:"12px 18px",borderTop:`1px solid ${BR}`,display:"flex",justifyContent:"flex-end",gap:8}}>
          <button onClick={onClose} style={{background:"#fff",color:P,border:`1px solid ${BR}`,padding:"7px 14px",borderRadius:4,cursor:"pointer",fontSize:12,fontWeight:700}}>Cancel</button>
          {onSave&&<button onClick={onSave} style={{background:P,color:"#fff",border:"none",padding:"7px 14px",borderRadius:4,cursor:"pointer",fontSize:12,fontWeight:700}}>{saveLabel}</button>}
        </div>
      </div>
    </div>
  );
}

function UploadErrors({errors}){
  const ncss=errors.filter(e=>e.type==="ncss"||e.msg.includes("not found")||e.msg.includes("Stage"));
  const field=errors.filter(e=>!ncss.includes(e));
  return (
    <div style={{background:"#FEF6F6",border:"1px solid #F09595",borderRadius:6,padding:"12px 14px",fontSize:12,color:"#791F1F",lineHeight:1.6}}>
      {ncss.length>0&&<>
        <div style={{fontWeight:700,marginBottom:6}}>⚠ {ncss.length} NCSS Reference ID{ncss.length>1?"s":""} rejected — upload cancelled</div>
        <div style={{background:"#fff",border:"1px solid #F09595",borderRadius:6,overflow:"hidden",marginBottom:8}}>
          <div style={{background:"#FCEBEB",padding:"7px 12px",fontSize:11,fontWeight:700,borderBottom:"1px solid #F09595"}}>Mismatched NCSS Reference IDs</div>
          <div style={{padding:"8px 12px"}}>{ncss.map((e,i)=><div key={i}>• {e.msg}</div>)}</div>
        </div>
      </>}
      {field.length>0&&<>
        <div style={{fontWeight:700,color:"#854F0B",marginBottom:6}}>{field.length} field validation error{field.length>1?"s":""}</div>
        <div style={{background:"#fff",border:"1px solid #f0c980",borderRadius:6,overflow:"hidden"}}>
          <div style={{background:"#FAEEDA",padding:"7px 12px",fontSize:11,fontWeight:700,color:"#854F0B",borderBottom:"1px solid #f0c980"}}>Field Errors</div>
          <div style={{padding:"8px 12px",color:"#854F0B"}}>{field.map((e,i)=><div key={i}>• {e.msg}</div>)}</div>
        </div>
      </>}
      <div style={{marginTop:8,fontSize:11,color:TXL}}>Please correct the errors and upload again. No records were updated.</div>
    </div>
  );
}

function UploadPreview({rows,stageId}){
  const cfg={1:{cols:["ncssRef","name","age","gender","mobile"],labels:["NCSS Ref","Name","Age","Sex","Mobile"]},2:{cols:["ncssRef","dispatchDate","notes"],labels:["NCSS Ref","Dispatch Date","Notes"]},3:{cols:["ncssRef","receivedDate","notes"],labels:["NCSS Ref","Date Received","Notes"]},4:{cols:["ncssRef","result","resultDate","notes"],labels:["NCSS Ref","Result","Result Date","Notes"]}};
  const {cols,labels}=cfg[stageId]||cfg[1];
  return (
    <div>
      <div style={{fontSize:12,fontWeight:700,color:TXM,marginBottom:6}}>Preview — {rows.length} record{rows.length!==1?"s":""} ready to import</div>
      <div style={{maxHeight:200,overflowY:"auto",border:`1px solid ${BR}`,borderRadius:6}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead><tr style={{background:LAV2}}>{labels.map(l=><th key={l} style={{padding:"5px 8px",textAlign:"left",color:TXM}}>{l}</th>)}</tr></thead>
          <tbody>{rows.map((p,i)=><tr key={i} style={{borderTop:`0.5px solid ${BR}`}}>{cols.map(c=><td key={c} style={{padding:"5px 8px"}}>{p[c]||"—"}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
