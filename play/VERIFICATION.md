# Content verification: ReBloom

**Date checked:** 25 October 2026 (first pass, then a re-verification of the fixed file the same day)
**File checked:** `/home/claude/game/content.js` (current version, with the 11 fixes and the tone changes applied)
**Method:** All 10 SOURCES URLs were opened with WebFetch on 25 October 2026, and all 10 pages loaded. On re-verification, `nhs_panic` was fetched again at its updated URL `https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/anxiety-fear-panic/`. Its HTML title is "Get help with anxiety, fear or panic - NHS" and its H1 is "Anxiety, fear and panic". The page was reviewed on 13 July 2026, and both `anx_avoid` and the new `anx_gp` were checked against it.

Page dates seen: WHO depression fact sheet 11 September 2026; WHO anxiety disorders fact sheet 15 September 2026.

---

## 1. Claims register

| Claim id | Source URL | Supported | Note |
|---|---|---|---|
| dep_def | https://www.who.int/news-room/fact-sheets/detail/depression | yes | "a depressed mood or loss of pleasure or interest in activities for long periods of time." |
| dep_more | https://medlineplus.gov/depression.html | yes | "more than a feeling of being sad or irritable for a few days"; "can affect how you think, feel, and your everyday life." |
| dep_2w | https://www.who.int/news-room/fact-sheets/detail/depression | yes | Episodes "last most of the day, nearly every day, for at least two weeks." |
| dep_anyone | https://www.who.int/news-room/fact-sheets/detail/depression | yes | "Depression can happen to anyone." |
| dep_common | https://www.who.int/news-room/fact-sheets/detail/depression | yes | "In 2023, an estimated 4% of the population experienced depression, including 5.2% of adults." |
| dep_real | https://www.nhs.uk/mental-health/conditions/depression-in-adults/overview/ | yes | "a real illness with real symptoms." |
| dep_weak | https://www.nhs.uk/mental-health/conditions/depression-in-adults/overview/ | yes | "not a sign of weakness"; not something you can "snap out of" by "pulling yourself together." |
| dep_recover | https://www.nhs.uk/mental-health/conditions/depression-in-adults/overview/ | yes | "with the right treatment and support, most people with depression can make a full recovery." |
| dep_treat | https://www.who.int/news-room/fact-sheets/detail/depression | yes | "Psychological treatments are the first treatments for depression"; for moderate and severe they "can be combined with antidepressant medicines." |
| dep_self | https://www.who.int/news-room/fact-sheets/detail/depression | yes | "stay connected to friends and family"; "exercise regularly, even if it's just a short walk"; "stick to regular eating and sleeping habits." |
| dep_talk | https://www.who.int/news-room/fact-sheets/detail/depression | yes | "talk to someone you trust about your feelings"; "seek help from a healthcare provider." |
| dep_seek | https://www.who.int/news-room/fact-sheets/detail/depression | yes | "Seek care if you have symptoms of depression"; "If you think you are in immediate danger of harming yourself... contact any available emergency services or a crisis line." |
| str_def | https://www.who.int/news-room/questions-and-answers/item/stress | yes | "a state of worry or mental tension caused by a difficult situation." |
| str_natural | https://www.who.int/news-room/questions-and-answers/item/stress | yes | "a natural human response that prompts us to address challenges and threats in our lives." |
| str_little | https://www.who.int/news-room/questions-and-answers/item/stress | yes | "A little bit of stress is good and can help us perform daily activities"; "Too much stress can cause physical and mental health problems." |
| str_body | https://www.who.int/news-room/questions-and-answers/item/stress | yes | "headaches or other body pains, an upset stomach or trouble sleeping." |
| str_routine | https://www.who.int/news-room/questions-and-answers/item/stress | yes | "a daily schedule can help us use our time efficiently and feel more in control." |
| str_sleep | https://www.who.int/news-room/questions-and-answers/item/stress | yes | "Getting enough sleep is important"; go to bed and get up at the same time each day; sleep "can help reverse the effect of stress." |
| str_connect | https://www.who.int/news-room/questions-and-answers/item/stress | yes | "Connecting with others can lift our mood and help us feel less stressed." |
| str_move | https://www.who.int/news-room/questions-and-answers/item/stress | yes | "Regular daily exercise can help to reduce stress"; walking counts. |
| str_news | https://www.who.int/news-room/questions-and-answers/item/stress | yes | Advises cutting back on news if it makes you more anxious or stressed. |
| str_help | https://www.who.int/news-room/questions-and-answers/item/stress | yes | If stress is hard to handle, talk to a trusted health care provider or someone in your community. |
| burn_def | https://www.who.int/news/item/28-05-2019-burn-out-an-occupational-phenomenon-international-classification-of-diseases | yes | "a syndrome conceptualized as resulting from chronic workplace stress that has not been successfully managed." |
| burn_dims | (same) | yes | Exhaustion; "increased mental distance from one's job, or feelings of negativism or cynicism"; "reduced professional efficacy." |
| burn_occ | (same) | yes | "occupational phenomenon"; "not classified as a medical condition"; "refers specifically to phenomena in the occupational context." |
| nhs_prior | https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/tips-to-reduce-stress/ | yes | Prioritise important work; "Accept that you will not have time for everything." |
| nhs_metime | (same) | yes | "setting aside a couple of nights a week for some quality 'me time' away from work." |
| nhs_exnot | (same) | yes | "Exercise will not make your stress disappear, but it can reduce some of the emotional intensity." |
| nhs_talk | (same) | yes | "Talking things through with a friend may also help you find solutions." (Not cited anywhere in the game.) |
| anx_normal | https://www.nimh.nih.gov/health/topics/anxiety-disorders | yes | "Feeling anxious is a normal part of life." |
| anx_more | https://www.nimh.nih.gov/health/topics/anxiety-disorders | yes | "anxiety does not go away, is felt in many situations, and can get worse over time." |
| anx_def | https://www.who.int/news-room/fact-sheets/detail/anxiety-disorders | yes | "fear and worry that is both intense and excessive." |
| anx_common | https://www.who.int/news-room/fact-sheets/detail/anxiety-disorders | yes | "470 million people in the world had an anxiety disorder" in 2023 (5.8% of the global population). |
| anx_treat | https://www.who.int/news-room/fact-sheets/detail/anxiety-disorders | yes | "highly effective treatments for anxiety disorders exist"; CBT-based approaches have "the most evidence." |
| anx_self | https://www.who.int/news-room/fact-sheets/detail/anxiety-disorders | yes | Relaxation "such as slow breathing and progressive muscle relaxation"; mindfulness "even if it's just a few minutes per day." |
| anx_avoid | https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/anxiety-fear-panic/ | yes | "do not avoid situations that make you anxious"; "try slowly building up time spent in worrying situations to gradually reduce anxiety." |
| anx_gp (new) | https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/anxiety-fear-panic/ | yes | "See a GP if: you're struggling to cope with anxiety, fear or panic; things you're trying yourself are not helping." The claim matches nearly word for word. |
| breath | https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/ | yes | "calming breathing technique for stress, anxiety and panic"; "takes just a few minutes"; best done "as part of your daily routine." |

