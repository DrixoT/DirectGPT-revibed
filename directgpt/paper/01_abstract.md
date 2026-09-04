## **ABSTRACT** 

We characterize and demonstrate how the principles of direct manipulation can improve interaction with large language models. This includes: continuous representation of generated objects of 

> ∗Also with University of Toronto. 

> †Also with University of Waterloo. 

> ‡Also with Institut Universitaire de France. 

> §Also with University of Waterloo. 

Permission to make digital or hard copies of all or part of this work for personal or classroom use is granted without fee provided that copies are not made or distributed for proft or commercial advantage and that copies bear this notice and the full citation on the frst page. Copyrights for components of this work owned by others than the author(s) must be honored. Abstracting with credit is permitted. To copy otherwise, or republish, to post on servers or to redistribute to lists, requires prior specifc permission and/or a fee. Request permissions from permissions@acm.org. _CHI ’24, May 11–16, 2024, Honolulu, HI, USA_ 

© 2024 Copyright held by the owner/author(s). Publication rights licensed to ACM. ACM ISBN 979-8-4007-0330-0/24/05 https://doi.org/10.1145/3613904.3642462 

interest; reuse of prompt syntax in a toolbar of commands; manipulable outputs to compose or control the efect of prompts; and undo mechanisms. This idea is exemplifed in DirectGPT, a user interface layer on top of ChatGPT that works by transforming direct manipulation actions to engineered prompts. A study shows participants were 50% faster and relied on 50% fewer and 72% shorter prompts to edit text, code, and vector images compared to baseline ChatGPT. Our work contributes a validated approach to integrate LLMs into traditional software using direct manipulation. Data, code, and demo available at https://osf.io/3wt6s.

## **CCS CONCEPTS** 

- **Human-centered computing** → **Interactive systems and** 

- **tools** ; **Interaction design theory, concepts and paradigms** .

## **KEYWORDS** 

direct manipulation, large language models, prompt engineering 

CHI ’24, May 11–16, 2024, Honolulu, HI, USA 

Damien Masson, Sylvain Malacria, Géry Casiez, and Daniel Vogel 

### **ACM Reference Format:** 

Damien Masson, Sylvain Malacria, Géry Casiez, and Daniel Vogel. 2024. DirectGPT: A Direct Manipulation Interface to Interact with Large Language Models. In _Proceedings of the CHI Conference on Human Factors in Computing Systems (CHI ’24), May 11–16, 2024, Honolulu, HI, USA._ ACM, New York, NY, USA, 16 pages. https://doi.org/10.1145/3613904.3642462

## **1 INTRODUCTION** 

Given a textual instruction in the form of a “prompt”, a large language model (LLM) can generate outputs such as emails, computer code, and vector images. The output often needs to be tweaked by conversing with the LLM until obtaining a satisfactory result. However, this tweaking process uses relatively slow text input, it requires precise references to elements in the output, and the wording must be carefully chosen to workaround unintuitive limitations of LLMs [57, 64, 86]. 

These issues are reminiscent of the reasons why _direct manipulation interfaces_ emerged as an alternative to _command line interfaces_ [30, 67, 68]. The problems identifed 40 years ago also apply to interfaces for LLMs today: (i) _indirect engagement_ due to manipulating natural language instead of the objects of interest; (ii) _semantic distance_ due to the verbosity and difculty to convey intent in a prompt; and (iii) _articulatory distance_ due to the form of prompts being poor representations of the actions they are meant to convey. In fact, interfaces for LLMs like OpenAI’s ChatGPT [56], Google’s Bard [25], and Microsoft’s Bing [49] undermine most of what makes an interface direct. They rely on a linear textual history instead of continuous representation of the objects of interest; carefully crafted prompts remain in the history instead of commands that are rapid, incremental, and reversible; and complex language is manipulated instead of the objects of interest. As a result, current interaction with LLMs lacks most of the benefts of direct manipulation such as improved learnability, speed of execution, goal feedback, and error prevention and recovery [30, 68, 70]. 

Consider the task of tweaking a generated SVG drawing. Directly pointing at shapes and locations using a mouse cursor is much easier than specifying them using words that may rely on metaphors or geometric references. Besides being verbose, these high-level descriptions are quite far from the SVG code that the model generates. There is also ambiguity if the shape appears multiple times or if the wording assumes spatial information that does not align with how the model represents the drawing. Moreover, applying the same transformation to a diferent shape requires going through this process again. These difculties apply when tweaking generated text as well. Consider how replacing a specifc word with a synonym in a body of text requires a careful description of the word to change and its position, the action to be done, and other constraints such as keeping the rest of the text intact. Regardless of what is being generated, mistakes are costly as incorrect results are hard to notice and they remain in the conversation history, possibly impacting future interactions. 

Instead of solely relying on words, we introduce and characterize prompting through direct manipulation as a way to facilitate conversations with LLMs. Directness is created by interacting with the output to refer to specifc objects when crafting new prompts (fg. 1c), or to localize the desired area of efect for the prompt (fg. 1b). Reversibility is realized through typical undo and redo 

features instead of long linear conversations. Immediate feedback is provided by highlighting localized changes and elements about to be modifed. And rapid reusable commands are generated by abstracting previous prompts into templated snippets (fg. 1d). 

To explore the benefts of these principles for LLMs, we implemented them into a prototype system called DirectGPT. In a user study we compare DirectGPT to ChatGPT for text, code, and vector image editing tasks, and found that participants relied and preferred the mechanisms of direct manipulation when accomplishing specifc and localized tasks. Specifcally, participants used 50% fewer and 72% shorter prompts all while being 50% faster and 25% more successful at accomplishing tasks. Beyond our system and its interactions, our fndings inform the design and integration of LLMs and other prompt-driven AI into graphical user interface applications.
