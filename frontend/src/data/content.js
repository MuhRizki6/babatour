export const BRAND = {
  name: "Baba Tour",
  fullName: "Baba Tour Umroh & Haji Khusus",
  tagline: "Sahabat Perjalanan Umroh Anda",
  phone: "+62 823 9215 6538",
  phoneRaw: "6282392156538",
  email: "babatour.batam@gmail.com",
  address: "Ruko Mega Legenda 2 Blok B2 No 26, Batam",
  city: "Batam, Kepulauan Riau, Indonesia",
  facebook: "https://www.facebook.com/people/BabatourBatam/61572145778044/",
  instagram: "https://www.instagram.com/babatour.batam/",
};

export const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "packages", label: "Packages" },
  { id: "about", label: "About" },
  { id: "services", label: "Why Us" },
  { id: "gallery", label: "Gallery" },
  { id: "testimonials", label: "Testimonials" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

export const PACKAGES = [
  {
    id: "umrah-economy",
    name: "Umrah Ekonomi",
    duration: "9 Days",
    departures: "Bulanan • Jan – Dec 2026",
    priceFrom: "Rp 28,900,000",
    hotelMakkah: "Hotel ★★★★ — 700m from Masjidil Haram",
    hotelMadinah: "Hotel ★★★★ — 300m from Masjid Nabawi",
    airline: "Saudia / Garuda Indonesia",
    image:
      "https://images.unsplash.com/photo-1704104501136-8f35402af395?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHw0fHxrYWFiYSUyMG1lY2NhfGVufDB8fHx8MTc4MDE4MjY2NHww&ixlib=rb-4.1.0&q=85",
    badge: "Best Value",
    includes: [
      "Tiket pesawat PP (Jakarta/Batam)",
      "Hotel bintang 4 di Makkah & Madinah",
      "Visa umroh resmi",
      "Manasik & bimbingan ibadah",
      "Muthawif berbahasa Indonesia",
      "Perlengkapan eksklusif",
    ],
  },
  {
    id: "umrah-vip",
    name: "Umrah VIP",
    duration: "12 Days",
    departures: "Setiap minggu • Premium",
    priceFrom: "Rp 39,500,000",
    hotelMakkah: "Hotel ★★★★★ — 50m from Masjidil Haram",
    hotelMadinah: "Hotel ★★★★★ — 100m from Masjid Nabawi",
    airline: "Saudia / Emirates (Direct)",
    image:
      "https://images.pexels.com/photos/34498854/pexels-photo-34498854.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    badge: "Premium",
    includes: [
      "Penerbangan langsung kelas bintang 5",
      "Hotel bintang 5 dekat haram",
      "Visa umroh resmi & express",
      "City tour Madinah & Makkah",
      "Pembimbing ulama berpengalaman",
      "Kuota terbatas, pelayanan personal",
    ],
  },
  {
    id: "umrah-plus",
    name: "Umrah Plus Turki",
    duration: "14 Days",
    departures: "Mar • May • Sep • Nov 2026",
    priceFrom: "Rp 45,000,000",
    hotelMakkah: "Hotel ★★★★★ — Pullman Zamzam area",
    hotelMadinah: "Hotel ★★★★★ — Anwar Al Madinah",
    airline: "Turkish Airlines (Direct)",
    image:
      "https://images.unsplash.com/photo-1592326871020-04f58c1a52f3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxrYWFiYSUyMG1lY2NhfGVufDB8fHx8MTc4MDE4MjY2NHww&ixlib=rb-4.1.0&q=85",
    badge: "Wisata Sejarah",
    includes: [
      "Tour Istanbul: Blue Mosque, Hagia Sophia",
      "Hotel bintang 5 di seluruh perjalanan",
      "Penerbangan Turkish Airlines",
      "Pembimbing ibadah & city guide",
      "Cruise Bosphorus & makan eksklusif",
      "Limited 25 pax per group",
    ],
  },
  {
    id: "haji-khusus",
    name: "Haji Khusus 2027",
    duration: "26 Days",
    departures: "Musim Haji 1448 H",
    priceFrom: "USD 13,500",
    hotelMakkah: "Hotel ★★★★★ — Zamzam Tower",
    hotelMadinah: "Hotel ★★★★★ — Dar Al Iman Intercontinental",
    airline: "Saudia (Direct)",
    image:
      "https://images.pexels.com/photos/29102893/pexels-photo-29102893.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    badge: "Resmi Kemenag",
    includes: [
      "Kuota Haji Khusus resmi Kemenag",
      "Tenda Mina & Arafah AC khusus",
      "Catering Indonesia 3x sehari",
      "Bimbingan ulama syariah",
      "Manasik intensif 6 bulan",
      "Asuransi perjalanan komprehensif",
    ],
  },
];

export const SERVICES = [
  { icon: "ShieldCheck", title: "Terpercaya", desc: "Travel umroh berizin resmi & terdaftar Kemenag RI." },
  { icon: "UsersRound", title: "Pembimbing Terbaik", desc: "Muthawif & ulama berpengalaman puluhan tahun." },
  { icon: "BedDouble", title: "Hotel Berkualitas", desc: "Hotel bintang 4 & 5 strategis dekat haram." },
  { icon: "BadgeCheck", title: "Pelayanan Resmi", desc: "SOP umroh sesuai standar pemerintah Arab Saudi." },
  { icon: "Clock", title: "On Time", desc: "Maskapai bintang 5 dengan jadwal tepat waktu." },
  { icon: "Sofa", title: "Nyaman", desc: "Armada bus & akomodasi eksklusif penuh kenyamanan." },
  { icon: "Sparkles", title: "Profesional", desc: "Tim berpengalaman melayani ribuan jamaah." },
  { icon: "Gift", title: "Perlengkapan Eksklusif", desc: "Koper, kain ihram, mukena dan suvenir premium." },
];

export const TESTIMONIALS = [
  {
    name: "Hj. Siti Nurhaliza",
    package: "Umrah VIP — Oktober 2025",
    quote:
      "Alhamdulillah, pelayanan Baba Tour luar biasa. Dari keberangkatan hingga kepulangan, semua diurus dengan rapi. Hotelnya dekat haram, muthawifnya sabar dan paham syariah.",
    image: "https://i.pravatar.cc/120?img=47",
  },
  {
    name: "H. Ahmad Fauzi",
    package: "Haji Khusus — 2024",
    quote:
      "Perjalanan haji yang sangat berkesan. Bimbingan ibadahnya intensif, fasilitas tenda di Mina sangat nyaman. Insya Allah haji mabrur berkat layanan Baba Tour.",
    image: "https://i.pravatar.cc/120?img=12",
  },
  {
    name: "Hj. Aminah & Keluarga",
    package: "Umrah Plus Turki — Mei 2025",
    quote:
      "Mengajak ibu yang sudah sepuh, alhamdulillah Baba Tour sangat perhatian. Kursi roda disediakan, antar jemput sampai depan haram. Wisata Turkinya juga memuaskan.",
    image: "https://i.pravatar.cc/120?img=23",
  },
  {
    name: "H. Budi Hartono",
    package: "Umrah Ekonomi — Maret 2025",
    quote:
      "Harga ekonomis tapi fasilitas tetap istimewa. Hotel bersih, makanan halal Indonesia, manasiknya jelas. Recommended untuk umroh keluarga pertama kali.",
    image: "https://i.pravatar.cc/120?img=33",
  },
];

export const GALLERY = [
  "https://images.pexels.com/photos/8059446/pexels-photo-8059446.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.unsplash.com/photo-1646228626691-862369e6a787?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwyfHxtdXNsaW0lMjBwaWxncmltJTIwcHJheWluZ3xlbnwwfHx8fDE3ODAxODI2NjR8MA&ixlib=rb-4.1.0&q=85",
  "https://images.unsplash.com/photo-1575751639353-e292e76daca3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHw0fHxtdXNsaW0lMjBwaWxncmltJTIwcHJheWluZ3xlbnwwfHx8fDE3ODAxODI2NjR8MA&ixlib=rb-4.1.0&q=85",
  "https://images.pexels.com/photos/33169789/pexels-photo-33169789.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/18360295/pexels-photo-18360295.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.unsplash.com/photo-1592326871020-04f58c1a52f3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxrYWFiYSUyMG1lY2NhfGVufDB8fHx8MTc4MDE4MjY2NHww&ixlib=rb-4.1.0&q=85",
];

export const FAQ = [
  {
    q: "Bagaimana tata cara pelaksanaan umrah?",
    a: "Tata cara umrah meliputi: (1) Ihram dari Miqat dan niat umrah, (2) Tawaf mengelilingi Ka'bah sebanyak 7 putaran, (3) Sai antara Safa dan Marwah 7 kali, (4) Tahallul dengan memotong rambut sebagai tanda selesainya umrah. Tim pembimbing Baba Tour akan membimbing Anda di setiap tahap.",
  },
  {
    q: "Mengapa harus memilih Baba Tour Umroh & Haji Khusus?",
    a: "Baba Tour menawarkan paket umroh dan haji yang lengkap dan dapat disesuaikan. Tim profesional, bimbingan ulama berpengalaman, hotel berkualitas dekat haram, dan komitmen pada kenyamanan jamaah membuat ribuan keluarga mempercayakan perjalanan ibadah mereka kepada kami.",
  },
  {
    q: "Bagaimana cara mendaftar paket umrah?",
    a: "Anda dapat datang langsung ke kantor kami di Ruko Mega Legenda 2 Blok B2 No 26, Batam, atau hubungi via WhatsApp di +62 823 9215 6538. Anda juga dapat mengisi formulir inquiry di halaman ini dan tim kami akan menghubungi Anda dalam 1x24 jam.",
  },
  {
    q: "Dokumen apa saja yang dibutuhkan?",
    a: "Paspor berlaku minimal 8 bulan dari tanggal keberangkatan, foto terbaru latar putih, kartu identitas (KTP/KK), buku nikah (untuk pasangan), dan surat mahram (untuk wanita di bawah 45 tahun). Tim kami akan membantu seluruh proses dokumen.",
  },
  {
    q: "Apakah Baba Tour terdaftar resmi?",
    a: "Ya, Baba Tour adalah Penyelenggara Perjalanan Ibadah Umroh (PPIU) dan Penyelenggara Ibadah Haji Khusus (PIHK) berizin resmi Kementerian Agama Republik Indonesia.",
  },
  {
    q: "Apa saja paket yang ditawarkan?",
    a: "Kami menyediakan paket Umrah Ekonomi (9 hari), Umrah VIP (12 hari), Umrah Plus Turki (14 hari), dan Haji Khusus (26 hari). Semua paket dapat disesuaikan untuk kebutuhan keluarga, instansi, atau komunitas.",
  },
];
