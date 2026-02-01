import { motion } from "framer-motion";
import Lottie from "lottie-react";

const packageAnimation = {
  v: "5.5.7", fr: 30, ip: 0, op: 90, w: 120, h: 120, assets: [],
  layers: [
    {
      ddd: 0, ind: 1, ty: 4, nm: "Sparkle", sr: 1,
      ks: {
        o: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [0] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 30, s: [100] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 60, s: [100] },
          { t: 90, s: [0] }
        ]},
        r: { a: 1, k: [{ t: 0, s: [0] }, { t: 90, s: [180] }] },
        p: { a: 0, k: [85, 25, 0] },
        s: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [0, 0, 100] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 30, s: [100, 100, 100] },
          { t: 90, s: [60, 60, 100] }
        ]}
      },
      shapes: [{ ty: "gr", it: [
        { ty: "sr", sy: 1, d: 1, pt: { a: 0, k: 4 }, p: { a: 0, k: [0, 0] }, ir: { a: 0, k: 4 }, or: { a: 0, k: 10 } },
        { ty: "fl", c: { a: 0, k: [1, 0.85, 0.3, 1] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] } }
      ]}]
    },
    {
      ddd: 0, ind: 2, ty: 4, nm: "Package", sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        p: { a: 0, k: [60, 65, 0] },
        s: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [95, 95, 100] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 45, s: [105, 105, 100] },
          { t: 90, s: [95, 95, 100] }
        ]}
      },
      shapes: [
        { ty: "gr", it: [
          { ty: "rc", d: 1, s: { a: 0, k: [55, 50] }, p: { a: 0, k: [0, 8] }, r: { a: 0, k: 6 } },
          { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, w: { a: 0, k: 3 } },
          { ty: "fl", c: { a: 0, k: [0.9, 0.85, 0.98, 1] } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]},
        { ty: "gr", it: [
          { ty: "sh", ks: { a: 0, k: { c: true, v: [[-28, -18], [0, -35], [28, -18]], i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]] }}},
          { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, w: { a: 0, k: 3 } },
          { ty: "fl", c: { a: 0, k: [0.75, 0.6, 0.95, 1] } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]},
        { ty: "gr", it: [
          { ty: "sh", ks: { a: 0, k: { c: false, v: [[0, -35], [0, 33]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }}},
          { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 0.6] }, w: { a: 0, k: 2 } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]},
        { ty: "gr", it: [
          { ty: "sh", ks: { a: 0, k: { c: false, v: [[-28, -18], [28, -18]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }}},
          { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 0.6] }, w: { a: 0, k: 2 } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]}
      ]
    }
  ]
};

const formAnimation = {
  v: "5.5.7", fr: 30, ip: 0, op: 90, w: 120, h: 120, assets: [],
  layers: [
    {
      ddd: 0, ind: 1, ty: 4, nm: "Cursor", sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 80, s: [100] }, { t: 90, s: [0] }] },
        p: { a: 1, k: [
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 0, s: [35, 42, 0] },
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 30, s: [75, 42, 0] },
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 45, s: [35, 57, 0] },
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 75, s: [65, 57, 0] },
          { t: 90, s: [35, 42, 0] }
        ]}
      },
      shapes: [{ ty: "gr", it: [
        { ty: "rc", d: 1, s: { a: 0, k: [2, 12] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 1 } },
        { ty: "fl", c: { a: 0, k: [0.533, 0.282, 0.969, 1] } },
        { ty: "tr", p: { a: 0, k: [0, 0] } }
      ]}]
    },
    {
      ddd: 0, ind: 2, ty: 4, nm: "Form", sr: 1,
      ks: { o: { a: 0, k: 100 }, p: { a: 0, k: [60, 60, 0] }, s: { a: 0, k: [100, 100, 100] }},
      shapes: [
        { ty: "gr", it: [
          { ty: "rc", d: 1, s: { a: 0, k: [60, 75] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 6 } },
          { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, w: { a: 0, k: 2.5 } },
          { ty: "fl", c: { a: 0, k: [1, 1, 1, 1] } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]},
        { ty: "gr", it: [
          { ty: "rc", d: 1, s: { a: 0, k: [45, 12] }, p: { a: 0, k: [0, -18] }, r: { a: 0, k: 3 } },
          { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 0.5] }, w: { a: 0, k: 1.5 } },
          { ty: "fl", c: { a: 0, k: [0.95, 0.93, 0.99, 1] } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]},
        { ty: "gr", it: [
          { ty: "rc", d: 1, s: { a: 0, k: [45, 12] }, p: { a: 0, k: [0, -3] }, r: { a: 0, k: 3 } },
          { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 0.5] }, w: { a: 0, k: 1.5 } },
          { ty: "fl", c: { a: 0, k: [0.95, 0.93, 0.99, 1] } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]},
        { ty: "gr", it: [
          { ty: "rc", d: 1, s: { a: 0, k: [45, 12] }, p: { a: 0, k: [0, 12] }, r: { a: 0, k: 3 } },
          { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 0.4] }, w: { a: 0, k: 1.5 } },
          { ty: "fl", c: { a: 0, k: [0.97, 0.96, 1, 1] } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]},
        { ty: "gr", it: [
          { ty: "rc", d: 1, s: { a: 0, k: [25, 10] }, p: { a: 0, k: [0, 27] }, r: { a: 0, k: 5 } },
          { ty: "fl", c: { a: 0, k: [0.533, 0.282, 0.969, 1] } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]}
      ]
    }
  ]
};

