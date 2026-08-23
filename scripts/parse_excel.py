import zipfile
import xml.etree.ElementTree as ET
import json
import os
import re

def parse_xlsx(filepath):
    if not os.path.exists(filepath):
        print(f"Warning: {filepath} not found.")
        return []
        
    with zipfile.ZipFile(filepath) as z:
        # shared strings
        ss_xml = z.read('xl/sharedStrings.xml')
        ss_root = ET.fromstring(ss_xml)
        strings = [t.text or '' for t in ss_root.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')]
        
        sheet_xml = z.read('xl/worksheets/sheet1.xml')
        sheet_root = ET.fromstring(sheet_xml)
        
        rows = []
        for r in sheet_root.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
            row_vals = []
            for c in r.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                t = c.attrib.get('t')
                v_elem = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                val = v_elem.text if v_elem is not None else ''
                if t == 's' and val:
                    idx = int(val)
                    val = strings[idx] if idx < len(strings) else val
                row_vals.append(val.strip())
            if any(row_vals):
                rows.append(row_vals)
        return rows

def process_data():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    # 1. Bagdhara
    bagdhara_file = os.path.join(base_dir, "বাংলা বাগধারা.xlsx")
    bagdhara_rows = parse_xlsx(bagdhara_file)
    bagdhara_list = []
    # Skip header rows
    for i, r in enumerate(bagdhara_rows):
        if len(r) >= 2 and r[0] and r[1]:
            # check if header row
            if "বাগধারা" in r[0] or "বাংলা বাগধারা" in r[0]:
                continue
            item = {
                "id": f"bag_{len(bagdhara_list)+1}",
                "term": r[0].strip(),
                "meaning": r[1].strip(),
                "category": "bagdhara",
                "categoryName": "বাংলা বাগধারা"
            }
            bagdhara_list.append(item)
            
    # 2. Biporit Shobdo
    biporit_file = os.path.join(base_dir, "বিপরিত শব্দ.xlsx")
    biporit_rows = parse_xlsx(biporit_file)
    biporit_list = []
    for i, r in enumerate(biporit_rows):
        if len(r) >= 2 and r[0] and r[1]:
            if "বিপরীত শব্দ" in r[0] or "মূল শব্দ" in r[0]:
                continue
            item = {
                "id": f"bip_{len(biporit_list)+1}",
                "term": r[0].strip(),
                "meaning": r[1].strip(),
                "category": "biporit",
                "categoryName": "বিপরীত শব্দ"
            }
            biporit_list.append(item)
            
    # 3. Paribhashik Shobdo
    paribhashik_file = os.path.join(base_dir, "পারিভাষিক শব্দ.xlsx")
    paribhashik_rows = parse_xlsx(paribhashik_file)
    paribhashik_list = []
    for i, r in enumerate(paribhashik_rows):
        if len(r) >= 2 and r[0] and r[1]:
            if "পারিভাষিক শব্দ" in r[0] or "ইংরেজী শব্দ" in r[0]:
                continue
            item = {
                "id": f"par_{len(paribhashik_list)+1}",
                "term": r[0].strip(),
                "meaning": r[1].strip(),
                "category": "paribhashik",
                "categoryName": "পারিভাষিক শব্দ"
            }
            paribhashik_list.append(item)
            
    # 4. Ekkothay Prokash
    ekkothay_file = os.path.join(base_dir, "এককথায় প্রকাশ.xlsx")
    ekkothay_rows = parse_xlsx(ekkothay_file)
    ekkothay_list = []
    for i, r in enumerate(ekkothay_rows):
        if len(r) >= 2 and r[0] and r[1]:
            if "এককথায় প্রকাশ" in r[0] or "মূল বাক্য" in r[0]:
                continue
            item = {
                "id": f"ekk_{len(ekkothay_list)+1}",
                "term": r[0].strip(), # One word expression
                "meaning": r[1].strip(), # Main sentence / definition
                "category": "ekkothay",
                "categoryName": "এককথায় প্রকাশ"
            }
            ekkothay_list.append(item)

    # 5. Somarthok Shobdo (Synonyms)
    somarthok_file = os.path.join(base_dir, "সমার্থক শব্দ.xlsx")
    somarthok_rows = parse_xlsx(somarthok_file)
    somarthok_list = []
    for i, r in enumerate(somarthok_rows):
        if len(r) >= 2 and r[0] and r[1]:
            # check if header row
            if "সমার্থক শব্দ" in r[0] or r[0].strip() == "শব্দ":
                continue
            item = {
                "id": f"som_{len(somarthok_list)+1}",
                "term": r[0].strip(), # Main word
                "meaning": r[1].strip(), # Synonyms of the word
                "category": "somarthok",
                "categoryName": "সমার্থক শব্দ"
            }
            somarthok_list.append(item)

    combined_data = {
        "categories": {
            "bagdhara": {
                "id": "bagdhara",
                "name": "বাংলা বাগধারা",
                "englishName": "Bagdhara",
                "count": len(bagdhara_list),
                "icon": "BookOpen",
                "description": "বাংলা ভাষায় বহুল ব্যবহৃত বাগধারা ও তাদের সহজ অর্থ",
                "color": "#E8A589"
            },
            "biporit": {
                "id": "biporit",
                "name": "বিপরীত শব্দ",
                "englishName": "Antonyms",
                "count": len(biporit_list),
                "icon": "Repeat",
                "description": "গুরুত্বপূর্ণ বাংলা মূল শব্দ ও তাদের বিপরীত শব্দ",
                "color": "#84A59D"
            },
            "paribhashik": {
                "id": "paribhashik",
                "name": "পারিভাষিক শব্দ",
                "englishName": "Terminology",
                "count": len(paribhashik_list),
                "icon": "Languages",
                "description": "ইংরেজি পারিভাষিক শব্দ ও তাদের বাংলা রূপ",
                "color": "#A8DADC"
            },
            "ekkothay": {
                "id": "ekkothay",
                "name": "এককথায় প্রকাশ",
                "englishName": "One Word Substitution",
                "count": len(ekkothay_list),
                "icon": "Sparkles",
                "description": "বাক্য সংকোচন বা এককথায় প্রকাশ সমাহার",
                "color": "#F4A261"
            },
            "somarthok": {
                "id": "somarthok",
                "name": "সমার্থক শব্দ",
                "englishName": "Synonyms",
                "count": len(somarthok_list),
                "icon": "ArrowLeftRight",
                "description": "গুরুত্বপূর্ণ বাংলা শব্দ ও তাদের সমার্থক শব্দসমূহ",
                "color": "#E76F51"
            }
        },
        "items": {
            "bagdhara": bagdhara_list,
            "biporit": biporit_list,
            "paribhashik": paribhashik_list,
            "ekkothay": ekkothay_list,
            "somarthok": somarthok_list
        },
        "totalCount": len(bagdhara_list) + len(biporit_list) + len(paribhashik_list) + len(ekkothay_list) + len(somarthok_list)
    }

    output_path = os.path.join(base_dir, "src", "data", "birochon_data.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(combined_data, f, ensure_ascii=False, indent=2)

    print(f"Successfully generated database at {output_path}")
    print(f"Total items: {combined_data['totalCount']}")
    for cat_id, cat_info in combined_data['categories'].items():
        print(f" - {cat_info['name']}: {cat_info['count']} items")

if __name__ == "__main__":
    process_data()
