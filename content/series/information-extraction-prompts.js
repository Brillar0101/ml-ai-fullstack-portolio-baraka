// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled in src/data/seriesPosts.js. Every factual claim is taken from the
// numbered sources at the end. The error-example figure is reproduced from
// LMDX (arXiv 2309.10952) under CC BY 4.0. Both charts are redrawn from table
// values in LMDX (Table 2) and Anvari & Athitsos (Tables 15 and 17).
export const POST = {
  "id": "information-extraction-prompts",
  "title": "Valid JSON, wrong values: a failure catalog for document extraction",
  "excerpt": "On 20-page FDA device reviews, a single-prompt LLM extractor skipped about 27.5% of the fields a human would fill and added values the documents never state. The papers that measured this show four distinct ways extraction goes wrong, and none of them breaks the JSON.",
  "category": "AI",
  "chapter": "Prompt Engineering",
  "tags": [
    "Prompt engineering",
    "Information extraction",
    "OCR",
    "Evaluation"
  ],
  "seriesNum": 40,
  "publishAt": "2026-07-05T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In 2023 a Stanford and Cornell team pointed text-davinci-003 at FDA 510(k) reviews, the roughly 20-page PDFs a device maker files before selling a medical device. They gave it one fixed prompt: list the attributes in this document and their values. On that set the model missed an average of 4.4 of the 16 attributes a human annotator had marked, 27.5% of them, in every document. It also produced an average of 9.7 attributes or values per document that the document did not explicitly mention. And it named things inconsistently: across a sample of 10 documents, the device classification came back as \"classification\", \"device classification\", \"regulatory information\", or not at all.[^1]"
    },
    {
      "type": "p",
      "text": "The paper's system, Evaporate, asks for a simple list of attribute and value pairs that it turns into a table, and none of the three failures it lists is about that format.[^1] They are about content. The authors' own summary of the failure is blunt: \"Since the error modes are quite varied, it is unclear how to improve quality.\"[^1] This post takes that sentence as a challenge. Later papers measured the variety more carefully, on forms, receipts and invoices, and the errors fall into four families. Each one has a paper that caught it and at least one mitigation someone measured."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        { "term": "Information extraction (IE)", "def": "Turning unstructured text into structured records, such as entities, relations and events. A recent survey defines it that way and frames the LLM version as generation: the model writes out the target structure token by token, given the text and a prompt.[^4]" },
        { "term": "Schema and field", "def": "The schema is the list of slots to fill, each with a name and a data type, like file_date as a date or registration_num as digits. A field (papers also say attribute, key or entity type) is one slot.[^5]" },
        { "term": "OCR", "def": "Optical character recognition, the step that turns a scanned page into text lines with bounding boxes. Text-only LLM pipelines see whatever OCR produced, errors included.[^2]" },
        { "term": "Hierarchical entity", "def": "A field made of grouped sub-fields, like an invoice line item made of description, dates and price. Getting it right means getting the grouping right too.[^3]" },
        { "term": "Grounding", "def": "Checking that an extracted value actually appears in the source document, at a place you can point to.[^2]" }
      ]
    },
    {
      "type": "h2",
      "text": "What the score counts as correct"
    },
    {
      "type": "p",
      "text": "Before the catalog, it helps to see how these papers score an extraction, because the scoring rule decides which failures you can even see. Evaporate uses Pair F1. Every cell in the output table becomes a tuple of document, attribute and value, and a predicted tuple counts only if it exactly matches a tuple in the hand-built ground truth.[^1]"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} T = \\{(d_i,\\, a_j,\\, r_{i,j})\\} \\\\[4pt] P = \\frac{|\\hat{T} \\cap T|}{|\\hat{T}|} \\qquad R = \\frac{|\\hat{T} \\cap T|}{|T|} \\\\[4pt] F_1 = \\frac{2PR}{P + R} \\end{gathered}",
      "caption": "Pair F1 as Evaporate describes it in words: an F1 score over predicted and gold sets of (document, attribute, value) tuples, where a tuple must match exactly.[^1] The set notation is this post's."
    },
    {
      "type": "p",
      "text": "\\(T\\) is the gold set: one tuple per filled cell, where \\(d_i\\) is the document, \\(a_j\\) the attribute and \\(r_{i,j}\\) the value. \\(\\hat{T}\\) is what the system produced. Precision \\(P\\) is the share of predicted tuples that are right, so every invented value drags it down. Recall \\(R\\) is the share of gold tuples the system recovered, so every skipped field drags it down. \\(F_1\\) is their harmonic mean, which stays low if either one is low. On the FDA reports, direct prompting scored 45.5 Pair F1.[^1]"
    },
    {
      "type": "p",
      "text": "The quiet part is the \\(\\cap\\): what counts as a match. Under exact matching, \"$ 40,000\" and \"40,000\" are different values, and so are \"July 1, 2022\" and \"07/01/2022\". The VRDU benchmark, built from political ad-buy invoices filed with the FCC and foreign-agent registration forms, rejects that rule. Its evaluation tool matches by data type: price values are converted to numbers before comparison, dates are parsed and compared as dates, and addresses stay strict, since \"4, Main St.\" and \"40 Main St.\" are not the same place.[^3] Another receipt benchmark reports two scores side by side. Exact Match gives a key and value pair credit only if both match after lowercasing and whitespace cleanup, while token-level Value F1 gives partial credit.[^6] Keep that gap in mind. It comes back in the number section."
    },
    {
      "type": "h2",
      "text": "Failure 1: a field that is there comes back empty"
    },
    {
      "type": "p",
      "text": "The FDA result is the clearest case. Of the gold attributes the model missed in a given document, every one was extracted in at least one other document.[^1] The model could find them. It just did not do it every time, so this is a consistency failure, not a capability gap. Evaporate's comparison across model providers found another flavor: asked for one attribute value, Claude-V1 sometimes replied in chatbot style, \"I'm not sure, please give me more information,\" instead of giving a value.[^1] Either way, the field comes back empty."
    },
    {
      "type": "p",
      "text": "Empty is ambiguous, and that ambiguity is what the mitigations target. Evaporate's code-generation variant writes many small extraction functions and has to decide whether a function's empty output means \"this document has no such field\" or \"this function could not handle this document\". A function written for a lowercase \"k\" product code returns nothing on documents that use an uppercase \"K\", for instance.[^1] The system estimates how often the attribute is present by asking the LLM on up to 10 sample documents, then treats empty outputs accordingly. That abstention handling added 1.9 Pair F1 on average and 7.8 on the FDA setting, on top of filtering out bad functions.[^1]"
    },
    {
      "type": "p",
      "text": "Google's LMDX work measured a cheaper fix at the prompt level. Their completions list every schema field in order and write null for a missing single field or [] for a missing repeated one. When they trained the model to skip absent fields instead, micro-F1 on the ad-buy invoices fell from 54.35 to 47.58, a 6.77 point drop.[^2] Their explanation is a hypothesis, labeled as one: with explicit nulls the model copies the next key from the schema and makes a present-or-absent call, while skipping forces it to pick which of the remaining keys comes next.[^2]"
    },
    {
      "type": "h2",
      "text": "Failure 2: a value the document never states"
    },
    {
      "type": "p",
      "text": "The 9.7 unmentioned attributes or values per FDA document are the first half of the Evaporate result.[^1] The same pattern shows up on receipts. A 2026 benchmark of six open 7B to 8B models on the FUNSD, SROIE and CORD datasets used a prompt that explicitly discourages hallucinated fields. The models still sometimes invented fields such as \"subtotal\" or \"invoice number\" on receipts that did not contain them. On long receipts they also over-extracted, trying to label nearly every number on the page.[^6] Telling the model not to invent things did not make it stop."
    },
    {
      "type": "p",
      "text": "Some hallucinations are hard to spot because they sit one digit away from the truth. In a manual review of LLM extractions from VRDU registration forms, Colakoglu and colleagues give an example of a hallucinated date: the model wrote \"1992-04-24\" where the form says \"1992-04-21\".[^5] That output has the right key, a valid date format and a plausible value. Nothing in the JSON structure flags it."
    },
    {
      "type": "p",
      "text": "The measured mitigation is grounding. LMDX puts a coordinate token after every OCR line in the prompt, such as \"Apple Store 38|05\", and asks the model to copy that token next to each extracted value. Decoding then looks up the line by its coordinates and checks that the extracted text really appears on it. If it does not, the value is thrown away.[^2] On the ad-buy invoices with no target-domain training, 0.59% of completions contained such a mismatch, and the check discarded them. Invalid JSON, by comparison, showed up in only 0.18% of completions.[^2] (Zero-shot here means no ad-buy training documents. The model had been fine-tuned on other forms first, to learn the task and the output syntax.[^2]) LMDX also samples 16 completions per chunk and takes a majority vote. Dropping to a single completion cost 1.5 micro-F1, mostly because repeat samples let the system recover from a malformed or ungrounded answer.[^2]"
    },
    {
      "type": "p",
      "text": "Put those two numbers next to each other. Under one in five hundred completions failed to parse, yet the same zero-shot system scored 39.74 micro-F1 on those invoices.[^2] Almost all of the missing quality sat in values that parsed fine."
    },
    {
      "type": "h2",
      "text": "Failure 3: a number is misread or loses its unit"
    },
    {
      "type": "p",
      "text": "Numbers get corrupted before the model ever sees them. The receipt benchmark ran each model twice: once on clean text taken from the human annotations, and once on text from real OCR engines. It reports digit corruption such as \"193.00\" becoming \"19300\", along with broken decimal points.[^6] Its observation about what that does to scores is the most useful sentence in the paper for this topic. These errors often keep partial token overlap, so they earn moderate Value F1 while failing Exact Match completely.[^6] A lenient metric can make a wrong number look close to right."
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Same model, same receipts, different text quality",
      "yLabel": "Score (0 to 1)",
      "series": [
        { "label": "Exact Match", "key": "em" },
        { "label": "Value F1", "key": "vf1" }
      ],
      "data": [
        { "label": "Clean text", "values": { "em": 0.7724, "vf1": 0.97 } },
        { "label": "PaddleOCR", "values": { "em": 0.4545, "vf1": 0.8267 } },
        { "label": "Tesseract", "values": { "em": 0.1187, "vf1": 0.2679 } }
      ],
      "caption": "Qwen2.5 7B, zero-shot, on CORD receipts. Redrawn from Tables 15 and 17 of Anvari and Athitsos, 2026.[^6] With the cleanest OCR engine, Value F1 still reads 0.83 while strict matches fall to 0.45."
    },
    {
      "type": "p",
      "text": "On CORD, the best zero-shot model kept a Value F1 of 0.83 on PaddleOCR text, but its Exact Match fell from 0.77 on clean text to 0.45.[^6] Under Tesseract, the noisiest engine in the study, Value F1 dropped to 0.27.[^6] The authors conclude that once OCR noise enters, the main source of error shifts from reasoning to input corruption, and that strong semantic modeling cannot compensate for degraded input.[^6] One caution on this source: it is a 2026 preprint that tests small open models on text alone, so its absolute numbers say less about large multimodal models than its pattern does."
    },
    {
      "type": "p",
      "text": "Units and formats fail in a quieter way. The model returns \"40,000\" for a total printed as \"$ 40,000\", or a date in a different format from the one in the ground truth. VRDU's type-aware matching exists precisely so those cases score as correct.[^3] Colakoglu and colleagues measured the same thing from the pipeline side. After GPT-3.5, GPT-4o and LLaMA3-70B extracted from VRDU registration forms, a data-cleaning step reformatted each value using a regular expression for its field type. That lifted average exact-match F1 from 0.650 to 0.734. A schema-mapping step that fixed misspelled keys changed nothing, because the models already returned the right keys.[^5] So the keys were right and the values needed repair."
    },
    {
      "type": "p",
      "text": "Tolerant scoring has its own risk. The same study scored with fuzzy string matching at a 0.8 similarity threshold, then had people check 91 pairs that failed exact match but passed fuzzy match. Fuzzy precision came out at 0.984, not 1.0.[^5] Their example of a \"wrong info\" error is a model that returned \"2016-10-31\" as the file date instead of \"2016-10-08\".[^5] A string metric sees two dates that share most of their characters. A person filing a form sees the wrong day. My reading of these results: normalization is safe for money and dates only when it compares parsed values, as VRDU does, and fuzzy matching should never be the check on a numeric field."
    },
    {
      "type": "p",
      "text": "Money fields are not always the weak spot, though. On the ad-buy invoices, LMDX scored 98.86 F1 on gross_amount, and removing all layout information barely moved it (98.47). The paper's explanation is that a total can be found from cues like \"$\" or \"USD\" without reading its label.[^2] The dates on the same invoices were much harder: 67.74 F1 for the flight start date.[^2]"
    },
    {
      "type": "h2",
      "text": "Failure 4: table rows come apart"
    },
    {
      "type": "p",
      "text": "Line items are where extraction scores collapse. VRDU's authors found that across training-set sizes, the FormNet model's micro-F1 on hierarchical entities trailed its score on other entities by 60 to 70 points. They call proper extraction of hierarchical entities \"an open question\".[^3] LLM extractors show the same gap. LMDX's zero-shot comparison on the ad-buy invoices reports line-item F1 separately from overall micro-F1, and the gap is large for every model."
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Zero-shot, ad-buy invoices: all fields vs line items",
      "yLabel": "F1 (%)",
      "series": [
        { "label": "Micro-F1, all fields", "key": "all" },
        { "label": "Line item F1", "key": "li" }
      ],
      "data": [
        { "label": "GPT-3.5 + OCR", "values": { "all": 30.05, "li": 7.65 } },
        { "label": "GPT-4V + image", "values": { "all": 31.95, "li": 4.45 } },
        { "label": "Gemini Pro + OCR", "values": { "all": 34.46, "li": 19.25 } },
        { "label": "LMDX (PaLM 2-S)", "values": { "all": 39.74, "li": 21.21 } },
        { "label": "LMDX (Gemini Pro)", "values": { "all": 38.02, "li": 23.29 } }
      ],
      "caption": "VRDU Ad-buy Form, Mixed Template task, no ad-buy training documents. Redrawn from Table 2 of Perot et al., 2024.[^2] The LMDX rows add line coordinates to the prompt; the others get plain OCR text or the page image."
    },
    {
      "type": "p",
      "text": "The coordinates are what the LMDX rows add, and the paper tests how much they matter. In an ablation fine-tuned on 10 ad-buy documents, replacing the coordinate tokens with plain line numbers cut line-item F1 from 39.35 to 18.35. Eight of the nine single fields lost less than 10 points.[^2] The paper's explanation: line-item parts sit in tables, so the model needs horizontal and vertical alignment to group a description with its own dates and price.[^2]"
    },
    {
      "type": "image",
      "src": "/blog-images/information-extraction-prompts/lmdx-ocr-line-errors.webp",
      "alt": "Two annotated invoice crops. Top: a table row where OCR drew one line box around the Channel value WJZ and the Description value Local News 6a-630a, so the model predicted program_desc as WJZ Local News 6a-630a instead of Local News 6a-630a. Bottom: a header table where Invoice Period 11/25/19 to 12/29/19 and Flight Dates 12/24/19 to 12/30/19 sit in one OCR line; the model returned the invoice period dates as the flight dates.",
      "width": 940,
      "height": 905,
      "caption": "Figure 18 from Perot et al., 2024,[^2] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Red boxes are OCR lines, blue are predictions, green is the ground truth. In both cases OCR merged two separate cells into one line."
    },
    {
      "type": "p",
      "text": "The figure shows the two error patterns the LMDX authors call common. In the first, OCR grouped the Channel and Description columns into one line, so the extracted description carried the channel code along with it. In the second, \"Invoice Period\" and \"Flight Dates\" landed on the same OCR line, and the model returned the invoice dates as the flight dates.[^2] Both answers passed the grounding check, because the text really is on that line. The receipt benchmark describes the same failure in CORD: models attach the right key, such as total, to an item-level amount, which costs Exact Match even when the model found every key.[^6] VRDU's own annotators made a milder version of this mistake, sometimes confusing the flight dates with other periods on the invoice, such as the invoice period.[^3]"
    },
    {
      "type": "p",
      "text": "Three mitigations have numbers behind them. Layout in the prompt is one: the 21 point line-item difference above.[^2] Examples from the same template are another. On CORD, LMDX with in-context examples retrieved by nearest-neighbor search matched its best random-example score using a single example, and matched its fine-tuned score at 10 examples, because the retrieval found receipts from the same merchant.[^2] The third is the image itself. In the Colakoglu study, GPT-4o-vision and Qwen2.5-vision, given the page image, were the best performers, at about 0.90 F1 against at most 0.80 for the tuned text-only pipelines. GPT-4o-vision used about twice the tokens and cost more than 10 times as much at November 2024 prices.[^5]"
    },
    {
      "type": "h2",
      "text": "Where the grounding check stops"
    },
    {
      "type": "p",
      "text": "The survey of generative IE lists the \"misalignment between natural language output and structured form\" as an open challenge next to hallucination.[^4] The papers above make that concrete. Parse errors are rare and cheap to catch. The hard errors are values that parse, match the schema, and even appear in the document, while belonging to a different field."
    },
    {
      "type": "p",
      "text": "LMDX, which built the strongest check in this catalog, says where that check ends. Its input is OCR text lines, so it inherits OCR's mistakes: wrong reading order, incorrect line grouping, undetected text and misrecognized characters.[^2] And its verification works at the level of a line. It confirms that the extracted text is present on the line the model pointed to. \"If the entity text appears multiple times on the line,\" the authors write, \"we don't have a definitive way to choose the correct text.\"[^2]"
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        { "title": "Arora, Yang, Eyuboglu, Narayan, Hojel, Trummer, Ré. Language Models Enable Simple Systems for Generating Structured Views of Heterogeneous Data Lakes (Evaporate). PVLDB 2023 / arXiv 2304.09433", "url": "https://arxiv.org/abs/2304.09433" },
        { "title": "Perot et al. LMDX: Language Model-based Document Information Extraction and Localization. arXiv 2309.10952", "url": "https://arxiv.org/abs/2309.10952" },
        { "title": "Wang, Zhou, Wei, Lee, Tata. VRDU: A Benchmark for Visually-rich Document Understanding. KDD 2023 / arXiv 2211.15421", "url": "https://arxiv.org/abs/2211.15421" },
        { "title": "Xu et al. Large Language Models for Generative Information Extraction: A Survey. Frontiers of Computer Science 2024 / arXiv 2312.17617", "url": "https://arxiv.org/abs/2312.17617" },
        { "title": "Colakoglu, Solmaz, Fürst. Problem Solved? Information Extraction Design Space for Layout-Rich Documents using LLMs. arXiv 2502.18179", "url": "https://arxiv.org/abs/2502.18179" },
        { "title": "Anvari, Athitsos. From Pixels to Pairs: A Comprehensive Benchmark of LLM-Based Key-Value Extraction in Noisy Document Settings. arXiv 2609.17538 (preprint, 2026)", "url": "https://arxiv.org/abs/2609.17538" }
      ]
    }
  ]
}
