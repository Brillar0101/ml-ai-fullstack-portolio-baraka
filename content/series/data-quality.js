// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled in src/data/seriesPosts.js. Every factual claim is taken from the
// numbered sources at the end. Both charts are redrawn from reported numbers:
// the arXiv papers here carry the arXiv non-exclusive license and the CHI paper
// is ACM copyright, so no figures are reproduced.
export const POST = {
  "id": "data-quality",
  "title": "When the test labels are wrong: label errors, data cascades, and datasheets",
  "excerpt": "In 2021 a team checked ten widely used test sets and estimated that at least 3.3% of their labels are wrong on average, about 6% for ImageNet. Correct them and smaller models start beating bigger ones. How those errors were found, how data problems compound in deployed systems, and what documenting a dataset asks of you.",
  "category": "ML",
  "chapter": "Chapter 8",
  "tags": [
    "Data",
    "Dataset Engineering",
    "Evaluation"
  ],
  "seriesNum": 14,
  "publishAt": "2026-03-04T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In 2021 Curtis Northcutt, Anish Athalye and Jonas Mueller went looking for wrong labels in the test sets of ten of the most used datasets in machine learning, covering images, text and audio. They estimated an average of at least 3.3% label errors across the ten. In the ImageNet validation set, which most papers use as ImageNet's test set because the real test labels are not public, they found 2,916 errors, about 6% of its 50,000 images. For QuickDraw they estimated more than 5 million errors, about 10%.[^1]"
    },
    {
      "type": "p",
      "text": "The more uncomfortable result came next. When they corrected the labels and looked again at which models were best, the answer depended on how much bad data was in the test set. On ImageNet with corrected labels, ResNet-18 outperforms ResNet-50 if the share of originally mislabeled test examples rises by just 6%. On CIFAR-10, VGG-11 outperforms VGG-19 if that share rises by just 5%.[^1] In both pairs the model with fewer parameters, the one that looks worse on the standard leaderboard, becomes the better choice. The authors' conclusion: lower capacity models may be practically more useful than higher capacity ones on real datasets with a high proportion of wrong labels.[^1]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Estimated share of wrong labels in each test set",
      "yLabel": "% of test labels in error",
      "series": [
        { "label": "% error", "key": "e" }
      ],
      "data": [
        { "label": "MNIST", "values": { "e": 0.15 } },
        { "label": "CIFAR-10", "values": { "e": 0.54 } },
        { "label": "20news", "values": { "e": 1.09 } },
        { "label": "AudioSet", "values": { "e": 1.35 } },
        { "label": "Caltech-256", "values": { "e": 1.54 } },
        { "label": "IMDB", "values": { "e": 2.9 } },
        { "label": "Amazon", "values": { "e": 3.9 } },
        { "label": "ImageNet", "values": { "e": 5.83 } },
        { "label": "CIFAR-100", "values": { "e": 5.85 } },
        { "label": "QuickDraw", "values": { "e": 10.12 } }
      ],
      "caption": "Redrawn from Table 1 of Northcutt, Athalye and Mueller, 2021.[^1] Values count only errors that humans confirmed, so they are lower bounds. QuickDraw and Amazon Reviews were checked on random samples and extrapolated; the others had every flagged example checked. The mean of the ten is the paper's 3.3%."
    },
    {
      "type": "p",
      "text": "Simpler datasets, and ones built with careful labeling and curation, had fewer errors than ones collected more automatically, the paper notes.[^1]"
    },
    {
      "type": "h2",
      "text": "Two accuracies, and why they disagree"
    },
    {
      "type": "p",
      "text": "To talk about what a wrong label does to a benchmark, the paper separates a few quantities that normally get lumped together as \"test accuracy.\"[^1]"
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Original accuracy",
          "def": "the share of test examples where the model's prediction matches the label that shipped with the dataset. This is the number everyone reports."
        },
        {
          "term": "Corrected accuracy",
          "def": "the same measurement after humans have fixed the wrong labels, and removed the examples that have no clear right label. The paper argues this is the one that reflects real use."
        },
        {
          "term": "Correctable set",
          "def": "the flagged test examples where human reviewers agreed on a label different from the original one. These are clear mistakes with a clear fix."
        },
        {
          "term": "Noise prevalence",
          "def": "the correctable set as a fraction of the test data that remains after the ambiguous examples are dropped. For ImageNet this starts at about 2.9%."
        }
      ]
    },
    {
      "type": "p",
      "text": "On the full ImageNet validation set, fixing the labels barely moves the leaderboard. The authors compared 34 pretrained models and found benchmark conclusions \"largely unchanged\" once errors were removed.[^1] The disagreement shows up on the correctable set, the examples whose labels were wrong. There, models that score best against the original labels score worst against the corrected ones. NASNet-large drops from rank 1 of 34 to rank 29. ResNet-18 rises from rank 34 to rank 1.[^1] The same pattern held across 13 pretrained CIFAR-10 models.[^1]"
    },
    {
      "type": "p",
      "text": "On the mislabeled images, NASNet agrees with the wrong label more often than ResNet-18 does. It has learned to reproduce the mistakes the original annotators made. The paper points out that this is not overfitting in the usual sense, since every number comes from held-out test data.[^1] The authors offer two explanations: smaller models may resist learning the lopsided pattern of label noise, and newer, larger architectures were tuned for years against the original test accuracy, so they may have absorbed the original annotators' quirks.[^1] Mistakes like these are systematic rather than random. A tiger is more likely to be mislabeled a cheetah than a CD player, as the paper puts it,[^1] so a flexible enough model can learn them."
    },
    {
      "type": "p",
      "text": "At 2.9%, the correctable set is too small to flip the overall ranking. To see what happens in a messier dataset, the authors built smaller test sets by randomly deleting correctly labeled examples, which raises the noise prevalence while keeping the same errors.[^1] On ImageNet, the ResNet-50 and ResNet-18 lines cross at a noise prevalence of 9% when scored on corrected labels. That crossing is the \"6%\" in the opening: from 2.9% to 9%.[^1] Past that point, a team picking a model by standard test accuracy would ship the one that is worse on the true labels. The authors add that datasets collected for a specific application are often noisier than these curated benchmarks,[^1] which suggests, in my reading, that many real projects are already past the crossing point."
    },
    {
      "type": "h2",
      "text": "Finding 2,916 bad labels without reading 50,000"
    },
    {
      "type": "p",
      "text": "Checking every label by hand is too expensive at this scale. The team used an algorithm to shortlist likely errors first, then sent only the shortlist to people. That filter often cut the number of examples needing human review by as much as 90%.[^1] The algorithm is confident learning, described in an earlier paper by Northcutt, Lu Jiang and Isaac Chuang.[^2]"
    },
    {
      "type": "p",
      "text": "Confident learning needs two inputs for every example: the label it was given, and a model's predicted probability for each class. The probabilities must be out of sample, meaning the model never trained on that example. For test sets, the team pretrained on the training set and then fine-tuned on the test set with cross-validation, so each test example's probabilities came from a model that had not seen it.[^1] It also assumes the noise is class-conditional: the chance a label is wrong depends on the true class, not on the particular image.[^1]"
    },
    {
      "type": "p",
      "text": "The first step sets a threshold for each class. Call the given (possibly wrong) label \\(\\tilde{y}\\) and the unknown true label \\(y^*\\). For class \\(j\\), the threshold \\(t_j\\) is the model's average confidence in class \\(j\\) over all examples labeled \\(j\\):[^2]"
    },
    {
      "type": "eq",
      "tex": "t_j = \\frac{1}{|X_{\\tilde{y}=j}|} \\sum_{x \\in X_{\\tilde{y}=j}} \\hat{p}(\\tilde{y}=j;\\, x, \\theta)",
      "caption": "Per-class threshold, equation 2 of Northcutt, Jiang and Chuang.[^2]"
    },
    {
      "type": "p",
      "text": "Term by term: \\(X_{\\tilde{y}=j}\\) is the set of examples whose given label is \\(j\\), and the bars mean \"how many.\" \\(\\hat{p}(\\tilde{y}=j; x, \\theta)\\) is the probability that model \\(\\theta\\) assigns to class \\(j\\) for example \\(x\\). So \\(t_j\\) is a plain average: how sure the model usually is about class \\(j\\) when the label says \\(j\\). Each class gets its own bar, which the authors argue makes the method robust when a model is overconfident about some classes and timid about others, or when classes are imbalanced.[^2]"
    },
    {
      "type": "p",
      "text": "The second step counts. An example labeled \\(i\\) is counted as probably truly \\(j\\) if its probability for \\(j\\) clears \\(t_j\\). If it clears the bar for several classes, it goes to the one with the highest probability. The counts form an \\(m \\times m\\) table for \\(m\\) classes, called the confident joint:[^2]"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} C_{\\tilde{y},y^*}[i][j] = |\\hat{X}_{\\tilde{y}=i,\\,y^*=j}| \\\\[4pt] \\hat{X}_{\\tilde{y}=i,\\,y^*=j} = \\{\\, x \\in X_{\\tilde{y}=i} : \\\\ \\hat{p}(\\tilde{y}=j;\\, x, \\theta) \\ge t_j \\,\\} \\end{gathered}",
      "caption": "The confident joint, simplified from equation 1 of Northcutt, Jiang and Chuang,[^2] which also resolves ties by taking the most probable class."
    },
    {
      "type": "p",
      "text": "Row \\(i\\), column \\(j\\) says how many examples labeled \\(i\\) look confidently like \\(j\\). The diagonal holds examples whose label and prediction agree. The table is then rescaled so each row sums to that label's observed share of the data and the whole table sums to 1, which turns it into \\(\\hat{Q}\\), an estimate of the joint distribution of given and true labels.[^2] The diagonal of \\(\\hat{Q}\\) is the probability that an example is labeled correctly, so the estimated fraction of errors is:[^1]"
    },
    {
      "type": "eq",
      "tex": "\\rho = 1 - \\sum_{i=1}^{m} \\hat{Q}_{\\tilde{y}=i,\\,y^*=i}",
      "caption": "Estimated error fraction, from Section 3 of Northcutt, Athalye and Mueller.[^1] The number of suspected errors is \\(\\rho \\cdot n\\) for a test set of \\(n\\) examples."
    },
    {
      "type": "p",
      "text": "To decide which \\(\\rho \\cdot n\\) examples to flag, they are ranked by normalized margin: the probability of the given label minus the largest probability of any other class. The most negative margins, where the model strongly prefers another class, come first.[^1]"
    },
    {
      "type": "p",
      "text": "Then came people. On Mechanical Turk, each flagged example went to five workers, who saw the image along with the given label and the algorithm's suggested label and said which applied: one, the other, both, or neither. An example counted as an error if fewer than three of the five agreed with the given label.[^1] On average across datasets, 51% of the flagged candidates turned out to be real errors.[^1] The paper sorts the errors into four kinds: correctable, where most workers agreed on the suggested label; multi-label, where both labels fit; neither, where no offered label fit; and non-agreement, where there was no majority.[^1] Of ImageNet's 2,916 errors, 1,428 were correctable.[^1]"
    },
    {
      "type": "p",
      "text": "The method has blind spots, and the paper shows them. It flagged some correctly labeled but hard images: a close crop of part of an old sewing machine, a view of a runway from inside an airplane cockpit.[^1] And it misses errors it never flags. For ImageNet the team ran an expert review of 1,934 images, one flagged and one unflagged image per class where possible. A flagged image was 2.6 times as likely to be mislabeled as an unflagged one. But about 16% of the unflagged images were also mislabeled, and since 89% of images were never flagged, the authors estimate the ImageNet validation set contains closer to 20% label errors, not 6%.[^1] The headline numbers are floors. The corrected labels are public, with a browsable gallery of the errors.[^5,6]"
    },
    {
      "type": "h2",
      "text": "How data problems compound after deployment"
    },
    {
      "type": "p",
      "text": "A benchmark with bad labels misleads you about which model to ship. In a deployed system the damage can run longer, and the same year a Google Research team documented how. Nithya Sambasivan and colleagues interviewed 53 AI practitioners between May and July 2020, working on high-stakes applications in India (23), the US (16) and East and West African countries (14), in areas like maternal health, cancer diagnosis, credit, landslide detection and wildlife conservation.[^3]"
    },
    {
      "type": "p",
      "text": "They named what they found a **data cascade**: \"compounding events causing negative, downstream effects from data issues, that result in technical debt over time.\"[^3] Of the 53 practitioners, 92% reported at least one cascade, and 45.3% reported two or more in a given project.[^3] Cascades usually started upstream, at data collection or labeling, and showed up downstream, in evaluation or deployment. They were opaque: there were no clear tools or metrics to detect them, so practitioners fell back on proxy metrics such as accuracy or F1, which score the whole system rather than the data.[^3] The worst took two to three years to surface.[^3]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Share of practitioners reporting each cascade",
      "yLabel": "% of 53 practitioners",
      "series": [
        { "label": "% of practitioners", "key": "p" }
      ],
      "data": [
        { "label": "Physical world brittleness", "values": { "p": 54.7 } },
        { "label": "Too little domain expertise", "values": { "p": 43.4 } },
        { "label": "Conflicting rewards", "values": { "p": 32.1 } },
        { "label": "Poor documentation", "values": { "p": 20.8 } }
      ],
      "caption": "Redrawn from Table 2 of Sambasivan et al., 2021.[^3] Percentages are of participants who self-reported the cascade in interviews; one person could report several, so they do not sum to 100."
    },
    {
      "type": "p",
      "text": "The four cascades have distinct triggers.[^3] The most common came from the physical world: models trained on clean data met messy live data from cameras and sensors. In a road safety project in India, the slightest movement of a camera due to weather caused failures in detecting traffic violations. These cascades took the longest to show up, almost always in production, and ended in complete model failures and abandoned projects.[^3]"
    },
    {
      "type": "p",
      "text": "The second came from practitioners making data decisions outside their expertise: defining ground truth, choosing features, deciding what to discard. In one wildlife project, patrollers disputed a deployed model's predicted poaching locations, and the team learned that most poaching attacks were missing from the data.[^3] The third came from conflicting incentives. Data collection was often added on top of field partners' existing jobs, such as nurses, patrollers and farmers, without adequate pay for the new tasks, and some lost the motivation to do it well. One conservation dataset broke because collectors forgot to reset a GPS app, which then logged every hour instead of every five minutes. \"Then it is useless, and it messes up my whole ML algorithm,\" the practitioner said.[^3]"
    },
    {
      "type": "p",
      "text": "The fourth, at 20.8%, is the one this post cares most about: poor documentation across organizations. Inherited datasets lacked metadata, so practitioners guessed, and guesses led to discarded or re-collected data. In a US medical robotics project, missing metadata and collaborators changing the schema without context cost four months of data collection.[^3] Practitioners said metadata on equipment, origin, weather, time and collection process was what they needed to judge quality and fitness for a use. The counterexample came from an aquaculture team who wrote a data curation plan before a rare collection trip and kept detailed field notes. A note recording the time of a lunch break later saved a large part of their dataset when they were diagnosing a data problem.[^3]"
    },
    {
      "type": "p",
      "text": "The paper's title quote comes from a healthcare practitioner in India: \"Everyone wants to do the model work, not the data work.\"[^3] The authors link cascades to that attitude. Data work was seen as operational, hard to track and rarely rewarded, while models brought publications and careers.[^3] In my reading, the Northcutt result is the same pattern in the benchmark world: years of architecture work were measured against labels nobody had rechecked."
    },
    {
      "type": "h2",
      "text": "What a datasheet asks you to write down"
    },
    {
      "type": "p",
      "text": "The prevention with the clearest written form is older than both studies. In 2018 Timnit Gebru and six coauthors proposed **datasheets for datasets**.[^4] The idea comes from electronics, where every component, however simple, ships with a datasheet listing its operating characteristics, test results and recommended usage. A dataset, they argued, should ship with a document covering its motivation, composition, collection process, recommended uses, and so on.[^4] It has two audiences. For the people who create a dataset, writing it forces careful reflection on assumptions, risks and implications. For the people who use it, it provides what they need to pick an appropriate dataset and avoid misusing it.[^4]"
    },
    {
      "type": "p",
      "text": "The questions were refined over roughly two years. The authors tested them on datasheets for two public datasets and with product teams at two large US technology companies, and had lawyers review them.[^4] Along the way they reworded questions to discourage yes or no answers.[^4] The final set is grouped into seven stages: motivation, composition, collection process, preprocessing and cleaning and labeling, uses, distribution, and maintenance.[^4] Several of the questions read like direct answers to the failures above:[^4]"
    },
    {
      "type": "ul",
      "items": [
        "\"Are there any errors, sources of noise, or redundancies in the dataset?\" This is the question Northcutt's team answered for ten test sets after the fact.",
        "\"Are there recommended data splits (e.g., training, development/validation, testing)?\" with the rationale behind them.",
        "\"What mechanisms or procedures were used to collect the data (e.g., hardware apparatuses or sensors, manual human curation, software programs, software APIs)? How were these mechanisms or procedures validated?\"",
        "\"Who was involved in the data collection process (e.g., students, crowdworkers, contractors) and how were they compensated?\"",
        "\"Over what timeframe was the data collected?\"",
        "\"Is there an erratum?\" and \"Will the dataset be updated (e.g., to correct labeling errors, add new instances, delete instances)?\" with how often, by whom and how users will hear about it."
      ]
    },
    {
      "type": "p",
      "text": "The mapping is my reading, not a claim either paper makes. But the sensor and procedure question covers the metadata the robotics and clean energy teams in Sambasivan's study were missing.[^3,4] The compensation question touches the incentive cascade. And the erratum question gives a label correction somewhere to live. The authors say plainly that writing a datasheet is not meant to be automated, because automatic documentation defeats the point, which is to make creators reflect.[^4] The questions are also not prescriptive; some will not fit a given dataset.[^4]"
    },
    {
      "type": "callout",
      "title": "What the papers suggest for your own test set",
      "text": "Northcutt and colleagues recommend correcting test labels before trusting a model comparison, and spending a larger share of the annotation budget on test labels, even if the training labels stay noisier.[^1] Given a limited review budget, they recommend using confident learning to decide which examples humans check first.[^1] Then record what you found and fixed where the next user will see it; the datasheet's erratum question exists for this.[^4]"
    },
    {
      "type": "h2",
      "text": "What the authors say is still missing"
    },
    {
      "type": "p",
      "text": "Each paper is careful about what it did not show. Northcutt and colleagues say their study does not settle why high-capacity models do worse on corrected labels: overfitting to training set noise, overfitting to validation noise during hyperparameter tuning, or sensitivity to the shift created when test labels are corrected. How to split a human verification budget between training and test data is also left open.[^1] Sambasivan's team could not observe anyone's work directly. Because of COVID-19, every interview happened over video or phone, so the findings rest on what practitioners reported about themselves, without shadowing or contextual inquiry.[^3]"
    },
    {
      "type": "p",
      "text": "Gebru and colleagues note that datasheets do not provide a complete solution to unwanted bias or other harms, since creators cannot anticipate every use of a dataset, and that their workflow may not fit datasets that change often.[^4] Their last limitation connects the three papers. Creating a datasheet will always take time, they write, and organizational infrastructure and workflows, \"not to mention incentives,\" will need to change to make room for it.[^4]"
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        { "title": "Northcutt, Athalye, and Mueller, Pervasive Label Errors in Test Sets Destabilize Machine Learning Benchmarks, NeurIPS Datasets and Benchmarks 2021", "url": "https://arxiv.org/abs/2103.14749" },
        { "title": "Northcutt, Jiang, and Chuang, Confident Learning: Estimating Uncertainty in Dataset Labels, Journal of Artificial Intelligence Research, 2021", "url": "https://arxiv.org/abs/1911.00068" },
        { "title": "Sambasivan et al., \"Everyone wants to do the model work, not the data work\": Data Cascades in High-Stakes AI, CHI 2021", "url": "https://storage.googleapis.com/gweb-research2023-media/pubtools/5936.pdf" },
        { "title": "Gebru et al., Datasheets for Datasets, arXiv 1803.09010 (v8, 2021)", "url": "https://arxiv.org/abs/1803.09010" },
        { "title": "Label Errors gallery: validated test set errors from Northcutt et al., 2021", "url": "https://labelerrors.com" },
        { "title": "cleanlab/label-errors: corrected labels and reproduction code for Northcutt et al., 2021", "url": "https://github.com/cleanlab/label-errors" }
      ]
    }
  ]
};
