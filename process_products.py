"""
CX Electronics — Product CSV Enrichment Script
Reads products-master.csv, enriches all fields, writes products-improved.csv
No API key required — runs locally with template-based intelligence.
"""

import csv
import re
import os
import json

INPUT_FILE  = r"C:\Users\User\Desktop\CX Electronics\CX-Website\products-master.csv"
OUTPUT_FILE = r"C:\Users\User\Desktop\CX Electronics\products-improved.csv"

OUTPUT_COLUMNS = [
    "name", "slug", "category", "seo_title", "short_description",
    "full_description", "retail_price", "bulk_price", "bulk_min_qty",
    "stock_status", "active", "featured", "is_bulk_available",
    "thumbnail_url", "images", "specifications",
]

CATEGORY_MAP = {
    "accessories":  "Accessories",
    "automobile":   "Automobile",
    "cables":       "Cables",
    "chargers":     "Chargers",
    "household":    "Household",
    "kitchen":      "Kitchen",
    "power-banks":  "Power Banks",
    "smartwatches": "Smartwatches",
    "tools":        "Tools",
}

# ─── Name cleaning ────────────────────────────────────────────────────────────

def clean_name(name: str) -> str:
    name = name.replace("*", "x").replace("×", "x").replace("  ", " ").strip()
    name = name.replace(" w/", " with ").replace("·", "").replace("C·T", "CT")
    return name[:80]

# ─── Slug ─────────────────────────────────────────────────────────────────────

def make_slug(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_×]+", "-", s)
    s = re.sub(r"-+", "-", s)
    return s.strip("-")[:100]

# ─── Category ─────────────────────────────────────────────────────────────────

def map_category(raw: str) -> str:
    return CATEGORY_MAP.get(raw.lower().strip(), "Accessories")

# ─── SEO title ────────────────────────────────────────────────────────────────

def make_seo_title(name: str) -> str:
    suffix = " | CX Electronics SA"
    if len(name) + len(suffix) <= 70:
        return name + suffix
    return name[: 70 - len(suffix)] + suffix

# ─── Short description ────────────────────────────────────────────────────────

def short_desc(description: str, limit: int = 160) -> str:
    d = description.strip()
    if len(d) <= limit:
        return d
    chunk = d[:limit]
    for ch in (".", "!", "?"):
        idx = chunk.rfind(ch)
        if idx > int(limit * 0.65):
            return chunk[: idx + 1]
    return chunk[: limit - 3] + "..."

# ─── Spec extraction ──────────────────────────────────────────────────────────

def extract_specs(name: str, description: str) -> dict:
    combined = name + " " + description
    specs = {}

    dim = re.search(
        r"\d+(?:\.\d+)?[\s]*[xX×*][\s]*\d+(?:\.\d+)?(?:[\s]*[xX×*][\s]*\d+(?:\.\d+)?)?[\s]*(?:mm|cm|m|inch)?",
        combined,
    )
    if dim:
        specs["dimensions"] = dim.group(0).replace("*", "×").strip()

    pack = re.search(
        r"(\d+)[\s]*[-–]?[\s]*(?:pack|piece|pcs|pc|rolls?|count|tubes?|pairs?|sheets?|bulbs?)\b",
        combined, re.IGNORECASE,
    )
    if pack:
        specs["pack"] = pack.group(0).strip()

    weight = re.search(r"(\d+(?:\.\d+)?)\s*(g|kg)\b", combined, re.IGNORECASE)
    if weight:
        specs["weight"] = weight.group(0).strip()

    hours = re.search(r"(\d+(?:[-–]\d+)?)\s*hours?", combined, re.IGNORECASE)
    if hours:
        specs["duration"] = hours.group(0).strip()

    nights = re.search(r"(\d+)\s*nights?", combined, re.IGNORECASE)
    if nights:
        specs["nights"] = nights.group(0).strip()

    length = re.search(r"(\d+(?:\.\d+)?)\s*(?:m|metre|meter)\b(?!\s*m)", combined, re.IGNORECASE)
    if length and "dimensions" not in specs:
        specs["length"] = length.group(0).strip()

    return specs

# ─── Category-specific expansion paragraphs ───────────────────────────────────

