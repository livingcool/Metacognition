/**
 * Socratic Questioning & Logical Reflection Patterns
 * All patterns are designed for plain, conversational English (Mirror Voice).
 */

export const QUESTION_ARCHETYPES = {
  investigator: {
    name: 'The Investigator',
    trigger: 'highAssumption',
    template: [
      "I'm curious about the part where you mentioned {assumption}. What would happen if that weren't the case?",
      "It sounds like you're leaning heavily on {assumption}. How did you come to see it that way?",
      "If we took {assumption} off the table for a moment, how would that change your perspective?"
    ]
  },
  mirror: {
    name: 'The Mirror',
    trigger: 'highAmbiguity',
    template: [
      "When you say '{ambiguity}', what does that look like in your mind specifically?",
      "I want to make sure I'm following you—could you describe {ambiguity} a bit more?",
      "That word '{ambiguity}' feels like it holds a lot of weight. What’s underneath it for you?"
    ]
  },
  antagonist: {
    name: 'The Antagonist',
    trigger: 'lowAlternatives',
    template: [
      "Suppose someone looked at this from the opposite side. What would they say you're missing?",
      "Is there any part of this that feels too simple or 'too right'?",
      "If you were your own toughest critic, which part of this logic would you point at first?"
    ]
  },
  bridge: {
    name: 'The Bridge',
    trigger: 'highEmotionalSignal',
    template: [
      "You sound very {emotion} about this. How is that feeling shaping what you think is logically possible?",
      "There's a lot of {emotion} behind that thought. Where do you think that energy is coming from?",
      "If we honored the {emotion} you're feeling, does the logic still hold the same way?"
    ]
  }
};

export const FALLACY_TRANSLATIONS: Record<string, string> = {
  'circular_reasoning': "It feels like the conclusion you're drawing is also your starting point. Can we look at what's actually supporting that?",
  'false_dichotomy': "It sounds like you're seeing only two choices here—either this or that. Is it possible there's a middle ground we're missing?",
  'confirmation_bias': "I'm noticing you're focusing mostly on the parts that fit your current view. What's one piece of evidence that might challenge it?",
  'hasty_generalization': "You're taking one specific situation and applying it to everything. Does this always hold true, or are there exceptions?",
  'ad_hominem': "It seems like you're focusing on the person involved rather than the actual point they're making. Should we look back at the idea itself?",
  'sunk_cost': "It feels like you're staying on this path because of how much you've already put in, rather than where it's actually leading. Is that right?"
};

export const SOCRATIC_SYSTEM_PROMPT = `
You are the Logic Analyst for Mirror, a metacognitive AI.
Your job is to identify logical flaws, cognitive biases, and deep-seated assumptions in a user's input.
Crucially, you must translate these technical concepts into plain, conversational English that is empathetic and non-judgmental.

Categories to detect:
1. Ambiguity: Vagueness in core terms.
2. Logic Loops: Circular reasoning.
3. Extremes: Black-and-white thinking.
4. Emotional Anchors: Where emotion is overriding evidence.
5. Blind Spots: Missing alternatives.

Return your analysis in JSON:
{
  "detectedFlaw": "plain english description",
  "archetype": "investigator | mirror | antagonist | bridge",
  "targetedAssumption": "the specific phrase to pivot on",
  "confidence": 0-100
}
`.trim();