All 38 claims are supported. The SOURCES title and URL for `nhs_panic` now match the live page.

---

## 2. Letter sentences, myth/fact items and tips

### Re-check of every changed item (current text)

| Location | Current text | Cited claims | Supported | Note |
|---|---|---|---|---|
| gloom / What it is, line 3 | "In a depressive episode, signs last most of the day, nearly every day, for at least two weeks." | dep_2w | yes | Matches WHO. |
| gloom / Myth 3 correction | "It is more than a few sad days. Signs last most of the day, nearly every day, for at least two weeks." | dep_more, dep_2w | yes | The myth "It is just a few sad days" is directly contradicted by MedlinePlus. |
| gloom / Fact 3 | "With treatment and support, most people recover." | dep_recover | yes | Treatment is now included. |
| gloom / What can help, line 2 | "Staying in touch with people, exercising regularly (even a short walk), and keeping regular sleep and meals can help." | dep_self | yes | Matches WHO self-care list. |
| all three Letters / crisis line | "If you are in immediate danger of harming yourself, contact local emergency services or a crisis line now." | dep_seek | yes | Uses WHO wording. It appears once per Letter, in "When to reach out". |
| deadline / What it is, line 2 | "A little stress can help, but too much can cause physical and mental health problems. Stress can show up as headaches, an upset stomach or trouble sleeping." | str_little, str_body | yes | The two ideas are now separate, as in the source. |
| deadline / burnout line | "...exhaustion, feeling distant or cynical about your job, and feeling less effective at work. WHO calls it a work phenomenon, not a medical condition." | burn_def, burn_dims, burn_occ | yes | Matches the ICD-11 dimensions. |
| crowd / Fact 2 | "Effective treatments for anxiety disorders exist." | anx_treat | yes | |
| crowd / What can help, line 1 | "For anxiety disorders, talking therapies based on cognitive-behavioural therapy have the most evidence." | anx_treat | yes | WHO: CBT-based approaches have the most evidence. |
| crowd / When to reach out, line 1 | "If anxiety feels hard to cope with, or the things you try yourself are not helping, see a doctor. Effective treatments exist." | anx_gp, anx_treat | yes | "Doctor" for GP is acceptable for an international audience. |
| upgrade `friend` tip | "Talking with people you trust can lift your mood. A health worker can help too." | str_connect, str_help | yes | |

