from pypdf import PdfReader
import re
import json
from pathlib import Path

text = PdfReader(
    Path(__file__).resolve().parents[3]
    / "public/data/Final Faculty of Computing and Informatics Staff List.pdf"
).pages[0].extract_text() or ""
text = re.sub(r"\s+", " ", text).strip()
text = re.split(r"FACULTY OF COMPUTING AND INFORMATICS STAFF LIST", text)[0]
text = re.sub(r"^Name Position Ext Phone E-Mail Building Room\s*", "", text)
text = re.split(r"\s+JOURNALISM AND MEDIA TECHNOLOGY\s+", text)
text = text[0] + (" " + text[1] if len(text) > 1 else "")

parts = re.split(r"\s+(?=(?:Prof\.?|Dr\.?|Mr|Ms|Mrs|Miss)\s+)", text)
parts = [p.strip() for p in parts if p.strip()]
titles = {"prof", "prof.", "dr", "dr.", "mr", "ms", "mrs", "miss"}
pos_keywords = {
    "acting", "associate", "head", "professor", "lecturer", "senior", "junior",
    "secretary", "receptionist", "faculty", "assistant", "dean", "center", "centre",
    "ceit", "inceit", "lab", "technitian", "technician", "officer", "reception",
    "coordinator", "section", "hod", "librarian", "liason", "liaison", "partner",
    "director", "examinations", "procurement", "carpentry", "studio", "human",
    "capital", "hr", "industry", "international", "relations", "technical",
    "departmental",
}


def normalize_email(email: str) -> str:
    email = email.lower().replace(" ", "")
    if email.endswith("@nust"):
        email += ".na"
    return email


def parse_room_building(right: str) -> tuple[str, str]:
    right = right.strip()
    if not right:
        return "", "n/a"
    if right.lower() in {"n/a", "na"}:
        return "", "n/a"
    if right.lower().endswith(" n/a"):
        return right[:-4].strip(), "n/a"

    tokens = right.split()
    last = tokens[-1]
    if (
        re.fullmatch(r"^[\d.?]+[A-Za-z]?$", last)
        or last.lower() in {"lab", "basement", "?"}
        or last.lower().startswith("office")
        or last.lower() == "k1"
    ):
        return " ".join(tokens[:-1]).strip(), last
    if last.lower() == "floor" and len(tokens) >= 2:
        return " ".join(tokens[:-2]).strip(), " ".join(tokens[-2:])
    if last.lower() == "department":
        return " ".join(tokens[:-1]).strip(), "n/a"
    if last.lower() == "house" and len(tokens) >= 2 and tokens[-2].lower() != "it":
        return " ".join(tokens[:-1]).strip(), "n/a"

    return right, "n/a"


def parse(part: str) -> dict | None:
    match = re.search(r"([A-Za-z0-9._%+-]+@nust(?:\.na)?)", part, re.I)
    if not match:
        return None

    email = normalize_email(match.group(1))
    left, right = part[: match.start()].strip(), part[match.end() :].strip()
    phone = ""

    phone_match = re.search(r"(\d{3,4})\s+((?:\+?\d[\d, ]{5,}\d|\d{8,}))\s*$", left)
    if phone_match:
        phone = phone_match.group(2).strip()
        left = left[: phone_match.start()].strip()
    else:
        phone_match = re.search(r"(\d{8,})\s*$", left)
        if phone_match:
            phone = phone_match.group(1)
            left = left[: phone_match.start()].strip()
        else:
            ext_match = re.search(r"(\d{3,4})\s*$", left)
            if ext_match and len(ext_match.group(1)) >= 4:
                phone = ext_match.group(1)
                left = left[: ext_match.start()].strip()

    building, room = parse_room_building(right)
    tokens = left.split()
    index = 0
    while index < len(tokens) and tokens[index].lower().rstrip(".") in titles:
        index += 1

    name_tokens = []
    while index < len(tokens):
        token = tokens[index].lower().rstrip(":")
        if token in pos_keywords:
            break
        name_tokens.append(tokens[index])
        index += 1

    position = " ".join(tokens[index:]).strip(" ,:")
    name = " ".join(name_tokens)
    name = re.sub(r"\s+(Technician|Techinician|Laboratory)$", "", name, flags=re.I)
    if not position and re.search(r"(Technician|Techinician|Laboratory)", part, re.I):
        position = "Technician"

    name_tokens = name.split()
    if name_tokens and name_tokens[0].lower().rstrip(".") in titles:
        first = name_tokens[1] if len(name_tokens) > 1 else ""
        last = " ".join(name_tokens[2:]) if len(name_tokens) > 2 else ""
    elif len(name_tokens) >= 2:
        first, last = name_tokens[0], " ".join(name_tokens[1:])
    else:
        first = name_tokens[0] if name_tokens else ""
        last = ""

    return {
        "firstName": first,
        "lastName": last,
        "email": email,
        "staffPhone": phone,
        "staffPosition": position,
        "buildingName": building,
        "roomNo": room,
    }


rows = []
seen = set()
for part in parts:
    record = parse(part)
    if not record or not record["email"] or record["email"] in seen:
        continue
    seen.add(record["email"])
    if record["firstName"] or record["lastName"]:
        rows.append(record)

output = Path(__file__).resolve().parent / "fci-staff.json"
output.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"wrote {len(rows)} records to {output}")
