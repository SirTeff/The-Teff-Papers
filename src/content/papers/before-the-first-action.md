---
title: "Before the First Action"
slug: "before-the-first-action"
date: "2026-07-28"
category: "Inside AI"
tags:
  - "AI Evaluation"
  - "Fred Studio"
  - "Judgement"
  - "Automation"
  - "Intelligent Systems"
excerpt: "The final error is not always where the failure begins. One incorrect assumption can shape every decision that follows."
readingTime: "7 min"
status: "Draft"
author: "Teff"
---

While I was working on an *Inside AI* paper yesterday, I was examining a pattern that appears often in evaluation work: the final error is not always where the failure begins. A response can be logical, well written and internally consistent while still being wrong at its foundation because the system made one incorrect assumption near the beginning. Once that first interpretation is accepted, every decision that follows can make sense within the wrong frame. The system may complete the task successfully according to its own reasoning while moving further away from what the task actually required.

This becomes especially important in evaluations where one answer determines whether the remaining questions should even be considered. A wrong classification at the beginning can make every later judgement irrelevant. Weak evidence can support a chain of conclusions that appear credible. A misunderstanding of the objective can turn factual information into an unacceptable response. The visible mistake may appear in the final answer, but the real separation happened earlier, at the point where the system decided what kind of problem it believed it was solving.

That is why good evaluation cannot stop at checking whether an answer sounds correct. It requires tracing the reasoning back to the first decision that shaped everything after it. What did the system believe the instruction meant? Which assumption determined its direction? Did the evidence justify continuing, or did the structure of the task encourage it to produce an answer simply because an empty space remained?

AI systems are often rewarded for completing tasks, and completion can easily be mistaken for competence. A polished answer feels more useful than an incomplete one, even when stopping would have been the more accurate decision. The system fills the gaps, the uncertainty disappears beneath confident language, and the response looks stronger than the reasoning that produced it. In those cases, the failure is not always an obvious hallucination. The information may be real and the logic may be coherent, yet the system crossed a boundary the evidence did not support.

As I developed that argument, the connection to building Fred became difficult to ignore.

A personal intelligence system will eventually do more than generate responses. It may organise information, interpret priorities, prepare decisions and carry actions across different areas of a person’s life and work. That makes the first assumption far more consequential. When a chatbot misunderstands a request, it may produce a poor answer. When an automated system misunderstands the same request, it can turn that misunderstanding into a sequence of actions.

The central design problem is therefore not simply teaching the system what to do. It is deciding how the system establishes what the user actually intends before anything begins. A request can be clear at the level of language while remaining incomplete at the level of purpose. “Schedule this,” “send that,” or “handle this for me” may hide questions about timing, privacy, priority, consequence and whether the user wants preparation or execution.

A capable system can fill those gaps with assumptions. A trustworthy one must recognise which gaps are safe to infer and which ones require confirmation.

This is where evaluation and product design begin to meet. Evaluation trains me to search for the earliest point where a system’s interpretation separates from the objective. Building Fred requires designing the opposite behaviour: a system that examines its first interpretation before allowing that interpretation to shape everything that follows. The work is no longer only about improving the quality of the final output. It is about protecting the reasoning that produces it.

That principle reaches into every part of the system. Memory should help Fred understand the person, but it should not turn past behaviour into permanent instruction. Context should reduce unnecessary questions, but it should not create confidence that the available information has not earned. Automation should remove friction, but it should not remove the user from decisions whose consequences still belong to them.

Approval therefore becomes more than a safety feature. It becomes part of the reasoning process. A well-designed approval step allows the system to reveal what it believes the user asked for, what it intends to do and which assumptions shaped that plan. The purpose is not to make the user supervise every minor action. It is to create a point where the premise can be corrected before the premise becomes a result.

The same reasoning explains why documentation remains central to the project. Code can preserve a behaviour long after the reasoning behind it has been forgotten. A temporary shortcut can become part of the architecture simply because nobody recorded the conditions under which it was meant to exist. Documentation forces the assumption into the open. It records the purpose of a decision, the problem it was designed to solve and the point at which that decision may need to change.

Building Fred has made the relationship between intelligence and judgement much clearer to me. Intelligence should not be measured only by how effectively a system completes a task. It should also be measured by how carefully it establishes that the task it is completing is the right one.

Because once the first assumption is wrong, greater capability does not necessarily correct the system.

It may only allow the mistake to travel further.
