/* ReBloom, content data.
   Every health claim points to an entry in SOURCES. Accessed and checked 25 October 2026. */
(function () {
  const ACCESSED = "25 October 2026";

  const SOURCES = {
    who_dep: { short: "WHO", publisher: "World Health Organization", title: "Depressive disorder (depression), fact sheet", url: "https://www.who.int/news-room/fact-sheets/detail/depression" },
    mlp_dep: { short: "MedlinePlus", publisher: "MedlinePlus, U.S. National Library of Medicine", title: "Depression", url: "https://medlineplus.gov/depression.html" },
    nhs_dep: { short: "NHS", publisher: "NHS (UK)", title: "Depression in adults: overview", url: "https://www.nhs.uk/mental-health/conditions/depression-in-adults/overview/" },
    who_burn: { short: "WHO", publisher: "World Health Organization", title: "Burn-out an \"occupational phenomenon\": International Classification of Diseases", url: "https://www.who.int/news/item/28-05-2019-burn-out-an-occupational-phenomenon-international-classification-of-diseases" },
    who_stress: { short: "WHO", publisher: "World Health Organization", title: "Stress, questions and answers", url: "https://www.who.int/news-room/questions-and-answers/item/stress" },
    nhs_stress: { short: "NHS", publisher: "NHS (UK)", title: "10 stress busters (tips to reduce stress)", url: "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/tips-to-reduce-stress/" },
    who_anx: { short: "WHO", publisher: "World Health Organization", title: "Anxiety disorders, fact sheet", url: "https://www.who.int/news-room/fact-sheets/detail/anxiety-disorders" },
    nimh_anx: { short: "NIMH", publisher: "National Institute of Mental Health (NIMH)", title: "Anxiety Disorders", url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders" },
    nhs_panic: { short: "NHS", publisher: "NHS (UK)", title: "Get help with anxiety, fear or panic", url: "https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/anxiety-fear-panic/" },
    nhs_ocd: { short: "NHS", publisher: "NHS (UK)", title: "Obsessive compulsive disorder (OCD): overview", url: "https://www.nhs.uk/mental-health/conditions/obsessive-compulsive-disorder-ocd/overview/" },
    nhs_ocd_sym: { short: "NHS", publisher: "NHS (UK)", title: "Obsessive compulsive disorder (OCD): symptoms", url: "https://www.nhs.uk/mental-health/conditions/obsessive-compulsive-disorder-ocd/symptoms/" },
    nimh_ocd: { short: "NIMH", publisher: "National Institute of Mental Health (NIMH)", title: "Obsessive-Compulsive Disorder: When Unwanted Thoughts or Repetitive Behaviors Take Over", url: "https://www.nimh.nih.gov/health/publications/obsessive-compulsive-disorder-when-unwanted-thoughts-or-repetitive-behaviors-take-over" },
    mlp_ocd: { short: "MedlinePlus", publisher: "MedlinePlus, U.S. National Library of Medicine", title: "Obsessive-Compulsive Disorder", url: "https://medlineplus.gov/obsessivecompulsivedisorder.html" },
    nhs_breath: { short: "NHS", publisher: "NHS (UK)", title: "Breathing exercises for stress", url: "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/" }
  };

  /* Claims register: paraphrase, source, strength. */
  const CLAIMS = {
    dep_def: { src: "who_dep", strength: "definition", claim: "Depression involves a low mood or loss of interest or pleasure in activities for long periods." },
    dep_more: { src: "mlp_dep", strength: "definition", claim: "Depression is more than feeling sad for a few days; it affects how a person thinks and feels and can disrupt daily life." },
    dep_2w: { src: "who_dep", strength: "definition", claim: "In a depressive episode, symptoms are present most of the day, nearly every day, for at least two weeks." },
    dep_anyone: { src: "who_dep", strength: "fact", claim: "Depression can happen to anyone." },
    dep_common: { src: "who_dep", strength: "fact", claim: "WHO estimates about 5.2% of adults worldwide had depression in 2023." },
    dep_real: { src: "nhs_dep", strength: "fact", claim: "Depression is a real illness with real symptoms." },
    dep_weak: { src: "nhs_dep", strength: "fact", claim: "Depression is not a sign of weakness or something you can snap out of by pulling yourself together." },
    dep_recover: { src: "nhs_dep", strength: "fact", claim: "With the right treatment and support, most people with depression can make a full recovery." },
    dep_treat: { src: "who_dep", strength: "guidance", claim: "Psychological treatments are the first treatment for depression; for moderate and severe depression they can be combined with antidepressant medicine." },
    dep_self: { src: "who_dep", strength: "guidance", claim: "Staying connected with friends and family, regular exercise even if short, and regular sleep and eating habits can help." },
    dep_talk: { src: "who_dep", strength: "guidance", claim: "Talking to someone you trust and seeing a health-care provider are recommended steps." },
    dep_seek: { src: "who_dep", strength: "guidance", claim: "Seek care if you have symptoms of depression; contact emergency services or a crisis line if in immediate danger of harming yourself." },

    str_def: { src: "who_stress", strength: "definition", claim: "Stress is a state of worry or mental tension caused by a difficult situation." },
    str_natural: { src: "who_stress", strength: "fact", claim: "Stress is a natural human response that prompts us to address challenges and threats." },
    str_little: { src: "who_stress", strength: "fact", claim: "A little stress can help us perform daily activities; too much stress can cause physical and mental health problems." },
    str_body: { src: "who_stress", strength: "fact", claim: "Stress can show up as headaches or other body pains, an upset stomach, or trouble sleeping." },
    str_routine: { src: "who_stress", strength: "guidance", claim: "Keeping a daily routine can help you feel more in control." },
    str_sleep: { src: "who_stress", strength: "guidance", claim: "Getting plenty of sleep, with regular sleep and wake times, helps manage stress." },
    str_connect: { src: "who_stress", strength: "guidance", claim: "Connecting with others can lift mood and help us feel less stressed." },
    str_move: { src: "who_stress", strength: "guidance", claim: "Regular physical activity, such as a daily walk, can reduce stress." },
    str_news: { src: "who_stress", strength: "guidance", claim: "Limiting news exposure can help if it adds to your stress." },
    str_help: { src: "who_stress", strength: "guidance", claim: "If we have difficulty coping with stress, we should seek help from a trusted health-care provider or another trusted person." },
    burn_def: { src: "who_burn", strength: "definition", claim: "In ICD-11, burn-out is a syndrome resulting from chronic workplace stress that has not been successfully managed." },
    burn_dims: { src: "who_burn", strength: "definition", claim: "Burn-out has three dimensions: exhaustion, mental distance or cynicism about one's job, and reduced professional efficacy." },
    burn_occ: { src: "who_burn", strength: "definition", claim: "Burn-out is an occupational phenomenon, not classified as a medical condition, and refers specifically to the work context." },
    nhs_prior: { src: "nhs_stress", strength: "guidance", claim: "Prioritise the tasks that matter most and accept that you will not get everything done." },
    nhs_metime: { src: "nhs_stress", strength: "guidance", claim: "Set aside some time for yourself each week, away from work." },
    nhs_exnot: { src: "nhs_stress", strength: "fact", claim: "Exercise will not make stress disappear, but it can reduce its emotional intensity." },
    nhs_talk: { src: "nhs_stress", strength: "guidance", claim: "Talking things through with a friend may help you find solutions." },

    anx_normal: { src: "nimh_anx", strength: "fact", claim: "Feeling anxious is a normal part of life." },
    anx_more: { src: "nimh_anx", strength: "definition", claim: "In anxiety disorders, anxiety does not go away, is felt in many situations and can get worse over time." },
    anx_def: { src: "who_anx", strength: "definition", claim: "People with anxiety disorders often experience fear and worry that is intense and excessive." },
    anx_common: { src: "who_anx", strength: "fact", claim: "WHO estimates 470 million people had an anxiety disorder in 2023." },
    anx_treat: { src: "who_anx", strength: "fact", claim: "There are highly effective treatments for anxiety disorders; cognitive-behavioural approaches have the most evidence." },
    anx_self: { src: "who_anx", strength: "guidance", claim: "Slow breathing, relaxation and a few minutes of mindfulness a day can help." },
    anx_avoid: { src: "nhs_panic", strength: "guidance", claim: "Do not avoid situations that make you anxious; slowly build up time in them to gradually reduce anxiety." },
    anx_gp: { src: "nhs_panic", strength: "guidance", claim: "See a GP if you are struggling to cope with anxiety, fear or panic, or if the things you are trying yourself are not helping." },
    breath: { src: "nhs_breath", strength: "guidance", claim: "A calming breathing technique can help with stress, anxiety and panic, practised daily for a few minutes." },

    ocd_obs: { src: "nhs_ocd", strength: "definition", claim: "An obsession is an unwanted and unpleasant thought, image or urge that repeatedly enters your mind." },
    ocd_comp: { src: "nhs_ocd", strength: "definition", claim: "A compulsion is a repetitive behaviour or mental act that a person feels they need to do to temporarily relieve the distress an obsession causes." },
    ocd_cycle: { src: "nhs_ocd_sym", strength: "fact", claim: "A compulsion temporarily relieves the anxiety, but the obsession and anxiety soon return." },
    ocd_examples: { src: "nhs_ocd_sym", strength: "fact", claim: "Common compulsions include cleaning and hand washing, checking, counting, and ordering and arranging." },
    ocd_thoughts: { src: "nhs_ocd_sym", strength: "fact", claim: "Almost everyone has unpleasant or unwanted thoughts at some point; having them does not mean you will act on them." },
    ocd_notall: { src: "nimh_ocd", strength: "fact", claim: "Not all repeated thoughts are obsessions, and not all rituals or habits are compulsions." },
    ocd_control: { src: "nimh_ocd", strength: "fact", claim: "People with OCD often cannot control their obsessions or compulsions, even when they know they are excessive." },
    ocd_time: { src: "mlp_ocd", strength: "definition", claim: "One sign of OCD is spending at least 1 hour a day on these thoughts or behaviours, alongside other signs such as not being able to control them and them causing problems in daily life." },
    ocd_who: { src: "nhs_ocd", strength: "fact", claim: "OCD can affect men, women and children, and it often begins around puberty and early adulthood." },
    ocd_fault: { src: "nhs_ocd", strength: "fact", claim: "Having OCD does not mean you are mad, and it is not your fault." },
    ocd_cbt: { src: "nhs_ocd", strength: "guidance", claim: "Cognitive behavioural therapy (CBT) helps you face your fears and obsessive thoughts without putting them right through compulsions; SSRI medicines can also be used." },
    ocd_erp: { src: "nimh_ocd", strength: "fact", claim: "Exposure and response prevention (ERP), a specific type of CBT, effectively reduces compulsive behaviours." },
    ocd_treat: { src: "nhs_ocd", strength: "guidance", claim: "It is unlikely OCD will get better without proper treatment and support." },
    ocd_gp: { src: "nhs_ocd", strength: "guidance", claim: "If you keep getting these thoughts and they affect your daily life, speak to a GP." }
  };

  /* Letters. Each sentence carries claim ids; the reader numbers sources per letter. */
  const LETTERS = {
    gloom: {
      title: "Depression",
      from: "A letter left behind by the Gloom",
      blocks: [
        { h: "What it is", lines: [
          ["Depression is a common health condition. It means a low mood, or losing interest and enjoyment in things, for a long stretch of time.", ["dep_def", "dep_common"]],
          ["It is more than a few sad days. It can change how you think and feel and get in the way of daily life.", ["dep_more"]],
          ["In a depressive episode, signs last most of the day, nearly every day, for at least two weeks.", ["dep_2w"]]
        ]},
        { h: "Myth vs Fact", myths: [
          { m: "Depression is a sign of weakness.", f: "It is not weakness, and it can happen to anyone.", c: ["dep_weak", "dep_anyone"] },
          { m: "You can just snap out of it.", f: "Pulling yourself together does not cure depression. It is a real illness.", c: ["dep_weak", "dep_real"] },
          { m: "It is just a few sad days.", f: "It is more than a few sad days. Signs last most of the day, nearly every day, for at least two weeks.", c: ["dep_more", "dep_2w"] }
        ], facts: [
          { t: "Depression can happen to anyone.", c: ["dep_anyone"] },
          { t: "Depression is a real illness.", c: ["dep_real"] },
          { t: "With treatment and support, most people recover.", c: ["dep_recover"] }
        ]},
        { h: "What can help", lines: [
          ["Talking therapies are the first treatment WHO recommends. For moderate or severe depression, a doctor may also suggest medicine.", ["dep_treat"]],
          ["Staying in touch with people, exercising regularly (even a short walk), and keeping regular sleep and meals can help.", ["dep_self"]],
          ["With the right treatment and support, most people with depression can make a full recovery.", ["dep_recover"]]
        ]},
        { h: "When to reach out", lines: [
          ["If you notice these signs in yourself, talk to someone you trust and see a doctor or health worker.", ["dep_talk", "dep_seek"]],
          ["If you are in immediate danger of harming yourself, contact local emergency services or a crisis line now.", ["dep_seek"]]
        ]}
      ]
    },
    deadline: {
      title: "Stress and Burnout",
      from: "A letter left behind by the Deadline",
      blocks: [
        { h: "What it is", lines: [
          ["Stress is worry or tension caused by a hard situation. It is a natural response that helps us face challenges.", ["str_def", "str_natural"]],
          ["A little stress can help, but too much can cause physical and mental health problems. Stress can show up as headaches, an upset stomach or trouble sleeping.", ["str_little", "str_body"]],
          ["Burn-out is how WHO describes chronic work stress that has not been managed: exhaustion, feeling distant or cynical about your job, and feeling less effective at work. WHO calls it a work phenomenon, not a medical condition.", ["burn_def", "burn_dims", "burn_occ"]]
        ]},
        { h: "Myth vs Fact", myths: [
          { m: "All stress is bad for you.", f: "A little stress can help you get things done. Too much is the problem.", c: ["str_little"] },
          { m: "Burnout just means being tired.", f: "Burn-out also brings cynicism about work and feeling less effective.", c: ["burn_dims"] },
          { m: "Exercise makes stress disappear.", f: "Exercise won't erase stress, but it can make it feel less intense.", c: ["nhs_exnot"] }
        ], facts: [
          { t: "Stress is a natural human response.", c: ["str_natural"] },
          { t: "Talking with others can ease stress.", c: ["str_connect"] },
          { t: "Regular sleep times help manage stress.", c: ["str_sleep"] }
        ]},
        { h: "What can help", lines: [
          ["A daily routine, enough sleep, regular movement like a walk, and time with people you trust can all help.", ["str_routine", "str_sleep", "str_move", "str_connect"]],
          ["Do the tasks that matter most first, accept that not everything will get done, and keep some time each week just for you.", ["nhs_prior", "nhs_metime"]]
        ]},
        { h: "When to reach out", lines: [
          ["If stress feels hard to cope with, talk to a health worker or someone you trust.", ["str_help"]],
          ["If you are in immediate danger of harming yourself, contact local emergency services or a crisis line now.", ["dep_seek"]]
        ]}
      ]
    },
    crowd: {
      title: "Anxiety",
      from: "A letter left behind by the Crowd",
      blocks: [
        { h: "What it is", lines: [
          ["Feeling anxious sometimes is a normal part of life.", ["anx_normal"]],
          ["With an anxiety disorder, fear and worry are intense and excessive. They do not go away, show up in many situations, and can get worse over time.", ["anx_def", "anx_more"]],
          ["Anxiety disorders are common. WHO estimates 470 million people lived with one in 2023.", ["anx_common"]]
        ]},
        { h: "Myth vs Fact", myths: [
          { m: "Feeling anxious means something is wrong.", f: "Feeling anxious now and then is a normal part of life.", c: ["anx_normal"] },
          { m: "Avoiding scary places fixes anxiety.", f: "Slowly spending more time in worrying situations can reduce anxiety.", c: ["anx_avoid"] },
          { m: "Anxiety disorders can't be treated.", f: "There are highly effective treatments for anxiety disorders.", c: ["anx_treat"] }
        ], facts: [
          { t: "Feeling anxious is a normal part of life.", c: ["anx_normal"] },
          { t: "Effective treatments for anxiety disorders exist.", c: ["anx_treat"] },
          { t: "Slow breathing can help calm anxiety.", c: ["anx_self", "breath"] }
        ]},
        { h: "What can help", lines: [
          ["For anxiety disorders, talking therapies based on cognitive-behavioural therapy have the most evidence.", ["anx_treat"]],
          ["Slow breathing, relaxation, and a few minutes of mindfulness each day can help. A calm breathing exercise takes only a few minutes.", ["anx_self", "breath"]],
          ["Instead of avoiding what makes you anxious, build up time in those situations slowly.", ["anx_avoid"]]
        ]},
        { h: "When to reach out", lines: [
          ["If anxiety feels hard to cope with, or the things you try yourself are not helping, see a doctor. Effective treatments exist.", ["anx_gp", "anx_treat"]],
          ["If you are in immediate danger of harming yourself, contact local emergency services or a crisis line now.", ["dep_seek"]]
        ]}
      ]
    },
    ocd: {
      title: "Obsessive-Compulsive Disorder (OCD)",
      from: "A letter left behind by the Loop",
      blocks: [
        { h: "What it is", lines: [
          ["OCD is a mental health condition with two parts. Obsessions are unwanted thoughts, images or urges that keep coming back. Compulsions are repeated actions or mental acts done to ease the distress they cause.", ["ocd_obs", "ocd_comp"]],
          ["Common compulsions include checking, counting, cleaning and hand washing, and ordering things.", ["ocd_examples"]],
          ["One sign doctors look for is spending at least an hour a day on these thoughts or behaviours, along with other signs.", ["ocd_time"]]
        ]},
        { h: "Myth vs Fact", myths: [
          { m: "OCD just means liking things tidy.", f: "Not all habits are compulsions. OCD means distressing obsessions and compulsions.", c: ["ocd_notall", "ocd_obs", "ocd_comp"] },
          { m: "Doing the ritual fixes the worry.", f: "Relief is only temporary. The obsession and anxiety soon return.", c: ["ocd_cycle"] },
          { m: "A bad thought means you'll act on it.", f: "Almost everyone has unwanted thoughts. Having them does not mean you will act on them.", c: ["ocd_thoughts"] }
        ], facts: [
          { t: "Having OCD is not your fault.", c: ["ocd_fault"] },
          { t: "Knowing it's excessive doesn't make it stop.", c: ["ocd_control"] },
          { t: "Talking therapy can help with OCD.", c: ["ocd_cbt", "ocd_erp"] }
        ]},
        { h: "What can help", lines: [
          ["Cognitive behavioural therapy (CBT) helps people face their fears and obsessive thoughts without putting them right through compulsions.", ["ocd_cbt"]],
          ["Exposure and response prevention (ERP), a type of CBT, effectively reduces compulsive behaviours. SSRI medicines can also help.", ["ocd_erp", "ocd_cbt"]],
          ["OCD can affect men, women and children. It is not your fault.", ["ocd_who", "ocd_fault"]]
        ]},
        { h: "When to reach out", lines: [
          ["If these thoughts keep coming and affect your daily life, talk to a doctor.", ["ocd_gp"]],
          ["OCD is unlikely to get better without proper treatment and support.", ["ocd_treat"]],
          ["If you are in immediate danger of harming yourself, contact local emergency services or a crisis line now.", ["dep_seek"]]
        ]}
      ]
    }
  };

  const UPGRADES = {
    pause: { name: "The Pause", icon: "up_pause", max: 3, tip: "A few minutes of mindfulness a day can help.", c: ["anx_self"], fx: ["Freeze nearby stressors every 10s", "Every 9s", "Every 8s"] },
    boundary: { name: "Boundary", icon: "up_boundary", max: 3, tip: "Do what matters most first. You won't have time for everything.", c: ["nhs_prior"], fx: ["Pushback ring every 4s", "Every 3.5s, wider", "Every 3s, wider"] },
    breath: { name: "Deep Breath", icon: "up_deep_breath", max: 3, tip: "Slow breathing can calm stress and anxiety.", c: ["breath"], fx: ["Breathe charges faster, -10 more Stress", "Faster, -10 more", "Faster, -10 more"] },
    rest: { name: "Rest", icon: "up_rest", max: 3, tip: "A daily routine can help you feel in control.", c: ["str_routine"], fx: ["Stress drains when untouched 3s", "Drains faster", "Drains faster"] },
    sleep: { name: "Sleep Well", icon: "up_sleep_well", max: 3, tip: "Regular sleep times help manage stress.", c: ["str_sleep"], fx: ["+20 max Health", "+40 max Health", "+60 max Health"] },
    friend: { name: "A Friend", icon: "up_friend", max: 3, tip: "Talking with people you trust can lift your mood. A health worker can help too.", c: ["str_connect", "str_help"], fx: ["Lumi blocks a hit every 15s", "Every 12s", "Every 9s"] },
    walk: { name: "Walk It Out", icon: "up_walk", max: 3, tip: "Regular activity, like a daily walk, can reduce stress.", c: ["str_move"], fx: ["+10% speed, quicker dash", "+20%, quicker dash", "+30%, quicker dash"] },
    clear: { name: "Clear Mind", icon: "up_clear_mind", max: 3, tip: "Cutting back on stressful news can help.", c: ["str_news"], fx: ["Bigger orb pickup radius", "Bigger", "Bigger"] }
  };

  const TOOLS = {
    pulse: { name: "Light Wand", icon: "tool_pulse", price: 0, desc: "Rapid bolts of light. Easy to aim, steady damage.", ups: ["Faster fire", "Twin bolts", "Bolts pierce"] },
    journal: { name: "Ink Spread", icon: "tool_journal", price: 150, desc: "A burst of ink pellets. Huge knockback up close.", ups: ["Seven pellets", "Faster reload", "Pellets pierce"] },
    lantern: { name: "Lantern Beam", icon: "tool_lantern", price: 200, desc: "Hold to pour a steady beam of light through everything in its path.", ups: ["Wider beam", "Longer beam", "Calm beam"] },
    net: { name: "Dream Net", icon: "tool_net", price: 300, desc: "Throws a net that bursts into a calming web.", ups: ["Bigger web", "Faster throws", "Blocks shots"] },
    headphones: { name: "Bass Notes", icon: "tool_headphones", price: 250, desc: "Notes that pass through everything and bounce off walls.", ups: ["Faster fire", "Five notes", "Double bounce"] }
  };

  const L = "Lumi", N = "";
  const DIALOGUE = {
    firstLaunch: [[L, "Welcome to ReBloom. This is a calm place. Let's get you ready."]],
    runStart: [[L, "Keep moving. I've got your back."], [L, "Breathe when it gets loud."], [L, "Press Breathe and stay still. It's your strongest move in here."]],
    stress70: [[L, "Stress is climbing. Time to breathe."]],
    orbStreak: [[L, "Nice, the clarity is helping."]],
    resultsBetter: [[L, "You made it further than last time."]],
    resultsSame: [[L, "That was a lot. Resting counts as progress."], [L, "Overwhelm happens. Take a breath, then go again."]],
    upgrade: [[L, "Pick a habit to carry forward."]],
    overwhelmed: [[L, "Too much stress is wearing down your health. Breathe!"]],
    libraryFirst: [[L, "Every letter here is something worth knowing."]],
    gloom: {
      intro: [[L, "The room feels heavy, doesn't it? Stay close, I'm right here."], ["The Gloom", "Everything is too much today..."], [L, "I hear you. We can take this slowly."], ["The Gloom", "Why try?"], [L, "That's the weight talking. Pop the heavy thoughts, one at a time."]],
      p66: [["The Gloom", "Nothing will change."], [L, "Heavy thoughts feel true. They aren't the whole story."]],
      p33: [["The Gloom", "You should be fine by now."], [L, "There's no deadline for feeling better. Keep going."]],
      phase2: [["The Gloom", "You should be fine by now."], [L, "There's no deadline for feeling better."], ["The Gloom", "Nothing will change."], [L, "Heavy thoughts feel true. They aren't the whole story."]],
      phase3: [["The Gloom", "I'm too tired for anything!"], [L, "Tired is allowed. Asking for help is strong, not weak."], [L, "One more push. You're not alone in this."]],
      reframes: ["I'm allowed to rest.", "A low day is not a failed day.", "Small steps still count.", "I can ask someone for help.", "I don't have to feel better right now.", "Being tired is not being weak.", "This feeling does not define me.", "Talking to someone can help."],
      cleared: [[N, "The clouds thin into light."], [L, "You didn't fight yourself. You gave the heavy thoughts less room."], [L, "A Letter is waiting. Read it when you're ready."]],
      mastery: [[L, "An echo of the Gloom. Questions will pop up. Answer right to break through."], [L, "Pick Myth or Fact. Wrong answers just show you the right one."]],
      thoughts: ["Nothing will change", "I should be fine by now", "Too tired for anything", "Too much to face today", "Everyone's moved on"]
    },
    deadline: {
      intro: [[L, "Papers everywhere, and a clock that never stops."], ["The Deadline", "TICK TOCK. You're behind."], ["The Deadline", "Do more. Rest later."], [L, "Deadlines are real. So is rest. Pop the to-dos, breathe when it speeds up."]],
      p66: [["The Deadline", "No time to breathe!"], [L, "Breathing is part of the work."]],
      p33: [["The Deadline", "Just one more hour..."], [L, "Let's set a limit instead."]],
      phase2: [["The Deadline", "No time to breathe!"], [L, "Breathing is part of the work."], ["The Deadline", "Do it all. Do it NOW."], [L, "One thing at a time. That's how it gets done."]],
      phase3: [["The Deadline", "Just one more hour..."], [L, "Let's set a limit instead."], [L, "Rest is part of the plan. Finish this."]],
      reframes: ["I can do one thing at a time.", "Resting is part of the work.", "I can say no to extra work.", "Done is enough for today.", "Breaks are part of working well.", "I can ask for more time.", "I am more than my to-do list."],
      cleared: [[N, "The ticking slows, then stops."], [L, "You set a limit. That's a real skill."], [L, "A Letter is waiting for you."]],
      mastery: [[L, "The Deadline is back. Questions will pop up. Answer right to break through."], [L, "Pick Myth or Fact. Wrong answers just show you the right one."]],
      thoughts: ["I can't keep up", "I must do everything", "Resting is lazy", "Just one more hour", "Reply to everyone now"]
    },
    crowd: {
      intro: [[L, "So many eyes. And a spotlight that won't stay still."], ["The Crowd", "Everyone is watching you."], ["The Crowd", "Don't mess up."], [L, "Keep moving between the lights. When it's too much, breathe out slowly."]],
      p66: [["The Crowd", "They'll judge you."], [L, "A thought is not a fact. Notice it, let it pass."]],
      p33: [["The Crowd", "Everyone else is doing better."], [L, "You're often only seeing their highlights."]],
      phase2: [["The Crowd", "They'll judge you."], [L, "A thought is not a fact. Notice it, let it pass."], ["The Crowd", "Everyone is watching!"], [L, "Keep moving between the lights. Breathe out slowly."]],
      phase3: [["The Crowd", "Everyone else is doing better."], [L, "You're often only seeing their highlights."], [L, "Small steps. You've got this."]],
      reframes: ["A thought is not a fact.", "I can take one small step.", "I can breathe and ground myself.", "I don't have to be perfect.", "I can ask for support.", "Nervous does not mean unable."],
      cleared: [[N, "The masks soften and the lights go warm."], [L, "You didn't need the stage empty. Your breath helped you stay."], [L, "A Letter is waiting for you."]],
      mastery: [[L, "The Crowd again. Questions will pop up. Answer right to break through."], [L, "Pick Myth or Fact. Wrong answers just show you the right one."]],
      thoughts: ["Everyone is watching me", "Everyone's doing better", "What if I mess up", "They'll judge me", "Don't say anything"]
    },
    ocd: {
      intro: [[L, "Everything here is lined up perfectly. Almost too perfectly."], ["The Loop", "Did you lock the door? Check again."], ["The Loop", "It has to feel right."], [L, "See those glowing tiles? Stepping on one feels good for a second. Then the worry comes back."], [L, "In this room, let the urges fade on their own. In real life, therapy helps people practise this."]],
      phase2: [["The Loop", "What if you missed something?"], [L, "The NHS describes this cycle: a compulsion brings relief, but the obsession and anxiety soon return. [NHS]"], ["The Loop", "Once more. Just to be sure."], [L, "Notice the urge. You don't have to obey it."]],
      phase3: [["The Loop", "IT'S NOT RIGHT YET!"], [L, "CBT helps people face their fears without putting them right through compulsions. [NHS]"], [L, "You're doing exactly that. Hold steady."]],
      reframes: ["A thought is just a thought.", "I can feel unsure and still move on.", "The urge will pass.", "I don't have to check again.", "Uncertain is okay."],
      cleared: [["", "The loop unwinds, one thread at a time."], [L, "You let the urges pass without obeying them. That takes real courage."], [L, "A Letter is waiting for you."]],
      mastery: [[L, "The Loop again. Questions will pop up. Answer right to break through."], [L, "Pick Myth or Fact. Wrong answers just show you the right one."]],
      thoughts: ["Check it again", "What if you missed something", "It's not right yet", "Count again from the start", "Just once more to be sure"]
    },
    roomIntro: {
      gloom: [[L, "This is the Rainy Room. Heavy, grey and slow."], [L, "Depression can happen to anyone. It's a real illness, not a sign of weakness. [WHO, NHS]"], [L, "Keep moving, collect clarity, and breathe when it gets loud."]],
      deadline: [[L, "The Overflowing Desk. Everything here feels urgent."], [L, "WHO calls stress a natural response to challenges. A little can help; too much can harm your health. [WHO]"], [L, "Do what matters most first. You won't have time for everything. [NHS]"]],
      crowd: [[L, "The Empty Theatre. It feels like every seat is watching."], [L, "Feeling anxious is a normal part of life. In an anxiety disorder, it's intense and doesn't go away. [NIMH, WHO]"], [L, "Stay out of the spotlight, and breathe out slowly."]],
      ocd: [[L, "The Perfect Room. Every object is exactly in its place."], [L, "OCD isn't about liking things tidy. Not all habits are compulsions. [NIMH]"], [L, "If a glowing tile calls to you, try letting the urge pass."]]
    },
    tileTempt: [[L, "Felt good for a moment, right? Watch the stress come back. That's the loop."]],
    tileResist: [[L, "You let that urge fade. In therapy, people practise this step by step."]]
  };
  const NOTES = {
    gloom: ["dep_anyone", "dep_more", "dep_weak", "dep_recover", "dep_self", "dep_treat"],
    deadline: ["str_natural", "str_little", "str_body", "burn_def", "str_sleep", "str_connect", "nhs_prior"],
    crowd: ["anx_normal", "anx_def", "anx_common", "anx_treat", "anx_avoid", "breath"],
    ocd: ["ocd_obs", "ocd_comp", "ocd_cycle", "ocd_thoughts", "ocd_notall", "ocd_erp", "ocd_fault"]
  };

  window.SANCTUARY_CONTENT = { ACCESSED, SOURCES, CLAIMS, LETTERS, UPGRADES, TOOLS, DIALOGUE, NOTES };
})();
