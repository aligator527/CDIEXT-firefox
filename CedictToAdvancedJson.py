import json
import re

def addToneMarks(pinyin):
    tone_marks = {
        "a": ["ā", "á", "ǎ", "à"],
        "e": ["ē", "é", "ě", "è"],
        "i": ["ī", "í", "ǐ", "ì"],
        "o": ["ō", "ó", "ǒ", "ò"],
        "u": ["ū", "ú", "ǔ", "ù"],
        "ü": ["ǖ", "ǘ", "ǚ", "ǜ"]
    }
    output = []
    for word in pinyin:
        if word:  # Check if word is not an empty string
            if word[-1].isdigit():
                tone = int(word[-1])
                if tone != 5:  # Add tone mark only if tone is not 5 (neutral tone)
                    for vowel in tone_marks.keys():
                        if vowel in word:
                            word = word.replace(vowel, tone_marks[vowel][tone-1])
                            word = word[:-1]  # Remove tone number
                else:
                    word = word[:-1]  # Remove tone number for neutral tone
                output.append(word)
            else:
                output.append(word)  # if no tone mark, add the word as is
    return ' '.join(output)

## TODO: Add parsing of tags and explanations (on 8th August 2023, I cannot understand how to parse text in parentheses
## TODO: before meaning as tags, and text in parentheses after meaning as explanation)
def parse_line(line):
    traditional, rest = line.split(' ', 1)
    simplified, rest = rest.split(' ', 1)
    reading, meaning = rest.split(' /', 1)
    # Remove trailing slash
    meaning = meaning.rstrip('/')
    # Remove square brackets from reading
    reading = reading.strip(' []')

    meanings = re.split(r' ?/ ?', meaning)

    parsed_meanings = []
    for m in meanings:
        m = m.strip()

        if re.findall(r'(\S*?)\[(.*?)\]', m):
            included_word, included_pinyin = re.findall(r'(\S*?)\[(.*?)\]', m)[0]
            m = re.sub(r'\s?\S*?\[.*?\]', '', m)

            if included_pinyin:
                included_pinyin = addToneMarks(included_pinyin.split(' '))
            if included_word and included_pinyin:
                m = m + ' ' + included_word + ' [' + included_pinyin + ']'

        parsed_meanings.append({'meaning': m.strip()})

    return traditional, simplified, reading, parsed_meanings

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
        'meanings': meanings,
    } for traditional, simplified, reading, meanings in parsed]

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=None) #Change indent to 4, if you want to read results. Change to 0 to minimize

dictionary_path = 'cedict_ts.u8'  # Update with your path to CC-CEDICT
output_path = 'cedict_advanced.json'  # Update with your desired output path
parsed = parse_dictionary(dictionary_path)
to_json(parsed, output_path)