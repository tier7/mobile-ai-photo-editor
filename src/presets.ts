export type Preset = {
  id: string;
  name: string;
  prompt: string;
};

// Prompty do uzupełnienia – dopóki zaczynają się od "TODO", preset jest zablokowany
export const PRESETS: Preset[] = [
  {
  id: 'cyberpunk',
  name: 'Cyberpunk',
  prompt: `
Transform the uploaded photo into a detailed, cinematic cyberpunk scene.
Use the original image as the primary visual reference and preserve its
main subject, pose, perspective and overall composition.

If people are present, preserve their recognizable identity, facial features,
age, skin tone and expression. Keep realistic anatomy and natural proportions.
Introduce subtle futuristic clothing details and technological accessories
without hiding or replacing the face.

Reimagine the surroundings as a believable futuristic metropolis at night.
Add layered architecture, illuminated windows, industrial structures,
subtle holographic displays and distant city lights. Keep the background
visually coherent and less dominant than the main subject.

Use cyan, electric blue, magenta and violet neon lighting, balanced with
small warm amber accents. Create realistic light spill, soft rim lighting,
deep shadows and controlled highlights. Maintain consistent light direction
and physically believable reflections on glass, metal and wet surfaces.

Add a restrained atmosphere of light rain, thin mist, volumetric light beams
and subtle reflections. Preserve sharp details on the main subject while
using gentle depth of field and atmospheric perspective in the background.

Aim for a polished live-action science-fiction movie still with rich textures,
cinematic color grading and realistic materials. Avoid excessive saturation,
plastic-looking skin, heavy blur and clutter that obscures the subject.

Do not add readable text, logos, watermarks, borders or interface elements.
Avoid distorted faces, duplicated people, extra limbs and malformed hands.
`.trim(),
  },
  { id: 'retro80s', name: 'Retro 80s', prompt: 'TODO' },
  { id: 'anime', name: 'Anime', prompt: 'TODO' },
  { id: 'vintage', name: 'Vintage', prompt: 'TODO' },
  { id: 'chibi', name: 'Chibi', prompt: 'TODO' },
  { id: 'fantasy', name: 'Fantasy', prompt: 'TODO' },
  { id: 'studio', name: 'Studio Portrait', prompt: 'TODO' },
];

export function isPresetReady(preset: Preset) {
  const prompt = preset.prompt.trim();
  return prompt.length > 0 && !prompt.toUpperCase().startsWith('TODO');
}

export function buildPrompt(preset: Preset | null, extra: string) {
  return [preset?.prompt.trim(), extra.trim()].filter(Boolean).join(', ');
}
