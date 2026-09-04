## **3 DIRECTGPT: AN EXEMPLAR DIRECT INTERFACE FOR LLMS** 

This section describes DirectGPT, a direct manipulation interface to interact with LLMs. To demonstrate the utility of DirectGPT, we frst illustrate its functionalities in a use case scenario. We then follow it with a detailed description of the proposed direct manipulation mechanisms and their implementation. 

## **3.1 Example Use Case** 

Sam is working on a story and would like to revise it before sharing it with friends. Sam starts DirectGPT and pastes the current version of the story. Sam decides that a character, the “White Rabbit”, needs a vivid description when introduced. Sam selects “a White Rabbit” with the mouse cursor, types “add description of its tail” in the prompt feld, and presses enter. The selected text pulses and then is replaced by “a White Rabbit with a fufy, cotton-like tail”. Next, Sam notices that the words “pictures” and “ran” are used repetitively. Sam selects the frst instance of both words (by pressing ctrl while selecting the two words with the cursor) and then types “synonym” (fg. 2a). Again, the two words pulse before being replaced by “illustrations” and “sprinted” (fg. 2b). Later, Sam realizes other words should be substituted. Sam clicks on the “synonym” button in the toolbar that appeared after running the previous prompt. With the cursor now indicating “synonym”, Sam selects a word and it pulses and then is replaced by a synonym (fg. 2c). Sam continues by selecting other words to edit using this ad hoc “synonym tool”. 

Later, Sam decides to illustrate the story with a picture. In DirectGPT, Sam types “draw a fower with 6 petals”. An image with six circles is generated (fve black petals in a circle, and a white circle in the middle). This is a good start, but it lacks a stem and leaves. Sam types “draw a black line from here to there”. Then, Sam clicks the bottom petal, drags it, and drop it on the word “here” in the prompt. Immediately, the word “here” is replaced by a picture of the petal. Next, Sam drags a pixel located near the bottom of the image and drops it on “there” which is replaced by the corresponding pixel coordinates (fg. 3a). After pressing enter, the bottom pedal and 

CHI ’24, May 11–16, 2024, Honolulu, HI, USA 

DirectGPT: A Direct Manipulation Interface to Interact with Large Language Models 



<!-- Start of picture text -->
    Undo     Redo     Undo     Redo     Undo     Redo     Undo     Redo<br>add a line from  (15, 20) to(15, 20)  there Type your prompt here. add a circle like  add a circle like<br>Apply to 1 selected element Apply to 1 selected element Apply to 1 selected element<br>(a) Refer to objects (b) Execute & localize next prompt (c) Refer to an object (d) Execute<br><!-- End of picture text -->

**Figure 3: DirectGPT used to fnish drawing a fower: (a) draw a line by referring to specifc locations through drag-and-drop; (b) the line is drawn, click to specify where to add the circle; (c) refer to another circle to copy its size; (d) the circle is added.** 

pixel location start pulsing until a line is drawn. Next, Sam presses the “draw a black line from ? to ?” button that just appeared in the toolbar. With this ad hoc tool active, Sam clicks on two pixel locations, and a line is drawn. They repeat the operation to create a symmetric branch on the other side of the fower. Finally, Sam clicks the top of the frst line to localize the edit, then types “add a circle like this”, and drags and drops one of the petals onto“this” (fg. 3c). The operation is repeated on the other side to obtain the fnal result (fg. 3d). 

Another crucial point is that objects should be represented in a fnal form matching the user’s intent [67]. For example, if users wish to wrangle data, then the representation should show transformed data instead of code to transform it. Similarly, if users wish to modify a vector image, then the system should render this image. 

DirectGPT shows the object of interest such as code, text, and rendered images at a fxed position on the screen (fg. 3). Every new operation generating a response from the model updates this representation to help users notice the diferences (fg. 2b and fg. 3b). 

## **3.2 Direct Manipulation Principles for LLMs** 

