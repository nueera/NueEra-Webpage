NUEERA — FIGMA MOTION ANNOTATIONS (Home Page · Premium · Production Ready)

Global Motion Rule (top of file)
- Motion Principle: Motion supports clarity and hierarchy. No decorative or looping animations. Animate once. Calm and intentional.
- Global Easing: cubic-bezier(0.16, 1, 0.3, 1)
- Trigger Rules:
  - On page load → Hero only
  - On scroll → Section enters viewport (30%)
  - Animate once only

1. HERO SECTION — Motion Note (place near Hero frame)
- Headline (Hero / Headline): Fade in + translateY(12px)
  - Duration: 700ms
  - Delay: 0ms
  - Easing: cubic-bezier(0.16,1,0.3,1)
- Sub-headline (Hero / Subtext): Fade in
  - Duration: 500ms
  - Delay: 120ms
- Micro-copy (Label S): Fade in
  - Duration: 400ms
  - Delay: 200ms
- CTA Buttons (CTA / Primary): Fade in
  - Duration: 400ms
  - Delay: 280ms
- Notes: No parallax. No glow on load. Trigger: page load only.

2. TRUST METRICS (STATS) — Motion Note (place above stats row)
- Stats Motion: Entire block fades in together
  - Duration: 300ms
  - Delay: 0ms
- Important: No count-up animation. Numbers appear static (confidence).

3. WHY NUEERA — Motion Note (place near section container)
- Section Reveal: Fade in + translateY(12px)
  - Duration: 360ms
  - Delay: 0ms
- Cards: No individual entrance animation.
  - Hover: lift -4px (no entrance motion)

4. HOW WE THINK (PRINCIPLES) — Motion Note (place near principle cards)
- Reveal: Fade in only
  - Duration: 360ms
- Hover Interaction (Card / Hover): Lift -4px
  - Duration: 240ms
- Notes: No stagger. No icon animation.

5. SERVICES OVERVIEW CARDS — Motion Note (place near services grid)
- Card Entry (Card / Service): Fade + translateY(12px)
  - Duration: 360ms
  - Stagger: 80ms between cards
- Hover: Lift -4px + subtle border highlight
  - Duration: 240ms

6. WHY CHOOSE NUEERA — Motion Note (place near features list)
- Reveal: Fade in only
  - Duration: 360ms
- Icons: Static (no motion)

7. PROCESS — Motion Note (place near step timeline)
- Step Reveal: Fade + translateY(12px)
  - Duration: 360ms
  - Stagger: 80ms
  - Direction: Bottom → Up (animate from lower offset to position)
- Rule: Same motion for all steps

8. TESTIMONIALS — Motion Note (place near testimonial block)
- Reveal: Fade in only
  - Duration: 360ms
- Interaction: Manual navigation only. No auto-slide.

9. BLOG PREVIEW — Motion Note (place near blog cards)
- Entry: No entrance animation
- Hover: Lift -4px
  - Duration: 240ms

10. FINAL CTA SECTION — Motion Note (place near CTA frame)
- Section: No entrance animation
- Button Hover (CTA / Primary): Glow + slight lift
  - Duration: 240ms

Mobile Motion Overrides — Motion Note (place near mobile frames)
- Disable glow effects on mobile
- Remove hover-only animations on mobile (use tap states instead)
- Reduce motion distance to 8px for translateY / lifts
- Keep same timing values but fewer effects

Figma Naming Convention for Motion (use consistent layer names)
- Hero / Headline
- Hero / Subtext
- Card / Service
- Card / Hover
- CTA / Primary

Developer Handoff Tips (small callouts):
- Specify trigger: "page-load" or "scroll-30%" in the layer note.
- Add exact easing: `cubic-bezier(0.16, 1, 0.3, 1)`.
- Mark elements as "animate-once" in notes to prevent looping.
- For staggered lists, annotate: "stagger 80ms, order: L→R (or bottom→up)".

— End of annotations —
