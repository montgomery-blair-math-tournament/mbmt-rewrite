interface Division {
  name: string;
  prefix: string;
}

export const CURRENT_YEAR: number = 2025;

export const DIVISIONS: Record<number, Division> = {
  0: {
    name: "Abel",
    prefix: "A",
  },
  1: {
    name: "Jacobi",
    prefix: "J",
  },
};

export const upper = "Jacobi";
export const lower = "Abel";