The direct manipulation of an element relies on commands (e.g., buttons in ribbons and toolbars) applied to objects of interest (e.g., words of a document in a word processor, elements on a canvas in a drawing software). This type of operation is commonly known as a _verb_ and _noun_ construction [62, ch. 3-3]. While the order and interactions to specify the verb and noun might difer, it is typical that clicking a command specifes the verb and pointing at the objects specifes the noun [80]. A parallel can be drawn with conversational interfaces like ChatGPT: the object of interest is the last generation from the model and the commands are generated with the prompt feld. However, there is no equivalent to the noun-verb construction. Instead, both noun and verb are specifed in a singular prompt by interacting solely with the prompt feld. 

Below, we review the principles of direct manipulation and show how to leverage them for LLMs. Each principle is demonstrated using DirectGPT, an exemplar direct interface for LLMs. DirectGPT is designed to preserve the standard prompting capabilities of ChatGPT while introducing a layer of complementary interaction mechanisms that are expressive and consistent across application domains such as editing text, code, or images. 

_3.2.1 Continuous Representation of the Last Output._ At its core, direct manipulation is possible only if the objects of interest are continuously represented and accessible at all times [5]. This might be the biggest diference with conversational interfaces because it requires moving away from long textual explanations to instead display an object that remains at the same position. As a result, the interface does less telling and more showing: instead of the model explaining the changes, they should be noticeable through spatial feedback and temporal changes, making it possible to compare the previous state with the new state [30]. 

_3.2.2 Physical Actions Through Prompt-Object Interactions._ Direct interfaces use physical actions and simple metaphors to convey intent without words [72]. In our case, the objects of interest and the prompt feld provides two interaction contexts with possibilies for physical actions that combine these contexts. In DirectGPT, prompts can be entered by typing in the prompt feld to preserve the capabilities of prompt-based interfaces like ChatGPT. Additionally, we describe below how interactions with objects can formulate and constrain prompts through physical actions. Essentially, these interactions recreate the verb-noun constructions typical of direct manipulation interfaces. 

_Prompt to Object: Localizing Efects –_ Interactions between the prompt feld and objects enables specifying objects without having to refer to them in the prompt. This helps users express intents that involve an object and apply only to that object. As such, the prompt needs only to describe the verb whereas the physical action unambiguously specifes the noun. This interaction also describes a constraint in that only the specifed objects should be modifed while the rest of the content should remain unchanged. For example, colouring object A requires selecting A and prompting “red” or “colour red”. 

In DirectGPT, objects are selected with a click. When one or multiple objects are selected, the prompt feld indicates “Apply to selected elements” (fg. 2a). Executing a prompt while objects are selected forces the prompt to apply only to these objects. Otherwise, the prompt applies to the whole content, like ChatGPT. This reuse of the prompt feld allows users to seamlessly switch between local and global prompts, even after having started typing a prompt. To maintain compatibility with diferent domains, the interaction supports both noun-verb (frequent in text editing tasks) and verb-noun constructions (frequent in image editing tasks). This corresponds 

CHI ’24, May 11–16, 2024, Honolulu, HI, USA 

Damien Masson, Sylvain Malacria, Géry Casiez, and Daniel Vogel 



<!-- Start of picture text -->
Toolbar Toolbar Toolbar<br>add a line  add a line  add a line<br>from ? to ? from     to ? from ? to ?<br>add a line from  (15, 20) to(15, 20)  there Type your prompt here. Type your prompt here. Type your prompt here.<br><!-- End of picture text -->

(a) Execute a prompt (b) Reuse the prompt as a tool 

(c) Specify 1st noun (d) Specify 2nd noun & execute 

**Figure 4: Prompts can be reused as tools: (a) a prompt with two nouns is executed; (b) the prompt is abstracted into an ad hoc tool; (c) using the tool, a click sets the frst noun; (d) a second click sets the second noun and executes the reused prompt.** 

to the diference between selecting and then typing the prompt, or typing a prompt and then selecting. 