def expansion_paragraphs(name: str, category: str, description: str) -> str:
    n = name.lower()
    d = description.lower()

    # ── ACCESSORIES ──────────────────────────────────────────────────────────
    if category == "Accessories":

        if ("thermal" in n or "receipt" in n) and "paper" in n:
            return (
                "Thermal receipt paper works on heat-sensitive chemistry rather than ink or ribbons — the print head simply applies heat to the coating, producing sharp, smudge-free text and barcodes instantly. "
                "This means no ongoing ink costs and no ribbon changes, making thermal paper the most economical choice for high-volume receipt printing in retail, hospitality, and service environments.\n\n"
                "Compatible with virtually all standard thermal POS printers, cash registers, and ticket machines that accept the corresponding roll size. "
                "Store rolls away from direct sunlight and heat sources to preserve the coating and prevent premature browning. "
                "Bulk packs offer significant cost savings for businesses with multiple tills or high transaction volumes."
            )

        if "packaging tape" in n or ("clear" in n and "tape" in n and "packaging" in d):
            return (
                "Clear packaging tape is the industry standard for sealing cardboard boxes, cartons, and courier parcels. "
                "The pressure-sensitive acrylic adhesive bonds instantly to cardboard, plastic, and most packaging surfaces, holding firmly even under the pressure and temperature variations common during storage and transit.\n\n"
                "Longer rolls reduce how often you need to change rolls on busy packing lines, improving efficiency in warehouses, fulfilment centres, and retail stockrooms. "
                "Compatible with standard handheld tape guns and desktop dispensers."
            )

        if "double-sided" in n or "mounting tape" in n or "foam" in n and "tape" in n:
            return (
                "Double-sided mounting tape eliminates the need for nails, screws, and wall anchors for hanging pictures, mirrors, frames, clocks, and decorative items. "
                "The foam core compresses slightly to compensate for minor surface irregularities, creating full contact across the tape width for maximum holding strength.\n\n"
                "Works on a wide range of surfaces including painted walls, tiles, glass, metal, and smooth plastic. "
                "For best results, ensure the surface is clean, dry, and free of dust or grease before application. Press firmly for 30 seconds after mounting to activate the adhesive bond."
            )

        if "nano" in n and "tape" in n:
            return (
                "Nano mounting tape uses microscopic suction-cup technology rather than traditional chemical adhesives to create its grip. "
                "This means the tape leaves absolutely no residue on surfaces and can be repositioned or removed cleanly — a significant advantage over conventional foam tapes.\n\n"
                "When the tape loses its grip over time, simply rinse it under warm water, allow it to dry completely, and it will restore to full holding strength. "
                "Ideal for smooth, non-porous surfaces: glass, glazed tiles, metal, and polished plastic. Not effective on textured, rough, or porous surfaces."
            )

        if "masking tape" in n:
            return (
                "Masking tape is essential for achieving clean, sharp paint lines when decorating. "
                "Apply it along the edge of surfaces you want to protect — skirting boards, window frames, and ceiling edges — then paint up to and over the tape edge. "
                "Remove the tape while the paint is still slightly wet for the cleanest line.\n\n"
                "Beyond painting, masking tape is widely used for labelling, bundling, light packaging, and craft projects. "
                "It tears cleanly by hand and removes without leaving adhesive residue on most common surfaces including wood, glass, ceramic tiles, and painted walls."
            )

        if "price" in n and ("gun" in n or "label" in n or "labelling" in n):
            return (
                "Price labelling guns are a standard tool in South African retail shops, supermarkets, pharmacies, and wholesale stores. "
                "The 5500-series is one of the most widely used labelling systems, with a large installed base meaning replacement label rolls are readily available.\n\n"
                "The gun prints and applies each label in a single action, allowing operators to price large volumes of stock quickly and accurately. "
                "Adjustable digit wheels set the price, and the smooth ratchet feed mechanism ensures consistent label application without jams or skips."
            )

        if "razor" in n or "shav" in n or "blade" in n:
            return (
                "Pearl Max razors are manufactured to deliver consistent shaving performance at an accessible price point, making them a popular everyday option across South Africa. "
                "The stainless steel blade construction resists corrosion and maintains its edge across multiple shaves.\n\n"
                "A lubricating strip along the blade cartridge glides smoothly across skin, reducing friction and the risk of razor burn, nicks, and irritation — particularly important when shaving sensitive areas or shaving against the grain. "
                "Multi-packs offer excellent value for households and hospitality businesses where razor supply needs to be maintained consistently."
            )

        if "shoe polish" in n:
            return (
                "Regular leather shoe care is one of the most effective ways to extend the life of quality footwear. "
                "Leather that is not conditioned and polished will eventually dry out, crack along stress lines, and lose its structural integrity — a problem easily prevented with routine application of a quality shoe polish.\n\n"
                "LUDE shoe polish penetrates the leather surface to nourish and condition it while depositing pigment that restores colour depth and builds a protective barrier against moisture and scuffing. "
                "Apply with a brush or cloth, allow to dry briefly, then buff with a clean brush or soft cloth to achieve a high-gloss shine."
            )

        if "soap dish" in n or "soap box" in n:
            return (
                "A quality soap dish or soap box prevents the common problem of soap sitting in standing water between uses, which causes it to become soft, waterlogged, and wasteful. "
                "Drainage slots or a raised surface keep the soap elevated so water drains away and the soap dries out between uses — extending the life of each bar significantly.\n\n"
                "Suitable for bathroom basins, kitchen sinks, and shower ledges. The lidded soap box version is also ideal for travel, keeping soap contained in luggage without mess."
            )

        if "shower cap" in n:
            return (
                "A well-fitting shower cap is an essential hair care tool for anyone who washes their hair less frequently than they shower — whether due to a complex styling routine, natural or treated hair, or simply preference. "
                "Keeping hair dry during showering preserves moisture balance, reduces heat styling damage, and extends the life of blowouts and treatments.\n\n"
                "This shower cap features a wide, elastic-edged design that accommodates larger hair volumes including natural, curly, braided, and loc styles — hair types that are often not well served by standard-sized caps."
            )

        if "wipes" in n:
            return (
                "Pre-moistened wipes provide instant, no-rinse cleaning and hygiene for hands, faces, and surfaces when access to soap and water is limited. "
                "The resealable packaging keeps unused wipes moist and ready for use — ideal for keeping in handbags, vehicle glove boxes, desks, and travel bags.\n\n"
                "Each wipe is lightly fragranced and contains mild cleaning agents effective against everyday surface dirt and bacteria. "
                "Suitable for adults, children, and on-the-go use in restaurants, taxis, offices, and outdoor events."
            )

        if "dispenser" in n and "tape" in n:
            return (
                "A good tape dispenser makes a significant difference in the speed and ease of everyday packaging, gift-wrapping, and office tasks. "
                "Without a dispenser, tape rolls slide around, the loose end disappears under the roll, and cutting requires two hands. "
                "A dispenser holds the roll securely, keeps the tape end accessible, and delivers a clean cut with one hand, improving workflow in busy environments.\n\n"
                "This dispenser suits standard transparent sticky tape rolls and fits neatly on any desk, counter, or packing station. "
                "The weighted base on desktop models prevents the dispenser from moving when tape is pulled, while the serrated cutting blade delivers a clean, straight cut every time without scissors. "
                "An ideal addition to any office, reception, stockroom, or home gift-wrapping setup. "
                "Compact size takes up minimal desk space while keeping tape always within reach."
            )

        if "personal care" in n or "care pack" in n or "hygiene pack" in n:
            return (
                "Personal care products designed for babies and young children must meet a higher standard of gentleness and safety than adult equivalents. "
                "Infant skin is significantly more sensitive and permeable than adult skin, making the quality of formulations used in everyday grooming and hygiene products critically important.\n\n"
                "This personal care pack is designed with baby-safe materials and mild formulations suitable for everyday use. "
                "The bright themed packaging makes it an ideal practical gift for baby showers, newborn visits, and young toddlers. "
                "The compact pack is also convenient for travel, hospital bags, and day care use where a portable all-in-one kit is needed."
            )

        return (
            "Designed for reliability and convenience in everyday home, office, and retail environments. "
            "Quality construction ensures consistent performance and long-lasting value in regular daily use.\n\n"
            "Products of this type are fast-moving everyday essentials that are purchased repeatedly once customers find a reliable option. "
            "Stocking in bulk provides significant cost savings for businesses, resellers, and households that use the product regularly. "
            "Store in a cool, dry location away from direct sunlight to preserve material quality and adhesive properties where applicable.\n\n"
            "Suitable for home, office, school, and retail environments. Available in individual retail units and bulk quantities for wholesale buyers and resellers."
        )

    # ── HOUSEHOLD ────────────────────────────────────────────────────────────
    if category == "Household":

        if ("mosquito coil" in n or ("coil" in n and "mosquito" in d)) and "electric" not in n:
            return (
                "Mosquito coils are one of the most widely used and cost-effective methods for controlling mosquitoes in South Africa, particularly in the evening hours when mosquito activity peaks. "
                "The coil burns slowly and steadily, releasing a continuous stream of insect-repelling smoke that creates a protective zone around the area.\n\n"
                "Suitable for use on verandas, patios, in bedrooms, and in living rooms with some ventilation. "
                "Place the lit coil on its stand on a stable, non-flammable surface and position it at floor level or low down where mosquitoes tend to fly. "
                "Never use indoors in a fully enclosed, unventilated space, and always supervise when children or pets are present."
            )

        if "electric" in n and ("mosquito" in n or "repellent" in n or "liquid" in n):
            return (
                "Electric liquid mosquito repellents are a clean, odourless, and flame-free alternative to coils and sprays, making them the preferred choice for bedrooms, children's rooms, and enclosed living spaces. "
                "The plug-in heater unit slowly vaporises the insecticide liquid, dispersing it invisibly into the room to create a continuous protective barrier throughout the night.\n\n"
                "Simply plug the unit into a standard 220V wall socket at low level — mosquitoes tend to fly close to the ground and rest at floor level, so low placement maximises effectiveness. "
                "The device reaches operating temperature within 15 minutes and provides protection for the duration of the refill, requiring no attention once plugged in. "
                "Compatible with standard 30ml electric mosquito liquid refills from most major brands."
            )

        if "mosquito" in n and "refill" in n:
            return (
                "Electric mosquito liquid refills provide a convenient, mess-free way to maintain continuous protection in your plug-in mosquito repellent unit. "
                "Each bottle contains a measured volume of prallethrin-based insecticide solution formulated to vaporise evenly at the heater unit's operating temperature.\n\n"
                "The lemon fragrance masks the insecticide scent, making the refill suitable for bedrooms and living areas. "
                "One bottle typically provides 30 nights of protection at 8 hours per night. Always ensure the refill brand is compatible with your heater unit before purchase."
            )

        if "glue trap" in n or "glue board" in n or ("trap" in n and "sticky" in d):
            return (
                "Glue board traps are one of the safest and most effective rodent and insect control methods available, relying entirely on physical adhesion rather than poisons or chemicals. "
                "This makes them safe to use in kitchens, food preparation areas, restaurants, and homes with children and pets — environments where chemical pesticides may be prohibited or undesirable.\n\n"
                "For best results, place boards along walls, in corners, behind appliances, and beneath furniture. "
                "Rodents instinctively travel along edges and in dark, enclosed spaces rather than crossing open floors. "
                "Check boards daily and replace when they become full or dusty. Dispose of used boards in a sealed bag."
            )

        if "fly" in n and ("ribbon" in n or "catcher" in n or "board" in n or "trap" in n):
            return (
                "Fly traps and sticky ribbons offer a chemical-free method of controlling houseflies, gnats, and other flying insects in kitchens, food storage areas, and outdoor spaces. "
                "The high-tack adhesive surface captures insects on contact — once a fly lands on the sticky surface it cannot escape.\n\n"
                "Hang ribbons near windows, doorways, rubbish bins, and other areas of fly activity for best results. "
                "No baiting or chemicals required — the adhesive itself attracts insects. Replace when the surface is covered or after 4–6 weeks."
            )

        if "toilet" in n or "cistern" in n or "bubble" in n:
            return (
                "Toilet cistern cleaner blocks provide automated, hands-free toilet hygiene by releasing cleaning and freshening agents with every flush. "
                "This continuous low-level cleaning prevents the build-up of limescale and mineral deposits inside the toilet bowl — particularly important in areas with hard water — while neutralising odours between cleans.\n\n"
                "Each block lasts approximately 4–6 weeks depending on flush frequency. Simply drop the block into the cistern tank — no contact with bowl water, no mess, and no tools required. "
                "Replace when the block has dissolved completely."
            )

        if "cockroach" in n or "ant" in n:
            return (
                "Bait-based insect control works on a fundamentally different principle to contact sprays. "
                "Rather than killing only the insects you can see, the bait powder attracts worker insects that consume it and then carry it back to the nest, where it is passed to other colony members — eliminating the infestation at its source.\n\n"
                "Apply the bait powder in very small amounts (a match-head-sized portion) in cracks, behind appliances, under sinks, and along the edges of walls where pest activity has been observed. "
                "Do not use aerosol insecticide sprays in the same area during treatment, as these will repel the target insects away from the bait before it can take effect. "
                "Full colony elimination typically occurs within 3–14 days depending on colony size."
            )

        if "camphor" in n or "moth" in n:
            return (
                "Camphor balls are a tried-and-tested method for protecting stored clothing, blankets, and linens from moth damage and the musty odours that develop in enclosed storage spaces. "
                "The camphor vapour released by the balls creates an environment that clothes moths, silverfish, and other fabric pests find uninhabitable — deterring them from nesting and laying eggs in stored fabrics.\n\n"
                "Place a handful of balls in each drawer, wardrobe shelf, or storage box containing clothes, blankets, or seasonal items. "
                "Camphor is particularly effective in sealed storage containers and vacuum bags. Replace when the balls have fully evaporated."
            )

        if "pegs" in n or "clips" in n:
            return (
                "Stainless steel clothes pegs outlast plastic pegs significantly in South Africa's climate. "
                "Intense UV radiation, temperature extremes, and the moisture cycles of laundry cause plastic pegs to become brittle and snap within months — stainless steel pegs maintain their strength and spring tension indefinitely under the same conditions.\n\n"
                "The spring mechanism grips clothing firmly without leaving marks or indentations on fabrics. "
                "Suitable for all types of clothing including heavy denim and towels, and fully resistant to rust and corrosion even in coastal, high-humidity environments."
            )

        if "brush" in n or "scrubbing" in n:
            return (
                "A quality scrubbing brush provides the mechanical action needed to remove ingrained dirt, mud, and stains from floors, tiles, shoes, and fabrics that cloths and sponges cannot tackle effectively. "
                "The firm bristles agitate the surface to dislodge particles, while the brush shape gives the user controlled pressure over a defined area.\n\n"
                "Suitable for scrubbing bathroom tiles, kitchen floors, doormats, work boots, and outdoor surfaces. "
                "Rinse thoroughly after use and allow to dry bristles-down to prolong the life of the bristles and prevent mildew."
            )

        if "duster" in n or "cloth" in n or "rag" in n:
            return (
                "Cleaning cloths and dusters are the most frequently used cleaning tools in any home or business, making quality and absorbency important selection criteria. "
                "A good cleaning cloth should be absorbent enough to lift dust, moisture, and surface grime in a single pass, and durable enough to withstand repeated washing and reuse without fraying or losing its cleaning properties.\n\n"
                "Suitable for wiping down countertops, appliances, furniture, windows, and general surfaces throughout the home. "
                "Reusable construction reduces ongoing cost compared to disposable paper towels and wipes. "
                "Rinse thoroughly after each use and allow to dry to prevent bacterial growth and odour development. "
                "Machine washable for convenient deep cleaning."
            )

        return (
            "Designed for effective everyday household use, this product provides a practical solution for common home maintenance and hygiene needs. "
            "Safe to use in all areas of the home including kitchens, bedrooms, bathrooms, and outdoor spaces.\n\n"
            "South African households deal with a range of everyday challenges including pests, humidity, dust, and the wear and tear of daily family life. "
            "Products of this type are practical, functional essentials that are purchased repeatedly and benefit from being stocked in multi-packs for ongoing convenience and value.\n\n"
            "Available in individual retail units and in bulk quantities for resellers, spaza shops, and wholesale buyers seeking competitive per-unit pricing."
        )

    # ── KITCHEN ──────────────────────────────────────────────────────────────
    if category == "Kitchen":
        if "melamine" in n:
            return (
                "Melamine dinnerware is a popular everyday choice for South African households and outdoor entertaining due to its exceptional durability and shatter resistance. "
                "Unlike ceramic or porcelain, melamine does not crack or break if dropped — making it ideal for families with young children, outdoor braais, camping trips, and casual dining.\n\n"
                "This melamine product is manufactured from food-safe, BPA-free material that meets international standards for food contact safety. "
                "The printed design is heat-fused into the surface during manufacturing, producing colour that does not peel, chip, or fade with regular use and washing. "
                "Hand washing with mild detergent is recommended to preserve the print and surface finish. Not suitable for microwave or oven use — melamine is a non-microwave-safe material.\n\n"
                "Lightweight and comfortable to hold, this product is well suited to everyday family dining as well as casual entertaining. "
                "The shatter-resistant construction means it can be safely used by children and in outdoor settings where breakages are common."
            )

        if "scissors" in n or "knife" in n or "cutter" in n:
            return (
                "A sharp, well-made pair of scissors or cutting tool is one of the most-used implements in any kitchen, office, or workshop. "
                "Quality blades maintain their edge through repeated cutting and are made from stainless steel that resists rust and corrosion from exposure to moisture in kitchen environments.\n\n"
                "Suitable for cutting packaging materials, food packaging, herbs, twine, and general-purpose cutting tasks in the kitchen. "
                "The ergonomic handle design reduces hand fatigue during extended use, and the stainless steel blades are easy to wipe clean after use. "
                "A reliable everyday cutting tool suitable for homes, restaurants, canteens, and catering businesses."
            )

        return (
            "Designed for everyday kitchen and dining use, this product combines practical functionality with durable construction suited to the demands of regular family meals and catering environments. "
            "Food-safe materials and easy-clean construction make it a hygienic and low-maintenance addition to any kitchen.\n\n"
            "South African kitchens and dining settings demand products that can withstand frequent use, occasional rough handling, and the rigours of a busy household. "
            "This product meets those demands with construction quality suitable for everyday family dining as well as casual entertaining. "
            "It is equally at home in home kitchens, staff canteens, restaurants, and outdoor braai settings.\n\n"
            "Suitable for everyday use in homes, restaurants, canteens, schools, and catering environments. "
            "Available in bulk quantities for hospitality and catering businesses."
        )

    # ── AUTOMOBILE ───────────────────────────────────────────────────────────
    if category == "Automobile":
        if "t5" in n or "t10" in n:
            return (
                "T5 and T10 wedge-base bulbs are found throughout modern vehicles, used as position lights (sidelights), dashboard indicator lights, number plate lights, and interior courtesy lights. "
                "The wedge base design allows these compact bulbs to fit snugly into their plastic socket housings without a separate bayonet locking mechanism — simply align and push the bulb into the socket until it seats.\n\n"
                "This is a direct plug-and-play replacement for your vehicle's existing park or sidelight bulb. "
                "Remove the old bulb by pulling it straight out of the socket, then insert the new bulb in the same orientation. "
                "Confirm the base type (T5 or T10) and voltage rating of your existing bulb before purchasing — these are usually printed on the bulb body or listed in your vehicle's owner manual.\n\n"
                "Suitable for passenger cars, bakkies, SUVs, trucks, motorcycles, and trailers. "
                "Sold in multi-packs for cost-effective stocking by vehicle workshops, spares retailers, and fleet operators."
            )

        if "1156" in n or "1157" in n:
            is_1157 = "1157" in n
            base_info = (
                "BAY15D dual-contact bayonet base (offset pins). Dual-filament — one filament for the running light, one for the brake light. "
                "Used in combined brake/tail light sockets where both functions share a single bulb."
                if is_1157 else
                "BA15S single-contact bayonet base (equal-spaced pins). Single-filament design used in single-function applications such as reverse lights, turn signals, and dedicated brake lights."
            )
            return (
                f"The {'1157 (BAY15D)' if is_1157 else '1156 (BA15S)'} bayonet bulb is one of the most commonly used automotive bulbs in South African vehicles, found in brake lights, tail lights, turn signals, and reversing lights across a wide range of passenger cars, bakkies, and commercial vehicles.\n\n"
                f"Base specification: {base_info}\n\n"
                "Installation requires no tools. Align the bulb pins with the socket slots, push in and rotate clockwise until the bulb locks into position. "
                "Confirm your existing bulb type before purchasing by reading the markings on the old bulb or checking your vehicle manual. "
                "Sold in multi-packs — ideal for vehicle workshops, panel beaters, and fleet vehicle maintenance where regular bulb replacement is routine."
            )

        if "tyre" in n or "tire" in n or "puncture" in n:
            return (
                "A tubeless tyre repair kit is essential roadside emergency equipment for any vehicle owner. "
                "Modern tubeless tyres cannot be repaired using traditional inner-tube patches — punctures must be plugged and sealed from outside the tyre using a plug-and-needle method, which can be performed without removing the wheel from the vehicle.\n\n"
                "The reamer tool is used first to clean and slightly enlarge the puncture hole, removing any debris. "
                "The rubber plug is then threaded onto the needle tool and pushed through the hole. "
                "When the needle is withdrawn, it pulls the plug through the hole, expanding it to create a flush seal with the tyre surface. "
                "Most punctures can be repaired permanently in under 5 minutes — no jack, tyre lever, or compressor required.\n\n"
                "Compact enough to store permanently in your vehicle's glove box, boot, or toolbox. "
                "Compatible with passenger car tyres, bakkie tyres, SUV tyres, and most motorcycle tyres."
            )

        if "park" in n and "light" in n or "bulb" in n:
            return (
                "Vehicle park and position light bulbs are among the most commonly replaced automotive bulbs, as they run continuously whenever the vehicle is on, leading to relatively short service lives compared to bulbs that are only used intermittently. "
                "A failed sidelight or position light is also a traffic offence in South Africa — drivers are legally required to have all exterior lights functioning — making prompt replacement important.\n\n"
                "This bulb is a direct replacement for standard vehicle park light sockets. "
                "Installation requires no tools: locate the failed bulb socket behind the vehicle's light assembly, remove the old bulb by pulling straight out or rotating anticlockwise depending on the socket type, and insert the new bulb in the same orientation until it seats firmly.\n\n"
                "Compatible with most common passenger cars, bakkies, SUVs, minibuses, and light commercial vehicles. "
                "Always confirm the base type and voltage rating of your existing bulb before purchasing a replacement — this information is usually printed on the side of the old bulb or listed in your vehicle's owner manual. "
                "Sold in multi-packs for cost-effective stocking by workshops, spares retailers, and fleet operators."
            )

        return (
            "A quality direct-replacement automotive component designed to restore full functionality to your vehicle quickly and without the need for specialist tools or workshop visits. "
            "Keeping your vehicle's lights, fittings, and accessories in good working order is both a legal requirement and an important safety consideration on South African roads.\n\n"
            "This part is compatible with most common passenger cars, bakkies, SUVs, and light commercial vehicles commonly found on South African roads. "
            "Confirm fitment compatibility by comparing with your existing part number or by consulting your vehicle's owner manual before purchase. "
            "Installation is designed to be a straightforward plug-and-play replacement in most vehicle applications.\n\n"
            "Sold in individual units or multi-packs for cost-effective stocking by motor spares retailers, automotive workshops, and fleet vehicle operators."
        )

    # ── TOOLS ─────────────────────────────────────────────────────────────────
    if category == "Tools":

        if "epoxy" in n or ("ab " in n and "glue" in n):
            return (
                "Two-component epoxy adhesives are the strongest general-purpose structural adhesive available for DIY and professional repair applications. "
                "The resin and hardener are kept separate until use — mixing the two components triggers a chemical cure reaction that produces a rigid, load-bearing, waterproof bond far stronger than any one-part adhesive.\n\n"
                "This 5-minute epoxy begins to set within approximately 5 minutes of mixing and reaches handling strength in around 30 minutes, making it suitable for repairs that need to be completed quickly. "
                "Full mechanical strength is achieved after 24 hours. "
                "The twin-syringe pack dispenses equal quantities of resin and hardener automatically, eliminating the need to measure or weigh components.\n\n"
                "Bonds effectively to: metal, wood, ceramic, glass, most rigid plastics, stone, and concrete. "
                "Not effective on polyethylene, polypropylene, silicone, or PTFE surfaces. "
                "Apply to both surfaces where possible, join immediately after mixing, and clamp or hold for the first 5 minutes."
            )

        if "contact cement" in n or "contact adhesive" in n:
            return (
                "Contact cement (contact adhesive) is the correct adhesive for bonding flexible materials such as rubber, leather, neoprene, foam, fabric laminates, and Formica-type decorative laminates to rigid substrates. "
                "Unlike other adhesives, contact cement is applied to BOTH surfaces, allowed to dry to a tack-free state, and then the surfaces are brought together — creating an instant, permanent bond on first contact.\n\n"
                "This makes contact cement ideal for large surface areas such as worktops, shoe sole repairs, and upholstery where repositioning after contact is not required. "
                "Apply a thin, even coat with a brush or roller, allow 10–15 minutes for the solvent to flash off, then carefully align the parts before bringing surfaces together. "
                "Press firmly across the entire bonded area."
            )

        if "super glue" in n or "cyanoacrylate" in n:
            return (
                "Cyanoacrylate super glue creates one of the fastest bonds available — typically setting in seconds on contact with skin oils or surface moisture. "
                "This makes it ideal for small, precise repairs where you need an instant result without clamping.\n\n"
                "Works best on smooth, close-fitting surfaces with minimal gap between parts. "
                "For porous materials like wood and ceramics, apply a thin coat to both surfaces. "
                "For non-porous materials like metal and glass, apply to one surface only. "
                "Bonds effectively to: ceramics, glass, metal, most hard plastics, rubber, and leather. "
                "Sold in a 12-tube multi-pack — ideal for retail resale, workshops, or bulk stocking."
            )

        if "hot glue" in n or "glue stick" in n:
            return (
                "Hot melt glue sticks are a versatile and fast-setting bonding medium widely used in crafts, DIY projects, display making, fabric work, and light repairs. "
                "When fed through a compatible hot glue gun and melted, the adhesive flows freely into porous surfaces and gaps, cooling within 30–60 seconds to form a strong, flexible bond.\n\n"
                "The flexible nature of the cured adhesive makes hot glue better suited than rigid adhesives for applications where some movement or vibration is expected. "
                "Suitable for bonding: fabric, foam, wood, cardboard, floral materials, light plastics, and decorative elements. "
                "Thin 7mm sticks are for use with mini glue guns; 11mm sticks require a full-size glue gun."
            )

        if "electrical" in n and "tape" in n or "insulation" in n and "tape" in n:
            return (
                "PVC electrical insulation tape is a fundamental consumable in any electrical or maintenance workshop. "
                "It is used to insulate bare wire joins, protect terminal connections, bundle cable runs, mark circuit identifiers with colour coding, and provide a moisture barrier on outdoor wiring connections.\n\n"
                "The PVC backing stretches slightly to conform tightly to the irregular shapes of wire joins and connector housings, creating a void-free insulation layer that prevents accidental contact and moisture ingress. "
                "The flame-retardant formulation will not support combustion — if exposed to heat, it chars rather than burning.\n\n"
                "Suitable for low-voltage domestic and light commercial wiring applications. "
                "Always ensure power is isolated before working on any wiring, regardless of the insulation tape rating."
            )

        if "flashing" in n or ("waterproof" in n and "tape" in n):
            return (
                "Waterproof self-adhesive flashing tape is a builder's essential for creating permanent, watertight seals on roofing joints, pipe penetrations, gutter repairs, skylight flashings, and wall-to-roof junctions. "
                "The bitumen membrane adheres aggressively to most dry construction substrates on first contact — no primers, heat guns, or special tools required.\n\n"
                "Once applied, the membrane conforms to irregular surfaces and folds around corners to create a continuous waterproof barrier that accommodates minor structural movement without cracking or delaminating. "
                "Rated for extended outdoor service in direct sunlight and UV exposure, with a service life exceeding 15 years in most climates.\n\n"
                "Suitable for: IBR roofing sheeting, concrete, brick, timber, most HDPE and EPDM membranes, and metal gutters. "
                "Surface must be clean and dry for best adhesion. Press down firmly across the full tape width after application."
            )

        return (
            "Built for reliability across both professional and DIY use cases, this product meets the demands of common workshop and construction tasks. "
            "Quality materials and tested formulations ensure consistent performance and dependable results each time.\n\n"
            "Whether you are a tradesperson looking for a reliable trade consumable, a DIY enthusiast tackling home repairs and improvement projects, or a retailer stocking a broad range of workshop essentials, this product delivers the performance needed at a competitive price point.\n\n"
            "Store in a cool, dry environment away from direct sunlight and heat. Ensure the work surface is clean, dry, and free from dust and grease before application for best results. "
            "Suitable for trade, retail resale, and bulk stocking by hardware stores and building material suppliers."
        )

    # ── POWER BANKS ──────────────────────────────────────────────────────────
    if category == "Power Banks":
        return (
            "A portable power bank is an essential travel and everyday carry accessory that keeps your smartphone, tablet, earbuds, and other USB-powered devices charged when you're away from a wall socket. "
            "In South Africa's load-shedding environment, a reliable power bank provides critical backup power during outages — keeping your phone charged for communication, mobile data, and safety.\n\n"
            "This power bank features built-in protection circuits against overcharging, over-discharging, overcurrent, and short circuits — protecting both the battery cells and your connected devices from damage. "
            "The compact form factor is designed to slip easily into a pocket, handbag, laptop bag, or backpack for all-day carry without added bulk."
        )

    # ── CABLES ───────────────────────────────────────────────────────────────
    if category == "Cables":
        return (
            "A quality charging and data cable is the difference between reliable, fast charging and the frustration of slow speeds, intermittent connections, and cables that fail within weeks. "
            "Poor-quality cables with undersized copper conductors create resistance that limits current delivery and generates heat — a safety concern and a common cause of slow charging.\n\n"
            "This cable uses quality copper conductors dimensioned for both fast charging and data transfer. "
            "Reinforced strain relief at the connector ends — the most common failure point on cheaper cables — protects against the bending fatigue caused by daily plugging and unplugging. "
            "Suitable for everyday home and office use with smartphones, tablets, earphones, and other USB-powered accessories."
        )

    # ── CHARGERS ─────────────────────────────────────────────────────────────
    if category == "Chargers":
        return (
            "A reliable USB wall charger provides the stable, regulated power supply that your devices need to charge safely and efficiently. "
            "Unregulated or poorly manufactured chargers are a known cause of battery degradation, slow charging, and in extreme cases, device damage or overheating.\n\n"
            "This charger incorporates overcharge, short-circuit, and overvoltage protection circuits that automatically regulate output to match the safe charging parameters of connected devices. "
            "The compact design suits standard South African 3-pin wall sockets and is suitable for permanent installation at bedside, desk, and kitchen charging points."
        )

    # ── SMARTWATCHES ─────────────────────────────────────────────────────────
    if category == "Smartwatches":
        return (
            "Smartwatches have evolved from basic fitness trackers into capable everyday wearables that put health monitoring, communication, and convenience directly on your wrist. "
            "This smartwatch pairs with your Android or iOS smartphone via Bluetooth to display incoming call alerts, SMS messages, and app notifications — keeping you informed without reaching for your phone.\n\n"
            "The built-in health monitoring sensors track your heart rate, step count, active calories, and sleep duration throughout the day and night, providing a continuous picture of your physical activity and rest patterns. "
            "The companion smartphone app aggregates this data into weekly and monthly trend views to help you monitor your health goals over time.\n\n"
            "Water-resistant construction protects against sweat, rain, and splashes during everyday activity. "
            "The rechargeable battery charges via the included magnetic or USB charging dock."
        )

    return (
        "Quality construction and reliable performance for everyday use. "
        "Suitable for home, office, and professional environments."
    )

