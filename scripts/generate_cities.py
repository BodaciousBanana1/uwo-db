#!/usr/bin/env python3
"""Generate city markdown files from scraped port data"""
import json
from pathlib import Path

PORTS_JSON = Path("/home/sam/uwo-explore/scraped_data/ports_all.json")
OUTPUT_DIR = Path("/home/sam/uwo-explore/uwo-wiki/content/cities")

def slugify(name):
    return name.lower().replace(" ", "-").replace(".", "").replace("'", "")

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with open(PORTS_JSON) as f:
        ports = json.load(f)

    # Filter out ports with errors
    ports = [p for p in ports if 'error' not in p and 'name' in p]

    print(f"Generating {len(ports)} city pages...")

    for port in ports:
        slug = slugify(port['name'])
        filename = OUTPUT_DIR / f"{slug}.md"

        # Get trade goods for filtering and display
        trade_goods = port.get('trade_goods', [])
        trade_goods_names = [tg['name'] for tg in trade_goods]
        trade_goods_categories = list(set(tg['category'] for tg in trade_goods))

        # Build trade goods as inline TOML array of tables
        trade_goods_inline = []
        for tg in trade_goods:
            invest = tg.get('investment_required')
            invest_str = f'"{invest}"' if invest else 'false'
            trade_goods_inline.append(
                f'{{name = "{tg["name"]}", rating = {tg["rating"]}, category = "{tg["category"]}", price = {tg["price"]}, investment = {invest_str}}}'
            )
        trade_goods_full_str = "[" + ", ".join(trade_goods_inline) + "]" if trade_goods_inline else "[]"

        # Build frontmatter with full trade goods data
        content = f"""+++
title = "{port['name']}"
template = "cities/page.html"

[extra]
port_id = "{port['id']}"
region = "{port.get('region', 'Unknown')}"
culture_area = "{port.get('culture_area', 'Unknown')}"
language = "{port.get('language', 'Unknown')}"
trade_goods_count = {len(trade_goods)}
trade_goods = {json.dumps(trade_goods_names)}
trade_goods_categories = {json.dumps(trade_goods_categories)}
trade_goods_full = {trade_goods_full_str}
+++

{port.get('description', '')}
"""

        with open(filename, 'w') as f:
            f.write(content)

    # Create section _index.md
    index_content = """+++
title = "Cities"
sort_by = "title"
template = "cities/list.html"
+++
"""
    with open(OUTPUT_DIR / "_index.md", 'w') as f:
        f.write(index_content)

    print(f"Generated {len(ports)} city pages in {OUTPUT_DIR}")

    # Summary by region
    regions = {}
    for p in ports:
        r = p.get('region', 'Unknown')
        regions[r] = regions.get(r, 0) + 1

    print("\nCities by region:")
    for r, c in sorted(regions.items()):
        print(f"  {r}: {c}")

if __name__ == "__main__":
    main()
