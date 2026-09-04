## **5 DISCUSSION** 

After discussing our results, we open the discussion to themes stemming from participant comments and experimenter observations. 

_DirectGPT helps convey intent unambiguously._ This was refected in participants being 50% faster to accomplish tasks with 50% fewer and 72% shorter prompts. Subjectively, participants unanimously agreed that “Specifying the object to modify was easy”. In fact, compared to ChatGPT, this is the statement with the largest positive mean diference. 

_DirectGPT helps control and notice the efect of prompts._ This increase in control is refected in participants achieving results they judged closer to the target and rating that controlling the output of the AI 

was easier with DirectGPT than ChatGPT. On average, participants also found the efect of their actions to be clearer with DirectGPT. 

_DirectGPT helps error recovery and might help reusing prompts._ Participants generally found that recovering from a mistake was easier with DirectGPT, due to the undo feature. They used the toolbar for 20% of all prompts and generally rated reusing prompts to be easier with DirectGPT. However, this was also the smallest diference since half of the participants also found reusing prompts to be easy with ChatGPT. 

_DirectGPT preserves prompting-only capabilities and people sometimes prefer them._ All participants completed global tasks without using direct selections. This confrms that DirectGPT preserves prompting possibilities of ChatGPT and that people may switch between prompting and direct manipulation depending on the task and perceived beneft. 

## **5.1 Observations and Participants’ Comments** 

_Prompts were more concise (and less polite) with DirectGPT._ Corroborating existing fndings [55, 86], eight of our participants wrote prompts in a human-to-human conversation style when using ChatGPT. For example, they asked politely (P4, P5, P6, P7); thanked the model (P5, P4); encouraged it such as _“yes”_ (P0), _“Great. Now also change [...]”_ (P7), _“Awesome. You forgot the hands though. [...]”_ (P5); used caps lock, smileys, or exclamation marks to emphasize some points (P4, P5, P7); asked questions to make the model notice the problem (P0, P2, P4, P6); and generally used more verbose language such as _“actually I was expecting [...]”_ (P3), and _“similarly, [...]”_ (P8). 

These participants did not use that kind of language when using DirectGPT despite doing similar tasks and using the same underlying model. During the semi-structured interview, they explained that DirectGPT understood them faster and did not feel like a chat. 

CHI ’24, May 11–16, 2024, Honolulu, HI, USA 

DirectGPT: A Direct Manipulation Interface to Interact with Large Language Models 

_“[with DirectGPT] I knew that by highlighting the specifc parts I can just, like, put in very concise prompts and it will know exactly what to do... so it did not feel necessary for me to type in a whole conversation” — P7 “[with DirectGPT] it was more like a tool. Like I did not need to make it comprehend anything. I just wanted to tell it what to do [..] it did not feel like an assistant with whom I have to converse” — P5_ 

_With ChatGPT, participants carefully checked the text generation because they doubted its accuracy._ Besides rating that the efect of their actions was less clear with ChatGPT, participants also felt it was difcult to verify its responses. Specifcally, participants commented about the difculties to check that nothing else had been modifed when ChatGPT responded with the modifed text. 

_“[with ChatGPT] verifying that it actually only did the thing that you wanted it to do, it’s a bunch of text... basically impossible” — P6_ 

- _“my reading speed is not that fast so... I couldn’t really tell.. is it like correctly modifed at the location I want to modify, and I am not very confdent that it will generate the exact same thing from my experience” — P4_ 

_Code was easier to refer to than text and vector images._ While the diference in performance was large for text and images, participants performed similarly for tasks on code with both ChatGPT and DirectGPT, albeit they still required more time, more prompts, and more words with ChatGPT. When asked about the tasks they found most difcult with ChatGPT, most participants mentioned either text (N=8) or images (N=4). Some explained this choice due to how easy it is to be clear and specifc with code, but how difcult it is with images and text due to the lack of structure. 

- _“The code is simpler to navigate. It makes it simpler to determine where it should go and tell the model where it should go. But if it’s a big text it’s like, ugh, talking about it in paragraphs and sentences and occurrences of words... horrible.” — P6_ 

- _“in the code task... I think I talked about the frst inner for loop. So you could specify based on ordering.” — P11 “I’d say the picture task was more challenging [...] I feel like with the code, I have enough coding knowledge that I can specify almost the exact location to do something”_ 

- _P1_ 

_Participants knew and used a range of common and efective prompt engineering strategies._ Perhaps due to their prior experience with ChatGPT, we observed some of the prompt engineering strategies suggested in the OpenAI wiki [57], such as splitting tasks into simpler subtasks (N=12), providing examples (P5), and specifying the desired output length (P9). Another efective strategy adopted by four participants was to agree on a common terminology to refer to elements prior to the task. For example, in the image activity, P10 and P11 asked the model to give a label to the elements in the image and then referred to those labels; P8 gave an object an identifer and asked the model to do the same for other elements; and P4 asked for a description of the image and then reused the wording. 

