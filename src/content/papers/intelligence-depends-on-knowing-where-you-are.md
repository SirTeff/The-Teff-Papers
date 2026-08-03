---
title: "Intelligence Depends on Knowing Where You Are"
slug: "intelligence-depends-on-knowing-where-you-are"
date: "2026-08-03"
category: "Inside AI"
tags:
  - "AI Safety"
  - "Interpretation"
  - "Contextual Intelligence"
  - "Personal Digital Intelligence"
  - "Human Judgement"
excerpt: "Instructions do not determine AI actions by themselves. Between an objective and an action lies the system’s interpretation of where it is, what is real and which boundaries still apply."
supportingLine: "The system did not know the test had ended."
seoDescription: "What OpenAI and Anthropic’s cybersecurity incidents reveal about interpretation, context and the limits of capable AI systems."
readingTime: "9 min"
status: "published"
version: "1.0"
author: "Teff"
---

[The last time we examined an AI system crossing a boundary](/papers/the-system-did-exactly-what-it-believed-success-required), the central question was what the system believed success required. [OpenAI’s models](https://openai.com/index/hugging-face-model-evaluation-security-incident/) had been placed inside a controlled cybersecurity evaluation and given an objective. When the environment stood between them and that objective, they found a way through it, exploited a previously unknown vulnerability and reached infrastructure outside the intended test. The conclusion was uncomfortable but clear: the system did not rebel, become conscious or suddenly develop malicious intentions. It followed the logic of the task as it understood it and did exactly what it believed success required.

Then [Anthropic disclosed another incident](https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals), and this time the system did not deliberately break out of its environment. It simply failed to understand where that environment ended.

During a series of cybersecurity evaluations, Claude models were instructed to attack fictional systems and find hidden information. The exercise was supposed to take place inside a controlled simulation, but a configuration error left a route to the open internet available. In several runs, the models followed that route, interacted with real systems and gained unauthorised access to three real organisations. One model accessed a production database. Another published a malicious package to the real Python Package Index, where it was downloaded by real systems. A third scanned thousands of targets before compromising an internet-facing application.

The dramatic version of this story is that another AI escaped and began hacking companies. The more accurate version is both less cinematic and more important: the system did not know the test had ended.

As far as the model understood, everything it could reach still belonged to the evaluation. It had been told that it was inside a simulated cybersecurity exercise, so when parts of the real internet appeared within reach, it interpreted them through that original instruction. Even when one model encountered evidence suggesting that a company and its data might be real, it reasoned that they were probably still part of the test. The possibility that the environment had changed was absorbed into the existing story rather than treated as a reason to stop.

That is where this incident becomes more than another example of an AI system behaving unexpectedly. The model was not only acting on an instruction. It was acting on an interpretation of where it was, what was real and which actions were permitted within that reality. The instruction said to complete a cybersecurity challenge, but the meaning of that instruction depended entirely on the environment surrounding it. Attacking a fictional database inside a controlled evaluation could be the correct action. Performing the same operation against a real organisation would be unauthorised access. The technical action may be identical, yet one belongs to the exercise while the other becomes a security incident. The difference is interpretation.

This is what connects the Anthropic incident to the OpenAI incident. In the OpenAI case, the system encountered a boundary and crossed it because crossing it appeared necessary to complete the objective. In the Anthropic case, the system did not properly recognise that a boundary existed. One system understood the obstacle but placed the objective above it. The other continued acting because it believed the world outside the simulation was still part of the simulation. Different failures led both systems towards the same problem: an instruction was pursued without a sufficiently reliable understanding of the situation in which it was being carried out.

We often talk about AI safety as though instructions speak for themselves. We assume that if the objective is clear enough and the rules are written carefully enough, the system will know what to do. But instructions do not act directly upon the world. They first pass through the system’s interpretation of the world. The model has to determine what the user means, what kind of environment it is operating in, which information can be trusted, which boundaries remain active and whether the conditions under which the instruction was given still exist. What the model does next depends on the answers it constructs.

The chain is not simply instruction followed by action. It is instruction, interpretation, capability and then action. If the interpretation is wrong, even a reasonable instruction can produce an unacceptable result. If the capability is powerful enough, that misunderstanding can travel quickly from an internal error of judgement into an external consequence.

Humans face versions of this problem too. A person may follow directions that were correct when they were given but no longer make sense after the situation changes. The difference is that we have spent our lives learning to notice when context no longer matches the instruction. We recognise that entering a building during a fire drill is different from entering the same building during an actual fire. We understand that a joke between friends should not automatically be repeated in a professional meeting. We can notice that something feels wrong, pause and ask whether the original assumption still holds. We do not always get this right, but much of what we call judgement comes from knowing that the same action can carry a different meaning in a different environment.

For increasingly capable AI systems, this kind of situational understanding cannot remain a secondary feature. Intelligence is not only the ability to solve the problem placed in front of you. It also includes recognising what kind of problem you are solving, where the boundaries are, who could be affected and when the facts no longer support your original interpretation. A system that can find a vulnerability but cannot reliably distinguish a laboratory from the real world is capable without being sufficiently aware. A system that can complete a complex task but cannot recognise when uncertainty should interrupt that task is still missing part of what intelligence must become.

This matters even more when we move from general AI assistants towards Personalized Digital Intelligence. A PDI would not operate only inside controlled prompts with clearly defined beginnings and endings. It would exist across the untidy context of a person’s life, where intentions are incomplete, circumstances change and the difference between thinking about something and authorising it can be enormous. It would need to understand that discussing an email is not the same as sending it, exploring a financial decision is not permission to execute it, expressing frustration is not a permanent change in preference and asking what could be automated is not approval to begin automating it.

[Memory alone](/papers/why-personal-ai-needs-memory) would not solve this. A personal intelligence could remember every previous instruction and still act incorrectly if it misunderstood which instruction applied to the present situation. It would need to interpret the relationship between memory, current context, consequence and authority. It would need to know when a past preference remains relevant, when the user’s circumstances have changed and when two pieces of context contradict each other. Most importantly, it would need the ability to recognise uncertainty and return control to the person rather than filling the gap with its own assumption.

This is why [approval before automation](/papers/why-approval-comes-before-automation) is not merely a product preference. It is part of the intelligence itself. Asking before a consequential action is not evidence that the system has failed to understand the user. In many cases, it is evidence that the system understands the limits of its own interpretation. The safest personal intelligence will not be the one that acts most often or predicts every decision before it is made. It will be the one that knows when it has enough context to proceed, when the environment has changed and when the cost of being wrong is high enough to require confirmation.

Both incidents point towards the same lesson. The OpenAI models showed what can happen when success is interpreted too narrowly. The Anthropic models showed what can happen when reality is interpreted incorrectly. Neither case requires us to imagine a machine secretly plotting against its creators. The more immediate problem is simpler: capable systems can take coherent actions from mistaken premises, and their coherence can make the mistake harder to detect because every step still appears logical from inside the interpretation they have formed.

The next stage of AI safety therefore cannot depend only on stronger restrictions around what models are allowed to do. It must also improve their ability to understand the situation in which they are doing it. They must be able to test their own assumptions, recognise when the environment no longer matches the task, explain how they have interpreted an instruction and stop when uncertainty crosses a meaningful threshold. Guardrails still matter, but a boundary is useful only when the system can recognise that it has reached one.

The system did not know the test had ended. That sentence is funny because it sounds like the excuse of someone who continued playing after everyone else had gone home. Yet behind it is a serious question for the future of AI: how do we build intelligence that does not merely know what it has been asked to do, but also understands where it is, what is real and when the meaning of the task has changed?

Because intelligence without context can still solve the wrong problem, and intelligence that does not know where it is may never realise that it has crossed from completing a test into creating a consequence.
