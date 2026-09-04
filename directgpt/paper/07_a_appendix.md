## **A APPENDIX** 

## **A.1 Prompts Generated From Physical Actions** 

Below, we describe the prompts generated from physical actions and that are sent to _gpt-3.5-turbo_ . 

_A.1.1 Localizing the Efect of a Prompt._ Below is the prompt generated from the interaction described in the use case scenario where “a White Rabbit” is selected followed by the prompt “add description of its tail”. The text is the second paragraph from _Alice’s Adventures in Wonderland_ by Lewis Carroll. 

So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly <blank> with pink eyes ran close by her. 

<blank>: a White Rabbit 

- INSTRUCTION: add description of its tail Rewrite <blank>. Follow INSTRUCTION 

- <blank>: 

The result should be only the specifc selected part being rewritten. Then, DirectGPT takes care of incorporating it back into the overall text. 

_A.1.2 Referring to Textual Objects in a Prompt._ Below is the prompt generated from an interaction where two words from the text “hot” and “suddenly” were dropped in a prompt such that it reads “replace [hot] and [suddenly] with synonyms” 

- So she was considering in her own mind (as well as she could, for the 0]hot0] day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when 1]suddenly1] a White Rabbit with pink eyes ran close by her. 

- replace text delimited by 0] and text delimited by 1] with synonyms 

Keep rest of the text identical 

This should result in the whole text being re-written. Note that the choice of delimiter was done to make sure the model would perceive it as a separate token and would not merge it with the surrounding text. This was empirically found to work slightly better than using more standard delimiters such as XML tags for example. 

CHI ’24, May 11–16, 2024, Honolulu, HI, USA 

_A.1.3 Referring to Vector Objects in a Prompt._ Below is the prompt generated from an interaction where the user prompted “draw a line between this and that” and then dropped two circles instead of “this” and “that” 

<svg width="300" height="150"> <circle cx="133" cy="33" r="5" id="c0"></circle> 

Damien Masson, Sylvain Malacria, Géry Casiez, and Daniel Vogel 

<circle cx="151" cy="20" r="5" id="c1"></circle> </svg> 

Return modified SVG code to draw a line between element with id "c0" and element with id "c1" 

This should output the SVG rewritten with the line added. Note DirectGPT makes sure all elements have a unique _id_ . If not, or if the id is not unique, the ids are modifed.
