import { Variants } from "framer-motion";

// Fade animations (subtle)
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3, ease: "easeIn" }
  }
};

export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
};

export const fadeInDown: Variants = {
  hidden: { 
    opacity: 0,
    y: -20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
};

// Slide animations (smooth)
export const slideInRight: Variants = {
  hidden: { 
    opacity: 0,
    x: -30
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
};

export const slideInLeft: Variants = {
  hidden: { 
    opacity: 0,
    x: 30
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
};

// Scale animations (dynamic)
export const scaleIn: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.9
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const scaleOnHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: "easeOut" }
};

// Spring animations (bouncy but refined)
export const springIn: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
    y: 20
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 25,
      mass: 0.8
    }
  }
};

export const springBounce: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.5
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 17
    }
  }
};

// Stagger animations for lists
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// Card hover animations
export const cardHover = {
  y: -4,
  transition: { duration: 0.2, ease: "easeOut" }
};

export const cardTap = {
  scale: 0.98,
  transition: { duration: 0.1 }
};

// Button animations
export const buttonHover = {
  scale: 1.05,
  transition: { duration: 0.2, ease: "easeOut" }
};

export const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1 }
};

// Page transition
export const pageTransition: Variants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { 
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};