const reviewAnimation = {
  v: "5.5.7", fr: 30, ip: 0, op: 90, w: 120, h: 120, assets: [],
  layers: [
    {
      ddd: 0, ind: 1, ty: 4, nm: "Checkmark", sr: 1,
      ks: {
        o: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 40, s: [0] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 55, s: [100] },
          { t: 90, s: [100] }
        ]},
        p: { a: 0, k: [90, 35, 0] },
        s: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 40, s: [0, 0, 100] },
          { i: { x: [0.5], y: [1.5] }, o: { x: [0.5], y: [0] }, t: 55, s: [120, 120, 100] },
          { t: 70, s: [100, 100, 100] }
        ]}
      },
      shapes: [{ ty: "gr", it: [
        { ty: "el", s: { a: 0, k: [22, 22] }, p: { a: 0, k: [0, 0] } },
        { ty: "fl", c: { a: 0, k: [0.3, 0.8, 0.4, 1] } },
        { ty: "tr", p: { a: 0, k: [0, 0] } }
      ]},
      { ty: "gr", it: [
        { ty: "sh", ks: { a: 0, k: { c: false, v: [[-5, 0], [-2, 4], [6, -5]], i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]] }}},
        { ty: "st", c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 2.5 } },
        { ty: "tr", p: { a: 0, k: [0, 0] } }
      ]}]
    },
    {
      ddd: 0, ind: 2, ty: 4, nm: "MagnifyGlass", sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        p: { a: 1, k: [
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 0, s: [75, 55, 0] },
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 30, s: [45, 65, 0] },
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 60, s: [75, 75, 0] },
          { t: 90, s: [75, 55, 0] }
        ]},
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        { ty: "gr", it: [
          { ty: "el", s: { a: 0, k: [35, 35] }, p: { a: 0, k: [0, 0] } },
          { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, w: { a: 0, k: 4 } },
          { ty: "fl", c: { a: 0, k: [0.85, 0.75, 0.98, 0.3] } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]},
        { ty: "gr", it: [
          { ty: "sh", ks: { a: 0, k: { c: false, v: [[12, 12], [24, 24]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }}},
          { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, w: { a: 0, k: 5 } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]}
      ]
    },
    {
      ddd: 0, ind: 3, ty: 4, nm: "Card", sr: 1,
      ks: { o: { a: 0, k: 100 }, p: { a: 0, k: [50, 60, 0] } },
      shapes: [{ ty: "gr", it: [
        { ty: "rc", d: 1, s: { a: 0, k: [55, 70] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 6 } },
        { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 0.6] }, w: { a: 0, k: 2 } },
        { ty: "fl", c: { a: 0, k: [1, 1, 1, 1] } },
        { ty: "tr", p: { a: 0, k: [0, 0] } }
      ]},
      { ty: "gr", it: [
        { ty: "sh", ks: { a: 0, k: { c: false, v: [[-18, -20], [18, -20]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }}},
        { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 0.4] }, w: { a: 0, k: 3 } },
        { ty: "tr", p: { a: 0, k: [0, 0] } }
      ]},
      { ty: "gr", it: [
        { ty: "sh", ks: { a: 0, k: { c: false, v: [[-18, -8], [18, -8]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }}},
        { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 0.3] }, w: { a: 0, k: 2 } },
        { ty: "tr", p: { a: 0, k: [0, 0] } }
      ]},
      { ty: "gr", it: [
        { ty: "sh", ks: { a: 0, k: { c: false, v: [[-18, 4], [10, 4]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }}},
        { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 0.25] }, w: { a: 0, k: 2 } },
        { ty: "tr", p: { a: 0, k: [0, 0] } }
      ]}]
    }
  ]
};

