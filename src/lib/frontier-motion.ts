type Point = readonly [x: number, y: number];
type Region = readonly [left: number, top: number, width: number, height: number];
type Light = "blue" | "amber";

type Gesture = { region: Region; travel: Point; at: number };
type Trace = { from: Point; bend: Point; to: Point; at: number; light: Light };
type Globe = { center: Point; radius: Point; ring: Point; period: number };

export type FrontierMotion = {
  gestures: readonly Gesture[];
  traces: readonly Trace[];
  focus: Point;
  lamp?: Point;
  globe?: Globe;
  response?: { at: number; light: Light | "neutral" };
};

// Coordinates use the normalized, uncropped room image. Ring uses (y offset, slope).
const rooms: Readonly<Record<string, FrontierMotion | undefined>> = {
  "the-frontier-may-exist-in-the-interaction": {
    gestures: [{ region: [.553, .506, .134, .146], travel: [-.018, .023], at: .65 }],
    traces: [
      { from: [.596, .562], bend: [.568, .641], to: [.518, .709], at: 1.25, light: "blue" },
      { from: [.518, .709], bend: [.441, .753], to: [.379, .697], at: 2.28, light: "amber" },
    ],
    focus: [.518, .715],
    lamp: [.067, .513],
    globe: { center: [.507, .289], radius: [.085, .151], ring: [.017, -.66], period: 32 },
  },
  "when-the-machine-notices-first": {
    gestures: [{ region: [.549, .429, .15, .126], travel: [-.019, .012], at: .73 }],
    traces: [
      { from: [.59, .477], bend: [.569, .453], to: [.538, .497], at: 1.1, light: "blue" },
      { from: [.538, .497], bend: [.46, .534], to: [.386, .56], at: 2.12, light: "amber" },
    ],
    focus: [.538, .497],
    lamp: [.026, .379],
    globe: { center: [.700, .632], radius: [.062, .110], ring: [.002, .24], period: 36 },
  },
  "what-decides-what-matters": {
    gestures: [
      { region: [.343, .371, .122, .136], travel: [.016, .018], at: .92 },
      { region: [.576, .409, .139, .112], travel: [-.018, .020], at: 1.51 },
    ],
    traces: [
      { from: [.621, .463], bend: [.559, .405], to: [.445, .490], at: .46, light: "blue" },
      { from: [.416, .448], bend: [.414, .577], to: [.560, .605], at: 1.24, light: "amber" },
      { from: [.560, .605], bend: [.585, .586], to: [.606, .555], at: 2.32, light: "blue" },
    ],
    focus: [.511, .566],
    lamp: [.065, .445],
    globe: { center: [.509, .570], radius: [.076, .137], ring: [.022, -.40], period: 29 },
  },
  "the-frontier-asks-to-slow-down-who-holds-the-brakes": {
    gestures: [{ region: [.481, .395, .057, .258], travel: [.004, .002], at: 1.7 }],
    traces: [
      { from: [.118, .778], bend: [.224, .738], to: [.401, .607], at: .36, light: "amber" },
      { from: [.883, .773], bend: [.753, .733], to: [.613, .607], at: .36, light: "blue" },
    ],
    focus: [.508, .643],
    globe: { center: [.516, .329], radius: [.109, .094], ring: [.118, 0], period: 34 },
    response: { at: 1.57, light: "neutral" },
  },
};

export function getFrontierMotion(slug: string) {
  return Object.hasOwn(rooms, slug) ? rooms[slug] : undefined;
}
