import { AppDataSource } from './app';
import { User } from './models/userModel';
import { Ngo } from './models/ngoModel';
import { Skill } from './models/skillModel';
import { Category } from './models/categoryModel';
import { Application } from './models/applicationModel';
import { Project } from './models/projectModel';
import { UserRole } from './types/userRole';
import { ApplicationStatus } from './types/applicationRole';
import * as bcrypt from 'bcrypt';

const seedData = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for seeding...');

    // Verwende eine explizite Transaktion für alle Operationen
    await AppDataSource.transaction(async manager => {
      const userRepository = manager.getRepository(User);
      const ngoRepository = manager.getRepository(Ngo);
      const skillRepository = manager.getRepository(Skill);
      const categoryRepository = manager.getRepository(Category);
      const applicationRepository = manager.getRepository(Application);
      const projectRepository = manager.getRepository(Project);

      // Clear existing data in the correct order (respecting foreign key constraints)
      console.log('Clearing existing data...');
      await applicationRepository.clear();

      // Clear many-to-many junction tables first by clearing projects (which have the @JoinTable decorators)
      await manager.query('DELETE FROM user_projects');
      await manager.query('DELETE FROM project_skills');
      await manager.query('DELETE FROM project_categories');

      // Now clear the main tables in dependency order
      await projectRepository.clear();
      await userRepository.clear();
      await ngoRepository.clear();
      await skillRepository.clear();
      await categoryRepository.clear();

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('password123', saltRounds);

      // Skills - Erweiterte Liste mit mehr praktischen Fähigkeiten
      const skillsData = [
        {
          name: 'Web Development',
          description: 'Frontend und Backend Webentwicklung mit modernen Technologien',
        },
        {
          name: 'Graphic Design',
          description: 'Visuelles Design, Branding und kreative Gestaltung',
        },
        {
          name: 'Project Management',
          description: 'Projektplanung, -koordination und Teamführung',
        },
        {
          name: 'Marketing',
          description: 'Digitales und traditionelles Marketing, Kampagnenentwicklung',
        },
        {
          name: 'Teaching',
          description: 'Bildungs- und Schulungskompetenzen für verschiedene Zielgruppen',
        },
        { name: 'Social Media', description: 'Social Media Management und Content-Erstellung' },
        { name: 'Photography', description: 'Professionelle Fotografie und Bildbearbeitung' },
        { name: 'Translation', description: 'Mehrsprachige Übersetzungsdienste und Dolmetschen' },
        { name: 'Event Planning', description: 'Organisation und Management von Veranstaltungen' },
        { name: 'Fundraising', description: 'Mittelbeschaffung und Spenderbetreuung' },
        { name: 'Data Analysis', description: 'Statistische Analyse und Dateninterpretation' },
        { name: 'Legal Advice', description: 'Rechtsberatung und Dokumentenerstellung' },
        { name: 'Healthcare', description: 'Medizinische und Gesundheitsdienste' },
        { name: 'IT Support', description: 'Technischer Support und Systemadministration' },
        { name: 'Writing', description: 'Content-Erstellung und redaktionelle Arbeit' },
        { name: 'Video Editing', description: 'Professionelle Videobearbeitung und -produktion' },
        { name: 'Music', description: 'Musikalische Fähigkeiten und Musikunterricht' },
        { name: 'Cooking', description: 'Kulinarische Fähigkeiten und Kochkurse' },
        { name: 'Gardening', description: 'Gartenbau und Landschaftsgestaltung' },
        { name: 'Handcraft', description: 'Handwerkliche Fähigkeiten und DIY-Projekte' },
        { name: 'Logistics', description: 'Logistik und Versandorganisation' },
        { name: 'Customer Service', description: 'Kundenservice und Betreuung' },
        { name: 'Sports Training', description: 'Sporttraining und Fitnessbetreuung' },
        { name: 'Mental Health Support', description: 'Psychologische Unterstützung und Beratung' },
        { name: 'Environmental Science', description: 'Umweltwissenschaften und Nachhaltigkeit' },
      ];
      const skills = await skillRepository.save(
        skillsData.map(skill => skillRepository.create(skill))
      );

      // Categories - Erweiterte Liste mit mehr spezifischen Kategorien
      const categoriesData = [
        { name: 'Education' },
        { name: 'Healthcare' },
        { name: 'Environment' },
        { name: 'Social Services' },
        { name: 'Arts & Culture' },
        { name: 'Sports & Recreation' },
        { name: 'Technology' },
        { name: 'Community Development' },
        { name: 'Animal Welfare' },
        { name: 'Disaster Relief' },
        { name: 'Human Rights' },
        { name: 'Youth Development' },
        { name: 'Senior Care' },
        { name: 'Poverty Alleviation' },
        { name: 'Mental Health' },
        { name: 'Food Security' },
        { name: 'Housing' },
        { name: 'Women Empowerment' },
        { name: 'Digital Inclusion' },
        { name: 'Climate Action' },
      ];
      const categories = await categoryRepository.save(
        categoriesData.map(category => categoryRepository.create(category))
      );

      // Users - Erweiterte und vielfältige Benutzerdaten
      const usersData = [
        {
          firstName: 'Max',
          lastName: 'Mustermann',
          contactEmail: 'max.mustermann@example.com',
          loginEmail: 'max.mustermann@login.com',
          password: hashedPassword,
          phone: '+49 151 12345678',
          skills: ['Web Development', 'Project Management', 'IT Support'],
          role: UserRole.USER,
          yearOfBirth: 1990,
          zipCode: 10115,
          city: 'Berlin',
          state: 'Berlin',
          isActivated: true,
          isDisabled: false,
        },
        {
          firstName: 'Anna',
          lastName: 'Schmidt',
          contactEmail: 'anna.schmidt@example.com',
          loginEmail: 'anna.schmidt@login.com',
          password: hashedPassword,
          phone: '+49 151 87654321',
          skills: ['Graphic Design', 'Social Media', 'Video Editing'],
          role: UserRole.USER,
          yearOfBirth: 1985,
          zipCode: 20095,
          city: 'Hamburg',
          state: 'Hamburg',
          isActivated: true,
          isDisabled: false,
        },
        {
          firstName: 'Thomas',
          lastName: 'Müller',
          contactEmail: 'thomas.mueller@example.com',
          loginEmail: 'thomas.mueller@login.com',
          password: hashedPassword,
          phone: '+49 151 11223344',
          skills: ['Teaching', 'Event Planning', 'Sports Training'],
          role: UserRole.USER,
          yearOfBirth: 1988,
          zipCode: 80331,
          city: 'München',
          state: 'Bayern',
          isActivated: true,
          isDisabled: false,
        },
        {
          firstName: 'Sarah',
          lastName: 'Weber',
          contactEmail: 'sarah.weber@example.com',
          loginEmail: 'sarah.weber@login.com',
          password: hashedPassword,
          phone: '+49 151 99887766',
          skills: ['Marketing', 'Fundraising', 'Customer Service'],
          role: UserRole.USER,
          yearOfBirth: 1992,
          zipCode: 50667,
          city: 'Köln',
          state: 'Nordrhein-Westfalen',
          isActivated: true,
          isDisabled: false,
        },
        {
          firstName: 'Michael',
          lastName: 'Fischer',
          contactEmail: 'michael.fischer@example.com',
          loginEmail: 'michael.fischer@login.com',
          password: hashedPassword,
          phone: '+49 151 55443322',
          skills: ['Photography', 'Writing', 'Translation'],
          role: UserRole.USER,
          yearOfBirth: 1987,
          zipCode: 1067,
          city: 'Dresden',
          state: 'Sachsen',
          isActivated: false,
          isDisabled: false,
        },
        {
          firstName: 'Lisa',
          lastName: 'Hoffmann',
          contactEmail: 'lisa.hoffmann@example.com',
          loginEmail: 'lisa.hoffmann@login.com',
          password: hashedPassword,
          phone: '+49 151 77889900',
          skills: ['Healthcare', 'Mental Health Support', 'Legal Advice'],
          role: UserRole.USER,
          yearOfBirth: 1983,
          zipCode: 70173,
          city: 'Stuttgart',
          state: 'Baden-Württemberg',
          isActivated: true,
          isDisabled: false,
        },
        {
          firstName: 'David',
          lastName: 'Klein',
          contactEmail: 'david.klein@example.com',
          loginEmail: 'david.klein@login.com',
          password: hashedPassword,
          phone: '+49 151 33445566',
          skills: ['Data Analysis', 'Environmental Science', 'Logistics'],
          role: UserRole.USER,
          yearOfBirth: 1991,
          zipCode: 40210,
          city: 'Düsseldorf',
          state: 'Nordrhein-Westfalen',
          isActivated: true,
          isDisabled: false,
        },
        {
          firstName: 'Julia',
          lastName: 'Wagner',
          contactEmail: 'julia.wagner@example.com',
          loginEmail: 'julia.wagner@login.com',
          password: hashedPassword,
          phone: '+49 151 66778899',
          skills: ['Music', 'Cooking', 'Handcraft'],
          role: UserRole.USER,
          yearOfBirth: 1989,
          zipCode: 60311,
          city: 'Frankfurt am Main',
          state: 'Hessen',
          isActivated: true,
          isDisabled: false,
        },
        {
          firstName: 'Peter',
          lastName: 'Bauer',
          contactEmail: 'peter.bauer@example.com',
          loginEmail: 'peter.bauer@login.com',
          password: hashedPassword,
          phone: '+49 151 11998877',
          skills: ['Gardening', 'Environmental Science', 'Teaching'],
          role: UserRole.USER,
          yearOfBirth: 1975,
          zipCode: 30159,
          city: 'Hannover',
          state: 'Niedersachsen',
          isActivated: true,
          isDisabled: false,
        },
        {
          firstName: 'Admin',
          lastName: 'User',
          contactEmail: 'admin@example.com',
          loginEmail: 'admin@login.com',
          password: hashedPassword,
          phone: '+49 151 00000000',
          skills: ['Project Management', 'IT Support', 'Data Analysis'],
          role: UserRole.ADMIN,
          yearOfBirth: 1980,
          zipCode: 10115,
          city: 'Berlin',
          state: 'Berlin',
          isActivated: true,
          isDisabled: false,
        },
      ];
      const users = await userRepository.save(usersData.map(user => userRepository.create(user)));

      // NGOs - Erweiterte und vielfältige NGO-Daten
      const ngosData = [
        {
          name: 'Hilfe für Alle e.V.',
          isNonProfit: true,
          industry: ['Social Services', 'Community Development', 'Poverty Alleviation'],
          streetAndNumber: 'Hauptstraße 123',
          zipCode: 10115,
          city: 'Berlin',
          state: 'Berlin',
          principal: 'Dr. Maria Klein',
          contactEmail: 'info@hilfefueralle.de',
          loginEmail: 'login@hilfefueralle.de',
          password: hashedPassword,
          phone: '+49 30 12345678',
          isActivated: true,
          isDisabled: false,
        },
        {
          name: 'Umwelt Retten e.V.',
          isNonProfit: true,
          industry: ['Environment', 'Education', 'Climate Action'],
          streetAndNumber: 'Grüner Weg 45',
          zipCode: 20095,
          city: 'Hamburg',
          state: 'Hamburg',
          principal: 'Prof. Hans Grün',
          contactEmail: 'kontakt@umweltretten.de',
          loginEmail: 'login@umweltretten.de',
          password: hashedPassword,
          phone: '+49 40 87654321',
          isActivated: true,
          isDisabled: false,
        },
        {
          name: 'Kinder Zukunft e.V.',
          isNonProfit: true,
          industry: ['Education', 'Youth Development', 'Arts & Culture'],
          streetAndNumber: 'Schulstraße 78',
          zipCode: 80331,
          city: 'München',
          state: 'Bayern',
          principal: 'Lisa Hoffmann',
          contactEmail: 'info@kinderzukunft.de',
          loginEmail: 'login@kinderzukunft.de',
          password: hashedPassword,
          phone: '+49 89 11223344',
          isActivated: true,
          isDisabled: false,
        },
        {
          name: 'Gesundheit für Alle e.V.',
          isNonProfit: true,
          industry: ['Healthcare', 'Social Services', 'Mental Health'],
          streetAndNumber: 'Krankenstraße 12',
          zipCode: 50667,
          city: 'Köln',
          state: 'Nordrhein-Westfalen',
          principal: 'Dr. Peter Heilmann',
          contactEmail: 'info@gesundheitfueralle.de',
          loginEmail: 'login@gesundheitfueralle.de',
          password: hashedPassword,
          phone: '+49 221 99887766',
          isActivated: false,
          isDisabled: false,
        },
        {
          name: 'Kultur Verbindet e.V.',
          isNonProfit: true,
          industry: ['Arts & Culture', 'Community Development', 'Education'],
          streetAndNumber: 'Kulturplatz 5',
          zipCode: 1067,
          city: 'Dresden',
          state: 'Sachsen',
          principal: 'Anna Künstler',
          contactEmail: 'info@kulturverbindet.de',
          loginEmail: 'login@kulturverbindet.de',
          password: hashedPassword,
          phone: '+49 351 55443322',
          isActivated: true,
          isDisabled: false,
        },
        {
          name: 'TechForGood e.V.',
          isNonProfit: true,
          industry: ['Technology', 'Digital Inclusion', 'Education'],
          streetAndNumber: 'Innovationsstraße 42',
          zipCode: 70173,
          city: 'Stuttgart',
          state: 'Baden-Württemberg',
          principal: 'Dr. Stefan Code',
          contactEmail: 'info@techforgood.de',
          loginEmail: 'login@techforgood.de',
          password: hashedPassword,
          phone: '+49 711 22334455',
          isActivated: true,
          isDisabled: false,
        },
        {
          name: 'Tierschutz Plus e.V.',
          isNonProfit: true,
          industry: ['Animal Welfare', 'Environment', 'Education'],
          streetAndNumber: 'Tierheimstraße 88',
          zipCode: 40210,
          city: 'Düsseldorf',
          state: 'Nordrhein-Westfalen',
          principal: 'Sandra Tierfreund',
          contactEmail: 'info@tierschutzplus.de',
          loginEmail: 'login@tierschutzplus.de',
          password: hashedPassword,
          phone: '+49 211 66778899',
          isActivated: true,
          isDisabled: false,
        },
        {
          name: 'Sport für Alle e.V.',
          isNonProfit: true,
          industry: ['Sports & Recreation', 'Youth Development', 'Community Development'],
          streetAndNumber: 'Sportplatz 15',
          zipCode: 60311,
          city: 'Frankfurt am Main',
          state: 'Hessen',
          principal: 'Marcus Aktiv',
          contactEmail: 'info@sportfueralle.de',
          loginEmail: 'login@sportfueralle.de',
          password: hashedPassword,
          phone: '+49 69 44556677',
          isActivated: true,
          isDisabled: false,
        },
        {
          name: 'Senioren Hilfe e.V.',
          isNonProfit: true,
          industry: ['Senior Care', 'Healthcare', 'Social Services'],
          streetAndNumber: 'Seniorenweg 20',
          zipCode: 30159,
          city: 'Hannover',
          state: 'Niedersachsen',
          principal: 'Ingrid Fürsorge',
          contactEmail: 'info@seniorenhilfe.de',
          loginEmail: 'login@seniorenhilfe.de',
          password: hashedPassword,
          phone: '+49 511 88990011',
          isActivated: true,
          isDisabled: false,
        },
        {
          name: 'Frauenförderung e.V.',
          isNonProfit: true,
          industry: ['Women Empowerment', 'Human Rights', 'Education'],
          streetAndNumber: 'Gleichstellungsstraße 33',
          zipCode: 28195,
          city: 'Bremen',
          state: 'Bremen',
          principal: 'Dr. Petra Stark',
          contactEmail: 'info@frauenfoerderung.de',
          loginEmail: 'login@frauenfoerderung.de',
          password: hashedPassword,
          phone: '+49 421 12345679',
          isActivated: true,
          isDisabled: false,
        },
      ];
      const ngos = await ngoRepository.save(ngosData.map(ngo => ngoRepository.create(ngo)));

      // Projects with Categories and Skills - Erweiterte und vielfältige Projekte
      const projectsData = [
        {
          name: 'Webseite für Bildung',
          description:
            'Entwicklung einer modernen, barrierefreien Webseite für Online-Bildungsangebote mit interaktiven Lernmodulen.',
          images: ['project1_img1.jpg', 'project1_img2.jpg'],
          categories: [categories[0]], // Education
          ngo: ngos[0], // Hilfe für Alle e.V.
          city: 'Berlin',
          zipCode: 10115,
          state: 'Berlin',
          principal: 'Dr. Maria Klein',
          compensation: '500€ pro Monat',
          isActive: true,
          skills: [skills[0], skills[2]], // Web Development, Project Management
          startingAt: new Date(),
          endingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // 3 Monate
        },
        {
          name: 'Umwelt-Workshop für Schulen',
          description:
            'Organisation von interaktiven Umwelt-Workshops an Grundschulen zur Sensibilisierung für Klimaschutz.',
          images: ['project2_img1.jpg'],
          categories: [categories[2], categories[0]], // Environment, Education
          ngo: ngos[1], // Umwelt Retten e.V.
          city: 'Hamburg',
          zipCode: 20095,
          state: 'Hamburg',
          principal: 'Prof. Hans Grün',
          isActive: true,
          skills: [skills[4], skills[8]], // Teaching, Event Planning
          startingAt: new Date(),
          endingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), // 2 Monate
        },
        {
          name: 'Kunst für Kinder',
          description:
            'Kreatives Kunstprojekt für Kinder aus sozial schwachen Familien mit professioneller Foto-Dokumentation.',
          images: ['project3_img1.jpg', 'project3_img2.jpg', 'project3_img3.jpg'],
          categories: [categories[4], categories[11]], // Arts & Culture, Youth Development
          ngo: ngos[4], // Kultur Verbindet e.V.
          city: 'Dresden',
          zipCode: 1067,
          state: 'Sachsen',
          principal: 'Anna Künstler',
          compensation: 'Ehrenamtlich + Materialkosten',
          isActive: true,
          skills: [skills[1], skills[6]], // Graphic Design, Photography
          startingAt: new Date(),
          endingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120), // 4 Monate
        },
        {
          name: 'IT-Support für Senioren',
          description:
            'Technische Unterstützung und Schulungen für ältere Menschen im Umgang mit modernen Technologien.',
          images: ['project4_img1.jpg'],
          categories: [categories[12], categories[6]], // Senior Care, Technology
          ngo: ngos[5], // TechForGood e.V.
          city: 'Stuttgart',
          zipCode: 70173,
          state: 'Baden-Württemberg',
          principal: 'Dr. Stefan Code',
          compensation: '300€ pro Monat',
          isActive: true,
          skills: [skills[13], skills[4]], // IT Support, Teaching
          startingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Startet in 1 Woche
          endingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180), // 6 Monate
        },
        {
          name: 'Tierschutz-Kampagne',
          description:
            'Social Media Kampagne zur Aufklärung über Tierschutz und Adoption von Tieren aus dem Tierheim.',
          images: ['project5_img1.jpg', 'project5_img2.jpg'],
          categories: [categories[8]], // Animal Welfare
          ngo: ngos[6], // Tierschutz Plus e.V.
          city: 'Düsseldorf',
          zipCode: 40210,
          state: 'Nordrhein-Westfalen',
          principal: 'Sandra Tierfreund',
          isActive: true,
          skills: [skills[5], skills[3], skills[6]], // Social Media, Marketing, Photography
          startingAt: new Date(),
          endingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), // 1.5 Monate
        },
        {
          name: 'Sport für Alle - Integrationsprojekt',
          description:
            'Sportprojekt zur Integration von Geflüchteten und Menschen mit Migrationshintergrund durch gemeinsame Aktivitäten.',
          images: ['project6_img1.jpg'],
          categories: [categories[5], categories[7]], // Sports & Recreation, Community Development
          ngo: ngos[7], // Sport für Alle e.V.
          city: 'Frankfurt am Main',
          zipCode: 60311,
          state: 'Hessen',
          principal: 'Marcus Aktiv',
          compensation: 'Ehrenamtlich',
          isActive: true,
          skills: [skills[22], skills[8]], // Sports Training, Event Planning
          startingAt: new Date(),
          endingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 Jahr
        },
        {
          name: 'Psychologische Erstberatung',
          description:
            'Niedrigschwellige psychologische Beratung und Unterstützung für Menschen in schwierigen Lebenssituationen.',
          images: ['project7_img1.jpg'],
          categories: [categories[14], categories[3]], // Mental Health, Social Services
          ngo: ngos[3], // Gesundheit für Alle e.V.
          city: 'Köln',
          zipCode: 50667,
          state: 'Nordrhein-Westfalen',
          principal: 'Dr. Peter Heilmann',
          compensation: '800€ pro Monat',
          isActive: false, // Inaktives Projekt
          skills: [skills[23], skills[11]], // Mental Health Support, Legal Advice
          startingAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // Startete vor 1 Monat
          endingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 150), // Läuft noch 5 Monate
        },
        {
          name: 'Übersetzungsdienst für Geflüchtete',
          description:
            'Übersetzungshilfe und Dolmetscherdienste für Geflüchtete bei Behördengängen und Arztbesuchen.',
          images: ['project8_img1.jpg'],
          categories: [categories[10], categories[3]], // Human Rights, Social Services
          ngo: ngos[2], // Kinder Zukunft e.V.
          city: 'München',
          zipCode: 80331,
          state: 'Bayern',
          principal: 'Lisa Hoffmann',
          isActive: true,
          skills: [skills[7], skills[21]], // Translation, Customer Service
          startingAt: new Date(),
          endingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 270), // 9 Monate
        },
        {
          name: 'Garten-Projekt für Senioren',
          description:
            'Gemeinschaftsgarten-Projekt zur Förderung der sozialen Teilhabe und des Wohlbefindens älterer Menschen.',
          images: ['project9_img1.jpg', 'project9_img2.jpg'],
          categories: [categories[12], categories[2]], // Senior Care, Environment
          ngo: ngos[8], // Senioren Hilfe e.V.
          city: 'Hannover',
          zipCode: 30159,
          state: 'Niedersachsen',
          principal: 'Ingrid Fürsorge',
          compensation: 'Ehrenamtlich + Fahrtkosten',
          isActive: true,
          skills: [skills[18], skills[4]], // Gardening, Teaching
          startingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // Startet in 2 Wochen
          endingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 200), // 6-7 Monate
        },
        {
          name: 'Frauenförderung Workshop-Reihe',
          description:
            'Workshop-Reihe zur Stärkung von Frauen in beruflichen und persönlichen Bereichen mit Fokus auf Selbstständigkeit.',
          images: ['project10_img1.jpg'],
          categories: [categories[17], categories[0]], // Women Empowerment, Education
          ngo: ngos[9], // Frauenförderung e.V.
          city: 'Bremen',
          zipCode: 28195,
          state: 'Bremen',
          principal: 'Dr. Petra Stark',
          compensation: '400€ pro Workshop',
          isActive: true,
          skills: [skills[4], skills[2], skills[11]], // Teaching, Project Management, Legal Advice
          startingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21), // Startet in 3 Wochen
          endingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120), // 4 Monate
        },
        {
          name: 'Kochkurse für Bedürftige',
          description:
            'Kostenlose Kochkurse für Menschen mit geringem Einkommen zur Förderung gesunder und kostengünstiger Ernährung.',
          images: ['project11_img1.jpg', 'project11_img2.jpg'],
          categories: [categories[15], categories[13]], // Food Security, Poverty Alleviation
          ngo: ngos[0], // Hilfe für Alle e.V.
          city: 'Berlin',
          zipCode: 10115,
          state: 'Berlin',
          principal: 'Dr. Maria Klein',
          isActive: true,
          skills: [skills[17], skills[4]], // Cooking, Teaching
          startingAt: new Date(),
          endingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // 3 Monate
        },
        {
          name: 'Dokumentarfilm über Nachhaltigkeit',
          description:
            'Produktion eines Dokumentarfilms über lokale Nachhaltigkeitsinitiativen zur Sensibilisierung der Öffentlichkeit.',
          images: ['project12_img1.jpg'],
          categories: [categories[19], categories[2]], // Climate Action, Environment
          ngo: ngos[1], // Umwelt Retten e.V.
          city: 'Hamburg',
          zipCode: 20095,
          state: 'Hamburg',
          principal: 'Prof. Hans Grün',
          compensation: '1000€ Gesamthonorar',
          isActive: true,
          skills: [skills[15], skills[14], skills[6]], // Video Editing, Writing, Photography
          startingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // Startet in 1 Monat
          endingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 150), // 5 Monate
        },
      ];
      const projects = await projectRepository.save(
        projectsData.map(project => projectRepository.create(project))
      );

      // User-Project participants relations hinzufügen
      // Projekt 0: Webseite für Bildung - Max als Teilnehmer
      projects[0].participants = [users[0]]; // Max (Web Development, Project Management)
      await projectRepository.save(projects[0]);

      // Projekt 1: Umwelt-Workshop für Schulen - Thomas als Teilnehmer
      projects[1].participants = [users[2]]; // Thomas (Teaching, Event Planning)
      await projectRepository.save(projects[1]);

      // Projekt 2: Kunst für Kinder - Anna als Teilnehmerin
      projects[2].participants = [users[1]]; // Anna (Graphic Design, Social Media)
      await projectRepository.save(projects[2]);

      // Projekt 3: IT-Support für Senioren - Thomas als Teilnehmer
      projects[3].participants = [users[2]]; // Thomas (Teaching)
      await projectRepository.save(projects[3]);

      // Projekt 4: Tierschutz-Kampagne - Anna und Michael als Teilnehmer
      projects[4].participants = [users[1], users[4]]; // Anna (Social Media) + Michael (Photography)
      await projectRepository.save(projects[4]);

      // Projekt 5: Sport für Alle - Thomas als Teilnehmer
      projects[5].participants = [users[2]]; // Thomas (Sports Training, Event Planning)
      await projectRepository.save(projects[5]);

      // Projekt 6: Psychologische Erstberatung - Lisa als Teilnehmerin
      projects[6].participants = [users[5]]; // Lisa (Mental Health Support)
      await projectRepository.save(projects[6]);

      // Projekt 7: Übersetzungsdienst für Geflüchtete - Michael als Teilnehmer
      projects[7].participants = [users[4]]; // Michael (Translation)
      await projectRepository.save(projects[7]);

      // Projekt 8: Garten-Projekt für Senioren - Peter als Teilnehmer
      projects[8].participants = [users[8]]; // Peter (Gardening, Teaching)
      await projectRepository.save(projects[8]);

      // Projekt 9: Frauenförderung Workshop-Reihe - Lisa als Teilnehmerin
      projects[9].participants = [users[5]]; // Lisa (Legal Advice)
      await projectRepository.save(projects[9]);

      // Projekt 10: Kochkurse für Bedürftige - Julia als Teilnehmerin
      projects[10].participants = [users[7]]; // Julia (Cooking, Teaching)
      await projectRepository.save(projects[10]);

      // Die bidirektionalen Beziehungen sind bereits durch das Speichern der Projekte mit Skills eingerichtet
      console.log('Projects and their skill relationships have been saved successfully.');
      console.log('User-Project participant relationships have been created successfully.');

      // Applications - Umfassende Bewerbungsdaten mit verschiedenen Status
      const applicationsData = [
        // Projekt 0: Webseite für Bildung
        {
          projectId: projects[0].id,
          userId: users[0].id, // Max (Web Development, Project Management)
          ngoId: ngos[0].id, // Hilfe für Alle e.V.
          status: ApplicationStatus.ACCEPTED,
        },
        {
          projectId: projects[0].id,
          userId: users[6].id, // David (Data Analysis, Environmental Science, Logistics)
          ngoId: ngos[0].id,
          status: ApplicationStatus.PENDING,
        },

        // Projekt 1: Umwelt-Workshop für Schulen
        {
          projectId: projects[1].id,
          userId: users[2].id, // Thomas (Teaching, Event Planning)
          ngoId: ngos[1].id, // Umwelt Retten e.V.
          status: ApplicationStatus.ACCEPTED,
        },
        {
          projectId: projects[1].id,
          userId: users[8].id, // Peter (Gardening, Environmental Science, Teaching)
          ngoId: ngos[1].id,
          status: ApplicationStatus.PENDING,
        },

        // Projekt 2: Kunst für Kinder
        {
          projectId: projects[2].id,
          userId: users[1].id, // Anna (Graphic Design, Social Media)
          ngoId: ngos[4].id, // Kultur Verbindet e.V.
          status: ApplicationStatus.ACCEPTED,
        },
        {
          projectId: projects[2].id,
          userId: users[4].id, // Michael (Photography, Writing)
          ngoId: ngos[4].id,
          status: ApplicationStatus.REJECTED,
        },

        // Projekt 3: IT-Support für Senioren
        {
          projectId: projects[3].id,
          userId: users[0].id, // Max (Web Development, Project Management, IT Support)
          ngoId: ngos[5].id, // TechForGood e.V.
          status: ApplicationStatus.PENDING,
        },
        {
          projectId: projects[3].id,
          userId: users[2].id, // Thomas (Teaching)
          ngoId: ngos[5].id,
          status: ApplicationStatus.ACCEPTED,
        },

        // Projekt 4: Tierschutz-Kampagne
        {
          projectId: projects[4].id,
          userId: users[1].id, // Anna (Graphic Design, Social Media)
          ngoId: ngos[6].id, // Tierschutz Plus e.V.
          status: ApplicationStatus.ACCEPTED,
        },
        {
          projectId: projects[4].id,
          userId: users[3].id, // Sarah (Marketing, Fundraising)
          ngoId: ngos[6].id,
          status: ApplicationStatus.PENDING,
        },
        {
          projectId: projects[4].id,
          userId: users[4].id, // Michael (Photography)
          ngoId: ngos[6].id,
          status: ApplicationStatus.ACCEPTED,
        },

        // Projekt 5: Sport für Alle - Integrationsprojekt
        {
          projectId: projects[5].id,
          userId: users[2].id, // Thomas (Sports Training, Event Planning)
          ngoId: ngos[7].id, // Sport für Alle e.V.
          status: ApplicationStatus.ACCEPTED,
        },

        // Projekt 6: Psychologische Erstberatung (inaktiv)
        {
          projectId: projects[6].id,
          userId: users[5].id, // Lisa (Healthcare, Mental Health Support)
          ngoId: ngos[3].id, // Gesundheit für Alle e.V.
          status: ApplicationStatus.ACCEPTED,
        },

        // Projekt 7: Übersetzungsdienst für Geflüchtete
        {
          projectId: projects[7].id,
          userId: users[4].id, // Michael (Translation)
          ngoId: ngos[2].id, // Kinder Zukunft e.V.
          status: ApplicationStatus.ACCEPTED,
        },

        // Projekt 8: Garten-Projekt für Senioren
        {
          projectId: projects[8].id,
          userId: users[8].id, // Peter (Gardening, Teaching)
          ngoId: ngos[8].id, // Senioren Hilfe e.V.
          status: ApplicationStatus.PENDING,
        },

        // Projekt 9: Frauenförderung Workshop-Reihe
        {
          projectId: projects[9].id,
          userId: users[5].id, // Lisa (Legal Advice)
          ngoId: ngos[9].id, // Frauenförderung e.V.
          status: ApplicationStatus.ACCEPTED,
        },
        {
          projectId: projects[9].id,
          userId: users[2].id, // Thomas (Teaching)
          ngoId: ngos[9].id,
          status: ApplicationStatus.PENDING,
        },

        // Projekt 10: Kochkurse für Bedürftige
        {
          projectId: projects[10].id,
          userId: users[7].id, // Julia (Cooking, Teaching)
          ngoId: ngos[0].id, // Hilfe für Alle e.V.
          status: ApplicationStatus.ACCEPTED,
        },

        // Projekt 11: Dokumentarfilm über Nachhaltigkeit
        {
          projectId: projects[11].id,
          userId: users[4].id, // Michael (Photography, Writing)
          ngoId: ngos[1].id, // Umwelt Retten e.V.
          status: ApplicationStatus.PENDING,
        },

        // Zusätzliche Cross-Applications für mehr Realismus
        {
          projectId: projects[0].id,
          userId: users[5].id, // Lisa bewirbt sich auch für Webseite
          ngoId: ngos[0].id,
          status: ApplicationStatus.REJECTED,
        },
        {
          projectId: projects[5].id,
          userId: users[7].id, // Julia für Sport-Projekt
          ngoId: ngos[7].id,
          status: ApplicationStatus.PENDING,
        },
      ];
      await applicationRepository.save(
        applicationsData.map(app => applicationRepository.create(app))
      );

      console.log('Seeding completed successfully!');
      console.log('\n=== SEEDING SUMMARY ===');
      console.log(`✅ Created ${skills.length} skills`);
      console.log(`✅ Created ${categories.length} categories`);
      console.log(
        `✅ Created ${users.length} users (${users.filter(u => u.role === UserRole.ADMIN).length} admin, ${users.filter(u => u.role === UserRole.USER).length} regular users)`
      );
      console.log(
        `✅ Created ${ngos.length} NGOs (${ngos.filter(n => n.isActivated).length} activated, ${ngos.filter(n => !n.isActivated).length} not activated)`
      );
      console.log(
        `✅ Created ${projects.length} projects (${projects.filter(p => p.isActive).length} active, ${projects.filter(p => !p.isActive).length} inactive)`
      );
      console.log(`✅ Created ${applicationsData.length} applications`);
      console.log(
        `   - ${applicationsData.filter(a => a.status === ApplicationStatus.PENDING).length} pending`
      );
      console.log(
        `   - ${applicationsData.filter(a => a.status === ApplicationStatus.ACCEPTED).length} accepted`
      );
      console.log(
        `   - ${applicationsData.filter(a => a.status === ApplicationStatus.REJECTED).length} rejected`
      );
      console.log('======================\n');
    }); // Ende der Transaktion
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('Database connection closed.');
  }
};

if (require.main === module) {
  seedData();
}

export default seedData;
