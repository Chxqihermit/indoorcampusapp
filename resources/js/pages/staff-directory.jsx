import CampusPageLayout from "@/layouts/campus-page-layout";
import { Head } from "@inertiajs/react";
import { useMemo, useState } from "react";

const STAFF = [{"name": "Prof Fungai Bhunu Shava", "position": "Acting Executive Dean", "department": "Office of the Executive Dean", "school": "", "ext": "2510", "phone": "081 328 9988", "email": "fbshava@nust.na", "building": "IT House", "room": "30", "phone_raw": "0813289988", "id": 1, "tel": "+264813289988", "school_short": "", "unit": "Office of the Executive Dean"}, {"name": "Ms Rauna Matheus", "position": "Secretary to the Dean", "department": "Office of the Executive Dean", "school": "", "ext": "2396", "phone": "085 640 4613", "email": "rmatheus@nust.na", "building": "IT House", "room": "2", "phone_raw": "0856404613", "id": 2, "tel": "+264856404613", "school_short": "", "unit": "Office of the Executive Dean"}, {"name": "Ms Ottilie Itana", "position": "Receptionist", "department": "Office of the Executive Dean", "school": "", "ext": "1742", "phone": "081 410 6722", "email": "oitana@nust.na", "building": "IT House", "room": "3", "phone_raw": "0814106722", "id": 3, "tel": "+264814106722", "school_short": "", "unit": "Office of the Executive Dean"}, {"name": "Ms Julia Semi", "position": "Faculty Officer", "department": "Office of the Executive Dean", "school": "", "ext": "2923", "phone": "081 242 9281", "email": "jsemi@nust.na", "building": "IT House", "room": "7", "phone_raw": "0812429281", "id": 4, "tel": "+264812429281", "school_short": "", "unit": "Office of the Executive Dean"}, {"name": "Mr Dimbulukweni Nauyoma", "position": "Assistant Faculty Officer", "department": "Office of the Executive Dean", "school": "", "ext": "2384", "phone": "085 755 3977", "email": "dnauyoma@nust.na", "building": "IT House", "room": "7", "phone_raw": "0857553977", "id": 5, "tel": "+264857553977", "school_short": "", "unit": "Office of the Executive Dean"}, {"name": "Ms Loini Iiyambo", "position": "Center Head", "department": "INCEIT", "school": "", "ext": "2446", "phone": "081 150 9678", "email": "liiyambo@nust.na", "building": "INCEIT", "room": "n/a", "phone_raw": "0811509678", "id": 6, "tel": "+264811509678", "school_short": "", "unit": "INCEIT"}, {"name": "Ms Laina Ndeumane", "position": "CEIT Reception", "department": "INCEIT", "school": "", "ext": "2578", "phone": "081 363 7589", "email": "ceit.info@nust.na", "building": "INCEIT", "room": "n/a", "phone_raw": "0813637589", "id": 7, "tel": "+264813637589", "school_short": "", "unit": "INCEIT"}, {"name": "Mr Helsona Ickua", "position": "CEIT Lab Technitian", "department": "INCEIT", "school": "", "ext": "2861", "phone": "081 699 6342", "email": "hickua@nust.na", "building": "INCEIT", "room": "lab", "phone_raw": "0816996342", "id": 8, "tel": "+264816996342", "school_short": "", "unit": "INCEIT"}, {"name": "Mr Wilbard Kamati", "position": "Lecturer", "department": "INCEIT", "school": "", "ext": "", "phone": "081 687 0681", "email": "wkamati@nust.na", "building": "INCEIT", "room": "n/a", "phone_raw": "0816870681", "id": 9, "tel": "+264816870681", "school_short": "", "unit": "INCEIT"}, {"name": "Prof Guy Lusilao Zodi", "position": "Associate Dean:School of Computing", "department": "", "school": "School of Computing", "ext": "2774", "phone": "081 367 7286", "email": "gzodi@nust.na", "building": "IT House", "room": "17", "phone_raw": "0813677286", "id": 10, "tel": "+264813677286", "school_short": "School of Computing", "unit": "School of Computing"}, {"name": "Dr Simon Munchinenyika", "position": "Head of Department: Software Engineering", "department": "Software Engineering", "school": "School of Computing", "ext": "2054", "phone": "081 367 3361", "email": "smuchinenyika@nust.na", "building": "Poly Height", "room": "201", "phone_raw": "0813673361", "id": 11, "tel": "+264813673361", "school_short": "School of Computing", "unit": "Software Engineering"}, {"name": "Prof Jose Quenum", "position": "Professor", "department": "Software Engineering", "school": "School of Computing", "ext": "2235", "phone": "081 663 5305", "email": "jquenum@nust.na", "building": "Science & Tech", "room": "2,82", "phone_raw": "0816635305", "id": 12, "tel": "+264816635305", "school_short": "School of Computing", "unit": "Software Engineering"}, {"name": "Prof Heike Winschiers-Theophilus", "position": "Professor", "department": "Software Engineering", "school": "School of Computing", "ext": "2168", "phone": "081 319 8582", "email": "hwinschiers@nust.na", "building": "HTTPS", "room": "", "phone_raw": "0813198582", "id": 13, "tel": "+264813198582", "school_short": "School of Computing", "unit": "Software Engineering"}, {"name": "Prof Azeta Ambrose", "position": "Professor", "department": "Software Engineering", "school": "School of Computing", "ext": "2673", "phone": "081 364 3798", "email": "aazeta@nust.na", "building": "Office building", "room": "159", "phone_raw": "0813643798", "id": 14, "tel": "+264813643798", "school_short": "School of Computing", "unit": "Software Engineering"}, {"name": "Dr Gereon Kapuire", "position": "Senior Lecturer", "department": "Software Engineering", "school": "School of Computing", "ext": "2334", "phone": "081 208 7221", "email": "gkapuire@nust.na", "building": "HTTPS", "room": "", "phone_raw": "0812087221", "id": 15, "tel": "+264812087221", "school_short": "School of Computing", "unit": "Software Engineering"}, {"name": "Ms Shilumbe Chivuno-Kuria", "position": "Lecturer", "department": "Software Engineering", "school": "School of Computing", "ext": "2057", "phone": "081 271 8391", "email": "schivuno@nust.na", "building": "Poly Height", "room": "404", "phone_raw": "0812718391", "id": 16, "tel": "+264812718391", "school_short": "School of Computing", "unit": "Software Engineering"}, {"name": "Ms Rosetha Kays", "position": "Lecturer", "department": "Software Engineering", "school": "School of Computing", "ext": "2405", "phone": "081 302 3482", "email": "rkays@nust.na", "building": "Poly Height", "room": "404", "phone_raw": "0813023482", "id": 17, "tel": "+264813023482", "school_short": "School of Computing", "unit": "Software Engineering"}, {"name": "Mr Steven Tjiraso", "position": "Lecturer", "department": "Software Engineering", "school": "School of Computing", "ext": "2097", "phone": "085 686 6610", "email": "stjiraso@nust.na", "building": "HTTPS", "room": "", "phone_raw": "0856866610", "id": 18, "tel": "+264856866610", "school_short": "School of Computing", "unit": "Software Engineering"}, {"name": "Ms Ndinelago Nashandi", "position": "Lecturer", "department": "Software Engineering", "school": "School of Computing", "ext": "2911", "phone": "081 867 8032", "email": "nnashandi@nust.na", "building": "IT House", "room": "23", "phone_raw": "0818678032", "id": 19, "tel": "+264818678032", "school_short": "School of Computing", "unit": "Software Engineering"}, {"name": "Mr Herman Kandjimi", "position": "Lecturer", "department": "Software Engineering", "school": "School of Computing", "ext": "2782", "phone": "081 406 0167", "email": "hkandjimi@nust.na", "building": "Poly Height", "room": "202", "phone_raw": "0814060167", "id": 20, "tel": "+264814060167", "school_short": "School of Computing", "unit": "Software Engineering"}, {"name": "Mr Naftal Indongo", "position": "Lecturer", "department": "Software Engineering", "school": "School of Computing", "ext": "2459", "phone": "081 672 1865", "email": "nindongo@nust.na", "building": "IT House", "room": "18", "phone_raw": "0816721865", "id": 21, "tel": "+264816721865", "school_short": "School of Computing", "unit": "Software Engineering"}, {"name": "Ms Josephine Muntuumo", "position": "Lecturer", "department": "Software Engineering", "school": "School of Computing", "ext": "2167", "phone": "081 406 3093", "email": "jmuntuumo@nust.na", "building": "IT House", "room": "6", "phone_raw": "0814063093", "id": 22, "tel": "+264814063093", "school_short": "School of Computing", "unit": "Software Engineering"}, {"name": "Mr Mike Kale", "position": "Lecturer", "department": "Software Engineering", "school": "School of Computing", "ext": "2486", "phone": "081 211 3456", "email": "mkale@nust.na", "building": "IT House", "room": "5", "phone_raw": "0812113456", "id": 23, "tel": "+264812113456", "school_short": "School of Computing", "unit": "Software Engineering"}, {"name": "Mr Tendai Mataranyika", "position": "Lecturer", "department": "Software Engineering", "school": "School of Computing", "ext": "", "phone": "", "email": "tmataranyika@nust.na", "building": "IT House", "room": "", "phone_raw": "", "id": 24, "tel": "", "school_short": "School of Computing", "unit": "Software Engineering"}, {"name": "Prof Mercy Chitauro", "position": "Head of Department", "department": "Cybersecurity", "school": "School of Computing", "ext": "2039", "phone": "081 725 4253", "email": "mchitauro@nust.na", "building": "IT House", "room": "", "phone_raw": "0817254253", "id": 25, "tel": "+264817254253", "school_short": "School of Computing", "unit": "Cybersecurity"}, {"name": "Prof Attlee Gamundani", "position": "Professor", "department": "Cybersecurity", "school": "School of Computing", "ext": "", "phone": "081 646 6549", "email": "agamundani@nust.na", "building": "", "room": "", "phone_raw": "0816466549", "id": 26, "tel": "+264816466549", "school_short": "School of Computing", "unit": "Cybersecurity"}, {"name": "Mr Isaac Nhamu", "position": "Lecturer", "department": "Cybersecurity", "school": "School of Computing", "ext": "2074", "phone": "081 373 9496", "email": "inhamu@nust.na", "building": "HTTPS", "room": "23", "phone_raw": "0813739496", "id": 27, "tel": "+264813739496", "school_short": "School of Computing", "unit": "Cybersecurity"}, {"name": "Mr Shadreck Chitauro", "position": "Lecturer", "department": "Cybersecurity", "school": "School of Computing", "ext": "2689", "phone": "081 385 1853", "email": "schitauro@nust.na", "building": "Office Building", "room": "161", "phone_raw": "0813851853", "id": 28, "tel": "+264813851853", "school_short": "School of Computing", "unit": "Cybersecurity"}, {"name": "Ms Victoria Shakela", "position": "Lecturer", "department": "Cybersecurity", "school": "School of Computing", "ext": "2856", "phone": "085 236 4662", "email": "vshakela@nust.na", "building": "IT House", "room": "47", "phone_raw": "0852364662", "id": 29, "tel": "+264852364662", "school_short": "School of Computing", "unit": "Cybersecurity"}, {"name": "Mr Julius Silaa", "position": "Lecturer", "department": "Cybersecurity", "school": "School of Computing", "ext": "2037", "phone": "081 299 1858", "email": "jsilaa@nust.na", "building": "Poly Heights", "room": "401", "phone_raw": "0812991858", "id": 30, "tel": "+264812991858", "school_short": "School of Computing", "unit": "Cybersecurity"}, {"name": "Dr Jain Arpit", "position": "Lecturer", "department": "Cybersecurity", "school": "School of Computing", "ext": "2814", "phone": "081 218 5128", "email": "ajain@nust.na", "building": "Poly Heights", "room": "403", "phone_raw": "0812185128", "id": 31, "tel": "+264812185128", "school_short": "School of Computing", "unit": "Cybersecurity"}, {"name": "Ms Mbasuva Uakomba", "position": "Junior Lecturer", "department": "Cybersecurity", "school": "School of Computing", "ext": "2761", "phone": "081 490 3631", "email": "umbasuva@nust.na", "building": "", "room": "", "phone_raw": "0814903631", "id": 32, "tel": "+264814903631", "school_short": "School of Computing", "unit": "Cybersecurity"}, {"name": "Ms Hillary Kwala", "position": "Junior Lecturer", "department": "Cybersecurity", "school": "School of Computing", "ext": "2136", "phone": "081 215 9673", "email": "hkwala@nust.na", "building": "Poly Heights", "room": "405", "phone_raw": "0812159673", "id": 33, "tel": "+264812159673", "school_short": "School of Computing", "unit": "Cybersecurity"}, {"name": "Mr Edward Nepolo", "position": "Head of Department: Computer Science", "department": "Computer Science", "school": "School of Computing", "ext": "2520", "phone": "081 329 0294", "email": "enepolo@nust.na", "building": "IT House", "room": "17", "phone_raw": "0813290294", "id": 34, "tel": "+264813290294", "school_short": "School of Computing", "unit": "Computer Science"}, {"name": "Prof. Dharm Singh Jat", "position": "Professor", "department": "Computer Science", "school": "School of Computing", "ext": "2991", "phone": "081 035 3230", "email": "dsingh@nust.na", "building": "Poly Height", "room": "201", "phone_raw": "0810353230", "id": 35, "tel": "+264810353230", "school_short": "School of Computing", "unit": "Computer Science"}, {"name": "Dr Simate Zilole", "position": "Senior Lecturer", "department": "Computer Science", "school": "School of Computing", "ext": "", "phone": "081813560", "email": "zsimate@nust.na", "building": "IT House", "room": "", "phone_raw": "081813560", "id": 36, "tel": "+26481813560", "school_short": "School of Computing", "unit": "Computer Science"}, {"name": "Mr Peter Gallert", "position": "Lecturer", "department": "Computer Science", "school": "School of Computing", "ext": "2268", "phone": "085 600 9644", "email": "pgallert@nust.na", "building": "IT House", "room": "24", "phone_raw": "0856009644", "id": 37, "tel": "+264856009644", "school_short": "School of Computing", "unit": "Computer Science"}, {"name": "Ms Teresia Ankome", "position": "Lecturer", "department": "Computer Science", "school": "School of Computing", "ext": "2420", "phone": "081 286 2274", "email": "tankome@nust.na", "building": "IT House", "room": "23", "phone_raw": "0812862274", "id": 38, "tel": "+264812862274", "school_short": "School of Computing", "unit": "Computer Science"}, {"name": "Ms Albertina Shilongo", "position": "Lecturer", "department": "Computer Science", "school": "School of Computing", "ext": "2691", "phone": "081 284 6151", "email": "ashilongo@nust.na", "building": "IT House", "room": "18", "phone_raw": "0812846151", "id": 39, "tel": "+264812846151", "school_short": "School of Computing", "unit": "Computer Science"}, {"name": "Ms Jovita Mateus", "position": "Lecturer", "department": "Computer Science", "school": "School of Computing", "ext": "2771", "phone": "081 849 7543", "email": "Jmateus@nust.na", "building": "IT House", "room": "9", "phone_raw": "0818497543", "id": 40, "tel": "+264818497543", "school_short": "School of Computing", "unit": "Computer Science"}, {"name": "Mr Shoopala Nambahu", "position": "Lecturer", "department": "Computer Science", "school": "School of Computing", "ext": "2550", "phone": "081 200 5337", "email": "snambahu@nust.na", "building": "INCEIT", "room": "n/a", "phone_raw": "0812005337", "id": 41, "tel": "+264812005337", "school_short": "School of Computing", "unit": "Computer Science"}, {"name": "Ms Helena Hainana", "position": "Lecturer", "department": "Computer Science", "school": "School of Computing", "ext": "2099", "phone": "081 844 5390", "email": "hhainana@nust.na", "building": "IT House", "room": "21", "phone_raw": "0818445390", "id": 42, "tel": "+264818445390", "school_short": "School of Computing", "unit": "Computer Science"}, {"name": "Mr Nasimane Ekandjo", "position": "Junior Lecturer", "department": "Computer Science", "school": "School of Computing", "ext": "2572", "phone": "081 229 4206", "email": "nekandjo@nust.na", "building": "IT House", "room": "24", "phone_raw": "0812294206", "id": 43, "tel": "+264812294206", "school_short": "School of Computing", "unit": "Computer Science"}, {"name": "Prof Suama L Hamunyela", "position": "Associate Dean: School of Informatics, Journalism and Media Technology", "department": "", "school": "School of Informatics, Journalism and Media Technology", "ext": "2922", "phone": "081 461 8657", "email": "slhamunyela@nust.na", "building": "IT House", "room": "29", "phone_raw": "0814618657", "id": 44, "tel": "+264814618657", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "School of Informatics, Journalism and Media Technology"}, {"name": "Dr Munyaradzi Maravanyika", "position": "Head of Department: Informatics", "department": "", "school": "School of Informatics, Journalism and Media Technology", "ext": "2263", "phone": "085 636 5330", "email": "mmaravanyika@nust.na", "building": "IT House", "room": "15", "phone_raw": "0856365330", "id": 45, "tel": "+264856365330", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "School of Informatics, Journalism and Media Technology"}, {"name": "Prof Jude Osakwe", "position": "Professor", "department": "Informatics", "school": "School of Informatics, Journalism and Media Technology", "ext": "2952", "phone": "081 360 8119", "email": "josakwe@nust.na", "building": "Poly Height", "room": "405", "phone_raw": "0813608119", "id": 46, "tel": "+264813608119", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "Informatics"}, {"name": "Prof Samuel Akinsola", "position": "Associate Professor", "department": "Informatics", "school": "School of Informatics, Journalism and Media Technology", "ext": "2704", "phone": "081 458 8981", "email": "sakinsola@nust.na", "building": "Poly Height", "room": "401", "phone_raw": "0814588981", "id": 47, "tel": "+264814588981", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "Informatics"}, {"name": "Prof Stephen Fashoto", "position": "Associate Professor", "department": "Informatics", "school": "School of Informatics, Journalism and Media Technology", "ext": "2395", "phone": "081 869 4929", "email": "sfashoto@nust.na", "building": "Polyheits", "room": "202", "phone_raw": "0818694929", "id": 48, "tel": "+264818694929", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "Informatics"}, {"name": "Prof Irja Shaanika", "position": "Associate Professor", "department": "Informatics", "school": "School of Informatics, Journalism and Media Technology", "ext": "2620", "phone": "081 206 2885", "email": "ishaanika@nust.na", "building": "HTTPS", "room": "", "phone_raw": "0812062885", "id": 49, "tel": "+264812062885", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "Informatics"}, {"name": "Dr Gabriel Nhinda", "position": "Senior Lecturer", "department": "Informatics", "school": "School of Informatics, Journalism and Media Technology", "ext": "2724", "phone": "081 277 2528", "email": "gnhinda@nust.na", "building": "HTTPS", "room": "", "phone_raw": "0812772528", "id": 50, "tel": "+264812772528", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "Informatics"}, {"name": "Dr Cleopas Kwenda", "position": "Senior Lecturer", "department": "Informatics", "school": "School of Informatics, Journalism and Media Technology", "ext": "2316", "phone": "081 635 2863", "email": "ckwenda@nust.na", "building": "Poly Heights", "room": "401", "phone_raw": "0816352863", "id": 51, "tel": "+264816352863", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "Informatics"}, {"name": "Dr Richard Maliwatu", "position": "Lecturer", "department": "Informatics", "school": "School of Informatics, Journalism and Media Technology", "ext": "2206", "phone": "081 304 3119", "email": "rmaliwatu@nust.na", "building": "", "room": "", "phone_raw": "0813043119", "id": 52, "tel": "+264813043119", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "Informatics"}, {"name": "Mr Johnson Billawer", "position": "Lecturer", "department": "Informatics", "school": "School of Informatics, Journalism and Media Technology", "ext": "2705", "phone": "081 382 6833", "email": "jbillawer@nust.na", "building": "Poly Height", "room": "403", "phone_raw": "0813826833", "id": 53, "tel": "+264813826833", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "Informatics"}, {"name": "Mr Admire Kachepa", "position": "Lecturer", "department": "Informatics", "school": "School of Informatics, Journalism and Media Technology", "ext": "2476", "phone": "081 314 1362", "email": "akachepa@nust.na", "building": "Poly Height", "room": "201", "phone_raw": "0813141362", "id": 54, "tel": "+264813141362", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "Informatics"}, {"name": "Dr Sebastian Mukumbira", "position": "Lecturer", "department": "Informatics", "school": "School of Informatics, Journalism and Media Technology", "ext": "2895", "phone": "081 279 0059", "email": "smukumbira@nust.na", "building": "IT House", "room": "4", "phone_raw": "0812790059", "id": 55, "tel": "+264812790059", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "Informatics"}, {"name": "Mr Eliazer Mbaeva", "position": "Lecturer", "department": "Informatics", "school": "School of Informatics, Journalism and Media Technology", "ext": "2700", "phone": "081 749 9040", "email": "embaeva@nust.na", "building": "CEIT", "room": "K1", "phone_raw": "0817499040", "id": 56, "tel": "+264817499040", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "Informatics"}, {"name": "Mr Nkululeko Mthembo", "position": "Lecturer", "department": "Informatics", "school": "School of Informatics, Journalism and Media Technology", "ext": "2747", "phone": "081 412 5995", "email": "nmthembo@nust.na", "building": "Poly Height", "room": "202", "phone_raw": "0814125995", "id": 57, "tel": "+264814125995", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "Informatics"}, {"name": "Ms Sinte Mutelo", "position": "Lecturer", "department": "Informatics", "school": "School of Informatics, Journalism and Media Technology", "ext": "2648", "phone": "081 374 8822", "email": "smutelo@nust.na", "building": "IT House", "room": "22", "phone_raw": "0813748822", "id": 58, "tel": "+264813748822", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "Informatics"}, {"name": "Ms Katazo N Amunkete", "position": "Lecturer", "department": "Informatics", "school": "School of Informatics, Journalism and Media Technology", "ext": "2102", "phone": "081 212 8604", "email": "namunkete@nust.na", "building": "IT House", "room": "22", "phone_raw": "0812128604", "id": 59, "tel": "+264812128604", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "Informatics"}, {"name": "Ms Selma Phillemon", "position": "Lecturer", "department": "Informatics", "school": "School of Informatics, Journalism and Media Technology", "ext": "", "phone": "081 283 5169", "email": "sphillemon@nust.na", "building": "IT House", "room": "51", "phone_raw": "0812835169", "id": 60, "tel": "+264812835169", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "Informatics"}, {"name": "Ms Lydia Endjala", "position": "Lecturer", "department": "Informatics", "school": "School of Informatics, Journalism and Media Technology", "ext": "2760", "phone": "", "email": "lendjala@nust.na", "building": "IT House", "room": "51", "phone_raw": "", "id": 61, "tel": "", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "Informatics"}, {"name": "Prof Phillip Santos", "position": "Head of Department: Journalism and Media Technology", "department": "JOURNALISM AND MEDIA TECHNOLOGY", "school": "School of Informatics, Journalism and Media Technology", "ext": "2666", "phone": "081 779 4891", "email": "psantos@nust.na", "building": "Science & Tech", "room": "2,79", "phone_raw": "0817794891", "id": 62, "tel": "+264817794891", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "JOURNALISM AND MEDIA TECHNOLOGY"}, {"name": "Dr Wanja Njuguna", "position": "Senior Lecturer", "department": "JOURNALISM AND MEDIA TECHNOLOGY", "school": "School of Informatics, Journalism and Media Technology", "ext": "2892", "phone": "081 322 4981", "email": "pwnjuguna@nust.na", "building": "Science & Tech", "room": "?", "phone_raw": "0813224981", "id": 63, "tel": "+264813224981", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "JOURNALISM AND MEDIA TECHNOLOGY"}, {"name": "Dr Ndlovu Khulekani", "position": "Senior Lecturer", "department": "JOURNALISM AND MEDIA TECHNOLOGY", "school": "School of Informatics, Journalism and Media Technology", "ext": "", "phone": "081 232 5359", "email": "kndlovu@nust.na", "building": "Science & Tech", "room": "", "phone_raw": "0812325359", "id": 64, "tel": "+264812325359", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "JOURNALISM AND MEDIA TECHNOLOGY"}, {"name": "Dr Hugh Ellis", "position": "Senior Lecturer", "department": "JOURNALISM AND MEDIA TECHNOLOGY", "school": "School of Informatics, Journalism and Media Technology", "ext": "2893", "phone": "085 554 6282", "email": "hellis@nust.na", "building": "Science & Tech", "room": "2,71", "phone_raw": "0855546282", "id": 65, "tel": "+264855546282", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "JOURNALISM AND MEDIA TECHNOLOGY"}, {"name": "Dr Sadrag Shihomeka", "position": "Senior Lecturer", "department": "JOURNALISM AND MEDIA TECHNOLOGY", "school": "School of Informatics, Journalism and Media Technology", "ext": "2181", "phone": "081 279 8401", "email": "cshihomeka@nust.na", "building": "Science & Tech", "room": "2,81", "phone_raw": "0812798401", "id": 66, "tel": "+264812798401", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "JOURNALISM AND MEDIA TECHNOLOGY"}, {"name": "Mr Frans Anthony", "position": "Lecturer", "department": "JOURNALISM AND MEDIA TECHNOLOGY", "school": "School of Informatics, Journalism and Media Technology", "ext": "", "phone": "081 267 0887", "email": "afrans@nust.na", "building": "Science & Tech", "room": "", "phone_raw": "0812670887", "id": 67, "tel": "+264812670887", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "JOURNALISM AND MEDIA TECHNOLOGY"}, {"name": "Mr Francois Andreas", "position": "Studio Technician", "department": "JOURNALISM AND MEDIA TECHNOLOGY", "school": "School of Informatics, Journalism and Media Technology", "ext": "2198", "phone": "081 348 4896", "email": "fandreas@nust.na", "building": "Science & Tech", "room": "2,73", "phone_raw": "0813484896", "id": 68, "tel": "+264813484896", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "JOURNALISM AND MEDIA TECHNOLOGY"}, {"name": "Ms Jordaania Andima", "position": "HOD: Digital Arts and Animation", "department": "DIGITAL ARTS AND ANIMATION", "school": "School of Informatics, Journalism and Media Technology", "ext": "2360", "phone": "081 404 0473", "email": "jkandima@nust.na", "building": "Science & Tech", "room": "2,72", "phone_raw": "0814040473", "id": 69, "tel": "+264814040473", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "DIGITAL ARTS AND ANIMATION"}, {"name": "Dr Mellisa Allela", "position": "Senior Lecturer", "department": "DIGITAL ARTS AND ANIMATION", "school": "School of Informatics, Journalism and Media Technology", "ext": "", "phone": "081 768 8627", "email": "mallela@nust.na", "building": "Science & Tech", "room": "", "phone_raw": "0817688627", "id": 70, "tel": "+264817688627", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "DIGITAL ARTS AND ANIMATION"}, {"name": "Ms Klaudia Iyambo", "position": "Laboratory Technician", "department": "DIGITAL ARTS AND ANIMATION", "school": "School of Informatics, Journalism and Media Technology", "ext": "", "phone": "081 217 7666", "email": "kiyambo@nust.na", "building": "Science & Tech", "room": "", "phone_raw": "0812177666", "id": 71, "tel": "+264812177666", "school_short": "School of Informatics, Journalism & Media Tech", "unit": "DIGITAL ARTS AND ANIMATION"}, {"name": "Mr Ronald Karon", "position": "Section Head: CUS and ICT", "department": "Computer User Skills/ Information Competence", "school": "", "ext": "2161", "phone": "081 374 8473", "email": "rkaron@nust.na", "building": "Office b/d floor 1", "room": "151", "phone_raw": "0813748473", "id": 72, "tel": "+264813748473", "school_short": "", "unit": "Computer User Skills/ Information Competence"}, {"name": "Mr Andreas Kalimbo", "position": "Coordinator: CUS and ICT", "department": "Computer User Skills/ Information Competence", "school": "", "ext": "2840", "phone": "081 494 1034", "email": "akalimbo@nust.na", "building": "Library", "room": "", "phone_raw": "0814941034", "id": 73, "tel": "+264814941034", "school_short": "", "unit": "Computer User Skills/ Information Competence"}, {"name": "Mr Pedulu Hauwanga", "position": "HR Business Partner", "department": "Support Unit", "school": "", "ext": "2086", "phone": "", "email": "phauwanga@nust.na", "building": "Admin b/d floor 2", "room": "", "phone_raw": "", "id": 74, "tel": "", "school_short": "", "unit": "Support Unit"}, {"name": "Ms Iris Kamberipa", "position": "Human Capital Business Partner", "department": "Support Unit", "school": "", "ext": "2116", "phone": "", "email": "ikamberipa@nust.na", "building": "Admin b/d floor 2", "room": "", "phone_raw": "", "id": 75, "tel": "", "school_short": "", "unit": "Support Unit"}, {"name": "Mr Agas Shihepo", "position": "Techinician", "department": "Support Unit", "school": "", "ext": "2823", "phone": "", "email": "ashihepo@nust.na", "building": "Office building", "room": "Tech offie1", "phone_raw": "", "id": 76, "tel": "", "school_short": "", "unit": "Support Unit"}, {"name": "Mr Ephath Shimhanda", "position": "Techinician", "department": "Support Unit", "school": "", "ext": "2832", "phone": "081 562 7695", "email": "eshimhanda@nust.na", "building": "office building", "room": "Tech offie2", "phone_raw": "0815627695", "id": 77, "tel": "+264815627695", "school_short": "", "unit": "Support Unit"}, {"name": "Ms Josefina Olavi", "position": "Technician", "department": "Support Unit", "school": "", "ext": "2867", "phone": "081 499 0997", "email": "jolavi@nust.na", "building": "office building", "room": "Tech offie2", "phone_raw": "0814990997", "id": 78, "tel": "+264814990997", "school_short": "", "unit": "Support Unit"}, {"name": "Mr Mario Tripodi", "position": "Senior Lab Technician", "department": "Support Unit", "school": "", "ext": "2632", "phone": "081 244 3472", "email": "mtripodi@nust.na", "building": "Office building", "room": "Tech offie1", "phone_raw": "0812443472", "id": 79, "tel": "+264812443472", "school_short": "", "unit": "Support Unit"}, {"name": "Ms Alina Nakaande", "position": "Librarian", "department": "Support Unit", "school": "", "ext": "2627", "phone": "", "email": "anakaande@nust.na", "building": "Library", "room": "", "phone_raw": "", "id": 80, "tel": "", "school_short": "", "unit": "Support Unit"}, {"name": "Ms Aletta Limon", "position": "Examinations Officer", "department": "Support Unit", "school": "", "ext": "2067", "phone": "", "email": "alimon@nust.na", "building": "IT House", "room": "", "phone_raw": "", "id": 81, "tel": "", "school_short": "", "unit": "Support Unit"}, {"name": "Mr Kapelwa Khumalo", "position": "Industry liason officer", "department": "Support Unit", "school": "", "ext": "2652", "phone": "", "email": "kkapelwa@nust.na", "building": "Polyheights 5th floor", "room": "", "phone_raw": "", "id": 82, "tel": "", "school_short": "", "unit": "Support Unit"}, {"name": "Ms Zodid Gaseb", "position": "International relations officer", "department": "Support Unit", "school": "", "ext": "2812", "phone": "", "email": "ggaseb@nust.na", "building": "International Relations liason for FCI", "room": "", "phone_raw": "", "id": 83, "tel": "", "school_short": "", "unit": "Support Unit"}, {"name": "Mr Nicotimas Gabriel", "position": "Technical Assistant Carpentry", "department": "Support Unit", "school": "", "ext": "2744", "phone": "", "email": "ngabriel@nust.na", "building": "Lecture building basement", "room": "", "phone_raw": "", "id": 84, "tel": "", "school_short": "", "unit": "Support Unit"}, {"name": "Ms Shanice Clay", "position": "Procurement Officer", "department": "Support Unit", "school": "", "ext": "2041", "phone": "", "email": "sclay@nust.na", "building": "Finance Department", "room": "", "phone_raw": "", "id": 85, "tel": "", "school_short": "", "unit": "Support Unit"}, {"name": "Mr Frank Puriza", "position": "Acting Director", "department": "Support Unit", "school": "", "ext": "2973", "phone": "", "email": "fpuriza@nust.na", "building": "DAWASCO building", "room": "", "phone_raw": "", "id": 86, "tel": "", "school_short": "", "unit": "Support Unit"}];

