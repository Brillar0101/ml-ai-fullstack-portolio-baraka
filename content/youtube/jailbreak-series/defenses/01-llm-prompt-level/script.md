# Prompt-Level Defenses — Checking the Guest Before the Door

Attackers slip past a model's safety training by dressing their requests in costumes, hiding them inside puzzles, and burying them in examples. Every one of those tricks has the same target: the raw text of your prompt, on its way in.

So here is the natural first line of defense — the cheapest, fastest one there is. Don't retrain the multi-billion-dollar model at all. Just put an inspector at the front door, before the prompt ever reaches the model, and check the guest. That is a prompt-level defense, and you can bolt it onto a model you don't even own.

A prompt-level defense works entirely on the input, the text you send, and never touches the model's internal weights. That is what makes it the first thing teams reach for. Let's open the booth and look at the three inspections happening inside.

The first inspector exploits a weakness in the attacks themselves. Most of them depend on an exact arrangement of words: a precise costume, a precise hidden pattern. So the first inspector simply paraphrases the incoming prompt — it rewrites the request in different words while keeping its real meaning. A genuine, harmless request survives being reworded, because its meaning is intact. But a carefully engineered attack often does not. Its power lived in that exact string, and once you rephrase it, the trick falls apart. The real intent, if there was one, now stands in plain clothes where the model's normal safety training can see it again.

The second inspector doesn't read for meaning at all. It measures how natural the text is, using a number called perplexity — a measure of how surprised a language model is by a piece of text. Ordinary human writing is low surprise, low perplexity. A wall of random-looking characters is high surprise, high perplexity. This matters because a whole class of attacks appends a string of machine-optimized gibberish to force a model off the rails. That gibberish is wildly unnatural, so its perplexity spikes, and the inspector flags anything too surprising to be real writing and holds it at the door. It works like a smoke detector. It doesn't understand the fire. It just notices that the air is wrong.

The third inspector adds something instead of removing it. Just before the prompt reaches the model, it staples on a short safety reminder — a system instruction re-stating that the model should refuse harmful requests. You might ask why that helps, if the model was already trained to be safe. It helps because a long, elaborate attack can bury the model in so much framing that its original instructions fade into the background. The reminder pulls them back to the front, right next to where the model is paying the most attention. It is the guard's supervisor leaning in to say "check this one properly," at the exact moment it matters.

Three inspections: reword it, measure how natural it is, and re-state the rules. All on the input, all without touching the model itself. That is the whole appeal, and also the whole limit.

Prompt-level defenses are cheap, fast, and model-agnostic. You can wrap them around any system, including a hosted one you only reach through an API. But they are a fence, not a cure. A determined attacker can craft inputs that survive paraphrasing, or that read naturally enough to pass the perplexity check. The inspector at the door only ever sees what comes through the door.

That is why they are paired with the next line of defense — model-level defenses, which change what the guard fundamentally believes, not just what reaches it. Cheap inspection at the front, deeper alignment behind it. Defense in depth.

The takeaway: your first, cheapest defense lives entirely on the input, and it buys real protection for almost no cost. It just can't be your only one.

Next: model-level defenses — what it actually means to change the guard's mind, and why it is so much more expensive than checking the door.
