import { AppDataSource } from './app';
import { User } from './models/userModel';
import { Ngo } from './models/ngoModel';
import { Skill } from './models/skillModel';
import { Category } from './models/categoryModel';
import { Application } from './models/applicationModel';
import { Project } from './models/projectModel';
import { Notification } from './models/notificationModel';
import { UserRole } from './types/userRole';
import { ApplicationStatus } from './types/applicationRole';
import * as bcrypt from 'bcrypt';

const seedData = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for seeding...');

    await AppDataSource.transaction(async manager => {
      const userRepository = manager.getRepository(User);
      const ngoRepository = manager.getRepository(Ngo);
      const skillRepository = manager.getRepository(Skill);
      const categoryRepository = manager.getRepository(Category);
      const projectRepository = manager.getRepository(Project);
      const applicationRepository = manager.getRepository(Application);
      const notificationRepository = manager.getRepository(Notification);

      console.log('Clearing existing data...');
      await applicationRepository.clear();
      await manager.query('DELETE FROM user_projects');
      await manager.query('DELETE FROM user_skills');
      await manager.query('DELETE FROM project_skills');
      await manager.query('DELETE FROM project_categories');
      await manager.query('DELETE FROM ngo_categories');
      await manager.query('DELETE FROM application_skills');
      await notificationRepository.clear();
      await projectRepository.clear();
      await userRepository.clear();
      await ngoRepository.clear();
      await skillRepository.clear();
      await categoryRepository.clear();

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('password123', saltRounds);

      // Skills (German)
      const skillsData = [
        { name: 'Web-Development', description: 'Frontend- und Backend-Development' },
        { name: 'Grafikdesign', description: 'Visual- und Branddesign' },
        { name: 'Projektmanagement', description: 'Teams und Projekte verwalten' },
        { name: 'Marketing', description: 'Digitales und analoges Marketing' },
        { name: 'Unterrichten', description: 'Pädagogisches Unterrichten' },
        { name: 'Social-Media', description: 'Social-Media-Management' },
        { name: 'Fotografie', description: 'Fotografie und Fotobearbeitung' },
        { name: 'Übersetzung', description: 'Übertragen von Texten in andere Sprachen' },
        { name: 'Eventplanung', description: 'Veranstaltungen organisieren' },
        { name: 'Fundraising', description: 'Spenden sammeln für gute Zwecke' },
      ];
      const skills = await skillRepository.save(
        skillsData.map(skillItem => skillRepository.create(skillItem))
      );

      // Categories (German)
      const categoriesData = [
        { name: 'Bildung' },
        { name: 'Gesundheit' },
        { name: 'Umwelt' },
        { name: 'Sozialarbeit' },
        { name: 'Kunst & Kultur' },
        { name: 'Sport' },
        { name: 'Technologie' },
        { name: 'Gemeinschaft' },
        { name: 'Tierschutz' },
        { name: 'Menschenrechte' },
      ];
      const categories = await categoryRepository.save(
        categoriesData.map(categoryItem => categoryRepository.create(categoryItem))
      );

      // Helper function to find skills by name
      const findSkillsByNames = (names: string[]) => {
        return names.map(name => skills.find(s => s.name === name)).filter(Boolean) as Skill[];
      };

      // Users with specific German names and skills
      const usersData = [
        {
          firstName: 'Admin',
          lastName: 'User',
          loginEmail: 'admin@example.com',
          password: hashedPassword,
          image:
            'https://raw.githubusercontent.com/fharten/happy2help_frontend/refs/heads/main/public/images/h2h_logo_mint.png',
          role: UserRole.ADMIN,
          yearOfBirth: 1985,
          zipCode: 10115,
          city: 'Berlin',
          state: 'Berlin',
          isActivated: true,
          isDisabled: false,
          skillNames: ['Web-Development', 'Projektmanagement'],
        },
        {
          firstName: 'Alexander',
          lastName: 'Braun',
          loginEmail: 'alexander.braun@example.com',
          password: hashedPassword,
          image: 'http://localhost:3333/uploads/users/588434aa-41b2-4319-9d2f-c72ca1c8d0ee.png',
          role: UserRole.USER,
          yearOfBirth: 1990,
          zipCode: 10115,
          city: 'Berlin',
          state: 'Berlin',
          isActivated: true,
          isDisabled: false,
          skillNames: ['Web-Development', 'Projektmanagement', 'Marketing', 'Fundraising'],
        },
        {
          firstName: 'Laura',
          lastName: 'Peters',
          loginEmail: 'laura.peters@example.com',
          password: hashedPassword,
          image: 'http://localhost:3333/uploads/users/588434aa-41b2-4319-9d2f-c72ca1c8d0ee.png',
          role: UserRole.USER,
          yearOfBirth: 1992,
          zipCode: 80331,
          city: 'München',
          state: 'Bayern',
          isActivated: true,
          isDisabled: false,
          skillNames: ['Grafikdesign', 'Eventplanung', 'Social-Media', 'Übersetzung'],
        },
        {
          firstName: 'Jonas',
          lastName: 'Meier',
          loginEmail: 'jonas.meier@example.com',
          password: hashedPassword,
          image: 'http://localhost:3333/uploads/users/588434aa-41b2-4319-9d2f-c72ca1c8d0ee.png',
          role: UserRole.USER,
          yearOfBirth: 1988,
          zipCode: 50667,
          city: 'Köln',
          state: 'Nordrhein-Westfalen',
          isActivated: true,
          isDisabled: false,
          skillNames: ['Fotografie', 'Marketing', 'Unterrichten', 'Projektmanagement'],
        },
        {
          firstName: 'Sarah',
          lastName: 'Klein',
          loginEmail: 'sarah.klein@example.com',
          password: hashedPassword,
          image: 'http://localhost:3333/uploads/users/588434aa-41b2-4319-9d2f-c72ca1c8d0ee.png',
          role: UserRole.USER,
          yearOfBirth: 1995,
          zipCode: 20095,
          city: 'Hamburg',
          state: 'Hamburg',
          isActivated: true,
          isDisabled: false,
          skillNames: ['Web-Development', 'Grafikdesign', 'Social-Media', 'Fundraising'],
        },
        {
          firstName: 'David',
          lastName: 'Hoffmann',
          loginEmail: 'david.hoffmann@example.com',
          password: hashedPassword,
          image: 'http://localhost:3333/uploads/users/588434aa-41b2-4319-9d2f-c72ca1c8d0ee.png',
          role: UserRole.USER,
          yearOfBirth: 1987,
          zipCode: 11067,
          city: 'Dresden',
          state: 'Sachsen',
          isActivated: true,
          isDisabled: false,
          skillNames: ['Unterrichten', 'Eventplanung', 'Projektmanagement', 'Übersetzung'],
        },
      ];

      const users = [];
      for (const userData of usersData) {
        const { skillNames, ...userWithoutSkills } = userData;
        const user = userRepository.create(userWithoutSkills);
        user.skills = findSkillsByNames(skillNames);
        const savedUser = await userRepository.save(user);
        users.push(savedUser);
      }

      // Helper function to find category by name
      const findCategoryByName = (name: string) => {
        return categories.find(c => c.name === name);
      };

      // NGOs with German data
      const ngosData = [
        {
          name: 'ZukunftsBildung e.V.',
          isNonProfit: true,
          streetAndNumber: 'Schillerstraße 45',
          zipCode: 14103,
          image:
            'https://raw.githubusercontent.com/fharten/happy2help_frontend/refs/heads/main/public/images/h2h_logo_mint.png',
          city: 'Leipzig',
          state: 'Sachsen',
          principal: 'Martin Keller',
          loginEmail: 'info@zukunftsbildung.de',
          password: hashedPassword,
          phone: '0341 7824567',
          isActivated: true,
          isDisabled: false,
          categoryName: 'Bildung',
        },
        {
          name: 'Grünes Leben Verein',
          isNonProfit: true,
          streetAndNumber: 'Lindenweg 12',
          zipCode: 79098,
          image:
            'https://raw.githubusercontent.com/fharten/happy2help_frontend/refs/heads/main/public/images/h2h_logo_mint.png',
          city: 'Freiburg im Breisgau',
          state: 'Baden-Württemberg',
          principal: 'Sabine Vogt',
          loginEmail: 'info@gruenesleben.de',
          password: hashedPassword,
          phone: '0761 323445',
          isActivated: true,
          isDisabled: false,
          categoryName: 'Umwelt',
        },
        {
          name: 'Kultur & Kunstforum e.V.',
          isNonProfit: true,
          streetAndNumber: 'Goethestraße 89',
          zipCode: 99423,
          image:
            'https://raw.githubusercontent.com/fharten/happy2help_frontend/refs/heads/main/public/images/h2h_logo_mint.png',
          city: 'Weimar',
          state: 'Thüringen',
          principal: 'Thomas Richter',
          loginEmail: 'info@kulturkunstforum.de',
          password: hashedPassword,
          phone: '03643 912345',
          isActivated: true,
          isDisabled: false,
          categoryName: 'Kunst & Kultur',
        },
        {
          name: 'Sportfreunde Rhein-Main e.V.',
          isNonProfit: true,
          streetAndNumber: 'Mainufer 7',
          zipCode: 55116,
          image:
            'https://raw.githubusercontent.com/fharten/happy2help_frontend/refs/heads/main/public/images/h2h_logo_mint.png',
          city: 'Mainz',
          state: 'Rheinland-Pfalz',
          principal: 'Andrea Becker',
          loginEmail: 'info@sportfreunde-rm.de',
          password: hashedPassword,
          phone: '06131 442278',
          isActivated: true,
          isDisabled: false,
          categoryName: 'Sport',
        },
        {
          name: 'DigitalBrücke e.V.',
          isNonProfit: true,
          streetAndNumber: 'Innovationsstraße 3',
          zipCode: 44135,
          image:
            'https://raw.githubusercontent.com/fharten/happy2help_frontend/refs/heads/main/public/images/h2h_logo_mint.png',
          city: 'Dortmund',
          state: 'Nordrhein-Westfalen',
          principal: 'Felix Mertens',
          loginEmail: 'info@digitalbruecke.de',
          password: hashedPassword,
          phone: '0231 567890',
          isActivated: true,
          isDisabled: false,
          categoryName: 'Technologie',
        },
      ];

      const ngos = [];
      for (const ngoData of ngosData) {
        const { categoryName, ...ngoWithoutCategory } = ngoData;
        const ngo = ngoRepository.create(ngoWithoutCategory);
        const category = findCategoryByName(categoryName);
        if (category) {
          ngo.categories = [category];
        }
        const savedNgo = await ngoRepository.save(ngo);
        ngos.push(savedNgo);
      }

      // Projects with German data - 15 projects, 3 per NGO
      const projectsDataRaw = [
        {
          name: 'Lernwerkstatt 2030',
          description:
            'Dieses Projekt vermittelt Jugendlichen praxisnah digitale Kompetenzen und bereitet sie umfassend auf die Anforderungen einer modernen Arbeitswelt vor.',
          categoryName: 'Bildung',
          city: 'Berlin',
          zipCode: 10115,
          state: 'Berlin',
          principal: 'Lisa Sommer',
          skillNames: ['Web-Development', 'Projektmanagement'],
          ngoIndex: 0,
        },
        {
          name: 'Gesund im Alter',
          description:
            'Ein umfassendes Präventionsprogramm, das Senioren mit Kursen, Beratung und Bewegungsangeboten unterstützt, um ihre Lebensqualität langfristig zu erhalten und zu verbessern.',
          categoryName: 'Gesundheit',
          city: 'München',
          zipCode: 80331,
          state: 'Bayern',
          principal: 'Stefan Kraus',
          skillNames: ['Marketing', 'Fundraising'],
          ngoIndex: 0,
        },
        {
          name: 'Saubere Flüsse',
          description:
            'Ehrenamtliche Helfer reinigen regelmäßig Flussufer und informieren dabei über Umweltschutz, Recycling sowie den nachhaltigen Umgang mit Naturressourcen.',
          categoryName: 'Umwelt',
          city: 'Köln',
          zipCode: 50667,
          state: 'Nordrhein-Westfalen',
          principal: 'Julia König',
          skillNames: ['Eventplanung', 'Social-Media'],
          ngoIndex: 0,
        },
        {
          name: 'Nachbarschaftshilfe Plus',
          description:
            'Das Projekt bietet praktische Unterstützung für hilfsbedürftige Menschen im Alltag, von Einkaufshilfe bis Begleitung, und fördert so den Zusammenhalt in der Nachbarschaft.',
          categoryName: 'Sozialarbeit',
          city: 'Hamburg',
          zipCode: 20095,
          state: 'Hamburg',
          principal: 'Markus Albrecht',
          skillNames: ['Projektmanagement', 'Unterrichten'],
          ngoIndex: 1,
        },
        {
          name: 'Kunst für alle',
          description:
            'In kreativen Workshops können Kinder und Jugendliche ihre künstlerischen Fähigkeiten entdecken, eigene Projekte entwickeln und ihre Arbeiten in Ausstellungen präsentieren.',
          categoryName: 'Kunst & Kultur',
          city: 'Dresden',
          zipCode: 11067,
          state: 'Sachsen',
          principal: 'Heike Müller',
          skillNames: ['Grafikdesign', 'Eventplanung'],
          ngoIndex: 1,
        },
        {
          name: 'Jugend bewegt',
          description:
            'Sportangebote und Freizeitaktivitäten fördern körperliche Fitness, Teamgeist und Selbstbewusstsein bei benachteiligten Jugendlichen und bieten eine sinnvolle Freizeitgestaltung.',
          categoryName: 'Sport',
          city: 'Frankfurt am Main',
          zipCode: 60311,
          state: 'Hessen',
          principal: 'Tobias Schmitt',
          skillNames: ['Marketing', 'Projektmanagement'],
          ngoIndex: 1,
        },
        {
          name: 'Tech4Future',
          description:
            'Junge Erwachsene erhalten praxisnahe Programmierkurse, die ihnen nicht nur technische Grundlagen vermitteln, sondern auch berufliche Chancen im IT-Bereich eröffnen.',
          categoryName: 'Technologie',
          city: 'Stuttgart',
          zipCode: 70173,
          state: 'Baden-Württemberg',
          principal: 'Nadine Fischer',
          skillNames: ['Web-Development', 'Unterrichten'],
          ngoIndex: 2,
        },
        {
          name: 'Gemeinsam Stark',
          description:
            'Dieses Projekt fördert Begegnung, Austausch und gegenseitige Hilfe im Stadtviertel durch Veranstaltungen, gemeinsame Aktionen und soziale Unterstützungsangebote.',
          categoryName: 'Gemeinschaft',
          city: 'Bremen',
          zipCode: 28195,
          state: 'Bremen',
          principal: 'Peter Wagner',
          skillNames: ['Social-Media', 'Fundraising'],
          ngoIndex: 2,
        },
        {
          name: 'Tierfreunde Projekt',
          description:
            'Ehrenamtliche unterstützen Tierheime aktiv bei der Versorgung von Tieren, organisieren Spendenaktionen und schaffen Aufmerksamkeit für verantwortungsvolle Tierhaltung.',
          categoryName: 'Tierschutz',
          city: 'Hannover',
          zipCode: 30159,
          state: 'Niedersachsen',
          principal: 'Claudia Lehmann',
          skillNames: ['Eventplanung', 'Fotografie'],
          ngoIndex: 2,
        },
        {
          name: 'Rechte für alle',
          description:
            'Durch Kampagnen, Informationsmaterial und Veranstaltungen werden Menschenrechte bekannter gemacht und gezielt gesellschaftliche Debatten zu aktuellen Themen angeregt.',
          categoryName: 'Menschenrechte',
          city: 'Düsseldorf',
          zipCode: 40213,
          state: 'Nordrhein-Westfalen',
          principal: 'Michael Neumann',
          skillNames: ['Übersetzung', 'Marketing'],
          ngoIndex: 3,
        },
        {
          name: 'Fit & Aktiv',
          description:
            'Spielerische Bewegungsprogramme für Kinder vermitteln Freude an Sport, stärken Motorik und Gesundheit und fördern den Zusammenhalt durch Teamspiele und kreative Übungen.',
          categoryName: 'Gesundheit',
          city: 'Nürnberg',
          zipCode: 90402,
          state: 'Bayern',
          principal: 'Katharina Brandt',
          skillNames: ['Projektmanagement', 'Social-Media'],
          ngoIndex: 3,
        },
        {
          name: 'Coding4Kids',
          description:
            'Kinder lernen auf spielerische Weise die Grundlagen der Programmierung und entwickeln kleine digitale Projekte, die Kreativität und logisches Denken verbinden.',
          categoryName: 'Bildung',
          city: 'Essen',
          zipCode: 45127,
          state: 'Nordrhein-Westfalen',
          principal: 'Daniel Weber',
          skillNames: ['Web-Development', 'Eventplanung'],
          ngoIndex: 3,
        },
        {
          name: 'Kunst im Park',
          description:
            'Lokale Künstlerinnen und Künstler stellen ihre Werke in öffentlichen Parks aus, wodurch Kunst für alle zugänglich wird und ein kultureller Austausch entsteht.',
          categoryName: 'Kunst & Kultur',
          city: 'Potsdam',
          zipCode: 14467,
          state: 'Brandenburg',
          principal: 'Anja Keller',
          skillNames: ['Grafikdesign', 'Fundraising'],
          ngoIndex: 4,
        },
        {
          name: 'Green Energy Now',
          description:
            'Bildungsinitiativen klären über erneuerbare Energien auf, fördern nachhaltige Projekte und geben praktische Tipps für klimafreundlichen Alltag und bewussten Konsum.',
          categoryName: 'Umwelt',
          city: 'Kiel',
          zipCode: 24103,
          state: 'Schleswig-Holstein',
          principal: 'Florian Hartmann',
          skillNames: ['Unterrichten', 'Marketing'],
          ngoIndex: 4,
        },
        {
          name: 'Voices of Freedom',
          description:
            'In Workshops setzen sich Teilnehmende mit Demokratie und Bürgerrechten auseinander, entwickeln eigene Ideen und diskutieren aktiv gesellschaftliche Fragestellungen.',
          categoryName: 'Menschenrechte',
          city: 'Bonn',
          zipCode: 53111,
          state: 'Nordrhein-Westfalen',
          principal: 'Jana Hoffmann',
          skillNames: ['Übersetzung', 'Projektmanagement'],
          ngoIndex: 4,
        },
      ];

      const projects = [];
      for (const projectData of projectsDataRaw) {
        const { categoryName, skillNames, ngoIndex, ...projectWithoutRelations } = projectData;
        const project = projectRepository.create({
          ...projectWithoutRelations,
          ngoId: ngos[ngoIndex].id,
          ngo: ngos[ngoIndex],
          categories: [findCategoryByName(categoryName)].filter(Boolean) as Category[],
          skills: findSkillsByNames(skillNames),
          compensation: '100€',
          isActive: true,
          participants: [],
          images: [
            'https://raw.githubusercontent.com/fharten/happy2help_frontend/refs/heads/main/public/images/h2h_logo_mint.png',
          ],
          startingAt: new Date(),
          endingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        });
        const savedProject = await projectRepository.save(project);
        projects.push(savedProject);
      }

      // Create applications - each user applies to 2 projects
      const savedApplications: Application[] = [];

      for (let userIndex = 0; userIndex < users.length; userIndex++) {
        const user = users[userIndex];

        // Each user applies to 2 projects
        const firstProjectIndex = (userIndex * 2) % projects.length;
        const secondProjectIndex = (userIndex * 2 + 1) % projects.length;

        const projectsToApply = [projects[firstProjectIndex], projects[secondProjectIndex]];

        for (let appIndex = 0; appIndex < projectsToApply.length; appIndex++) {
          const project = projectsToApply[appIndex];

          const status =
            (userIndex + appIndex) % 3 === 0
              ? ApplicationStatus.ACCEPTED
              : (userIndex + appIndex) % 3 === 1
                ? ApplicationStatus.PENDING
                : ApplicationStatus.REJECTED;

          const applicationEntity = applicationRepository.create({
            projectId: project.id,
            userId: user.id,
            ngoId: project.ngoId,
            status: status,
            message: `Bewerbung für ${project.name}`,
            skills: project.skills.slice(0, Math.min(2, project.skills.length)),
          });

          const savedApplication = await applicationRepository.save(applicationEntity);
          savedApplications.push(savedApplication);
        }
      }

      // Generate notifications
      const exampleUser = users[1]; // Alexander Braun
      const exampleNgo = ngos[0]; // ZukunftsBildung e.V.

      // Load applications with relations
      const applicationsWithRelations: Array<
        Application & { user?: User; project?: Project; ngo?: Ngo }
      > = [];
      for (const applicationItem of savedApplications) {
        const fullApplication = await applicationRepository.findOne({
          where: { id: applicationItem.id },
          relations: ['user', 'project', 'ngo'],
        });
        if (fullApplication) applicationsWithRelations.push(fullApplication);
      }

      // NGO Notifications: USER_APPLIED
      const ngoNotificationsToCreate: Notification[] = [];
      for (const applicationItem of applicationsWithRelations) {
        if (
          applicationItem.ngoId === exampleNgo.id &&
          applicationItem.user &&
          applicationItem.project
        ) {
          const notificationForNgo = notificationRepository.create({
            ngoId: exampleNgo.id,
            name: `${applicationItem.user.firstName} ${applicationItem.user.lastName} hat sich beworben`,
            description: `${applicationItem.user.firstName} ${applicationItem.user.lastName} hat sich für „${applicationItem.project.name}" beworben.`,
            read: false,
          });
          ngoNotificationsToCreate.push(notificationForNgo);
        }
      }

      if (ngoNotificationsToCreate.length < 2) {
        const projectForExampleNgo =
          projects.find(projectItem => projectItem.ngoId === exampleNgo.id) || projects[0];
        const extraUserA = users[2];
        const extraUserB = users[3];
        if (projectForExampleNgo && extraUserA) {
          ngoNotificationsToCreate.push(
            notificationRepository.create({
              ngoId: exampleNgo.id,
              name: `${extraUserA.firstName} ${extraUserA.lastName} hat sich beworben`,
              description: `${extraUserA.firstName} ${extraUserA.lastName} hat sich für „${projectForExampleNgo.name}" beworben.`,
              read: false,
            })
          );
        }
        if (projectForExampleNgo && extraUserB) {
          ngoNotificationsToCreate.push(
            notificationRepository.create({
              ngoId: exampleNgo.id,
              name: `${extraUserB.firstName} ${extraUserB.lastName} hat sich beworben`,
              description: `${extraUserB.firstName} ${extraUserB.lastName} hat sich für „${projectForExampleNgo.name}" beworben.`,
              read: false,
            })
          );
        }
      }

      await notificationRepository.save(ngoNotificationsToCreate);

      // User Notifications: NGO_ACCEPTED / NGO_REJECTED
      const userNotificationsToCreate: Notification[] = [];
      for (const applicationItem of applicationsWithRelations) {
        if (applicationItem.userId === exampleUser.id && applicationItem.project) {
          if (applicationItem.status === ApplicationStatus.ACCEPTED) {
            userNotificationsToCreate.push(
              notificationRepository.create({
                userId: exampleUser.id,
                name: 'Bewerbung angenommen',
                description: `Deine Bewerbung für „${applicationItem.project.name}" wurde akzeptiert.`,
                read: false,
              })
            );
          } else if (applicationItem.status === ApplicationStatus.REJECTED) {
            userNotificationsToCreate.push(
              notificationRepository.create({
                userId: exampleUser.id,
                name: 'Bewerbung abgelehnt',
                description: `Deine Bewerbung für „${applicationItem.project.name}" wurde abgelehnt.`,
                read: false,
              })
            );
          }
        }
      }

      if (userNotificationsToCreate.length < 2) {
        const fallbackProject = projects[1] || projects[0];
        userNotificationsToCreate.push(
          notificationRepository.create({
            userId: exampleUser.id,
            name: 'Bewerbung angenommen',
            description: `Deine Bewerbung für „${fallbackProject.name}" wurde akzeptiert.`,
            read: false,
          })
        );
        userNotificationsToCreate.push(
          notificationRepository.create({
            userId: exampleUser.id,
            name: 'Bewerbung abgelehnt',
            description: `Deine Bewerbung für „${fallbackProject.name}" wurde abgelehnt.`,
            read: false,
          })
        );
      }

      await notificationRepository.save(userNotificationsToCreate);

      // Withdraw Notification
      const projectForWithdraw = projects.find(projectItem => projectItem.ngoId === exampleNgo.id);
      if (projectForWithdraw) {
        const withdrawNotification = notificationRepository.create({
          ngoId: exampleNgo.id,
          name: 'Bewerbung zurückgezogen',
          description: 'Der Nutzer hat seine Bewerbung zurückgezogen.',
          read: false,
        });
        await notificationRepository.save(withdrawNotification);
      }

      console.log('Seeding completed successfully!');
      console.log(`✅ Created ${skills.length} skills`);
      console.log(`✅ Created ${categories.length} categories`);
      console.log(`✅ Created ${users.length} users with skills`);
      console.log(`✅ Created ${ngos.length} NGOs with categories`);
      console.log(`✅ Created ${projects.length} projects (3 per NGO)`);
      console.log(`✅ Created ${savedApplications.length} applications (2 per user)`);
      console.log(`✅ Created ${ngoNotificationsToCreate.length} NGO notifications (USER_APPLIED)`);
      console.log(
        `✅ Created ${userNotificationsToCreate.length} user notifications (ACCEPTED/REJECTED)`
      );
      console.log(`✅ Created 1 NGO withdraw notification`);

      // Sample checks
      const sampleUser = await userRepository.findOne({
        where: { id: users[1].id },
        relations: ['skills'],
      });
      console.log(
        `👤 Sample user ${sampleUser?.firstName} has ${sampleUser?.skills?.length} skills:`,
        sampleUser?.skills?.map(skillItem => skillItem.name)
      );

      const sampleNgo = await ngoRepository.findOne({
        where: { id: ngos[0].id },
        relations: ['categories'],
      });
      console.log(
        `🏢 Sample NGO ${sampleNgo?.name} has ${sampleNgo?.categories?.length} categories:`,
        sampleNgo?.categories?.map(categoryItem => categoryItem.name)
      );

      // Verify projects per NGO
      for (const ngo of ngos) {
        const ngoProjects = projects.filter(p => p.ngoId === ngo.id);
        console.log(`🏢 ${ngo.name} has ${ngoProjects.length} projects`);
      }
    });
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
