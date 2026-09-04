## **4 USER STUDY: DIRECTGPT VS CHATGPT** 

We conducted a user study to measure the efect of direct manipulation principles to convey intent, control LLMs, recover from mistakes, and reuse prompts. Participants edited literary text, JavaScript code, and vector graphics images using both DirectGPT and a replica of ChatGPT. This replica of ChatGPT served as a baseline because it is one of the most popular interfaces to interact with LLMs (with estimations of more than 100 million ChatGPT users in 2023 [50]) and it is strictly conversational: a conversation is initiated with a prompt, answers are shown word-by-word, and the entire conversation is kept at all times and fed back into the LLM. 

For the purpose of the study and to ensure accurate logging, the ChatGPT interface was reimplemented. Care was taken to ensure a faithful reimplementation: the prompting and conversation interface were made to be identical, the conversation panel rendered Markdown and supported code syntax highlighting, the system prompt was identical to the one used in ChatGPT, and the answers were streamed to display word-by-word. We confrmed faithfulness by running all our experimental conditions using the ofcial ChatGPT and comparing the responses. Results were sensibly identical<sup>2</sup> . The interface only difered in that it was not possible to start a new conversation or have multiple conversations in parallel, and our replica rendered SVGs mentioned in the conversation to avoid the need for an external SVG viewer. This also meant that when an SVG was rendered, its code could not be seen by the participant. This was done to make tasks involving images feasible and ensured participants manipulated images rather than code (which is tested separately). For the sake of clarity, we refer to this interface as ChatGPT and use OpenAI’s ChatGPT otherwise. 

The DirectGPT condition used the same interface as the ChatGPT replica but with the direct manipulation principles described in section 3. Both conditions used the same model “gpt-3.5-turbo” accessed through the OpenAI Chat API [59]. 

## **4.1 Participants and Apparatus** 

We recruited 12 participants from our institution (20 to 34 age range, M=26.8, 6 self-identifed as female and 6 as male). Potential participants were asked if they had prior experience with programming and OpenAI’s ChatGPT, they had to answer “yes” to both questions to participate. On a 5-point scale from 1-“never” to 5-“often” they 

> 2LLMs are non-deterministic even at low temperatures, and some variations for identical prompts can be expected 

CHI ’24, May 11–16, 2024, Honolulu, HI, USA 

Damien Masson, Sylvain Malacria, Géry Casiez, and Daniel Vogel 



(a) Starting Image (b) Transform Task (c) Add Task (d) Remove Task (e) Global Transform Task 

**Figure 5: Given the (a) starting image, the participant completed four tasks in the image activity with ChatGPT and DirectGPT from either the top or bottom row: (b) colourize using gradients; (c) add elements; (d) remove elements; (e) fip upside down.** 

reported their frequency of use of ChatGPT as Mdn=3 and having used AIs in the past to do text editing (N=6), code editing (N=8), and image generation or editing (N=8). 

Participants took part in the study remotely. They shared their screen with the experimenter who took notes during the session. The participants’ screen, the audio, and their interactions with the tool were recorded. Sessions were an hour long. In appreciation for their time, participants received the equivalent of $11 USD. 

## **4.2 Procedure** 

The participant used two interface (ChatGPT, DirectGPT). For each interface, they completed three activity (text, code, image). For each activity, they performed four tasks. 

_Introduction (_ ∼ _2min) –_ After completing the consent form and the demographics questionnaire, the participant was told “You will interact with an AI to edit text, code, and images”. 

_Video Tutorial (_ 2 interface × 3 activity × _30sec) –_ Before each activity (including those done with the ChatGPT interface), the participant watched a video tutorial with a voice-over to describe the interactions possible with the interface they were about to use. The video tutorials were designed to avoid giving away strategies or biasing participants in their wording of prompts. This was done by showing toy examples (e.g., Lorem ipsum text) and demonstrating interactions with descriptive prompts (e.g., “A prompt that modifes only the selected text”). These video tutorials are provided as supplementary material. 

_Editing Tasks (_ 2 interface × 3 activity × ∼ _8min) –_ After watching the video tutorial, the participant completed the four tasks of the activity. The participant proceeded through the tasks one after the other. The current task to complete was displayed at all times on the left of the interface. It consisted of a short textual instruction (e.g., “Reproduce” or “Text in yellow => synonyms”) that could not be selected, and an image of the content to edit with some text or code in yellow, or the image the participant had to reproduce. Because all tasks required editing existing content, this content was already added to the conversation as the frst message to emulate an already frst generation and make sure the task was identical across participants. This content was reset between tasks. After completing a task, either because the participant fnished, abandoned, or reached a time limit of three minutes, the participant 

responded to a 5-point semantic diferential scale “How close are you to the target” from “distant” to “close”. 

_Questionnaire on Interface Used (_ 2 interface × ∼ _2min) –_ After completing all three activity for an interface, the participant completed a questionnaire including a System Usability Scale (SUS) [10] and 5-point scale statements to rate. The questionnaire was identical after both interface. 

