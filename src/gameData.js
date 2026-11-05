export const game={
  "title": "ARTHUR: BY DESIGN",
  "thesis": "Every AI investment creates a design obligation.",
  "settings": [
    {
      "id": "hospital",
      "label": "HOSPITAL → HOME",
      "promise": "LEAVE WELL",
      "need": "Can Arthur leave safely, understand what happens next and complete the transition?",
      "event": "One elevator serving Arthur’s discharge path is unexpectedly unavailable.",
      "principle": "FIRMITAS",
      "principleQuestion": "Did the arrangement hold when conditions changed, and could it adapt?",
      "capabilities": [
        {
          "id": "ambient",
          "name": "Ambient Discharge + Handoff",
          "purpose": "Creates and shares a clear transition plan.",
          "question": "Where should the discharge conversation happen?",
          "choices": [
            {
              "id": "bedside",
              "label": "Adapt the bedside environment",
              "benefit": "Arthur avoids another move.",
              "compromise": "Privacy and interruption remain constrained.",
              "outcome": "STRAINED",
              "arthur": "Arthur receives the plan, but the elevator delay extends bedside interruptions and family participation is uneven.",
              "held": "The care conversation remained available.",
              "failed": "The setting was never protected from disruption.",
              "aha": "AI created the plan; design still had to protect the conversation."
            },
            {
              "id": "shared",
              "label": "Use a shared consultation room",
              "benefit": "Family can participate in a clearer conversation.",
              "compromise": "Requires room availability and another patient movement.",
              "outcome": "EXPOSED",
              "arthur": "The unavailable elevator prevents timely access to the consultation room, delaying Arthur’s transition conversation.",
              "held": "The room would have supported clarity.",
              "failed": "The design depended on movement without a fallback.",
              "aha": "A better destination is not usable without a resilient path."
            },
            {
              "id": "dedicated",
              "label": "Protect transition space on the unit",
              "benefit": "Creates a dependable setting close to Arthur.",
              "compromise": "Displaces another use and needs operating ownership.",
              "outcome": "ABSORBED",
              "arthur": "Arthur completes the conversation in protected transition space despite the elevator outage.",
              "held": "The setting and ownership remained available.",
              "failed": "The team accepted less flexible use of space.",
              "aha": "Protected capacity turns an AI capability into a dependable care experience."
            }
          ]
        },
        {
          "id": "wayfinding",
          "name": "Adaptive Wayfinding",
          "purpose": "Guides Arthur and family through a changing route.",
          "question": "How much guidance should remain physical and human?",
          "choices": [
            {
              "id": "digital",
              "label": "Digital guidance first",
              "benefit": "Routes update quickly.",
              "compromise": "Assumes Arthur can see, trust and use the device.",
              "outcome": "STRAINED",
              "arthur": "The route updates, but Arthur hesitates at an unfamiliar detour and needs help.",
              "held": "Information changed quickly.",
              "failed": "Digital guidance alone did not create confidence.",
              "aha": "Usable navigation requires more than accurate directions."
            },
            {
              "id": "layered",
              "label": "Layer digital, physical and human cues",
              "benefit": "Arthur has several ways to recover from confusion.",
              "compromise": "Requires coordinated content ownership.",
              "outcome": "ABSORBED",
              "arthur": "The digital route changes, physical cues reinforce it and a team member confirms the detour.",
              "held": "Multiple cues supported adaptation.",
              "failed": "Coordination requires ongoing ownership.",
              "aha": "Redundancy can be a design strength rather than waste."
            },
            {
              "id": "escort",
              "label": "Prioritize a human transition escort",
              "benefit": "Arthur receives reassurance in the moment.",
              "compromise": "Depends on staffing and handoff reliability.",
              "outcome": "STRAINED",
              "arthur": "The escort adapts the route, but arrival is delayed because coverage is shared.",
              "held": "Human judgment bridged the disruption.",
              "failed": "The design depended on scarce staffing.",
              "aha": "Human support is powerful only when operating capacity is real."
            }
          ]
        },
        {
          "id": "meds",
          "name": "Medication Reconciliation AI",
          "purpose": "Flags discrepancies before Arthur leaves.",
          "question": "Who resolves a discrepancy?",
          "choices": [
            {
              "id": "nurse",
              "label": "Route to the discharging nurse",
              "benefit": "Resolution stays close to Arthur.",
              "compromise": "Adds work during a dense transition.",
              "outcome": "STRAINED",
              "arthur": "The discrepancy is resolved, but the route disruption competes for the nurse’s attention and delays discharge.",
              "held": "Ownership was clear.",
              "failed": "One role absorbed too many transition tasks.",
              "aha": "Clear ownership still needs protected capacity."
            },
            {
              "id": "pharmacy",
              "label": "Create a pharmacy resolution queue",
              "benefit": "Specialist ownership improves accuracy.",
              "compromise": "Adds another handoff and possible delay.",
              "outcome": "EXPOSED",
              "arthur": "The discrepancy waits in the queue while Arthur’s altered route changes timing and coordination.",
              "held": "Specialist review remained available.",
              "failed": "The extra handoff had no timing safeguard.",
              "aha": "Accuracy without flow can still fail Arthur."
            },
            {
              "id": "huddle",
              "label": "Resolve through a transition huddle",
              "benefit": "The whole plan is connected before departure.",
              "compromise": "Requires protected time and attendance.",
              "outcome": "ABSORBED",
              "arthur": "The huddle resolves the discrepancy and adapts the departure plan before Arthur moves.",
              "held": "Clinical and operational decisions stayed connected.",
              "failed": "Protected time had to be defended.",
              "aha": "Integrated decisions absorb disruption better than isolated tools."
            }
          ]
        },
        {
          "id": "command",
          "name": "Command Center Operations",
          "purpose": "Coordinates capacity, movement and response.",
          "question": "Who owns the response when a blockage is detected?",
          "choices": [
            {
              "id": "unit",
              "label": "Keep ownership with the unit",
              "benefit": "The closest team acts.",
              "compromise": "The unit may not control system constraints.",
              "outcome": "STRAINED",
              "arthur": "The unit recognizes the blockage but must negotiate alternatives across departments.",
              "held": "Local context was strong.",
              "failed": "Authority stopped at the unit boundary.",
              "aha": "Visibility is not authority."
            },
            {
              "id": "center",
              "label": "Give the command center escalation authority",
              "benefit": "Cross-department action is possible.",
              "compromise": "Requires trusted rules and authority.",
              "outcome": "ABSORBED",
              "arthur": "The command center secures an alternate route and aligns transport before Arthur leaves.",
              "held": "Information triggered coordinated action.",
              "failed": "The model depends on legitimate operating authority.",
              "aha": "A command center coordinates capacity; it does not create it."
            },
            {
              "id": "liaison",
              "label": "Assign a transition liaison",
              "benefit": "Arthur has one accountable guide.",
              "compromise": "The role must be staffed and sustained.",
              "outcome": "ABSORBED",
              "arthur": "The liaison reroutes Arthur and keeps the family informed throughout the delay.",
              "held": "One person held the journey together.",
              "failed": "The role creates a continuing staffing obligation.",
              "aha": "Continuity can be designed as a human capability."
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
      "event": "Arthur’s home internet becomes unreliable for one day.",
      "principle": "UTILITAS",
      "principleQuestion": "Could Arthur and the team actually use the design to accomplish the task?",
      "capabilities": [
        {
          "id": "monitor",
          "name": "Continuous Recovery Monitoring",
          "purpose": "Detects meaningful changes in recovery.",
          "question": "When should a signal become an intervention?",
          "choices": [
            {
              "id": "fixed",
              "label": "Use fixed clinical thresholds",
              "benefit": "Rules are consistent.",
              "compromise": "May miss change unique to Arthur.",
              "outcome": "EXPOSED",
              "arthur": "Connectivity gaps hide a meaningful change until the next successful upload.",
              "held": "Threshold logic remained clear.",
              "failed": "The design assumed continuous data.",
              "aha": "Monitoring is only useful when missingness is designed for."
            },
            {
              "id": "trend",
              "label": "Use Arthur’s personal trend",
              "benefit": "Deviation from baseline becomes visible.",
              "compromise": "Needs enough reliable data.",
              "outcome": "STRAINED",
              "arthur": "The system identifies uncertainty caused by missing data, but the team must interpret whether Arthur changed.",
              "held": "The trend exposed the gap.",
              "failed": "The response path was not automatic.",
              "aha": "Uncertainty must trigger an owned response."
            },
            {
              "id": "review",
              "label": "Combine signal with human review",
              "benefit": "Context informs action.",
              "compromise": "Requires response capacity.",
              "outcome": "ABSORBED",
              "arthur": "The missing-data alert triggers a human check-in and the team confirms Arthur’s condition.",
              "held": "The design connected detection to action.",
              "failed": "Coverage must be staffed.",
              "aha": "Human review can make AI resilient rather than redundant."
            }
          ]
        },
        {
          "id": "assistant",
          "name": "Virtual Recovery Assistant",
          "purpose": "Helps Arthur understand the next step.",
          "question": "What happens when Arthur cannot resolve something digitally?",
          "choices": [
            {
              "id": "callback",
              "label": "Offer a scheduled callback",
              "benefit": "A human path is dependable.",
              "compromise": "Help is not immediate.",
              "outcome": "STRAINED",
              "arthur": "Arthur records the question offline and receives help later, but confidence dips in the meantime.",
              "held": "A fallback existed.",
              "failed": "The fallback did not match the urgency.",
              "aha": "Availability and timing are part of usability."
            },
            {
              "id": "live",
              "label": "Escalate to live support",
              "benefit": "Uncertainty is resolved in the moment.",
              "compromise": "Requires staffed coverage and routing.",
              "outcome": "ABSORBED",
              "arthur": "The assistant switches Arthur to telephone support and the question is resolved.",
              "held": "The channel changed without losing ownership.",
              "failed": "Live capacity must be sustained.",
              "aha": "A digital front door needs a real back door."
            },
            {
              "id": "caregiver",
              "label": "Invite a trusted caregiver",
              "benefit": "Support extends around Arthur.",
              "compromise": "Requires consent and can shift burden.",
              "outcome": "STRAINED",
              "arthur": "The caregiver helps Arthur continue, but responsibility shifts away from the care team.",
              "held": "Arthur was not left alone.",
              "failed": "The model relied on unpaid capacity.",
              "aha": "Family involvement should be chosen, not assumed."
            }
          ]
        },
        {
          "id": "homeadapt",
          "name": "Adaptive Home Recovery",
          "purpose": "Adjusts prompts to Arthur’s home conditions.",
          "question": "Where should recovery prompts appear?",
          "choices": [
            {
              "id": "phone",
              "label": "Keep prompts on Arthur’s phone",
              "benefit": "Uses a familiar device.",
              "compromise": "Prompts compete with digital noise.",
              "outcome": "EXPOSED",
              "arthur": "Unreliable connectivity prevents timely prompts and Arthur misses a recovery step.",
              "held": "The device was familiar.",
              "failed": "The design had no offline layer.",
              "aha": "Familiar technology is not automatically resilient."
            },
            {
              "id": "environment",
              "label": "Place cues in the home",
              "benefit": "Meets Arthur in daily life.",
              "compromise": "Setup may feel intrusive.",
              "outcome": "ABSORBED",
              "arthur": "Visible home cues keep Arthur’s routine intact during the outage.",
              "held": "The environment carried the plan.",
              "failed": "The intervention occupies personal space.",
              "aha": "Sometimes the best digital design includes physical reinforcement."
            },
            {
              "id": "hybrid",
              "label": "Use a simple hybrid routine",
              "benefit": "Digital and visible cues reinforce each other.",
              "compromise": "Channels must stay synchronized.",
              "outcome": "ABSORBED",
              "arthur": "Offline cues sustain the routine and the app reconciles progress when service returns.",
              "held": "The design degraded gracefully.",
              "failed": "Synchronization requires governance.",
              "aha": "Resilience comes from intentional redundancy."
            }
          ]
        },
        {
          "id": "visit",
          "name": "AI-Supported Virtual Visit",
          "purpose": "Prepares a focused remote follow-up.",
          "question": "Where and how will Arthur participate?",
          "choices": [
            {
              "id": "personal",
              "label": "Use Arthur’s preferred device",
              "benefit": "Feels familiar and convenient.",
              "compromise": "Connectivity and privacy vary.",
              "outcome": "EXPOSED",
              "arthur": "The visit cannot stabilize on Arthur’s connection and must be rescheduled.",
              "held": "The setup was convenient.",
              "failed": "Convenience depended on home infrastructure.",
              "aha": "Access conditions are part of the clinical design."
            },
            {
              "id": "kit",
              "label": "Provide a configured recovery kit",
              "benefit": "Interaction is more reliable.",
              "compromise": "Adds logistics and support.",
              "outcome": "STRAINED",
              "arthur": "The kit preserves audio by cellular backup, but video quality limits assessment.",
              "held": "Purpose-built support reduced failure.",
              "failed": "The backup still had limits.",
              "aha": "Reliability has levels, not a binary state."
            },
            {
              "id": "local",
              "label": "Offer a nearby supported access point",
              "benefit": "Equipment and help are dependable.",
              "compromise": "Arthur must travel.",
              "outcome": "ABSORBED",
              "arthur": "Arthur completes the visit at a nearby supported site.",
              "held": "A dependable alternative existed.",
              "failed": "The burden shifted to movement and transport.",
              "aha": "Access can be distributed across place, not only home."
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
      "event": "Arthur arrives when the usual community host is unexpectedly absent.",
      "principle": "VENUSTAS",
      "principleQuestion": "Did Arthur experience dignity, confidence, connection and belonging?",
      "capabilities": [
        {
          "id": "community",
          "name": "Recovery Community",
          "purpose": "Connects Arthur with peers and activities.",
          "question": "How will Arthur encounter belonging?",
          "choices": [
            {
              "id": "digital",
              "label": "Begin with a digital peer group",
              "benefit": "Lowers the barrier to first participation.",
              "compromise": "Connection can remain distant.",
              "outcome": "STRAINED",
              "arthur": "Arthur recognizes peers online, but arrival without a host still feels uncertain.",
              "held": "A social connection existed.",
              "failed": "Digital familiarity did not orient the place.",
              "aha": "Belonging must cross from screen to setting."
            },
            {
              "id": "hosted",
              "label": "Create a hosted welcome",
              "benefit": "The first encounter is personal and navigable.",
              "compromise": "Depends on reliable people and ownership.",
              "outcome": "EXPOSED",
              "arthur": "The absent host leaves Arthur without the promised welcome or a clear alternative.",
              "held": "The intended experience was strong.",
              "failed": "The design relied on one person.",
              "aha": "A beautiful experience that depends on one person is fragile."
            },
            {
              "id": "buddy",
              "label": "Pair Arthur with a recovery peer",
              "benefit": "Creates a trusted relationship.",
              "compromise": "Requires matching and support.",
              "outcome": "ABSORBED",
              "arthur": "Arthur’s peer recognizes the gap, welcomes Arthur and connects him with the group.",
              "held": "A relationship carried continuity.",
              "failed": "The peer role needs boundaries and support.",
              "aha": "Belonging can be a resilient operating capability."
            }
          ]
        },
        {
          "id": "mobility",
          "name": "Adaptive Mobility Coach",
          "purpose": "Builds confidence through meaningful activity.",
          "question": "Where should progress become visible?",
          "choices": [
            {
              "id": "private",
              "label": "Keep progress private",
              "benefit": "Protects autonomy.",
              "compromise": "The team sees less context.",
              "outcome": "STRAINED",
              "arthur": "Arthur knows what activity is appropriate but has no one to orient him at arrival.",
              "held": "Personal confidence was supported.",
              "failed": "The setting could not see the need.",
              "aha": "Privacy and support must be deliberately balanced."
            },
            {
              "id": "shared",
              "label": "Share agreed milestones",
              "benefit": "Enables encouragement and adjustment.",
              "compromise": "Requires consent and interpretation.",
              "outcome": "STRAINED",
              "arthur": "The team recognizes Arthur’s progress and reaches out, but only after the missed welcome becomes visible.",
              "held": "Shared information enabled recovery.",
              "failed": "Information did not create local ownership.",
              "aha": "Visibility must connect to response."
            },
            {
              "id": "place",
              "label": "Connect milestones to community places",
              "benefit": "Makes recovery meaningful in daily life.",
              "compromise": "Adds access and transport dependencies.",
              "outcome": "ABSORBED",
              "arthur": "Arthur uses a familiar place-based milestone to begin independently and another participant joins him.",
              "held": "The place itself supported confidence.",
              "failed": "Success depends on accessible community settings.",
              "aha": "Venustas is confidence and belonging, not decoration."
            }
          ]
        },
        {
          "id": "social",
          "name": "Social Connection Navigator",
          "purpose": "Matches Arthur to fitting opportunities.",
          "question": "Who verifies a recommended connection?",
          "choices": [
            {
              "id": "arthur",
              "label": "Let Arthur curate recommendations",
              "benefit": "Centers agency.",
              "compromise": "Arthur judges unfamiliar options alone.",
              "outcome": "EXPOSED",
              "arthur": "Without the host, Arthur cannot verify where to go and leaves before connecting.",
              "held": "Arthur retained control.",
              "failed": "The design placed all uncertainty on Arthur.",
              "aha": "Agency should not mean abandonment."
            },
            {
              "id": "navigator",
              "label": "Use a community navigator",
              "benefit": "Adds local knowledge and context.",
              "compromise": "Requires a sustained human role.",
              "outcome": "ABSORBED",
              "arthur": "The navigator is alerted, contacts Arthur and redirects the welcome.",
              "held": "Local knowledge activated a fallback.",
              "failed": "The role needs ongoing funding.",
              "aha": "Connection becomes reliable when someone owns it."
            },
            {
              "id": "network",
              "label": "Invite Arthur’s trusted network",
              "benefit": "Builds on existing relationships.",
              "compromise": "May narrow options or expose goals.",
              "outcome": "STRAINED",
              "arthur": "A trusted contact helps Arthur stay, but the community design relies on personal goodwill.",
              "held": "A known relationship reduced uncertainty.",
              "failed": "The model shifted work outside the program.",
              "aha": "Trust is an asset, but it should not hide operating gaps."
            }
          ]
        },
        {
          "id": "risk",
          "name": "Participation Risk Signals",
          "purpose": "Identifies loss of confidence or connection.",
          "question": "What response follows a risk signal?",
          "choices": [
            {
              "id": "prompt",
              "label": "Prompt Arthur privately",
              "benefit": "Preserves independence.",
              "compromise": "Arthur may ignore or misunderstand it.",
              "outcome": "EXPOSED",
              "arthur": "Arthur receives a prompt after hesitation, but no one is present to help and the prompt cannot restore belonging.",
              "held": "The signal reached Arthur.",
              "failed": "The response was informational, not relational.",
              "aha": "A signal is not support."
            },
            {
              "id": "outreach",
              "label": "Trigger personal outreach",
              "benefit": "Creates an active safety net.",
              "compromise": "Requires capacity and can feel intrusive.",
              "outcome": "STRAINED",
              "arthur": "Outreach catches Arthur before he leaves and connects him remotely, but arrival still feels impersonal.",
              "held": "The risk produced action.",
              "failed": "The response came after the experience broke.",
              "aha": "Recovery is better than prevention, but not the same."
            },
            {
              "id": "huddle",
              "label": "Review signals in a community huddle",
              "benefit": "Combines perspectives.",
              "compromise": "Response is slower and data is shared.",
              "outcome": "EXPOSED",
              "arthur": "The huddle reviews the event later, after Arthur has already left.",
              "held": "The system can learn.",
              "failed": "The response cycle was too slow for the moment.",
              "aha": "Governance must match the speed of the human need."
            }
          ]
        }
      ]
    }
  ]
}