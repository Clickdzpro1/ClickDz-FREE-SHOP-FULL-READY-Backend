// Sample communes for each wilaya. In production, replace with full 1541 communes.
// Source: https://github.com/othmanus/algeria-cities

export interface CommuneData {
  nameAr: string;
  nameFr: string;
  postalCode: string;
  wilayaId: number;
  dairaNameFr?: string;
}

export const communes: CommuneData[] = [
  // Wilaya 1 - Adrar
  { nameAr: "أدرار", nameFr: "Adrar", postalCode: "01000", wilayaId: 1, dairaNameFr: "Adrar" },
  { nameAr: "تيميمون", nameFr: "Timimoun", postalCode: "01300", wilayaId: 1, dairaNameFr: "Timimoun" },
  { nameAr: "رقان", nameFr: "Reggane", postalCode: "01400", wilayaId: 1, dairaNameFr: "Reggane" },
  { nameAr: "أولف", nameFr: "Aoulef", postalCode: "01100", wilayaId: 1, dairaNameFr: "Aoulef" },

  // Wilaya 2 - Chlef
  { nameAr: "الشلف", nameFr: "Chlef", postalCode: "02000", wilayaId: 2, dairaNameFr: "Chlef" },
  { nameAr: "تنس", nameFr: "Ténès", postalCode: "02200", wilayaId: 2, dairaNameFr: "Ténès" },
  { nameAr: "الكريمية", nameFr: "El Karimia", postalCode: "02050", wilayaId: 2, dairaNameFr: "Chlef" },

  // Wilaya 3 - Laghouat
  { nameAr: "الأغواط", nameFr: "Laghouat", postalCode: "03000", wilayaId: 3, dairaNameFr: "Laghouat" },
  { nameAr: "أفلو", nameFr: "Aflou", postalCode: "03400", wilayaId: 3, dairaNameFr: "Aflou" },

  // Wilaya 4 - Oum El Bouaghi
  { nameAr: "أم البواقي", nameFr: "Oum El Bouaghi", postalCode: "04000", wilayaId: 4, dairaNameFr: "Oum El Bouaghi" },
  { nameAr: "عين البيضاء", nameFr: "Ain Beida", postalCode: "04200", wilayaId: 4, dairaNameFr: "Ain Beida" },

  // Wilaya 5 - Batna
  { nameAr: "باتنة", nameFr: "Batna", postalCode: "05000", wilayaId: 5, dairaNameFr: "Batna" },
  { nameAr: "بريكة", nameFr: "Barika", postalCode: "05300", wilayaId: 5, dairaNameFr: "Barika" },
  { nameAr: "عين التوتة", nameFr: "Ain Touta", postalCode: "05400", wilayaId: 5, dairaNameFr: "Ain Touta" },

  // Wilaya 6 - Béjaïa
  { nameAr: "بجاية", nameFr: "Béjaïa", postalCode: "06000", wilayaId: 6, dairaNameFr: "Béjaïa" },
  { nameAr: "أقبو", nameFr: "Akbou", postalCode: "06200", wilayaId: 6, dairaNameFr: "Akbou" },
  { nameAr: "سيدي عيش", nameFr: "Sidi Aich", postalCode: "06300", wilayaId: 6, dairaNameFr: "Sidi Aich" },

  // Wilaya 7 - Biskra
  { nameAr: "بسكرة", nameFr: "Biskra", postalCode: "07000", wilayaId: 7, dairaNameFr: "Biskra" },
  { nameAr: "طولقة", nameFr: "Tolga", postalCode: "07200", wilayaId: 7, dairaNameFr: "Tolga" },

  // Wilaya 8 - Béchar
  { nameAr: "بشار", nameFr: "Béchar", postalCode: "08000", wilayaId: 8, dairaNameFr: "Béchar" },

  // Wilaya 9 - Blida
  { nameAr: "البليدة", nameFr: "Blida", postalCode: "09000", wilayaId: 9, dairaNameFr: "Blida" },
  { nameAr: "بوفاريك", nameFr: "Boufarik", postalCode: "09100", wilayaId: 9, dairaNameFr: "Boufarik" },
  { nameAr: "الأربعاء", nameFr: "Larbaâ", postalCode: "09200", wilayaId: 9, dairaNameFr: "Larbaâ" },

  // Wilaya 10 - Bouira
  { nameAr: "البويرة", nameFr: "Bouira", postalCode: "10000", wilayaId: 10, dairaNameFr: "Bouira" },
  { nameAr: "سور الغزلان", nameFr: "Sour El Ghozlane", postalCode: "10200", wilayaId: 10, dairaNameFr: "Sour El Ghozlane" },

  // Wilaya 11 - Tamanrasset
  { nameAr: "تمنراست", nameFr: "Tamanrasset", postalCode: "11000", wilayaId: 11, dairaNameFr: "Tamanrasset" },

  // Wilaya 12 - Tébessa
  { nameAr: "تبسة", nameFr: "Tébessa", postalCode: "12000", wilayaId: 12, dairaNameFr: "Tébessa" },
  { nameAr: "بئر العاتر", nameFr: "Bir El Ater", postalCode: "12400", wilayaId: 12, dairaNameFr: "Bir El Ater" },

  // Wilaya 13 - Tlemcen
  { nameAr: "تلمسان", nameFr: "Tlemcen", postalCode: "13000", wilayaId: 13, dairaNameFr: "Tlemcen" },
  { nameAr: "مغنية", nameFr: "Maghnia", postalCode: "13300", wilayaId: 13, dairaNameFr: "Maghnia" },

  // Wilaya 14 - Tiaret
  { nameAr: "تيارت", nameFr: "Tiaret", postalCode: "14000", wilayaId: 14, dairaNameFr: "Tiaret" },

  // Wilaya 15 - Tizi Ouzou
  { nameAr: "تيزي وزو", nameFr: "Tizi Ouzou", postalCode: "15000", wilayaId: 15, dairaNameFr: "Tizi Ouzou" },
  { nameAr: "ذراع الميزان", nameFr: "Draa El Mizan", postalCode: "15200", wilayaId: 15, dairaNameFr: "Draa El Mizan" },
  { nameAr: "عزازقة", nameFr: "Azazga", postalCode: "15300", wilayaId: 15, dairaNameFr: "Azazga" },

  // Wilaya 16 - Algiers
  { nameAr: "الجزائر الوسطى", nameFr: "Alger Centre", postalCode: "16000", wilayaId: 16, dairaNameFr: "Sidi M'Hamed" },
  { nameAr: "باب الوادي", nameFr: "Bab El Oued", postalCode: "16008", wilayaId: 16, dairaNameFr: "Bab El Oued" },
  { nameAr: "حسين داي", nameFr: "Hussein Dey", postalCode: "16040", wilayaId: 16, dairaNameFr: "Hussein Dey" },
  { nameAr: "بئر مراد رايس", nameFr: "Bir Mourad Raïs", postalCode: "16045", wilayaId: 16, dairaNameFr: "Bir Mourad Raïs" },
  { nameAr: "الدار البيضاء", nameFr: "Dar El Beïda", postalCode: "16110", wilayaId: 16, dairaNameFr: "Dar El Beïda" },
  { nameAr: "بابا حسن", nameFr: "Baba Hassen", postalCode: "16081", wilayaId: 16, dairaNameFr: "Draria" },
  { nameAr: "دالي إبراهيم", nameFr: "Dely Ibrahim", postalCode: "16320", wilayaId: 16, dairaNameFr: "Chéraga" },

  // Wilaya 17 - Djelfa
  { nameAr: "الجلفة", nameFr: "Djelfa", postalCode: "17000", wilayaId: 17, dairaNameFr: "Djelfa" },

  // Wilaya 18 - Jijel
  { nameAr: "جيجل", nameFr: "Jijel", postalCode: "18000", wilayaId: 18, dairaNameFr: "Jijel" },

  // Wilaya 19 - Sétif
  { nameAr: "سطيف", nameFr: "Sétif", postalCode: "19000", wilayaId: 19, dairaNameFr: "Sétif" },
  { nameAr: "العلمة", nameFr: "El Eulma", postalCode: "19300", wilayaId: 19, dairaNameFr: "El Eulma" },
  { nameAr: "برج بوعريريج", nameFr: "Ain Oulmene", postalCode: "19200", wilayaId: 19, dairaNameFr: "Ain Oulmene" },

  // Wilaya 20 - Saïda
  { nameAr: "سعيدة", nameFr: "Saïda", postalCode: "20000", wilayaId: 20, dairaNameFr: "Saïda" },

  // Wilaya 21 - Skikda
  { nameAr: "سكيكدة", nameFr: "Skikda", postalCode: "21000", wilayaId: 21, dairaNameFr: "Skikda" },

  // Wilaya 22 - Sidi Bel Abbès
  { nameAr: "سيدي بلعباس", nameFr: "Sidi Bel Abbès", postalCode: "22000", wilayaId: 22, dairaNameFr: "Sidi Bel Abbès" },

  // Wilaya 23 - Annaba
  { nameAr: "عنابة", nameFr: "Annaba", postalCode: "23000", wilayaId: 23, dairaNameFr: "Annaba" },
  { nameAr: "الحجار", nameFr: "El Hadjar", postalCode: "23200", wilayaId: 23, dairaNameFr: "El Hadjar" },

  // Wilaya 24 - Guelma
  { nameAr: "قالمة", nameFr: "Guelma", postalCode: "24000", wilayaId: 24, dairaNameFr: "Guelma" },

  // Wilaya 25 - Constantine
  { nameAr: "قسنطينة", nameFr: "Constantine", postalCode: "25000", wilayaId: 25, dairaNameFr: "Constantine" },
  { nameAr: "الخروب", nameFr: "El Khroub", postalCode: "25100", wilayaId: 25, dairaNameFr: "El Khroub" },
  { nameAr: "عين سمارة", nameFr: "Ain Smara", postalCode: "25140", wilayaId: 25, dairaNameFr: "Ain Smara" },

  // Wilaya 26 - Médéa
  { nameAr: "المدية", nameFr: "Médéa", postalCode: "26000", wilayaId: 26, dairaNameFr: "Médéa" },

  // Wilaya 27 - Mostaganem
  { nameAr: "مستغانم", nameFr: "Mostaganem", postalCode: "27000", wilayaId: 27, dairaNameFr: "Mostaganem" },

  // Wilaya 28 - M'Sila
  { nameAr: "المسيلة", nameFr: "M'Sila", postalCode: "28000", wilayaId: 28, dairaNameFr: "M'Sila" },

  // Wilaya 29 - Mascara
  { nameAr: "معسكر", nameFr: "Mascara", postalCode: "29000", wilayaId: 29, dairaNameFr: "Mascara" },

  // Wilaya 30 - Ouargla
  { nameAr: "ورقلة", nameFr: "Ouargla", postalCode: "30000", wilayaId: 30, dairaNameFr: "Ouargla" },
  { nameAr: "حاسي مسعود", nameFr: "Hassi Messaoud", postalCode: "30500", wilayaId: 30, dairaNameFr: "Hassi Messaoud" },

  // Wilaya 31 - Oran
  { nameAr: "وهران", nameFr: "Oran", postalCode: "31000", wilayaId: 31, dairaNameFr: "Oran" },
  { nameAr: "السانية", nameFr: "Es Sénia", postalCode: "31100", wilayaId: 31, dairaNameFr: "Es Sénia" },
  { nameAr: "بئر الجير", nameFr: "Bir El Djir", postalCode: "31024", wilayaId: 31, dairaNameFr: "Bir El Djir" },
  { nameAr: "وادي تليلات", nameFr: "Oued Tlelat", postalCode: "31300", wilayaId: 31, dairaNameFr: "Oued Tlelat" },

  // Wilaya 32 - El Bayadh
  { nameAr: "البيض", nameFr: "El Bayadh", postalCode: "32000", wilayaId: 32, dairaNameFr: "El Bayadh" },

  // Wilaya 33 - Illizi
  { nameAr: "إليزي", nameFr: "Illizi", postalCode: "33000", wilayaId: 33, dairaNameFr: "Illizi" },

  // Wilaya 34 - Bordj Bou Arréridj
  { nameAr: "برج بوعريريج", nameFr: "Bordj Bou Arréridj", postalCode: "34000", wilayaId: 34, dairaNameFr: "Bordj Bou Arréridj" },

  // Wilaya 35 - Boumerdès
  { nameAr: "بومرداس", nameFr: "Boumerdès", postalCode: "35000", wilayaId: 35, dairaNameFr: "Boumerdès" },
  { nameAr: "الرغاية", nameFr: "Rouiba", postalCode: "35100", wilayaId: 35, dairaNameFr: "Rouiba" },

  // Wilaya 36 - El Tarf
  { nameAr: "الطارف", nameFr: "El Tarf", postalCode: "36000", wilayaId: 36, dairaNameFr: "El Tarf" },

  // Wilaya 37 - Tindouf
  { nameAr: "تندوف", nameFr: "Tindouf", postalCode: "37000", wilayaId: 37, dairaNameFr: "Tindouf" },

  // Wilaya 38 - Tissemsilt
  { nameAr: "تيسمسيلت", nameFr: "Tissemsilt", postalCode: "38000", wilayaId: 38, dairaNameFr: "Tissemsilt" },

  // Wilaya 39 - El Oued
  { nameAr: "الوادي", nameFr: "El Oued", postalCode: "39000", wilayaId: 39, dairaNameFr: "El Oued" },

  // Wilaya 40 - Khenchela
  { nameAr: "خنشلة", nameFr: "Khenchela", postalCode: "40000", wilayaId: 40, dairaNameFr: "Khenchela" },

  // Wilaya 41 - Souk Ahras
  { nameAr: "سوق أهراس", nameFr: "Souk Ahras", postalCode: "41000", wilayaId: 41, dairaNameFr: "Souk Ahras" },

  // Wilaya 42 - Tipaza
  { nameAr: "تيبازة", nameFr: "Tipaza", postalCode: "42000", wilayaId: 42, dairaNameFr: "Tipaza" },
  { nameAr: "شرشال", nameFr: "Cherchell", postalCode: "42200", wilayaId: 42, dairaNameFr: "Cherchell" },

  // Wilaya 43 - Mila
  { nameAr: "ميلة", nameFr: "Mila", postalCode: "43000", wilayaId: 43, dairaNameFr: "Mila" },

  // Wilaya 44 - Aïn Defla
  { nameAr: "عين الدفلى", nameFr: "Aïn Defla", postalCode: "44000", wilayaId: 44, dairaNameFr: "Aïn Defla" },

  // Wilaya 45 - Naâma
  { nameAr: "النعامة", nameFr: "Naâma", postalCode: "45000", wilayaId: 45, dairaNameFr: "Naâma" },

  // Wilaya 46 - Aïn Témouchent
  { nameAr: "عين تيموشنت", nameFr: "Aïn Témouchent", postalCode: "46000", wilayaId: 46, dairaNameFr: "Aïn Témouchent" },

  // Wilaya 47 - Ghardaïa
  { nameAr: "غرداية", nameFr: "Ghardaïa", postalCode: "47000", wilayaId: 47, dairaNameFr: "Ghardaïa" },

  // Wilaya 48 - Relizane
  { nameAr: "غليزان", nameFr: "Relizane", postalCode: "48000", wilayaId: 48, dairaNameFr: "Relizane" },

  // Wilaya 49 - Timimoun
  { nameAr: "تيميمون", nameFr: "Timimoun", postalCode: "49000", wilayaId: 49, dairaNameFr: "Timimoun" },

  // Wilaya 50 - Bordj Badji Mokhtar
  { nameAr: "برج باجي مختار", nameFr: "Bordj Badji Mokhtar", postalCode: "50000", wilayaId: 50, dairaNameFr: "Bordj Badji Mokhtar" },

  // Wilaya 51 - Ouled Djellal
  { nameAr: "أولاد جلال", nameFr: "Ouled Djellal", postalCode: "51000", wilayaId: 51, dairaNameFr: "Ouled Djellal" },

  // Wilaya 52 - Béni Abbès
  { nameAr: "بني عباس", nameFr: "Béni Abbès", postalCode: "52000", wilayaId: 52, dairaNameFr: "Béni Abbès" },

  // Wilaya 53 - In Salah
  { nameAr: "عين صالح", nameFr: "In Salah", postalCode: "53000", wilayaId: 53, dairaNameFr: "In Salah" },

  // Wilaya 54 - In Guezzam
  { nameAr: "عين قزام", nameFr: "In Guezzam", postalCode: "54000", wilayaId: 54, dairaNameFr: "In Guezzam" },

  // Wilaya 55 - Touggourt
  { nameAr: "توقرت", nameFr: "Touggourt", postalCode: "55000", wilayaId: 55, dairaNameFr: "Touggourt" },

  // Wilaya 56 - Djanet
  { nameAr: "جانت", nameFr: "Djanet", postalCode: "56000", wilayaId: 56, dairaNameFr: "Djanet" },

  // Wilaya 57 - El M'Ghair
  { nameAr: "المغير", nameFr: "El M'Ghair", postalCode: "57000", wilayaId: 57, dairaNameFr: "El M'Ghair" },

  // Wilaya 58 - El Meniaa
  { nameAr: "المنيعة", nameFr: "El Meniaa", postalCode: "58000", wilayaId: 58, dairaNameFr: "El Meniaa" },
];