# ─── Bullet points ────────────────────────────────────────────────────────────

def bullet_points(name: str, category: str, description: str, specs: dict) -> str:
    n = name.lower()
    bullets: list[str] = []

    # Specs from extraction
    if "dimensions" in specs:
        bullets.append(f"Size: {specs['dimensions']}")
    if "pack" in specs:
        bullets.append(f"Pack size: {specs['pack']}")
    if "weight" in specs:
        bullets.append(f"Net weight: {specs['weight']}")
    if "duration" in specs:
        bullets.append(f"Burn/protection time: {specs['duration']}")
    if "nights" in specs:
        bullets.append(f"Protection duration: {specs['nights']}")
    if "length" in specs and "dimensions" not in specs:
        bullets.append(f"Length: {specs['length']}")

    # Category + product-specific bullets
    if category == "Kitchen" and "melamine" in n:
        bullets += [
            "Material: Food-safe, BPA-free melamine resin",
            "Shatter-resistant — will not crack or break if dropped",
            "Heat-fused print — does not peel, chip, or fade",
            "Lightweight and comfortable to hold",
            "Hand wash recommended with mild detergent",
            "Not suitable for microwave or oven use",
        ]

    elif category == "Automobile" and ("t5" in n or "t10" in n):
        bullets += [
            "Base type: Wedge (T5 or T10 as specified)",
            "Rated voltage: 12V",
            "Plug-and-play installation — no tools required",
            "Compatible with most passenger cars, bakkies, motorcycles",
            "Suitable for: position lights, sidelights, indicator, dashboard",
            "Sold in multi-pack for workshop and resale stocking",
        ]

    elif category == "Automobile" and "1157" in n:
        bullets += [
            "Base type: BAY15D (dual-contact bayonet, offset pins)",
            "Dual-filament — running light and brake light in one bulb",
            "Rated voltage: 12V",
            "Suitable for: combined brake/tail light sockets",
            "Direct OEM-equivalent replacement — no modifications needed",
            "Twist-and-lock bayonet installation",
        ]

    elif category == "Automobile" and "1156" in n:
        bullets += [
            "Base type: BA15S (single-contact bayonet, equal-spaced pins)",
            "Single-filament design",
            "Rated voltage: 12V",
            "Suitable for: brake lights, reversing lights, turn signals",
            "Direct OEM-equivalent replacement",
            "Twist-and-lock bayonet installation",
        ]

    elif category == "Automobile" and ("tyre" in n or "puncture" in n):
        bullets += [
            "Compatible with: tubeless car, bakkie, SUV, and motorcycle tyres",
            "No wheel removal required — repair in place",
            "Includes: reamer tool, needle insertion tool, rubber plugs",
            "Compact — fits in glove box or tool bag",
            "Most repairs completed in under 5 minutes",
            "Permanent repair suitable for full-speed highway driving",
        ]

    elif category == "Accessories" and ("thermal" in n or "receipt" in n):
        bullets += [
            "No ink or ribbon required — heat-sensitive coating",
            "High-sensitivity coating for sharp text and barcodes",
            "Compatible with most standard 80mm thermal POS printers",
            "Smooth, bright white paper surface",
            "BPA-free thermal coating",
        ]

    elif category == "Accessories" and ("packaging tape" in n or ("clear" in n and "tape" in n)):
        bullets += [
            "Strong acrylic pressure-sensitive adhesive",
            "Clear finish for professional, clean packaging",
            "Excellent adhesion to cardboard and plastic",
            "Temperature-resistant adhesive",
            "Compatible with standard tape guns and dispensers",
        ]

    elif category == "Accessories" and "nano" in n:
        bullets += [
            "Nano-suction technology — no chemical adhesive",
            "Leaves zero residue on surfaces",
            "Washable and fully reusable — rinse with water to restore grip",
            "Works on: glass, tiles, metal, smooth plastic",
            "Not suitable for rough, textured, or porous surfaces",
        ]

    elif category == "Accessories" and "masking" in n:
        bullets += [
            "Tears cleanly by hand — no scissors required",
            "Removes cleanly — no adhesive residue on most surfaces",
            "Temperature-resistant up to ~80°C",
            "Suitable for: painting, labelling, bundling, protection",
            "Conforms to curved and irregular surfaces",
        ]

    elif category == "Accessories" and "double-sided" in n or "mounting tape" in n:
        bullets += [
            "Bonds to: painted walls, tiles, glass, metal, plastic",
            "No nails or screws required",
            "Foam core compensates for minor surface irregularities",
            "Clean surfaces before application for best adhesion",
            "Press firmly for 30 seconds to activate bond",
        ]

    elif category == "Tools" and "epoxy" in n:
        bullets += [
            "Two-component epoxy — mix resin and hardener equally",
            "Working time: ~5 minutes after mixing",
            "Full strength achieved after 24 hours",
            "Bonds: metal, wood, ceramic, glass, most rigid plastics",
            "Waterproof when fully cured",
            "Rigid bond — suitable for structural load-bearing repairs",
        ]

    elif category == "Tools" and "super glue" in n:
        bullets += [
            "Instant cyanoacrylate adhesive — sets in seconds",
            "Bonds: ceramics, metal, glass, rubber, most hard plastics",
            "Minimal clamping required",
            "Best on close-fitting, smooth surfaces",
            "Multi-tube pack for workshop or retail stocking",
        ]

    elif category == "Tools" and "hot glue" in n or "glue stick" in n:
        dim = "7mm (mini glue gun)" if "7mm" in n else "11mm (full-size glue gun)" if "11mm" in n else "standard size"
        bullets += [
            f"Stick diameter: {dim}",
            "Clean-melt formula — minimal stringing",
            "Sets in 30–60 seconds",
            "Suitable for: fabric, foam, wood, cardboard, plastics",
            "Flexible when cured — suitable for materials with some movement",
        ]

    elif category == "Tools" and "electrical" in n and "tape" in n:
        bullets += [
            "Material: PVC (polyvinyl chloride)",
            "Flame-retardant — chars rather than burning",
            "Moisture-resistant adhesive",
            "Conforms to irregular surfaces and wire joins",
            "Suitable for indoor wiring insulation applications",
        ]

    elif category == "Tools" and "flashing" in n:
        bullets += [
            "Self-adhesive bitumen membrane — no primer required",
            "Instant waterproof seal",
            "UV and weather-resistant",
            "Service life: 15+ years outdoors",
            "Bonds to: metal, concrete, wood, most roofing membranes",
            "Apply to clean, dry surfaces for best adhesion",
        ]

    elif category == "Household" and ("mosquito coil" in n or ("coil" in n and "mosquito" in description.lower())):
        bullets += [
            "Low-smoke formula",
            "Provides continuous protection when burning",
            "For indoor and semi-outdoor use",
            "Place on included metal or plastic coil holder",
            "Position at low level — mosquitoes fly close to the ground",
            "Do not use in fully enclosed, unventilated spaces",
        ]

    elif category == "Household" and "electric" in n and "mosquito" in n:
        bullets += [
            "Plug-in 220V electric heater unit",
            "No flame, no smoke, no strong odour",
            "Reaches operating temperature within 15 minutes",
            "Compatible with standard 30ml electric mosquito liquid refills",
            "Effective in closed rooms and bedrooms",
            "Lemon fragrance during operation",
        ]

    elif category == "Household" and "toilet" in n:
        bullets += [
            "Drop-in cistern block — no tools required",
            "Prevents limescale and mineral build-up",
            "Neutralises odours with every flush",
            "Lasts approximately 4–6 weeks per block",
            "Safe for septic tank systems",
        ]

    elif category == "Household" and ("trap" in n or "glue board" in n):
        bullets += [
            "Non-toxic — no pesticides or poisons",
            "Safe for use in kitchens and food preparation areas",
            "No baiting required — ready to use out of the packaging",
            "Place along walls, corners, and under appliances",
            "Disposable — seal in bag and discard when full",
        ]

    elif category == "Power Banks":
        bullets += [
            "Overcharge, over-discharge, short-circuit, and overcurrent protection",
            "USB output — compatible with all USB-powered devices",
            "Compact and lightweight for everyday carry",
            "Rechargeable via USB input cable",
            "Indicator lights show remaining charge level",
        ]

    elif category == "Cables":
        bullets += [
            "Quality copper conductors for stable charge and data performance",
            "Reinforced strain relief at both connector ends",
            "Wide device compatibility",
            "Suitable for charging and data sync",
            "Durable PVC or braided outer jacket",
        ]

    elif category == "Chargers":
        bullets += [
            "Overcharge and short-circuit protection",
            "Stable, regulated output voltage",
            "Compact design for standard South African 3-pin wall socket",
            "Compatible with all standard USB-powered devices",
            "No adaptor required — direct plug-in",
        ]

    elif category == "Smartwatches":
        bullets += [
            "Bluetooth connectivity — pairs with Android and iOS",
            "Heart rate monitoring",
            "Step counter and calorie tracking",
            "Sleep tracking",
            "Notification alerts: calls, SMS, app notifications",
            "Water-resistant construction",
            "Rechargeable battery — magnetic or USB charging dock",
        ]

    # Pad to at least 5 bullets with generic category extras
    generic = {
        "Accessories": ["Suitable for home and office use", "Durable construction", "Good value for money"],
        "Household":   ["Safe for family use", "Easy to use — no specialist equipment required", "Effective for indoor and outdoor applications"],
        "Kitchen":     ["Easy to clean", "Food-safe materials", "Suitable for everyday family use"],
        "Automobile":  ["Direct replacement — no modifications required", "Compatible with most vehicle makes", "Long service life"],
        "Tools":       ["Suitable for DIY and professional use", "Professional-grade performance", "Easy application"],
        "Power Banks": ["Ideal for load-shedding backup power", "Lightweight everyday carry"],
        "Cables":      ["Tangle-resistant design", "Long cable for flexible use"],
        "Chargers":    ["Energy-efficient design", "Suitable for bedside and desk use"],
        "Smartwatches":["Comfortable everyday wear", "Companion app available for Android and iOS"],
    }
    for extra in generic.get(category, ["Quality construction", "Reliable performance"]):
        if len(bullets) >= 8:
            break
        if extra not in bullets:
            bullets.append(extra)

    return "**Key features:**\n" + "\n".join(f"• {b}" for b in bullets[:8])

