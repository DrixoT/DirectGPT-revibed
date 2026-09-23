import type { Content } from './types';

/** Contents used in the user study (§4.3) so the study tasks can be tried. */
export interface Sample {
  id: string;
  name: string;
  group: 'Text' | 'Code' | 'Image';
  content: Content;
  tasks: string[];
}

const ALICE = `Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?”

So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.

There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, “Oh dear! Oh dear! I shall be late!” (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.`;

const FRANKENSTEIN = `You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday, and my first task is to assure my dear sister of my welfare and increasing confidence in the success of my undertaking.

I am already far north of London, and as I walk in the streets of Petersburgh, I feel a cold northern breeze play upon my cheeks, which braces my nerves and fills me with delight. Do you understand this feeling? This breeze, which has travelled from the regions towards which I am advancing, gives me a foretaste of those icy climes. Inspirited by this wind of promise, my daydreams become more fervent and vivid. I try in vain to be persuaded that the pole is the seat of frost and desolation; it ever presents itself to my imagination as the region of beauty and delight. There, Margaret, the sun is for ever visible, its broad disk just skirting the horizon and diffusing a perpetual splendour.`;

const PYRAMID = `function printPyramid(height) {
  for (let row = 1; row <= height; row++) {
    let line = "";
    for (let space = 0; space < height - row; space++) {
      line += " ";
    }
    for (let star = 0; star < 2 * row - 1; star++) {
      line += "*";
    }
    console.log(line);
  }
}

printPyramid(5);`;

const MOVING_WINDOW = `function countBelowMovingMean(values, windowSize) {
  let count = 0;
  for (let i = 0; i <= values.length - windowSize; i++) {
    let sum = 0;
    for (let j = i; j < i + windowSize; j++) {
      sum += values[j];
    }
    const mean = sum / windowSize;
    for (let k = i; k < i + windowSize; k++) {
      if (values[k] < mean) {
        count++;
      }
    }
  }
  return count;
}`;

const FLOWER = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="150" cy="60" r="22" fill="#ff7a18" />
  <circle cx="176" cy="79" r="22" fill="#ff7a18" />
  <circle cx="166" cy="110" r="22" fill="#ff7a18" />
  <circle cx="134" cy="110" r="22" fill="#ff7a18" />
  <circle cx="124" cy="79" r="22" fill="#ff7a18" />
  <circle cx="150" cy="88" r="13" fill="#faf8f5" />
</svg>`;

const SMILEY = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="150" cy="80" r="45" fill="#ff7a18" />
  <circle cx="135" cy="68" r="5" fill="#0d0700" />
  <circle cx="165" cy="68" r="5" fill="#0d0700" />
  <circle cx="150" cy="84" r="4" fill="#0d0700" />
  <line x1="130" y1="102" x2="170" y2="102" stroke="#0d0700" stroke-width="3" />
</svg>`;

export const SAMPLES: Sample[] = [
  {
    id: 'alice',
    name: 'Alice’s Adventures in Wonderland (text)',
    group: 'Text',
    content: { kind: 'text', value: ALICE },
    tasks: ['Replace 5 words by synonyms', 'Add more description to two passages', 'Summarize two passages', 'Use the future tense throughout'],
  },
  {
    id: 'frankenstein',
    name: 'Frankenstein (text)',
    group: 'Text',
    content: { kind: 'text', value: FRANKENSTEIN },
    tasks: ['Replace 5 words by synonyms', 'Add more description to two passages', 'Summarize two passages', 'Use the future tense throughout'],
  },
  {
    id: 'pyramid',
    name: 'Print a pyramid (JavaScript)',
    group: 'Code',
    content: { kind: 'code', value: PYRAMID, language: 'javascript' },
    tasks: ['Rename a variable', 'Convert two for loops into while loops', 'Factorize a loop using repeat', 'Convert the function to Python'],
  },
  {
    id: 'window',
    name: 'Count values below a moving mean (JavaScript)',
    group: 'Code',
    content: { kind: 'code', value: MOVING_WINDOW, language: 'javascript' },
    tasks: ['Rename a variable', 'Convert two for loops into while loops', 'Factorize a loop using reduce', 'Convert the function to Python'],
  },
  {
    id: 'flower',
    name: 'Flower (SVG)',
    group: 'Image',
    content: { kind: 'svg', value: FLOWER },
    tasks: ['Colour three petals with a gradient', 'Add a stem and two leaves (3 lines, 2 circles)', 'Remove three petals', 'Flip the image upside down'],
  },
  {
    id: 'smiley',
    name: 'Smiley face (SVG)',
    group: 'Image',
    content: { kind: 'svg', value: SMILEY },
    tasks: ['Colour the face, an eye and the nose with gradients', 'Add a torso and hands (3 lines, 2 circles)', 'Remove the nose and the mouth', 'Flip the image upside down'],
  },
];
