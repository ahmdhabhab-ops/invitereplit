import { motion } from "framer-motion";
import { Package, FileEdit, Eye, Rocket } from "lucide-react";
import Lottie from "lottie-react";

// Step 1: Package/Plan selection animation
const packageAnimation = {
  v: "5.5.7", fr: 30, ip: 0, op: 60, w: 100, h: 100, assets: [],
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: "Package", sr: 1,
    ks: {
      o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [50, 50, 0] }, a: { a: 0, k: [0, 0, 0] },
      s: { a: 1, k: [{ i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [90, 90, 100] }, { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 30, s: [100, 100, 100] }, { t: 60, s: [90, 90, 100] }]}
    },
    shapes: [{ ty: "gr", it: [
      { ty: "rc", d: 1, s: { a: 0, k: [40, 35] }, p: { a: 0, k: [0, 5] }, r: { a: 0, k: 4 } },
      { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 } },
      { ty: "fl", c: { a: 0, k: [0.533, 0.282, 0.969, 0.15] }, o: { a: 0, k: 100 } },
      { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
    ]}, { ty: "gr", it: [
      { ty: "sh", ks: { a: 0, k: { c: false, v: [[-15, -13], [0, -22], [15, -13]], i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]] }}},
      { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 } },
      { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
    ]}]
  }]
};

// Step 2: Form/Edit animation
const formAnimation = {
  v: "5.5.7", fr: 30, ip: 0, op: 60, w: 100, h: 100, assets: [],
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: "Form", sr: 1,
    ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [50, 50, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] }},
    shapes: [
      { ty: "gr", it: [
        { ty: "rc", d: 1, s: { a: 0, k: [35, 45] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 3 } },
        { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 } },
        { ty: "fl", c: { a: 0, k: [0.533, 0.282, 0.969, 0.1] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]},
      { ty: "gr", it: [
        { ty: "sh", ks: { a: 1, k: [
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 0, s: [{ c: false, v: [[-12, -12], [-12, -12]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }] },
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 30, s: [{ c: false, v: [[-12, -12], [12, -12]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }] },
          { t: 60, s: [{ c: false, v: [[-12, -12], [-12, -12]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }] }
        ]}},
        { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]},
      { ty: "gr", it: [
        { ty: "sh", ks: { a: 0, k: { c: false, v: [[-12, 0], [12, 0]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }}},
        { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 0.5] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]},
      { ty: "gr", it: [
        { ty: "sh", ks: { a: 0, k: { c: false, v: [[-12, 12], [8, 12]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }}},
        { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 0.5] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]}
    ]
  }]
};

// Step 3: Eye/Review animation
const reviewAnimation = {
  v: "5.5.7", fr: 30, ip: 0, op: 60, w: 100, h: 100, assets: [],
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: "Eye", sr: 1,
    ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [50, 50, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] }},
    shapes: [
      { ty: "gr", it: [
        { ty: "el", s: { a: 0, k: [40, 24] }, p: { a: 0, k: [0, 0] } },
        { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 } },
        { ty: "fl", c: { a: 0, k: [0.533, 0.282, 0.969, 0.1] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]},
      { ty: "gr", it: [
        { ty: "el", s: { a: 1, k: [
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [12, 12] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 20, s: [12, 2] },
          { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 40, s: [12, 12] },
          { t: 60, s: [12, 12] }
        ]}, p: { a: 0, k: [0, 0] } },
        { ty: "fl", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]}
    ]
  }]
};

// Step 4: Rocket/Launch animation
const launchAnimation = {
  v: "5.5.7", fr: 30, ip: 0, op: 60, w: 100, h: 100, assets: [],
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: "Rocket", sr: 1,
    ks: {
      o: { a: 0, k: 100 }, r: { a: 0, k: -45 },
      p: { a: 1, k: [
        { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 0, s: [55, 55, 0] },
        { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 30, s: [45, 45, 0] },
        { t: 60, s: [55, 55, 0] }
      ]},
      a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] }
    },
    shapes: [
      { ty: "gr", it: [
        { ty: "sh", ks: { a: 0, k: { c: true, v: [[0, -20], [8, 0], [5, 8], [-5, 8], [-8, 0]], i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]] }}},
        { ty: "st", c: { a: 0, k: [0.533, 0.282, 0.969, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 } },
        { ty: "fl", c: { a: 0, k: [0.533, 0.282, 0.969, 0.2] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]},
      { ty: "gr", it: [
        { ty: "sh", ks: { a: 1, k: [
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 0, s: [{ c: false, v: [[-3, 8], [-3, 15], [3, 15], [3, 8]], i: [[0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0]] }] },
          { i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 }, t: 30, s: [{ c: false, v: [[-4, 8], [-5, 20], [5, 20], [4, 8]], i: [[0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0]] }] },
          { t: 60, s: [{ c: false, v: [[-3, 8], [-3, 15], [3, 15], [3, 8]], i: [[0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0]] }] }
        ]}},
        { ty: "st", c: { a: 0, k: [1, 0.5, 0.2, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 } },
        { ty: "fl", c: { a: 0, k: [1, 0.5, 0.2, 0.6] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]}
    ]
  }]
};

const stepAnimations = [packageAnimation, formAnimation, reviewAnimation, launchAnimation];

const steps = [
  {
    icon: Package,
    title: "Pick a Plan",
    description: "Choose the perfect package that fits your celebration style and budget.",
  },
  {
    icon: FileEdit,
    title: "Fill the Form",
    description: "Share your event details, photos, and preferences with our easy form.",
  },
  {
    icon: Eye,
    title: "Design Review",
    description: "Our designers craft your invitation. Review and request revisions.",
  },
  {
    icon: Rocket,
    title: "Go Live",
    description: "Your stunning invitation is ready to share with friends and family.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Four simple steps to create your perfect digital invitation
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative text-center"
              >
                {/* Step Number & Lottie Animation */}
                <div className="relative mx-auto mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                    <Lottie 
                      animationData={stepAnimations[index]} 
                      loop={true} 
                      className="w-16 h-16"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-serif text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[250px] mx-auto">
                  {step.description}
                </p>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center mt-6 sm:hidden">
                    <div className="w-0.5 h-8 bg-primary/20" />
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