const PALETTE = ['#063b3e','#0a5256','#8a5a1f','#3a5a40','#5a3e7a','#7a2e3e','#1f4e6b','#6b4226'];

function deptColor(unit) {
  let h = 0;
  for (const c of unit) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function getInitials(name) {
  const n = name.replace(/^(Prof\.?|Dr|Mr|Ms|Mrs)\s+/i, '').trim().split(/\s+/);
  return ((n[0] || '')[0] || '') + ((n[n.length - 1] || '')[0] || '');
}

function highlight(text, terms) {
  if (!terms.length || !text) return text;
  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(re);
  return parts.map((part, i) => {
    const isMatch = terms.some(t => part.toLowerCase() === t.toLowerCase());
    return isMatch ? <mark key={i} className="bg-amber-100 rounded-sm px-0.5">{part}</mark> : part;
  });
}

const CopyIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="11" height="11" rx="2"/>
    <path d="M5 15V5a2 2 0 012-2h10"/>
  </svg>
);

function StaffCard({ person: p, terms, onCopy }) {
  const color = deptColor(p.unit);
  const location = [p.building && p.building !== 'n/a' ? p.building : '', p.room && p.room !== 'n/a' ? 'Room ' + p.room : ''].filter(Boolean).join(' · ');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
      <div className="flex gap-3 items-start">
        <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: color }}>
          {getInitials(p.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gray-900 text-sm leading-tight">{highlight(p.name, terms)}</div>
          <div className="text-gray-500 text-xs mt-0.5 leading-tight">{highlight(p.position, terms)}</div>
          <div className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wide text-[#1d2758] bg-[#1d2758]/10 px-2 py-0.5 rounded">
            {p.unit}
          </div>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-200 pt-2.5 flex flex-col gap-0.5">
        {p.ext && (
          <div className="flex items-center gap-2 text-xs text-gray-700 px-1 py-1">
            <span className="text-gray-400 text-[10px] font-bold uppercase w-6 flex-shrink-0">Ext</span>
            <span className="flex-1">{p.ext}</span>
            <button onClick={() => onCopy(p.ext)} className="text-gray-300 hover:text-[#1d2758] p-1 rounded transition-colors" title="Copy">
              <CopyIcon />
            </button>
          </div>
        )}
        {p.phone && (
          <a href={`tel:${p.tel}`} className="flex items-center gap-2 text-xs text-gray-700 px-1 py-1 rounded hover:bg-gray-50 group">
            <svg className="w-3.5 h-3.5 text-[#1d2758] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 4h4l2 5-3 2a14 14 0 006 6l2-3 5 2v4a2 2 0 01-2 2A17 17 0 013 6a2 2 0 012-2"/></svg>
            <span className="flex-1">{highlight(p.phone, terms)}</span>
            <button onClick={e => { e.preventDefault(); onCopy(p.phone); }} className="text-gray-300 hover:text-[#1d2758] p-1 rounded opacity-0 group-hover:opacity-100 transition-all" title="Copy">
              <CopyIcon />
            </button>
          </a>
        )}
        <a href={`mailto:${p.email}`} className="flex items-center gap-2 text-xs text-gray-700 px-1 py-1 rounded hover:bg-gray-50 group">
          <svg className="w-3.5 h-3.5 text-[#1d2758] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
          <span className="flex-1 truncate">{highlight(p.email, terms)}</span>
          <button onClick={e => { e.preventDefault(); onCopy(p.email); }} className="text-gray-300 hover:text-[#1d2758] p-1 rounded opacity-0 group-hover:opacity-100 transition-all" title="Copy">
            <CopyIcon />
          </button>
        </a>
        {location && (
          <div className="flex items-center gap-2 text-xs text-gray-500 px-1 py-1">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
            <span className="flex-1 truncate">{location}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const SCHOOLS = [
  { value: '', label: 'All' },
  { value: 'School of Computing', label: 'Computing' },
  { value: 'School of Informatics, Journalism and Media Technology', label: 'Informatics & Media' },
];

function StaffDirectory() {
  const [query, setQuery] = useState('');
  const [school, setSchool] = useState('');
  const [dept, setDept] = useState('');
  const [sort, setSort] = useState('dept');
  const [toast, setToast] = useState('');

  const terms = useMemo(() =>
    query.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [query]
  );

  const allDepts = useMemo(() => [...new Set(STAFF.map(p => p.unit))], []);

  const visibleDepts = useMemo(() =>
    allDepts.filter(u => !school || STAFF.some(p => p.unit === u && p.school === school)),
    [allDepts, school]
  );

  const filtered = useMemo(() => {
    let list = STAFF.filter(p => {
      if (school && p.school !== school) return false;
      if (dept && p.unit !== dept) return false;
      if (!terms.length) return true;
      const hay = [p.name, p.position, p.unit, p.school, p.email, p.phone, p.ext, p.building, p.room].join(' ').toLowerCase();
      return terms.every(t => hay.includes(t));
    });

    if (sort === 'name') {
      list = [...list].sort((a, b) =>
        a.name.replace(/^(Prof\.?|Dr|Mr|Ms|Mrs)\s+/i, '').localeCompare(
          b.name.replace(/^(Prof\.?|Dr|Mr|Ms|Mrs)\s+/i, '')
        )
      );
    } else if (sort === 'pos') {
      list = [...list].sort((a, b) => a.position.localeCompare(b.position));
    }

    return list;
  }, [terms, school, dept, sort]);

  const groups = useMemo(() => {
    if (sort !== 'dept') return null;
    const g = {};
    filtered.forEach(p => {
      if (!g[p.unit]) g[p.unit] = [];
      g[p.unit].push(p);
    });
    return g;
  }, [filtered, sort]);

  function copyToClipboard(text) {
    navigator.clipboard?.writeText(text);
    setToast('Copied ' + text);
    setTimeout(() => setToast(''), 1800);
  }

  function handleSchoolChange(val) {
    setSchool(val);
    if (dept && !STAFF.some(p => p.unit === dept && p.school === val)) {
      setDept('');
    }
  }

  return (
    <CampusPageLayout title="Staff Directory">

      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Page header */}
        <div className="bg-[#1d2758] px-6 py-7">
          <p className="text-[#f6b11f] text-xs font-semibold uppercase tracking-widest mb-1">
            Namibia University of Science &amp; Technology
          </p>
          <h1 className="text-white text-2xl font-bold">Staff Directory</h1>
          <p className="text-white/60 text-sm mt-1">
            Faculty of Computing &amp; Informatics — search by name, role, department or contact
          </p>
        </div>

        {/* Sticky controls */}
        <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-6 py-3 flex flex-col gap-3 shadow-sm">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search — try a name, 'Lecturer', 'Cybersecurity', or an extension…"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1d2758]/20 focus:border-[#1d2758]"
          />
          <div className="flex flex-wrap gap-2 items-center">
            {/* School filter */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white text-sm">
              {SCHOOLS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleSchoolChange(value)}
                  className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap ${school === value ? 'bg-[#1d2758] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Department */}
            <select
              value={dept}
              onChange={e => setDept(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-[#1d2758]"
            >
              <option value="">All departments</option>
              {visibleDepts.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-[#1d2758]"
            >
              <option value="dept">Group by department</option>
              <option value="name">Sort by name (A–Z)</option>
              <option value="pos">Sort by position</option>
            </select>

            <span className="ml-auto text-sm text-gray-500">
              <span className="text-[#1d2758] font-bold">{filtered.length}</span> of {STAFF.length} staff
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-semibold text-gray-700">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-sm text-gray-400 mt-1">Try a surname, department, or part of an email.</p>
            </div>
          ) : sort === 'dept' && groups ? (
            Object.entries(groups).map(([unit, members]) => (
              <div key={unit} className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-[#1d2758] font-semibold text-sm">{unit}</h2>
                  <span className="text-[10px] font-bold text-[#f6b11f] bg-[#f6b11f]/20 px-2 py-0.5 rounded-full">{members.length}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {members.map(p => (
                    <StaffCard key={p.id} person={p} terms={terms} onCopy={copyToClipboard} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map(p => (
                <StaffCard key={p.id} person={p} terms={terms} onCopy={copyToClipboard} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1d2758] text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </CampusPageLayout>
  );
}

export { StaffDirectory as default };