_Semi-structured Interview (_ ∼ _10min) –_ At the end of the study, the participant was invited to comment on any aspect of the study. Then, the experimenter prompted the participant on their preferred interface, the most difcult tasks, prior experiences with AI where they faced similar difculties, their strategies to write prompts, and other behaviours that the experimenter noticed during the session. 

## **4.3 Design and Tasks** 

To test the fexibility of our approach, participants edited content through three activities: literary text, JavaScript code, and vector images. The texts were the frst three paragraphs from _Alice’s Adventures in Wonderland_ by Lewis Carroll (253 words) and the frst two paragraphs from _Frankenstein; or, The Modern Prometheus_ by Mary Shelley (265 words). The codes were a function to print a pyramid in the console (13 lines, a for loop containing two nested for loops) and a function to count the number of values below the mean of a moving window (15 lines, a for loop containing two nested for loops). The images were a fower (5 black circles for the petals and 1 white circle in the centre, fg. 5) and a smiley face (1 yellow circle for the face, 3 black circles for the eyes and nose, and a black line for the mouth, fg. 5)<sup>3</sup> . 

For each content to edit, we designed four tasks that spanned diferent level of difculties in using the direct manipulation features. Three tasks required localized edits (either modify specifc elements, add/expand elements, or remove/reduce elements), and the fourth task required a global modifcation. We also ensured the tasks where within the boundaries of what the LLM could accomplish if prompted correctly. This was done to not confound our results with the limitations of the underlying model in accomplishing complex tasks. For the text activity, the tasks were: replacing 5 words by synonyms; adding more descriptions to two passages; summarizing two passages; and using the future tense throughout the text excerpt. For the code activity, the tasks were: renaming a 

> 3Tasks and activities can be tested in the live demo: http://ns.inria.fr/loki/DirectGPT 

CHI ’24, May 11–16, 2024, Honolulu, HI, USA 

DirectGPT: A Direct Manipulation Interface to Interact with Large Language Models 

||strongly disagree|strongly agree||
|---|---|---|---|
|Specifying the object to modify was easy|2<br>10|9<br>1<br>2||
|Controlling the output of the AI was easy|1<br>1<br>6<br>4|7<br>5||
|Formulating prompts required low mental demand|1<br>6<br>5|3<br>8<br>1||
|Recovering from a mistake was easy|2<br>10|3<br>5<br>1<br>1<br>2||
|The effect of my actions was clear|1<br>11|1<br>1<br>6<br>3<br>1||
|Specifying the action to be done was easy|3<br>9|1<br>3<br>1<br>6<br>1||
|Reusing prompts was easy|2<br>2<br>8|2<br>1<br>3<br>4<br>2||
||0<br>6<br>12|0<br>6<br>12|4<br>3<br>2<br>1<br>0<br>-1|
||(a) Ratings for DirectGPT|(b) Ratings for ChatGPT|(c) Mean difference & 95% CI|



**Figure 6: Participants’ response when rating the 5-point statements for (a) DirectGPT and (b) ChatGPT. (c) Dots are the mean diferences of DirectGPT compared to ChatGPT. Bars are the 95% CIs calculated with the studentized bootstrap method.** 

variable; converting two for loops into while loops; factorizing a loop by using the reduce or repeat function; and converting the function to Python. For the image activity, the tasks were: colouring three elements using a gradient; adding three lines and two circles (either to add a torso and hands to the smiley face, or to add a stem and leaves to the fower), removing three elements; or turning the image upside down (fg. 5). 

The study followed a within-subject design. interface (DirectGPT or ChatGPT) and activity (text, code, or image) appeared an equal number of times in each position. This was done using a Graeco-Latin square to order activity and the version A or B of the content to edit. Essentially, this means each participant had a unique ordering, half the participants started with ChatGPT, and the version A or B of the content to edit appeared equally as often with the ChatGPT interface than with the DirectGPT interface. 

We gathered interaction logs, subjective ratings, and task measures for 2 interface × 3 activity × 4 task × 12 participant = 288 tasks. 

## **4.4 Data Analysis** 

Considering ongoing debates related to statistics in HCI [21, 26], we report both p-values and 95% confdence intervals on mean differences. Because we are interested by the size of the efects rather than their mere existence, our interpretation is based on CIs that give information about the size of the efects and the uncertainty around them. All 95% confdence intervals are calculated using the studentized bootstrapping method because it has been shown to be the most robust across distributions and for study designs similar to ours [47, 87]. All p-values are calculated using a Wilcoxon signedrank test because it is more robust and less likely to yield false positives compared to parametric alternatives when dealing with data from unknown or possibly heavily skewed distributions [9]. Our analysis is done in Python using scipy 1.10.1 [77] and arch 5.5.0 [66] for the bootstrapped CIs. The Wilcoxon signed-rank tests discarded ties. The studentized bootstraps used 10,000 replications. 

## **4.5 Results** 

