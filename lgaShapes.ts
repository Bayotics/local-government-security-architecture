// Import the JSON file
import lgaShapesData from './lga-shapes.json';

export interface Feature {
  type: string;
  properties: {
    shapeName: string;
    shapeISO: string;
    shapeID: string;
    shapeGroup: string;
    shapeType: string;
  };
  geometry: {
    type: string;
    coordinates: any[];
  };
}

// Export the "features" array with proper typing
export const features: Feature[] = lgaShapesData.features;