# Wayfinder technical brief

## System model

```text
                   ┌───────────────────────┐
                   │ Student-controlled UI │
                   └───────────┬───────────┘
                               │
            preferences / conditions / report
                               │
                               v
┌─────────────────────────────────────────────────────────┐
│ Local routing policy                                     │
│ • reject incompatible infrastructure                     │
│ • price weather, lighting, crowd, sensory trade-offs     │
│ • assign a transparent cost to each graph edge           │
└───────────────────────────┬─────────────────────────────┘
                            v
                 Dijkstra shortest-path search
                            │
              ┌─────────────┴─────────────┐
              v                           v
       Illustrated route          Reason cards / status
```

The prototype has a deliberately small, fictional campus graph in `app.js`. A node contains a position and label. An edge contains its endpoint nodes, a baseline distance in metres, and condition tags. The route engine is deterministic and runs entirely client-side.

## Routing policy

Base distance starts each edge’s cost. The policy then adds penalties based on the student’s selected context:

| Input | Routing behavior |
| --- | --- |
| Step-free | Makes stairs non-viable. |
| High visibility / Night | Penalizes unlit connections. |
| Low sensory / Busy | Penalizes paths marked as crowded. |
| Rain | Penalizes uncovered segments. |
| Barrier report | Makes the affected connection non-viable. |

The large “non-viable” penalty is an implementation shortcut for a filtered graph. A production version would remove the edge completely and expose an explicit no-safe-route state when appropriate.

## Production architecture

The intended production implementation is privacy-preserving by default:

1. A versioned campus-data bundle is downloaded for offline use (paths, access attributes, closures, timestamps).
2. Preference selection and routing run on-device. No account is needed to obtain a route.
3. Optional community reports are sent through a minimal API, stripped of account identifiers, rate-limited, and placed in a moderation queue.
4. The route client only consumes reports with a confidence score, validity window, and campus-team verification state.
5. Facilities teams see aggregate, k-anonymous patterns—not individual student preferences or travel histories.

## Data quality & safety

Accessibility data can cause harm when it is stale. A production system should show a data age, source, confidence indicator, and a clear fallback when it lacks an accessible route. Community signals must expire, be reviewable, and never replace emergency procedures. The current interface intentionally includes an emergency-use warning.

## Accessibility implementation

- Native buttons and form controls preserve keyboard operation.
- Selected chips expose state with `aria-pressed`.
- The barrier interaction uses a native `dialog` with a textual emergency disclaimer.
- The map has a meaningful text alternative; the recommendation and route details are available outside the visual map.
- Focus is visibly styled and layouts reflow for narrow screens.