# ─── Assemble full description ─────────────────────────────────────────────────

def full_description(name: str, category: str, description: str, specs: dict) -> str:
    opening = description.strip()
    if opening and not opening.endswith("."):
        opening += "."

    expansion = expansion_paragraphs(name, category, description)
    bullets    = bullet_points(name, category, description, specs)

    parts = [p for p in [opening, expansion, bullets] if p]
    return "\n\n".join(parts)

# ─── Main processor ───────────────────────────────────────────────────────────

def _sec(title: str, items: list[tuple[str, str]]) -> dict:
    return {"title": title, "items": [{"label": l, "value": v} for l, v in items]}


def generate_specifications(name: str, category: str, description: str, specs: dict) -> str:  # noqa: C901
    """Return a JSON string of SpecSection[] for a product."""
    n = name.lower()
    d = description.lower()
    combined = n + " " + d
    sections = []

    # ── Extraction helpers ────────────────────────────────────────────────────
    def _cap(text=combined):
        m = re.search(r'(\d[\d,]*)\s*m(?:ah|AH)', text, re.IGNORECASE)
        if m:
            val = m.group(1).replace(",", "")
            return f"{int(val):,} mAh"
        return None

    def _watts(text=combined):
        m = re.search(r'(\d+(?:\.\d+)?)\s*w\b', text, re.IGNORECASE)
        return f"{m.group(1)}W" if m else None

    def _ip(text=combined):
        m = re.search(r'\bip(\d{2})\b', text, re.IGNORECASE)
        return f"IP{m.group(1)}" if m else None

    def _inch(text=n):
        m = re.search(r'(\d+(?:\.\d+)?)["\s-]*(?:inch|in)\b', text, re.IGNORECASE)
        return f'{m.group(1)}"' if m else None

    def _pieces(text=n):
        m = re.search(r'(\d+)[\s-]*(?:piece|pcs?|pack|count|set of)\b', text, re.IGNORECASE)
        if not m:
            m = re.search(r'set of (\d+)', text, re.IGNORECASE)
        return m.group(1) if m else None

    def _length_m(text=n):
        m = re.search(r'(\d+(?:\.\d+)?)\s*m\b', text)
        return f"{m.group(1)}m" if m else None

    def _resolution(text=combined):
        if "4k" in text or "3840" in text: return "4K Ultra HD (3840×2160)"
        if "1080p" in text or "1080" in text: return "1080P Full HD (1920×1080)"
        if "720p" in text or "720" in text: return "720P HD (1280×720)"
        return "HD"

    def _bluetooth_ver(text=combined):
        m = re.search(r'bluetooth\s*v?(\d+(?:\.\d+)?)', text, re.IGNORECASE)
        return f"Bluetooth {m.group(1)}" if m else "Bluetooth 5.0"

    def _leds(text=n):
        m = re.search(r'(\d+)[\s-]*(?:led|bulb|light)\b', text, re.IGNORECASE)
        return m.group(1) if m else None

    def _litres(text=combined):
        m = re.search(r'(\d+(?:\.\d+)?)\s*(?:l|litre|liter|liters)\b', text, re.IGNORECASE)
        if m: return f"{m.group(1)}L"
        m = re.search(r'(\d+(?:\.\d+)?)\s*ml\b', text, re.IGNORECASE)
        return f"{m.group(1)}ml" if m else None

    def _grit(text=n):
        m = re.search(r'#?(\d+)\s*grit', text, re.IGNORECASE)
        return f"#{m.group(1)}" if m else None

    GENERAL = _sec("General", [
        ("Warranty", "12 Months"),
        ("Shipping", "Same-day Gauteng · 2-4 days nationwide"),
    ])

    # ── POWER BANKS ───────────────────────────────────────────────────────────
    if category == "Power Banks":
        cap = _cap() or "As specified"
        wireless = "Yes" if "wireless" in combined or "qi" in combined else "No"
        ports_m = re.search(r'(\d+)[\s-]*(?:usb|port)', n)
        ports = ports_m.group(1) if ports_m else "2"
        w = _watts() or "18W"
        sections.append(_sec("Technical Specs", [
            ("Capacity", cap),
            ("Output Ports", f"{ports}× USB ports (USB-A / USB-C)"),
            ("Max Output", w),
            ("Input", "USB-C / Micro-USB (as equipped)"),
            ("Wireless Charging", wireless),
            ("LED Indicator", "Yes — battery level display"),
            ("Protection", "Overcharge · over-discharge · overcurrent · short-circuit · temperature control"),
        ]))
        phones = "2–3" if int(re.search(r'\d+', cap.replace(',', '')).group()) >= 10000 else "1"
        sections.append(_sec("Capacity Guide", [
            ("Typical Smartphone (4,000 mAh)", f"~{int(re.search(r'[\d,]+', cap).group().replace(',','')) // 4000 or 1}× full charges"),
            ("Simultaneous Devices", f"Up to {phones} devices at once"),
            ("Load Shedding Use", "Yes — ideal backup power during SA load shedding"),
        ]))
        sections.append(GENERAL)

    # ── CABLES ────────────────────────────────────────────────────────────────
    elif category == "Cables":
        length = _length_m() or "1m"
        is_3in1 = "3-in-1" in n or "3 in 1" in n
        if is_3in1:
            conn_a = "USB-A"
            conn_b = "Lightning + USB-C + Micro-USB"
            data = "Sync and charge"
        elif "speaker wire" in n or "speaker cable" in n:
            gauge_m = re.search(r'2x(\d+)', n)
            gauge = f"2×{gauge_m.group(1)}" if gauge_m else "2-core"
            sections.append(_sec("Technical Specs", [
                ("Type", "2-core speaker wire"),
                ("Configuration", gauge),
                ("Conductor", "Stranded oxygen-free copper (OFC)"),
                ("Length", length if length != "1m" else (_length_m(combined) or "As specified")),
                ("Colour Coding", "Red (+) / Black (−)"),
            ]))
            sections.append(_sec("Application", [
                ("Suitable For", "Home hi-fi, car audio, ceiling speakers, amplifiers"),
                ("Max Current", "Suitable for standard speaker loads up to 100W"),
            ]))
            sections.append(GENERAL)
            return json.dumps(sections, ensure_ascii=False)
        elif "type-c to type-c" in n or "usb-c to type-c" in n:
            conn_a = "USB-C"
            conn_b = "USB-C"
            data = "Yes — USB 2.0 data transfer"
        elif "iphone" in n or "lightning" in n:
            conn_a = "USB-A" if "usb to" in n else "USB-C"
            conn_b = "Lightning (iPhone / iPad)"
            data = "Yes — sync and charge"
        elif "type-c" in n or "usb-c" in n:
            conn_a = "USB-A" if "usb to" in n else "USB-C"
            conn_b = "USB-C (Android, tablets, laptops)"
            data = "Yes — sync and charge"
        else:
            conn_a = "USB-A"
            conn_b = "Micro-USB"
            data = "Yes — sync and charge"
        sections.append(_sec("Technical Specs", [
            ("Connector A", conn_a),
            ("Connector B", conn_b),
            ("Cable Length", length),
            ("Max Charging Current", "Up to 3A"),
            ("Data Transfer", data),
            ("Jacket", "Braided nylon or TPE — tangle-resistant"),
            ("Strain Relief", "Reinforced at both connectors"),
        ]))
        sections.append(_sec("Compatibility", [
            ("Compatible With", "Smartphones, tablets, earbuds, power banks"),
            ("Fast Charge", "Compatible where device supports it"),
        ]))
        sections.append(GENERAL)

    # ── CHARGERS ──────────────────────────────────────────────────────────────
    elif category == "Chargers":
        w = _watts()
        cap = _cap()
        bt = _bluetooth_ver()

        if cap:
            # It's a power bank in the Chargers category
            sections.append(_sec("Technical Specs", [
                ("Capacity", cap),
                ("Output", "USB-A / USB-C"),
                ("Input", "USB-C / Micro-USB"),
                ("Built-in Cables", "USB-C and Lightning (where equipped)"),
                ("Protection", "Overcharge · overcurrent · short-circuit"),
            ]))
            sections.append(_sec("Capacity Guide", [
                ("Simultaneous Devices", "Up to 2"),
                ("Load Shedding Use", "Yes"),
            ]))
        elif "fm" in n or "transmitter" in n or "mp3" in n:
            sections.append(_sec("Technical Specs", [
                ("Bluetooth", bt),
                ("FM Transmitter", "Yes — broadcasts audio to car radio"),
                ("USB Ports", "Dual USB (charge while listening)"),
                ("Hands-Free Calling", "Yes — built-in microphone"),
                ("Audio Input", "3.5mm AUX / Bluetooth / USB playback"),
            ]))
            sections.append(_sec("Compatibility", [
                ("Works With", "Any car with FM radio"),
                ("Device Support", "Android and iOS"),
            ]))
        elif "12v" in combined and ("battery" in n or "charger" in n or "pulse" in n or "intelligent" in n):
            amps_m = re.search(r'(\d+(?:\.\d+)?)\s*a\b', n, re.IGNORECASE)
            amps = f"{amps_m.group(1)}A" if amps_m else "As specified"
            sections.append(_sec("Technical Specs", [
                ("Input Voltage", "220–240V AC (standard SA plug)"),
                ("Output Voltage", "12V DC"),
                ("Output Current", amps),
                ("Charge Modes", "Intelligent pulse charge — desulfation, bulk, absorption, float"),
                ("Battery Types", "Lead-acid, AGM, gel"),
                ("Protection", "Reverse polarity · overcharge · short-circuit"),
            ]))
            sections.append(_sec("Compatibility", [
                ("Compatible With", "12V car, bakkie, motorcycle, UPS and backup batteries"),
                ("LED Indicator", "Yes — charge status display"),
            ]))
        elif "slot" in n and ("battery charger" in n or "smart charger" in n or "charger" in n):
            slot_m = re.search(r'(\d+)\s*slot', n)
            slots = slot_m.group(1) if slot_m else "4"
            sections.append(_sec("Technical Specs", [
                ("Slots", slots),
                ("Charge Current", "As rated per slot"),
                ("Compatible Batteries", "AA, AAA NiMH / NiCd rechargeable batteries"),
                ("Display", "LED charge status per slot"),
                ("Protection", "Overcharge · reverse polarity · short-circuit"),
            ]))
        elif "solar" in n:
            w_label = w or "3.8W"
            sections.append(_sec("Technical Specs", [
                ("Panel Power", w_label),
                ("Output", "USB 5V"),
                ("Use Case", "Emergency charging — camping, hiking, outdoor activities"),
            ]))
        elif "otg" in n or ("adapter" in n and ("lightning" in n or "usb" in n)):
            sections.append(_sec("Technical Specs", [
                ("Type", "OTG multi-port adapter"),
                ("Ports", "Lightning + USB-C + Micro-USB + USB-A"),
                ("Function", "Charge and sync — one cable, any device"),
                ("Data Transfer", "Yes"),
            ]))
        elif "bluetooth" in n and ("transmitter" in n or "receiver" in n or "adapter" in n or "dongle" in n):
            sections.append(_sec("Technical Specs", [
                ("Bluetooth", bt),
                ("Modes", "Transmitter (TX) and Receiver (RX)" if "transmitter" in n and "receiver" in n else ("Transmitter" if "transmitter" in n else "Receiver / Adapter")),
                ("Audio Connection", "3.5mm AUX and/or USB-C"),
                ("Range", "Up to 10m"),
                ("Latency", "Low — suitable for audio sync"),
            ]))
            sections.append(_sec("Compatibility", [
                ("Compatible With", "TVs, stereos, speakers, headphones, laptops, phones"),
                ("Dual Link", "Pair to two Bluetooth devices simultaneously"),
            ]))
        elif w:
            # Generic fast wall charger
            ports_m = re.search(r'(\d+)[\s-]*(?:port|usb)', n)
            ports = ports_m.group(1) if ports_m else "1"
            sections.append(_sec("Technical Specs", [
                ("Total Output", w),
                ("Ports", f"{ports}× USB (USB-A / USB-C)"),
                ("Fast Charge", "Yes" if int(w.replace("W","")) >= 18 else "Standard 5W"),
                ("Input", "220–240V AC (standard SA 3-pin plug)"),
                ("Protection", "Overcharge · overvoltage · short-circuit · temperature"),
            ]))
            sections.append(_sec("Compatibility", [
                ("Compatible With", "All USB-powered smartphones, tablets, earbuds"),
                ("Cable Included", "Check product listing — some sets include cable"),
            ]))
        else:
            sections.append(_sec("Technical Specs", [
                ("Input", "220–240V AC (standard SA 3-pin plug)"),
                ("Output", "5V / 2A USB-A"),
                ("Protection", "Overcharge · overvoltage · short-circuit"),
            ]))
            sections.append(_sec("Compatibility", [
                ("Compatible With", "All standard USB-powered devices"),
            ]))
        sections.append(GENERAL)

    # ── SMARTWATCHES ──────────────────────────────────────────────────────────
    elif category == "Smartwatches":
        bt = _bluetooth_ver()
        screen_m = re.search(r'(\d+\.\d+)[\s-]*inch', n)
        screen = f'{screen_m.group(1)}"' if screen_m else "1.7–2.0 inch"
        has_sim = "sim" in combined
        sections.append(_sec("Display", [
            ("Screen Size", screen),
            ("Display Type", "Colour IPS / AMOLED touch screen"),
            ("Touch Screen", "Yes — full touch interface"),
            ("Always-On Display", "Optional"),
        ]))
        conn_items = [
            ("Bluetooth", bt),
            ("Compatible OS", "Android 5.0+ and iOS 10+"),
            ("Companion App", "FitPro / Wearfit / HiWear via Bluetooth"),
        ]
        if has_sim:
            conn_items.append(("SIM Card Slot", "Yes — call and receive calls independently"))
            conn_items.append(("SIM Type", "Standard nano SIM"))
        sections.append(_sec("Connectivity", conn_items))
        sections.append(_sec("Health & Fitness", [
            ("Heart Rate Monitor", "Yes — continuous real-time tracking"),
            ("Blood Oxygen (SpO2)", "Yes"),
            ("Step Counter", "Yes — daily step goal tracking"),
            ("Calorie Tracking", "Yes"),
            ("Sleep Tracking", "Yes — light, deep and REM analysis"),
            ("Sports Modes", "100+ — running, cycling, swimming, yoga and more"),
            ("Sedentary Reminder", "Yes"),
        ]))
        sections.append(_sec("Battery & Build", [
            ("Battery", "Rechargeable lithium-ion"),
            ("Battery Life", "5–7 days typical use"),
            ("Charging", "Magnetic charging dock"),
            ("Water Resistance", "IP67 — splash and sweat proof"),
            ("Case Material", "Alloy frame with silicone strap"),
        ]))
        sections.append(_sec("Notifications", [
            ("Call Alerts", "Yes — incoming call display"),
            ("Message Alerts", "WhatsApp, SMS, email and app notifications"),
            ("Camera Shutter", "Remote phone camera control"),
            ("Find Phone", "Yes"),
        ]))
        sections.append(GENERAL)

    # ── AUTOMOBILE ────────────────────────────────────────────────────────────
    elif category == "Automobile":
        # Extract chip type and LED count from model numbers like CXT5-2016-6
        chip = next((c for c in ["2016","3014","4014","3030","5630","2835","1156","1157"] if c in name), None)
        led_count_m = re.search(r'-(\d+)$', name.split()[0])
        led_count = led_count_m.group(1) if led_count_m else None
        pack_m = re.search(r'(\d+)[\s-]*pack', n)
        pack_qty = pack_m.group(1) if pack_m else None

        if "t10" in n:
            tech = [("Base Type","T10 Wedge"), ("Rated Voltage","12V DC"), ("Application","Position light / Sidelight / Clearance")]
            if chip: tech.append(("LED Chip",chip))
            if led_count: tech.append(("LED Count",f"{led_count} LEDs"))
            tech.append(("Installation","Plug-and-play — no tools required"))
            sections.append(_sec("Technical Details", tech))
            sections.append(_sec("Compatibility",[
                ("Vehicle Types","Cars, bakkies, SUVs, motorcycles"),
                ("Socket","T10 wedge socket"),
                ("Modification Required","No"),
            ]))
        elif "t5" in n:
            tech = [("Base Type","T5 Wedge"), ("Rated Voltage","12V DC"), ("Application","Position light / Sidelight / Indicator")]
            if chip: tech.append(("LED Chip",chip))
            if led_count: tech.append(("LED Count",f"{led_count} LEDs"))
            tech.append(("Installation","Plug-and-play — no tools required"))
            sections.append(_sec("Technical Details", tech))
            sections.append(_sec("Compatibility",[
                ("Vehicle Types","Cars, bakkies, SUVs, motorcycles"),
                ("Socket","T5 wedge socket"),
                ("Modification Required","No"),
            ]))
        elif "1157" in n:
            pack_label = f"Pack of {pack_qty}" if pack_qty else "As specified"
            sections.append(_sec("Technical Details",[
                ("Base Type","BAY15D (dual-contact bayonet, offset pins)"),
                ("Filament","Dual — running light + brake light"),
                ("Rated Voltage","12V DC"),
                ("Application","Combined brake / tail light sockets"),
                ("Pack Size", pack_label),
            ]))
            sections.append(_sec("Compatibility",[
                ("Vehicle Types","Cars, bakkies, SUVs, vans"),
                ("Installation","Push and twist clockwise to lock"),
                ("Modification Required","No"),
            ]))
        elif "1156" in n:
            pack_label = f"Pack of {pack_qty}" if pack_qty else "As specified"
            sections.append(_sec("Technical Details",[
                ("Base Type","BA15S (single-contact bayonet, equal pins)"),
                ("Filament","Single"),
                ("Rated Voltage","12V DC"),
                ("Application","Brake light, reversing light, turn signal"),
                ("Pack Size", pack_label),
            ]))
            sections.append(_sec("Compatibility",[
                ("Vehicle Types","Cars, bakkies, SUVs, vans"),
                ("Installation","Push and twist clockwise to lock"),
                ("Modification Required","No"),
            ]))
        elif "tyre" in n or "tire" in n or "puncture" in n:
            sections.append(_sec("Kit Contents",[
                ("Includes","Reamer tool, needle insertion tool, rubber plugs"),
                ("Plug Type","Rubber strip plugs"),
                ("Repair Method","Plug-and-seal without wheel removal"),
            ]))
            sections.append(_sec("Compatibility",[
                ("Tyre Types","Tubeless — car, bakkie, SUV, motorcycle"),
                ("Wheel Removal Required","No"),
                ("Typical Repair Time","Under 5 minutes"),
            ]))
        else:
            # Generic park/position light bulb
            sections.append(_sec("Technical Details",[
                ("Rated Voltage","12V DC"),
                ("Application","Position light / Sidelight"),
                ("Installation","Plug-and-play — no tools required"),
            ]))
            sections.append(_sec("Compatibility",[
                ("Vehicle Types","Cars, bakkies, SUVs, motorcycles"),
                ("Modification Required","No"),
                ("Reference","Check existing bulb markings before purchasing"),
            ]))
        sections.append(_sec("General",[
            ("Country of Use","South Africa (12V electrical system)"),
            ("Warranty","12 Months"),
            ("Shipping","Same-day Gauteng · 2-4 days nationwide"),
        ]))

    # ── KITCHEN ───────────────────────────────────────────────────────────────
    elif category == "Kitchen":
        size_m = re.search(r'(\d+(?:\.\d+)?)["\s-]*(?:inch|in|cm)\b', n)
        size = size_m.group(0).strip().title() if size_m else None
        pieces = _pieces()
        capacity = _litres()

        if "melamine" in n:
            product_items = [
                ("Material", "BPA-free melamine resin"),
                ("BPA Free", "Yes"),
                ("Food Safe", "Yes — meets international food contact standards"),
                ("Dishwasher Safe", "No — hand wash recommended"),
                ("Microwave Safe", "No"),
                ("Shatter Resistant", "Yes — will not crack or break like ceramic"),
            ]
            if size: product_items.insert(0, ("Size", size))
            if pieces: product_items.insert(0, ("Pieces", pieces))
            sections.append(_sec("Product Details", product_items))
            sections.append(_sec("Care Instructions", [
                ("Cleaning", "Hand wash with mild liquid detergent"),
                ("Drying", "Air dry or towel dry — do not leave soaking"),
                ("Storage", "Stack safely — shatter-resistant surface"),
            ]))

        elif any(w in n for w in ["water bottle", "water flask", "sports bottle"]):
            mat = "Stainless steel" if any(w in combined for w in ["stainless", "steel", "metal"]) else (
                  "Vacuum insulated stainless steel" if any(w in combined for w in ["vacuum", "insulated", "thermos"]) else
                  "BPA-free plastic")
            insulated = "Yes — double-wall vacuum insulation" if "vacuum" in combined or "insulated" in combined else "No — single wall"
            items = [
                ("Material", mat),
                ("Capacity", capacity or "500ml – 1L"),
                ("BPA Free", "Yes"),
                ("Leak Proof", "Yes — sealed screw cap"),
                ("Insulated", insulated),
                ("Dishwasher Safe", "No — hand wash recommended"),
            ]
            sections.append(_sec("Product Details", items))
            sections.append(_sec("Care Instructions", [
                ("Cleaning", "Hand wash with warm water and mild detergent"),
                ("Do Not", "Place in microwave or dishwasher"),
                ("Drying", "Leave cap off to air dry completely"),
            ]))

        elif any(w in n for w in ["cup", "mug", "tumbler"]) or ("coffee" in n and "cup" in combined):
            mat = "Stainless steel" if any(w in combined for w in ["stainless", "steel", "metal"]) else (
                  "Vacuum insulated stainless steel" if "vacuum" in combined else "Food-safe plastic")
            keep_hot_m = re.search(r'(\d+)\s*hours?\s*hot', combined)
            keep_cold_m = re.search(r'(\d+)\s*hours?\s*cold', combined)
            items = [
                ("Material", mat),
                ("Capacity", capacity or "350ml – 500ml"),
                ("BPA Free", "Yes"),
                ("Lid Type", "Screw-on lid with drinking hole"),
                ("Insulated", "Yes — double-wall vacuum" if "vacuum" in combined else "No"),
            ]
            if keep_hot_m: items.append(("Keeps Hot", f"Up to {keep_hot_m.group(1)} hours"))
            if keep_cold_m: items.append(("Keeps Cold", f"Up to {keep_cold_m.group(1)} hours"))
            sections.append(_sec("Product Details", items))
            sections.append(_sec("Care Instructions", [
                ("Cleaning", "Hand wash with mild detergent"),
                ("Do Not", "Microwave or dishwasher"),
            ]))

        elif "flask" in n or "thermos" in n or "vacuum" in n:
            items = [
                ("Material", "Double-wall vacuum stainless steel"),
                ("Capacity", capacity or "500ml"),
                ("Keeps Hot", "Up to 12 hours"),
                ("Keeps Cold", "Up to 24 hours"),
                ("Lid", "Screw cap — leak-proof seal"),
                ("BPA Free", "Yes"),
                ("Dishwasher Safe", "No — hand wash only"),
            ]
            sections.append(_sec("Product Details", items))

        elif any(w in n for w in ["scissors", "knife", "knives", "cutter", "peeler"]):
            blade_m = re.search(r'(\d+(?:\.\d+)?)\s*(?:inch|cm)', n)
            items = [
                ("Blade Material", "High-carbon stainless steel — rust and corrosion resistant"),
                ("Handle", "Ergonomic handle with non-slip grip"),
                ("Application", "Kitchen prep — cutting, slicing, peeling, herbs"),
                ("Dishwasher Safe", "No — hand wash recommended for blade longevity"),
            ]
            if blade_m: items.insert(1, ("Blade Length", blade_m.group(0)))
            if pieces: items.insert(0, ("Set Includes", f"{pieces} pieces"))
            sections.append(_sec("Product Details", items))
            sections.append(_sec("Safety", [
                ("Blade Guard", "Included where applicable"),
                ("Storage", "Store safely — away from children"),
            ]))

        elif any(w in n for w in ["utensil", "spatula", "ladle", "turner", "spoon", "fork", "tong"]):
            mat = "Bamboo" if "bamboo" in combined else ("Melamine" if "melamine" in n else ("Stainless steel" if "stainless" in combined else "Food-grade plastic"))
            items = [
                ("Material", mat),
                ("BPA Free", "Yes"),
                ("Food Safe", "Yes"),
                ("Heat Resistant", "Yes — suitable for cooking"),
            ]
            if pieces: items.insert(0, ("Set Includes", f"{pieces} pieces"))
            if "bamboo" in combined or "wood" in combined:
                items.append(("Dishwasher Safe", "No — hand wash and dry immediately"))
                items.append(("Hanging Hole", "Yes — for easy storage"))
            else:
                items.append(("Dishwasher Safe", "Yes"))
            sections.append(_sec("Product Details", items))

        elif any(w in n for w in ["colander", "strainer", "sieve"]):
            sections.append(_sec("Product Details", [
                ("Material", "Stainless steel or food-grade plastic"),
                ("Size", size or "As specified"),
                ("Base", "Stable feet for countertop draining"),
                ("Dishwasher Safe", "Yes"),
                ("Application", "Draining pasta, rinsing vegetables and fruit"),
            ]))

        elif any(w in n for w in ["container", "storage", "lunch box", "lunchbox", "airtight"]):
            items = [
                ("Material", "BPA-free food-grade plastic"),
                ("Capacity", capacity or "As specified"),
                ("Airtight Seal", "Yes — lock-clip lid"),
                ("Microwave Safe", "Yes — lid off only"),
                ("Dishwasher Safe", "Yes"),
                ("Stackable", "Yes"),
            ]
            if pieces: items.insert(0, ("Set Includes", f"{pieces} pieces"))
            sections.append(_sec("Product Details", items))

        elif any(w in n for w in ["board", "cutting board", "chopping"]):
            sections.append(_sec("Product Details", [
                ("Material", "Food-grade plastic or bamboo"),
                ("Size", size or "As specified"),
                ("Non-Slip Base", "Yes — rubber feet"),
                ("Dishwasher Safe", "Check label — bamboo boards hand wash only"),
                ("Application", "Vegetable, meat and bread prep"),
            ]))

        elif any(w in n for w in ["tray", "plate", "bowl", "dish", "platter"]) and "serving" in n:
            sections.append(_sec("Product Details", [
                ("Material", "Food-safe polypropylene or melamine"),
                ("Size", size or "As specified"),
                ("BPA Free", "Yes"),
                ("Dishwasher Safe", "Check label"),
                ("Application", "Serving, catering, display"),
            ]))

        elif any(w in n for w in ["pot", "pan", "wok", "cookware"]):
            sections.append(_sec("Product Details", [
                ("Material", "Aluminium or stainless steel with non-stick coating"),
                ("Coating", "PFOA-free non-stick"),
                ("Induction Compatible", "Yes — check listing"),
                ("Handle", "Heat-resistant ergonomic handle"),
                ("Dishwasher Safe", "Hand wash recommended"),
            ]))

        elif any(w in n for w in ["can opener", "opener", "peeler", "grater", "slicer", "mandoline"]):
            sections.append(_sec("Product Details", [
                ("Material", "Stainless steel with ABS plastic handle"),
                ("Blade", "Sharp hardened stainless steel"),
                ("Grip", "Non-slip handle"),
                ("Application", "Kitchen prep tool"),
            ]))

        elif any(w in n for w in ["basket", "rack", "drain"]) and ("air fryer" in combined or "oven" in combined):
            sections.append(_sec("Product Details", [
                ("Material", "Food-grade stainless steel or carbon steel"),
                ("Non-Stick Coating", "Yes — PFOA-free"),
                ("Dishwasher Safe", "Yes"),
                ("Application", "Air fryer, oven, grill baking"),
                ("Heat Resistance", "Up to 230°C"),
            ]))

        else:
            items = [("Material", "Food-safe — BPA-free construction"), ("Application", "Kitchen and dining")]
            if size: items.insert(0, ("Size", size))
            if pieces: items.insert(0, ("Pieces", pieces))
            if capacity: items.insert(1, ("Capacity", capacity))
            sections.append(_sec("Product Details", items))
            sections.append(_sec("Care Instructions", [
                ("Cleaning", "Hand wash with mild detergent"),
                ("Food Safe", "Yes — all materials meet food contact standards"),
            ]))

        sections.append(GENERAL)

    # ── HOUSEHOLD ─────────────────────────────────────────────────────────────
    elif category == "Household":
        burn_m = re.search(r'(\d+(?:[-–]\d+)?)\s*hours?', d)
        nights_m = re.search(r'(\d+)\s*nights?', d)
        pack_m2 = re.search(r'(\d+)[\s-]*(?:pack|count|coils?)\b', n)
        weight_m = re.search(r'(\d+)\s*g\b', n)

        if "mosquito" in n and "electric" not in n and "coil" in n or ("coil" in n and "mosquito" in d):
            prod_items = [
                ("Type", "Spiral mosquito coil"),
                ("Active Ingredient", "d-Allethrin or Metofluthrin"),
                ("Smoke Level", "Low smoke formula"),
                ("Application", "Indoor and semi-outdoor — patios, garages, rooms"),
                ("Coverage", "Up to 20m²"),
            ]
            if burn_m: prod_items.insert(2, ("Burn Time", f"{burn_m.group(1)} hours per coil"))
            if pack_m2: prod_items.append(("Pack Size", f"{pack_m2.group(1)} coils"))
            sections.append(_sec("Product Details", prod_items))
            sections.append(_sec("Safety", [
                ("Usage", "Place on supplied metal stand on non-flammable surface"),
                ("Ventilation", "Ensure adequate ventilation — do not use in fully sealed rooms"),
                ("Supervision", "Keep away from children, pets and flammable materials"),
            ]))

        elif "electric" in n and ("mosquito" in n or "repellent" in n) and "refill" not in n:
            prod_items = [
                ("Type", "Electric plug-in liquid mosquito repellent"),
                ("Voltage", "220V AC (standard SA wall socket)"),
                ("Active Ingredient", "Prallethrin 1.0%"),
                ("Fragrance", "Lemon"),
                ("Warm-Up Time", "Effective within 15 minutes"),
            ]
            if nights_m: prod_items.append(("Duration", f"{nights_m.group(1)} nights at 8 hrs/night"))
            sections.append(_sec("Product Details", prod_items))
            sections.append(_sec("Usage", [
                ("Installation", "Plug directly into standard 220V wall socket"),
                ("Best Height", "Floor-level or low — where mosquitoes fly"),
                ("Room Size", "Effective in rooms up to 30m²"),
            ]))

        elif "refill" in n and "mosquito" in n:
            prod_items = [
                ("Type", "Electric mosquito liquid refill bottle"),
                ("Active Ingredient", "Prallethrin 1.0%"),
                ("Volume", "30ml per bottle"),
                ("Fragrance", "Lemon"),
            ]
            if nights_m: prod_items.append(("Duration", f"{nights_m.group(1)} nights at 8 hrs/night"))
            sections.append(_sec("Product Details", prod_items))
            sections.append(_sec("Compatibility", [
                ("Compatible With", "Standard electric mosquito liquid heater units (220V)"),
                ("Included", "Refill bottle only — heater sold separately where applicable"),
            ]))

        elif "coil" in n and "tray" in n or "holder" in n and "coil" in combined:
            mat = "Metal" if "metal" in combined or "decorative" in combined else "Plastic"
            sections.append(_sec("Product Details", [
                ("Material", mat),
                ("Function", "Safely holds burning mosquito coils"),
                ("Ash Catch", "Yes — catches ash to prevent fire hazard"),
                ("Reusable", "Yes"),
            ]))

        elif "glue trap" in n or "glue board" in n or ("trap" in n and "glue" in d):
            sections.append(_sec("Product Details", [
                ("Type", "Adhesive glue board trap"),
                ("Toxin Free", "Yes — no pesticides, poison or chemicals"),
                ("Target Pests", "Mice, rats, cockroaches, insects"),
                ("Safe For", "Homes, kitchens, food prep areas — children and pet safe"),
                ("Ready To Use", "Yes — no baiting required"),
            ]))
            sections.append(_sec("Usage", [
                ("Placement", "Along walls, corners, under appliances and behind cabinets"),
                ("Fold Option", "Can be folded into a box shape to conceal catch"),
                ("Disposal", "Seal in a bag when full and discard"),
            ]))

        elif "fly" in n and ("trap" in n or "ribbon" in n or "board" in n or "catch" in n):
            pack_label = f"{pack_m2.group(1)}-Pack" if pack_m2 else "As specified"
            sections.append(_sec("Product Details", [
                ("Type", "Sticky fly catcher ribbon / board"),
                ("Toxin Free", "Yes — adhesive only, no chemicals"),
                ("Target Pests", "Houseflies, gnats, midges, flying insects"),
                ("Pack Size", pack_label),
                ("Ready To Use", "Yes — peel and hang"),
            ]))
            sections.append(_sec("Usage", [
                ("Placement", "Hang near windows, doors, lights, bins and food areas"),
                ("Disposal", "Seal in bag and discard when full"),
            ]))

        elif "toilet" in n or "cistern" in n:
            sections.append(_sec("Product Details", [
                ("Type", "Cistern drop-in toilet cleaner block"),
                ("Active Function", "Limescale prevention, deodorising, bacteria inhibition"),
                ("Duration", "4–6 weeks per block"),
                ("Scent", "Marine / Fresh"),
                ("Installation", "Drop directly into cistern — no tools, no mess"),
                ("Safe For", "All standard ceramic and porcelain cisterns"),
            ]))
            sections.append(_sec("Usage", [
                ("How It Works", "Releases cleaning agents with every flush"),
                ("Pack Size", f"{pack_m2.group(1)}-Pack" if pack_m2 else "As specified"),
            ]))

        elif "cockroach" in n or "ant" in n:
            active_m = re.search(r'(\d+(?:\.\d+)?%)', d)
            target = "Cockroaches — German, American and common species" if "cockroach" in n else "Ants — all common household species"
            weight_label = f"{weight_m.group(1)}g" if weight_m else "As specified"
            prod_items = [
                ("Type", "Bait powder insecticide"),
                ("Target Pest", target),
                ("Mode of Action", "Bait-and-carry — workers bring bait back to colony"),
                ("Effect Timeline", "Visible reduction: 24–48 hrs · Full colony: 3–14 days"),
                ("Net Weight", weight_label),
            ]
            if active_m: prod_items.insert(2, ("Active Ingredient", active_m.group(1)))
            sections.append(_sec("Product Details", prod_items))
            sections.append(_sec("Application", [
                ("Placement", "Small amounts in cracks, behind appliances, under sinks"),
                ("Do Not Spray", "Avoid insect spray in treated area — disrupts bait trail"),
                ("Safety", "Keep children and pets away during application — safe once dry"),
            ]))

        elif "camphor" in n or "moth" in n:
            weight_label = f"{weight_m.group(1)}g" if weight_m else "As specified"
            sections.append(_sec("Product Details", [
                ("Type", "Camphor repellent balls"),
                ("Active Ingredient", "Camphor"),
                ("Net Weight", weight_label),
                ("Function", "Repels moths, silverfish, mites and fabric pests"),
                ("Fragrance", "Camphor — fresh, clean scent"),
                ("Duration", "Effective for several weeks per application"),
            ]))
            sections.append(_sec("Usage", [
                ("Placement", "Wardrobes, drawers, storage boxes, linen closets"),
                ("Safe For", "Clothing, fabric, linens — do not place in direct contact"),
                ("Keep Away From", "Children and pets"),
            ]))

        elif "air freshener" in n or "deodor" in n or "fragrance" in n:
            sections.append(_sec("Product Details", [
                ("Type", "Air freshener / deodoriser"),
                ("Format", "Spray / gel / plug-in — as specified"),
                ("Duration", "Long-lasting fragrance"),
                ("Coverage", "Up to 30m²"),
            ]))

        elif "broom" in n or "mop" in n or "dustpan" in n or "brush" in n:
            sections.append(_sec("Product Details", [
                ("Material", "Polypropylene bristles with plastic or metal handle"),
                ("Handle Length", "As specified"),
                ("Application", "Indoor floor cleaning — tiles, vinyl, hardwood"),
            ]))

        else:
            sections.append(_sec("Product Details", [
                ("Application", "Household use"),
                ("Safe For", "Home environments"),
            ]))

        sections.append(_sec("General", [
            ("Country of Origin", "China"),
            ("Warranty", "12 Months"),
            ("Shipping", "Same-day Gauteng · 2-4 days nationwide"),
        ]))

    # ── ACCESSORIES ───────────────────────────────────────────────────────────
    elif category == "Accessories":
        dim = specs.get("dimensions", "")
        length = specs.get("length", "")
        w = _watts()
        ip = _ip()
        leds = _leds()
        pieces = _pieces()
        cap = _litres()

        if ("thermal" in n or "receipt" in n) and "paper" in n:
            size_label = dim if dim else ("80x80mm" if "80" in n else "57x40mm" if "57" in n else "Standard")
            sections.append(_sec("Technical Specs",[
                ("Roll Size", size_label),
                ("Print Technology","Thermal — no ink or ribbon required"),
                ("Coating","High-sensitivity thermal coating"),
                ("Paper Colour","Bright white"),
                ("BPA Free","Yes"),
            ]))
            sections.append(_sec("Compatibility",[
                ("Compatible With","Standard thermal POS printers and cash registers"),
                ("Common Printer Brands","Epson, Star, Bixolon, Citizen, and most 80mm models"),
            ]))
        elif "packaging tape" in n or ("clear" in n and "tape" in n and "packaging" in d):
            width = "4.5cm"
            length_label = length if length else ("50m" if "50m" in n else "100m" if "100m" in n else "200m" if "200m" in n else "300m" if "300m" in n else "Standard")
            sections.append(_sec("Technical Specs",[
                ("Length", length_label),
                ("Width", width),
                ("Material","BOPP film with acrylic adhesive"),
                ("Colour","Clear / transparent"),
                ("Temperature Resistance","Suitable for standard storage and transit conditions"),
            ]))
            sections.append(_sec("Application",[
                ("Suitable For","Cardboard boxes, cartons, courier packaging"),
                ("Dispenser Compatible","Yes — standard handheld and desktop tape guns"),
            ]))
        elif "masking tape" in n:
            length_label = length if length else "20m"
            sections.append(_sec("Technical Specs",[
                ("Length", length_label),
                ("Width", "4.5cm" if "4.5" in n else "2.4cm" if "2.4" in n else "Standard"),
                ("Material","Paper-backed with natural rubber adhesive"),
                ("Max Temperature","Up to ~80°C"),
                ("Removal","Clean — no adhesive residue on most surfaces"),
            ]))
            sections.append(_sec("Application",[
                ("Suitable For","Painting, labelling, bundling, surface protection"),
                ("Tears By Hand","Yes — no scissors required"),
            ]))
        elif "double-sided" in n or "mounting tape" in n:
            sections.append(_sec("Technical Specs",[
                ("Type","Double-sided foam mounting tape"),
                ("Core","Foam — compensates for surface irregularities"),
                ("Adhesive","Acrylic pressure-sensitive adhesive both sides"),
            ]))
            sections.append(_sec("Application",[
                ("Suitable Surfaces","Painted walls, tiles, glass, metal, plastic"),
                ("Suitable For","Hanging pictures, mirrors, frames, clocks"),
                ("Activation","Press firmly for 30 seconds after mounting"),
            ]))
        elif "nano" in n and "tape" in n:
            sections.append(_sec("Technical Specs",[
                ("Type","Nano-suction reusable mounting tape"),
                ("Adhesive","Nano-suction — no chemical adhesive"),
                ("Residue","None — leaves surfaces clean"),
                ("Reusable","Yes — rinse with water to restore grip"),
            ]))
            sections.append(_sec("Application",[
                ("Best Surfaces","Smooth non-porous: glass, tiles, metal, polished plastic"),
                ("Not Suitable For","Rough, textured, or porous surfaces"),
            ]))
        elif "electrical" in n and "tape" in n or "insulation" in n and "tape" in n:
            length_label = "20 yards" if "20" in n else "10 yards" if "10" in n else "5 yards" if "5" in n else "Standard"
            sections.append(_sec("Technical Specs",[
                ("Length", length_label),
                ("Material","PVC (polyvinyl chloride)"),
                ("Colour","Black"),
                ("Flame Retardant","Yes — chars rather than burning"),
                ("Moisture Resistant","Yes"),
            ]))
            sections.append(_sec("Application",[
                ("Rated For","Low-voltage indoor wiring insulation"),
                ("Suitable For","Wire joins, cable bundling, circuit colour coding"),
                ("Conforms To","Irregular surfaces and wire joins"),
            ]))
        elif "flashing" in n or ("waterproof" in n and "tape" in n):
            sections.append(_sec("Technical Specs",[
                ("Type","Self-adhesive bitumen flashing tape"),
                ("Width","5cm"),
                ("Length","5m" if "5m" in n else "10m" if "10m" in n else "As specified"),
                ("UV Resistant","Yes"),
                ("Service Life","15+ years outdoor"),
            ]))
            sections.append(_sec("Application",[
                ("Suitable For","Roofing joints, gutters, pipe penetrations, skylights"),
                ("Substrate","Metal, concrete, timber, most roofing membranes"),
                ("Surface Prep","Clean and dry surface required for best adhesion"),
            ]))
        elif "dispenser" in n:
            sections.append(_sec("Product Details",[
                ("Type","Tape dispenser"),
                ("Compatible Tape Width","4.8cm" if "4.8" in n else "Standard 1-inch core"),
                ("Cutter","Serrated blade for clean cuts"),
            ]))
        elif "razor" in n or "shav" in n or "blade" in n:
            blade_m = re.search(r'(\d+)[\s-]*blade', n)
            blade_count = blade_m.group(1) if blade_m else "2"
            pack_m3 = re.search(r'(\d+)[\s-]*pack', n)
            pack_label = f"Pack of {pack_m3.group(1)}" if pack_m3 else "As specified"
            sections.append(_sec("Product Details",[
                ("Brand","Pearl Max"),
                ("Blade Count",f"{blade_count} blades"),
                ("Blade Material","Stainless steel — rust resistant"),
                ("Lubricating Strip","Yes — reduces friction and irritation"),
                ("Pack Size", pack_label),
            ]))
        elif "shoe polish" in n:
            weight_m2 = re.search(r'(\d+)\s*g\b', n)
            colour = "Black" if "black" in n else "Neutral" if "neutral" in n else "As specified"
            sections.append(_sec("Product Details",[
                ("Brand","LUDE"),
                ("Colour", colour),
                ("Net Weight", f"{weight_m2.group(1)}g" if weight_m2 else "As specified"),
                ("Function","Colour restoration, conditioning, high-gloss shine"),
                ("Leather Safe","Yes"),
            ]))
        elif "price" in n and ("gun" in n or "label" in n):
            sections.append(_sec("Product Details",[
                ("System","5500-series labelling system"),
                ("Function","Single-line price labelling"),
                ("Operation","One-action print and apply"),
                ("Label Compatibility","5500-series replacement label rolls"),
            ]))
        elif "soap" in n:
            sections.append(_sec("Product Details", [
                ("Material", "Plastic"),
                ("Function", "Keep soap dry between uses — drainage slots prevent slipping"),
                ("Suitable For", "Bathroom basin, kitchen sink, shower"),
            ]))

        elif "shower cap" in n:
            sections.append(_sec("Product Details", [
                ("Material", "Waterproof PE / PEVA"),
                ("Closure", "Elastic edge band — fits all head sizes"),
                ("Design", "Wide fit for natural, curly, and loc hair"),
                ("Reusable", "Yes"),
            ]))

        # ── LED / Lighting ────────────────────────────────────────────────────
        elif any(w2 in n for w2 in ["floodlight", "flood light", "flood"]) and "led" in combined:
            col_temp = "Cool white (6000K)" if "white" in n and "warm" not in n else (
                       "Warm white (3000K)" if "warm" in n else "Cool white / Warm white")
            items = [
                ("Power", w or "As specified"),
                ("Colour Temperature", col_temp),
                ("IP Rating", ip or "IP66 — weatherproof"),
                ("Application", "Outdoor security, perimeter, garage, signage"),
                ("Beam Angle", "120°"),
                ("Lifespan", "30,000–50,000 hours"),
                ("Input Voltage", "85–265V AC"),
            ]
            if "red" in n and "blue" in n: items.append(("Special Mode", "Blue and red strobe flash mode"))
            sections.append(_sec("Technical Specs", items))
            sections.append(_sec("Installation", [
                ("Mounting", "Adjustable bracket — wall or ceiling"),
                ("Wiring", "Standard 3-wire connection — requires electrician for mains wiring"),
                ("Suitable For", "South African 220V AC mains"),
            ]))

        elif any(w2 in n for w2 in ["fairy light", "string light", "led light", "star light", "bulb string"]):
            length_label = _length_m() or "5m"
            leds_label = f"{leds} LEDs" if leds else "As specified"
            solar = "Solar panel" if "solar" in combined else "USB / battery powered"
            sections.append(_sec("Technical Specs", [
                ("Total Length", length_label),
                ("LED Count", leds_label),
                ("Power Source", solar),
                ("Colours", "Multi-colour" if "multi" in n else ("Warm white" if "warm" in n else "White")),
                ("Light Modes", "Multiple — steady, flash, chase, fade (where applicable)"),
                ("IP Rating", ip or "IP44 — suitable for outdoor use"),
            ]))
            sections.append(_sec("Application", [
                ("Suitable For", "Bedroom décor, party, garden, balcony, festival"),
                ("Indoor / Outdoor", "Yes — check IP rating"),
            ]))

        elif any(w2 in n for w2 in ["mosquito trap", "fly trap", "bug zapper"]) and "led" in combined:
            sections.append(_sec("Technical Specs", [
                ("Power", w or "8W"),
                ("Trap Method", "UV light attraction + suction fan or electric grid"),
                ("Coverage", "Up to 50m²"),
                ("Noise Level", "Ultra-quiet — silent operation"),
                ("Safe For", "Humans and pets — no chemicals or insecticides"),
            ]))
            sections.append(_sec("Usage", [
                ("Placement", "Hang or place 1–2m above floor, away from competing light"),
                ("Best Time", "Night — most effective when room lights are off"),
                ("Cleaning", "Empty collection tray weekly"),
            ]))

        # ── Personal Care / Grooming ─────────────────────────────────────────
        elif any(w2 in n for w2 in ["hair clipper", "clipper", "trimmer", "shaver", "groomer"]):
            cordless = "Yes — USB rechargeable" if any(w2 in combined for w2 in ["usb", "rechargeable", "cordless"]) else "Corded"
            sections.append(_sec("Product Details", [
                ("Type", "Electric hair clipper / trimmer"),
                ("Power", "Cordless — USB rechargeable" if "rechargeable" in combined else "Corded 220V"),
                ("Blade", "Self-sharpening stainless steel"),
                ("Guide Combs", "Multiple length settings included"),
                ("Motor", "High-speed precision motor"),
                ("Application", "Haircuts, beard trimming, body grooming"),
            ]))
            sections.append(_sec("In The Box", [
                ("Included", "Clipper, guide combs, cleaning brush, oil, charging cable (where applicable)"),
            ]))

        elif "lint remover" in n or "lint roller" in n or "fabric shaver" in n:
            sections.append(_sec("Product Details", [
                ("Type", "Electric lint / fabric shaver"),
                ("Power Source", "USB rechargeable" if "usb" in combined or "rechargeable" in combined else "Battery powered"),
                ("Blades", f"{_pieces() or '6'}-blade cutting system"),
                ("Guard", "Floating head with lint collection chamber"),
                ("Suitable For", "Wool, cashmere, fleece, cotton knitwear, upholstery"),
            ]))

        # ── Bags & Accessories ────────────────────────────────────────────────
        elif any(w2 in n for w2 in ["backpack", "rucksack", "travel bag", "hiking bag", "tactical bag"]):
            litre_m = re.search(r'(\d+)\s*l\b', n)
            litres = f"{litre_m.group(1)}L" if litre_m else ("80L" if "80l" in n else "As specified")
            sections.append(_sec("Product Details", [
                ("Capacity", litres),
                ("Material", "600D Oxford polyester or ripstop nylon"),
                ("Waterproof", "Yes — water-resistant shell"),
                ("Laptop Compartment", "Yes — padded sleeve" if "laptop" in combined else "No"),
                ("Shoulder Straps", "Padded and adjustable"),
                ("Compression Straps", "Yes — pack stabilisation"),
            ]))
            sections.append(_sec("Compartments", [
                ("Main Compartment", "Large — clothes, sleeping bag, gear"),
                ("Front Pockets", "2–3 zippered organisers"),
                ("Side Pockets", "Water bottle pockets"),
            ]))

        # ── Electronics / Tech ───────────────────────────────────────────────
        elif "laptop" in n and ("stand" in n or "bracket" in n or "holder" in n or "mount" in n or "pad" in n):
            if "cooling" in n or "pad" in n:
                fan_m = re.search(r'(\d+)[\s-]*(?:fan|blade)', n)
                sections.append(_sec("Product Details", [
                    ("Type", "Laptop cooling pad"),
                    ("Fans", f"{fan_m.group(1)} built-in fans" if fan_m else "Built-in fans"),
                    ("Power Source", "USB bus-powered — no external adapter"),
                    ("Compatibility", "Laptops 10\"–17\""),
                    ("Noise Level", "Low-noise operation"),
                    ("Adjustable Height", "Yes — multi-angle stand"),
                ]))
            else:
                sections.append(_sec("Product Details", [
                    ("Type", "Laptop stand / bracket"),
                    ("Material", "Aluminium alloy or ABS plastic"),
                    ("Adjustable", "Yes — height and angle"),
                    ("Foldable", "Yes — portable"),
                    ("Compatibility", "Laptops and tablets 10\"–17\""),
                    ("Non-Slip", "Yes — rubber feet and grips"),
                ]))

        elif any(w2 in n for w2 in ["fan", "cooling fan"]) and "laptop" not in n:
            sections.append(_sec("Product Details", [
                ("Power Source", "USB 5V" if "usb" in combined else ("Solar" if "solar" in combined else "220V AC")),
                ("Speed Settings", "3 speeds" if "3" in n else "Adjustable"),
                ("Oscillation", "Yes" if "360" in n or "oscillat" in combined else "No"),
                ("Noise Level", "Quiet operation"),
                ("Application", "Desktop, bedside, office, camping"),
            ]))

        elif "refrigerator" in n or "cooler" in n and ("warmer" in n or "cooling" in n or "mini" in n):
            sections.append(_sec("Technical Specs", [
                ("Capacity", cap or "7.5L"),
                ("Function", "Cooling and warming"),
                ("Cooling", "Can cool 15–20°C below ambient temperature"),
                ("Warming", "Up to 65°C"),
                ("Power", "DC 12V (car) / AC 220V (mains adapter)"),
                ("Suitable For", "Car, camping, office, dorm room"),
            ]))

        elif "air fryer" in n and "paper" in n or "liner" in n and "air fryer" in combined:
            pieces_label = f"{pieces} sheets" if pieces else "Pack of 50"
            size_m2 = re.search(r'(\d+)\s*cm', n)
            sections.append(_sec("Product Details", [
                ("Pack Size", pieces_label),
                ("Size", f"{size_m2.group(1)}cm diameter" if size_m2 else "Fits most air fryers"),
                ("Material", "Food-safe parchment paper"),
                ("Non-Stick", "Yes — PFOA-free coating"),
                ("Perforated", "Yes — allows hot air circulation"),
                ("Heat Resistance", "Up to 230°C"),
                ("BPA Free", "Yes"),
            ]))

        elif "calculator" in n:
            digit_m = re.search(r'(\d+)\s*digit', n)
            func_m = re.search(r'(\d+)\s*function', n)
            sections.append(_sec("Product Details", [
                ("Display", f"{digit_m.group(1)}-digit LCD" if digit_m else "12-digit LCD"),
                ("Functions", f"{func_m.group(1)} functions" if func_m else "Standard and scientific functions"),
                ("Power Source", "Solar + battery backup"),
                ("Type", "Scientific" if "scientific" in combined else "Standard"),
            ]))

        elif any(w2 in n for w2 in ["speaker", "bluetooth speaker"]) and "car" not in n:
            sections.append(_sec("Technical Specs", [
                ("Connectivity", _bluetooth_ver() if "bluetooth" in combined else "Wired 3.5mm AUX"),
                ("Power Output", w or "As specified"),
                ("Battery", "Rechargeable — USB charging" if "rechargeable" in combined or "usb" in combined else "Mains powered"),
                ("Water Resistance", ip or ("IPX5" if "waterproof" in combined or "outdoor" in combined else "Indoor use")),
                ("Input", "Bluetooth / AUX / USB / Micro SD (as equipped)"),
            ]))

        elif "doorbell" in n and "smart" not in n and "wifi" not in combined:
            sections.append(_sec("Product Details", [
                ("Type", "Wired doorbell"),
                ("Chime", "Yes — indoor chime unit included"),
                ("Voltage", "220V AC"),
                ("Sound", "Selection of tones (as equipped)"),
                ("Application", "Residential main entrance or gate"),
            ]))

        elif any(w2 in n for w2 in ["sensory ball", "fidget", "stress ball"]):
            sections.append(_sec("Product Details", [
                ("Material", "Soft rubber — non-toxic"),
                ("Size", f"{_inch() or '85mm'} diameter"),
                ("Pack Size", f"{pieces} pieces" if pieces else "As specified"),
                ("Suitable For", "Sensory play, stress relief, motor skills, therapy"),
                ("Age", "3+ years"),
            ]))

        elif any(w2 in n for w2 in ["bamboo utensil", "cooking utensil", "utensil set"]):
            sections.append(_sec("Product Details", [
                ("Material", "Natural bamboo"),
                ("Set Includes", f"{pieces} pieces — spatula, ladle, turner (as specified)" if pieces else "Multiple pieces"),
                ("Heat Resistant", "Yes — safe for non-stick cookware"),
                ("BPA Free", "Yes — natural material"),
                ("Dishwasher Safe", "No — hand wash and dry immediately"),
                ("Hanging Hole", "Yes — easy storage"),
            ]))

        elif "faucet" in n or "sprayer" in n and ("tap" in combined or "faucet" in combined):
            sections.append(_sec("Product Details", [
                ("Type", "360° rotating faucet sprayer / aerator attachment"),
                ("Material", "ABS plastic with chrome finish"),
                ("Rotation", "360° swivel head"),
                ("Thread", "Standard tap thread — fits most kitchen and bathroom taps"),
                ("Flow Modes", "Stream / spray / mist (as equipped)"),
                ("Water Saving", "Yes — aerator reduces flow without pressure loss"),
            ]))

        elif "price gun" in n or ("price" in n and ("gun" in n or "label" in n)):
            sections.append(_sec("Product Details", [
                ("System", "MK-5500 labelling system"),
                ("Function", "Single-line price labelling"),
                ("Digits", "8-digit"),
                ("Operation", "One-hand trigger — print and apply in one action"),
                ("Label Rolls", "MK-5500 compatible replacement rolls"),
            ]))

        else:
            items = [("Application", "Home and office use"), ("Material", "Quality construction")]
            if w: items.insert(0, ("Power", w))
            if ip: items.append(("IP Rating", ip))
            sections.append(_sec("Product Details", items))

        sections.append(GENERAL)

    # ── CCTV / SECURITY ───────────────────────────────────────────────────────
    elif category == "CCTV":
        res = _resolution()
        ip = _ip()
        w = _watts()

        if any(w2 in n for w2 in ["dash cam", "dash camera", "dashcam", "car camera", "car dash"]):
            fov_m = re.search(r'(\d+)°', n)
            sections.append(_sec("Technical Specs", [
                ("Video Resolution", res),
                ("Field of View", f"{fov_m.group(1)}°" if fov_m else "130°+ wide angle"),
                ("Night Vision", "Yes — LED night vision or IR"),
                ("Loop Recording", "Yes — automatically overwrites oldest footage"),
                ("Storage", "Micro SD card (not included) — up to 128GB"),
                ("G-Sensor", "Yes — auto-locks footage on impact"),
                ("Power", "12V car socket via included cable"),
            ]))
            sections.append(_sec("Channels", [
                ("Front Camera", "Yes"),
                ("Rear Camera", "Yes — where included (dual-channel model)"),
            ]))

        elif any(w2 in n for w2 in ["wifi camera", "ip camera", "smart camera", "security camera", "surveillance camera"]) or "camera" in n and ("wifi" in combined or "1080" in combined):
            sections.append(_sec("Technical Specs", [
                ("Resolution", res),
                ("Night Vision", "Yes — full colour night vision or IR"),
                ("IR Distance", "Up to 20m"),
                ("IP Rating", ip or "IP66 — outdoor weatherproof"),
                ("Connectivity", "WiFi 2.4GHz" if "wifi" in combined else "Wired (BNC/PoE)"),
                ("Motion Detection", "Yes — push notification alerts"),
                ("Storage", "Cloud and/or Micro SD (as equipped)"),
                ("App", "V380 Pro / iCSee or equivalent"),
            ]))
            sections.append(_sec("Compatibility", [
                ("Remote View", "Yes — smartphone app (Android and iOS)"),
                ("Two-Way Audio", "Yes — built-in mic and speaker (where equipped)"),
            ]))

        elif "doorbell" in n or "smart doorbell" in n:
            sections.append(_sec("Technical Specs", [
                ("Resolution", res),
                ("WiFi", "2.4GHz WiFi"),
                ("Night Vision", "Yes"),
                ("Motion Detection", "Yes — push alert to phone"),
                ("Two-Way Audio", "Yes — speak to visitors via app"),
                ("App", "V380 Pro or equivalent"),
                ("Power", "Wired 12–24V AC or rechargeable battery (as specified)"),
            ]))

        elif "alarm" in n and any(w2 in n for w2 in ["gsm", "wireless", "kit", "system"]):
            sections.append(_sec("Technical Specs", [
                ("Type", "Wireless GSM home alarm system"),
                ("Communication", "GSM SIM card + optional landline"),
                ("Detection", "PIR motion sensor + door/window sensors"),
                ("Siren", "120dB built-in alarm"),
                ("Remote Control", "Yes — keyfob remotes included"),
                ("Backup", "Built-in rechargeable battery"),
            ]))
            sections.append(_sec("In The Box", [
                ("Included", "Control panel, motion sensor, door sensors, remote controls, power adapter"),
            ]))

        elif "solar" in n and "alarm" in n:
            sections.append(_sec("Technical Specs", [
                ("Power", "Solar rechargeable — no wiring required"),
                ("Detection", "PIR motion sensor"),
                ("Alarm", "120dB siren"),
                ("IP Rating", ip or "IP67 — fully weatherproof"),
                ("Range", "Detection range up to 8m"),
                ("Remote", "Yes — wireless remote control"),
            ]))

        elif "dummy" in n or "fake" in n and "camera" in n:
            sections.append(_sec("Product Details", [
                ("Type", "Dummy / decoy security camera"),
                ("LED", "Yes — blinking red LED for realism"),
                ("IP Rating", ip or "Weatherproof — suitable for outdoor use"),
                ("Mounting", "Wall bracket included"),
                ("Purpose", "Visible deterrent — no recording function"),
            ]))

        elif "metal detector" in n:
            sections.append(_sec("Technical Specs", [
                ("Type", "Handheld security metal detector wand"),
                ("Power", "9V battery (included/not included — check listing)"),
                ("Alarm", "Audible beep and LED indicator"),
                ("Detection", "Ferrous and non-ferrous metals"),
                ("Application", "Security screening, events, access control"),
            ]))

        elif any(w2 in n for w2 in ["car speaker", "coaxial speaker", "door speaker", "loudspeaker"]):
            ohm_m = re.search(r'(\d+)\s*ohm', n, re.IGNORECASE)
            db_m = re.search(r'(\d+)\s*db', n, re.IGNORECASE)
            size_m = re.search(r'(\d+(?:\.\d+)?)[\s"]*(?:inch|")', n)
            sections.append(_sec("Technical Specs", [
                ("Speaker Size", f'{size_m.group(1)}"' if size_m else "As specified"),
                ("Power Handling", w or "As specified"),
                ("Impedance", f"{ohm_m.group(1)} Ohms" if ohm_m else "4 Ohms"),
                ("Sensitivity", f"{db_m.group(1)}dB" if db_m else "As specified"),
                ("Type", "Coaxial — full range"),
                ("Application", "Car door, dash or rear deck installation"),
            ]))
            sections.append(_sec("Compatibility", [
                ("Suitable For", "Cars, bakkies, SUVs, trucks — check cutout diameter"),
                ("Amplifier", "Works with head unit or external amplifier"),
            ]))

        elif "mobile" in n or "phone" in n and ("sim" in combined or "camera" in combined):
            sections.append(_sec("Technical Specs", [
                ("Type", "Feature / mini phone"),
                ("SIM Slots", "Dual SIM" if "dual sim" in combined else "Single SIM"),
                ("Cameras", "Triple camera" if "triple" in combined else ("Dual camera" if "dual" in combined else "Single camera")),
                ("Display", "Small form factor"),
                ("Battery", "Rechargeable"),
                ("Network", "2G GSM"),
            ]))

        else:
            sections.append(_sec("Technical Specs", [
                ("Type", "Security / surveillance device"),
                ("Application", "Home and business security"),
            ]))
        sections.append(GENERAL)

    # ── SOLAR ─────────────────────────────────────────────────────────────────
    elif category == "Solar":
        w = _watts()
        ip = _ip()
        leds = _leds()
        bt = _bluetooth_ver()

        if any(w2 in n for w2 in ["garden light", "wall light", "pathway light", "outdoor light", "sensor light", "lantern"]) or ("solar" in n and "light" in n):
            motion = "Yes — PIR motion sensor" if "motion" in combined or "pir" in combined or "sensor" in combined else "No"
            set_m = re.search(r'set of (\d+)', n, re.IGNORECASE)
            items = [
                ("Power Source", "Solar — no wiring required"),
                ("LED Count", f"{leds} LEDs" if leds else "As specified"),
                ("Motion Sensor", motion),
                ("IP Rating", ip or "IP65 — waterproof"),
                ("Charging", "Solar panel — charges during day, lights at night"),
                ("Light Modes", "Motion activated / constant on / off (as equipped)"),
            ]
            if set_m: items.insert(0, ("Pack Size", f"Set of {set_m.group(1)}"))
            sections.append(_sec("Technical Specs", items))
            sections.append(_sec("Installation", [
                ("Mounting", "Wall bracket included — no electrician required"),
                ("Suitable For", "Driveways, gardens, pathways, security perimeter"),
            ]))

        elif "solar flood" in n or ("flood" in n and "solar" in combined):
            remote = "Yes" if "remote" in combined else "No"
            sections.append(_sec("Technical Specs", [
                ("Panel Power", w or "As specified"),
                ("IP Rating", ip or "IP67 — fully waterproof"),
                ("Light Output", "High lumen output"),
                ("Remote Control", remote),
                ("Time Switch", "Yes — programmable on/off timer" if "time switch" in combined else "No"),
                ("Light Sensor", "Yes — auto on at dusk" if "light control" in combined else "No"),
                ("Battery", "Built-in large capacity lithium battery"),
            ]))

        elif "solar speaker" in n or ("solar" in n and "speaker" in n):
            sections.append(_sec("Technical Specs", [
                ("Power Source", "Solar + rechargeable battery"),
                ("Bluetooth", bt),
                ("Output", w or "As specified"),
                ("Extra Function", "Built-in LED light / torch where applicable"),
            ]))

        elif "solar fan" in n or ("solar" in n and "fan" in n):
            sections.append(_sec("Technical Specs", [
                ("Power Source", "Solar panel + battery"),
                ("Modes", "Solar direct / battery"),
                ("Built-in LED", "Yes" if "led" in combined else "No"),
                ("Application", "Camping, outdoor, load shedding use"),
            ]))

        elif "solar charger" in n or ("solar" in n and "charger" in n) or ("solar" in n and "panel" in n):
            sections.append(_sec("Technical Specs", [
                ("Panel Power", w or "As specified"),
                ("Output", "USB 5V"),
                ("Charging", "Charges USB devices via sunlight"),
                ("Portability", "Foldable / lightweight — camping and hiking"),
            ]))

        elif "solar calculator" in n or "calculator" in n:
            digit_m = re.search(r'(\d+)\s*digit', n)
            func_m = re.search(r'(\d+)\s*function', n)
            sections.append(_sec("Product Details", [
                ("Display", f"{digit_m.group(1)}-digit LCD" if digit_m else "12-digit LCD"),
                ("Functions", f"{func_m.group(1)} functions" if func_m else "Standard and scientific"),
                ("Power Source", "Solar + battery backup"),
                ("Type", "Scientific" if "scientific" in combined else "Standard"),
            ]))

        elif "megaphone" in n or "speaker" in n and "handheld" in combined:
            sections.append(_sec("Technical Specs", [
                ("Power Source", "Solar rechargeable + battery"),
                ("Output", w or "As specified"),
                ("Range", "Up to 300m"),
                ("Functions", "Speak, record, playback, siren (as equipped)"),
            ]))

        else:
            items = [("Power Source", "Solar"), ("Application", "Outdoor / solar-powered use")]
            if w: items.insert(0, ("Solar Power", w))
            if ip: items.append(("IP Rating", ip))
            sections.append(_sec("Technical Specs", items))
        sections.append(GENERAL)

    # ── ROUTERS / CONNECTIVITY ────────────────────────────────────────────────
    elif category == "Routers":
        if any(w2 in n for w2 in ["usb hub", "usb-c hub", "usb adapter"]):
            port_m = re.search(r'(\d+)[\s-]*port', n)
            usb_ver = "USB 3.0" if "3.0" in n else ("USB-C" if "usb-c" in n else "USB 2.0")
            sections.append(_sec("Technical Specs", [
                ("Ports", f"{port_m.group(1)}× {usb_ver}" if port_m else f"Multi-port {usb_ver}"),
                ("Interface", usb_ver),
                ("Transfer Speed", "5Gbps" if "3.0" in n else "480Mbps"),
                ("Power", "Bus-powered — no external adapter"),
                ("Compatibility", "Windows, macOS, Linux"),
                ("Material", "Aluminium alloy — slim design"),
            ]))

        elif "hdmi splitter" in n or ("hdmi" in n and "splitter" in n):
            port_m = re.search(r'1[\s]*x[\s]*(\d+)', n, re.IGNORECASE)
            out_ports = port_m.group(1) if port_m else "4"
            res = _resolution()
            sections.append(_sec("Technical Specs", [
                ("Type", "HDMI splitter — 1 input, multiple outputs"),
                ("Outputs", f"{out_ports}×"),
                ("Max Resolution", res),
                ("HDMI Version", "1.4" if "1.4" in n else ("2.0" if "2.0" in n else "1.4")),
                ("3D Support", "Yes" if "3d" in combined else "No"),
                ("Audio", "Passes through HDMI audio — no quality loss"),
                ("Power", "DC power adapter included"),
            ]))
            sections.append(_sec("Usage", [
                ("Use Case", "Mirror one source to multiple displays — presentations, classrooms, multi-room"),
                ("Note", "All outputs show same image — not an HDMI matrix/switcher"),
            ]))

        elif "hdmi" in n and "switch" in n or "switcher" in n and "hdmi" in combined:
            port_m = re.search(r'(\d+)[\s]*(?:in|input|x)', n, re.IGNORECASE)
            sections.append(_sec("Technical Specs", [
                ("Type", "HDMI switcher — multiple inputs, one output"),
                ("Inputs", f"{port_m.group(1)}×" if port_m else "3×"),
                ("Output", "1× HDMI"),
                ("Max Resolution", _resolution()),
                ("Switching", "Manual button or included remote"),
                ("HDMI Version", "2.0" if "2.0" in n else "1.4"),
                ("HDCP", "Compatible"),
            ]))
            sections.append(_sec("Use Case", [
                ("Suitable For", "Switch between consoles, streaming boxes, laptops on one TV"),
                ("No Lag", "Instant switching — zero signal processing delay"),
            ]))

        else:
            sections.append(_sec("Technical Specs", [
                ("Type", "Connectivity device"),
                ("Application", "Audio/video or USB expansion"),
            ]))
        sections.append(GENERAL)

    # ── TOOLS ─────────────────────────────────────────────────────────────────
    elif category == "Tools":
        if "epoxy" in n or ("ab" in n and "glue" in n):
            sections.append(_sec("Technical Specs",[
                ("Type","Two-component epoxy adhesive"),
                ("Working Time","~5 minutes after mixing"),
                ("Handling Strength","~30 minutes"),
                ("Full Cure","24 hours"),
                ("Bond Type","Rigid, load-bearing, waterproof"),
            ]))
            sections.append(_sec("Bonds Well To",[
                ("Suitable Substrates","Metal, wood, ceramic, glass, stone, concrete, most rigid plastics"),
                ("Not Suitable For","Polyethylene, polypropylene, silicone, PTFE"),
                ("Dispensing","Twin-syringe — equal quantities dispensed automatically"),
            ]))
        elif "contact cement" in n or "contact adhesive" in n:
            sections.append(_sec("Technical Specs",[
                ("Type","Contact cement (contact adhesive)"),
                ("Bond Mechanism","Apply to both surfaces, allow to dry, press together"),
                ("Bond Type","Instant permanent bond on contact"),
                ("Flexible When Cured","Yes"),
            ]))
            sections.append(_sec("Bonds Well To",[
                ("Suitable Materials","Rubber, leather, foam, fabric laminates, Formica, neoprene"),
                ("Application","Brush or roller — thin, even coat both surfaces"),
            ]))
        elif "super glue" in n or "cyanoacrylate" in n:
            pack_m4 = re.search(r'(\d+)[\s-]*(?:pack|tube|count)', n)
            sections.append(_sec("Technical Specs",[
                ("Type","Cyanoacrylate instant adhesive"),
                ("Set Time","Seconds on contact"),
                ("Bond Type","Rigid"),
                ("Pack Size", f"{pack_m4.group(1)} tubes" if pack_m4 else "As specified"),
            ]))
            sections.append(_sec("Bonds Well To",[
                ("Suitable Materials","Ceramics, glass, metal, rubber, most hard plastics, leather"),
                ("Best On","Close-fitting, smooth surfaces"),
                ("Not Suitable For","Polyethylene, polypropylene, silicone"),
            ]))
        elif "hot glue" in n or "glue stick" in n:
            size = "7mm (mini glue gun)" if "7mm" in n else "11mm (full-size glue gun)"
            sections.append(_sec("Technical Specs",[
                ("Stick Diameter", size),
                ("Set Time","30–60 seconds"),
                ("Bond Type","Flexible when cured"),
                ("Melt Temperature","~170–200°C"),
            ]))
            sections.append(_sec("Suitable For",[
                ("Materials","Fabric, foam, wood, cardboard, light plastics, floral"),
                ("Applications","Crafts, DIY, display making, light repairs"),
            ]))
        elif "electrical" in n and "tape" in n or "insulation" in n:
            length_label = "20 yards" if "20" in n else "10 yards" if "10" in n else "5 yards" if "5" in n else "As specified"
            sections.append(_sec("Technical Specs", [
                ("Length", length_label),
                ("Width", "19mm standard"),
                ("Material", "PVC — flame retardant and moisture resistant"),
                ("Colour", "Black"),
                ("Voltage Rating", "600V max (indoor low-voltage applications)"),
            ]))
            sections.append(_sec("Application", [
                ("Suitable For", "Wire insulation, joins, colour coding, cable bundling"),
            ]))
        elif "flashing" in n or ("waterproof" in n and "tape" in n):
            length_label = "10m" if "10m" in n else "5m" if "5m" in n else "As specified"
            sections.append(_sec("Technical Specs", [
                ("Type", "Self-adhesive bitumen flashing tape"),
                ("Width", "5cm"),
                ("Length", length_label),
                ("UV Resistant", "Yes — UV-stabilised coating"),
                ("Service Life", "15+ years outdoor"),
            ]))
            sections.append(_sec("Application", [
                ("Suitable For", "Roofing joints, gutters, pipe penetrations, skylights"),
                ("Surface Prep", "Clean and dry surface required for best adhesion"),
            ]))
        elif "sandpaper" in n or "sand paper" in n:
            grit = _grit()
            sections.append(_sec("Technical Specs", [
                ("Grit", grit or "As specified"),
                ("Abrasive", "Aluminium oxide — durable and fast cutting"),
                ("Backing", "C-weight paper"),
                ("Application", "Wood, metal, primer, filler, automotive bodywork"),
            ]))
            sections.append(_sec("Grit Guide", [
                ("#60 Coarse", "Heavy material removal, rough shaping"),
                ("#80–#120 Medium", "General sanding, smoothing"),
                ("#180–#240 Fine", "Finish sanding before paint or varnish"),
            ]))
        elif "cutting blade" in n or ("blade" in n and any(w2 in combined for w2 in ["grinder", "disc", "mm", "inch"])):
            size_m = re.search(r'(\d+(?:\.\d+)?)\s*(?:inch|mm)', n)
            sections.append(_sec("Technical Specs", [
                ("Diameter", size_m.group(0) if size_m else "As specified"),
                ("Type", "Cutting disc / blade"),
                ("Application", "Metal, wood or masonry — check blade spec"),
                ("Safety", "Never exceed max RPM rated on blade"),
            ]))
        else:
            sections.append(_sec("Product Details", [
                ("Application", "DIY, home repair and professional use"),
                ("Material", "Quality construction for long-lasting performance"),
            ]))
        sections.append(_sec("General", [
            ("Warranty", "12 Months"),
            ("Shipping", "Same-day Gauteng · 2-4 days nationwide"),
        ]))

    else:
        sections.append(_sec("Product Details", [
            ("Application", "General use"),
            ("Quality", "Tested and verified"),
        ]))
        sections.append(GENERAL)

    return json.dumps(sections, ensure_ascii=False)


