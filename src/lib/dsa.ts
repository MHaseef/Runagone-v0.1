/**
 * Douglas-Peucker algorithm for reducing the number of points in a curve.
 */
export function simplifyPath(points: [number, number][], tolerance: number): [number, number][] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let index = 0;

  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = getPerpendicularDistance(points[i], start, end);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }

  if (maxDist > tolerance) {
    const res1 = simplifyPath(points.slice(0, index + 1), tolerance);
    const res2 = simplifyPath(points.slice(index), tolerance);
    return [...res1.slice(0, res1.length - 1), ...res2];
  } else {
    return [start, end];
  }
}

function getPerpendicularDistance(p: [number, number], a: [number, number], b: [number, number]): number {
  const [x, y] = p;
  const [x1, y1] = a;
  const [x2, y2] = b;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
  }

  const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
  const px = x1 + t * dx;
  const py = y1 + t * dy;

  return Math.sqrt((x - px) ** 2 + (y - py) ** 2);
}

/**
 * Spatial Hash Set for 5x5m grid loop detection.
 * Grid size is approximate for lat/lng conversion.
 */
export class SpatialHashSet {
  private grid: Map<string, number[]> = new Map();
  private cellSize: number; // in degrees

  constructor(cellSizeMeters: number = 5) {
    // Approx 1m = 0.000009 degrees lat
    this.cellSize = cellSizeMeters * 0.000009;
  }

  private hash(lat: number, lng: number): string {
    const gx = Math.floor(lat / this.cellSize);
    const gy = Math.floor(lng / this.cellSize);
    return `${gx},${gy}`;
  }

  add(lat: number, lng: number, index: number) {
    const key = this.hash(lat, lng);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(index);
  }

  getIndices(lat: number, lng: number): number[] {
    return this.grid.get(this.hash(lat, lng)) || [];
  }
}

/**
 * Generic Heap for Ranking and Notifications
 */
export class Heap<T> {
  private items: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.comparator = comparator;
  }

  push(item: T) {
    this.items.push(item);
    this.bubbleUp();
  }

  pop(): T | undefined {
    if (this.size() === 0) return undefined;
    if (this.size() === 1) return this.items.pop();

    const top = this.items[0];
    this.items[0] = this.items.pop()!;
    this.bubbleDown();
    return top;
  }

  size(): number {
    return this.items.length;
  }

  private bubbleUp() {
    let index = this.items.length - 1;
    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      if (this.comparator(this.items[index], this.items[parentIndex]) >= 0) break;
      [this.items[index], this.items[parentIndex]] = [this.items[parentIndex], this.items[index]];
      index = parentIndex;
    }
  }

  private bubbleDown() {
    let index = 0;
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let smallest = index;

      if (left < this.size() && this.comparator(this.items[left], this.items[smallest]) < 0) {
        smallest = left;
      }
      if (right < this.size() && this.comparator(this.items[right], this.items[smallest]) < 0) {
        smallest = right;
      }

      if (smallest === index) break;
      [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
      index = smallest;
    }
  }

  toArray(): T[] {
    return [...this.items].sort(this.comparator);
  }
}

/**
 * Linked List for efficient path construction
 */
export class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;
  constructor(value: T) {
    this.value = value;
  }
}

export class LinkedList<T> {
  head: ListNode<T> | null = null;
  tail: ListNode<T> | null = null;
  length: number = 0;

  append(value: T) {
    const newNode = new ListNode(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail!.next = newNode;
      this.tail = newNode;
    }
    this.length++;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  clear() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
}

/**
 * Stack for territory layering (LIFO)
 */
export class Stack<T> {
  private items: T[] = [];

  push(item: T) {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  size(): number {
    return this.items.length;
  }

  toArray(): T[] {
    return [...this.items];
  }
}

/**
 * REQ-05: Phase 2 Ray-casting algorithm for Point-in-Polygon (PIP) detection.
 * Determines if a point is inside a polygon using the ray-casting method.
 */
export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * REQ-05: Phase 1 AABB (Axis-Aligned Bounding Box) check.
 */
export function getBoundingBox(points: [number, number][]) {
    let minLat = points[0][0], maxLat = points[0][0];
    let minLng = points[0][1], maxLng = points[0][1];
    
    for (const [lat, lng] of points) {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
    }
    
    return { minLat, maxLat, minLng, maxLng };
}

