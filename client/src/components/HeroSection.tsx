import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Lottie from "lottie-react";

const envelopeAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 120,
  w: 200,
  h: 200,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Hearts",
      sr: 1,
      ks: {
        o: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 30, s: [0] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 50, s: [100] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 90, s: [100] },
          { t: 120, s: [0] }
        ]},
        r: { a: 0, k: 0 },
        p: { a: 1, k: [
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 30, s: [100, 80, 0] },
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 90, s: [100, 40, 0] },
          { t: 120, s: [100, 20, 0] }
        ]},
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 30, s: [0, 0, 100] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 50, s: [80, 80, 100] },
          { t: 120, s: [60, 60, 100] }
        ]}
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "sh", ks: { a: 0, k: { c: true, v: [[0, -8], [-12, -20], [-20, -8], [0, 12], [20, -8], [12, -20]], i: [[0, 0], [-8, 0], [0, -12], [0, 0], [0, -12], [8, 0]], o: [[0, 0], [-8, 0], [0, 12], [0, 0], [0, 12], [8, 0]] }}},
            { ty: "fl", c: { a: 0, k: [0.9, 0.3, 0.4, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        }
      ]
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Envelope Flap",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [0] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 30, s: [-180] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 90, s: [-180] },
          { t: 120, s: [0] }
        ]},
        p: { a: 0, k: [100, 75, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "sh", ks: { a: 0, k: { c: true, v: [[-45, 0], [0, 35], [45, 0]], i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]] }}},
            { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 } },
            { ty: "fl", c: { a: 0, k: [0.7, 0.5, 0.95, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        }
      ]
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: "Envelope Body",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 110, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [90, 60] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 6 } },
            { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 } },
            { ty: "fl", c: { a: 0, k: [0.9, 0.85, 0.98, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        }
      ]
    }
  ]
};

const confettiAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 90,
  w: 150,
  h: 150,
  assets: [],
  layers: [
    {
      ddd: 0, ind: 1, ty: 4, nm: "Confetti1", sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 70, s: [100] }, { t: 90, s: [0] }] },
        r: { a: 1, k: [{ i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [0] }, { t: 90, s: [360] }] },
        p: { a: 1, k: [
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 0, s: [75, 20, 0] },
          { t: 90, s: [45, 130, 0] }
        ]},
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [{ ty: "gr", it: [
        { ty: "rc", d: 1, s: { a: 0, k: [8, 12] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } },
        { ty: "fl", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]}]
    },
    {
      ddd: 0, ind: 2, ty: 4, nm: "Confetti2", sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 70, s: [100] }, { t: 90, s: [0] }] },
        r: { a: 1, k: [{ i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [45] }, { t: 90, s: [405] }] },
        p: { a: 1, k: [
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 0, s: [75, 30, 0] },
          { t: 90, s: [110, 140, 0] }
        ]},
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [{ ty: "gr", it: [
        { ty: "rc", d: 1, s: { a: 0, k: [6, 10] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } },
        { ty: "fl", c: { a: 0, k: [1, 0.7, 0.2, 1] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]}]
    },
    {
      ddd: 0, ind: 3, ty: 4, nm: "Confetti3", sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 70, s: [100] }, { t: 90, s: [0] }] },
        r: { a: 1, k: [{ i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [-30] }, { t: 90, s: [330] }] },
        p: { a: 1, k: [
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 0, s: [75, 25, 0] },
          { t: 90, s: [60, 135, 0] }
        ]},
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [{ ty: "gr", it: [
        { ty: "el", s: { a: 0, k: [10, 10] }, p: { a: 0, k: [0, 0] } },
        { ty: "fl", c: { a: 0, k: [0.3, 0.8, 0.5, 1] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]}]
    },
    {
      ddd: 0, ind: 4, ty: 4, nm: "Confetti4", sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 70, s: [100] }, { t: 90, s: [0] }] },
        r: { a: 1, k: [{ i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [20] }, { t: 90, s: [380] }] },
        p: { a: 1, k: [
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 0, s: [75, 35, 0] },
          { t: 90, s: [100, 125, 0] }
        ]},
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [{ ty: "gr", it: [
        { ty: "sr", sy: 1, d: 1, pt: { a: 0, k: 5 }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 3 }, or: { a: 0, k: 6 } },
        { ty: "fl", c: { a: 0, k: [0.9, 0.3, 0.5, 1] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]}]
    },
    {
      ddd: 0, ind: 5, ty: 4, nm: "Confetti5", sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 70, s: [100] }, { t: 90, s: [0] }] },
        r: { a: 1, k: [{ i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [-60] }, { t: 90, s: [300] }] },
        p: { a: 1, k: [
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 0, s: [75, 28, 0] },
          { t: 90, s: [30, 120, 0] }
        ]},
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [{ ty: "gr", it: [
        { ty: "rc", d: 1, s: { a: 0, k: [5, 14] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } },
        { ty: "fl", c: { a: 0, k: [0.2, 0.6, 0.9, 1] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]}]
    }
  ]
};

const invitationCardAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 90,
  w: 120,
  h: 160,
  assets: [],
  layers: [
    {
      ddd: 0, ind: 1, ty: 4, nm: "Sparkles", sr: 1,
      ks: {
        o: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [30] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 45, s: [100] },
          { t: 90, s: [30] }
        ]},
        p: { a: 0, k: [100, 30, 0] },
        s: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [80, 80, 100] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 45, s: [120, 120, 100] },
          { t: 90, s: [80, 80, 100] }
        ]}
      },
      shapes: [{ ty: "gr", it: [
        { ty: "sr", sy: 1, d: 1, pt: { a: 0, k: 4 }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 4 }, or: { a: 0, k: 12 } },
        { ty: "fl", c: { a: 0, k: [1, 0.85, 0.3, 1] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 45 }, o: { a: 0, k: 100 } }
      ]}]
    },
    {
      ddd: 0, ind: 2, ty: 4, nm: "Card", sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [-3] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 45, s: [3] },
          { t: 90, s: [-3] }
        ]},
        p: { a: 0, k: [60, 85, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        { ty: "gr", it: [
          { ty: "rc", d: 1, s: { a: 0, k: [80, 110] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 8 } },
          { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 } },
          { ty: "fl", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
        ]},
        { ty: "gr", it: [
          { ty: "sh", ks: { a: 0, k: { c: true, v: [[0, -20], [-8, -12], [-12, -8], [0, 2], [12, -8], [8, -12]], i: [[0, 0], [-4, 0], [0, -4], [0, 0], [0, -4], [4, 0]], o: [[0, 0], [-4, 0], [0, 4], [0, 0], [0, 4], [4, 0]] }}},
          { ty: "fl", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, o: { a: 0, k: 100 } },
          { ty: "tr", p: { a: 0, k: [0, -15] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
        ]},
        { ty: "gr", it: [
          { ty: "sh", ks: { a: 0, k: { c: false, v: [[-25, 10], [25, 10]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }}},
          { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 0.4] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 } },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
        ]},
        { ty: "gr", it: [
          { ty: "sh", ks: { a: 0, k: { c: false, v: [[-20, 25], [20, 25]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }}},
          { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 0.3] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 } },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
        ]},
        { ty: "gr", it: [
          { ty: "sh", ks: { a: 0, k: { c: false, v: [[-15, 35], [15, 35]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }}},
          { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 0.2] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 } },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
        ]}
      ]
    }
  ]
};

const floatingRingsAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 120,
  w: 100,
  h: 100,
  assets: [],
  layers: [
    {
      ddd: 0, ind: 1, ty: 4, nm: "Ring1", sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [0] }, { t: 120, s: [360] }] },
        p: { a: 0, k: [50, 50, 0] },
        s: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [90, 90, 100] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 60, s: [100, 100, 100] },
          { t: 120, s: [90, 90, 100] }
        ]}
      },
      shapes: [{ ty: "gr", it: [
        { ty: "el", s: { a: 0, k: [50, 50] }, p: { a: 0, k: [0, 0] } },
        { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 0.6] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]}]
    },
    {
      ddd: 0, ind: 2, ty: 4, nm: "Ring2", sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [45] }, { t: 120, s: [-315] }] },
        p: { a: 0, k: [50, 50, 0] },
        s: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [100, 100, 100] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 60, s: [85, 85, 100] },
          { t: 120, s: [100, 100, 100] }
        ]}
      },
      shapes: [{ ty: "gr", it: [
        { ty: "el", s: { a: 0, k: [35, 35] }, p: { a: 0, k: [0, 0] } },
        { ty: "st", c: { a: 0, k: [0.7, 0.5, 0.95, 0.8] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]}]
    },
    {
      ddd: 0, ind: 3, ty: 4, nm: "Dot", sr: 1,
      ks: {
        o: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [50] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 60, s: [100] },
          { t: 120, s: [50] }
        ]},
        p: { a: 0, k: [50, 50, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [{ ty: "gr", it: [
        { ty: "el", s: { a: 0, k: [12, 12] }, p: { a: 0, k: [0, 0] } },
        { ty: "fl", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]}]
    }
  ]
};

export function HeroSection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1.5 }}
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/30 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.5, delay: 0.6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-24 right-[10%] opacity-80 hidden md:block"
      >
        <Lottie animationData={envelopeAnimation} loop={true} className="w-32 h-32" />
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-32 left-[8%] opacity-70 hidden md:block"
      >
        <Lottie animationData={confettiAnimation} loop={true} className="w-28 h-28" />
      </motion.div>
      
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-[5%] opacity-60 hidden lg:block"
      >
        <Lottie animationData={invitationCardAnimation} loop={true} className="w-24 h-32" />
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-[6%] opacity-50 hidden lg:block"
      >
        <Lottie animationData={floatingRingsAnimation} loop={true} className="w-20 h-20" />
      </motion.div>
      
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-[15%] opacity-40 hidden xl:block"
      >
        <Lottie animationData={confettiAnimation} loop={true} className="w-16 h-16" />
      </motion.div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Premium Digital Invitations</span>
          </motion.div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight mb-6">
            Transform Your
            <br />
            <span className="text-primary">Celebrations</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Beautiful, interactive digital invitations for your weddings, events, and celebrations. 
            Share your special moments with elegance and style.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => scrollToSection("pricing")}
              className="w-full sm:w-auto min-w-[200px] font-medium text-base"
              data-testid="button-hero-get-started"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("samples")}
              className="w-full sm:w-auto min-w-[200px] font-medium text-base"
              data-testid="button-hero-view-samples"
            >
              View Samples
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16 pt-8 border-t border-border/50"
        >
          <div className="text-center">
            <div className="font-serif text-3xl md:text-4xl font-semibold text-primary">500+</div>
            <div className="text-sm text-muted-foreground mt-1">Happy Couples</div>
          </div>
          <div className="text-center">
            <div className="font-serif text-3xl md:text-4xl font-semibold text-primary">1000+</div>
            <div className="text-sm text-muted-foreground mt-1">Events Created</div>
          </div>
          <div className="text-center">
            <div className="font-serif text-3xl md:text-4xl font-semibold text-primary">4.9</div>
            <div className="text-sm text-muted-foreground mt-1">Customer Rating</div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-2.5 bg-muted-foreground/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
