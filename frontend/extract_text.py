import glob, re, json, os

files = glob.glob('src/pages/*.jsx')
result = {}
jsx_text = re.compile(r'>([^<>]*?)<')
for f in files:
    text = open(f, 'r', encoding='utf-8').read()
    keys = set(re.findall(r"t\(\s*['\"]([^'\"]+)['\"]", text))
    literals = set()
    for m in jsx_text.finditer(text):
        s = m.group(1).strip()
        if s and not s.isnumeric() and len(s) > 1:
            if re.search(r'\\{\s*[^}]+\s*}', s):
                continue
            if re.search(r'^[\s\w\d:\-\.,!\?]+$', s):
                literals.add(s)
    attrs = set(re.findall(r'placeholder\s*=\s*["\']([^"\']+)["\']', text)) | set(re.findall(r'title\s*=\s*["\']([^"\']+)["\']', text))
    attrs |= set(re.findall(r'label\s*=\s*["\']([^"\']+)["\']', text))
    attrs |= set(re.findall(r'buttonText\s*=\s*["\']([^"\']+)["\']', text))
    result[os.path.basename(f)] = {
        't_keys': sorted(keys),
        'literals': sorted(literals),
        'attrs': sorted(attrs)
    }

print(json.dumps(result, indent=2, ensure_ascii=False))
