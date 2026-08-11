import pathlib

src = pathlib.Path("scrape_under250cc.py")
content = src.read_text(encoding="utf-8")
lines = content.split('\n')

new_dict = """MOTOR_LIST_UNDER250 = {
    "Yamaha": {
        "Scooter": [
            "Fazzio 125",
            "Grand Filano 125",
            "Gear 125",
            "X-Ride 125",
            "Fino 125",
        ],
        "Sport_Naked": [
            "Vixion 150",
            "Vixion R 155",
            "MT-15",
            "Byson 150",
            "Scorpio Z 225",
            "RX-King 135",
        ],
        "Sport_Fairing": [
            "YZF-R15",
        ],
        "Retro": [
            "XSR 155",
        ]
    },
    "Honda": {
        "Scooter": [
            "Stylo 160",
            "Spacy 110",
        ],
        "Bebek": [
            "Supra X 125",
            "Sonic 150R",
        ],
        "Sport_Naked": [
            "CB150 Verza",
            "Tiger 2000",
            "MegaPro 160",
        ]
    },
    "Kawasaki": {
        "Retro": [
            "W175",
        ],
        "Adventure_Small": [
            "D-Tracker 150",
        ],
        "Sport_Fairing": [
            "Ninja 150 RR",
        ]
    },
    "Suzuki": {
        "Bebek": [
            "Satria F150",
        ],
        "Sport_Fairing": [
            "GSX-R150",
        ],
        "Sport_Naked": [
            "GSX-S150",
            "Thunder 125",
        ],
        "Scooter": [
            "Avenis 125",
        ]
    },
    "Vespa": {
        "Scooter": [
            "Sprint 150",
            "Primavera 150",
            "GTS 150",
            "LX 125",
            "S 125",
        ]
    },
    "U_Winfly": {
        "Scooter_Electric": [
            "T3",
        ]
    },
    "Smoot": {
        "Scooter_Electric": [
            "Tempur",
            "Zuzu",
        ]
    },
    "Volta": {
        "Scooter_Electric": [
            "401",
        ]
    },
    "Yadea": {
        "Scooter_Electric": [
            "T9",
            "E8S Pro",
        ]
    }
}"""

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if line.startswith("MOTOR_LIST_UNDER250 = {"):
        start_idx = i
    if start_idx != -1 and line == "}":
        end_idx = i
        if i + 1 < len(lines) and lines[i+1].startswith("# ── KEYWORD"):
            break

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx] + [new_dict] + lines[end_idx+1:]
    new_content = '\n'.join(new_lines)
    new_content = new_content.replace('scraping_report_under250cc.csv', 'scraping_report_under250cc_part2.csv')
    new_content = new_content.replace('UNDER 250cc  (SEMUA KELAS INDONESIA)', 'UNDER 250cc (PART 2 - Merek Populer & EV)')
    pathlib.Path("scrape_under250cc_part2.py").write_text(new_content, encoding="utf-8")
    print("Created scrape_under250cc_part2.py")
else:
    print("Failed to find bounds")
