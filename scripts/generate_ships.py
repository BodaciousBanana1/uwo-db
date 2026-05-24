#!/usr/bin/env python3
"""Generate Zola markdown files for all ships from JSON database."""
import json
from pathlib import Path
from datetime import date

JSON_PATH = Path("/home/sam/uwo-explore/scraped_data/uwo_database.json")
OUTPUT_DIR = Path("/home/sam/uwo-explore/uwo-wiki/content/ships")

def slugify(name):
    """Convert name to URL slug."""
    return name.lower().replace(" ", "-").replace("'", "").replace('"', '')

def generate_ship_md(ship):
    """Generate markdown content for a ship."""
    stats = ship.get("stats", {})
    levels = ship.get("levels", {})
    cabin = ship.get("cabin", {})

    # Determine ship type from the data or default
    ship_type = ship.get("type") or "adventure"

    frontmatter = f'''+++
title = "{ship['name']}"
date = {date.today().isoformat()}
template = "ships/page.html"

[extra]
id = "{ship['id']}"
slug = "{ship['slug']}"
size = "{ship.get('size', 'Std')}"
ship_type = "{ship_type}"
level_adventure = {levels.get('adventure', 0)}
level_trade = {levels.get('trade', 0)}
level_battle = {levels.get('battle', 0)}
durability = {stats.get('durability', 0)}
vertical_sail = {stats.get('vertical_sail', 0)}
horizontal_sail = {stats.get('horizontal_sail', 0)}
row_power = {stats.get('row_power', 0)}
turn_speed = {stats.get('turn_speed', 0)}
wave_resistance = {stats.get('wave_resistance', 0)}
armor = {stats.get('armor', 0)}
hold = {stats.get('hold', 0)}
cannon_chambers = {stats.get('cannon_chambers', 0)}
cabin_min = {cabin.get('min', 0)}
cabin_max = {cabin.get('max', 0)}
masts = {ship.get('masts', 1)}
material = "{ship.get('material', 'Wood')}"
is_cash_ship = {str(ship.get('is_cash_ship', False)).lower()}
is_steam = {str(ship.get('is_steam', False)).lower()}
+++

'''
    return frontmatter

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with open(JSON_PATH) as f:
        data = json.load(f)

    ships = data.get("ships", {})
    print(f"Found {len(ships)} ships")

    for ship_id, ship in ships.items():
        slug = ship.get("slug") or slugify(ship["name"])
        filepath = OUTPUT_DIR / f"{slug}.md"

        content = generate_ship_md(ship)
        filepath.write_text(content)

    print(f"Generated {len(ships)} ship files in {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
