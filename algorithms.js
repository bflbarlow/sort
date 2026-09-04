const Algorithms = (() => {

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function getDelay(speed) {
    return Math.max(1, 700 - (speed + 100) * 3.5);
  }

  // Each algorithm works directly on context.array (each sorter gets its own copy)
  // Swap values FIRST, then call swapping(indices) so the wrapper can read updated values
  // context = { array, comparing, swapping, sorted, done, speed }

  async function bubbleSort(ctx) {
    const arr = ctx.array;
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        await ctx.comparing([j, j + 1]);
        await sleep(getDelay(ctx.speed));
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          await ctx.swapping([j, j + 1]);
          await sleep(getDelay(ctx.speed));
        }
      }
      await ctx.sorted([n - 1 - i]);
    }
    await ctx.sorted([0]);
    ctx.done();
  }

  async function selectionSort(ctx) {
    const arr = ctx.array;
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        await ctx.comparing([minIdx, j]);
        await sleep(getDelay(ctx.speed));
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        await ctx.swapping([i, minIdx]);
        await sleep(getDelay(ctx.speed));
      }
      await ctx.sorted([i]);
    }
    await ctx.sorted([n - 1]);
    ctx.done();
  }

  async function insertionSort(ctx) {
    const arr = ctx.array;
    const n = arr.length;
    await ctx.sorted([0]);
    for (let i = 1; i < n; i++) {
      let j = i;
      while (j > 0) {
        await ctx.comparing([j - 1, j]);
        await sleep(getDelay(ctx.speed));
        if (arr[j - 1] > arr[j]) {
          [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
          await ctx.swapping([j - 1, j]);
          j--;
          await sleep(getDelay(ctx.speed));
        } else {
          break;
        }
      }
      await ctx.sorted([...Array(i + 1).keys()]);
    }
    await ctx.sorted([...Array(n).keys()]);
    ctx.done();
  }

  async function quickSort(ctx) {
    const arr = ctx.array;

    async function partition(low, high) {
      const pivot = arr[high];
      let i = low - 1;
      for (let j = low; j < high; j++) {
        await ctx.comparing([j, high]);
        await sleep(getDelay(ctx.speed));
        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          await ctx.swapping([i, j]);
          await sleep(getDelay(ctx.speed));
        }
      }
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      await ctx.swapping([i + 1, high]);
      await sleep(getDelay(ctx.speed));
      return i + 1;
    }

    async function sort(low, high) {
      if (low < high) {
        const pi = await partition(low, high);
        await ctx.sorted([pi]);
        await sort(low, pi - 1);
        await sort(pi + 1, high);
      }
    }

    await sort(0, arr.length - 1);
    await ctx.sorted([...Array(arr.length).keys()]);
    ctx.done();
  }

  async function mergeSort(ctx) {
    const arr = ctx.array;

    async function merge(left, mid, right) {
      const L = arr.slice(left, mid + 1);
      const R = arr.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;

      while (i < L.length && j < R.length) {
        await ctx.comparing([left + i, mid + 1 + j]);
        await sleep(getDelay(ctx.speed));
        if (L[i] <= R[j]) {
          arr[k] = L[i]; i++;
        } else {
          arr[k] = R[j]; j++;
        }
        await ctx.swapping([k]);
        await sleep(getDelay(ctx.speed));
        k++;
      }
      while (i < L.length) {
        arr[k] = L[i];
        await ctx.swapping([k]);
        await sleep(getDelay(ctx.speed));
        i++; k++;
      }
      while (j < R.length) {
        arr[k] = R[j];
        await ctx.swapping([k]);
        await sleep(getDelay(ctx.speed));
        j++; k++;
      }
    }

    async function sort(left, right) {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        await sort(left, mid);
        await sort(mid + 1, right);
        await merge(left, mid, right);
      }
    }

    await sort(0, arr.length - 1);
    await ctx.sorted([...Array(arr.length).keys()]);
    ctx.done();
  }

  async function heapSort(ctx) {
    const arr = ctx.array;
    const n = arr.length;

    async function heapify(i, hSize) {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < hSize) {
        await ctx.comparing([largest, left]);
        await sleep(getDelay(ctx.speed));
        if (arr[left] > arr[largest]) largest = left;
      }
      if (right < hSize) {
        await ctx.comparing([largest, right]);
        await sleep(getDelay(ctx.speed));
        if (arr[right] > arr[largest]) largest = right;
      }

      if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        await ctx.swapping([i, largest]);
        await sleep(getDelay(ctx.speed));
        await heapify(largest, hSize);
      }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await heapify(i, n);
    }

    for (let i = n - 1; i > 0; i--) {
      [arr[0], arr[i]] = [arr[i], arr[0]];
      await ctx.swapping([0, i]);
      await sleep(getDelay(ctx.speed));
      await ctx.sorted([i]);
      await heapify(0, i);
    }
    await ctx.sorted([0]);
    ctx.done();
  }

  async function shellSort(ctx) {
    const arr = ctx.array;
    const n = arr.length;
    let gap = Math.floor(n / 2);

    while (gap > 0) {
      for (let i = gap; i < n; i++) {
        let j = i;
        while (j >= gap) {
          await ctx.comparing([j - gap, j]);
          await sleep(getDelay(ctx.speed));
          if (arr[j - gap] > arr[j]) {
            [arr[j - gap], arr[j]] = [arr[j], arr[j - gap]];
            await ctx.swapping([j - gap, j]);
            j -= gap;
            await sleep(getDelay(ctx.speed));
          } else {
            break;
          }
        }
      }
      gap = Math.floor(gap / 2);
    }
    await ctx.sorted([...Array(n).keys()]);
    ctx.done();
  }

  async function cocktailShakerSort(ctx) {
    const arr = ctx.array;
    let start = 0, end = arr.length - 1, swapped = true;

    while (swapped) {
      swapped = false;
      for (let i = start; i < end; i++) {
        await ctx.comparing([i, i + 1]);
        await sleep(getDelay(ctx.speed));
        if (arr[i] > arr[i + 1]) {
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
          await ctx.swapping([i, i + 1]);
          swapped = true;
          await sleep(getDelay(ctx.speed));
        }
      }
      await ctx.sorted([end]);
      end--;
      if (!swapped) break;
      swapped = false;
      for (let i = end; i > start; i--) {
        await ctx.comparing([i, i - 1]);
        await sleep(getDelay(ctx.speed));
        if (arr[i] < arr[i - 1]) {
          [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
          await ctx.swapping([i, i - 1]);
          swapped = true;
          await sleep(getDelay(ctx.speed));
        }
      }
      await ctx.sorted([start]);
      start++;
    }
    await ctx.sorted([...Array(arr.length).keys()]);
    ctx.done();
  }

  async function cantBelieveSort(ctx) {
    const arr = ctx.array;
    const n = arr.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        await ctx.comparing([i, j]);
        await sleep(getDelay(ctx.speed));
        if (arr[i] < arr[j]) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          await ctx.swapping([i, j]);
          await sleep(getDelay(ctx.speed));
        }
      }
    }
    await ctx.sorted([...Array(n).keys()]);
    ctx.done();
  }

  async function kWayPowerSort(ctx, k = 3) {
    const arr = ctx.array;
    const n = arr.length;

    function firstRunOf(b) {
      let e = b + 1;
      while (e < n && arr[e] >= arr[e - 1]) e++;
      return e;
    }

    async function merge(b1, e1, b2, e2) {
      const L = arr.slice(b1, e1);
      const R = arr.slice(b2, e2);
      let i = 0, j = 0, p = b1;
      while (i < L.length && j < R.length) {
        await ctx.comparing([b1 + i, b2 + j]);
        await sleep(getDelay(ctx.speed));
        if (L[i] <= R[j]) { arr[p] = L[i]; i++; }
        else { arr[p] = R[j]; j++; }
        await ctx.swapping([p]);
        await sleep(getDelay(ctx.speed));
        p++;
      }
      while (i < L.length) {
        arr[p] = L[i];
        await ctx.swapping([p]);
        await sleep(getDelay(ctx.speed));
        i++; p++;
      }
      while (j < R.length) {
        arr[p] = R[j];
        await ctx.swapping([p]);
        await sleep(getDelay(ctx.speed));
        j++; p++;
      }
      return [b1, p];
    }

    async function mergeRuns(L, b1, e1) {
      let accB = b1, accE = e1;
      for (let i = 0; i < L.length; i++) {
        [accB, accE] = await merge(L[i][0], L[i][1], accB, accE);
      }
      return [accB, accE];
    }

    function powerK(b1, e1, b2, e2) {
      const n1 = e1 - b1, n2 = e2 - b2;
      const a = (b1 + n1 / 2) / n;
      const b = (b2 + n2 / 2) / n;
      let p = 0;
      while (Math.floor(a * Math.pow(k, p)) === Math.floor(b * Math.pow(k, p))) p++;
      return p;
    }

    const S = [];
    let b1 = 0, e1 = firstRunOf(b1);

    while (e1 < n) {
      const b2 = e1, e2 = firstRunOf(b2);
      const P = powerK(b1, e1, b2, e2);

      while (S.length > 0 && S[S.length - 1][2] > P) {
        const topPower = S[S.length - 1][2];
        const L = [];
        while (S.length > 0 && S[S.length - 1][2] === topPower) {
          L.push(S.pop());
        }
        [b1, e1] = await mergeRuns(L, b1, e1);
      }

      S.push([b1, e1, P]);
      b1 = b2; e1 = e2;
    }

    while (S.length > 0) {
      const count = Math.min(k - 1, S.length);
      const batch = [];
      for (let i = 0; i < count; i++) batch.push(S.pop());
      [b1, e1] = await mergeRuns(batch, b1, e1);
    }

    await ctx.sorted([...Array(n).keys()]);
    ctx.done();
  }

  async function powerSort(ctx) {
    const arr = ctx.array;
    const n = arr.length;

    // Find end of first sorted run starting at b
    function firstRunOf(b) {
      let e = b + 1;
      while (e < n && arr[e] >= arr[e - 1]) {
        e++;
      }
      return e;
    }

    // Merge two sorted subarrays [b1, e1) and [b2, e2)
    async function merge(b1, e1, b2, e2) {
      const L = arr.slice(b1, e1);
      const R = arr.slice(b2, e2);
      let i = 0, j = 0, k = b1;

      while (i < L.length && j < R.length) {
        await ctx.comparing([b1 + i, b2 + j]);
        await sleep(getDelay(ctx.speed));
        if (L[i] <= R[j]) {
          arr[k] = L[i]; i++;
        } else {
          arr[k] = R[j]; j++;
        }
        await ctx.swapping([k]);
        await sleep(getDelay(ctx.speed));
        k++;
      }
      while (i < L.length) {
        arr[k] = L[i];
        await ctx.swapping([k]);
        await sleep(getDelay(ctx.speed));
        i++; k++;
      }
      while (j < R.length) {
        arr[k] = R[j];
        await ctx.swapping([k]);
        await sleep(getDelay(ctx.speed));
        j++; k++;
      }
      return [b1, k];
    }

    // Compute node power from run positions
    function nodePower(n, b1, e1, b2, e2) {
      const n1 = e1 - b1;
      const n2 = e2 - b2;
      const a = (b1 + n1 / 2) / n;
      const b = (b2 + n2 / 2) / n;
      let p = 0;
      while (Math.floor(a * Math.pow(2, p)) === Math.floor(b * Math.pow(2, p))) {
        p++;
      }
      return p;
    }

    // Stack stores [b, e, power]
    const S = [];

    let b1 = 0;
    let e1 = firstRunOf(b1);

    while (e1 < n) {
      const b2 = e1;
      const e2 = firstRunOf(b2);

      const P = nodePower(n, b1, e1, b2, e2);

      while (S.length > 0 && S[S.length - 1][2] > P) {
        const top = S.pop();
        [b1, e1] = await merge(top[0], top[1], b1, e1);
      }

      S.push([b1, e1, P]);
      b1 = b2;
      e1 = e2;
    }

    // Merge remaining runs from stack
    while (S.length > 0) {
      const top = S.pop();
      [b1, e1] = await merge(top[0], top[1], b1, e1);
    }

    await ctx.sorted([...Array(n).keys()]);
    ctx.done();
  }

  return {
    bubbleSort, selectionSort, insertionSort,
    quickSort, mergeSort, heapSort,
    shellSort, cocktailShakerSort, cantBelieveSort, powerSort, kWayPowerSort
  };
})();