export class PathNode {
  lat: number;
  lng: number;
  timestamp: number;
  next: PathNode | null = null;

  constructor(lat: number, lng: number) {
    this.lat = lat;
    this.lng = lng;
    this.timestamp = Date.now();
  }
}

export class PathTracker {
  head: PathNode | null = null;
  tail: PathNode | null = null;
  size: number = 0;
  
  // Appends a new coordinate to the path
  addPoint(lat: number, lng: number) {
    const newNode = new PathNode(lat, lng);
    if (!this.head || !this.tail) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.size++;
    return newNode;
  }

  // Returns path as an array of [lat, lng] for Leaflet to easily draw
  toArray(): [number, number][] {
    const points: [number, number][] = [];
    let current = this.head;
    while (current) {
      points.push([current.lat, current.lng]);
      current = current.next;
    }
    return points;
  }
  
  clear() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }
}
