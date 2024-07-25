import json

def parse_line(line):
    traditional, rest = line.split(' ', 1)
    simplified, rest = rest.split(' ', 1)
    reading, meaning = rest.split(' /', 1)
    # Remove trailing slash
    meaning = meaning.rstrip('/')
    # Remove square brackets from reading
    reading = reading.strip(' []')
    return traditional, simplified, reading, meaning

def parse_dictionary(dictionary_path):
    with open(dictionary_path, 'r', encoding='utf-8') as f:
        content = f.readlines()
    content = [line.rstrip('\n') for line in content if not line.startswith('#')]
    parsed = [parse_line(line) for line in content]
    return parsed

def to_json(parsed, output_path):
    data = [{
        'traditional': traditional,
        'simplified': simplified,
        'reading': reading,
        'meaning': meaning,
    } for traditional, simplified, reading, meaning in parsed]

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

dictionary_path = 'cedict_ts.u8'  # Update with your path to CC-CEDICT
output_path = 'cedict.json'  # Update with your desired output path
parsed = parse_dictionary(dictionary_path)
to_json(parsed, output_path)