Participants went through the tasks without abandoning. Averaged over all tasks and activities, participants consistently had better results with DirectGPT on objective metrics (time, number of prompts, number of words per prompt) and equal or better results 

on subjective metrics (closeness to target, usability, and 5-point scale statements). All results are detailed below and visualized in fg. 6 and fg. 7. 

_4.5.1 Closeness to target._ On a 5-point semantic diferential scale, participants rated their modifcations closer to the target when using DirectGPT by .95 (95% CI: [0.70, 1.25], M=4.84 vs M=3.89, p<0.001). Per activity, the mean diference for text was 1.58 (95% CI: [1.10, 1.99], p<0.001) and for vector images it was 1.17 (95% CI: [0.71, 1.68], p=0.001). However, the mean diference for code was only 0.10 and likely insignifcant (95% CI: [-0.13, 0.66], p=0.495). 

_4.5.2 Time._ The mean completion time of a trial was shorter with DirectGPT by 1min 1s (95% CI: [49s, 1min 11s], M=56s vs M=1min 57s, p<0.001). Even when excluding the time it took for the prompt to be executed and the output fully generated, it remains that DirectGPT was faster by 46s (95% CI: [38s, 55s], M=47s vs M=1min 33s, p<0.001). Per activity, the mean diference for text was 1min 18s (95% CI: [1min 5s, 1min 32s], p<0.001), for vector images it was 34s (95% CI: [20s, 45s], p=0.001), and for code it was 27s (95% CI: [3s, 39s], p=0.007). Note that these include times from tasks where participants had to stop because they reached the 3min time limit. This happened in 8% of the trials with DirectGPT, and 35% with ChatGPT. 

_4.5.3 Prompt Qantity._ The mean number of prompts was lower with DirectGPT by 1.77 (95% CI: [1.37, 2.46], M=1.90 vs M=3.67, p<0.001). Per activity, the diference for text was of 2.33 (95% CI: [1.61, 3.40], p<0.001), for images it was of 1.88 (95% CI: [1.06, 3.26], p=0.002), and for code it was of 1.10 (95% CI: [0.56, 1.44], p=0.001). 

_4.5.4 Prompt Verbosity._ Prompts in DirectGPT were less verbose on average by 15.3 words (95% CI: [9.35 28.72], M=5.83 vs M=19.98, p<0.001). Per activity, the diference for text was of 37.97 (95% CI: [21.59, 78.37], p<0.001), for code it was of 10.71 (95% CI: [6.13, 31.83], p<0.001), and for images it was of 3.21 (95% CI: [1.77, 4.89], p=0.002). 

_4.5.5 Usability._ On the System Usability Scale, and for the specifc given tasks, DirectGPT was rated 92 (typically considered “Excelent” [4]) whereas ChatGPT received a 53 (typically considered “OK”). This corresponds to a mean diference of 39 (95% CI: [27.3, 47.34], p<0.001). 

CHI ’24, May 11–16, 2024, Honolulu, HI, USA 

Damien Masson, Sylvain Malacria, Géry Casiez, and Daniel Vogel 



<!-- Start of picture text -->
DirectGPT ChatGPT Mean across tasks Mean across activities<br>Code Code<br>Image Image<br>Text Text<br>1 2 3 4 5 0 50 100 150<br>(a) Closeness to Target Rating (1-distant to 5-close) (b) Time (seconds)<br>Code Code<br>Image Image<br>Text Text<br>0 5 10 0 50 100 150<br>(c) Prompt Quantity (# prompts) (d) Prompt Verbosity (# words)<br><!-- End of picture text -->

**Figure 7: Result breakdown per interface, activity, and task for (a) closeness rating; (b) time; (c) number of prompts; (d) length of prompts. Black dots are means, bars are 95% CIs, vertical dashed lines are means over all activities.** 

_4.5.6 Qestionnaires._ Participants rated all seven 5-point statements higher for DirectGPT. Ranked from largest to smallest effects: “Specifying the object to modify was easy” by 3.17 (95% CI: [2.01, 3.74], p<0.001), “Controlling the output of the AI was easy” by 2.67 (95% CI: [1.91, 3.17], p<0.001), “Formulating prompts required low mental demand” by 2.42 (95% CI: [1.79, 2.97], p<0.001), “Recovering from a mistake was easy” by 2.33 (95% CI: [1.25, 3.17], p=0.005), “The efect of my actions was clear” by 1.67 (95% CI: [0.99, 2.44], p=0.004), “Specifying the action to be done was easy” by 1.5 (95% CI: [0.88, 2.53], p=0.004), “Reusing prompts was easy” by 1.25 (95% CI: [0.44, 2.27], p=0.016). 

_4.5.7 Interactions Used._ With DirectGPT, participants relied on direct manipulation mechanisms to craft 84% of their prompts. Specifcally, 68% of all prompts were localized, 14% contained at least one reference to an object dropped through direct manipulation, and 20% were the result of using a tool generated from previous prompts (i.e., reusing a previous prompt).
