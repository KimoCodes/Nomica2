export type Transformation = {
  id: string;
  name: string;
  age: number;
  location: string;
  duration: string;
  program: string;
  beforeWeight: number;
  afterWeight: number;
  gluteIncrease: number;
  quote: string;
  story: string;
  tips: string[];
  stats: { label: string; value: string }[];
  featured: boolean;
};

export const TRANSFORMATIONS: Transformation[] = [];

export const TESTIMONIALS: {
  quote: string;
  name: string;
  role: string;
  rating: number;
}[] = [];

export const STATS: { label: string; value: string }[] = [];

export function getTransformationById(id: string): Transformation | undefined {
  return TRANSFORMATIONS.find((t) => t.id === id);
}

export function getFeaturedTransformations(): Transformation[] {
  return TRANSFORMATIONS.filter((t) => t.featured);
}
