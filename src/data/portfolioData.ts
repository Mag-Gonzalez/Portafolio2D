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
    "Soy desarrollador de software en formación en Análisis y Desarrollo de Software (ADSO - SENA) en Medellín. Construyo experiencias web y móviles creativas, combinando interfaces expresivas en dark-mode con animación reactiva.",
    "Diseño y consumo APIs robustas con Python/Django y Node.js/Express, integrando bases de datos relacionales y NoSQL para que la lógica de negocio, las automatizaciones y la experiencia de usuario convivan sin fricción.",
    "Me interesa el cruce entre código, diseño de interfaces e interacción expresiva para crear productos digitales con identidad propia sin sacrificar rendimiento ni accesibilidad.",
  ],
} as const;

export const stack: StackCategory[] = [
  {
    category: "Frontend/UI",
    items: ["React", "Next.js", "TypeScript", "GSAP", "Figma", "Canva"],
  },
  {
    category: "Backend/DB",
    items: [
      "Python",
      "Django",
      "Django REST Framework",
      "Node.js",
      "Express",
      "MySQL",
      "MongoDB",
      "SQLite",
    ],
  },
  {
    category: "Mobile & Tools",
    items: [
      "React Native",
      "Expo",
      "Flutter",
      "MIT App Inventor",
      "Git / GitHub",
      "Docker",
    ],
  },
];

export const portfolioProjects: PortfolioProject[] = [
  {
    id: "reserva",
    title: "ReserVa",
    year: "2026",
    role: "Full-Stack Developer",
    summary:
      "Plataforma integral de reservas de mesas y pre-orden gastronómica.",
    description:
      "ReserVa centraliza disponibilidad, reservas y pre-órdenes en un solo flujo. El backend expone una API REST documentada con Django REST Framework para la lógica de negocio y un ecosistema en Node.js/Express con respaldos automatizados en MongoDB (node-cron) y notificaciones vía Nodemailer.",
    stack: ["Django / DRF", "Node.js / Express", "MongoDB", "PythonAnywhere"],
    highlights: [
      "Gestión de disponibilidad por franja horaria y pre-orden gastronómica.",
      "Backups automatizados de MongoDB con node-cron y alertas por correo.",
      "Documentación interactiva con drf-spectacular y pruebas funcionales con pytest.",
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
    year: "2026",
    role: "Mobile Developer",
    summary:
      "App móvil turística interactiva con mapa personalizado, puntos de interés, escaneo QR y misiones.",
    description:
      "La guía acompaña al visitante por el Cerro Nutibara y el Pueblito Paisa mediante un mapa ilustrado interactivo, puntos de interés clicables, escaneo de códigos QR y misiones gamificadas. La experiencia móvil prioriza navegación con una mano, lectura breve y retroalimentación visual clara.",
    stack: ["MIT App Inventor", "Flutter", "Figma", "Diseño de interacción"],
    highlights: [
      "Mapa interactivo personalizado con puntos de interés clicables.",
      "Escaneo de códigos QR y sistema de misiones para visitantes.",
      "Interfaz móvil pensada para recorridos culturales al aire libre.",
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
      "Este portafolio explora una narrativa de interfaz donde el avatar y los paneles laterales responden a gestos del puntero. La capa visual se mantiene separada del contenido mediante un bus de eventos tipado, permitiendo integrar un personaje estilizado sin reescribir la UI.",
    stack: ["React", "Next.js", "TypeScript", "GSAP"],
    highlights: [
      "Arquitectura por capas con estado plano y eventos tipados.",
      "Paneles deslizables desde los bordes con cambio de tema oscuro/claro.",
      "Vista detallada de proyectos en media layer con navegación.",
    ],
    repoUrl: "https://github.com/Mag-Gonzalez/PortafolioAvatar",
    preview: {
      accent: "#ff5a1f",
      glyph: "MG",
      caption: "Interacción & personaje",
    },
  },
];

export const contact = {
  email: "miguelgonza11425@gmail.com",
  githubUrl: "https://github.com/Mag-Gonzalez",
} as const;
