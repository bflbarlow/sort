const App = (() => {
  let audioCtx = null;
  let audioEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playNote(value, duration = 0.08) {
    if (!audioEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      const freq = 220 + (value / 255) * 660;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) { /* ignore */ }
  }

  function playDoneChime() {
    if (!audioEnabled || !audioCtx) return;
    [523, 659, 784].forEach((freq, i) => {
      setTimeout(() => {
        try {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
          osc.start(audioCtx.currentTime);
          osc.stop(audioCtx.currentTime + 0.3);
        } catch (e) { /* ignore */ }
      }, i * 120);
    });
  }

  const SORTERS = [
    { name: 'Bubble Sort',      fn: Algorithms.bubbleSort },
    { name: 'Selection Sort',   fn: Algorithms.selectionSort },
    { name: 'Insertion Sort',   fn: Algorithms.insertionSort },
    { name: 'Quick Sort',       fn: Algorithms.quickSort },
    { name: 'Merge Sort',       fn: Algorithms.mergeSort },
    { name: 'Heap Sort',        fn: Algorithms.heapSort },
    { name: 'Shell Sort',       fn: Algorithms.shellSort },
    { name: 'Cocktail Shaker',  fn: Algorithms.cocktailShakerSort },
    { name: "I can't believe it can sort", fn: Algorithms.cantBelieveSort },
    { name: 'Power Sort',                 fn: Algorithms.powerSort },
    { name: '3-Way Power Sort',          fn: Algorithms.kWayPowerSort },
  ];

  let containers = [];
  let currentArray = [];
  let globalPaused = false;

  function generateArray(size) {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 255) + 1);
  }

  function createContainer(index) {
    const div = document.createElement('div');
    div.className = 'sorter-container';
    div.innerHTML = `
      <div class="sorter-header">
        <h2>${SORTERS[index].name}</h2>
        <span class="status">idle</span>
        <span class="stats">Comparisons: 0 | Swaps: 0</span>
      </div>
      <div class="bar-container"></div>
    `;
    return div;
  }

  // Render bars from array — uses live HTMLCollection so new bars are seen
  function renderBars(containerEl, arr) {
    const barContainer = containerEl.querySelector('.bar-container');
    const existing = barContainer.children;  // live HTMLCollection

    // Remove excess bars from the end
    while (existing.length > arr.length) {
      barContainer.removeChild(barContainer.lastChild);
    }

    for (let i = 0; i < arr.length; i++) {
      let bar = existing[i];
      if (!bar) {
        bar = document.createElement('div');
        bar.className = 'bar';
        barContainer.appendChild(bar);
      }
      bar.style.height = `${(arr[i] / 255) * 100}%`;
      bar.dataset.value = arr[i];
    }
  }

  function getBars(containerEl) {
    return containerEl.querySelectorAll('.bar');
  }

  function updateStats(containerEl, comparisons, swaps) {
    containerEl.querySelector('.stats').textContent =
      `Comparisons: ${comparisons} | Swaps: ${swaps}`;
  }

  function setStatus(containerEl, status) {
    const el = containerEl.querySelector('.status');
    el.textContent = status;
    el.className = `status ${status}`;
  }

  async function runSorter(sorterIndex, sourceArray, containerEl) {
    // Each sorter gets its own copy so they don't interfere
    const sorterArray = [...sourceArray];
    const bars = getBars(containerEl);
    let comparisons = 0;
    let swaps = 0;
    let cancelled = false;

    setStatus(containerEl, 'running');

    // Update a single bar's height from the sorter's array
    function updateBarHeight(i) {
      if (bars[i]) {
        bars[i].style.height = `${(sorterArray[i] / 255) * 100}%`;
        bars[i].dataset.value = sorterArray[i];
      }
    }

    function clearHighlights() {
      bars.forEach(b => {
        b.classList.remove('comparing', 'swapping');
      });
    }

    // ---- Raw callbacks (synchronous visual/audio effects) ----
    function compare(indices) {
      comparisons++;
      clearHighlights();
      indices.forEach(i => {
        if (bars[i]) bars[i].classList.add('comparing');
      });
    }

    function swap(indices) {
      swaps++;
      indices.forEach(i => {
        if (bars[i]) {
          bars[i].classList.add('swapping');
          playNote(sorterArray[i], 0.06);
          updateBarHeight(i);
        }
      });
    }

    function markSorted(indices) {
      indices.forEach(i => {
        if (bars[i]) {
          bars[i].classList.remove('comparing', 'swapping');
          bars[i].classList.add('sorted');
        }
      });
    }

    // ---- Pause check ----
    const pauseCheck = () => new Promise(resolve => {
      const check = () => {
        if (globalPaused && !cancelled) {
          requestAnimationFrame(check);
          return;
        }
        resolve();
      };
      check();
    });

    // ---- Wrapped async callbacks (pause-aware) ----
    const ctx = {
      array: sorterArray,
      get speed() {
        return parseInt(document.getElementById('speed-slider').value);
      },
      comparing: async (indices) => {
        await pauseCheck();
        if (cancelled) return;
        compare(indices);
      },
      swapping: async (indices) => {
        await pauseCheck();
        if (cancelled) return;
        swap(indices);
      },
      sorted: async (indices) => {
        await pauseCheck();
        if (cancelled) return;
        markSorted(indices);
      },
      done: () => {
        if (cancelled) return;
        clearHighlights();
        updateStats(containerEl, comparisons, swaps);
        setStatus(containerEl, 'done');
        playDoneChime();
      }
    };

    try {
      await SORTERS[sorterIndex].fn(ctx);
    } catch (e) {
      if (!cancelled) console.error(SORTERS[sorterIndex].name, e);
    }
  }

  function init() {
    const main = document.getElementById('containers');
    main.innerHTML = '';
    containers = [];
    SORTERS.forEach((_, i) => {
      const el = createContainer(i);
      main.appendChild(el);
      containers.push(el);
    });

    reset();

    const $ = (id) => document.getElementById(id);

    $('generate-btn').addEventListener('click', () => {
      initAudio();
      reset();
    });

    $('start-btn').addEventListener('click', () => {
      initAudio();
      globalPaused = false;
      $('pause-btn').textContent = 'Pause All';
      containers.forEach((el, i) => {
        runSorter(i, currentArray, el);
      });
    });

    $('pause-btn').addEventListener('click', () => {
      globalPaused = !globalPaused;
      $('pause-btn').textContent = globalPaused ? 'Resume All' : 'Pause All';
      containers.forEach(el => {
        const status = el.querySelector('.status');
        if (status.textContent === 'running') {
          setStatus(el, globalPaused ? 'paused' : 'running');
        }
      });
    });

    $('reset-btn').addEventListener('click', () => {
      reset();
    });

    $('audio-toggle').addEventListener('change', (e) => {
      audioEnabled = e.target.checked;
    });

    $('compare-toggle').addEventListener('change', (e) => {
      document.body.classList.toggle('no-highlight', !e.target.checked);
    });

    $('size-slider').addEventListener('input', () => {
      reset();
    });
  }

  function reset() {
    globalPaused = false;
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) pauseBtn.textContent = 'Pause All';
    currentArray = generateArray(
      parseInt(document.getElementById('size-slider').value)
    );
    containers.forEach((el) => {
      renderBars(el, currentArray);
      updateStats(el, 0, 0);
      setStatus(el, 'idle');
      getBars(el).forEach(b =>
        b.classList.remove('sorted', 'comparing', 'swapping')
      );
    });
  }

  return { init, reset };
})();

document.addEventListener('DOMContentLoaded', () => App.init());