_Object to Prompt: Referring to Objects –_ Interactions between objects and the prompt feld allow unambiguous references to objects. This helps users express intents that involve relationships between objects and that may modify the whole content. Unlike regular prompt-based interfaces, target objects do not need to be described with words, but are specifed instead through a physical action. This is similar to previous work showing an increase in expressivity and precision when using mid-air pointing gestures to refer to graphical shapes [8], and incorporating images into code to refer to UI components [83]. 

In DirectGPT, we adopt a drag-and-drop approach to select one or multiple objects and drop them in the prompt. Objects can be dropped between words (fg. 3c), or onto words (fg. 3a) to clarify intention. This supports both back-and-forth interaction (e.g., type “move”, drop an object to form next word, type “to”, drop a location to form another word) or prompt-then-bind interaction (e.g., type “put that there”, then drop an object onto“that”, and a location into “there”). Both interactions have the same efect but one gives users the option to type the whole prompt without being interrupted. The objects dropped in the prompt are then treated as “object-words”: their background becomes grey and they can be copied or deleted like single words. Furthermore, to reduce articulatory distance, DirectGPT uses a thumbnail of the object, or a brief description to render the object-word within the prompt (fg. 3a). Hovering over an object-word highlights the corresponding object in the generated output. 

_Object to Object: Fine-grained Manipulations –_ Interactions on objects support fne-grained manipulation. This helps users express transformations that involve an object and apply only to this object. Typically, these interactions are used for common domain-specifc edits, such as resizing and moving a shape, indenting a piece of code, or removing some text. It would be possible to implement such interactions using a task-specifc approach like a conventional graphical user interface. However, that would require information about the task domain, limiting a primary advantage of using a general purpose LLM. To remain generalizable, DirectGPT does not implement such custom interactions and relies only on general direct manipulation techniques. 

_3.2.3 Rapid Operations Through Prompts Reused as Tools._ Direct interfaces leverage labelled buttons to execute commands [67]. It is difcult to predict what actions users may need, but a direct 

interface for LLMs can assist by creating an interface adapted to emergent tasks by reusing previous prompts. Conveniently, composing prompts through physical actions makes explicit the verb and noun of an operations. This means our system can reliably determine which parts of the prompt describe the objects being manipulated and which parts are concerned only with the action. This allows abstracting prompts into universal commands, and an executed prompt can be reused immediately by preserving the verb, but swapping the noun. 

In DirectGPT, as soon as a prompt fnishes executing, it is added as a button in a toolbar. This prompt is now a _tool_ . Pressing it enters a mode where further clicks on objects apply the prompt to these objects as well. For example, when editing text, selecting a word and prompting “synonym” replaces the word with a synonym and adds a button labelled “synonym” to the toolbar (fg. 2b). Then, this prompt can be reused as a tool. First the user clicks on the tool, then selects one or multiple words. As soon as the selection is complete, the prompt “synonym” is applied to them, behaving like tools in conventional direct interfaces (fg. 2c). 

This technique scales to prompts involving multiple nouns. For example, when editing an image, the user prompts “add a line from here to there” and then replaces “here” by dragging the frst point, and “there” by dragging the second point (fg. 4a). After drawing the line, the prompt is added in the toolbar as “add a line from ? to ?” (fg. 4b). Clicking it selects the tool, so the next click on the canvas modifes the tool to show that point or object, such as “add a line from (50, 50) to ?”. Then, a second click executes the prompt for the two specifed locations (fg. 4c-d). 

Tools also support noun-verb constructions without a mode. The objects of interest can be selected before the tool is clicked. In this situation, the tool is only used once and the mode is restored immediately after executing. For example, a user can select two locations (by maintaining the ctrl key) and then click “draw a line from ? to ?”. The line is drawn and the tool is no longer selected. 

