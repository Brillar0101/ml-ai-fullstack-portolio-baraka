// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
// Every factual claim below is taken from the numbered sources at the end.
// Both charts are redrawn from table values; the arXiv licenses of the cited
// papers (non-exclusive distribution) do not allow figure reuse.
export const POST = {
  "id": "detection-without-a-detector",
  "title": "Detection without a detector: from a closed list to a sentence",
  "excerpt": "OWL-ViT found LVIS rare categories at 31.2 AP after every box for them was removed from its training data. How image-text training turns class names into vectors, how OWL-ViT and Grounding DINO turn those vectors into boxes, and where the papers say it still breaks.",
  "category": "AI",
  "chapter": "Chapter 10",
  "tags": [
    "Computer Vision",
    "Visual Grounding",
    "Open Vocabulary",
    "Object Detection"
  ],
  "seriesNum": 41,
  "publishAt": "2026-06-29T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In 2022 a Google Research team trained an object detector and then scored it on categories it had never been shown a box for. Before training, they deleted every box annotation whose label matched one of the \"rare\" categories of the LVIS benchmark. At test time they gave the model all 1,203 LVIS category names as text for every image. Their best model, built on a public CLIP backbone, reached 31.2% average precision on those rare categories, against 34.6% across all categories.[^1] Average precision (AP) is the standard detection score: it rewards boxes that overlap the true object well and ranks confident correct boxes above wrong ones, averaged over categories. The gap between \"never saw a box for it\" and \"everything\" was 3.4 points."
    },
    {
      "type": "p",
      "text": "The model is called OWL-ViT, and the number is worth sitting with, because a normal detector would score zero on a category it was never trained on. It would not score low. It would have no output for that category at all. This post follows how that changed: what a closed-vocabulary detector is, how contrastive image-text training turns a class name into a vector, how OWL-ViT and Grounding DINO turn that vector into boxes, and what the papers themselves report going wrong."
    },
    {
      "type": "h2",
      "text": "A detector's classes are rows in a weight matrix"
    },
    {
      "type": "p",
      "text": "A classic detector proposes regions of the image, computes a feature vector for each, and sends that vector through a classification layer. That layer is a weight matrix with one row per class. The dot product of a region's features with row \\(k\\) is the score for class \\(k\\). The GLIP paper writes it this way: region features \\(O\\) times the transposed class weights \\(W\\) give the classification logits.[^5] Whatever the architecture before it, the list of things the model can name is fixed the day that matrix is created. Adding a class means adding a row, and a row has to be learned from labeled boxes."
    },
    {
      "type": "p",
      "text": "OWL-ViT's authors put the problem plainly: detection models were typically limited to a small, fixed set of categories because localized training data with large label spaces is costly and slow to collect.[^1] LVIS was built to measure exactly that cost. It was designed to cover over 1,000 entry-level categories in 164k images, and its authors note that because categories in natural images follow a Zipfian distribution, the tail of rare categories is inescapable: many categories will only ever have a few examples.[^2] LVIS bins categories by how many training images contain them. **Rare** means 1 to 10 images, **common** 11 to 100, **frequent** more than 100.[^2] Labeling every category in every image was out of reach, so LVIS is **federated**: for each category there is a positive set of images where every instance is annotated and a negative set where the category is known to be absent, and detections of that category on any other image are simply not evaluated.[^2]"
    },
    {
      "type": "p",
      "text": "A fixed label set also shapes what a system does with something that fits no row. The NTSB report on the March 18, 2018 crash of an Uber test vehicle in Tempe, Arizona, describes a perception system that could classify a detected object as a vehicle, a pedestrian, or a bicyclist, or as \"other,\" meaning unknown.[^3] The pedestrian was walking across the road outside a crosswalk, pushing a bicycle. The system first detected her 5.6 seconds before impact and never classified her as a pedestrian. Its classification alternated several times between vehicle, bicycle, and other, and with each change the system treated her as a new object with no tracking history, so it could not predict her path.[^3] Objects classed as \"other\" were not assigned goals and were treated as static.[^3] The report is clear that this is one part of a larger failure: it gives the probable cause as the vehicle operator's failure to monitor the road because she was visually distracted by her phone, with Uber ATG's inadequate safety risk assessment and oversight among the contributing factors.[^3] I cite it only for what it documents about classification: a fixed menu of classes, an object that did not sit cleanly in any of them, and a design where changing the label threw away history. Nothing in the report says an open-vocabulary detector would have changed the outcome, and I make no such claim."
    },
    {
      "type": "h2",
      "text": "CLIP turns a class name into a vector"
    },
    {
      "type": "p",
      "text": "The way out of the fixed matrix came from image classification. CLIP, from OpenAI in 2021, was trained on 400 million (image, text) pairs collected from the internet.[^4] It has two encoders: an image encoder (a ResNet or a Vision Transformer) and a Transformer text encoder. Each ends in a linear projection into a shared **embedding space**, a space of vectors where an image and a caption can be compared directly.[^4] The training task is not to write the caption. Given a batch of \\(N\\) pairs, CLIP has to predict which of the \\(N \\times N\\) possible (image, text) pairings actually occurred.[^4] The authors report that swapping a caption-prediction objective for this contrastive one gave a further 4x efficiency gain in zero-shot ImageNet transfer during their early experiments.[^4]"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} s_{ij} = e^{t}\\,\\frac{I_i \\cdot T_j}{\\lVert I_i \\rVert\\,\\lVert T_j \\rVert} \\\\[6pt] \\mathcal{L}_{\\text{img}} = -\\frac{1}{N}\\sum_{i=1}^{N} \\log \\frac{e^{s_{ii}}}{\\sum_{j=1}^{N} e^{s_{ij}}} \\\\[6pt] \\mathcal{L}_{\\text{txt}} = -\\frac{1}{N}\\sum_{j=1}^{N} \\log \\frac{e^{s_{jj}}}{\\sum_{i=1}^{N} e^{s_{ij}}} \\\\[6pt] \\mathcal{L} = \\tfrac{1}{2}\\big(\\mathcal{L}_{\\text{img}} + \\mathcal{L}_{\\text{txt}}\\big) \\end{gathered}",
      "caption": "CLIP's symmetric contrastive loss, written out from the pseudocode in Figure 3 of Radford et al., 2021.[^4]"
    },
    {
      "type": "p",
      "text": "Term by term: \\(I_i\\) is the projected embedding of image \\(i\\) in the batch and \\(T_j\\) the projected embedding of text \\(j\\). Dividing by their lengths makes \\(I_i \\cdot T_j\\) a **cosine similarity**, a number between \\(-1\\) and \\(1\\) that measures how closely the two vectors point the same way. \\(e^{t}\\) is a learned temperature scale; CLIP initializes it to the equivalent of 0.07 and clips it so the logits are never scaled by more than 100, which the authors found necessary to prevent training instability.[^4] The diagonal entries \\(s_{ii}\\) are the real pairs. \\(\\mathcal{L}_{\\text{img}}\\) is a cross-entropy that asks each image to pick its own caption out of all \\(N\\) captions; \\(\\mathcal{L}_{\\text{txt}}\\) asks each caption to pick its own image. Averaging the two gives the symmetric cross-entropy the paper describes: push the \\(N\\) real pairs together, push the \\(N^2 - N\\) wrong pairings apart.[^4] CLIP used a batch size of 32,768, so each image competes against a very large set of wrong captions at every step.[^4]"
    },
    {
      "type": "p",
      "text": "The payoff is in how CLIP classifies. For a dataset, you encode each class name as text (the paper found \"A photo of a {label}.\" a good default prompt), encode the image, compute the scaled cosine similarity with every class text, and take a softmax.[^4] The authors point out what this is: a linear classifier whose weights are generated by the text encoder from the class names.[^4] That is the row-per-class matrix again, except the rows are no longer learned parameters. They are computed from words, so anyone can add a row by typing. Zero-shot, CLIP matched the accuracy of the original ResNet-50 on ImageNet without using any of its 1.28 million training examples.[^4]"
    },
    {
      "type": "h2",
      "text": "OWL-ViT: one box per image token"
    },
    {
      "type": "p",
      "text": "CLIP scores a whole image against a sentence. A detector needs a score for each object and a box around it. OWL-ViT's recipe for bridging the two is deliberately small. Take a contrastively pretrained Vision Transformer, which splits the image into patches and outputs one vector, or **token**, per patch. Remove the final pooling layer that squashes those tokens into one image vector. Attach two light heads to every output token: a linear projection that produces a per-object embedding for classification, and a small MLP that predicts a box.[^1] The model predicts one box per token, and each box is biased by default to sit centered on that token's patch, so the model learns an offset from a default location.[^1] The maximum number of objects equals the number of tokens, at least 576 in their models, which the authors note is above the 294 instances of the most crowded LVIS image.[^1]"
    },
    {
      "type": "p",
      "text": "Classification then works exactly like CLIP. Category names or other descriptions go through the text encoder, and the resulting embeddings, which the paper calls **queries**, replace the learned class weights in the classification head.[^1] Each query is encoded on its own, and the image and text encoders never exchange information before the final comparison. The authors chose this on purpose: fusing them early would require a pass through the image model for every image and query combination, while keeping them apart lets query embeddings be computed once and lets the model handle thousands of queries per image.[^1] It also means a query does not have to be text. An embedding of an example object cropped from another image works too, and in that one-shot mode OWL-ViT raised the state of the art on unseen COCO categories from 26.0 to 41.8 AP50.[^1]"
    },
    {
      "type": "p",
      "text": "Training for detection uses the bipartite matching loss from DETR, which pairs each ground-truth object with one predicted box, but with a sigmoid focal loss for classification instead of a softmax, because in federated datasets like LVIS an object can carry more than one valid label.[^1] Each image's known positive and negative categories are its queries, plus randomly sampled pseudo-negatives up to at least 50.[^1] One detail says a lot about where the ability lives. The text encoder is fine-tuned with a learning rate 100 times smaller than the image encoder's, which the authors say may keep it from forgetting the semantics learned in pretraining while it sees only the small label space of detection data. Freezing the text encoder completely gave poor results.[^1]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "LVIS v1.0 val, open-vocabulary training without LVIS labels",
      "yLabel": "AP (%)",
      "series": [
        { "label": "AP, all categories", "key": "all", "baseline": true },
        { "label": "AP, rare categories", "key": "rare" }
      ],
      "data": [
        { "label": "GLIP Swin-T", "values": { "all": 17.2, "rare": 10.1 } },
        { "label": "GLIP Swin-L", "values": { "all": 26.9, "rare": 17.1 } },
        { "label": "OWL-ViT B/32", "values": { "all": 23.3, "rare": 19.7 } },
        { "label": "OWL-ViT L/16", "values": { "all": 30.9, "rare": 28.8 } },
        { "label": "OWL-ViT H/14", "values": { "all": 33.6, "rare": 30.6 } },
        { "label": "OWL-ViT L/14 (CLIP)", "values": { "all": 34.6, "rare": 31.2 } }
      ],
      "caption": "Redrawn from Table 1 (\"unrestricted open-vocabulary training\" rows) of Minderer et al., 2022.[^1] OWL-ViT rows are means of three fine-tuning runs, trained on Objects365 and Visual Genome with all LVIS rare-category boxes removed, so their rare AP is zero-shot. The B/32, L/16 and H/14 rows use the authors' LiT pretraining; the last uses public CLIP weights."
    },
    {
      "type": "p",
      "text": "The chart shows the pattern that made the opening number notable. For the OWL-ViT models, rare-category AP tracks overall AP closely, and both rise with model size. The paper also found that image-level pretraining quality predicts detection quality only loosely. High zero-shot ImageNet accuracy was necessary but not sufficient for good zero-shot detection (Pearson's r = 0.73), and with more pretraining, detection performance rose, then peaked, while image-level performance kept climbing.[^1] Larger models and better fine-tuning pushed that peak further out.[^1]"
    },
    {
      "type": "h2",
      "text": "GLIP and Grounding DINO: read the prompt and the image together"
    },
    {
      "type": "p",
      "text": "A second line of work treats detection as **phrase grounding**, the task of linking phrases in a sentence to regions in an image. GLIP, from Microsoft in 2021, casts detection as grounding with no context: list the categories in one text prompt, such as \"person. bicycle. car. ... toothbrush,\" and ground each name.[^5] The classifier's weight matrix is replaced by the contextual token features \\(P\\) from a language encoder, and the scores become \\(S_{\\text{ground}} = O P^{\\top}\\), an alignment score between every region and every word token.[^5] GLIP adds **deep fusion**, cross-attention between image and text features in the last encoder layers, so that the visual features already know what the prompt asks for.[^5] Pretrained on 27 million grounding examples, 3 million human-annotated and 24 million web image-text pairs, GLIP reached 49.8 AP on COCO and 26.9 AP on LVIS without seeing COCO images during pretraining.[^5]"
    },
    {
      "type": "p",
      "text": "Grounding DINO, from IDEA Research in 2023, pushes fusion further. It builds on DINO, a Transformer detector, and fuses language at three points: a feature enhancer in the neck that stacks self-attention with text-to-image and image-to-text cross-attention; a language-guided query selection that picks which image features start the decoder queries; and a decoder whose layers each add a text cross-attention step.[^6] It also fixes a side effect of GLIP's concatenated prompt. When category names sit in one sentence in random order, unrelated names attend to each other. Grounding DINO masks attention between unrelated names, which the authors call a **sub-sentence** level representation.[^6] The classification loss follows GLIP: each decoder query is dot-multiplied with the text features to give a logit per text token, and a focal loss is applied to each logit.[^6]"
    },
    {
      "type": "p",
      "text": "The headline result: 52.5 AP on COCO without any COCO training data, for the large model trained on Objects365, OpenImages, and grounding data.[^6] The paper defines \"zero-shot\" as not using the training split of the test dataset, and it notes that Objects365 covers nearly all COCO categories, so this is transfer across datasets more than detection of unseen concepts.[^6] On ODinW, a benchmark of more than 35 real-world detection datasets, the large model set a zero-shot record of 26.1 mean AP.[^6]"
    },
    {
      "type": "h2",
      "text": "Where the papers report failures"
    },
    {
      "type": "p",
      "text": "**Rare categories.** Grounding DINO's own LVIS table shows it doing better than GLIP on common and frequent categories and worse on rare ones. The authors observed that DETR-like models often have lower rare-category AP at similar overall AP, and wrote that, as far as they knew, no existing DETR-like model handles LVIS rarity without extra training data, \"which may be a characteristic limitation of the architecture.\"[^6] Both models in that table also trail DetCLIPv2, which scored 36.0 rare AP; the authors attribute the gap partly to the distribution of training data.[^6]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "LVIS minival zero-shot AP by category frequency, Swin-T models",
      "yLabel": "AP (%)",
      "series": [
        { "label": "Rare", "key": "r" },
        { "label": "Common", "key": "c" },
        { "label": "Frequent", "key": "f", "baseline": true }
      ],
      "data": [
        { "label": "GLIP-T (C), O365+GoldG", "values": { "r": 17.7, "c": 19.5, "f": 31.0 } },
        { "label": "G-DINO T, O365+GoldG", "values": { "r": 14.4, "c": 19.6, "f": 32.2 } },
        { "label": "GLIP-T, +Cap4M", "values": { "r": 20.8, "c": 21.4, "f": 31.0 } },
        { "label": "G-DINO T, +Cap4M", "values": { "r": 18.1, "c": 23.3, "f": 32.7 } }
      ],
      "caption": "Redrawn from Table 3 (zero-shot setting) of Liu et al., 2023.[^6] Pairs share backbone and pretraining data. Grounding DINO leads on frequent and common categories and trails GLIP on rare ones in both pairs."
    },
    {
      "type": "p",
      "text": "**Compositional phrases.** A category name is the easy case. Referring expression comprehension asks a model to find one specific object from a phrase with attributes and relations, like \"man on far left.\" On RefCOCO val, Grounding DINO T pretrained without any referring data scored 50.41% top-1 accuracy and GLIP-T 50.42%. With RefCOCO-family data added to pretraining, Grounding DINO T reached 73.98%, and 89.19% after fine-tuning.[^6] The authors conclude that existing open-set detectors do not work well on referring data without fine-tuning and that most need more attention to fine-grained detection.[^6] CLIP's paper reports related limits one level up: its zero-shot performance was weak on fine-grained classes such as car models and flower species, it struggled to count objects, and on a task like classifying the distance to the nearest car in a photo it could be near random.[^4] GLIP shows how much wording matters. On the Aquarium dataset in ODinW, zero-shot GLIP missed stingrays; adding \"flat and round\" to the prompt raised stingray AP50 from 4.6 to 9.7 with no retraining.[^5]"
    },
    {
      "type": "p",
      "text": "**Speed.** Fusion costs time, and the more a model reads text and image together, the less it can reuse. GLIP's appendix measured inference on a P100 GPU at batch size 1: GLIP-T ran at 4.84 images per second without deep fusion and 2.52 with it, and GLIP-L fell from 0.54 to 0.32.[^5] Without fusion the language embeddings of the prompt can be cached, so inference costs the same as the underlying detector.[^5] GLIP also caps its text input at 256 tokens, so a vocabulary as large as Objects365's 365 names does not fit in one prompt and has to be split across several forward passes, at a minor accuracy cost.[^5] Grounding DINO T reports 8.37 FPS against GLIP-T's 6.11 in its own comparison, with fewer parameters (172M against 232M).[^6] OWL-ViT sits at the other end of this trade: by never fusing, it encodes each query once and scores thousands per image, which is what let it run all 1,203 LVIS names against every image.[^1] The fused models buy grounding quality with passes; the unfused one buys scale by giving up the chance for the image features to know what they are being asked about."
    },
    {
      "type": "p",
      "text": "**False positives.** The last limitation is the one the Grounding DINO authors wrote into their paper's own limitations paragraph. Beyond noting that the model cannot do segmentation and was trained on less data than the largest GLIP, they state: \"we find that our model will produce false positive results in some cases, which may need more techniques or data to reduce the hallucination.\"[^6] A model that accepts any sentence as a class will sometimes find something that answers to it, whether or not the thing is there."
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        { "title": "Minderer et al., Simple Open-Vocabulary Object Detection with Vision Transformers (OWL-ViT), ECCV 2022", "url": "https://arxiv.org/abs/2205.06230" },
        { "title": "Gupta, Dollár, and Girshick, LVIS: A Dataset for Large Vocabulary Instance Segmentation, CVPR 2019", "url": "https://arxiv.org/abs/1908.03195" },
        { "title": "National Transportation Safety Board, Collision Between Vehicle Controlled by Developmental Automated Driving System and Pedestrian, Tempe, Arizona, March 18, 2018, Highway Accident Report NTSB/HAR-19/03", "url": "https://www.ntsb.gov/investigations/AccidentReports/Reports/HAR1903.pdf" },
        { "title": "Radford et al., Learning Transferable Visual Models From Natural Language Supervision (CLIP), 2021", "url": "https://arxiv.org/abs/2103.00020" },
        { "title": "Li et al., Grounded Language-Image Pre-training (GLIP), CVPR 2022", "url": "https://arxiv.org/abs/2112.03857" },
        { "title": "Liu et al., Grounding DINO: Marrying DINO with Grounded Pre-Training for Open-Set Object Detection, 2023", "url": "https://arxiv.org/abs/2303.05499" }
      ]
    }
  ]
};
