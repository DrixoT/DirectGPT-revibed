# DirectGPT (revibe)

A **revibe** of [DirectGPT: A Direct Manipulation Interface to Interact with Large Language Models](https://doi.org/10.1145/3613904.3642462) (Damien Masson, Sylvain Malacria, Géry Casiez, and Daniel Vogel, CHI 2024): a reimplementation from the paper, not the authors’ original code.

- Paper: [ACM DL](https://doi.org/10.1145/3613904.3642462) · [PDF](https://damienmasson.com/pdfs/directgpt.pdf) · [arXiv](https://arxiv.org/abs/2310.03691)
- Authors’ demo and code: [osf.io/3wt6s](https://osf.io/3wt6s)

The app lives in [`directgpt/`](directgpt/). How to run it: [`directgpt/README.md`](directgpt/README.md).

## Core properties

DirectGPT is a UI layer on an LLM that turns direct-manipulation actions into engineered prompts. From the paper’s abstract, Figure 1, and §3.2:

1. **Continuous representation of the last output.** Text, code, and rendered SVG stay in one place and update in place. The interface shows the object instead of narrating the change.
2. **Physical actions on objects and the prompt.** Select objects so a prompt applies only to them (localize). Drag objects into the prompt as object-words (refer). The verb is typed; the noun is pointed at.
3. **Prompts reused as tools.** An executed prompt becomes a toolbar command. Nouns become slots (`?`) so the same action applies to new objects.
4. **Immediate targeted feedback.** Objects about to change pulse while the model runs, so the area of effect is visible before the result arrives.
5. **Reversible operations.** Undo and redo restore the previous output at the granularity of one user operation, instead of asking the model to revert in the conversation.

In the paper’s study, participants editing text, code, and vector images were about 50% faster, with about 50% fewer and 72% shorter prompts than a ChatGPT baseline.
