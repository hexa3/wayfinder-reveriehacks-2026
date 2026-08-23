# Devpost submission copy

## Project name

Wayfinder — routes that include everyone

## One-line tagline

An offline-first campus router that turns access needs and changing conditions into transparent, usable routes.

## Inspiration

The “fastest route” is not universally usable. A student using a wheelchair can meet a flooded ramp; a student with low vision can be sent down an unlit path; a sensory-sensitive student can be forced through a packed courtyard. These are not edge cases—they are infrastructure failures that quietly reduce independence.

We asked: what if a campus map planned around the person first?

## What it does

Wayfinder creates a route from a student’s chosen origin to destination while accounting for step-free access, visibility, sensory load, rain, darkness, crowds, and community-reported barriers. It then explains the route’s trade-offs in plain language.

The experience is deliberately privacy-first: students select route requirements, not medical labels, and preferences are calculated on-device in this prototype. A campus can learn about barrier hotspots only through future aggregate, de-identified reporting—not by tracking an individual’s movements or profile.

## How we built it

We built a responsive web application in vanilla HTML, CSS, and JavaScript. The fictional campus is represented as a weighted graph. Each edge contains a baseline distance and attributes such as `stepFree`, `covered`, `lit`, `busy`, and `steps`.

The routing policy adjusts each edge cost using the selected conditions and Dijkstra’s shortest-path algorithm returns the best viable route. A reported flooded ramp marks that connection unavailable and triggers an immediate reroute. The explanation cards use the same policy inputs as the routing engine, so the UI never invents a rationale after the fact.

## Challenges we ran into

The hard part was avoiding a simplistic “accessibility filter.” Real accessibility is contextual: a technically accessible route may still be unusable at night, in rain, or during a crowded event. We designed a small transparent scoring policy to demonstrate those trade-offs while keeping the visual demo instantly understandable.

We also treated privacy and safety as product requirements, not a disclaimer. The prototype avoids accounts and includes an explicit emergency-use boundary.

## Accomplishments we’re proud of

- Turned several types of access needs into one calm, intuitive interaction model.
- Built a real local routing engine instead of a static mockup.
- Made every recommendation explainable.
- Created a complete, responsive, keyboard-friendly demo with no setup or API keys.
- Framed a scalable campus-data model that does not require a disability database.

## What we learned

“Accessible” is not a binary map attribute. It changes with weather, time, conditions, and each person’s priorities. We learned that a useful inclusive tool must make uncertainty visible and give people control, rather than assume a one-size-fits-all definition of a good route.

## What’s next

We will validate the interaction model with disabled students and campus accessibility teams, import verified GIS/facilities data, and package Wayfinder as an offline PWA. We will add an opt-in, moderated report channel with report expiration and confidence levels, followed by an operator view that exposes only privacy-thresholded aggregate access gaps.

## Built with

HTML5, CSS3, JavaScript, Dijkstra’s algorithm, Render static sites (deployment target)

## Links to add before submission

- Repository: `https://github.com/<your-account>/wayfinder`
- Live demo: `https://wayfinder-accessible-routes.onrender.com`
- Demo video: `<upload your 2-minute screen recording>`