const launchAnimation = {
  v: "5.5.7", fr: 30, ip: 0, op: 90, w: 120, h: 120, assets: [],
  layers: [
    {
      ddd: 0, ind: 1, ty: 4, nm: "Stars", sr: 1,
      ks: {
        o: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [30] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 45, s: [100] },
          { t: 90, s: [30] }
        ]},
        p: { a: 0, k: [60, 60, 0] },
        s: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [80, 80, 100] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 45, s: [100, 100, 100] },
          { t: 90, s: [80, 80, 100] }
        ]}
      },
      shapes: [
        { ty: "gr", it: [
          { ty: "sr", sy: 1, d: 1, pt: { a: 0, k: 4 }, p: { a: 0, k: [-25, -25] }, ir: { a: 0, k: 2 }, or: { a: 0, k: 5 } },
          { ty: "fl", c: { a: 0, k: [1, 0.85, 0.3, 1] } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]},
        { ty: "gr", it: [
          { ty: "sr", sy: 1, d: 1, pt: { a: 0, k: 4 }, p: { a: 0, k: [30, -20] }, ir: { a: 0, k: 1.5 }, or: { a: 0, k: 4 } },
          { ty: "fl", c: { a: 0, k: [1, 0.85, 0.3, 1] } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]},
        { ty: "gr", it: [
          { ty: "sr", sy: 1, d: 1, pt: { a: 0, k: 4 }, p: { a: 0, k: [-30, 15] }, ir: { a: 0, k: 1 }, or: { a: 0, k: 3 } },
          { ty: "fl", c: { a: 0, k: [1, 0.85, 0.3, 1] } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]}
      ]
    },
    {
      ddd: 0, ind: 2, ty: 4, nm: "Rocket", sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: -45 },
        p: { a: 1, k: [
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 0, s: [70, 70, 0] },
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 45, s: [50, 50, 0] },
          { t: 90, s: [70, 70, 0] }
        ]},
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        { ty: "gr", it: [
          { ty: "sh", ks: { a: 0, k: { c: true, v: [[0, -25], [12, 5], [8, 15], [-8, 15], [-12, 5]], i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]] }}},
          { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, w: { a: 0, k: 2.5 } },
          { ty: "fl", c: { a: 0, k: [0.9, 0.85, 0.98, 1] } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]},
        { ty: "gr", it: [
          { ty: "el", s: { a: 0, k: [10, 10] }, p: { a: 0, k: [0, -5] } },
          { ty: "fl", c: { a: 0, k: [0.533, 0.282, 0.969, 1] } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]},
        { ty: "gr", it: [
          { ty: "sh", ks: { a: 1, k: [
            { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 0, s: [{ c: false, v: [[-5, 15], [-8, 25], [0, 22], [8, 25], [5, 15]], i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]] }] },
            { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 45, s: [{ c: false, v: [[-6, 15], [-12, 35], [0, 30], [12, 35], [6, 15]], i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]] }] },
            { t: 90, s: [{ c: false, v: [[-5, 15], [-8, 25], [0, 22], [8, 25], [5, 15]], i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]] }] }
          ]}},
          { ty: "st", c: { a: 0, k: [1, 0.5, 0.2, 1] }, w: { a: 0, k: 2 } },
          { ty: "fl", c: { a: 0, k: [1, 0.6, 0.2, 0.8] } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]}
      ]
    }
  ]
};

const stepAnimations = [packageAnimation, formAnimation, reviewAnimation, launchAnimation];

const steps = [
  {
    number: "01",
    title: "Pick a Plan",
    description: "Choose the perfect package that fits your celebration style and budget. We offer Essential, Premium, and Royal tiers.",
  },
  {
    number: "02",
    title: "Fill the Form",
    description: "Share your event details, photos, song preferences, and locations using our simple order form.",
  },
  {
    number: "03",
    title: "Design Review",
    description: "Our designers craft your unique invitation. You'll review the design and can request revisions.",
  },
  {
    number: "04",
    title: "Go Live",
    description: "Your stunning digital invitation is ready to share with friends and family via WhatsApp or link.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-gradient-to-b from-background via-secondary/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            Simple Process
          </motion.span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Four simple steps to create your perfect digital invitation
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-32 left-[15%] right-[15%] h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 h-full hover-elevate transition-all duration-300">
                  <div className="relative mx-auto mb-6 flex justify-center">
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-visible">
                      <Lottie 
                        animationData={stepAnimations[index]} 
                        loop={true} 
                        className="w-24 h-24"
                      />
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg">
                      {step.number}
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="font-serif text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-32 -right-3 z-10">
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </motion.div>
                  </div>
                )}

                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center mt-4 sm:hidden">
                    <motion.div
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
