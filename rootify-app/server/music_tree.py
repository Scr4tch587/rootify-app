import wikipediaapi
import wikipedia
from google.genai import Client
import re
import sys
import json

wiki = wikipediaapi.Wikipedia(
    language='en',
    user_agent='RootifyBot/0.1 (k318zhang@gmail.com)'
)

client = Client(api_key="AIzaSyBpfO0r0hW1nfZZBnq75x4h01NmAQf_yJc")

KEYWORDS = [
    "Influences",
    "Artistry",
    "Musical style",
    "Songwriting",
    "Themes",
    "Background",
    "Career",
    "Life",
]

MAX_INPUT_CHARS = 3000 

def get_section_titles(page):
    sections = []

    def recurse_sections(sections_list):
        for s in sections_list:
            sections.append(s.title)
            if s.sections:
                recurse_sections(s.sections)

    recurse_sections(page.sections)
    return sections

def extract_text(page):
    all_sections = get_section_titles(page)
    matched_sections = []
    matched_titles = set()

    for keyword in KEYWORDS:
        for section_title in all_sections:
            if keyword.lower() in section_title.lower() and section_title not in matched_titles:
                matched_sections.append(section_title)
                matched_titles.add(section_title)
    
    if not matched_sections:
        return page.text
    
    def find_section(sections, title):
        for s in sections:
            if s.title == title:
                return s
            found = find_section(s.sections, title)
            if found:
                return found
        return None
    
    extracted_text = ""
    for title in matched_sections:
        section = find_section(page.sections, title)
        if section:
            section_text = section.text + "\n\n"
            if len(extracted_text) + len(section_text) > MAX_INPUT_CHARS:
                # Append only the remaining allowed characters and stop
                remaining = MAX_INPUT_CHARS - len(extracted_text)
                extracted_text += section_text[:remaining]
                break
            else:
                extracted_text += section_text

    return extracted_text.strip()

def generate_influences_list(artist):
    page = wiki.page(wikipedia.search(artist + " (musician)")[0])
    if not page.exists(): return []
    text = extract_text(page)

    prompt = (
        "From the following text, extract all musicians, bands, or composers that influenced the artist. "
        "Respond with only a comma-separated list of up to 5 of the most important names and no explanations.\n\n"
        "If no influences or relevant information are found, return 'None'\n\n"
        f"{text}\n\nInfluences:"
    )

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt
    )
    
    raw_output = response.text.strip()
    if raw_output == 'None': return []
    influences = [name.strip() for name in re.split(r",|\n", raw_output) if name.strip()]
    return influences

def build_influence_list(artist, max_depth, max_breadth):
    tree = {}
    seen = {artist}

    # Root node respects max_breadth
    root_influences = generate_influences_list(artist)[:max_breadth]
    tree[artist] = root_influences
    seen.update(root_influences)

    # Queue contains (artist, depth)
    queue = [(a, 1) for a in root_influences]

    # BFS
    while queue:
        next_artist, depth = queue.pop(0)
        if depth > max_depth:
            if next_artist not in tree:
                tree[next_artist] = []
            continue

        # Non-root nodes limited to 5 children max
        influences = generate_influences_list(next_artist)[:5]

        filtered = []
        for influence in influences:
            if influence not in seen:
                filtered.append(influence)
                seen.add(influence)

        tree[next_artist] = filtered

        # Add children with depth + 1
        queue.extend((a, depth + 1) for a in filtered)

    return tree

def convert_to_d3(artist, tree):
    d3_tree = {"name": artist}
    children = []
    for node in tree[artist]:
        children.append(convert_to_d3(node, tree))
    d3_tree["children"] = children
    return d3_tree

# if __name__ == "__main__":
#     artist = sys.argv[1]
#     tree = build_influence_list(artist, 2, 25)
#     #d3_tree = convert_to_d3(artist, tree)

#     nodes = []
#     links = []

#     for key in tree:
#         artist_node = {"id": key}
#         influences_list = tree[key]
#         for influence in influences_list:
#             link = {"source": key, "target": influence}
#         nodes.append(artist_node)
#         links.append(link)

#     output = {
#         "nodes": nodes,
#         "links": links,
#         "artist": artist,
#     }
#     print(json.dumps(output), flush=True)


tree = build_influence_list("Tyler, The Creator", 2, 25)
nodes = []
links = []

print(tree)

for key in tree:
    artist_node = {"id": key}
    influences_list = tree[key]
    for influence in influences_list:
        link = {"source": key, "target": influence}
        links.append(link)
    nodes.append(artist_node)
output = {
    "nodes": nodes,
    "links": links,
    "artist": "Tyler, The Creator",
}

with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=4)