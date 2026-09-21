# Cinematic Royal Experience

## Goal
Refresh the homepage hotel showcase with a sharper futuristic-luxury presentation, remove every hotel-opening transition, and give Royal pages a layered cinematic scroll atmosphere.

## Changes
- Replace homepage hotel navigation with immediate routing on both Forest and Royal themes; remove video, zoom, and preload transition behavior from hotel-card clicks.
- Redesign the Royal hotel collection as an asymmetric editorial showcase with large imagery, glass-and-gold details, location/status metadata, and clear responsive interactions.
- Add a reusable Royal atmosphere layer with lightweight CSS perspective ornament, particles, light gradients, and scroll-linked parallax.
- Add a reusable GSAP section-reveal system for Royal Home and Hotel pages, scoped to the Royal layouts and respectful of reduced-motion settings.
- Apply the atmosphere and section transitions throughout both Royal pages while keeping all hotel information unchanged.

## Technical details
- Reuse the existing GSAP dependency and register ScrollTrigger safely.
- Animate transforms and opacity only, using GPU-friendly layers and a limited particle count to avoid mobile lag.
- Keep all visual colors tied to existing Royal semantic tokens.
- Verify direct hotel navigation and Royal rendering at desktop and mobile sizes.
