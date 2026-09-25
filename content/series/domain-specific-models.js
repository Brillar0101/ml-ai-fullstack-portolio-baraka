// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx.
// Every factual claim is taken from the numbered sources at the end.
// The pairwise-ranking figure is reproduced under CC BY 4.0 (arXiv 2305.09617).
// The two charts are redrawn from numbers reported in arXiv 2212.13138,
// 2305.09617 and 2311.16452.
export const POST = {
  id: 'domain-specific-models',
  title: 'What Specializing a Model for Medicine Measurably Bought',
  excerpt: 'Flan-PaLM passed a medical licensing exam benchmark, yet clinicians judged only 61.9% of its answers to match scientific consensus. Med-PaLM, Med-PaLM 2 and Medprompt show what specialization changes, and which yardstick each result was measured with.',
  category: 'AI',
  tags: ['Domain models', 'Medical AI', 'Evaluation'],
  seriesNum: 33,
  publishAt: '2026-06-28T12:00:00Z',
  body: [
    {
      type: 'p',
      text: "In December 2022 a Google team asked a panel of clinicians to rate answers to 140 consumer health questions, most of them drawn from what people type into search engines, without being told who wrote each answer. For answers from Flan-PaLM, a 540 billion parameter general model tuned to follow instructions, the clinicians judged only 61.9% to be aligned with scientific consensus. For answers written by clinicians the figure was 92.9%. The same raters judged 29.7% of Flan-PaLM's answers as potentially leading to harm, against 5.7% of the clinicians' answers.[^1]",
    },
    {
      type: 'p',
      text: "The same model had just set a record on MedQA, a set of multiple-choice questions in the style of the US Medical Licensing Examination, with 67.6% accuracy.[^1] So one model, in one paper, looked strong by one yardstick and unsafe by another. A version of Flan-PaLM adapted with 40 clinician-written examples, called Med-PaLM, reached 92.6% consensus alignment on the same questions.[^1] This post follows that thread. It asks what adapting a model to a specialized field buys, and it keeps asking which yardstick each result was measured with.",
    },
    {
      type: 'h2',
      text: 'A licensing-exam record that clinicians did not trust',
    },
    {
      type: 'p',
      text: "Before large general models, the standard answer to \"medicine needs its own model\" was **domain pretraining**. Pretraining is the first, largest stage of training, where a model learns to predict text from a big corpus. Domain pretraining means that corpus comes from the field itself. Gu and colleagues at Microsoft showed that for biomedicine, where unlabeled text is abundant, pretraining a BERT model from scratch on biomedical text gave substantial gains over continuing to pretrain a general-domain model. It also gave the model a vocabulary built from biomedical words.[^4] The resulting model, PubMedBERT, set new records on their biomedical benchmark.[^4]",
    },
    {
      type: 'p',
      text: "Scale changed that picture on multiple-choice exams. The Med-PaLM paper lists prior MedQA results next to its own: PubMedBERT with 100 million parameters scored 38.1%, a 2.7 billion parameter model called PubMedGPT, one of the biomedical models pretrained on domain text, scored 50.3%, and the general Flan-PaLM scored 67.6%, beating the previous best by more than 17%.[^1,3] The Medprompt authors put it plainly: first-generation models got a clear advantage from domain-specific pretraining, but it was unclear whether that still held for modern models pretrained at much larger scale.[^3]",
    },
    {
      type: 'p',
      text: "Flan-PaLM reached its score through prompting, not medical training. It combined three prompting strategies. **Few-shot prompting** places a handful of solved examples in front of the question. **Chain-of-thought** makes those examples include step-by-step reasoning, so the model writes its own reasoning before answering. **Self-consistency** samples several reasoning paths and takes the majority answer.[^1] For scale, the USMLE website says examinees must answer roughly 60% of questions correctly to pass.[^6]",
    },
    {
      type: 'p',
      text: "The Med-PaLM authors did not treat the exam score as the finish line. Their argument was that multiple-choice accuracy is a robust measure but omits important details. A model answering a real person writes paragraphs, not a letter from A to E. Existing benchmarks, they wrote, were limited to classification accuracy or automated text-overlap metrics like BLEU, which do not allow the detailed analysis needed for clinical use.[^1] The reference answers bundled with some datasets came from inconsistent sources, sometimes automated tools or librarians, so scoring model text against them would not measure clinical quality either.[^1]",
    },
    {
      type: 'h2',
      text: 'Twelve questions a clinician asks of an answer',
    },
    {
      type: 'p',
      text: "The replacement was a rubric, built with focus groups and interviews with clinicians in the UK, US and India. It has twelve items. Raters say whether an answer agrees with scientific and clinical consensus, how severe any possible harm would be and how likely it is, whether there is evidence of correct or incorrect reading comprehension, recall of knowledge and reasoning, whether the answer includes content it should not or omits content it should, and whether it contains information that is inapplicable or inaccurate for a particular demographic.[^1] Two more axes went to lay raters without medical training: does the answer address the intent of the question, and is it helpful.[^1]",
    },
    {
      type: 'p',
      text: "The harm items borrowed their severity options from the AHRQ Common Formats, a scale that runs from death through severe, moderate and mild harm to none. The authors note that even in hospital settings, where the context of a harm is known in detail, physicians vary a lot in how they rate severity, so their own ratings should be read as subjective estimates.[^1] The evaluation set was 100 questions from HealthSearchQA, a new dataset of 3,375 commonly searched consumer questions, plus 20 each from LiveQA and MedicationQA. A panel of nine clinicians rated the answers, one clinician per answer, blind to the source.[^1]",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'MultiMedQA', def: 'the benchmark the Med-PaLM paper assembled: six existing medical question sets (exam, research and consumer questions) plus the new HealthSearchQA.' },
        { term: 'Instruction tuning', def: 'further training a pretrained model on many tasks phrased as instructions, so it follows instructions better. Flan-PaLM is PaLM after this step.' },
        { term: 'Soft prompt', def: 'a short sequence of learned vectors placed before the input. They sit where word embeddings would go but do not correspond to any words, and they are trained by backpropagation while the model stays frozen.' },
        { term: 'Instruction prompt tuning', def: 'the Med-PaLM method: a soft prompt learned from clinician-written examples, placed in front of an ordinary text prompt of instructions and examples.' },
      ],
    },
    {
      type: 'h2',
      text: 'Forty examples and 1.84 million trainable parameters',
    },
    {
      type: 'p',
      text: "Retraining a 540 billion parameter model on medical text was not what the team did. They chose **prompt tuning** because of compute cost and the cost of getting clinicians to write data.[^1] Prompt tuning, from Lester and colleagues, freezes the whole model and learns only a soft prompt. Lester's experiments found that as models grow past billions of parameters, this matches the quality of tuning every weight.[^5] Med-PaLM's variant keeps the ordinary text prompt too: the learned vectors come first, then the hand-written instructions and examples, then the question.[^1]",
    },
    {
      type: 'diagram',
      rows: [
        [{ label: '100 learned soft-prompt vectors', detail: 'the only trained part: 1.84M parameters' }],
        [{ label: 'Text prompt', detail: 'instructions and few-shot examples, as before' }],
        [{ label: 'The consumer question', detail: 'e.g. from HealthSearchQA' }],
        [{ label: 'Flan-PaLM 540B, frozen', detail: 'no weights change' }],
      ],
      caption: 'How Med-PaLM builds each input, per Section 3.3.3 and Appendix A.1 of Singhal et al., 2022.[^1] The soft prompt is shared across the medical datasets; the text prompt stays task specific.',
    },
    {
      type: 'p',
      text: "The training data was tiny. Five clinicians in the US and UK wrote exemplar answers to sampled consumer questions, then threw out pairs where they could not write an ideal answer, for instance when the needed information was not known. That left 40 examples.[^1] The soft prompt was 100 vectors long. With PaLM's embedding size of 18,432, that is 1.84 million trainable parameters, trained for 200 steps. The team did not pick the final checkpoint by an automatic metric; a clinician ranked answers on held-out questions, because automatic scores on long answers may not track human judgment.[^1]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Clinician ratings of long-form answers, 140 consumer questions',
      yLabel: '% of answers',
      series: [
        { label: 'Flan-PaLM', key: 'flan', baseline: true },
        { label: 'Med-PaLM', key: 'med' },
        { label: 'Clinician', key: 'doc' },
      ],
      data: [
        { label: 'Aligned with consensus', values: { flan: 61.9, med: 92.6, doc: 92.9 } },
        { label: 'Possibly harmful', values: { flan: 29.7, med: 5.9, doc: 5.7 } },
        { label: 'Missing content', values: { flan: 47.2, med: 15.1, doc: 11.1 } },
        { label: 'Incorrect content', values: { flan: 16.1, med: 18.7, doc: 1.4 } },
      ],
      caption: 'Redrawn from Figure 6 and Section 4.5 of Singhal et al., 2022.[^1] Higher is better only for the first group. The paper reports slightly different Med-PaLM and clinician figures in different places (92.6% vs 92.9% consensus for Med-PaLM; 5.8% and 6.5% harm in the introduction); the chart uses Figure 6 for consensus and the Section 4.5 text for harm.',
    },
    {
      type: 'p',
      text: "Most axes moved toward the clinicians. Evidence of correct knowledge recall rose from 76.3% of Flan-PaLM answers to 95.4% for Med-PaLM, against 97.8% for clinicians. Answers missing important information fell from 47.2% to 15.1%.[^1] One axis went the wrong way. Answers with inappropriate or incorrect content rose from 16.1% to 18.7%, while clinicians were at 1.4%. The authors suggest a reason: the tuned model writes more detailed answers, which cuts omissions but gives more room for wrong content.[^1] Even so, the headline in the abstract is careful. Med-PaLM \"performs encouragingly, but remains inferior to clinicians.\"[^1]",
    },
    {
      type: 'h2',
      text: 'Med-PaLM 2 changed the recipe and the test',
    },
    {
      type: 'p',
      text: "The follow-up, in May 2023, changed three things at once, which matters when reading its gains. It started from a stronger base model, PaLM 2. It replaced the soft prompt with full instruction finetuning on the training splits of MultiMedQA: about 10,000 MedQA and 183,000 MedMCQA questions plus 64 long-form consumer answers, mixed in empirically chosen ratios. And it added a prompting method called **ensemble refinement**: the model samples several reasoning paths, then reads all of them and writes a refined answer, and the final answer is a vote over many such refinements.[^2] On multiple choice that used 11 samples in the first stage and 33 in the second.[^2]",
    },
    {
      type: 'p',
      text: "The unified Med-PaLM 2 scored 85.4% on MedQA with ensemble refinement. The best figure, 86.5%, came from a separate variant finetuned only on MedQA and not aligned for consumer answers.[^2] Med-PaLM had scored 67.2% on the same benchmark.[^2]",
    },
    {
      type: 'p',
      text: "The human evaluation grew too, because the old one had stopped telling models apart. On the same 140 questions, physicians rated Med-PaLM 2 as generally comparable to both physicians and Med-PaLM, and the authors say that analysis was underpowered for the differences they saw.[^2] So they added **pairwise ranking**: a rater sees two anonymous answers to the same question, in random order, and picks the better one, or a tie, on each of nine axes. Physicians from a pool of fifteen in the US, UK and India ranked answers to 1,066 consumer questions.[^2]",
    },
    {
      type: 'image',
      src: '/blog-images/domain-specific-models/medpalm2-pairwise.webp',
      alt: 'Horizontal stacked bars comparing Med-PaLM 2 and physician answers on nine axes. Med-PaLM 2 is preferred on consensus, comprehension, knowledge recall and reasoning, and is chosen as more inaccurate or irrelevant about a quarter of the time, more than physicians.',
      width: 860,
      height: 760,
      caption: 'Figure 1 (right panel) from Singhal et al., 2023,[^2] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Physicians ranking Med-PaLM 2 against physician answers on 1,066 questions. On the risk rows, a shorter bar is better for that source.',
    },
    {
      type: 'p',
      text: "Physicians picked Med-PaLM 2's answer as better reflecting consensus 72.9% of the time, physicians' answers 11.8% of the time, and called 15.3% a tie. The model was preferred on eight of nine axes.[^2] The ninth is the same axis that got worse for Med-PaLM: raters flagged Med-PaLM 2's answer as containing more inaccurate or irrelevant information 26.6% of the time, against 14.1% for the physician's answer.[^2] Med-PaLM 2's answers were also much longer, a median of 794 characters against 337.5 for physicians, and the authors list length as something that may have helped its ratings.[^2] On 240 adversarial questions written to draw out harmful or biased answers, 90.6% of Med-PaLM 2's answers were rated low risk of harm, against 79.4% for Med-PaLM.[^2]",
    },
    {
      type: 'h2',
      text: 'Medprompt: GPT-4, no medical training, a higher exam score',
    },
    {
      type: 'p',
      text: "In November 2023 a Microsoft team asked whether any of this medical tuning was needed. Their earlier study had shown GPT-4 passing the USMLE by over 20 points with simple prompting and no special training.[^6] The new paper searched systematically for better prompts and settled on three general-purpose parts, which together they called **Medprompt**.[^3]",
    },
    {
      type: 'ul',
      items: [
        "Dynamic few-shot: for each test question, embed it, find the most similar questions in the training set by k-nearest neighbors, and use those as the examples.[^3]",
        "Self-generated chain-of-thought: ask GPT-4 to write the reasoning for each training example itself, and discard any example where its reasoning ends at the wrong answer.[^3]",
        "Choice-shuffle ensemble: run the question several times with the answer options in different orders and take the most common answer, which also counters the model's preference for certain option positions.[^3]",
      ],
    },
    {
      type: 'p',
      text: "Nothing in the pipeline is medical, and no clinician wrote any of its reasoning examples. With 5 retrieved examples and 5 ensemble calls, GPT-4 reached 90.2% on MedQA, against Med-PaLM 2's best of 86.5%. With 20 examples and 11 calls it reached 90.6%.[^3] The authors call this a 27% cut in error rate over the best specialist result, and note that Med-PaLM 2's scheme used 44 model calls per question.[^3] Medprompt set the top score on all nine MultiMedQA multiple-choice datasets. On MMLU professional medicine it only tied Med-PaLM 2, at 95.2%.[^3]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'MedQA (USMLE-style) accuracy, as reported',
      yLabel: 'Accuracy (%)',
      series: [{ label: 'Accuracy', key: 'a' }],
      data: [
        { label: 'PubMedBERT', values: { a: 38.1 } },
        { label: 'Flan-PaLM', values: { a: 67.6 } },
        { label: 'Med-PaLM', values: { a: 67.2 } },
        { label: 'GPT-4 5-shot', values: { a: 81.4 } },
        { label: 'Med-PaLM 2 best', values: { a: 86.5 } },
        { label: 'GPT-4 Medprompt', values: { a: 90.2 } },
      ],
      caption: 'Redrawn from Table 4 of Singhal et al., 2022,[^1] the abstract and Table 4 of Singhal et al., 2023,[^2] and Table 1 of Nori et al., 2023.[^3] Only PubMedBERT was pretrained on domain text. Med-PaLM and Med-PaLM 2 were adapted with medical data. Flan-PaLM and the GPT-4 rows had no medical training step in these papers.',
    },
    {
      type: 'p',
      text: "The paper tests its own result for overfitting. Choosing a prompt strategy is like tuning a hyperparameter, so before starting they hid a random 20% of each dataset, which they call eyes-off, and only scored it at the end. Average accuracy was 90.6% on the data they had worked with and 91.3% on the hidden data.[^3] Adding the parts one at a time on MedQA moved accuracy from 81.7% with a zero-shot prompt to 83.9%, 87.3%, 88.4% and finally 90.2%. Self-generated reasoning was the largest single step.[^3] In a direct comparison with fixed examples, GPT-4's own reasoning chains scored 86.9%, while the expert-written chains from the Med-PaLM 2 paper scored 83.8%.[^3]",
    },
    {
      type: 'callout',
      title: 'Read the comparison conditions',
      text: "Medprompt's table notes that the Med-PaLM numbers are \"choose best\": for each dataset, the best of several strategies tried. Every GPT-4 number uses one strategy across all datasets.[^3] Med-PaLM 2 was also finetuned on subsets of these benchmarks.[^3] Both conditions, if anything, favor Med-PaLM 2. But the comparison covers multiple-choice accuracy only. Medprompt did not run the physician rubric or the pairwise ranking, and the authors say they did not test their proposed extensions to open-ended answers.[^3]",
    },
    {
      type: 'h2',
      text: 'Where the two results actually meet',
    },
    {
      type: 'p',
      text: "Put side by side, the papers make a narrower claim than the headline race suggests. Medprompt shows that a strong general model, prompted well, beats a finetuned specialist on the multiple-choice yardstick. The Med-PaLM paper built its whole evaluation on the argument that this yardstick was not enough for medicine. Its own evidence supports that: Flan-PaLM set the MedQA record and still had 29.7% of its answers flagged as potentially harmful.[^1] Nothing in the Medprompt paper measures consensus, harm or omissions in long answers. So the two results never meet on the same axis.",
    },
    {
      type: 'p',
      text: "One finding does cross over. In both lines of work, the example-writing that most people picture as expert work turned out to be replaceable or small. Med-PaLM needed 40 clinician answers and 1.84 million parameters to move its consensus score by about 30 points.[^1] Medprompt's model-written reasoning beat clinician-crafted reasoning on the exam by 3.1 points.[^3] The Med-PaLM 2 variant tuned only on MedQA scored 86.5% and was, in the paper's words, \"not aligned for consumer medical question answering.\"[^2] That trade shows up inside a single paper.",
    },
    {
      type: 'h2',
      text: "The author's reading: when specializing is worth paying for",
    },
    {
      type: 'p',
      text: "What follows is my interpretation of these papers, not a finding any of them states.",
    },
    {
      type: 'p',
      text: "If your task has a checkable answer, like picking the right option, extracting a code or labeling a document, start with the strongest general model and invest in prompting. Retrieved examples, model-written reasoning and ensembling are cheap to try, and on MedQA they took GPT-4 from 81.7% to 90.2% without touching a weight.[^3] Domain pretraining from scratch made sense when models were small.[^4] These results give little reason to expect it to pay for a question-answering task at today's scale.",
    },
    {
      type: 'p',
      text: "If the output is open-ended text that an expert will judge on safety, completeness and fit, the evidence points the other way, and cheaply. Med-PaLM's largest measured gains came on exactly the axes an exam cannot see, from 40 carefully filtered expert examples and a parameter-efficient method.[^1] What seems worth paying for is not a medical model as such. It is expert time: writing a small set of ideal answers, and above all rating outputs on a rubric like the twelve-item one. Without that rating step, you cannot tell which of these approaches worked for your task. The highest exam score in this post belongs to the one system whose answers no physician rated.",
    },
    {
      type: 'p',
      text: "Specialization is not free on the rubric either. Med-PaLM and Med-PaLM 2 both wrote longer answers than what they were compared with, both omitted less, and both did worse than physicians on incorrect or irrelevant content.[^1,2] Any specialized model should be checked for that trade, not just for its headline score.",
    },
    {
      type: 'h2',
      text: 'The limitation Medprompt states about its own score',
    },
    {
      type: 'p',
      text: "The Medprompt authors are explicit that their results cannot be taken to demonstrate real-world efficacy. Competency exams framed as multiple-choice questions, they write, do not capture the range and complexity of tasks that healthcare professionals face in actual practice.[^3] They also raise a risk that applies to every method in this post. Better prompting may reduce hallucinations and raise accuracy, but it may also make the remaining hallucinations even harder to detect.[^3] The Med-PaLM 2 authors add their own caveat. Their adversarial questions are limited in scope and should not be read as a complete assessment of safety, bias and equity.[^2]",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Singhal et al., 2022. Large Language Models Encode Clinical Knowledge (Med-PaLM). arXiv:2212.13138', url: 'https://arxiv.org/abs/2212.13138' },
        { title: 'Singhal et al., 2023. Towards Expert-Level Medical Question Answering with Large Language Models (Med-PaLM 2). arXiv:2305.09617', url: 'https://arxiv.org/abs/2305.09617' },
        { title: 'Nori et al., 2023. Can Generalist Foundation Models Outcompete Special-Purpose Tuning? Case Study in Medicine (Medprompt). arXiv:2311.16452', url: 'https://arxiv.org/abs/2311.16452' },
        { title: 'Gu et al., 2021. Domain-Specific Language Model Pretraining for Biomedical Natural Language Processing (PubMedBERT). arXiv:2007.15779', url: 'https://arxiv.org/abs/2007.15779' },
        { title: 'Lester, Al-Rfou and Constant, 2021. The Power of Scale for Parameter-Efficient Prompt Tuning. arXiv:2104.08691', url: 'https://arxiv.org/abs/2104.08691' },
        { title: 'Nori et al., 2023. Capabilities of GPT-4 on Medical Challenge Problems. arXiv:2303.13375', url: 'https://arxiv.org/abs/2303.13375' },
      ],
    },
  ],
};