def process_row(row: dict) -> dict:
    raw_name    = row.get("name", "").strip()
    raw_cat     = row.get("category", "").strip()
    description = row.get("description", "").strip()
    retail      = row.get("retail_price", "").strip()
    bulk        = row.get("bulk_price", "").strip()
    qty         = row.get("bulk_min_qty", "").strip() or "6"

    name     = clean_name(raw_name)
    category = map_category(raw_cat)
    specs    = extract_specs(name, description)

    return {
        "name":              name,
        "slug":              make_slug(name),
        "category":          category,
        "seo_title":         make_seo_title(name),
        "short_description": short_desc(description),
        "full_description":  full_description(name, category, description, specs),
        "retail_price":      retail,
        "bulk_price":        bulk,
        "bulk_min_qty":      qty,
        "stock_status":      "in_stock",
        "active":            "true",
        "featured":          "false",
        "is_bulk_available": "true" if bulk else "false",
        "thumbnail_url":     "",
        "images":            "",
        "specifications":    generate_specifications(name, category, description, specs),
    }


def main():
    with open(INPUT_FILE, encoding="utf-8-sig", newline="") as f:
        products = list(csv.DictReader(f))

    print(f"Loaded {len(products)} products from {INPUT_FILE}")
    print(f"Writing to {OUTPUT_FILE}...\n")

    cat_counts: dict[str, int] = {}

    with open(OUTPUT_FILE, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=OUTPUT_COLUMNS, quoting=csv.QUOTE_ALL)
        writer.writeheader()

        for i, row in enumerate(products, 1):
            out = process_row(row)
            writer.writerow(out)
            cat_counts[out["category"]] = cat_counts.get(out["category"], 0) + 1
            if i % 50 == 0 or i == len(products):
                print(f"  {i}/{len(products)} products processed...")

    print(f"\n{'='*55}")
    print(f"COMPLETE — {len(products)} products written to:")
    print(f"  {OUTPUT_FILE}")
    print(f"\nCategories:")
    for cat, count in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"  {cat:<20} {count:>4} products")


if __name__ == "__main__":
    main()