### Unchanged items (re-confirmed against the current file)

All other Letter lines, myth/fact items and upgrade tips are fully supported, with no change needed:
- Gloom: What it is lines 1 and 2; Myths 1 and 2 (each myth is contradicted by NHS); Facts 1 and 2; What can help lines 1 and 3; When to reach out line 1.
- Deadline: line 1; Myths 1 to 3; Facts 1 to 3; What can help lines 1 and 2; When to reach out line 1.
- Crowd: What it is lines 1 to 3; Myths 1 to 3; Facts 1 and 3; What can help lines 2 and 3.
- Upgrade tips `pause`, `boundary`, `breath`, `rest`, `sleep`, `walk`, `clear`.

**Items not fully supported: none.**

---

## 3. Tone and safety findings (current text)

- **Suicide / self-harm:** these are mentioned only in the single crisis sentence in each Letter's "When to reach out" block. No DIALOGUE line, reframe, thought or tip mentions them. Pass.
- **Gloom intro:** "Why try?" (without "Just stay") is now preceded by Lumi's "I hear you. We can take this slowly." and followed by "That's the weight talking." Every Gloom line now gets a supportive reply. "Why bother trying" in the thought list was replaced with "Too much to face today". Pass.
- **Reframe:** "Talking to someone can help." Pass.
- **Crowd cleared:** "You didn't need the stage empty. Your breath helped you stay." This no longer suggests breathing alone handles anxiety. Pass.
- **Crowd p33:** "You're often only seeing their highlights." Pass.
- **runStart:** "Press Breathe and stay still. It's your strongest move in here." "In here" ties the line to the game mechanic, not to treatment. Pass.
- **Shaming, fault, diagnosing:** no line shames the player, blames them for an illness, or diagnoses them. Letters use "if you notice these signs". Pass.
- **Stress management vs treatment:** no line says self-help treats depression or anxiety. The Gloom and Crowd Letters list professional treatment first and frame self-care as "can help". Pass.

No outstanding tone or safety issues.

---

## 4. Summary

All 10 source pages were fetched on 25 October 2026. The updated `nhs_panic` URL and title now match the live NHS "Anxiety, fear and panic" page, which supports both `anx_avoid` and the new `anx_gp` claim almost word for word. All 38 claims in the register are supported by their cited sources. Every Letter sentence, myth/fact item and upgrade tip in the current file is fully supported by the claims it cites, including all 11 items fixed since the first pass. The crisis sentence now uses WHO's "immediate danger of harming yourself" wording and is the only place self-harm is mentioned. The tone changes to the Gloom intro, the reframe, the Crowd cleared line and the highlights line resolve the earlier concerns. No items remain at "partly" or "no".


## v3 additions (OCD content, room intros), checked 25 October 2026
An independent verifier fetched NHS OCD overview, symptoms and treatment pages, NIMH OCD, MedlinePlus OCD, and the WHO/NHS/NIMH pages behind the room intros.
Verified as matching: ocd_obs, ocd_comp, ocd_cycle, ocd_examples, ocd_thoughts, ocd_notall, ocd_control, ocd_who, ocd_fault, ocd_cbt, ocd_erp, ocd_gp, the crowd and OCD room intros, the WHO stress line.
Fixed after review:
- ocd_time reworded: one hour a day is one sign among several (MedlinePlus), not a standalone threshold.
- "the worry comes back stronger" changed to "comes back" (NHS says it returns, not that it grows).
- CBT line restored to the NHS meaning: facing fears without putting them right through compulsions.
- Urge-tile lines no longer imply willpower alone treats OCD; added "OCD is unlikely to get better without proper treatment and support" (NHS, new claim ocd_treat).
- "Not everything has to get done" changed to the NHS wording "You won't have time for everything" (room intro and Boundary tip).
- Gloom intro no longer attributes "not a weakness" to WHO; now cites WHO and NHS for their separate parts.
- "OCD can affect anyone" narrowed to the NHS wording "men, women and children".