_Participants were excited about DirectGPT and how it could help them._ Overall, all participants mentioned a preference for DirectGPT. When asked about features they found most useful, localizing the efect was mentioned most frequently (P0, P1, P3, P4, P5, P6, P7, P9, P10), followed by the toolbar of reusable prompts (P2, P10, P11), dropping objects in the prompt (P2, P8), and undoing (P8). Some explained that they had previous bad experiences with OpenAI’s ChatGPT and Github Copilot where selection features like in DirectGPT could have helped. 

- _“it was horrible to use [OpenAI’s] ChatGPT for this kind of situation because you just had no control over the output. [...] Especially what is important is that the area of efect is just small, like I don’t want it to change anything but that.”_ — P5 

_“in using Copilot I really would like to select” — P3_ 

- _“I use [OpenAI’s] ChatGPT primarily to look over text I’ve written [...] often times it ends up changing the entire text which isn’t really what I want, so, I think for this task it would be really nice to have the frst system [DirectGPT]” — P8_ 

_“There are tools that start to integrate stuf but they are very limiting or expensive or very specifc and this one seems like it is generic in a way that it’s like basically_ 

_[OpenAI’s] ChatGPT but you can target it better”_ — P6 

Other participants were surprised because they thought ChatGPT was already pretty good. 

- _“I was actually surprised by the second system [DirectGPT] cause I thought like, the frst system [ChatGPT] was already pretty well integrated... But I guess the second system [DirectGPT] did surprise me and when I was using it I was like oh wow, this will actually make my experience with LLMs so much better”_ — P7 

## **5.2 Limitation** 

_The results of the study might be LLM dependent._ While both interfaces used the same underlying model, ChatGPT arguably sufered the most from model misunderstandings. For example, with the image activity of the study, some participants tried prompting the model to “remove the nose” but the model would often misunderstand and also remove the eyes of the smiley face. However, even assuming a model with perfect accuracy, previous Wizard of Oz experiments found that people still prefer a combination of direct manipulation and natural language, especially when some objects are hard to describe [28]. This result is consistent with previous work showing the benefts of combining gestures with language [8, 34] and that more expressive ways of communicating reduce misunderstandings compared to just text [16, 37]. 

_Participants’ prior experiences probably helped them perform better._ All our participants had experience with LLMs. This was clear from their use of efective prompt engineering strategies, as mentioned previously. Additionally, our participants also had experience in coding and could generally be considered expert computer users. It is not clear whether less technical users would perform equally well with DirectGPT. 

CHI ’24, May 11–16, 2024, Honolulu, HI, USA 

Damien Masson, Sylvain Malacria, Géry Casiez, and Daniel Vogel 

_Direct manipulation might not be as useful for other tasks._ For instance, some selections might be easier to specify in the prompt such as “all red circles” rather than selecting all circles manually. Additionally, our study focused specifcally on editing tasks and the need for control over the output. However, control is not always necessary, and there are some benefts in having the AI lead the way [14, 27, 36]. Similarly, it is possible that other tasks that are more exploratory would not beneft from a direct manipulation interface because users do not have a specifc target in mind. In this case, DirectGPT remains usable the way one would use ChatGPT by typing prompts without any selection. 

_The design of DirectGPT might be misleading._ For instance, the pulsing feedback matches the elements mentioned in the prompt, which, for complex queries, might difer from the ones that will be modifed once the command is executed. To resolve this discrepancy, an approach could be to decompose the prompt by frst asking the LLM to list the elements that will be modifed and highlighting those. Additionally, because DirectGPT shows only the fnal output, the modifcation is not explained. While this was not an issue with the tasks of our study, some applications may require presenting the explanation to the user, either on the side or on-demand, to help with transparency. 

## **5.3 Future Work** 

_Testing other benefts of direct manipulation such as learnability and explorability._ Shneiderman cites other benefts of direct manipulation interfaces such as enabling a multi-layered approach to learning [72]. As such, _“novices can learn basic functionality quickly”_ and _“experts can work extremely rapidly to carry out a wide range of tasks, even defning new functions and features”_ [67]. Future work could investigate if such learning occurs with DirectGPT. From our observations, we expect that localizing prompts and referring to objects would be quickly learned but that reusing prompts would be more of an expert feature. Additionally, DirectGPT follows the guidelines for explorable interfaces, such as making the efects of actions visible and making it safe to experiment [20, 22, 48]. Future work could investigate the impact of these features on users’ exploratory behaviours. 

_Exploring extensions to direct manipulation such as demonstrational interfaces and instrumental interaction._ Direct manipulation has been extended in many ways that could also beneft DirectGPT. For example, instrumental interaction [5, 6] defnes _interaction instruments_ as mediators between users and objects of interest. An application of this idea would be to _reify_ [7] prompts into interaction instruments that can be applied to diferent objects and that are easily reused and modifed. Another extension of direct manipulation that seems promising for LLMs are demonstrational interfaces [52]. Demonstrating the operation would allow not only to specify nouns but also verbs through physical actions. For example, users provide examples of the action they want to perform (e.g., they replace a word by a synonym) and the system would derive a tool from it. The examples could even be used in the prompt generated by the system [57]. 

