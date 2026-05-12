import * as turf from "@turf/turf";
import { db } from "./firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, increment } from "firebase/firestore";

export const processConquest = async (
  newPointsArray: [number, number][],
  newOwnerId: string,
  newOwnerTag: string,
  newColor: string
) => {
  // Ensure the polygon is closed for valid GeoJSON
  const polygonPoints = [...newPointsArray];
  if (
    polygonPoints.length > 0 &&
    (polygonPoints[0][0] !== polygonPoints[polygonPoints.length - 1][0] ||
      polygonPoints[0][1] !== polygonPoints[polygonPoints.length - 1][1])
  ) {
    polygonPoints.push([...polygonPoints[0]]);
  }

  if (polygonPoints.length < 4) return { newArea: 0, distance: 0, conqueredAreaTotal: 0, territoryId: null, isStacked: false }; 

  const newPolygon = turf.polygon([polygonPoints]);
  const newArea = turf.area(newPolygon);
  const line = turf.lineString(polygonPoints);
  const distance = turf.length(line, { units: 'kilometers' });

  const territoriesSnap = await getDocs(collection(db, "territories"));
  const allTerritories = territoriesSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  
  // PASS 1: Check for stacking on own territory
  let bestStack: any = null;
  let maxIntersection = 0;

  for (const existingTerritory of allTerritories) {
      if (existingTerritory.ownerId !== newOwnerId) continue;
      
      const existingPoints = [...existingTerritory.points.map((p: any) => [p.lng, p.lat])];
      if (
          existingPoints.length > 0 &&
          (existingPoints[0][0] !== existingPoints[existingPoints.length - 1][0] ||
            existingPoints[0][1] !== existingPoints[existingPoints.length - 1][1])
      ) {
          existingPoints.push([...existingPoints[0]]);
      }
      if (existingPoints.length < 4) continue;

      const existingPolygon = turf.polygon([existingPoints]);
      if (!turf.booleanIntersects(newPolygon, existingPolygon)) continue;
      
      try {
          const intersection = turf.intersect(turf.featureCollection([newPolygon, existingPolygon]));
          if (intersection) {
              const intersectionArea = turf.area(intersection);
              const minArea = Math.min(newArea, existingTerritory.baseArea || existingTerritory.area);
              if (intersectionArea / minArea > 0.4) { // over 40% intersection
                  if (intersectionArea > maxIntersection) {
                      maxIntersection = intersectionArea;
                      bestStack = existingTerritory;
                  }
              }
          }
      } catch (e) {
          console.error("Intersection check error:", e);
      }
  }

  if (bestStack) {
      const stackedOnTerritory = bestStack;
      const currentStack = stackedOnTerritory.layerStack || [];
      // DSA Stack Concept - Push onto stack
      currentStack.push({
          area: newArea,
          addedAt: new Date().toISOString()
      });
      const newStackHeight = (stackedOnTerritory.stackHeight || 1) + 1;
      
      // "area should be multiplied by the number of layers in a stack"
      const baseArea = stackedOnTerritory.baseArea || stackedOnTerritory.area;
      const newTotalArea = baseArea * newStackHeight;
      const areaDiff = newTotalArea - stackedOnTerritory.area;

      await updateDoc(doc(db, "territories", stackedOnTerritory.id), {
          layerStack: currentStack,
          stackHeight: newStackHeight,
          baseArea: baseArea,
          area: newTotalArea, // Multiply and update
          updatedAt: new Date().toISOString() // Update timestamp
      });

      // User's total area increases by the newly created stacked area amount
      await updateDoc(doc(db, "players", newOwnerId), {
          totalArea: increment(areaDiff),
          totalDistance: increment(distance),
          totalSteps: increment(polygonPoints.length * 2), // rough steps
      });

      return { newArea: areaDiff, distance, conqueredAreaTotal: 0, territoryId: stackedOnTerritory.id, isStacked: true };
  }

  // PASS 2: Conquest logic
  let conqueredAreaTotal = 0;

  for (const existingTerritory of allTerritories) {
      if (existingTerritory.ownerId === newOwnerId) continue; 
      
      const existingPoints = [...existingTerritory.points.map((p: any) => [p.lng, p.lat])];
      if (
          existingPoints.length > 0 &&
          (existingPoints[0][0] !== existingPoints[existingPoints.length - 1][0] ||
            existingPoints[0][1] !== existingPoints[existingPoints.length - 1][1])
      ) {
          existingPoints.push([...existingPoints[0]]);
      }
      if (existingPoints.length < 4) continue; 

      const existingPolygon = turf.polygon([existingPoints]);
      
      if (!turf.booleanIntersects(newPolygon, existingPolygon)) continue;
      
      try {
          const diff = turf.difference(turf.featureCollection([existingPolygon, newPolygon]));
          
          if (!diff) {
              await deleteDoc(doc(db, "territories", existingTerritory.id));
              await updateDoc(doc(db, "players", existingTerritory.ownerId), {
                  totalArea: increment(-existingTerritory.area),
                  territoriesCaptured: increment(-1)
              });
              conqueredAreaTotal += existingTerritory.area;
          } else {
              const newExistingArea = turf.area(diff);
              const lostArea = existingTerritory.area - newExistingArea;
              
              if (lostArea > 1) { 
                  conqueredAreaTotal += lostArea;
                  
                  await updateDoc(doc(db, "players", existingTerritory.ownerId), {
                      totalArea: increment(-lostArea)
                  });
                  
                  let newGeometries: number[][][] = [];
                  if (diff.geometry.type === 'Polygon') {
                      newGeometries = [diff.geometry.coordinates[0] as number[][]];
                  } else if (diff.geometry.type === 'MultiPolygon') {
                      newGeometries = diff.geometry.coordinates.map(c => c[0] as number[][]);
                  }
                  
                  let isFirst = true;
                  for (let i=0; i<newGeometries.length; i++) {
                      const ring = newGeometries[i];
                      if (ring.length < 4) continue;
                      const polyChunk = turf.polygon([ring]);
                      const chunkArea = turf.area(polyChunk);
                      
                      const updatedData = {
                          points: ring.map(c => ({lng: c[0], lat: c[1]})),
                          area: chunkArea,
                          baseArea: chunkArea,
                          updatedAt: new Date().toISOString()
                      };
                      
                      if (isFirst) {
                          await updateDoc(doc(db, "territories", existingTerritory.id), updatedData);
                          isFirst = false;
                      } else {
                          const newChunkId = `${existingTerritory.id}_chunk_${i}`;
                          await setDoc(doc(db, "territories", newChunkId), {
                              ...existingTerritory,
                              id: newChunkId,
                              ...updatedData
                          });
                          await updateDoc(doc(db, "players", existingTerritory.ownerId), {
                              territoriesCaptured: increment(1)
                          });
                      }
                  }
              }
          }
      } catch (err) {
          console.error("Turf diff err", err);
      }
  }

  const territoryId = `territory_${Date.now()}`;
  await setDoc(doc(db, "territories", territoryId), {
    id: territoryId,
    ownerId: newOwnerId,
    ownerTag: newOwnerTag,
    color: newColor,
    points: polygonPoints.map(c => ({ lng: c[0], lat: c[1] })),
    stackHeight: 1,
    baseArea: newArea,
    area: newArea,
    distance: distance,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  await updateDoc(doc(db, "players", newOwnerId), {
    totalArea: increment(newArea),
    totalDistance: increment(distance),
    totalSteps: increment(polygonPoints.length * 2), // rough steps
    territoriesCaptured: increment(1),
    lastActive: new Date().toISOString()
  });

  return { newArea, distance, conqueredAreaTotal, territoryId, isStacked: false };
};
