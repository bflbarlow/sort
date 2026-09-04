# Sorting Algorithm Visualizer

A side-by-side, real-time visualization of **9 sorting algorithms** running simultaneously on the same random array. Watch how each algorithm tackles the same data — comparing, swapping, and sorting at different speeds and patterns.

## Features

- **9 Algorithms**: Bubble Sort, Selection Sort, Insertion Sort, Quick Sort, Merge Sort, Heap Sort, Shell Sort, Cocktail Shaker Sort, and a humorous "I can't believe it can sort" (a deliberately inefficient comparison sort).
- **Synchronized Comparison**: All algorithms sort the exact same random array, making it easy to compare their behavior and efficiency.
- **Live Statistics**: Each sorter displays real-time comparison and swap counts.
- **Audio Feedback**: Bars "chime" as they swap values (Web Audio API), and a completion chime plays when a sort finishes.
- **Pause/Resume**: Freeze all sorts mid-execution and resume when ready.
- **Adjustable Speed**: Slider controls animation speed from ultra-slow to near-instant.
- **Adjustable Array Size**: Slider controls the number of bars (10–200).
- **Responsive Layout**: 1-column on mobile, 2-column on tablet, 3-column on desktop.
- **Dark Theme**: Easy on the eyes with a clean, modern UI.

## How It Works

### Architecture

The project is a **pure vanilla JavaScript** single-page application — zero dependencies, no build step. It consists of four files:

| File | Purpose |
|------|---------|
| `index.html` | Page structure and control UI |
| `styles.css` | Dark theme, responsive grid, bar animations |
| `algorithms.js` | The 9 sorting algorithm implementations |
| `app.js` | Application logic, rendering, and event handling |

### The Algorithm Interface

Each sorting algorithm follows a simple async contract. It receives a **context object** (`ctx`) as its only argument:

```javascript
async function mySort(ctx) {
  const arr = ctx.array;  // The array to sort (each sorter gets its own copy)

  // Notify the visualizer:
  await ctx.comparing([i, j]);   // Highlight bars being compared
  await ctx.swapping([i, j]);    // Highlight bars being swapped
  await ctx.sorted([i, j]);      // Mark bars as sorted
  ctx.done();                     // Signal completion
}
```

This interface is the key design pattern: algorithms are **decoupled from the DOM**. They operate on a plain array and call context methods for side effects (visual/audio). This makes algorithms easy to test, swap, or extend.

### The Context Wrapper

The context object wraps each algorithm's callbacks with:

1. **Pause support**: Each async callback checks a `globalPaused` flag via `requestAnimationFrame` before proceeding.
2. **Speed control**: A `sleep()` call with delay computed from the speed slider (`getDelay()`).
3. **Visual effects**: Adding/removing CSS classes (`comparing`, `swapping`, `sorted`) on bar elements.
4. **Audio**: Playing notes via the Web Audio API proportional to bar values.

### Rendering

Bars are DOM elements (`<div class="bar">`) whose heights are set as a percentage of the container (`(value / 255) * 100%`). The `renderBars()` function uses a live `HTMLCollection` to efficiently add/remove bars as the array size changes. Bars are reused when possible to minimize DOM thrashing.

### Color Coding

| State | Color | Meaning |
|-------|-------|---------|
| Default | `#3a4558` | Unprocessed bar |
| `.comparing` | `#8aa4c0` (light blue) | Currently being compared |
| `.swapping` | `#d4e0ec` (bright white-blue) | Currently being swapped |
| `.sorted` | `#4a5568` (muted blue-gray) | Confirmed sorted position |

### Status Indicators

| Status | Color | When |
|--------|-------|------|
| `idle` | Gray | Before or after sorting |
| `running` | Blue | Actively sorting |
| `done` | Green | Sort completed |

## Controls

| Control | Description |
|---------|-------------|
| **Generate New Array** | Creates a fresh random array and resets all sorts |
| **Start All** | Launches all 9 algorithms simultaneously |
| **Pause All / Resume All** | Toggles pause state across all sorts |
| **Reset** | Stops and resets all sorts to initial state |
| **Speed Slider** | Controls animation speed (−100 to +100). Range: ~700ms to ~35ms delay per operation |
| **Array Size Slider** | Controls number of bars (10 to 200) |
| **Audio Toggle** | Enable/disable sound effects |
| **Highlight Comparisons Toggle** | Enable/disable comparison/swap highlighting |

## Algorithm Quick Reference

| Algorithm | Time Complexity (Avg) | Time Complexity (Best) | Space | Style |
|-----------|----------------------|----------------------|-------|-------|
| Bubble Sort | O(n²) | O(n) | O(1) | Simple, swapping neighbors |
| Selection Sort | O(n²) | O(n²) | O(1) | Finds min, swaps to front |
| Insertion Sort | O(n²) | O(n) | O(1) | Builds sorted portion left-to-right |
| Quick Sort | O(n log n) | O(n log n) | O(log n) | Divide and conquer, pivot-based |
| Merge Sort | O(n log n) | O(n log n) | O(n) | Divide and conquer, merge step |
| Heap Sort | O(n log n) | O(n log n) | O(1) | Heap data structure, extract max |
| Shell Sort | O(n log² n)* | O(n log n)* | O(1) | Gap-based insertion sort |
| Cocktail Shaker | O(n²) | O(n) | O(1) | Bidirectional bubble sort |
| "Can't Believe" | O(n²) | O(n²) | O(1) | Compares every pair — intentionally slow |

*\* Shell Sort complexity depends on gap sequence; this implementation uses Knuth's / Shell's original sequence.*

## Running Locally

No setup required. Open `index.html` in any modern browser:

## Project Structure

```
websort/
├── index.html      # Single page: header controls + grid container
├── styles.css      # Dark theme, responsive grid, bar styling
├── algorithms.js   # 9 sorting algorithms (IIFE module)
├── app.js          # App logic, rendering, events (IIFE module)
└── README.md       # This file
```

## Tech Stack

- **HTML5** — Semantic structure
- **CSS3** — Flexbox, Grid, custom properties, transitions
- **Vanilla JavaScript (ES6+)** — IIFE modules, async/await, arrow functions, template literals, destructuring
- **Web Audio API** — Oscillator-based sound synthesis
- **requestAnimationFrame** — Pause loop for smooth state checking