_Using prompts to help select objects._ Object selection in DirectGPT is either done solely by direct manipulation or solely by describing 

the objects in the prompt. Future work could investigate the design of an hybrid approach where specifc prompts such as “all red circles” would form a selection that can then be refned through direct manipulation. One design for this feature could be to ofer an additional prompt input feld for the purpose of object selection. Another approach is to implement _hooks_ that analyze the prompt while it is being typed and detect references to objects. For example, while typing “move red circles to the top”, the part “red circles” would be detected and highlighted by the system. Then, the user could click on it to select the circles and possibly modify the selection through direct manipulation. Besides references to objects, these “hooks” could also detect other elements such as colours, fonts, styles and ofer widgets to edit the prompt through direct manipulation, similar to code projections [24]. 

_Testing alternative designs._ The design of DirectGPT was chosen to best exemplify the principles of direct manipulation so that their beneft could be evaluated. While the interactions we proposed favoured simplicity and consistency, other designs could capture direct manipulation principles equally well and ofer a diferent trade-of. For example, an alternative design could rely on contextual menus or popups with a prompt feld appearing close to the selection. This would reduce travel time between selection and prompt feld and could support chaining diferent prompt felds [81]. However, this may clutter the screen, confict with the software preexisting interaction mechanisms, and make transitions between global and local edits difcult once the user starts typing the prompt. Similarly, instead of undo features, the edits could be marked for the user to accept or reject, like “track changes” in editing software. Finally, more complex tasks might require prompting the model with a chain-of-thought [79] which would require tuning the internal prompts used by DirectGPT and extracting only the relevant part of the answer. Ultimately, these design decisions should be decided based on the targeted tasks and application domain. 

_Exploring the use of DirectGPT for other tasks such as exploration, data wrangling, and GUI building._ We demonstrated DirectGPT to edit text, code, and vector images but the principles proposed extend beyond these use cases. First, not all tasks require editing. Instead, two prompt felds could be supported, one to edit the content in-place, the other to ask for details. In this case, the direct manipulation would help tailor the explanation to a piece of code, a specifc topic mentioned, or an element of the image. Second, even with editing, more activities could be supported as long as the objects of interest are manipulable and continuously represented in their fnal form. For example, one could imagine editing a website by clicking a panel and prompting “make this responsive by shrinking the content”; doing data wrangling by manipulating a data table such as selecting a column and then prompting “turn into a row”; stylizing a chart by selecting the axes and prompting “use Open Sans”; arranging a graphical user interface by prompting “align this and that horizontally” and dropping buttons instead of “this” and “that”; or selecting a row in a table from a rendered L<sup>A</sup> TEX document and prompting “use grey background”. 

_Using DirectGPT to control other generative models._ While DirectGPT is built atop an LLM, our fndings point to the potential of direct manipulation to help interact with other kind of prompt-driven 

CHI ’24, May 11–16, 2024, Honolulu, HI, USA 

#### DirectGPT: A Direct Manipulation Interface to Interact with Large Language Models 

generative models. For example, a music track could be directly manipulated using its audio spectrum. This would allow interactions such as prompting to “reproduce this part here using a saxophone instead”. Additionally, a limitation of the implementation of DirectGPT is that it needs to map physical actions to textual prompts. This sometimes requires workarounds such as using identifers. In contrast, models that accept multi-modal inputs could help create more robust implementations of DirectGPT. 

_Tradeofs of integrating DirectGPT into exisiting software._ DirectGPT was designed for easy integration into traditional software. Often, this could be done as simply as adding a prompt feld somewhere in the interface, even if the software already has selection and dragging mechanisms. For example, in a drawing software, dragging a shape within the canvas would move it, while dropping it in the prompt feld would allow referring to it. If such an integration is done, future work could investigate tradeofs between the use of prompts and more traditional software operations. For example, it might be preferable to do precise tasks through direct interactions and reserve prompting for irregular and more complex tasks. But, akin to how expert features such as software shortcuts are not necessarily learned [15], people might not always adopt the most efcient approach.

## **6 CONCLUSION** 

We characterized how the principles of direct manipulation can be leveraged to design interfaces for LLMs that help express intent, control the generation of output, and recover from mistakes. This was demonstrated with DirectGPT, an interface for LLMs that can localize the efect of prompts, refer to objects of interest in prompts, reuse commands, and provide undo operations. In a user study, participants were faster, more successful, and they preferred to use DirectGPT instead of ChatGPT to perform text, code, and image editing tasks. Beyond these use cases, this work informs how traditional software could seamlessly integrate LLMs and other generative models to support co-creation with artifcial intelligence.

## **ACKNOWLEDGMENTS** 

This work was made possible by NSERC Discovery Grant 201805187, Canada Foundation for Innovation Infrastructure Fund 33151 “Facility for Fully Interactive Physio-digital Spaces”, and the LAI Réapp.
