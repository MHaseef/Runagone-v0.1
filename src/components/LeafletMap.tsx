import React, { useEffect, useRef } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "@/src/lib/firebase";
import { collection, onSnapshot, query, limit } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "@/src/lib/firestore-error-handler";

import { PathTracker } from "@/src/lib/pathTracker";

// Fix for default marker icons in Leaflet with React
// @ts-expect-error - Leaflet internal icon methods are not typed in a way that allows simple deletion
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LeafletMapProps {
  className?: string;
  zoom?: number;
  centerTrigger?: number;
}

export const LeafletMap = ({ className, zoom = 15, centerTrigger }: LeafletMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const lastLatLngRef = useRef<L.LatLng | null>(null);
  const territoriesRef = useRef<Record<string, L.Polygon>>({});
  
  // Custom LinkedList logic for drawing area
  const userPathTracker = useRef<PathTracker>(new PathTracker());
  const pathPolylineRef = useRef<L.Polyline | null>(null);

  // Custom LinkedList logic for DUMMY players
  const dummyPathTracker = useRef<PathTracker>(new PathTracker());
  const dummyPolylineRef = useRef<L.Polyline | null>(null);
  const dummyMarkerRef = useRef<L.Marker | null>(null);

  // Manual centering
  useEffect(() => {
    if (mapInstanceRef.current && centerTrigger) {
      if (lastLatLngRef.current) {
        mapInstanceRef.current.setView(lastLatLngRef.current, zoom);
      } else {
        // Fallback if we don't have location yet
        mapInstanceRef.current.locate({ setView: true, maxZoom: zoom });
      }
    }
  }, [centerTrigger, zoom]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Cleanup if already exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize map with a default view (London) while waiting for location
    const defaultLocation: L.LatLngExpression = [51.505, -0.09];
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
      fadeAnimation: true,
    }).setView(defaultLocation, zoom);

    mapInstanceRef.current = map;

    // Add dark mode tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(map);

    // Add zoom control at bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Locate user and watch
    console.log("Starting geolocation watch...");
    map.locate({ 
      setView: true, 
      maxZoom: zoom, 
      enableHighAccuracy: true,
      watch: true
    });

    // Firestore Territory Listener
    const q = query(collection(db, "territories"), limit(100));
    const unsubscribeTerritories = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        const id = change.doc.id;

        if (change.type === "removed") {
          if (territoriesRef.current[id]) {
            territoriesRef.current[id].remove();
            delete territoriesRef.current[id];
          }
          return;
        }

        const points = data.points as {lng: number, lat: number}[];
        // Leaflet expects [lat, lng]
        const latLngs = points.map(p => [p.lat, p.lng] as [number, number]);

        if (change.type === "added" || change.type === "modified") {
          const stackHeight = data.stackHeight || 1;
          const fillOpacity = Math.min(0.9, 0.4 + ((stackHeight - 1) * 0.15));
          const weight = stackHeight > 1 ? 3 : 2;

          if (territoriesRef.current[id]) {
            territoriesRef.current[id].setLatLngs(latLngs);
            territoriesRef.current[id].setStyle({
              fillOpacity: fillOpacity,
              weight: weight
            });
            if (stackHeight > 1) {
                const tooltipHtml = `<div class="text-xs font-bold text-white bg-black/60 px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-md shadow-sm flex items-center justify-center min-w-[20px]">${stackHeight}</div>`;
                territoriesRef.current[id].bindTooltip(tooltipHtml, {
                   permanent: true, direction: "center", className: "!bg-transparent !border-0 !shadow-none !p-0"
                });
            }
          } else {
            const poly = L.polygon(latLngs, {
              color: data.color || "#3b82f6",
              fillColor: data.color || "#3b82f6",
              fillOpacity: fillOpacity,
              weight: weight,
              className: "territory-polygon"
            }).addTo(map);
            
            if (data.ownerTag) {
              poly.bindPopup(`Captured by: ${data.ownerTag}<br/>Layers: ${stackHeight}`);
            }
            if (stackHeight > 1) {
                const tooltipHtml = `<div class="text-xs font-bold text-white bg-black/60 px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-md shadow-sm flex items-center justify-center min-w-[20px]">${stackHeight}</div>`;
                poly.bindTooltip(tooltipHtml, {
                   permanent: true, direction: "center", className: "!bg-transparent !border-0 !shadow-none !p-0"
                });
            }
            
            territoriesRef.current[id] = poly;
          }
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "territories");
    });

    const handleTestWalkEvent = ((e: CustomEvent<{lat: number, lng: number, clear?: boolean, color?: string}>) => {
      if (!mapInstanceRef.current) return;
      const map = mapInstanceRef.current;

      if (e.detail.clear) {
        dummyPathTracker.current.clear();
        if (dummyPolylineRef.current) {
          dummyPolylineRef.current.remove();
          dummyPolylineRef.current = null;
        }
        if (dummyMarkerRef.current) {
          dummyMarkerRef.current.remove();
          dummyMarkerRef.current = null;
        }
        return;
      }

      const { lat, lng, color = "#ef4444" } = e.detail;
      const point = L.latLng(lat, lng);
      
      dummyPathTracker.current.addPoint(lat, lng);
      const pathCoords = dummyPathTracker.current.toArray();

      if (!dummyPolylineRef.current) {
        dummyPolylineRef.current = L.polyline(pathCoords, {
          color: color, // Use dummy's selected color
          weight: 4,
          dashArray: "10, 10",
        }).addTo(map);
      } else {
        dummyPolylineRef.current.setLatLngs(pathCoords);
      }
      
      if (!dummyMarkerRef.current) {
        dummyMarkerRef.current = L.marker(point).addTo(map).bindPopup("Dummy Player").openPopup();
      } else {
        dummyMarkerRef.current.setLatLng(point);
      }
      
      // Follow the dummy for testing purposes
      map.setView(point, map.getZoom(), { animate: true });
    }) as EventListener;
    window.addEventListener("TEST_WALK_DUMMY", handleTestWalkEvent);

    map.on("locationfound", (e) => {
      console.log("Location found/updated:", e.latlng);
      lastLatLngRef.current = e.latlng;
      
      // Append to our custom Linked List
      userPathTracker.current.addPoint(e.latlng.lat, e.latlng.lng);
      
      // Convert Linked List to array for Leaflet drawing
      const pathCoords = userPathTracker.current.toArray();
      
      if (!pathPolylineRef.current) {
        // Create the user's walked path trail
        pathPolylineRef.current = L.polyline(pathCoords, {
          color: "#22c55e", // Green trail
          weight: 4,
          dashArray: "10, 10",
        }).addTo(map);
      } else {
        pathPolylineRef.current.setLatLngs(pathCoords);
      }
      
      if (!markerRef.current) {
        markerRef.current = L.marker(e.latlng).addTo(map).bindPopup("You are here").openPopup();
      } else {
        markerRef.current.setLatLng(e.latlng);
      }
      
      // Auto-center as requested: "map to always zoomed to player location"
      map.setView(e.latlng, map.getZoom());
    });

    map.on("locationerror", (e) => {
      console.warn("Location error:", e.message);
    });

    // Invalidate size after a short delay
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    return () => {
      clearTimeout(timer);
      unsubscribeTerritories();
      window.removeEventListener("TEST_WALK_DUMMY", handleTestWalkEvent);
      
      // Clear polygons
      Object.keys(territoriesRef.current).forEach(id => {
        territoriesRef.current[id].remove();
      });
      territoriesRef.current = {};

      if (pathPolylineRef.current) {
        pathPolylineRef.current.remove();
        pathPolylineRef.current = null;
      }
      userPathTracker.current.clear();
      
      if (dummyPolylineRef.current) {
        dummyPolylineRef.current.remove();
        dummyPolylineRef.current = null;
      }
      if (dummyMarkerRef.current) {
        dummyMarkerRef.current.remove();
        dummyMarkerRef.current = null;
      }
      dummyPathTracker.current.clear();

      if (mapInstanceRef.current) {
        mapInstanceRef.current.stopLocate();
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [zoom]);

  return (
    <div className={`relative w-full h-full min-h-[400px] bg-[#111] overflow-hidden ${className ?? ""}`}>
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />
      
      {/* Vignette overlay to match design system - lower z-index than UI controls */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/30 via-transparent to-background/50 z-10" />
    </div>
  );
};
