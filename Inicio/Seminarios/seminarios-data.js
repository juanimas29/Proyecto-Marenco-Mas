// Datos de ejemplo. Reemplazá esto por la fuente real (API, JSON, etc.)
// cuando esté disponible — el resto del código no necesita cambiar,
// solo espera que cada objeto tenga esta forma.
//
// "image" es opcional: si la ruta no existe o no la definís, la tarjeta
// muestra el degradé de marca como respaldo (no rompe nada). Seguí la
// misma convención de carpeta que ya usás para Cine.png / Films.png /
// Seminarios.png: poné tus fotos en Imagenes/Seminarios/ y apuntá ahí.
window.SEMINARIOS = [
  {
    id: 'direccion-actores',
    title: 'Dirección de actores en el under',
    category: 'Dirección',
    icon: 'megaphone-outline',
    image: 'Proyecto-Marenco-Mas\Imagenes\direcciondepeliculas.webp',
    shortDesc: 'Herramientas prácticas para dirigir actores con poco tiempo y menos presupuesto.',
    fullDesc: [
      'Este seminario está pensado para directores y directoras que trabajan en producciones independientes, donde los ensayos son pocos y los recursos, limitados.',
      'A lo largo del encuentro vas a repasar técnicas de dirección de actores aplicadas a rodajes cortos, cómo dar indicaciones claras en el set y cómo sostener la intención de una escena tomada tras toma.'
    ],
    learn: [
      'Cómo preparar a un actor en un solo ensayo',
      'Lenguaje claro para dar indicaciones en el set',
      'Mantener la continuidad emocional entre tomas',
      'Trabajar con actores no profesionales'
    ],
    speaker: 'Lucía Ferreyra',
    speakerRole: 'Directora de cine independiente',
    date: '18 de octubre, 2026',
    duration: '3 horas',
    modality: 'Presencial',
    location: 'Auditorio Cineclub Municipal, Córdoba',
    capacity: 40,
    price: 0
  },
  {
    id: 'guion-primer-borrador',
    title: 'Guion: de la idea al primer borrador',
    category: 'Guion',
    icon: 'create-outline',
    image: 'Proyecto-Marenco-Mas\Imagenes\guion-primer-borrador.webp',
    shortDesc: 'Un taller de cuatro semanas para llevar esa idea que tenés dando vueltas a un guion real.',
    fullDesc: [
      'Muchas historias se quedan en la cabeza porque falta un método para bajarlas al papel. Este taller propone un recorrido de cuatro semanas para pasar de una idea suelta a un primer borrador completo.',
      'Cada semana vas a entregar una parte del guion y recibir devolución personalizada, además de ejercicios de estructura y diálogo.'
    ],
    learn: [
      'Estructura en tres actos aplicada a tu propia historia',
      'Cómo escribir diálogos que suenen naturales',
      'Técnicas para destrabar el segundo acto',
      'Formato profesional de guion'
    ],
    speaker: 'Martín Ibáñez',
    speakerRole: 'Guionista y docente',
    date: '25 de octubre, 2026',
    duration: '4 semanas (8 horas en total)',
    modality: 'Online en vivo',
    location: 'Plataforma virtual',
    capacity: 60,
    price: 8000
  },
  {
    id: 'fotografia-luz-natural',
    title: 'Fotografía cinematográfica: luz natural',
    category: 'Fotografía',
    icon: 'aperture-outline',
    image: 'Proyecto-Marenco-Mas/Imagenes/fotografia-luz-natural.webp',
    shortDesc: 'Aprendé a leer y aprovechar la luz disponible en locación, sin depender de equipo caro.',
    fullDesc: [
      'La luz natural es el recurso más accesible y el más difícil de controlar. En este seminario vas a aprender a observarla, anticiparla y usarla a favor de tu historia.',
      'Incluye una jornada práctica de rodaje en locación donde vas a poner en práctica lo visto en la parte teórica.'
    ],
    learn: [
      'Cómo leer la calidad de luz según la hora del día',
      'Reflectores y difusores caseros',
      'Planificar un rodaje según el clima y la estación',
      'Ejercicio práctico en locación'
    ],
    speaker: 'Valeria Roldán',
    speakerRole: 'Directora de fotografía',
    date: '2 de noviembre, 2026',
    duration: '6 horas',
    modality: 'Presencial',
    location: 'Estudio Cinemorfosis, Nueva Córdoba',
    capacity: 25,
    price: 12000
  },
  {
    id: 'cine-argentino-charla',
    title: 'Cine argentino contemporáneo: charla abierta',
    category: 'Industria',
    icon: 'chatbubbles-outline',
    image: '../../Imagenes/Seminarios/cine-argentino-charla.jpg',
    shortDesc: 'Un panel de críticos conversa sobre el presente del cine nacional y hacia dónde va.',
    fullDesc: [
      'Convocamos a un panel de críticos y programadores para conversar, en formato abierto, sobre el estado del cine argentino: qué se está filmando, qué se está exhibiendo y qué caminos se abren para las nuevas generaciones.',
      'Al finalizar la charla hay un espacio de preguntas del público.'
    ],
    learn: [
      'Panorama del cine argentino actual',
      'Circuitos de exhibición alternativos',
      'Cómo llega una película independiente a un festival',
      'Espacio de preguntas y debate'
    ],
    speaker: 'Panel de críticos invitados',
    speakerRole: 'Prensa especializada en cine',
    date: '9 de noviembre, 2026',
    duration: '2 horas',
    modality: 'Presencial',
    location: 'Cineclub Hugo del Carril, Córdoba',
    capacity: 120,
    price: 0
  },
  {
    id: 'postproduccion-sonido',
    title: 'Postproducción de sonido para cortometrajes',
    category: 'Sonido',
    icon: 'headset-outline',
    image: '../../Imagenes/Seminarios/postproduccion-sonido.jpg',
    shortDesc: 'Diseño sonoro y mezcla final aplicados a proyectos de bajo presupuesto.',
    fullDesc: [
      'El sonido suele ser lo último en lo que se piensa y lo primero que se nota si está mal resuelto. Este seminario recorre el proceso de postproducción de sonido pensado para cortometrajes.',
      'Vas a trabajar con material real de rodaje: limpieza de diálogo, diseño de ambientes y una primera mezcla.'
    ],
    learn: [
      'Limpieza y edición de diálogo',
      'Diseño de ambientes y foley básico',
      'Nociones de mezcla final para plataformas',
      'Flujo de trabajo con software libre'
    ],
    speaker: 'Nicolás Peralta',
    speakerRole: 'Diseñador de sonido',
    date: '16 de noviembre, 2026',
    duration: '5 horas',
    modality: 'Online en vivo',
    location: 'Plataforma virtual',
    capacity: 30,
    price: 6000
  },
  {
    id: 'produccion-primer-rodaje',
    title: 'Producción independiente: tu primer rodaje',
    category: 'Producción',
    icon: 'clipboard-outline',
    image: '../../Imagenes/Seminarios/produccion-primer-rodaje.jpg',
    shortDesc: 'Organizá presupuesto, plan de rodaje y equipo para filmar tu primer proyecto propio.',
    fullDesc: [
      'Filmar no depende solo de tener una buena idea: depende de organizarla. Este seminario recorre, paso a paso, cómo armar la producción de un primer proyecto propio con recursos limitados.',
      'Formato híbrido: una clase presencial de taller y un encuentro de seguimiento online para resolver dudas puntuales de cada proyecto.'
    ],
    learn: [
      'Armado de un presupuesto realista',
      'Plan de rodaje y desglose de guion',
      'Cómo conseguir locaciones y equipo',
      'Permisos y seguros básicos'
    ],
    speaker: 'Camila Suárez',
    speakerRole: 'Productora ejecutiva',
    date: '23 de noviembre, 2026',
    duration: '4 horas + seguimiento online',
    modality: 'Híbrido',
    location: 'Espacio Cinemorfosis, Córdoba',
    capacity: 50,
    price: 0
  }
];
