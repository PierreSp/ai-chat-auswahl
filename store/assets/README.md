# ChatSweep store artwork

Product brand: **ChatSweep**. English is the default store artwork language; the German promotional tile remains available.

Created on 2026-11-01 with the built-in `image_gen` tool. No external paid API or Runway service was used. The icon contains no text or vendor logos.

## Deliverables

| File | Pixels | Format / alpha | Purpose |
| --- | --- | --- | --- |
| `icon-master.png` | 1254 × 1254 | RGBA PNG, transparent outside the emblem | Original selected generated artwork |
| `icon16.png` | 16 × 16 | RGBA PNG | Extension icon |
| `icon32.png` | 32 × 32 | RGBA PNG | Extension icon |
| `icon48.png` | 48 × 48 | RGBA PNG | Extension icon |
| `icon128.png` | 128 × 128 | RGBA PNG | Extension / store icon |
| `promo-small-master.png` | 1573 × 1000 | RGB PNG | Original German promotional tile |
| `promo-small-440x280.png` | 440 × 280 | RGB PNG, no alpha | German small store promotional tile |
| `promo-small-en-master.png` | 1572 × 1001 | RGB PNG | Original English promotional tile |
| `promo-small-en-440x280.png` | 440 × 280 | RGB PNG, no alpha | Default English small store promotional tile |

The icon uses a forest-green speech-bubble outline, warm-ivory fill, and a bold green checkmark. The visible master emblem at alpha > 127 occupies coordinates (165, 206)–(1089, 1087), about 74% of the canvas width; the 128-pixel export therefore has a roughly 94-pixel-wide motif. The generated palette is approximate and retains subtle raster variation. Transparent alpha was preserved, including antialiased edges.

All exports are deterministic Pillow LANCZOS resizes of the selected generated source. No drawing or redrawing was substituted for the generated artwork. The promo exports convert to RGB and scale directly to 440 × 280; the source aspect ratios differ from the target by at most approximately 0.1%. The icon and both small promotional tiles were visually inspected after export. The earlier filled-bubble candidates had transparency artifacts and were rejected.

## Selected icon prompt (verbatim)

The original generation prompt used the then-current working name ChatKlar only as context. The resulting icon has no lettering and is reused unchanged for the final ChatSweep name.

```text
Use case: logo-brand. Create a finished professional browser-extension app icon for ChatKlar, on a real transparent background. Square 1024 x 1024 canvas. Precisely centered within the central 75% of the canvas: ONE compact rounded speech bubble with a small tail at lower left. The bubble has a thick uniform forest-green outline (#255b45), a fully opaque warm-white interior (#fbfcf9), and ONE bold forest-green checkmark centered inside. Minimal two-color flat vector-style symbol, generous internal spacing, legible at 16 pixels. The green outline is thick and confident, approximately 12% of the bubble width; the checkmark stroke is equally substantial. All white interior regions must be solid opaque, all green regions solid opaque. Outside of the outer shape only, real transparency. No gradient, no shading, no shadow, no texture, no rendering material, no spots, no wear, no extra decorations, no lettering, no words, no vendor logo, no frame. Perfectly clean mathematical curves and flat solid fills. Output the icon alone.
```

Options: `transparent_background: true`; no reference image supplied. Selected original generation filename: `exec-8f5044c5-18cd-492c-9ee1-5d730bcc270c.png`.

## German promotional tile prompt (verbatim)

```text
Use case: ads-marketing / compositing.
Asset type: polished Chrome Web Store small promotional tile for the browser extension ChatSweep. Make a wide rectangular 11:7 canvas, ideally 1320 x 840 pixels. Opaque background.
Input image: the supplied chat-bubble-and-checkmark icon is the exact brand symbol reference. Preserve its rounded forest green chat outline, warm ivory interior, bold green checkmark, and shape. Use it once.
Design: refined minimalist editorial composition on warm ivory #fbfcf9. Forest green #255b45 typography. Spacious, confident, extremely legible at a final size of 440 x 280. Strong simple typographic hierarchy. Place the supplied icon at left above the title, moderately small. Below it, set the large bold modern sans-serif brand name 'ChatSweep'. Under the name use two slightly smaller clean sans-serif lines reading 'Weniger Chats.' and 'Mehr Überblick.'. Align the icon and all text to one left edge with generous outer margins. Use the right side for empty breathing room. Restrained flat design with no extra decorative shapes.
Text verbatim, exactly three lines of text total: 'ChatSweep', 'Weniger Chats.', 'Mehr Überblick.'. Spell Überblick with Ü. No other copy.
Constraints: keep the exact recognizable brand symbol, no browser UI, no screenshots, no vendor logos, no product claims, no texture, no gradients, no shadows, no 3D mockups, no watermark, no badge, no button. Finished promotional artwork only, not a poster shown in a scene.
```

Options: `transparent_background: false`; reference image: `store/assets/icon-master.png`. Selected original generation filename: `exec-a5aaf96c-cd47-4522-87aa-85c98d702f4d.png`.

## English promotional tile prompt (verbatim)

```text
Use case: text-localization.
Edit target: the supplied German ChatSweep Chrome Web Store promotional tile. Produce an English language variant with exactly the same canvas aspect ratio, warm ivory background, forest green palette, chat-bubble-and-checkmark icon, icon position and size, left alignment, typographic hierarchy, spacing, margins and overall layout. Preserve the brand name ChatSweep unchanged.
Change only the two German tagline lines: replace 'Weniger Chats.' with 'Fewer chats.' and replace 'Mehr Überblick.' with 'More clarity.'. Match the current clean sans-serif typography, size, weight, color and line spacing. Do not stretch the translated text to match the old line lengths.
Final text verbatim on three lines: 'ChatSweep', 'Fewer chats.', 'More clarity.'. No other text. Keep the background fully opaque and the design flat. No new graphics, no UI screenshot, no buttons, no vendor logos, no texture, no shadow, no watermark. Preserve the existing icon shape and appearance.
```

Options: `transparent_background: false`; edit reference image: `store/assets/promo-small-master.png`, viewed before editing. Selected original generation filename: `exec-c6b125d0-6ea0-4903-a235-f7b45a68dba2.png`. The generated English master was copied unchanged; the export is 440 × 280 RGB. The German files were preserved.

## Scope

These files are prepared assets, not a store upload or publication. The promotional tile is branded artwork; real extension screenshots are maintained separately.

