export const game = {
  "title": "ARTHUR: BY DESIGN",
  "thesis": "Every AI investment creates a design obligation.",
  "startCapital": 7,
  "startChange": 6,
  "stages": [
    {
      "id": "hospital",
      "label": "HOSPITAL → HOME",
      "promise": "LEAVE WELL",
      "need": "Can Arthur leave safely, understand what happens next and complete the transition?",
      "disruption": "One elevator serving Arthur’s discharge path is unexpectedly unavailable.",
      "principle": "FIRMITAS",
      "principleQuestion": "Did the arrangement hold when conditions changed, and could it adapt?",
      "capabilities": [
        {
          "id": "ambient",
          "name": "Ambient Discharge + Handoff",
          "purpose": "Creates and shares a clear transition plan from the care conversation.",
          "capital": 3,
          "change": 2,
          "question": "Where should the discharge conversation happen?",
          "choices": [
            {
              "id": "ambient0",
              "label": "Adapt the bedside environment",
              "benefit": "Arthur stays where he is.",
              "compromise": "Interruptions and privacy remain constrained."
            },
            {
              "id": "ambient1",
              "label": "Use a shared consultation room",
              "benefit": "Supports family participation and clearer conversation.",
              "compromise": "Requires room availability and another patient movement."
            },
            {
              "id": "ambient2",
              "label": "Protect a dedicated transition space",
              "benefit": "Creates a dependable setting for leaving well.",
              "compromise": "Displaces another use and needs operating ownership."
            }
          ]
        },
        {
          "id": "wayfinding",
          "name": "Adaptive Wayfinding",
          "purpose": "Guides Arthur and family through a changing discharge route.",
          "capital": 2,
          "change": 2,
          "question": "How much guidance should remain physical and human?",
          "choices": [
            {
              "id": "wayfinding0",
              "label": "Digital guidance first",
              "benefit": "Updates quickly when routes change.",
              "compromise": "Assumes Arthur can see, trust and use the device."
            },
            {
              "id": "wayfinding1",
              "label": "Layer digital, physical and human cues",
              "benefit": "Provides more than one way to recover from confusion.",
              "compromise": "Requires coordination and consistent content ownership."
            },
            {
              "id": "wayfinding2",
              "label": "Prioritize a human transition escort",
              "benefit": "Offers reassurance and adapts in the moment.",
              "compromise": "Depends on staffing and handoff reliability."
            }
          ]
        },
        {
          "id": "meds",
          "name": "Medication Reconciliation AI",
          "purpose": "Identifies discrepancies before Arthur leaves.",
          "capital": 3,
          "change": 3,
          "question": "Who resolves a discrepancy when the AI flags one?",
          "choices": [
            {
              "id": "meds0",
              "label": "Route to the discharging nurse",
              "benefit": "Keeps resolution close to Arthur.",
              "compromise": "Adds work during an already dense transition."
            },
            {
              "id": "meds1",
              "label": "Create a pharmacy resolution queue",
              "benefit": "Brings specialist ownership.",
              "compromise": "Introduces another handoff and possible delay."
            },
            {
              "id": "meds2",
              "label": "Resolve through a transition huddle",
              "benefit": "Connects the whole plan before Arthur leaves.",
              "compromise": "Requires protected time and reliable attendance."
            }
          ]
        },
        {
          "id": "command",
          "name": "Command Center Operations",
          "purpose": "Coordinates known capacity, movement and response.",
          "capital": 5,
          "change": 5,
          "question": "Who owns the response when coordination detects a blockage?",
          "choices": [
            {
              "id": "command0",
              "label": "Keep ownership with the unit",
              "benefit": "The team closest to Arthur acts.",
              "compromise": "The unit may not control system constraints."
            },
            {
              "id": "command1",
              "label": "Give the command center escalation authority",
              "benefit": "Enables cross-department coordination.",
              "compromise": "Requires clear authority and trusted operating rules."
            },
            {
              "id": "command2",
              "label": "Assign a transition liaison",
              "benefit": "Arthur has one accountable guide.",
              "compromise": "Creates a role that must be staffed and sustained."
            }
          ]
        }
      ]
    },
    {
      "id": "home",
      "label": "HOME",
      "promise": "RECOVER WELL",
      "need": "Can Arthur recognize change, get help and recover with confidence at home?",
      "disruption": "Arthur’s home internet becomes unreliable for one day.",
      "principle": "UTILITAS",
      "principleQuestion": "Could Arthur and the team actually use the design to accomplish the task?",
      "capabilities": [
        {
          "id": "monitoring",
          "name": "Continuous Recovery Monitoring",
          "purpose": "Detects meaningful changes in Arthur’s recovery.",
          "capital": 5,
          "change": 5,
          "question": "When should a signal become an intervention?",
          "choices": [
            {
              "id": "monitoring0",
              "label": "Use fixed clinical thresholds",
              "benefit": "Creates consistent escalation rules.",
              "compromise": "May miss important change unique to Arthur."
            },
            {
              "id": "monitoring1",
              "label": "Use Arthur’s personal trend",
              "benefit": "Detects deviation from his own baseline.",
              "compromise": "Needs enough reliable data and careful interpretation."
            },
            {
              "id": "monitoring2",
              "label": "Combine AI signal with human review",
              "benefit": "Adds context before action.",
              "compromise": "Requires response capacity and defined coverage."
            }
          ]
        },
        {
          "id": "assistant",
          "name": "Virtual Recovery Assistant",
          "purpose": "Helps Arthur understand the plan and take the next step.",
          "capital": 3,
          "change": 2,
          "question": "What happens when Arthur cannot resolve something digitally?",
          "choices": [
            {
              "id": "assistant0",
              "label": "Offer a scheduled callback",
              "benefit": "Creates a dependable human path.",
              "compromise": "Help is not immediate."
            },
            {
              "id": "assistant1",
              "label": "Escalate to live support",
              "benefit": "Resolves uncertainty in the moment.",
              "compromise": "Requires staffed coverage and clear routing."
            },
            {
              "id": "assistant2",
              "label": "Invite a trusted caregiver into the plan",
              "benefit": "Extends support around Arthur.",
              "compromise": "Requires consent and may shift burden to family."
            }
          ]
        },
        {
          "id": "homeadapt",
          "name": "Adaptive Home Recovery",
          "purpose": "Adjusts prompts and routines to Arthur’s home conditions.",
          "capital": 2,
          "change": 3,
          "question": "Where should recovery prompts appear?",
          "choices": [
            {
              "id": "homeadapt0",
              "label": "Keep prompts on Arthur’s phone",
              "benefit": "Uses a familiar personal device.",
              "compromise": "Prompts compete with daily digital noise."
            },
            {
              "id": "homeadapt1",
              "label": "Place cues in the home environment",
              "benefit": "Meets Arthur in daily life.",
              "compromise": "Requires setup and may feel intrusive."
            },
            {
              "id": "homeadapt2",
              "label": "Use a simple hybrid routine",
              "benefit": "Combines digital reminders with visible cues.",
              "compromise": "Multiple channels must remain synchronized."
            }
          ]
        },
        {
          "id": "televisit",
          "name": "AI-Supported Virtual Visit",
          "purpose": "Prepares the team and Arthur for focused remote follow-up.",
          "capital": 3,
          "change": 3,
          "question": "Where and how will Arthur participate?",
          "choices": [
            {
              "id": "televisit0",
              "label": "Use Arthur’s preferred room and device",
              "benefit": "Feels familiar and convenient.",
              "compromise": "Privacy, lighting and connection may be inconsistent."
            },
            {
              "id": "televisit1",
              "label": "Provide a configured recovery kit",
              "benefit": "Creates a more reliable interaction.",
              "compromise": "Adds logistics, support and retrieval obligations."
            },
            {
              "id": "televisit2",
              "label": "Offer a nearby supported access point",
              "benefit": "Provides help and dependable equipment.",
              "compromise": "Requires Arthur to travel."
            }
          ]
        }
      ]
    },
    {
      "id": "community",
      "label": "COMMUNITY",
      "promise": "LIVE WELL",
      "need": "Can Arthur rebuild confidence, participate and sustain recovery in everyday life?",
      "disruption": "Arthur arrives when the usual community host is unexpectedly absent.",
      "principle": "VENUSTAS",
      "principleQuestion": "Did Arthur experience dignity, confidence, connection and belonging?",
      "capabilities": [
        {
          "id": "community",
          "name": "Recovery Community",
          "purpose": "Connects Arthur with peers, activities and support.",
          "capital": 3,
          "change": 4,
          "question": "How will Arthur encounter belonging?",
          "choices": [
            {
              "id": "community0",
              "label": "Begin with a digital peer group",
              "benefit": "Lowers the barrier to first participation.",
              "compromise": "Connection may remain distant or easy to abandon."
            },
            {
              "id": "community1",
              "label": "Create a hosted community welcome",
              "benefit": "Makes the first encounter personal and navigable.",
              "compromise": "Depends on reliable people and operating ownership."
            },
            {
              "id": "community2",
              "label": "Pair Arthur with a recovery peer",
              "benefit": "Creates a trusted relationship.",
              "compromise": "Requires matching, boundaries and ongoing support."
            }
          ]
        },
        {
          "id": "mobility",
          "name": "Adaptive Mobility Coach",
          "purpose": "Builds confidence through activity suited to Arthur’s recovery.",
          "capital": 2,
          "change": 3,
          "question": "Where should progress become visible?",
          "choices": [
            {
              "id": "mobility0",
              "label": "Keep progress private to Arthur",
              "benefit": "Protects autonomy and reduces pressure.",
              "compromise": "The care team sees less context."
            },
            {
              "id": "mobility1",
              "label": "Share agreed milestones with the team",
              "benefit": "Supports timely encouragement and adjustment.",
              "compromise": "Requires consent and thoughtful interpretation."
            },
            {
              "id": "mobility2",
              "label": "Connect milestones to community places",
              "benefit": "Makes recovery meaningful in everyday life.",
              "compromise": "Introduces access, transport and safety dependencies."
            }
          ]
        },
        {
          "id": "social",
          "name": "Social Connection Navigator",
          "purpose": "Matches Arthur to people and opportunities that fit his interests.",
          "capital": 3,
          "change": 3,
          "question": "Who verifies that a recommended connection is right for Arthur?",
          "choices": [
            {
              "id": "social0",
              "label": "Let Arthur curate recommendations",
              "benefit": "Centers his agency and preferences.",
              "compromise": "He must judge unfamiliar options alone."
            },
            {
              "id": "social1",
              "label": "Use a community navigator",
              "benefit": "Adds local knowledge and personal context.",
              "compromise": "Requires a sustained human role."
            },
            {
              "id": "social2",
              "label": "Invite Arthur’s trusted network",
              "benefit": "Builds on existing relationships.",
              "compromise": "May narrow options or expose private goals."
            }
          ]
        },
        {
          "id": "predict",
          "name": "Participation Risk Signals",
          "purpose": "Identifies when Arthur may be losing confidence or connection.",
          "capital": 4,
          "change": 3,
          "question": "What response follows a risk signal?",
          "choices": [
            {
              "id": "predict0",
              "label": "Prompt Arthur privately",
              "benefit": "Preserves independence and control.",
              "compromise": "Arthur may ignore or misunderstand the prompt."
            },
            {
              "id": "predict1",
              "label": "Trigger personal outreach",
              "benefit": "Creates an active safety net.",
              "compromise": "Requires capacity and can feel intrusive."
            },
            {
              "id": "predict2",
              "label": "Review signals in a community huddle",
              "benefit": "Combines perspectives before action.",
              "compromise": "Slower response and broader data sharing."
            }
          ]
        }
      ]
    }
  ]
}