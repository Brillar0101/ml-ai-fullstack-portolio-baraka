// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "information-extraction-prompts",
  "title": "Clean JSON, wrong numbers: extracting data from real documents",
  "excerpt": "A strict extraction prompt returned perfect JSON with the wrong prices, while a loose one got the numbers right. What that trade reveals about structured output, OCR, and where extraction accuracy actually comes from.",
  "category": "AI",
  "chapter": "Prompt Engineering",
  "tags": [
    "Prompt engineering",
    "Extraction",
    "OCR",
    "Structured output"
  ],
  "seriesNum": 40,
  "publishAt": "2026-07-05T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "We asked a model to read a real invoice, and it taught us the opposite of the advice we expected. The strict, do-it-by-the-book prompt returned beautiful JSON with the prices all wrong. The loose, chatty prompt returned an unparseable paragraph with the prices all right. Same document, same model: **llama3.1:8b**, running locally through Ollama at temperature zero, so every result here reproduces exactly. This post is what that surprising flip taught us about **information extraction**, the job of pulling specific fields out of a document as clean data a program can use."
    },
    {
      "type": "p",
      "text": "Extraction is the job of turning a document into clean, structured data a program can use. You want the same shape every time: the invoice number as text, the total as a number, a list of line items you can loop over. What you do not want is a friendly paragraph. A model left to its own habits wants to explain itself and be helpful, and helpfulness is exactly what breaks the code waiting downstream, which expected a bare number and got a sentence instead. The whole craft of extraction is pinning the model to a strict shape and then checking that it obeyed."
    },
    {
      "type": "h2",
      "text": "The text is already broken before the model reads it"
    },
    {
      "type": "p",
      "text": "Here is the part most guides skip. A scanned or photographed document is not text, it is an image, and something has to turn those pixels into characters first."
    },
    {
      "type": "p",
      "text": "That step is **OCR**, optical character recognition, and it makes mistakes of its own before the model is ever involved. On our invoice, OCR read the numbers but tore them loose from the rows they belonged to. The item names came out in one block and the prices in another, with no reliable way to line them back up. No prompt can repair text that OCR has already scrambled, so the failure starts one step earlier than people expect."
    },
    {
      "type": "image",
      "src": "/blog-images/extraction/invoice-annotated.jpg",
      "alt": "A sample invoice with the header marked read correctly and the price table marked scrambled by OCR",
      "caption": "The real invoice we tested. Green is what the model read correctly. Red is the price table, where OCR scrambled the columns and the model guessed."
    },
    {
      "type": "p",
      "text": "To see why the model struggled, look at what it actually received. This is the OCR text of the item table, and the prices have floated away from the items they describe:"
    },
    {
      "type": "code",
      "lang": "text",
      "title": "OCR text the model received (excerpt)",
      "code": "ITEMS\nNo. Description Qty\n1. Liza Byrd Dress Sz L- Coral 2,00\n2. Bcbgeneration Black Sleeveless 1,00\n3. Tommy Bahama Women's V 2,00\n...\nNet price\n\n17,99\n\n2,99\n\n34,99"
    },
    {
      "type": "p",
      "text": "A person looking at the printed invoice has no trouble, because the eye follows each row across and pairs the dress with its price. The model never saw the printed invoice. It saw the block of text above, where a row's price can sit a dozen lines away from the row's description, separated from the other prices only by blank lines. Pairing them back up is guesswork, and the model guesses the way it always does under uncertainty, by producing something that looks plausible. That is the whole reason a clean-looking invoice can still produce a broken answer."
    },
    {
      "type": "h2",
      "text": "Two prompts, two different failures"
    },
    {
      "type": "p",
      "text": "We tried two prompts on that scrambled text. The first is the loose one everybody starts with: \"extract the important information from this invoice.\" It hands every decision to the model, and the model wrote back a friendly report. Here is the surprising part: in that chatty paragraph, it got all seven prices right and the totals right, pairing each price to the correct item, even though the text was a mess. It reasoned its way through. The catch is that the answer is prose, and no program can reliably pull structured data out of a paragraph:"
    },
    {
      "type": "image",
      "src": "/blog-images/extraction/weak-output.jpg",
      "alt": "The loose prompt output, a chatty English summary that lists the correct prices",
      "caption": "The loose prompt got all seven prices and the totals right, but as prose a program cannot parse."
    },
    {
      "type": "p",
      "text": "So we tightened it into a specification: name every field, return one JSON object and nothing else, write null instead of guessing, use only what the document shows. This is the advice you read everywhere, and it gave us exactly the clean, parseable shape we asked for. It also got the prices wrong. The same model that had just reasoned out every price in prose now returned 1234.56 for the first item and guessed the rest:"
    },
    {
      "type": "image",
      "src": "/blog-images/extraction/strong-output.jpg",
      "alt": "The strict prompt output, clean JSON with the wrong prices",
      "caption": "The strict prompt: clean, parseable JSON, and the prices are wrong. Structure is not accuracy."
    },
    {
      "type": "h2",
      "text": "Structure is not accuracy"
    },
    {
      "type": "p",
      "text": "That flip is the real lesson, and it runs against the usual advice. Forcing the model into a rigid shape did not make it more accurate, it made it less. Two things went wrong the moment we demanded strict JSON. First, we took away the room to reason."
    },
    {
      "type": "p",
      "text": "The loose prompt let the model think out loud and work the scrambled table into the right pairs; the strict prompt made it emit JSON immediately, with no space to reason, so on the hard rows it simply guessed. Second, a number leaked. We had written a formatting rule, \"convert a decimal comma to a dot, so 1.234,56 becomes 1234.56\", and the model lifted 1234.56 straight into the first item as if it were a real price. Under the strict format the whole price table came apart:"
    },
    {
      "type": "ul",
      "items": [
        "It copied a number out of the prompt: 1234.56, from our own formatting rule. Never put a concrete number anywhere in a prompt, even inside a rule, because the model can echo it into the output as data.",
        "It guessed the other prices, which came back as 1249, 1250, 2500 and similar, none of which are on the invoice.",
        "It left every line's net worth null, because it could not match a price to a row.",
        "It scrambled the totals: the real net total, 292.68, landed in the VAT slot, and the net total came back as 1799.00, a number that is nowhere on the page."
      ]
    },
    {
      "type": "p",
      "text": "So structured output buys you one thing and not the other. It guarantees a shape your code can read. It does not guarantee the values are right, and it can make them worse by taking away the reasoning the model needs on a hard input. A schema is a promise about the container, not about the contents."
    },
    {
      "type": "h2",
      "text": "Where the accuracy actually comes from"
    },
    {
      "type": "p",
      "text": "If the strict prompt broke on the scrambled table, then the thing to fix is the table, not the wording of the prompt. The scramble was an OCR artifact: the default settings read the columns apart. One flag fixed it, telling the OCR to keep each row on a single line:"
    },
    {
      "type": "code",
      "lang": "bash",
      "title": "layout-preserving OCR",
      "code": "tesseract invoice.png out --psm 6 -c preserve_interword_spaces=1"
    },
    {
      "type": "p",
      "text": "With the rows kept intact, we ran the exact same strict prompt again, unchanged, and this time the model returned every price correctly and the totals to the cent. Same model, same prompt, one change to the input:"
    },
    {
      "type": "code",
      "lang": "text",
      "title": "the strict prompt, before and after fixing the OCR",
      "code": "default OCR  ->  unit prices: 1234.56, 1249.00, 1250.00, 2500.00, ...     (wrong)\nlayout OCR   ->  unit prices: 17.99, 2.99, 34.99, 21.23, 8.80, 4.99, 25.00   (correct)\n             ->  totals: net 292.68, vat 29.27, gross 321.95                (correct)"
    },
    {
      "type": "p",
      "text": "The model was never bad at reading numbers, it was starved of a readable table. When you cannot fix the OCR at the source, the next best move is to stop cramming reasoning and structure into one step: let the model extract in prose first, where it reasons well, then convert that prose to JSON in a second, simpler call. Either way the accuracy came from giving the model something it could actually read, not from the wording of the prompt."
    },
    {
      "type": "h2",
      "text": "The prompt makes good output likely, validation makes it safe"
    },
    {
      "type": "p",
      "text": "Even the strong prompt let wrong prices through, because the model is still guessing under uncertainty. So the second half of a reliable extractor lives outside the prompt entirely. After the model answers, you check the result against what you already know: are the required fields present, are the numbers actually numbers, do the line items add up to the stated total. When a check fails you reject the answer and retry, flag it for a human, or fall back, rather than writing a wrong price into your database. A short check catches every failure we just saw:"
    },
    {
      "type": "lab",
      "height": 460,
      "title": "validate_invoice.py, run against both real outputs",
      "caption": "Every number here is from the two runs above. A type check passes the bad record, because invented prices are still perfectly good floats. Checking them against the document is what catches it.",
      "code": "# Every number below is from the two real runs described in\n# this post: llama3.1:8b at temperature 0, once on the\n# scrambled default OCR text and once on the\n# layout-preserving OCR text. Nothing here is made up.\n\n# The prices actually printed on the invoice, read off the\n# document itself.\nPRINTED_PRICES = [17.99, 2.99, 34.99, 21.23, 8.80, 4.99, 25.00]\n\nfrom_default_ocr = {\n    \"line_items\": [\n        {\"unit_price\": 1234.56, \"net_worth\": None},   # copied out of our own prompt\n        {\"unit_price\": 1249.00, \"net_worth\": None},\n        {\"unit_price\": 1250.00, \"net_worth\": None},\n        {\"unit_price\": 2500.00, \"net_worth\": None},\n    ],\n    \"summary\": {\"net_total\": 1799.00, \"vat\": 292.68, \"gross_total\": None},\n}\n\nfrom_layout_ocr = {\n    \"line_items\": [{\"unit_price\": p, \"net_worth\": None} for p in PRINTED_PRICES],\n    \"summary\": {\"net_total\": 292.68, \"vat\": 29.27, \"gross_total\": 321.95},\n}\n\ndef validate_invoice(data, printed_prices):\n    problems = []\n    for i, item in enumerate(data.get(\"line_items\", []), start=1):\n        price = item.get(\"unit_price\")\n        if not isinstance(price, (int, float)):\n            problems.append(\"item %d: unit_price is not a number\" % i)\n        elif not any(abs(price - p) < 0.005 for p in printed_prices):\n            problems.append(\"item %d: %.2f is not a price on this document\" % (i, price))\n\n    s = data.get(\"summary\") or {}\n    net, vat, gross = s.get(\"net_total\"), s.get(\"vat\"), s.get(\"gross_total\")\n    if gross is None:\n        problems.append(\"summary: gross_total missing, cannot check the arithmetic\")\n    elif abs((net + vat) - gross) > 0.01:\n        problems.append(\"summary: %.2f + %.2f does not equal %.2f\" % (net, vat, gross))\n    return problems   # an empty list means the record is safe to store\n\nfor label, record in [(\"default OCR\", from_default_ocr),\n                      (\"layout-preserving OCR\", from_layout_ocr)]:\n    problems = validate_invoice(record, PRINTED_PRICES)\n    print(\"--- %s ---\" % label)\n    for p in problems:\n        print(\"  reject:\", p)\n    if not problems:\n        print(\"  safe to store: every price is on the page and %.2f + %.2f = %.2f\"\n              % (record[\"summary\"][\"net_total\"], record[\"summary\"][\"vat\"],\n                 record[\"summary\"][\"gross_total\"]))\n    print()\n\n# Notice what a type check alone would have missed. Every\n# unit_price in the bad record is a perfectly good float. It\n# takes checking them against the document, and checking the\n# totals against each other, to catch invented numbers.\n"
    },
    {
      "type": "p",
      "text": "Run that against the real output above and it comes back with a list of problems: every line is missing its net worth, and the line items do not add up to the stated total. That is the point. The record gets caught and held for review instead of silently saved with invented prices. The prompt made a good answer likely; the validation made the bad answer safe. None of this is hypothetical: it is one real run on one real invoice, reproducible in a minute with the same model and the same prompt, which is the only kind of evidence worth trusting when you are about to ship a feature that reads documents for a living."
    },
    {
      "type": "h2",
      "text": "The vocabulary, linked to the source"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Information extraction",
          "def": "pulling specific structured fields out of unstructured text, like getting a total and a date out of an invoice.",
          "url": "https://en.wikipedia.org/wiki/Information_extraction"
        },
        {
          "term": "OCR",
          "def": "optical character recognition: turning an image of a document into text. Its mistakes happen before the model reads anything.",
          "url": "https://en.wikipedia.org/wiki/Optical_character_recognition"
        },
        {
          "term": "Schema",
          "def": "the exact shape the output must take: which fields exist and what type each one is.",
          "url": "https://json-schema.org/"
        },
        {
          "term": "Grounding",
          "def": "restricting the model to facts actually present in the source text, so it does not invent fields from general knowledge.",
          "url": "https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)"
        },
        {
          "term": "Validation",
          "def": "checking the output against the schema and simple rules after the fact, and rejecting anything that does not conform.",
          "url": "https://json-schema.org/learn/getting-started-step-by-step"
        }
      ]
    },
    {
      "type": "p",
      "text": "So the honest lesson is humbler than \"write a stricter prompt.\" A schema gives you a shape you can parse, which is worth having, but it does not give you correct values and it can quietly cost you accuracy on a hard input. The values come from what the model can actually read, which means the real fight is usually upstream at OCR, and from checking the result afterward. Name your fields and demand a shape, but fix the input first, let the model reason where it needs to, and validate every number before you trust it. That is what lets a document reader survive contact with the real, messy, badly-scanned world, where the invoice you never tested is always the next one through the door."
    },
    {
      "type": "sources",
      "items": [
        {
          "title": "Invoice image: Voxel51 \"high-quality-invoice-images-for-ocr\" dataset (Hugging Face)",
          "url": "https://huggingface.co/datasets/Voxel51/high-quality-invoice-images-for-ocr"
        },
        {
          "title": "Optical character recognition (Wikipedia)",
          "url": "https://en.wikipedia.org/wiki/Optical_character_recognition"
        },
        {
          "title": "JSON Schema",
          "url": "https://json-schema.org/"
        },
        {
          "title": "Multilingual OCR-Aware Fine-Tuning and Prompt-Guided CoT Reasoning (arXiv:2605.16409)",
          "url": "https://arxiv.org/abs/2605.16409"
        }
      ]
    }
  ]
};
