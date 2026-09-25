// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "why-models-hallucinate",
  "title": "Why models make things up",
  "excerpt": "Hallucination is not a bug bolted onto language models. It is a direct consequence of how they are built. Here is why, and what to do.",
  "category": "AI",
  "chapter": "Chapter 2",
  "tags": [
    "Hallucination",
    "Reliability"
  ],
  "seriesNum": 6,
  "publishAt": "2026-01-07T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "You ask a model for three papers on a topic. It gives you three: clean titles, plausible authors, a journal, a year, even page numbers. Two of them do not exist. Not \"are hard to find.\" Do not exist. The model invented them, formatted them perfectly, and handed them over with the same confidence it uses for things that are true."
    },
    {
      "type": "p",
      "text": "The reflex is to call this a bug, something a future version will patch out. That reflex is wrong, and getting past it is the whole point of this post. The made-up citation is not the model malfunctioning. It is the model doing exactly what it always does, in a spot where the usual result happens to be false. Once you see why, you stop waiting for a fix that is not coming and start designing around it."
    },
    {
      "type": "h2",
      "text": "The one-sentence intuition"
    },
    {
      "type": "p",
      "text": "A language model is a machine for producing text that sounds right. Most of the time, text that sounds right is also true, because the patterns of true statements are what it learned from. But \"sounds right\" and \"is true\" are two different targets, and the model is only ever aiming at the first one. When they line up, you get a correct answer. When they come apart, you get a confident wrong one, and the model cannot tell the difference, because it was never measuring truth in the first place."
    },
    {
      "type": "h2",
      "text": "Walk through what actually happens"
    },
    {
      "type": "p",
      "text": "Picture the model partway through writing a citation. It has produced \"A study by\" and now needs the next word. It does not look anything up. It asks, in effect, what word usually follows \"A study by\" in the kind of text it learned from. A name."
    },
    {
      "type": "p",
      "text": "So it picks a plausible name. Then a plausible institution, because that is what tends to come next."
    },
    {
      "type": "p",
      "text": "Then a year in a believable range. Each step is a local, reasonable guess about what word fits, and stacked together they form a citation that has never existed. Nothing in that process ever checked a database, because there is no database in the model. There is only a very good sense of what text tends to look like."
    },
    {
      "type": "p",
      "text": "Now contrast two questions. Ask \"what is the capital of France\" and the pattern of true text is overwhelming: \"Paris\" follows that question almost everywhere the model ever saw it, so the most-likely next word is also the correct one. Ask for an obscure citation and there is no single dominant true continuation, just a shape that citations have. The model fills that shape with plausible parts. Same machine, same step, opposite reliability, and the only thing that changed was whether a true answer was strongly present in what it learned."
    },
    {
      "type": "h2",
      "text": "Putting names to the failure"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Hallucination",
          "def": "a confident output that is not supported by the input or by fact. The fluency is real even when the content is not."
        },
        {
          "term": "Parametric memory",
          "def": "what the model absorbed into its weights during training. It is fuzzy, has no source attached, and cannot be checked from inside the model."
        },
        {
          "term": "Grounding",
          "def": "giving the model real source text at question time and asking it to answer only from that, so it is reading rather than recalling."
        },
        {
          "term": "Calibration",
          "def": "whether a model's confidence matches how often it is right. Most models are poorly calibrated and sound equally sure when wrong."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Why \"just tell it to be accurate\" fails"
    },
    {
      "type": "p",
      "text": "The natural first move is to add \"only say things that are true, do not make anything up\" to the prompt. It helps a little and then disappoints, and it is worth understanding why."
    },
    {
      "type": "p",
      "text": "The model has no separate truth sense to switch on. Telling it to be accurate nudges its style toward more cautious-sounding text, which can mean more hedging, but it does not give the model the ability to know whether a specific fact is real. You are asking a system that cannot see the ground to stop describing the ground incorrectly. It will describe it more carefully and still get it wrong."
    },
    {
      "type": "h2",
      "text": "What actually moves the needle"
    },
    {
      "type": "p",
      "text": "The pattern across every real fix is the same: stop asking the model to recall, and put the truth in front of it, or check the truth after. Each item below is an instance of that idea."
    },
    {
      "type": "ul",
      "items": [
        "Ground the model. Retrieve the relevant source text and instruct it to answer only from that text, and to say it does not know when the answer is not there. Now it is reading, not guessing from fuzzy memory.",
        "Demand checkable citations and then check them in code. A made-up source survives a human skim but fails an automated lookup.",
        "Lower the temperature for factual tasks. Higher randomness makes the model reach further down its list of plausible-but-unlikely tokens, which is exactly where invented details live.",
        "Add a verification pass. A second call, or a human, checks the claims against the source before anyone trusts them. Cheap compared to shipping a confident error.",
        "Constrain the task. A model choosing from a fixed list of real options cannot invent an option. Narrowing what it can output narrows what it can fabricate."
      ]
    },
    {
      "type": "h2",
      "text": "Where grounding still leaks"
    },
    {
      "type": "p",
      "text": "Grounding helps a lot, and it is not a force field. Two failure modes survive it. First, the model can ignore the source and answer from memory anyway, especially when its memory disagrees with the document. Second, it can misread or over-extend what the source says, stitching a claim the text does not actually support."
    },
    {
      "type": "p",
      "text": "So grounding lowers the rate, it does not zero it, and the verification pass still earns its place. Treat retrieval as the thing that makes the model usually right, and verification as the thing that catches the rest."
    },
    {
      "type": "h2",
      "text": "A dangerous misconception"
    },
    {
      "type": "p",
      "text": "It is tempting to think hallucination is a phase that the newest, biggest model has outgrown. The better models do hallucinate less, and that is exactly what makes them riskier in one respect. When a weak model is wrong, it is often obviously wrong, so you stay on guard."
    },
    {
      "type": "p",
      "text": "When a strong model is wrong, it is wrong with the same polish and fluency it uses for everything true, and after a hundred correct answers in a row you quietly stop checking. The error rate drops, and your guard drops faster, so the rare confident mistake sails straight through to a user or a database. Treat a more capable model as a reason to keep verifying, not a reason to stop. The wrong answers that survive better models are precisely the ones that look most right, which is what makes them expensive."
    },
    {
      "type": "h2",
      "text": "Living with a confident guesser"
    },
    {
      "type": "p",
      "text": "Hallucination is not noise on top of a truth machine. It is the direct result of how generation works, and no prompt will fully remove it. You manage it by changing the situation rather than scolding the model: give it real sources to read from, keep randomness low for facts, verify the claims that carry weight, and constrain the output where you can. Above all, stop reading confidence as evidence. For a language model, sounding certain is a style, not a signal."
    }
  ]
};
