// Every factual claim below is taken from the numbered sources at the end.
// The five-levels figure is Figure 1 of Feng, McDonald and Zhang (arXiv 2506.12469),
// reproduced under CC BY 4.0. Morris et al. (arXiv 2311.02462) is CC BY-NC-ND,
// so nothing from it is reproduced; its table is described in prose only.
export const POST = {
  id: 'levels-of-agentic-autonomy',
  title: 'Who Holds the Off Switch: A Ladder of Agent Autonomy',
  excerpt: 'Three papers rank AI agents by how much the human still decides. Walked rung by rung, they show what the user actually does at each level, which risk arrives with it, and why one of them argues the top rung should never be built.',
  category: 'AI',
  tags: ['Agents', 'Autonomy', 'AI Safety'],
  body: [
    {
      type: 'p',
      text: "Margaret Mitchell and three Hugging Face colleagues close their 2025 position paper with a story from the Cold War. In 1980, they write, computer systems falsely showed more than 2,000 Soviet missiles heading toward North America. Bomber crews ran to their stations and command posts prepared for war. The false alarm was caught only because humans cross-checked one warning system against another.[^1] The paper uses that incident to back its title claim, \"Fully Autonomous AI Agents Should Not be Developed,\" and states its finding plainly: after reviewing research and product marketing, the authors found \"no clear benefit\" of fully autonomous agents that can act outside human-defined constraints, and many foreseeable harms from giving up human control.[^1]",
    },
    {
      type: 'p',
      text: "Their broader result is a direction, not a number: \"The more control a user cedes to an AI agent, the more risks to people arise.\"[^1] That only makes sense if control comes in steps. Three papers have tried to name those steps, and they do not quite agree on where the steps sit. This post climbs the ladder one rung at a time and asks the same three questions at each: what does the human do here, what example do the papers give, and what risk do they attach to it.",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'AI agent', def: "Feng, McDonald and Zhang define it as a compound software system, built on one or more AI models, that operates inside an environment and takes actions in it, such as clicking a button or fetching a web page.[^3]" },
        { term: 'Autonomy', def: "The extent to which an agent is designed to operate without user involvement.[^3] It is about who decides and who can step in, not about how smart the model is." },
        { term: 'Agency', def: "Feng et al. keep this separate: the capacity to act, which grows with the tools an agent can reach. An agent with many tools that asks before each step has high agency but low autonomy.[^3]" },
        { term: 'User', def: "Whoever issued the original request. It can be a person, or another agent in a multi-agent system.[^3]" },
      ],
    },
    {
      type: 'p',
      text: "The first ladder came from Google DeepMind. Meredith Ringel Morris and colleagues proposed Levels of AGI, a grid of capability that ranks systems by performance and generality, and then added a separate set of six Levels of Autonomy, from 0 to 5, describing the style of interaction between a person and the AI.[^2] Their point was that capability \"unlocks\" higher autonomy without deciding it. A designer can pick a lower level than the model could support.[^2] They borrowed the idea from cars: the SAE J3016 standard grades driving automation from level 0 (no automation) to level 5 (full automation),[^6] and Morris et al. note there will be reasons to drive a level 0 car even when level 5 exists, such as teaching a new driver or driving in weather that blinds the sensors.[^2]",
    },
    {
      type: 'p',
      text: "Feng, McDonald and Zhang at the University of Washington built the most detailed ladder, with five levels named for the role the user plays: operator, collaborator, consultant, approver, observer.[^3] They hold one example agent fixed across all five levels, a computer-using model with web browsing, code execution and document writing, given one request: help me understand the economic impact of generative AI in the United States since ChatGPT came out in 2022.[^3] Only the autonomy changes. That makes their paper the spine of this post.",
    },
    {
      type: 'image',
      src: '/blog-images/levels-of-agentic-autonomy/feng-five-levels.webp',
      alt: 'Five colored boxes labeled L1 to L5: User as an Operator, Collaborator, Consultant, Approver and Observer, each with a one-line description. Below them, a blue wedge labeled User Involvement shrinks from left to right while a red wedge labeled Agent Autonomy grows.',
      width: 1810,
      height: 610,
      caption: 'The five user roles. Figure 1 from Feng, McDonald and Zhang, 2025,[^3] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: "Mitchell et al. drew a third ladder from the code's point of view, adapted from a Hugging Face blog by Roucher and colleagues. It has five levels: a simple processor where the model has no effect on program flow, a router, a tool caller, a multi-step agent, and a fully autonomous agent that writes and runs new code.[^1] The diagram below lines the three up. The alignment is my reading, not something any of the papers draws, and the fit is loose in places that matter later.",
    },
    {
      type: 'diagram',
      rows: [
        [{ label: 'Rung 5: user as observer', detail: 'Watches logs, holds an off switch. Morris L5 "AI as an Agent". Mitchell: fully autonomous agent that creates and runs new code.' }],
        [{ label: 'Rung 4: user as approver', detail: 'Signs off on blockers and consequential actions only. Morris L4 "AI as an Expert". Mitchell: multi-step agent.' }],
        [{ label: 'Rung 3: user as consultant', detail: 'Gives feedback and preferences; cannot take over. Mitchell: tool caller or multi-step agent.' }],
        [{ label: 'Rung 2: user as collaborator', detail: 'Plans and works alongside the agent; can take over at any time. Morris L3 "AI as a Collaborator".' }],
        [{ label: 'Rung 1: user as operator', detail: 'Drives the plan; agent acts when invoked. Morris L1 "AI as a Tool" and L2 "AI as a Consultant". Mitchell: simple processor or router.' }],
        [{ label: 'Rung 0: no AI', detail: 'Human does everything. Morris L0 only.' }],
      ],
      caption: 'The ladder, highest rung at the top. Rung names follow Feng et al.;[^3] the Morris[^2] and Mitchell[^1] levels are placed by the author, and the naming clash at rungs 2 and 3 is real.',
    },
    {
      type: 'h2',
      text: 'Rung 0: the human does everything',
    },
    {
      type: 'p',
      text: "Only Morris et al. include this rung. Their examples are sketching with a pencil and working in non-AI digital tools like a text editor or paint program, and the risk column just says status quo risks.[^2] They insist it stays relevant for education, enjoyment, assessment and safety.[^2] It is the baseline every other rung is measured against.",
    },
    {
      type: 'h2',
      text: 'Rung 1: the user as operator',
    },
    {
      type: 'p',
      text: "Here the user is in charge at all times and does the long-term planning. The agent helps on demand, and if it suggests an action, it does not carry it out until the user approves.[^3] In the running example, the user opens a search engine and the agent suggests queries; the user reads reports and asks for summaries with a click; the user opens a code editor and the agent follows along with autocompletions.[^3] Feng et al. list ChatGPT Canvas and Microsoft Copilot as rung 1 systems, and they say this level suits high-stakes, high-expertise work where a wrong autonomous action is costly or would raise legal and accountability problems.[^3]",
    },
    {
      type: 'p',
      text: "The risk they tie to it is subtle. Because the agent must not make preference-based decisions for the user, it has to notice when such a decision is coming and stop. They leave open how an agent can detect that reliably.[^3] Morris et al. split this rung into two. Their level 1, AI as a Tool, has the human fully controlling the task and using AI for mundane subtasks, like a grammar checker or a translation app, with de-skilling from over-reliance as the example risk.[^2] Their level 2, AI as a Consultant, has the AI doing substantive work but only when a human invokes it, like summarizing a set of documents or generating code, and lists over-trust, radicalization and targeted manipulation.[^2] Mitchell et al. make a matching point for the low end of their scale: lower autonomy carries risks through perception and interaction, such as humanlike cues, over-trust and oversharing, even before the agent executes anything.[^1]",
    },
    {
      type: 'h2',
      text: 'Rung 2: the user as collaborator',
    },
    {
      type: 'p',
      text: "Both parties plan, delegate and execute. The agent drafts a plan, and the user edits it directly, adding or deleting steps and choosing which ones to keep for themselves.[^3] In the example the user hands off report reading and summaries but keeps hypothesis generation and data analysis. When the agent hits a paywall it tells the user, who decides it can skip the article. Everything lands in a shared document the user can edit.[^3] The defining control is a two-way handoff: if the user sees the agent \"looping endlessly on a paper search or hallucinating non-existent references,\" they can take over the work at any point.[^3] OpenAI's Operator is their rung 2 example.[^3]",
    },
    {
      type: 'p',
      text: "The costs Feng et al. name are practical ones. This is the first rung where the agent works on its own tasks in parallel, so it may not be available when the user wants it. Delegating well has a learning curve, and handing work back and forth needs careful design, including how the agent should react when the user grabs control.[^3] Morris et al. call their equivalent level 3 AI as a Collaborator, with co-equal coordination of goals and tasks. Their examples are training as a chess player with a chess AI and entertainment through AI-generated personalities, and the risks they list are anthropomorphization, such as parasocial relationships, and rapid societal change.[^2]",
    },
    {
      type: 'h2',
      text: 'Rung 3: the user as consultant',
    },
    {
      type: 'p',
      text: "The agent now leads planning and execution over long stretches. The user gives feedback, preferences and direction, but may have no way to take control or edit the agent's outputs directly. They can only send messages, pause the agent at a step, and ask for changes or reruns.[^3] In the example the agent proposes a plan with a literature review, research questions and data retrieval; the user says to hold off on quantitative work until they have seen the questions, and the agent drops that step. Later it runs its references past the user to check reliability.[^3] Feng et al. place Gemini Deep Research, Replit Agent and GitHub Copilot Agent here.[^3]",
    },
    {
      type: 'p',
      text: "The risk shifts to timing. The whole rung depends on the agent asking the right question at the right moment, and Feng et al. suggest a \"training period\" with each user may be needed, with the agent now carrying most of that learning curve.[^3] They also ask what happens when one requested change triggers a cascade of other changes.[^3] On Mitchell's scale, the levels that fit here (my placement) are the tool caller, where the model picks the tool and its arguments, and the multi-step agent, where it also decides whether to keep going.[^1] Their security analysis adds that at the four levels below full autonomy, developers keep some control of the code the agent can access, so they can, for example, block it from talking to third parties.[^1]",
    },
    {
      type: 'h2',
      text: 'Rung 4: the user as approver',
    },
    {
      type: 'p',
      text: "The user becomes passive. They are contacted only when the agent hits a blocker it cannot clear: a failure state, a credential it lacks, or a consequential action that needs sign-off.[^3] Before the task starts, the user can set conditions for approval, such as whenever a login screen appears. The plan is shown for transparency but not for comment.[^3] In the example the agent collects databases, asks for logins, ignores articles it cannot reach, and asks for an API key only when an analysis tool demands one. At the end it proposes a report format and waits for a yes.[^3] SWE-agent, Manus and Devin are the examples.[^3] Feng et al. say this level fits tasks with many low-stakes decisions, where automation cuts the user's load and a wrong choice does little damage.[^3]",
    },
    {
      type: 'p',
      text: "The first risk they name is stored secrets: an agent that holds credentials so it can work unattended is a bigger target, and attack surfaces grow with autonomy.[^3] The paper they cite for that, by Li and colleagues, shows how concrete it is. They planted Reddit posts that redirected web agents to a fake shopping site carrying a jailbreak prompt. When agents arrived through the trusted platform, they gave up credit card numbers and addresses in 10 out of 10 trials, and Anthropic's Computer Use agent downloaded and ran an attacker's file in 10 of 10 trials whenever it landed on those posts.[^4] The attacks, the authors stress, need no machine learning knowledge at all.[^4]",
    },
    {
      type: 'p',
      text: "The second risk is the approver. Feng et al. ask how to stop approvals turning into \"meaningless rubber stamping\" by a disengaged user, and how a misaligned agent might exploit that disengagement to talk the user into risky actions a little at a time.[^3] They also point out that the agent has to recognize which actions are consequential, which is hard to do reliably.[^3] And they make a sharp argument about safety frameworks: a rung 5 agent that earns revenue on its own may be rated riskier than a rung 4 agent that fails to, yet if the rung 4 agent can do it with \"a simple approval,\" the two carry similar risk.[^3] Morris et al.'s level 4, AI as an Expert, has the AI driving the interaction with the human giving guidance or doing subtasks. Their example is AI-driven scientific discovery like protein folding, and their risks are societal-scale ennui, mass labor displacement and a decline of human exceptionalism.[^2]",
    },
    {
      type: 'callout',
      title: 'Measuring which rung an agent is on',
      text: "Feng et al. propose an assisted evaluation. Run the agent on a benchmark with no help; if it passes a success threshold on all tasks, it is rung 5. If not, a standby user adds rung 4 help, such as approvals, then rung 3 consultation, and so on, until it passes. The kind of help needed at that point sets the level. They note this can take five rounds just to label an agent rung 1, so testing can start at a guessed level instead.[^3] Cihon and colleagues take a cheaper route, scoring an agent's orchestration code for impact and oversight without running it.[^5] Feng et al. counter that reading code misses the actual user-agent interaction.[^3]",
    },
    {
      type: 'h2',
      text: 'Rung 5: the user as observer',
    },
    {
      type: 'p',
      text: "At the top the agent needs no user involvement and offers no way to give any. It plans, executes and works around blockers on its own. The user can watch activity logs but cannot change the agent's trajectory. The one control left is an emergency off switch that stops everything.[^3] In the example the agent revises its plan as it reads, downloads datasets from government agencies and earlier economics papers, writes the analysis code, and polishes a formal report.[^3] Voyager and The AI Scientist are Feng et al.'s examples.[^3]",
    },
    {
      type: 'p',
      text: "The risk Feng et al. give is compounding: simple errors pile up over many steps with nobody to catch them, so the agent can burn a lot of resources and still hand back something far from right.[^3] Mitchell et al. add speed. Fully autonomous agents \"may act faster than humans can intervene,\" and once an agent can write and run its own code, it can open security holes its developers never anticipated.[^1] Human-written safeguards are bounded by what their authors foresaw, while the agent can produce behavior outside those limits.[^1] Morris et al. list misalignment and concentration of power at their level 5, AI as an Agent, whose example is autonomous personal assistants, marked \"not yet unlocked\" in 2023.[^2]",
    },
    {
      type: 'h2',
      text: 'Where the three papers pull apart',
    },
    {
      type: 'p',
      text: "The first split is over whether the top rung should exist. Mitchell et al. say no, at least for agents that can write and run code beyond predefined limits, and argue semi-autonomous systems that keep some human control have a better balance of risk and benefit.[^1] Feng et al. agree that rung 5 risks may outweigh the benefits \"in most cases\" but leave two openings: tasks so complex that human input would add errors the agent would have avoided, and sandboxed settings where its actions cannot reach the outside world.[^3] Morris et al. do not rule the level out. They say we may build very capable systems and still choose not to deploy them autonomously.[^2]",
    },
    {
      type: 'p',
      text: "The second split is what rung 5 even means. Morris et al. write that a fully autonomous AI is implicitly one that can act aligned without continuous oversight \"but knows when to consult humans.\"[^2] Feng et al.'s observer level has no means for user involvement other than the off switch.[^3] Those are different machines. One still asks; the other cannot be told.",
    },
    {
      type: 'p',
      text: "The third split is about capability. Morris et al. tie autonomy levels to capability: higher levels are unlocked by more capable AI, and levels 3 to 5 may only work well if the system is good at metacognitive skills like knowing when to ask a human for help.[^2] Feng et al. push further apart. A capable agent can be held at a low rung by requiring it to consult before every action, and a weak agent can run at a high rung on simple, well-scoped tasks.[^3] They argue this is why capability benchmarks alone cannot tell you an agent's autonomy.[^3] Mitchell et al. note, from their side, that Morris et al.'s framing places AI agents at the single fully autonomous level.[^1]",
    },
    {
      type: 'p',
      text: "There is also a plain naming clash. For Morris et al., a Consultant is an AI you invoke, sitting below the Collaborator.[^2] For Feng et al., the user is the consultant, and consulting sits above collaborating.[^3] Anyone who says \"consultant mode\" in a design review should say which paper they mean. Mitchell et al.'s ladder is a different axis again, measuring how much of the program flow the model controls rather than what the user does. Feng et al. would call much of that agency, not autonomy.[^1,3]",
    },
    {
      type: 'h2',
      text: 'The question left open at rung 4',
    },
    {
      type: 'p',
      text: "Put the papers side by side and the practical stopping point for many deployments looks like rung 4 or below, with a human who still has to say yes. That is the author's reading. None of the three papers names a single rung for everyone, and Feng et al. call their level sketches descriptive rather than prescriptive.[^3] But rung 4 rests on the approver, and Feng et al. do not claim to know how to keep that person awake. Their open question for the level reads: \"How can users be engaged in agent activities to avoid meaningless rubber stamping?\"[^3]",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Mitchell, Ghosh, Luccioni, Pistilli, "Fully Autonomous AI Agents Should Not be Developed" (arXiv:2502.02649)', url: 'https://arxiv.org/abs/2502.02649' },
        { title: 'Morris et al., "Position: Levels of AGI for Operationalizing Progress on the Path to AGI," ICML 2024 (arXiv:2311.02462)', url: 'https://arxiv.org/abs/2311.02462' },
        { title: 'Feng, McDonald, Zhang, "Levels of Autonomy for AI Agents" (arXiv:2506.12469)', url: 'https://arxiv.org/abs/2506.12469' },
        { title: 'Li, Zhou, Raghuram, Goldstein, Goldblum, "Commercial LLM Agents Are Already Vulnerable to Simple Yet Dangerous Attacks" (arXiv:2502.08586)', url: 'https://arxiv.org/abs/2502.08586' },
        { title: 'Cihon, Stein, Bansal, Manning, Xu, "Measuring AI Agent Autonomy: Towards a Scalable Approach with Code Inspection" (arXiv:2502.15212)', url: 'https://arxiv.org/abs/2502.15212' },
        { title: 'SAE International, J3016: Taxonomy and Definitions for Terms Related to Driving Automation Systems for On-Road Motor Vehicles (2021)', url: 'https://www.sae.org/standards/content/j3016_202104/' },
      ],
    },
  ],
};
