// Fuente única de contenido editable. Sustituye los textos de referencia por
// el perfil real; la estructura de capas/eventos se mantiene intacta.

export type StackCategory = {
  category: string;
  items: string[];
};

export type ProjectPreview = {
  accent: string;
  glyph: string;
  caption: string;
};

export type PortfolioProject = {
  id: string;
  title: string;
  year: string;
  role: string;
  summary: string;
  description: string;
  stack: string[];
  highlights: string[];
  repoUrl: string;
  demoUrl?: string;
  preview: ProjectPreview;
};

export const profile = {
  name: "Miguel Ángel González Muñoz",
  role: "Desarrollador Web & Móvil Full-Stack",
  location: "Medellín, Colombia",
  bio: [
    "Construyo experiencias web creativas e interactivas, combinando desarrollo front-end de alta calidad con interfaces expressivas y animación reactiva.",
    "Diseño y consume APIs robustas para que la interacción, los datos y la lógica de negocio convivan sin fricción en producto.",
    "Me interesa especialmente el cruce entre UI, 3D y movimiento: crear interfaces que se sientan vivas sin sacrificar rendimiento ni accesibilidad.",
  ],
} as const;

export const stack: StackCategory[] = [
  {
    category: "Frontend/UI",
    items: ["React", "Next.js", "TypeScript", "GSAP", "Figma"],
  },
  {
    category: "Backend/DB",
    items: ["Python", "Django", "Django REST Framework", "Node.js", "Express", "MySQL", "MongoDB"],
  },
  {
    category: "Mobile/3D",
    items: ["React Native", "Flutter", "Blender"],
  },
];

export const portfolioProjects: PortfolioProject[] = [
  {
    id: "reserva",
    title: "ReserVa",
    year: "2025",
    role: "Full-Stack Developer",
    summary:
      "Plataforma integral de reservas de mesas y pre-orden gastronómica.",
    description:
      "ReserVa centraliza disponibilidad, reservas y pre-órdenes en un solo flujo. El backend expone una API REST con Django REST Framework para la lógica de negocio y Node.js/Express para servicios de integración y notificaciones. MongoDB persiste reservas, menús y preferencias; el despliegue cloud mantiene el servicio disponible y escalable para múltiples sedes.",
    stack: ["Django / DRF", "Node.js / Express", "MongoDB", "Despliegue cloud"],
    highlights: [
      "Gestión de disponibilidad por franja horaria y sede.",
      "Pre-orden gastronómica ligada a cada reserva.",
      "API REST preparada para integraciones y notificaciones.",
    ],
    repoUrl: "https://github.com/Mag-Gonzalez",
    preview: {
      accent: "#ff0b36",
      glyph: "R",
      caption: "Reservas & pre-orden",
    },
  },
  {
    id: "cerro-nutibara",
    title: "Guía Interactiva Cerro Nutibara & Pueblito Paisa",
    year: "2024",
    role: "Mobile Developer",
    summary:
      "App móvil turística interactiva con rutas, puntos de interés y experiencia guiada.",
    description:
      "La guía acompaña al visitante por el Cerro Nutibara y el Pueblito Paisa mediante rutas contextuales, puntos de interés y contenido guiado. La experiencia móvil prioriza navegación con una mano, lectura breve y retroalimentación visual clara, con una arquitectura preparada para ampliar recorridos y contenidos sin rehacer la interfaz.",
    stack: ["React Native", "Flutter", "Figma", "Diseño de interacción"],
    highlights: [
      "Rutas guiadas con puntos de interés georreferenciados.",
      "Contenido cultural breve y navegación móvil cómoda.",
      "Sistema visual extensible para nuevos recorridos.",
    ],
    repoUrl: "https://github.com/Mag-Gonzalez",
    preview: {
      accent: "#2f6f5e",
      glyph: "CN",
      caption: "Rutas & puntos de interés",
    },
  },
  {
    id: "portafolio-interactivo",
    title: "Portafolio Interactivo",
    year: "2026",
    role: "Creative Developer",
    summary:
      "Experiencia web inspirada en interfaces experimentales con animaciones reactivas y personaje modular.",
    description:
      "Este portafolio explora una narrativa de interfaz donde el personaje y el panel de contenido responden a gestos del puntero. La capa visual se mantiene separada del contenido mediante un bus de eventos tipado, permitiendo sustituir el placeholder 2D por un avatar 3D sin reescribir la UI. El responsive es real: móvil, tablet y escritorio conservan las mismas secciones y funciones.",
    stack: ["React", "Next.js", "TypeScript", "GSAP", "Blender"],
    highlights: [
      "Arquitectura por capas con estado plano y eventos tipados.",
      "Panel con scroll interno, tabs rápidas y copia de email.",
      "Vista detallada de proyectos en media layer con navegación.",
    ],
    repoUrl: "https://github.com/Mag-Gonzalez",
    preview: {
      accent: "#1c1c1c",
      glyph: "AL",
      caption: "Interacción & personaje",
    },
  },
];

export const contact = {
  // [PENDIENTE] Email placeholder: cambiar por el correo definitivo cuando se confirme.
  email: "contacto@mag-gonzalez.dev",
  githubUrl: "https://github.com/Mag-Gonzalez",
} as const;