_3.2.4 Immediate Targeted Feedback._ Direct interfaces provide instant feedback so that _“users can immediately see if their actions are furthering their goals, and if not, they can simply change the direction of their activity”_ [67]. While LLMs will surely execute faster in the future, for now they may take seconds. A direct interface can provide useful loading feedback so users can identify possible mistakes. This is possible because direct manipulation disentangles nouns from verbs, so the interface is immediately aware of the objects that are to be edited. This information can be used for targeted feedback about the specifc objects that are being acted upon. 

CHI ’24, May 11–16, 2024, Honolulu, HI, USA 

DirectGPT: A Direct Manipulation Interface to Interact with Large Language Models 

In DirectGPT, we use this information to show a loading animation as a pulse (a looping fade-in-fade-out) on objects selected before executing a prompt, or mentioned in the prompt. While the feedback does not necessarily match the objects that will be modifed (e.g., when referring to object as exception such as “turn all circles blue except [this]”), it should match the user’s mental model of their natural language query. Thus, this visual feedback lets the user verify the correct objects were selected and draws their attention to changes once they happen. If the wrong objects are highlighted, the user can click a button to stop the generation. 

_3.2.5 Reversible Operations Through Undo Mechanisms._ Direct interfaces make operations easily reversible to encourage exploration and reduce user anxiety [68]. The advantage is that the users’ conceptual model of an operation might be clearer than in a conversational interface because it is similar to how typical software behave. 

In DirectGPT, we implement a typical undo and redo mechanism. Clicking the “Undo” button, or using the ctrl+z shortcut reverts the generated output to the state before the last command. Clicking the “Redo” button or using the shortcut restores the modifcation. To align with the user’s mental model, reverting matches the granularity of operations as performed by the user. For example, if the user selects fve elements and applies a prompt to them all at once, then this whole interaction is considered as one revertible operation. 

## **3.3 Implementation** 

DirectGPT works by frst entering a prompt to generate an object of interest. Then, the object of interest is continuously represented and elements composing it can be manipulated as described in section 3. Currently, DirectGPT supports all text-based representations such as text and code. It also supports SVG images by rendering them for direct selection of elements in the vector image. 

DirectGPT is implemented in TypeScript using ReactJS [63] for the interface, Prism.js [61] for code syntax highlighting, and the ofcial OpenAI API library [58] for executing prompts using “gpt3.5-turbo”. All source code and a live demo are available<sup>1</sup> . This section describes the strategies we used to convert the direct manipulation actions described section 3.2.2 into prompts. 

_3.3.1 Localizing the Efect of a Prompt._ The constraint of localizing the efect of a prompt is done by the interface. Instead of asking the LLM to rewrite the entire passage, the LLM is only asked to rewrite the part that is selected. Then, this part is replaced by the response from the LLM. This ensures a deterministic outcome. Note that the whole passage is still provided to the model with the selected part replaced by “<blank>”. This ensures the LLM is aware of the context surrounding the selection. An example of this kind of engineered prompt is provided in appendix A.1.1. 

_3.3.2 Referring to Objects in Prompts._ When a prompt contains objects that were dragged and dropped into the prompt feld, our system converts the prompt into one of two kinds of engineered prompts we empirically found to give the best results for text (including code, etc.) and vector images. 

For text, simply copying the text that is being referred is not enough because the instruction would be ambiguous when the text 

> 1Live demo and code: http://ns.inria.fr/loki/DirectGPT 

appears multiple times. Instead, we use the delimiter strategy by copying the entire passage with added delimiters around the text that was selected by the user [57]. The delimiters all have a unique identifer, and this identifer is used in the engineered prompt in lieu of the object-words for text specifed through direct manipulation. appendix A.1.2 provides an example and more details. 

For elements in a vector image, the delimiter strategy is not ideal because the code corresponding to an element is not always located within a contiguous part of the SVG specifcation. Instead, our system automatically adds unique ids to each SVG element, and the object-words representing shapes specifed by direct manipulation are replaced by their corresponding id. appendix A.1.3 provides an example and more details.
