+++
title = "Saint's Relic Box"
date = 2026-05-22
template = "quests/page.html"

[extra]
slug = "saints-relic-box"
id = "99991423"
type = "Adventure"
city = "Venice"
guild_type = "Adventure"
discovery = "Becket Water"
reward = 0
advance = 0
difficulty = 6
skills = [{ name = "Search", level = 5 }, { name = "Theology", level = 7 }, { name = "English", level = 1 }]
variants = [{ city = "Venice", guild_type = "Adventure", id = "99991423", slug = "saints-relic-box" }]
steps = [{ step = 1, location = "London Archives", action = "Talk to Scholar" }, { step = 2, location = "London Church", action = "Talk to Bishop in the Church closest to the Palace" }, { step = 3, location = "London Church", action = "Use" }]
followups = [{ id = "99991231", name = "Secret Medicine of a Martyr", slug = "secret-medicine-of-a-martyr" }]
+++
